import React from 'react';
import { useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { ActivityItem } from '../../services/dashboardService';

interface RecentActivityProps {
    activities: ActivityItem[];
    loading?: boolean;
}

const RecentActivity: React.FC<RecentActivityProps> = ({
    activities,
    loading = false
}) => {
    const navigate = useNavigate();

    const getActivityIcon = (type: ActivityItem['type']) => {
        switch (type) {
            case 'application_submitted':
                return Icons.Send;
            case 'application_accepted':
                return Icons.CheckCircle;
            case 'application_rejected':
                return Icons.XCircle;
            case 'message_sent':
                return Icons.MessageSquare;
            case 'message_received':
                return Icons.Mail;
            case 'project_joined':
                return Icons.Users;
            case 'project_completed':
                return Icons.Award;
            default:
                return Icons.Activity;
        }
    };

    const getActivityColor = (type: ActivityItem['type']) => {
        switch (type) {
            case 'application_submitted':
                return 'bg-blue-100 text-blue-600';
            case 'application_accepted':
                return 'bg-green-100 text-green-600';
            case 'application_rejected':
                return 'bg-red-100 text-red-600';
            case 'message_sent':
                return 'bg-purple-100 text-purple-600';
            case 'message_received':
                return 'bg-yellow-100 text-yellow-600';
            case 'project_joined':
                return 'bg-indigo-100 text-indigo-600';
            case 'project_completed':
                return 'bg-emerald-100 text-emerald-600';
            default:
                return 'bg-gray-100 text-gray-600';
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                    <div className="text-sm text-blue-600 font-medium">View All →</div>
                </div>
                <div className="space-y-4">
                    {[...Array(4)].map((_, index) => (
                        <div key={index} className="animate-pulse flex items-start space-x-3">
                            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                            <div className="flex-1">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                                <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                <button
                    onClick={() => navigate('/my-applications')}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
                >
                    <span>View All</span>
                    <Icons.ArrowUpRight className="w-4 h-4" />
                </button>
            </div>

            {activities.length === 0 ? (
                <div className="text-center py-8">
                    <Icons.Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <h4 className="text-sm font-medium text-gray-900 mb-1">No Recent Activity</h4>
                    <p className="text-sm text-gray-600">
                        Start applying to projects to see your activity here!
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {activities.slice(0, 4).map((activity) => {
                        const IconComponent = getActivityIcon(activity.type);
                        const colorClass = getActivityColor(activity.type);

                        return (
                            <div
                                key={activity.id}
                                className="flex items-start space-x-3 cursor-pointer hover:bg-gray-50 -mx-2 px-2 py-2 rounded-lg transition-colors"
                                onClick={() => {
                                    if (activity.relatedId) {
                                        if (activity.type.includes('application')) {
                                            navigate(`/projects/${activity.relatedId}`);
                                        } else if (activity.type.includes('message')) {
                                            navigate(`/workspace/${activity.relatedId}`);
                                        }
                                    }
                                }}
                            >
                                <div className={`flex-shrink-0 w-8 h-8 ${colorClass} rounded-full flex items-center justify-center`}>
                                    <IconComponent className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-medium text-gray-900">
                                            {activity.title}
                                        </h4>
                                        <span className="text-xs text-gray-500 ml-2">
                                            {activity.timestamp}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {activity.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default RecentActivity; 