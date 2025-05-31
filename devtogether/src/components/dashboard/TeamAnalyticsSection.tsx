import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    TrendingUp,
    Activity,
    UserPlus,
    MessageSquare,
    ArrowUpRight,
    Clock
} from 'lucide-react';
import { TeamAnalytics } from '../../services/organizationDashboardService';
import { Button } from '../ui/Button';

interface TeamAnalyticsSectionProps {
    teamAnalytics: TeamAnalytics;
    loading?: boolean;
}

const TeamAnalyticsSection: React.FC<TeamAnalyticsSectionProps> = ({
    teamAnalytics,
    loading = false
}) => {
    const navigate = useNavigate();

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getActivityIcon = (action: string) => {
        switch (action) {
            case 'joined_project':
                return <UserPlus className="w-3 h-3" />;
            case 'message_sent':
                return <MessageSquare className="w-3 h-3" />;
            default:
                return <Activity className="w-3 h-3" />;
        }
    };

    const getActivityText = (activity: any) => {
        switch (activity.action) {
            case 'joined_project':
                return `joined ${activity.projectTitle}`;
            case 'message_sent':
                return `posted in ${activity.projectTitle}`;
            default:
                return activity.action;
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-6 animate-pulse"></div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="text-center p-4 border border-gray-100 rounded-lg animate-pulse">
                            <div className="h-8 bg-gray-200 rounded w-12 mx-auto mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div>
                        </div>
                    ))}
                </div>

                {/* Projects */}
                <div className="space-y-3">
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className="p-3 border border-gray-100 rounded-lg animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Team Analytics</h3>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/organization/team')}
                    icon={<ArrowUpRight className="w-4 h-4" />}
                >
                    View Details
                </Button>
            </div>

            {teamAnalytics.totalMembers === 0 ? (
                <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No Team Members Yet</h4>
                    <p className="text-gray-600">
                        Team members will appear here once developers are accepted to your projects.
                    </p>
                </div>
            ) : (
                <>
                    {/* Team Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-lg mx-auto mb-2">
                                <Users className="w-4 h-4" />
                            </div>
                            <p className="text-xl font-bold text-blue-900">{teamAnalytics.totalMembers}</p>
                            <p className="text-sm text-blue-700">Total Members</p>
                        </div>

                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-lg mx-auto mb-2">
                                <Activity className="w-4 h-4" />
                            </div>
                            <p className="text-xl font-bold text-green-900">{teamAnalytics.activeMembers}</p>
                            <p className="text-sm text-green-700">Active Members</p>
                        </div>

                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <div className="flex items-center justify-center w-8 h-8 bg-purple-600 text-white rounded-lg mx-auto mb-2">
                                <TrendingUp className="w-4 h-4" />
                            </div>
                            <p className="text-xl font-bold text-purple-900">
                                {teamAnalytics.averageProjectsPerMember.toFixed(1)}
                            </p>
                            <p className="text-sm text-purple-700">Avg Projects/Member</p>
                        </div>
                    </div>

                    {/* Project Distribution */}
                    <div className="mb-6">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Project Distribution</h4>
                        <div className="space-y-3">
                            {teamAnalytics.memberDistribution.slice(0, 3).map((project) => (
                                <div
                                    key={project.projectId}
                                    className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors"
                                >
                                    <div className="flex-1">
                                        <h5 className="text-sm font-medium text-gray-900 truncate">
                                            {project.projectTitle}
                                        </h5>
                                        <p className="text-xs text-gray-500">
                                            {project.memberCount} {project.memberCount === 1 ? 'member' : 'members'}
                                        </p>
                                    </div>

                                    {/* Member Avatars */}
                                    <div className="flex -space-x-2 ml-3">
                                        {project.members.slice(0, 3).map((member) => (
                                            <div
                                                key={member.id}
                                                className="w-6 h-6 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center overflow-hidden"
                                                title={member.name}
                                            >
                                                {member.avatar_url ? (
                                                    <img
                                                        src={member.avatar_url}
                                                        alt={member.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-xs text-gray-600">
                                                        {member.name.split(' ').map(n => n[0]).join('')}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                        {project.memberCount > 3 && (
                                            <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs text-gray-600">
                                                +{project.memberCount - 3}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Recent Team Activity</h4>
                        {teamAnalytics.recentActivity.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-4">
                                No recent activity
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {teamAnalytics.recentActivity.slice(0, 4).map((activity, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                                    >
                                        <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                                            {getActivityIcon(activity.action)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-gray-900">
                                                <span className="font-medium">{activity.memberName}</span>
                                                {' '}
                                                <span className="text-gray-600">{getActivityText(activity)}</span>
                                            </p>
                                        </div>
                                        <div className="flex items-center text-xs text-gray-500">
                                            <Clock className="w-3 h-3 mr-1" />
                                            {formatDate(activity.timestamp)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default TeamAnalyticsSection; 