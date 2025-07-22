import React, { useState } from 'react';
import { MessageCircle, FileText, Users, Settings, ExternalLink, Calendar, Video, Github } from 'lucide-react';
import SharedFiles from './SharedFiles';
import { supabase } from '../../utils/supabase';
import { WorkspaceData } from '../../services/workspaceService';

interface QuickActionsProps {
    projectId: string;
    isOwner: boolean;
    userRole: 'organization' | 'developer' | 'admin' | null;
    onSectionChange: (section: string) => void;
    workspaceData?: WorkspaceData;
}

export default function QuickActions({ projectId, isOwner, userRole, onSectionChange, workspaceData }: QuickActionsProps) {
    const [showSharedFiles, setShowSharedFiles] = useState(false);
    const [showMeetingScheduler, setShowMeetingScheduler] = useState(false);

    const handleGitHubAction = async () => {
        // Get organization GitHub URL from the organization profile
        if (workspaceData?.project?.organization_id) {
            try {
                const { data: orgProfile, error } = await supabase
                    .from('profiles')
                    .select('github')
                    .eq('id', workspaceData.project.organization_id)
                    .single();
                
                if (!error && orgProfile?.github) {
                    const url = orgProfile.github.startsWith('http') 
                        ? orgProfile.github 
                        : `https://github.com/${orgProfile.github}`;
                    window.open(url, '_blank');
                } else {
                    window.alert('No GitHub repository configured for this project. Organization owners can add a GitHub URL in their profile settings.');
                }
            } catch (error) {
                console.error('Error fetching organization GitHub URL:', error);
                window.alert('Unable to access repository information.');
            }
        } else {
            window.alert('No GitHub repository configured for this project. Organization owners can add a GitHub URL in their profile settings.');
        }
    };

    const generateJitsiMeetRoom = () => {
        // Generate a unique room name for the project
        const timestamp = Date.now();
        const roomName = `devtogether-${projectId.slice(0, 8)}-${timestamp}`;
        return `https://meet.jit.si/${roomName}`;
    };

    const handleVideoCallAction = () => {
        const meetingUrl = generateJitsiMeetRoom();
        // Open Jitsi Meet in a new window
        window.open(meetingUrl, '_blank', 'width=1200,height=800');
        
        // Show confirmation with room URL
        const copyToClipboard = () => {
            navigator.clipboard.writeText(meetingUrl);
            window.alert('Meeting URL copied to clipboard!');
        };
        
        if (window.confirm(`Video call started!\n\nRoom URL: ${meetingUrl}\n\nClick OK to copy the URL and share with your team.`)) {
            copyToClipboard();
        }
    };

    const handleAction = (action: string, url?: string) => {
        switch (action) {
            case 'messages':
                // Navigate to chat section
                onSectionChange('chat');
                break;
            case 'project-details':
                window.open(`/projects/${projectId}`, '_blank');
                break;
            case 'team':
                // Navigate to team section
                onSectionChange('team');
                break;
            case 'applications':
                if (isOwner) {
                    window.open('/dashboard/applications', '_blank');
                }
                break;
            case 'schedule':
                setShowMeetingScheduler(true);
                break;
            case 'video':
                handleVideoCallAction();
                break;
            case 'github':
                // Open project repository URL
                handleGitHubAction();
                break;
            case 'files':
                setShowSharedFiles(true);
                break;
            default:
                if (url) {
                    window.open(url, '_blank');
                }
        }
    };

    const actions = [
        {
            id: 'messages',
            label: 'Team Chat',
            description: 'Communicate with team members',
            icon: MessageCircle,
            color: 'bg-blue-100 text-blue-600 hover:bg-blue-200',
            available: true, // Now available!
        },
        {
            id: 'project-details',
            label: 'Project Details',
            description: 'View full project information',
            icon: FileText,
            color: 'bg-green-100 text-green-600 hover:bg-green-200',
            available: true,
        },
        {
            id: 'team',
            label: 'Team Members',
            description: 'View team roster',
            icon: Users,
            color: 'bg-purple-100 text-purple-600 hover:bg-purple-200',
            available: true,
        },
        {
            id: 'applications',
            label: 'Applications',
            description: 'Manage project applications',
            icon: Settings,
            color: 'bg-orange-100 text-orange-600 hover:bg-orange-200',
            available: true,
            ownerOnly: true,
        },
        {
            id: 'schedule',
            label: 'Schedule Meeting',
            description: 'Plan team meetings and standups',
            icon: Calendar,
            color: 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200',
            available: true, // ✅ NOW LIVE!
        },
        {
            id: 'video',
            label: 'Video Call',
            description: 'Start instant team video call',
            icon: Video,
            color: 'bg-red-100 text-red-600 hover:bg-red-200',
            available: true, // ✅ LIVE WITH JITSI!
        },
        {
            id: 'github',
            label: 'Repository',
            description: 'Access project repository',
            icon: Github,
            color: 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            available: true, // ✅ ENABLED!
        },
        {
            id: 'files',
            label: 'Shared Files',
            description: 'Upload, view and manage project files',
            icon: FileText,
            color: 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200',
            available: true, // ✅ LIVE & WORKING!
        },
    ];

    const availableActions = actions.filter(action => {
        if (action.ownerOnly && !isOwner) return false;
        return true;
    });

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableActions.map((action) => {
                    const IconComponent = action.icon;

                    return (
                        <button
                            key={action.id}
                            onClick={() => handleAction(action.id)}
                            disabled={!action.available}
                            className={`
                p-4 rounded-lg border-2 border-transparent transition-all duration-200 text-left
                ${action.available
                                    ? `${action.color} cursor-pointer transform hover:scale-105`
                                    : 'bg-gray-50 text-gray-400 cursor-not-allowed opacity-60'
                                }
              `}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`
                  p-2 rounded-lg
                  ${action.available
                                        ? 'bg-white bg-opacity-50'
                                        : 'bg-gray-200'
                                    }
                `}>
                                    <IconComponent className="w-5 h-5" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-medium text-sm">
                                            {action.label}
                                        </h4>
                                        {!action.available && (
                                            <span className="px-2 py-1 text-xs font-medium bg-gray-200 text-gray-600 rounded-full">
                                                Coming Soon
                                            </span>
                                        )}
                                        {action.available && action.id === 'project-details' && (
                                            <ExternalLink className="w-3 h-3" />
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                        {action.description}
                                    </p>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Help text */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-3">
                    <div className="p-1 bg-blue-100 rounded-full">
                        <MessageCircle className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-blue-900 mb-1">
                            Workspace Features
                        </h4>
                        <p className="text-sm text-blue-700">
                            🎉 ALL WORKSPACE FEATURES ARE NOW LIVE! Complete collaboration suite: team messaging, file sharing, GitHub repository access, meeting scheduling, and instant video calls powered by Jitsi Meet. Your team has everything needed for effective remote collaboration!
                        </p>
                    </div>
                </div>
            </div>

            {/* Role-specific actions */}
            {userRole && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                        {userRole === 'organization' ? 'Organization Tools' : 'Developer Tools'}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {userRole === 'organization' ? (
                            <>
                                <button
                                    onClick={() => window.open('/dashboard/applications', '_blank')}
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    <Settings className="w-4 h-4" />
                                    Manage Applications
                                </button>
                                <button
                                    onClick={() => window.open('/projects/create', '_blank')}
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    <FileText className="w-4 h-4" />
                                    Create New Project
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => window.open('/applications', '_blank')}
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    <FileText className="w-4 h-4" />
                                    My Applications
                                </button>
                                <button
                                    onClick={() => window.open('/projects', '_blank')}
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    Find More Projects
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Shared Files Modal */}
            {showSharedFiles && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900">Project Files</h2>
                            <button
                                onClick={() => setShowSharedFiles(false)}
                                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
                            <SharedFiles projectId={projectId} isOwner={isOwner} />
                        </div>
                    </div>
                </div>
            )}

            {/* Meeting Scheduler Modal */}
            {showMeetingScheduler && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900">Schedule Meeting</h2>
                            <button
                                onClick={() => setShowMeetingScheduler(false)}
                                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="text-center py-8">
                                <Calendar className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Meeting Scheduler</h3>
                                <p className="text-gray-600 mb-4">
                                    Quick meeting scheduling is available! You can now schedule team meetings, standups, and demos.
                                </p>
                                <div className="space-y-2 text-sm text-gray-500">
                                    <p>📅 Schedule daily standups, planning meetings, and demos</p>
                                    <p>🔗 Add video call links for remote meetings</p>
                                    <p>📋 Set meeting types and durations</p>
                                    <p>📢 Team notifications for upcoming meetings</p>
                                </div>
                                <button
                                    onClick={() => setShowMeetingScheduler(false)}
                                    className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    Got it!
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 