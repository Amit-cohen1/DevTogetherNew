import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    organizationDashboardService,
    OrganizationStats,
    DashboardProject,
    ApplicationSummary,
    TeamAnalytics
} from '../../services/organizationDashboardService';
import { applicationService } from '../../services/applications';
import OrganizationStatsCard from './OrganizationStatsCard';
import ProjectOverviewSection from './ProjectOverviewSection';
import ApplicationsSummary from './ApplicationsSummary';
import TeamAnalyticsSection from './TeamAnalyticsSection';
import { Button } from '../ui/Button';
import {
    Building2,
    Users,
    Clock,
    Target,
    AlertCircle,
    RefreshCw,
    Plus,
    Settings,
    ShieldAlert
} from 'lucide-react';

interface OrganizationDashboardData {
    stats: OrganizationStats;
    projects: DashboardProject[];
    applications: ApplicationSummary[];
    teamAnalytics: TeamAnalytics;
    lastUpdated: string;
}

const OrganizationDashboard: React.FC = () => {
    const { user, profile } = useAuth();
    const navigate = useNavigate();

    const [dashboardData, setDashboardData] = useState<OrganizationDashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const loadDashboardData = useCallback(async () => {
        try {
            setError(null);
            const data = await organizationDashboardService.refreshOrganizationData(user!.id);
            setDashboardData(data);
        } catch (err) {
            console.error('Error loading organization dashboard:', err);
            setError('Failed to load dashboard data. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user && profile?.role === 'organization') {
            loadDashboardData();
        }
    }, [user, profile, loadDashboardData]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadDashboardData();
        setRefreshing(false);
    };

    const handleQuickApplicationReview = async (applicationId: string, action: 'accept' | 'reject') => {
        try {
            const status = action === 'accept' ? 'accepted' : 'rejected';
            await applicationService.updateApplicationStatus(applicationId, status);
            // Refresh applications data
            await handleRefresh();
        } catch (error) {
            console.error('Error updating application:', error);
        }
    };

    const getWelcomeMessage = () => {
        const organizationName = profile?.organization_name || 'Organization';
        const hour = new Date().getHours();

        let greeting = 'Good morning';
        if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
        else if (hour >= 17) greeting = 'Good evening';

        return `${greeting}, ${organizationName}!`;
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="animate-pulse">
                    {/* Header Skeleton */}
                    <div className="mb-8">
                        <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>

                    {/* Stats Cards Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                        ))}
                    </div>

                    {/* Content Skeleton */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="h-96 bg-gray-200 rounded-lg"></div>
                        <div className="h-96 bg-gray-200 rounded-lg"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Dashboard</h3>
                    <p className="text-red-700 mb-4">{error}</p>
                    <Button onClick={handleRefresh} icon={<RefreshCw className="w-4 h-4" />}>
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    if (!dashboardData) {
        return null;
    }

    const { stats, projects, applications, teamAnalytics } = dashboardData;

    // Check organization verification status
    const isVerified = profile?.organization_verified === true;
    const isPending = profile?.organization_verified === false && !profile?.organization_rejection_reason;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Verification Status Banner */}
            {!isVerified && (
                <div className={`rounded-lg p-4 mb-6 border ${
                    isPending ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'
                }`}>
                    <div className="flex items-start">
                        <div className={`flex-shrink-0 ${
                            isPending ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                            <ShieldAlert className="h-5 w-5" />
                        </div>
                        <div className="ml-3 flex-1">
                            <h3 className={`text-sm font-medium ${
                                isPending ? 'text-yellow-800' : 'text-red-800'
                            }`}>
                                {isPending ? 'Organization Verification Pending' : 'Organization Verification Required'}
                            </h3>
                            <div className={`mt-2 text-sm ${
                                isPending ? 'text-yellow-700' : 'text-red-700'
                            }`}>
                                <p>
                                    {isPending 
                                        ? 'Your organization is currently under review by our admin team. You\'ll be able to create projects once approved.'
                                        : `Your organization verification was not approved. Reason: ${profile?.organization_rejection_reason}`
                                    }
                                </p>
                            </div>
                            <div className="mt-3">
                                <Button
                                    onClick={() => navigate('/profile')}
                                    size="sm"
                                    className={isPending ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-red-600 hover:bg-red-700'}
                                >
                                    {isPending ? 'View Profile' : 'Update Profile'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {getWelcomeMessage()}
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Here's what's happening with your organization today.
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <Button
                        variant="outline"
                        onClick={handleRefresh}
                        loading={refreshing}
                        icon={<RefreshCw className="w-4 h-4" />}
                        disabled={refreshing}
                    >
                        Refresh
                    </Button>
                    {profile?.organization_verified ? (
                        <Button
                            onClick={() => navigate('/projects/create')}
                            icon={<Plus className="w-4 h-4" />}
                        >
                            Create Project
                        </Button>
                    ) : (
                        <div className="relative group">
                            <Button
                                disabled
                                icon={<ShieldAlert className="w-4 h-4" />}
                                className="opacity-50 cursor-not-allowed"
                            >
                                Verification Required
                            </Button>
                            <div className="absolute right-0 top-full mt-2 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 pointer-events-none">
                                <div className="absolute -top-1 right-4 w-2 h-2 bg-gray-900 rotate-45"></div>
                                {profile?.organization_rejection_reason 
                                    ? "Organization verification was rejected. Please update your profile to create projects." 
                                    : "Organization verification pending. You'll be able to create projects once approved by our admin team."
                                }
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <OrganizationStatsCard
                    title="Total Projects"
                    value={stats.totalProjects}
                    icon={Building2}
                    subtitle={`${stats.activeProjects} active, ${stats.completedProjects} completed`}
                    color="blue"
                />

                <OrganizationStatsCard
                    title="Total Applications"
                    value={stats.totalApplications}
                    icon={Users}
                    subtitle={`${stats.pendingApplications} pending review`}
                    color="green"
                />

                <OrganizationStatsCard
                    title="Acceptance Rate"
                    value={`${stats.acceptanceRate.toFixed(1)}%`}
                    icon={Target}
                    subtitle={`${stats.acceptedApplications} accepted`}
                    color="purple"
                />

                <OrganizationStatsCard
                    title="Avg Response Time"
                    value={stats.averageResponseTime > 0 ? `${stats.averageResponseTime}h` : 'N/A'}
                    icon={Clock}
                    subtitle="Application review time"
                    color="yellow"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Projects Overview */}
                <div className="lg:col-span-1">
                    <ProjectOverviewSection
                        projects={projects}
                        loading={false}
                    />
                </div>

                {/* Applications Summary */}
                <div className="lg:col-span-1">
                    <ApplicationsSummary
                        applications={applications}
                        loading={false}
                        onQuickReview={handleQuickApplicationReview}
                    />
                </div>
            </div>

            {/* Team Analytics */}
            <div className="mb-8">
                <TeamAnalyticsSection
                    teamAnalytics={teamAnalytics}
                    loading={false}
                />
            </div>

            {/* Quick Actions Footer */}
            <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={profile?.organization_verified ? () => navigate('/projects/create') : undefined}
                        icon={profile?.organization_verified ? <Plus className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                        disabled={!profile?.organization_verified}
                        title={profile?.organization_verified ? undefined : "Organization verification required to create projects"}
                    >
                        {profile?.organization_verified ? 'Create New Project' : 'Verification Required'}
                    </Button>

                    <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => navigate('/applications')}
                        icon={<Users className="w-4 h-4" />}
                    >
                        Review Applications
                    </Button>

                    <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => navigate('/organization/projects')}
                        icon={<Building2 className="w-4 h-4" />}
                    >
                        Manage Projects
                    </Button>

                    <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => navigate('/profile')}
                        icon={<Settings className="w-4 h-4" />}
                    >
                        Organization Settings
                    </Button>
                </div>
            </div>

            {/* Data Freshness Indicator */}
            <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                    Last updated: {new Date(dashboardData.lastUpdated).toLocaleString()}
                </p>
            </div>
        </div>
    );
};

export default OrganizationDashboard; 