import React from 'react';
import { User, Calendar, Eye, TrendingUp, Award, Target, Clock, Activity } from 'lucide-react';
import { ProfileStats as ProfileStatsType } from '../../services/profileService';

interface ProfileStatsProps {
    stats: ProfileStatsType;
    className?: string;
}

export const ProfileStats: React.FC<ProfileStatsProps> = ({
    stats,
    className = ''
}) => {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const statCards = [
        {
            icon: Award,
            label: 'Projects Completed',
            value: stats.completedProjects,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200'
        },
        {
            icon: Target,
            label: 'Active Projects',
            value: stats.activeProjects,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200'
        },
        {
            icon: TrendingUp,
            label: 'Acceptance Rate',
            value: `${stats.acceptanceRate}%`,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            borderColor: 'border-purple-200'
        },
        {
            icon: Eye,
            label: 'Profile Views',
            value: stats.profileViews,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
            borderColor: 'border-orange-200'
        }
    ];

    const detailStats = [
        {
            icon: User,
            label: 'Total Applications',
            value: stats.totalApplications
        },
        {
            icon: Award,
            label: 'Accepted Applications',
            value: stats.acceptedApplications
        },
        {
            icon: Calendar,
            label: 'Days on Platform',
            value: stats.platformDays
        },
        {
            icon: Activity,
            label: 'Last Activity',
            value: formatDate(stats.lastActivity)
        }
    ];

    return (
        <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    Platform Statistics
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                    Your DevTogether journey and achievements
                </p>
            </div>

            {/* Main Stats Grid */}
            <div className="p-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {statCards.map((stat, index) => {
                        const IconComponent = stat.icon;
                        return (
                            <div
                                key={index}
                                className={`p-4 rounded-lg border ${stat.borderColor} ${stat.bgColor} text-center transition-transform hover:scale-105`}
                            >
                                <div className="flex justify-center mb-2">
                                    <IconComponent className={`w-6 h-6 ${stat.color}`} />
                                </div>
                                <div className={`text-2xl font-bold ${stat.color} mb-1`}>
                                    {stat.value}
                                </div>
                                <div className="text-xs text-gray-600 font-medium">
                                    {stat.label}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Detailed Stats */}
                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Additional Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {detailStats.map((stat, index) => {
                            const IconComponent = stat.icon;
                            return (
                                <div
                                    key={index}
                                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <IconComponent className="w-4 h-4 text-gray-500" />
                                    <div className="flex-1">
                                        <span className="text-sm text-gray-600">{stat.label}</span>
                                    </div>
                                    <div className="text-sm font-medium text-gray-900">
                                        {stat.value}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Achievement Progress Bar */}
                {stats.totalApplications > 0 && (
                    <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Success Rate</span>
                            <span className="text-sm font-bold text-blue-600">{stats.acceptanceRate}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(stats.acceptanceRate, 100)}%` }}
                            />
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                            {stats.acceptedApplications} of {stats.totalApplications} applications accepted
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}; 