import React from 'react';
import * as Icons from 'lucide-react';
import { RecentAchievement } from '../../services/dashboardService';

interface AchievementsBadgesProps {
    recentAchievements: RecentAchievement[];
    loading?: boolean;
}

const AchievementsBadges: React.FC<AchievementsBadgesProps> = ({
    recentAchievements,
    loading = false
}) => {
    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Achievements</h3>
                    <div className="text-sm text-blue-600 font-medium">View All →</div>
                </div>
                <div className="space-y-4">
                    {[...Array(4)].map((_, index) => (
                        <div key={index} className="animate-pulse flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                            <div className="flex-1">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                                <div className="h-3 bg-gray-200 rounded w-full"></div>
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
                <h3 className="text-lg font-semibold text-gray-900">Recent Achievements</h3>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1">
                    <span>View All</span>
                    <Icons.ArrowUpRight className="w-4 h-4" />
                </button>
            </div>

            {recentAchievements.length === 0 ? (
                <div className="text-center py-8">
                    <Icons.Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <h4 className="text-sm font-medium text-gray-900 mb-1">Start Your Journey</h4>
                    <p className="text-sm text-gray-600">
                        Complete your first application to begin earning achievements!
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {recentAchievements.slice(0, 4).map((achievement) => {
                        const IconComponent = Icons[achievement.icon as keyof typeof Icons] as React.ComponentType<any>;

                        return (
                            <div key={achievement.id} className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <IconComponent className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <h4 className="text-sm font-semibold text-gray-900">
                                            {achievement.title}
                                        </h4>
                                        <Icons.Star className="w-4 h-4 text-yellow-500" />
                                    </div>
                                    <p className="text-sm text-gray-600 mb-1">
                                        {achievement.description}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Earned on {achievement.earnedTimestamp || 'Recently'}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Progress Summary */}
            {recentAchievements.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Recent Activity</span>
                        <span className="font-semibold text-gray-900">
                            {recentAchievements.length} achievement{recentAchievements.length !== 1 ? 's' : ''} earned
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AchievementsBadges; 