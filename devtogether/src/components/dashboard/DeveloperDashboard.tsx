import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { dashboardService } from '../../services/dashboardService';
import { profileService, ProfileStats as ProfileStatsType } from '../../services/profileService';
import { ProfileStats as ProfileStatsComponent } from '../profile/ProfileStats';
import type {
    DeveloperStats,
    DashboardProject,
    Achievement,
    RecentAchievement,
    ActivityItem,
    RecommendedProject
} from '../../services/dashboardService';
import type { Application } from '../../types/database';
import GreetingBanner from './GreetingBanner';
import ActiveProjectsSection from './ActiveProjectsSection';
import ApplicationsTracker from './ApplicationsTracker';
import AchievementsBadges from './AchievementsBadges';
import RecentActivity from './RecentActivity';
import RecommendationsSection from './RecommendationsSection';

const DeveloperDashboard: React.FC = () => {
    const { user, profile } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState<DeveloperStats | null>(null);
    const [activeProjects, setActiveProjects] = useState<DashboardProject[]>([]);
    const [recentApplications, setRecentApplications] = useState<Application[]>([]);
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [recentAchievements, setRecentAchievements] = useState<RecentAchievement[]>([]);
    const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
    const [recommendations, setRecommendations] = useState<RecommendedProject[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [profileStats, setProfileStats] = useState<ProfileStatsType | null>(null);

    useEffect(() => {
        const loadDashboardData = async () => {
            if (!user?.id) return;

            try {
                setLoading(true);
                setError(null);

                const data = await dashboardService.refreshDashboardData(user.id);

                setStats(data.stats);
                setActiveProjects(data.activeProjects);
                setRecentApplications(data.recentApplications);
                setAchievements(data.achievements);
                setRecentAchievements(data.recentAchievements);
                setRecentActivity(data.recentActivity);
                setRecommendations(data.recommendations);
                // Fetch profile stats for the new component
                const statsData = await profileService.getProfileStats(user.id);
                setProfileStats(statsData);
            } catch (err) {
                console.error('Error loading dashboard data:', err);
                setError('Failed to load dashboard data. Please try refreshing the page.');
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, [user?.id]);

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Dashboard Error</h1>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Refresh Page
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {[...Array(4)].map((_, index) => (
                            <div key={index} className="bg-white rounded-xl border border-gray-100 p-6 animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Greeting Banner */}
                <GreetingBanner name={profile?.first_name ?? undefined} />
                {/* ProfileStats (Platform Statistics) */}
                {profileStats && (
                    <div className="mb-8">
                        <ProfileStatsComponent stats={profileStats} />
                    </div>
                )}

                {/* Recent Activity - full width, always on top */}
                <div className="mb-8">
                    <RecentActivity
                        activities={recentActivity}
                        loading={loading}
                    />
                </div>

                {/* Active Projects - only if there are active projects */}
                {activeProjects.length > 0 && (
                    <div className="mb-8">
                        <ActiveProjectsSection
                            projects={activeProjects}
                            loading={loading}
                        />
                    </div>
                )}

                {/* Secondary Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Recent Achievements */}
                    <AchievementsBadges
                        recentAchievements={recentAchievements}
                        loading={loading}
                    />

                    {/* Recommendations */}
                    {/* Only show recommendations if at least one is a real skill match */}
                    {recommendations.some(
                      (rec) => rec.matchScore > 10 && rec.matchReasons.some(r => !r.toLowerCase().includes('available project'))
                    ) && (
                      <RecommendationsSection
                        recommendations={recommendations}
                        loading={loading}
                      />
                    )}
                </div>
            </div>
        </div>
    );
};

export default DeveloperDashboard; 