import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, Users, X, Video, Edit, Trash2, ExternalLink, AlertCircle, RefreshCw, CheckCircle } from 'lucide-react';
import { meetingService, ProjectMeeting } from '../../services/meetingService';
import { useAuth } from '../../contexts/AuthContext';

interface ScheduledMeetingsModalProps {
    projectId: string;
    isOpen: boolean;
    onClose: () => void;
    onEditMeeting?: (meeting: ProjectMeeting) => void;
    userRole?: 'organization' | 'developer' | 'admin' | null;
    canCreateMeetings?: boolean;
}

export default function ScheduledMeetingsModal({ 
    projectId, 
    isOpen, 
    onClose, 
    onEditMeeting, 
    userRole,
    canCreateMeetings 
}: ScheduledMeetingsModalProps) {
    const { user } = useAuth();
    const [meetings, setMeetings] = useState<ProjectMeeting[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isOpen) {
            loadMeetings();
            
            // Start auto-refresh when modal is open
            refreshIntervalRef.current = setInterval(() => {
                loadMeetings(false); // Silent refresh
            }, 15000); // Refresh every 15 seconds

            // Start auto-status updates
            meetingService.startAutoStatusUpdates(projectId, 1);

            return () => {
                if (refreshIntervalRef.current) {
                    clearInterval(refreshIntervalRef.current);
                }
                meetingService.stopAutoStatusUpdates();
            };
        }
    }, [isOpen, projectId]);

    const loadMeetings = async (showLoading: boolean = true) => {
        if (showLoading) setIsLoading(true);
        try {
            const fetchedMeetings = await meetingService.getProjectMeetings(projectId, true); // Auto-update enabled
            setMeetings(fetchedMeetings);
        } catch (error) {
            console.error('Error loading meetings:', error);
        } finally {
            if (showLoading) setIsLoading(false);
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await loadMeetings(false);
        setTimeout(() => setIsRefreshing(false), 500); // Give visual feedback
    };

    const handleDeleteMeeting = async (meetingId: string) => {
        if (!window.confirm('Are you sure you want to delete this meeting?')) return;

        try {
            const result = await meetingService.deleteMeeting(meetingId, user?.id);
            if (result.success) {
                setMeetings(prev => prev.filter(m => m.id !== meetingId));
            }
        } catch (error) {
            console.error('Error deleting meeting:', error);
        }
    };

    const handleJoinMeeting = (meetingUrl?: string) => {
        if (meetingUrl) {
            window.open(meetingUrl, '_blank', 'width=1200,height=800');
        }
    };

    const handleMarkCompleted = async (meetingId: string) => {
        try {
            const result = await meetingService.updateMeetingStatus(meetingId, 'completed');
            if (result.success) {
                await loadMeetings(false);
            }
        } catch (error) {
            console.error('Error updating meeting status:', error);
        }
    };

    const canManageMeeting = (meeting: ProjectMeeting) => {
        return canCreateMeetings || meeting.organizer_id === user?.id;
    };

    const filteredMeetings = meetings.filter(meeting => {
        const now = new Date();
        const meetingDate = new Date(meeting.meeting_date);
        
        switch (filter) {
            case 'upcoming':
                return meetingDate >= now && meeting.status !== 'completed' && meeting.status !== 'cancelled';
            case 'past':
                return meetingDate < now || meeting.status === 'completed';
            case 'all':
            default:
                return true;
        }
    });

    // Group meetings by status for better organization
    const activeMeetings = filteredMeetings.filter(m => meetingService.isMeetingActive(m));
    const upcomingMeetings = filteredMeetings.filter(m => {
        const meetingDate = new Date(m.meeting_date);
        return meetingDate > new Date() && !meetingService.isMeetingActive(m) && m.status !== 'cancelled';
    });
    const pastMeetings = filteredMeetings.filter(m => {
        const meetingDate = new Date(m.meeting_date);
        return meetingDate < new Date() || m.status === 'completed';
    });
    const cancelledMeetings = filteredMeetings.filter(m => m.status === 'cancelled');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <Calendar className="w-6 h-6 text-indigo-600" />
                        <h2 className="text-xl font-semibold text-gray-900">Project Meetings</h2>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            {meetings.length} total
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleRefresh}
                            className={`p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors ${
                                isRefreshing ? 'animate-spin' : ''
                            }`}
                            disabled={isRefreshing}
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    </div>
                </div>

                    {/* Filter Tabs */}
                <div className="flex border-b border-gray-200">
                    {[
                        { key: 'upcoming', label: 'Upcoming', count: upcomingMeetings.length + activeMeetings.length },
                        { key: 'past', label: 'Past', count: pastMeetings.length },
                        { key: 'all', label: 'All', count: meetings.length }
                    ].map(tab => (
                            <button
                            key={tab.key}
                            onClick={() => setFilter(tab.key as any)}
                            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                                filter === tab.key
                                    ? 'border-indigo-600 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {tab.label} ({tab.count})
                            </button>
                        ))}
                    </div>

                {/* Content */}
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                <span className="ml-3 text-gray-600">Loading meetings...</span>
                            </div>
                        ) : filteredMeetings.length === 0 ? (
                            <div className="text-center py-12">
                                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    {filter === 'upcoming' ? 'No Upcoming Meetings' : 
                                 filter === 'past' ? 'No Past Meetings' : 'No Meetings'}
                                </h3>
                            <p className="text-gray-600">
                                {filter === 'upcoming' ? 'Schedule a meeting to get started with your team collaboration.' :
                                 filter === 'past' ? 'Your completed meetings will appear here.' :
                                 'No meetings have been scheduled for this project yet.'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Active Meetings */}
                            {activeMeetings.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center gap-2">
                                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                                        Live Now ({activeMeetings.length})
                                    </h3>
                                    <div className="space-y-3">
                                        {activeMeetings.map((meeting) => (
                                            <MeetingCard
                                                key={meeting.id}
                                                meeting={meeting}
                                                onJoin={handleJoinMeeting}
                                                onDelete={handleDeleteMeeting}
                                                onMarkCompleted={handleMarkCompleted}
                                                canManage={canManageMeeting(meeting)}
                                                isActive={true}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Upcoming Meetings */}
                            {upcomingMeetings.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
                                        <Clock className="w-5 h-5" />
                                        Upcoming ({upcomingMeetings.length})
                                    </h3>
                                    <div className="space-y-3">
                                        {upcomingMeetings.map((meeting) => (
                                            <MeetingCard
                                                key={meeting.id}
                                                meeting={meeting}
                                                onJoin={handleJoinMeeting}
                                                onDelete={handleDeleteMeeting}
                                                onMarkCompleted={handleMarkCompleted}
                                                canManage={canManageMeeting(meeting)}
                                                isUpcoming={true}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Past Meetings */}
                            {pastMeetings.length > 0 && filter !== 'upcoming' && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5" />
                                        Past Meetings ({pastMeetings.length})
                                    </h3>
                                    <div className="space-y-3">
                                        {pastMeetings.map((meeting) => (
                                            <MeetingCard
                                                key={meeting.id}
                                                meeting={meeting}
                                                onJoin={handleJoinMeeting}
                                                onDelete={handleDeleteMeeting}
                                                onMarkCompleted={handleMarkCompleted}
                                                canManage={canManageMeeting(meeting)}
                                                isPast={true}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Cancelled Meetings */}
                            {cancelledMeetings.length > 0 && filter === 'all' && (
                                <div>
                                    <h3 className="text-lg font-semibold text-red-800 mb-3 flex items-center gap-2">
                                        <X className="w-5 h-5" />
                                        Cancelled ({cancelledMeetings.length})
                                    </h3>
                                    <div className="space-y-3">
                                        {cancelledMeetings.map((meeting) => (
                                            <MeetingCard
                                                key={meeting.id}
                                                meeting={meeting}
                                                onJoin={handleJoinMeeting}
                                                onDelete={handleDeleteMeeting}
                                                onMarkCompleted={handleMarkCompleted}
                                                canManage={canManageMeeting(meeting)}
                                                isCancelled={true}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                                )}
                            </div>
            </div>
        </div>
    );
}

// Enhanced Meeting Card Component
interface MeetingCardProps {
    meeting: ProjectMeeting;
    onJoin: (url?: string) => void;
    onDelete: (id: string) => void;
    onMarkCompleted: (id: string) => void;
    canManage: boolean;
    isActive?: boolean;
    isUpcoming?: boolean;
    isPast?: boolean;
    isCancelled?: boolean;
}

function MeetingCard({ 
    meeting, 
    onJoin, 
    onDelete, 
    onMarkCompleted, 
    canManage, 
    isActive, 
    isUpcoming, 
    isPast, 
    isCancelled 
}: MeetingCardProps) {
    const hasEnded = meetingService.isMeetingEnded(meeting);
    const isStartingSoon = meetingService.isMeetingStartingSoon(meeting);
                                    
                                    return (
        <div className={`border rounded-lg p-4 transition-all ${
            isActive ? 'border-green-400 bg-green-50' :
            isStartingSoon ? 'border-yellow-400 bg-yellow-50' :
                                                isUpcoming ? 'border-blue-200 bg-blue-50' :
            isCancelled ? 'border-red-200 bg-red-50' :
            'border-gray-200 bg-gray-50'
        }`}>
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900">{meeting.title}</h4>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            meeting.status === 'in_progress' ? 'bg-green-100 text-green-800' :
                            meeting.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                            meeting.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                        }`}>
                            {meeting.status === 'in_progress' ? 'Live Now' :
                             meeting.status === 'scheduled' ? 'Scheduled' :
                             meeting.status === 'completed' ? 'Completed' :
                             'Cancelled'}
                                                            </span>
                        {isStartingSoon && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 animate-pulse">
                                Starting Soon
                                                            </span>
                                                        )}
                                                    </div>
                                                    
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{new Date(meeting.meeting_date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}</span>
                        <span className="mx-2">•</span>
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{meeting.duration_minutes} min</span>
                        {meeting.organizer && (
                            <>
                                <span className="mx-2">•</span>
                                <Users className="w-4 h-4 mr-1" />
                                <span>
                                    {meeting.organizer.organization_name || 
                                     `${meeting.organizer.first_name} ${meeting.organizer.last_name}`}
                                                        </span>
                            </>
                        )}
                                                    </div>

                                                    {meeting.description && (
                                                        <p className="text-sm text-gray-700 mb-3">{meeting.description}</p>
                                                    )}

                    {/* Video Call Button - Only show for active or upcoming meetings */}
                    {meeting.meeting_url && !hasEnded && !isCancelled && (
                        <div className="flex items-center gap-2 mb-3">
                                                        <button
                                onClick={() => onJoin(meeting.meeting_url)}
                                                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                    isActive ? 'bg-green-600 text-white hover:bg-green-700 animate-pulse' :
                                                                isUpcoming ? 'bg-blue-600 text-white hover:bg-blue-700' :
                                                                'bg-gray-600 text-white hover:bg-gray-700'
                                                            }`}
                                                        >
                                                            <Video className="w-4 h-4" />
                                {isActive ? 'Join Now' : 'Join Meeting'}
                                                            <ExternalLink className="w-3 h-3" />
                                                        </button>
                            {isActive && (
                                <span className="text-xs text-green-600 font-medium animate-pulse">
                                    🔴 Live
                                </span>
                            )}
                        </div>
                    )}

                    {/* Show "Meeting Ended" message for completed meetings */}
                    {(hasEnded || isPast) && meeting.status === 'completed' && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                            <CheckCircle className="w-4 h-4" />
                            <span>Meeting completed</span>
                            {meeting.meeting_url && (
                                <span className="text-xs text-gray-500">
                                    (Video call ended)
                                </span>
                            )}
                        </div>
                                                    )}
                                                </div>

                                                {/* Action Buttons */}
                {canManage && (
                                                    <div className="flex items-center gap-2 ml-4">
                        {isActive && (
                                                            <button
                                onClick={() => onMarkCompleted(meeting.id)}
                                className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-lg transition-colors"
                                title="Mark as completed"
                            >
                                <CheckCircle className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        <button
                            onClick={() => onDelete(meeting.id)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors"
                                                            title="Delete meeting"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )}
            </div>
        </div>
    );
} 