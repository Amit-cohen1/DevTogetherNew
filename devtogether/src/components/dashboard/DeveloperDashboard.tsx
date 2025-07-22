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
import { Button } from '../ui/Button';
import {
    Search,
    Plus,
    Target,
    Clock,
    CheckCircle,
    Code,
    Star,
    TrendingUp,
    Award,
    Users,
    Activity,
    Briefcase,
    FileText,
    Sparkles,
    RefreshCw,
    ArrowRight,
    Zap,
    Calendar,
    MessageSquare,
    Settings,
    Heart,
    Eye,
    BarChart3,
    AlertTriangle
} from 'lucide-react';

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
    const [showQuickActions, setShowQuickActions] = useState(false);

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

    const refreshDashboard = async () => {
        if (!user?.id) return;
        
        try {
            setLoading(true);
            const data = await dashboardService.refreshDashboardData(user.id);
            setStats(data.stats);
            setActiveProjects(data.activeProjects);
            setRecentApplications(data.recentApplications);
            setAchievements(data.achievements);
            setRecentAchievements(data.recentAchievements);
            setRecentActivity(data.recentActivity);
            setRecommendations(data.recommendations);
        } catch (err) {
            console.error('Error refreshing dashboard:', err);
        } finally {
            setLoading(false);
        }
    };

    // Calculate enhanced metrics
    const enhancedMetrics = {
        totalApplications: recentApplications.length,
        activeProjects: activeProjects.length,
        completedProjects: stats?.completedProjects || 0,
        totalAchievements: achievements.length,
        currentRating: profileStats?.acceptanceRate || 0,
        profileViews: profileStats?.profileViews || 0,
        technologiesUsed: new Set(activeProjects.flatMap(p => p.technology_stack || [])).size,
        successRate: stats ? Math.round((stats.acceptedApplications / Math.max(stats.totalApplications, 1)) * 100) : 0
    };

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-md mx-auto">
                        <div className="text-red-600 mb-4">
                            <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                            <h3 className="text-lg font-semibold">Dashboard Error</h3>
                        </div>
                        <p className="text-red-700 mb-6">{error}</p>
                        <Button
                            onClick={() => window.location.reload()}
                            className="w-full"
                        >
                            Refresh Page
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Enhanced Header with Gradient */}
            <div className="relative bg-gradient-to-br from-indigo-900 via-blue-800 to-purple-900 overflow-hidden">
                <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:60px_60px]" />
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 via-blue-800/80 to-purple-900/90" />
                
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
                    {/* Header Content */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <div>
                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-medium mb-3">
                                <Code className="h-4 w-4 mr-2" />
                                Developer Dashboard
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                                Welcome back, {profile?.first_name || 'Developer'}!
                            </h1>
                            <p className="text-blue-100 text-lg">Track your development journey and discover new opportunities</p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <Button
                                onClick={() => setShowQuickActions(!showQuickActions)}
                                variant="outline"
                                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                                icon={<Zap className="w-4 h-4" />}
                            >
                                Quick Actions
                            </Button>
                            <Button 
                                onClick={refreshDashboard} 
                                variant="outline" 
                                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                                icon={<RefreshCw className="w-4 h-4" />}
                            >
                                Refresh
                            </Button>
                            <Button 
                                onClick={() => navigate('/projects')}
                                className="bg-blue-600 text-white hover:bg-blue-700 shadow-lg border border-blue-600"
                                icon={<Search className="w-4 h-4" />}
                            >
                                Discover Projects
                            </Button>
                        </div>
                    </div>

                    {/* Enhanced Metrics Dashboard */}
                    {!loading && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-4 mb-6">
                            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <FileText className="w-5 h-5 text-white/80" />
                                    <span className="text-2xl font-bold text-white">{enhancedMetrics.totalApplications}</span>
                                </div>
                                <p className="text-white/70 text-sm font-medium">Applications</p>
                            </div>
                            
                            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <Activity className="w-5 h-5 text-blue-300" />
                                    <span className="text-2xl font-bold text-white">{enhancedMetrics.activeProjects}</span>
                                </div>
                                <p className="text-white/70 text-sm font-medium">Active Projects</p>
                            </div>
                            
                            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <CheckCircle className="w-5 h-5 text-green-300" />
                                    <span className="text-2xl font-bold text-white">{enhancedMetrics.completedProjects}</span>
                                </div>
                                <p className="text-white/70 text-sm font-medium">Completed</p>
                            </div>
                            
                            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <Award className="w-5 h-5 text-yellow-300" />
                                    <span className="text-2xl font-bold text-white">{enhancedMetrics.totalAchievements}</span>
                                </div>
                                <p className="text-white/70 text-sm font-medium">Achievements</p>
                            </div>
                            
                            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <Code className="w-5 h-5 text-purple-300" />
                                    <span className="text-2xl font-bold text-white">{enhancedMetrics.technologiesUsed}</span>
                                </div>
                                <p className="text-white/70 text-sm font-medium">Technologies</p>
                            </div>
                            
                            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <Star className="w-5 h-5 text-yellow-300" />
                                    <span className="text-2xl font-bold text-white">{enhancedMetrics.currentRating.toFixed(1)}</span>
                                </div>
                                <p className="text-white/70 text-sm font-medium">Rating</p>
                            </div>
                            
                            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <Eye className="w-5 h-5 text-cyan-300" />
                                    <span className="text-2xl font-bold text-white">{enhancedMetrics.profileViews}</span>
                                </div>
                                <p className="text-white/70 text-sm font-medium">Profile Views</p>
                            </div>
                            
                            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <TrendingUp className="w-5 h-5 text-green-300" />
                                    <span className="text-2xl font-bold text-white">{enhancedMetrics.successRate}%</span>
                                </div>
                                <p className="text-white/70 text-sm font-medium">Success Rate</p>
                            </div>
                        </div>
                    )}

                    {/* Quick Actions Panel */}
                    {showQuickActions && (
                        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 mb-6">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <Zap className="w-5 h-5" />
                                Quick Actions
                            </h3>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <button
                                    onClick={() => navigate('/projects')}
                                    className="flex flex-col items-center gap-2 p-4 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                                >
                                    <Search className="w-6 h-6 text-white" />
                                    <span className="text-white text-sm font-medium">Browse Projects</span>
                                </button>
                                
                                <button
                                    onClick={() => navigate('/my-applications')}
                                    className="flex flex-col items-center gap-2 p-4 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                                >
                                    <FileText className="w-6 h-6 text-white" />
                                    <span className="text-white text-sm font-medium">My Applications</span>
                                </button>
                                
                                <button
                                    onClick={() => navigate('/my-projects')}
                                    className="flex flex-col items-center gap-2 p-4 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                                >
                                    <Briefcase className="w-6 h-6 text-white" />
                                    <span className="text-white text-sm font-medium">My Projects</span>
                                </button>
                                
                                <button
                                    onClick={() => navigate('/profile')}
                                    className="flex flex-col items-center gap-2 p-4 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                                >
                                    <Settings className="w-6 h-6 text-white" />
                                    <span className="text-white text-sm font-medium">Profile</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {[...Array(4)].map((_, index) => (
                            <div key={index} className="bg-white rounded-xl border border-gray-100 p-6 animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        {/* Enhanced Content Sections */}
                        
                        {/* Recent Activity - Enhanced Design */}
                        <div className="mb-8">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                <Activity className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
                                                <p className="text-gray-600 text-sm">Your latest platform interactions</p>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={() => navigate('/my-applications')}
                                            variant="outline"
                                            size="sm"
                                            icon={<ArrowRight className="w-4 h-4" />}
                                        >
                                            View All
                                        </Button>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <RecentActivity
                                        activities={recentActivity}
                                        loading={loading}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Active Projects - Enhanced Design */}
                        {activeProjects.length > 0 && (
                            <div className="mb-8">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-green-100 rounded-lg">
                                                    <Briefcase className="w-5 h-5 text-green-600" />
                                                </div>
                                                <div>
                                                    <h2 className="text-xl font-semibold text-gray-900">Active Projects</h2>
                                                    <p className="text-gray-600 text-sm">Projects you're currently working on</p>
                                                </div>
                                            </div>
                                            <Button
                                                onClick={() => navigate('/my-projects')}
                                                variant="outline"
                                                size="sm"
                                                icon={<ArrowRight className="w-4 h-4" />}
                                            >
                                                View All
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <ActiveProjectsSection
                                            projects={activeProjects}
                                            loading={loading}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Secondary Content Grid - Enhanced Layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Applications Tracker */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-100 rounded-lg">
                                            <FileText className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-900">Application Tracker</h2>
                                            <p className="text-gray-600 text-sm">Track your application progress</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <ApplicationsTracker
                                        applications={recentApplications}
                                        loading={loading}
                                    />
                                </div>
                            </div>

                            {/* Achievements */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 px-6 py-4 border-b border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-yellow-100 rounded-lg">
                                            <Award className="w-5 h-5 text-yellow-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-900">Achievements</h2>
                                            <p className="text-gray-600 text-sm">Your development milestones</p>
                                        </div>
                                    </div>
                                </div>
                                                                 <div className="p-6">
                                     <AchievementsBadges
                                         recentAchievements={recentAchievements}
                                         loading={loading}
                                     />
                                 </div>
                            </div>
                        </div>

                        {/* Recommendations Section - Full Width */}
                        {recommendations.length > 0 && (
                            <div className="mt-8">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="bg-gradient-to-r from-cyan-50 to-blue-50 px-6 py-4 border-b border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-cyan-100 rounded-lg">
                                                    <Star className="w-5 h-5 text-cyan-600" />
                                                </div>
                                                <div>
                                                    <h2 className="text-xl font-semibold text-gray-900">Recommended for You</h2>
                                                    <p className="text-gray-600 text-sm">Projects that match your skills and interests</p>
                                                </div>
                                            </div>
                                            <Button
                                                onClick={() => navigate('/projects')}
                                                variant="outline"
                                                size="sm"
                                                icon={<Search className="w-4 h-4" />}
                                            >
                                                Browse All
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <RecommendationsSection
                                            recommendations={recommendations}
                                            loading={loading}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default DeveloperDashboard; 