import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    organizationDashboardService,
    OrganizationStats,
    DashboardProject,
    ApplicationSummary
} from '../../services/organizationDashboardService';
import { projectService } from '../../services/projects';
import { toastService } from '../../services/toastService';
import { Button } from '../ui/Button';
import {
    Building2,
    Users,
    Plus,
    Eye,
    CheckCircle,
    Clock,
    AlertTriangle,
    ArrowRight,
    Settings,
    TrendingUp,
    MessageSquare,
    FolderOpen,
    Award,
    Shield,
    X,
    RefreshCw,
    Target,
    Zap,
    Activity,
    FileText,
    Search,
    BarChart3,
    Building,
    Sparkles,
    Calendar,
    Star,
    Heart,
    Code,
    Briefcase
} from 'lucide-react';
import type { Profile } from '../../types/database';
import { ResubmitProjectModal } from '../projects/ResubmitProjectModal';
import GreetingBanner from './GreetingBanner';
import OrganizationStatsCard from './OrganizationStatsCard';
import { profileService, ProfileStats as ProfileStatsType } from '../../services/profileService';
import { ProfileStats as ProfileStatsComponent } from '../profile/ProfileStats';

interface DashboardData {
    stats: OrganizationStats;
    recentProjects: DashboardProject[];
    pendingApplications: ApplicationSummary[];
}

const OrganizationDashboard: React.FC = () => {
    const { user, profile } = useAuth();
    const navigate = useNavigate();

    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [resubmitProject, setResubmitProject] = useState<DashboardProject | null>(null);
    const [orgProfileStats, setOrgProfileStats] = useState<ProfileStatsType | null>(null);
    const [showQuickActions, setShowQuickActions] = useState(false);
    const [showAnalytics, setShowAnalytics] = useState(false);

    const loadData = useCallback(async () => {
        try {
            const dashboardData = await organizationDashboardService.refreshOrganizationData(user!.id);
            setData({
                stats: dashboardData.stats,
                recentProjects: dashboardData.projects.slice(0, 3), // Only show 3 most recent
                pendingApplications: dashboardData.applications
                  .filter(app => app.status === 'pending')
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .slice(0, 5)
            });
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    const refreshDashboard = async () => {
        if (!user?.id) return;
        
        try {
            setLoading(true);
            await loadData();
        } catch (err) {
            console.error('Error refreshing dashboard:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user && profile?.role === 'organization') {
            loadData();
            // Fetch organization stats for the new component
            (async () => {
                try {
                    const stats = await profileService.getOrganizationStats(user.id);
                    // Map organization stats to ProfileStatsType if needed
                    setOrgProfileStats({
                        totalProjects: stats.totalProjects,
                        activeProjects: stats.activeProjects,
                        completedProjects: stats.completedProjects,
                        totalApplications: stats.totalApplications,
                        acceptedApplications: stats.acceptedApplications,
                        acceptanceRate: stats.successRate, // Use successRate for acceptanceRate
                        platformDays: 0, // Not available in org stats
                        profileViews: 0, // Not available in org stats
                        lastActivity: new Date().toISOString(), // Not available in org stats
                    });
                } catch (e) {
                    setOrgProfileStats(null);
                }
            })();
        }
    }, [user, profile]);

    const orgProfile = profile as Profile | null;
    const isVerified = orgProfile?.organization_status === 'approved';
    const organizationName = profile?.organization_name || 'Your Organization';

    // If not verified, redirect to pending approval
    if (!isVerified) {
        navigate('/pending-approval');
        return null;
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                {/* Loading Header */}
                <div className="relative bg-gradient-to-br from-purple-900 via-blue-800 to-indigo-900 overflow-hidden">
                    <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:60px_60px]" />
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 via-blue-800/80 to-indigo-900/90" />
                    
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
                        <div className="animate-pulse">
                            <div className="h-8 bg-white/20 rounded w-1/3 mb-4"></div>
                            <div className="h-12 bg-white/20 rounded w-1/2 mb-2"></div>
                            <div className="h-6 bg-white/20 rounded w-2/3"></div>
                        </div>
                    </div>
                </div>
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="animate-pulse space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="h-96 bg-gray-200 rounded-lg"></div>
                        <div className="h-96 bg-gray-200 rounded-lg"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!data) return null;

    const { stats, recentProjects, pendingApplications } = data;

    // Calculate enhanced metrics
    const enhancedMetrics = {
        totalProjects: stats.totalProjects,
        activeProjects: stats.activeProjects,
        completedProjects: stats.completedProjects,
        pendingProjects: stats.totalProjects - stats.activeProjects - stats.completedProjects,
        rejectedProjects: stats.rejectedApplications, // Using rejected applications as proxy
        totalApplications: stats.totalApplications,
        pendingApplications: stats.pendingApplications,
        acceptedApplications: stats.acceptedApplications,
        totalTeamMembers: stats.totalTeamMembers || 0,
        averageTeamSize: stats.totalProjects > 0 ? Math.round((stats.totalTeamMembers || 0) / stats.totalProjects * 10) / 10 : 0,
        successRate: stats.totalProjects > 0 ? Math.round((stats.completedProjects / stats.totalProjects) * 100) : 0,
        applicationRate: stats.totalProjects > 0 ? Math.round((stats.totalApplications / stats.totalProjects) * 10) / 10 : 0,
    };

    const handleResubmit = async () => {
        if (!resubmitProject) return;
        try {
            const ok = await projectService.resubmitProject(resubmitProject.id);
            if (ok) {
                setTimeout(() => {
                    setResubmitProject(null);
                    loadData();
                }, 1200);
            }
        } catch (err: any) {
            console.error('Resubmit error:', err);
        }
    };

    // Add a helper to convert DashboardProject to ProjectWithTeamMembers
    function toProjectWithTeamMembers(project: DashboardProject | null) {
      if (!project) return null;
      return {
        ...project,
        team_members: [], // DashboardProject does not have team_members
        applications: [], // DashboardProject does not have applications
        organization: undefined, // DashboardProject does not have organization
        organization_id: project.organization_id,
      };
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Enhanced Header with Gradient */}
            <div className="relative bg-gradient-to-br from-purple-900 via-blue-800 to-indigo-900 overflow-hidden">
                <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:60px_60px]" />
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 via-blue-800/80 to-indigo-900/90" />
                
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
                    {/* Header Content */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <div>
                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-medium mb-3">
                                <Building className="h-4 w-4 mr-2" />
                                Organization Dashboard
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                                Welcome back, {organizationName}!
                            </h1>
                            <p className="text-blue-100 text-lg">Manage your project portfolio and team development</p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <Button
                                onClick={() => setShowAnalytics(!showAnalytics)}
                                variant="outline"
                                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                                icon={<BarChart3 className="w-4 h-4" />}
                            >
                                Analytics
                            </Button>
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
                                onClick={() => navigate('/projects/create')}
                                className="bg-purple-600 text-white hover:bg-purple-700 shadow-lg border border-purple-600"
                                icon={<Plus className="w-4 h-4" />}
                            >
                                Create Project
                            </Button>
                        </div>
                    </div>

                    {/* Enhanced Metrics Dashboard */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-4 mb-6">
                        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                                <Target className="w-5 h-5 text-white/80" />
                                <span className="text-2xl font-bold text-white">{enhancedMetrics.totalProjects}</span>
                            </div>
                            <p className="text-white/70 text-sm font-medium">Total Projects</p>
                        </div>
                        
                        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                                <Activity className="w-5 h-5 text-blue-300" />
                                <span className="text-2xl font-bold text-white">{enhancedMetrics.activeProjects}</span>
                            </div>
                            <p className="text-white/70 text-sm font-medium">Active Now</p>
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
                                <Clock className="w-5 h-5 text-yellow-300" />
                                <span className="text-2xl font-bold text-white">{enhancedMetrics.pendingProjects}</span>
                            </div>
                            <p className="text-white/70 text-sm font-medium">Pending</p>
                        </div>
                        
                        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                                <Users className="w-5 h-5 text-purple-300" />
                                <span className="text-2xl font-bold text-white">{enhancedMetrics.totalTeamMembers}</span>
                            </div>
                            <p className="text-white/70 text-sm font-medium">Team Members</p>
                        </div>
                        
                        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                                <FileText className="w-5 h-5 text-orange-300" />
                                <span className="text-2xl font-bold text-white">{enhancedMetrics.totalApplications}</span>
                            </div>
                            <p className="text-white/70 text-sm font-medium">Applications</p>
                        </div>
                        
                        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                                <TrendingUp className="w-5 h-5 text-green-300" />
                                <span className="text-2xl font-bold text-white">{enhancedMetrics.successRate}%</span>
                            </div>
                            <p className="text-white/70 text-sm font-medium">Success Rate</p>
                        </div>
                        
                        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                                <Star className="w-5 h-5 text-yellow-300" />
                                <span className="text-2xl font-bold text-white">{enhancedMetrics.averageTeamSize}</span>
                            </div>
                            <p className="text-white/70 text-sm font-medium">Avg Team Size</p>
                        </div>
                    </div>

                    {/* Analytics Panel */}
                    {showAnalytics && (
                        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 mb-6">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5" />
                                Organization Analytics
                            </h3>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Project Insights */}
                                <div>
                                    <h4 className="text-white/90 font-medium mb-3">Project Insights</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-white/70">Project Success Rate</span>
                                            <span className="text-white font-medium">{enhancedMetrics.successRate}%</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-white/70">Average Team Size</span>
                                            <span className="text-white font-medium">{enhancedMetrics.averageTeamSize} members</span>
                                    </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-white/70">Rejection Rate</span>
                                            <span className="text-white font-medium">
                                                {enhancedMetrics.totalProjects > 0 
                                                    ? Math.round((enhancedMetrics.rejectedProjects / enhancedMetrics.totalProjects) * 100)
                                                    : 0}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Application Insights */}
                                <div>
                                    <h4 className="text-white/90 font-medium mb-3">Application Insights</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-white/70">Applications per Project</span>
                                            <span className="text-white font-medium">{enhancedMetrics.applicationRate} avg</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-white/70">Pending Applications</span>
                                            <span className="text-white font-medium">{enhancedMetrics.pendingApplications}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-white/70">Acceptance Rate</span>
                                            <span className="text-white font-medium">
                                                {enhancedMetrics.totalApplications > 0 
                                                    ? Math.round((enhancedMetrics.acceptedApplications / enhancedMetrics.totalApplications) * 100)
                                                    : 0}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Growth Metrics */}
                                <div>
                                    <h4 className="text-white/90 font-medium mb-3">Growth Metrics</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-white/70">Project Portfolio</span>
                                            <span className="text-white font-medium">{enhancedMetrics.totalProjects} projects</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-white/70">Active Team Members</span>
                                            <span className="text-white font-medium">{enhancedMetrics.totalTeamMembers}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-white/70">Organization Status</span>
                                            <span className="text-green-300 font-medium">Verified</span>
                                        </div>
                                    </div>
                                </div>
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
                                    onClick={() => navigate('/projects/create')}
                                    className="flex flex-col items-center gap-2 p-4 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                                >
                                    <Plus className="w-6 h-6 text-white" />
                                    <span className="text-white text-sm font-medium">Create Project</span>
                                </button>
                                
                                <button
                                    onClick={() => navigate('/applications')}
                                    className="flex flex-col items-center gap-2 p-4 bg-white/10 hover:bg-white/20 rounded-lg transition-colors relative"
                                >
                                    {enhancedMetrics.pendingApplications > 0 && (
                                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                            {enhancedMetrics.pendingApplications}
                </div>
                                    )}
                                    <FileText className="w-6 h-6 text-white" />
                                    <span className="text-white text-sm font-medium">Review Applications</span>
                                </button>
                                
                                <button
                                    onClick={() => navigate('/dashboard/projects')}
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
                                    <span className="text-white text-sm font-medium">Organization Profile</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Enhanced Content Sections */}
                
                {/* Recent Applications - Enhanced Design */}
                {pendingApplications.length > 0 && (
                    <div className="mb-8">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 px-6 py-4 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-yellow-100 rounded-lg">
                                            <FileText className="w-5 h-5 text-yellow-600" />
                                            </div>
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-900">Pending Applications</h2>
                                            <p className="text-gray-600 text-sm">Applications waiting for your review</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                                            {pendingApplications.length} pending
                                        </span>
                                            <Button
                                            onClick={() => navigate('/applications')}
                                            variant="outline"
                                                size="sm"
                                            icon={<ArrowRight className="w-4 h-4" />}
                                        >
                                            Review All
                                            </Button>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    {pendingApplications.slice(0, 3).map((app) => (
                                        <div key={app.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <Users className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900">
                                                        {app.developer.first_name && app.developer.last_name 
                                                            ? `${app.developer.first_name} ${app.developer.last_name}`
                                                            : app.developer.email
                                                        }
                                                    </h4>
                                                    <p className="text-sm text-gray-600">{app.project.title}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-500">
                                                    {new Date(app.created_at).toLocaleDateString()}
                                                </span>
                                            <Button
                                                    onClick={() => navigate('/applications')}
                                                size="sm"
                                                variant="outline"
                                                >
                                                    Review
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Recent Projects - Enhanced Design */}
                {recentProjects.length > 0 && (
                    <div className="mb-8">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <Briefcase className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-900">Recent Projects</h2>
                                            <p className="text-gray-600 text-sm">Your latest project activity</p>
                                        </div>
                                    </div>
                        <Button
                                        onClick={() => navigate('/dashboard/projects')}
                                        variant="outline"
                            size="sm"
                            icon={<ArrowRight className="w-4 h-4" />}
                        >
                            View All
                        </Button>
                    </div>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {recentProjects.map((project) => (
                                        <div key={project.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-colors">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    project.status === 'open' ? 'bg-green-100 text-green-800' :
                                                    project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                                    project.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                    project.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {project.status.replace('_', ' ').toUpperCase()}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(project.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <h4 className="font-medium text-gray-900 mb-2 line-clamp-1">{project.title}</h4>
                                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{project.description}</p>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-4 h-4 text-gray-400" />
                                                    <span className="text-xs text-gray-600">{project.applicationCount || 0} applications</span>
                                                </div>
                                                <Button
                                                    onClick={() => navigate(`/projects/${project.id}`)}
                                                    size="sm"
                                                    variant="ghost"
                                                >
                                                    View
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                        </div>
                                    </div>
                        </div>
                        </div>
                    )}

                {/* Organization Stats Cards - Enhanced Design */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <TrendingUp className="w-5 h-5 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Performance Overview</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Project Success Rate</span>
                                <span className="font-medium text-green-600">{enhancedMetrics.successRate}%</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Total Team Members</span>
                                <span className="font-medium">{enhancedMetrics.totalTeamMembers}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Average Team Size</span>
                                <span className="font-medium">{enhancedMetrics.averageTeamSize}</span>
                            </div>
                        </div>
            </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <FileText className="w-5 h-5 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Application Insights</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Total Applications</span>
                                <span className="font-medium">{enhancedMetrics.totalApplications}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Applications per Project</span>
                                <span className="font-medium">{enhancedMetrics.applicationRate}</span>
                                    </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Acceptance Rate</span>
                                <span className="font-medium text-blue-600">
                                    {enhancedMetrics.totalApplications > 0 
                                        ? Math.round((enhancedMetrics.acceptedApplications / enhancedMetrics.totalApplications) * 100)
                                        : 0}%
                                </span>
                            </div>
                        </div>
                </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Star className="w-5 h-5 text-purple-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Platform Impact</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Projects Created</span>
                                <span className="font-medium">{enhancedMetrics.totalProjects}</span>
                </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Projects Completed</span>
                                <span className="font-medium text-green-600">{enhancedMetrics.completedProjects}</span>
            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Verification Status</span>
                                <span className="font-medium text-green-600 flex items-center gap-1">
                                    <Shield className="w-4 h-4" />
                                    Verified
                                </span>
                            </div>
                        </div>
            </div>
                </div>
            </div>

    {/* Resubmit Modal */}
    <ResubmitProjectModal
      open={!!resubmitProject}
                project={toProjectWithTeamMembers(resubmitProject)}
      onClose={() => setResubmitProject(null)}
                onSuccess={() => {
                    setResubmitProject(null);
                    loadData();
                }}
    />
        </div>
    );
};

export default OrganizationDashboard; 