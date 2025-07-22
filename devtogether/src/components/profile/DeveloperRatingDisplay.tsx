import React, { useState, useEffect } from 'react';
import { Star, Trophy, Award, TrendingUp, Clock, CheckCircle, Target } from 'lucide-react';
import { profileService, DeveloperRating, DeveloperRatingStats } from '../../services/profileService';

interface DeveloperRatingDisplayProps {
    userId: string;
    showDetails?: boolean;
    className?: string;
    isOwnProfile?: boolean;
}

export const DeveloperRatingDisplay: React.FC<DeveloperRatingDisplayProps> = ({
    userId,
    showDetails = true,
    className = '',
    isOwnProfile = false
}) => {
    const [ratingStats, setRatingStats] = useState<DeveloperRatingStats | null>(null);
    const [ratingHistory, setRatingHistory] = useState<DeveloperRating[]>([]);
    const [loading, setLoading] = useState(true);
    const [showHistory, setShowHistory] = useState(false);

    useEffect(() => {
        loadRatingData();
    }, [userId]);

    const loadRatingData = async () => {
        try {
            setLoading(true);
            const [stats, history] = await Promise.all([
                profileService.getDeveloperRatingStats(userId),
                showDetails ? profileService.getDeveloperRatings(userId) : Promise.resolve([])
            ]);

            setRatingStats(stats);
            setRatingHistory(history);
        } catch (error) {
            console.error('Error loading rating data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatRatingType = (type: string) => {
        switch (type) {
            case 'submission_approved':
                return 'Application Accepted';
            case 'project_completed':
                return 'Project Completed';
            default:
                return type;
        }
    };

    const getRatingIcon = (type: string) => {
        switch (type) {
            case 'submission_approved':
                return <CheckCircle className="w-4 h-4 text-blue-600" />;
            case 'project_completed':
                return <Trophy className="w-4 h-4 text-green-600" />;
            default:
                return <Star className="w-4 h-4 text-yellow-600" />;
        }
    };

    const renderStars = (count: number, color: string = 'text-yellow-400') => {
        return (
            <div className="flex items-center gap-1">
                {[...Array(Math.min(count, 5))].map((_, index) => (
                    <Star key={index} className={`w-4 h-4 ${color} fill-current`} />
                ))}
                {count > 5 && (
                    <span className="text-sm font-medium text-gray-600 ml-1">
                        +{count - 5}
                    </span>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />
                    <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                </div>
            </div>
        );
    }

    if (!ratingStats || ratingStats.total_rating === 0) {
        return (
            <div className={`bg-gray-50 rounded-xl border border-gray-200 p-6 ${className}`}>
                <div className="text-center">
                    <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Building Your Rating
                    </h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                        Start applying to projects and completing work to earn stars and build your developer rating!
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
            <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-600" />
                    Developer Rating
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                    Achievements earned through project participation
                </p>
            </div>

            <div className="p-6 space-y-6">
                {/* Overall Rating Display */}
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="flex items-center">
                                    {renderStars(ratingStats.total_rating)}
                                </div>
                                <span className="text-2xl font-bold text-gray-900">
                                    {ratingStats.total_rating}
                                </span>
                                <span className="text-sm text-gray-600">stars</span>
                            </div>
                            <p className="text-sm text-gray-700">
                                Average: {ratingStats.average_rating.toFixed(1)} stars per project
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">
                                {ratingStats.completed_projects}
                            </div>
                            <div className="text-sm text-gray-600">
                                Projects Completed
                            </div>
                        </div>
                    </div>
                </div>

                {/* Rating Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-blue-600" />
                                <span className="font-medium text-blue-900">Applications</span>
                            </div>
                            <div className="text-right">
                                <div className="text-xl font-bold text-blue-600">
                                    {ratingStats.submission_stars}
                                </div>
                                <div className="text-sm text-blue-700">stars earned</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-green-600" />
                                <span className="font-medium text-green-900">Completions</span>
                            </div>
                            <div className="text-right">
                                <div className="text-xl font-bold text-green-600">
                                    {ratingStats.completion_stars}
                                </div>
                                <div className="text-sm text-green-700">stars earned</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Achievements */}
                {showDetails && ratingHistory.length > 0 && (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-medium text-gray-900">Recent Achievements</h3>
                            <button
                                onClick={() => setShowHistory(!showHistory)}
                                className="text-sm text-blue-600 hover:text-blue-700"
                            >
                                {showHistory ? 'Show Less' : `View All (${ratingHistory.length})`}
                            </button>
                        </div>

                        <div className="space-y-3">
                            {(showHistory ? ratingHistory : ratingHistory.slice(0, 3)).map((rating) => (
                                <div
                                    key={rating.id}
                                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                                >
                                    <div className="flex-shrink-0">
                                        {getRatingIcon(rating.rating_type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium text-gray-900">
                                                {formatRatingType(rating.rating_type)}
                                            </span>
                                            <div className="flex items-center">
                                                {renderStars(rating.stars_awarded, 'text-yellow-400')}
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-1">
                                            {rating.project_title} • {rating.organization_name}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <Clock className="w-3 h-3" />
                                            {new Date(rating.awarded_at).toLocaleDateString()}
                                        </div>
                                        {rating.notes && (
                                            <p className="text-sm text-gray-600 mt-2 italic">
                                                "{rating.notes}"
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Call to Action - Only show to profile owner */}
                {isOwnProfile && ratingStats.total_rating < 10 && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
                        <div className="flex items-start gap-3">
                            <Target className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div>
                                <h3 className="font-medium text-blue-900 mb-1">
                                    Keep Building Your Rating!
                                </h3>
                                <p className="text-sm text-blue-800">
                                    Apply to more projects and complete them successfully to earn more stars and 
                                    become a top-rated developer on the platform.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}; 