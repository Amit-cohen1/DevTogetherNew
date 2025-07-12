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

    if (!recentAchievements || recentAchievements.length === 0) {
        return null;
    }

    return (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Recent Achievements</h3>
            </div>
            <div className="space-y-4">
                {recentAchievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Icons.CheckCircle className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-gray-900">{achievement.title}</h4>
                            <p className="text-xs text-gray-500">{achievement.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AchievementsBadges; 