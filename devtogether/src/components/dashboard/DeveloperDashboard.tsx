import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { dashboardService } from '../../services/dashboardService';
import type {
    DeveloperStats,
    DashboardProject,
    Achievement,
    RecentAchievement,
    ActivityItem,
    RecommendedProject
} from '../../services/dashboardService';
import type { Application } from '../../types/database';
import StatsCard from './StatsCard';
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
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Welcome back, {profile?.first_name || 'Developer'}!
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Here's an overview of your project activity and achievements.
                    </p>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatsCard
                        title="Total Applications"
                        value={stats?.totalApplications || 0}
                        subtitle="+12% this month"
                        icon="Send"
                        color="blue"
                        trend={{
                            value: 12,
                            label: 'vs last month',
                            direction: 'up'
                        }}
                        onClick={() => navigate('/my-applications')}
                    />
                    <StatsCard
                        title="Acceptance Rate"
                        value={`${stats?.acceptanceRate || 0}%`}
                        subtitle="Success rate"
                        icon="CheckCircle"
                        color="green"
                        trend={{
                            value: 8,
                            label: 'vs last month',
                            direction: 'up'
                        }}
                    />
                    <StatsCard
                        title="Active Projects"
                        value={stats?.activeProjects || 0}
                        subtitle="Currently working on"
                        icon="FolderOpen"
                        color="yellow"
                        trend={{
                            value: 0,
                            label: 'no change',
                            direction: 'neutral'
                        }}
                        onClick={() => navigate('/my-applications?filter=accepted')}
                    />
                    <StatsCard
                        title="Completed Projects"
                        value={stats?.completedProjects || 0}
                        subtitle="Finished projects"
                        icon="Award"
                        color="purple"
                        trend={{
                            value: 2,
                            label: 'this quarter',
                            direction: 'up'
                        }}
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Active Projects */}
                    <ActiveProjectsSection
                        projects={activeProjects}
                        loading={loading}
                    />

                    {/* Recent Applications */}
                    <ApplicationsTracker
                        applications={recentApplications}
                        loading={loading}
                    />
                </div>

                {/* Secondary Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Recent Achievements */}
                    <AchievementsBadges
                        recentAchievements={recentAchievements}
                        loading={loading}
                    />

                    {/* Recent Activity */}
                    <RecentActivity
                        activities={recentActivity}
                        loading={loading}
                    />
                </div>

                {/* Recommendations */}
                <RecommendationsSection
                    recommendations={recommendations}
                    loading={loading}
                />

                {/* Quick Actions Footer */}
                <div className="mt-12 bg-white rounded-xl border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="flex flex-wrap gap-4">
                        <button
                            onClick={() => navigate('/projects')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Browse New Projects
                        </button>
                        <button
                            onClick={() => navigate('/my-applications')}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            View All Applications
                        </button>
                        <button
                            onClick={() => navigate('/profile')}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Update Profile
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeveloperDashboard; 