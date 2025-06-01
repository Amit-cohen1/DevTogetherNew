import React from 'react';
import { Trophy, Award, Star, CheckCircle, Target, Users, TrendingUp, Send } from 'lucide-react';
import { Achievement } from '../../services/dashboardService';

interface AchievementDisplayProps {
    achievements: Achievement[];
    className?: string;
}

export const AchievementDisplay: React.FC<AchievementDisplayProps> = ({
    achievements,
    className = ''
}) => {
    const getIconComponent = (iconName: string) => {
        const icons: Record<string, any> = {
            Send,
            Target,
            CheckCircle,
            TrendingUp,
            Users,
            Award,
            Star
        };
        return icons[iconName] || Trophy;
    };

    const getAchievementColor = (achieved: boolean, progress?: number) => {
        if (achieved) {
            return {
                bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50',
                borderColor: 'border-green-200',
                textColor: 'text-green-800',
                iconColor: 'text-green-600',
                progressColor: 'bg-green-500'
            };
        } else if (progress && progress > 0) {
            return {
                bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50',
                borderColor: 'border-blue-200',
                textColor: 'text-blue-800',
                iconColor: 'text-blue-600',
                progressColor: 'bg-blue-500'
            };
        } else {
            return {
                bgColor: 'bg-gray-50',
                borderColor: 'border-gray-200',
                textColor: 'text-gray-600',
                iconColor: 'text-gray-400',
                progressColor: 'bg-gray-300'
            };
        }
    };

    const achievedCount = achievements.filter(a => a.achieved).length;
    const inProgressCount = achievements.filter(a => !a.achieved && a.progress && a.progress > 0).length;

    return (
        <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-yellow-600" />
                            Achievements
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Your platform milestones and accomplishments
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-yellow-600">{achievedCount}</div>
                        <div className="text-xs text-gray-600">Unlocked</div>
                    </div>
                </div>

                {/* Progress Summary */}
                <div className="mt-4 grid grid-cols-3 gap-4">
                    <div className="text-center">
                        <div className="text-lg font-semibold text-green-600">{achievedCount}</div>
                        <div className="text-xs text-gray-600">Achieved</div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-semibold text-blue-600">{inProgressCount}</div>
                        <div className="text-xs text-gray-600">In Progress</div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-semibold text-gray-600">{achievements.length - achievedCount}</div>
                        <div className="text-xs text-gray-600">Locked</div>
                    </div>
                </div>
            </div>

            {/* Achievements Grid */}
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {achievements.map((achievement) => {
                        const IconComponent = getIconComponent(achievement.icon);
                        const colors = getAchievementColor(achievement.achieved, achievement.progress);
                        const progressPercentage = achievement.maxProgress
                            ? ((achievement.progress || 0) / achievement.maxProgress) * 100
                            : achievement.achieved ? 100 : 0;

                        return (
                            <div
                                key={achievement.id}
                                className={`p-4 rounded-lg border-2 ${colors.borderColor} ${colors.bgColor} transition-all hover:shadow-md relative overflow-hidden group`}
                            >
                                {/* Achievement Badge for completed */}
                                {achievement.achieved && (
                                    <div className="absolute top-2 right-2">
                                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                            <CheckCircle className="w-4 h-4 text-white" />
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-start gap-3">
                                    {/* Icon */}
                                    <div className={`p-2 rounded-lg ${achievement.achieved ? 'bg-green-100' : 'bg-white'} shadow-sm`}>
                                        <IconComponent className={`w-5 h-5 ${colors.iconColor}`} />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className={`font-medium ${colors.textColor} mb-1`}>
                                            {achievement.title}
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                                            {achievement.description}
                                        </p>

                                        {/* Progress Bar */}
                                        {(achievement.maxProgress || achievement.progress !== undefined) && (
                                            <div className="mb-2">
                                                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                                    <span>Progress</span>
                                                    <span>
                                                        {achievement.progress || 0}
                                                        {achievement.maxProgress && ` / ${achievement.maxProgress}`}
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full transition-all duration-500 ${colors.progressColor}`}
                                                        style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Status Badge */}
                                        <div className="flex items-center gap-2">
                                            {achievement.achieved ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                                                    <Trophy className="w-3 h-3" />
                                                    Unlocked
                                                </span>
                                            ) : achievement.progress && achievement.progress > 0 ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                                                    <Target className="w-3 h-3" />
                                                    In Progress
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
                                                    <Star className="w-3 h-3" />
                                                    Locked
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Hover Effect */}
                                <div className={`absolute inset-0 ${achievement.achieved ? 'bg-green-100' : 'bg-blue-100'} opacity-0 group-hover:opacity-10 transition-opacity rounded-lg`} />
                            </div>
                        );
                    })}
                </div>

                {/* Achievement Stats */}
                {achievements.length > 0 && (
                    <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-1">Achievement Progress</h4>
                                <p className="text-xs text-gray-600">
                                    {achievedCount} of {achievements.length} achievements unlocked
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="text-lg font-bold text-yellow-600">
                                    {Math.round((achievedCount / achievements.length) * 100)}%
                                </div>
                                <div className="text-xs text-gray-600">Complete</div>
                            </div>
                        </div>
                        <div className="mt-2">
                            <div className="w-full bg-yellow-200 rounded-full h-2">
                                <div
                                    className="bg-gradient-to-r from-yellow-500 to-amber-500 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${(achievedCount / achievements.length) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}; 