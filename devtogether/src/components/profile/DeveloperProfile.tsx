import React, { useState, useEffect } from 'react';
import {
    BookOpen,
    Code,
    Trophy,
    Globe,
    ExternalLink,
    Github,
    Linkedin,
    Loader2
} from 'lucide-react';
import { User } from '../../types/database';
import { profileService, ProfileStats as ProfileStatsType, SkillProficiency, ProjectPortfolioItem } from '../../services/profileService';
import { dashboardService, Achievement } from '../../services/dashboardService';
import { ProfileStats } from './ProfileStats';
import { SkillsShowcase } from './SkillsShowcase';
import { AchievementDisplay } from './AchievementDisplay';
import { ProjectPortfolio } from './ProjectPortfolio';
import { ShareProfile } from './ShareProfile';

interface DeveloperProfileProps {
    profile: User;
    isOwnProfile: boolean;
}

export const DeveloperProfile: React.FC<DeveloperProfileProps> = ({
    profile,
    isOwnProfile
}) => {
    const [profileStats, setProfileStats] = useState<ProfileStatsType | null>(null);
    const [skillProficiency, setSkillProficiency] = useState<SkillProficiency[]>([]);
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [projectPortfolio, setProjectPortfolio] = useState<ProjectPortfolioItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadEnhancedProfileData();
    }, [profile.id]);

    const loadEnhancedProfileData = async () => {
        try {
            setIsLoading(true);

            // Track profile view if not own profile
            if (!isOwnProfile) {
                await profileService.trackProfileView(profile.id);
            }

            // Load all enhanced profile data in parallel
            const [stats, skills, portfolio] = await Promise.all([
                profileService.getProfileStats(profile.id),
                profileService.getSkillProficiency(profile.id),
                profileService.getProjectPortfolio(profile.id)
            ]);

            // Get achievements using dashboard service with proper DeveloperStats
            const dashboardStats = await dashboardService.getDeveloperStats(profile.id);
            const achievementData = await dashboardService.getAchievements(profile.id, dashboardStats);

            setProfileStats(stats);
            setSkillProficiency(skills);
            setAchievements(achievementData);
            setProjectPortfolio(portfolio);
        } catch (error) {
            console.error('Error loading enhanced profile data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4" />
                            <div className="space-y-2">
                                <div className="h-3 bg-gray-200 rounded w-3/4" />
                                <div className="h-3 bg-gray-200 rounded w-1/2" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* About Section */}
            {profile.bio && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                        About
                    </h2>
                    <div className="prose prose-gray max-w-none">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line break-words">
                            {profile.bio}
                        </p>
                    </div>
                </div>
            )}

            {/* Project Portfolio - Core Benefit, moved to top priority */}
            <ProjectPortfolio projects={projectPortfolio} />

            {/* Enhanced Profile Stats */}
            {profileStats && (
                <ProfileStats stats={profileStats} />
            )}

            {/* Enhanced Skills Showcase */}
            <SkillsShowcase skills={skillProficiency} />

            {/* Achievement Display */}
            {achievements.length > 0 && (
                <AchievementDisplay achievements={achievements} />
            )}

            {/* Portfolio Section (Original) */}
            {profile.portfolio && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-blue-600" />
                        External Portfolio
                    </h2>
                    <div className="space-y-4">
                        <a
                            href={profile.portfolio}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                        >
                            <div className="flex-shrink-0">
                                <Globe className="w-6 h-6 text-gray-400 group-hover:text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 group-hover:text-blue-800">
                                    Portfolio Website
                                </p>
                                <p className="text-sm text-gray-500 truncate">
                                    {profile.portfolio}
                                </p>
                            </div>
                            <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                        </a>
                    </div>
                </div>
            )}

            {/* Social Links Section */}
            {(profile.github || profile.linkedin || profile.website) && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-blue-600" />
                        Links & Social
                    </h2>
                    <div className="space-y-3">
                        {profile.github && (
                            <a
                                href={profile.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors group"
                            >
                                <Github className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900">GitHub</p>
                                    <p className="text-sm text-gray-500 truncate">{profile.github}</p>
                                </div>
                                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                            </a>
                        )}

                        {profile.linkedin && (
                            <a
                                href={profile.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                            >
                                <Linkedin className="w-5 h-5 text-blue-600 group-hover:text-blue-700" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900">LinkedIn</p>
                                    <p className="text-sm text-gray-500 truncate">{profile.linkedin}</p>
                                </div>
                                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                            </a>
                        )}

                        {profile.website && (
                            <a
                                href={profile.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors group"
                            >
                                <Globe className="w-5 h-5 text-green-600 group-hover:text-green-700" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900">Website</p>
                                    <p className="text-sm text-gray-500 truncate">{profile.website}</p>
                                </div>
                                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-green-600" />
                            </a>
                        )}
                    </div>
                </div>
            )}

            {/* Share Profile (Only for own profile) */}
            {isOwnProfile && (
                <ShareProfile userId={profile.id} />
            )}

            {/* Empty State for Own Profile */}
            {isOwnProfile && !profile.bio && skillProficiency.length === 0 && !profile.portfolio && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="text-center py-8">
                        <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Complete Your Profile
                        </h3>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                            Add your bio, skills, and portfolio links to help organizations
                            discover your talents and connect with you. Start building your
                            professional presence on DevTogether!
                        </p>
                        <button
                            onClick={() => {/* This will be handled by parent component */ }}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Code className="w-4 h-4 mr-2" />
                            Add Profile Information
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}; 