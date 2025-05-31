import React, { useState, useEffect } from 'react';
import { Activity, UserPlus, UserMinus, MessageSquare, FileText, Clock } from 'lucide-react';
import { TeamActivity, teamService } from '../../../services/teamService';

interface TeamActivityFeedProps {
    projectId: string;
}

export default function TeamActivityFeed({ projectId }: TeamActivityFeedProps) {
    const [activities, setActivities] = useState<TeamActivity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadActivities();
    }, [projectId]);

    const loadActivities = async () => {
        try {
            setLoading(true);
            const activityData = await teamService.getTeamActivities(projectId);
            setActivities(activityData);
        } catch (error) {
            console.error('Error loading team activities:', error);
        } finally {
            setLoading(false);
        }
    };

    const getActivityIcon = (activityType: TeamActivity['activity_type']) => {
        switch (activityType) {
            case 'member_joined':
                return <UserPlus className="w-4 h-4 text-green-600" />;
            case 'member_left':
            case 'member_removed':
                return <UserMinus className="w-4 h-4 text-red-600" />;
            case 'message_sent':
                return <MessageSquare className="w-4 h-4 text-blue-600" />;
            case 'project_updated':
                return <FileText className="w-4 h-4 text-purple-600" />;
            case 'milestone_reached':
                return <Activity className="w-4 h-4 text-orange-600" />;
            default:
                return <Activity className="w-4 h-4 text-gray-600" />;
        }
    };

    const getActivityColor = (activityType: TeamActivity['activity_type']) => {
        switch (activityType) {
            case 'member_joined':
                return 'bg-green-100';
            case 'member_left':
            case 'member_removed':
                return 'bg-red-100';
            case 'message_sent':
                return 'bg-blue-100';
            case 'project_updated':
                return 'bg-purple-100';
            case 'milestone_reached':
                return 'bg-orange-100';
            default:
                return 'bg-gray-100';
        }
    };

    const formatActivityTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 1) {
            const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
            return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes}m ago`;
        } else if (diffInHours < 24) {
            return `${diffInHours}h ago`;
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    };

    const getDisplayName = (activity: TeamActivity) => {
        return activity.user.role === 'organization'
            ? activity.user.organization_name || 'Organization'
            : `${activity.user.first_name || ''} ${activity.user.last_name || ''}`.trim() || 'User';
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Team Activity</h3>
                </div>
                <div className="p-6">
                    <div className="animate-pulse space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                                <div className="flex-1">
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Team Activity</h3>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                    Recent team activities and project updates
                </p>
            </div>

            <div className="max-h-96 overflow-y-auto">
                {activities.length === 0 ? (
                    <div className="p-12 text-center">
                        <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 mb-2">No Activity Yet</h4>
                        <p className="text-gray-600">
                            Team activities will appear here as members collaborate on the project.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {activities.map((activity) => (
                            <div key={activity.id} className="p-4 hover:bg-gray-50">
                                <div className="flex items-start gap-3">
                                    {/* Activity Icon */}
                                    <div className={`p-2 rounded-full ${getActivityColor(activity.activity_type)}`}>
                                        {getActivityIcon(activity.activity_type)}
                                    </div>

                                    {/* Activity Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-900">
                                                {getDisplayName(activity)}
                                            </span>
                                            <span className="text-sm text-gray-600">
                                                {activity.description}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 mt-1">
                                            <Clock className="w-3 h-3 text-gray-400" />
                                            <span className="text-xs text-gray-500">
                                                {formatActivityTime(activity.created_at)}
                                            </span>
                                        </div>

                                        {/* Activity Metadata */}
                                        {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                                            <div className="mt-2 p-2 bg-gray-50 rounded-md">
                                                <div className="text-xs text-gray-600">
                                                    {JSON.stringify(activity.metadata, null, 2)}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {activities.length > 0 && (
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <button
                        onClick={loadActivities}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                        Refresh Activity
                    </button>
                </div>
            )}
        </div>
    );
} 