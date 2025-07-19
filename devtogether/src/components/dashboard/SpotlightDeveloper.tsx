import React, { useState, useEffect } from 'react';
import { Star, Trophy, Award, ExternalLink, User, Crown, TrendingUp } from 'lucide-react';
import { profileService, DeveloperRatingStats } from '../../services/profileService';
import { User as UserType } from '../../types/database';

interface SpotlightDeveloperProps {
    className?: string;
    compact?: boolean;
}

export const SpotlightDeveloper: React.FC<SpotlightDeveloperProps> = ({
    className = '',
    compact = false
}) => {
    const [spotlightDeveloper, setSpotlightDeveloper] = useState<UserType | null>(null);
    const [developerRating, setDeveloperRating] = useState<DeveloperRatingStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadSpotlightDeveloper();
    }, []);

    const loadSpotlightDeveloper = async () => {
        try {
            setLoading(true);
            setError(null);

            // Get the highest-rated developer
            const developer = await profileService.getSpotlightDeveloper();
            
            if (developer) {
                // Get their rating stats
                const rating = await profileService.getDeveloperRatingStats(developer.id);
                setSpotlightDeveloper(developer);
                setDeveloperRating(rating);
            } else {
                setSpotlightDeveloper(null);
                setDeveloperRating(null);
            }
        } catch (err) {
            console.error('Error loading spotlight developer:', err);
            setError('Failed to load spotlight developer');
        } finally {
            setLoading(false);
        }
    };

    const handleViewProfile = () => {
        if (spotlightDeveloper) {
            const profileUrl = spotlightDeveloper.security_string
                ? `/profile/${spotlightDeveloper.id}-${spotlightDeveloper.security_string}`
                : `/profile/${spotlightDeveloper.id}`;
            window.open(profileUrl, '_blank');
        }
    };

    const renderStars = (count: number, maxVisible: number = 5) => {
        return (
            <div className="flex items-center gap-1">
                {[...Array(Math.min(count, maxVisible))].map((_, index) => (
                    <Star key={index} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
                {count > maxVisible && (
                    <span className="text-sm font-medium text-gray-600 ml-1">
                        +{count - maxVisible}
                    </span>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
                <div className="animate-pulse">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-5 h-5 bg-gray-200 rounded" />
                        <div className="h-4 bg-gray-200 rounded w-1/3" />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4" />
                            <div className="h-3 bg-gray-200 rounded w-1/2" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !spotlightDeveloper || !developerRating) {
        return (
            <div className={`bg-gray-50 rounded-xl border border-gray-200 p-6 ${className}`}>
                <div className="text-center">
                    <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No Spotlight Developer Yet
                    </h3>
                    <p className="text-gray-600 text-sm">
                        Developers will appear here as they complete projects and earn ratings.
                    </p>
                </div>
            </div>
        );
    }

    const displayName = `${spotlightDeveloper.first_name || ''} ${spotlightDeveloper.last_name || ''}`.trim() || 'Developer';

    if (compact) {
        return (
            <div className={`bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-200 p-4 ${className}`}>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        {spotlightDeveloper.avatar_url ? (
                            <img
                                src={spotlightDeveloper.avatar_url}
                                alt={displayName}
                                className="w-12 h-12 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                                <User className="w-6 h-6 text-gray-500" />
                            </div>
                        )}
                        <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1">
                            <Crown className="w-3 h-3 text-white" />
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{displayName}</h3>
                        <div className="flex items-center gap-2">
                            {renderStars(developerRating.total_rating, 3)}
                            <span className="text-sm text-gray-600">
                                {developerRating.total_rating} stars
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={handleViewProfile}
                        className="flex-shrink-0 p-2 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-100 rounded-lg transition-colors"
                        title="View profile"
                    >
                        <ExternalLink className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
            <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Crown className="w-5 h-5 text-yellow-600" />
                    Spotlight Developer
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                    Highest-rated developer on the platform
                </p>
            </div>

            <div className="p-6">
                <div className="flex items-start gap-4">
                    {/* Developer Avatar */}
                    <div className="relative">
                        {spotlightDeveloper.avatar_url ? (
                            <img
                                src={spotlightDeveloper.avatar_url}
                                alt={displayName}
                                className="w-20 h-20 rounded-full object-cover ring-4 ring-yellow-200"
                            />
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center ring-4 ring-yellow-200">
                                <User className="w-10 h-10 text-gray-500" />
                            </div>
                        )}
                        {/* Crown badge */}
                        <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-2 shadow-lg">
                            <Crown className="w-4 h-4 text-white" />
                        </div>
                    </div>

                    {/* Developer Info */}
                    <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {displayName}
                        </h3>
                        
                        {spotlightDeveloper.bio && (
                            <p className="text-gray-600 mb-3 line-clamp-2">
                                {spotlightDeveloper.bio}
                            </p>
                        )}

                        {/* Rating Display */}
                        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-3 border border-yellow-200 mb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        {renderStars(developerRating.total_rating)}
                                        <span className="text-xl font-bold text-gray-900">
                                            {developerRating.total_rating}
                                        </span>
                                        <span className="text-sm text-gray-600">stars</span>
                                    </div>
                                    <p className="text-sm text-gray-700">
                                        {developerRating.completed_projects} projects completed
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-green-600">
                                        {developerRating.average_rating.toFixed(1)}
                                    </div>
                                    <div className="text-xs text-gray-600">
                                        avg rating
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Skills Preview */}
                        {spotlightDeveloper.skills && spotlightDeveloper.skills.length > 0 && (
                            <div className="mb-4">
                                <h4 className="text-sm font-medium text-gray-900 mb-2">Top Skills</h4>
                                <div className="flex flex-wrap gap-2">
                                    {spotlightDeveloper.skills.slice(0, 4).map((skill, index) => (
                                        <span
                                            key={index}
                                            className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-md"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                    {spotlightDeveloper.skills.length > 4 && (
                                        <span className="px-2 py-1 text-xs font-medium text-gray-500 rounded-md">
                                            +{spotlightDeveloper.skills.length - 4} more
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* View Profile Button */}
                        <button
                            onClick={handleViewProfile}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <ExternalLink className="w-4 h-4" />
                            View Full Profile
                        </button>
                    </div>
                </div>

                {/* Achievement Stats */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                            <div className="flex items-center justify-center mb-2">
                                <TrendingUp className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="text-lg font-bold text-blue-600">
                                {developerRating.submission_stars}
                            </div>
                            <div className="text-sm text-gray-600">
                                Application Stars
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center mb-2">
                                <Trophy className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="text-lg font-bold text-green-600">
                                {developerRating.completion_stars}
                            </div>
                            <div className="text-sm text-gray-600">
                                Completion Stars
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}; 