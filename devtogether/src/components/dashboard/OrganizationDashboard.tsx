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
    MessageSquare
} from 'lucide-react';
import type { Profile } from '../../types/database';
import { ResubmitProjectModal } from '../projects/ResubmitProjectModal';

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
    // Remove resubmitTitle, resubmitDescription, resubmitError, resubmitSuccess, resubmitLoading

    const loadData = useCallback(async () => {
        try {
            const dashboardData = await organizationDashboardService.refreshOrganizationData(user!.id);
            setData({
                stats: dashboardData.stats,
                recentProjects: dashboardData.projects.slice(0, 3), // Only show 3 most recent
                pendingApplications: dashboardData.applications.filter(app => app.status === 'pending').slice(0, 5)
            });
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user && profile?.role === 'organization') {
            loadData();
        }
    }, [user, profile, loadData]);

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
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="animate-pulse space-y-8">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
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
        );
    }

    if (!data) return null;

    const { stats, recentProjects, pendingApplications } = data;

    const handleResubmit = async () => {
        if (!resubmitProject) return;
        // setResubmitLoading(true); // This state was removed
        // setResubmitError(null); // This state was removed
        try {
            // Remove title/description update logic, as modal now handles all fields
            const ok = await projectService.resubmitProject(resubmitProject.id);
            if (ok) {
                // setResubmitSuccess(true); // This state was removed
                setTimeout(() => {
                    setResubmitProject(null);
                    loadData();
                }, 1200);
            } else {
                // setResubmitError('Failed to resubmit project.'); // This state was removed
            }
        } catch (err: any) {
            // setResubmitError(err.message || 'Failed to resubmit project.'); // This state was removed
        } finally {
            // setResubmitLoading(false); // This state was removed
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
        <div className="min-h-screen bg-gray-50 text-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Welcome Header - Clean & Professional */}
                <div className="mb-10">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Dashboard
                    </h1>
                    <p className="text-xl text-gray-600">
                        Welcome back, {organizationName}. Here's your organization's summary.
                    </p>
                </div>

                {/* Stats Section - Compact, Responsive, Light-Only */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                    {/* Active Projects Card */}
                    <div className="bg-white rounded-lg shadow border border-gray-200 p-4 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between min-h-[110px]">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Active Projects</p>
                                <span className="text-2xl font-bold text-gray-900">{stats.activeProjects}</span>
                            </div>
                            <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Building2 className="h-5 w-5 text-blue-600" />
                            </div>
                        </div>
                        <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-blue-500 rounded-full"
                                style={{ width: `${Math.min(100, (stats.activeProjects / 10) * 100)}%` }}
                            ></div>
                        </div>
                    </div>
                    {/* Pending Applications Card */}
                    <div className="bg-white rounded-lg shadow border border-gray-200 p-4 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between min-h-[110px]">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pending Applications</p>
                                <span className="text-2xl font-bold text-gray-900">{stats.pendingApplications}</span>
                            </div>
                            <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                                <Users className="h-5 w-5 text-green-600" />
                            </div>
                        </div>
                        {stats.pendingApplications > 0 ? (
                            <div className="mt-2 flex items-center text-xs text-green-600">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                                <span>Action Required</span>
                            </div>
                        ) : (
                            <div className="mt-2 flex items-center text-xs text-green-600">
                                <CheckCircle className="w-3 h-3 mr-2" />
                                <span>All reviewed</span>
                            </div>
                        )}
                    </div>
                    {/* Success Rate Card */}
                    <div className="bg-white rounded-lg shadow border border-gray-200 p-4 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between min-h-[110px]">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Success Rate</p>
                                <span className="text-2xl font-bold text-gray-900">{stats.acceptanceRate.toFixed(0)}%</span>
                            </div>
                            <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                <TrendingUp className="h-5 w-5 text-purple-600" />
                            </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">Based on all completed projects.</div>
                    </div>
                </div>

                {/* Main Content Area - Clean & Structured */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Projects - Takes 2 columns */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Recent Projects</h2>
                    <Button
                        variant="primary"
                                onClick={() => navigate('/dashboard/projects')}
                                className="dark:text-white"
                                icon={<ArrowRight className="w-4 h-4" />}
                            >
                                View All
                    </Button>
                        </div>

                        {recentProjects.length === 0 ? (
                            <div className="text-center py-16 px-6 border-2 border-dashed border-gray-300 rounded-lg">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Building2 className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Launch Your First Initiative</h3>
                                <p className="text-gray-600 mb-6 max-w-md mx-auto">Create a new project to connect with skilled developers and bring your ideas to life.</p>
                                {isVerified && (
                                    <Button onClick={() => navigate('/projects/create')} variant="primary">
                                        <Plus className="w-5 h-5 mr-2" />
                                        Create New Project
                        </Button>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recentProjects.map((project) => (
                                    <div key={project.id} className={`flex items-center p-4 rounded-2xl shadow border transition-colors ${
                                        project.status === 'open' ? 'bg-green-50 border-green-200' :
                                        project.status === 'in_progress' ? 'bg-blue-50 border-blue-200' :
                                        project.status === 'rejected' ? 'bg-red-50 border-red-200' :
                                        'bg-gray-50 border-gray-200'
                                    }`}>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                                    project.status === 'open' ? 'bg-green-100 text-green-800 border-green-300' :
                                                    project.status === 'in_progress' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                                                    project.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-300' :
                                                    'bg-gray-100 text-gray-800 border-gray-300'
                                                }`}>
                                                    {project.status === 'open' && <CheckCircle className="h-3 w-3 mr-1" />} 
                                                    {project.status === 'in_progress' && <Clock className="h-3 w-3 mr-1" />} 
                                                    {project.status === 'rejected' && <AlertTriangle className="h-3 w-3 mr-1" />} 
                                                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                                                </span>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 ml-2">
                                                    <Users className="h-3 w-3 mr-1" />
                                                    {project.teamMemberCount} members
                                                </span>
                                            </div>
                                            <h3 className="font-semibold text-gray-900 text-base mb-1 mt-1">{project.title}</h3>
                                            <p className="text-gray-700 text-sm line-clamp-2 mb-2">{project.description}</p>
                                            {project.status === 'rejected' && project.rejection_reason && (
                                                <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-xs font-semibold">
                                                    <AlertTriangle className="inline w-4 h-4 mr-1 align-text-bottom" />
                                                    {project.rejection_reason}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-2 ml-4 min-w-[120px] items-end">
                                            {project.status === 'rejected' && (
                                                <Button
                                                    variant="primary"
                                                    size="sm"
                                                    className="w-full"
                                                    onClick={() => {
                                                        setResubmitProject(project);
                                                        // setResubmitTitle(project.title); // This state was removed
                                                        // setResubmitDescription(project.description || ''); // This state was removed
                                                        // setResubmitError(null); // This state was removed
                                                        // setResubmitSuccess(false); // This state was removed
                                                    }}
                                                >
                                                    Resubmit
                                                </Button>
                                            )}
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                className="w-full"
                                                onClick={() => navigate(`/workspace/${project.id}`)}
                                                icon={<MessageSquare className="w-4 h-4" />}
                                            >
                                                Workspace
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full"
                                                onClick={() => navigate(`/projects/${project.id}`)}
                                                icon={<Eye className="w-4 h-4" />}
                                            >
                                                Learn More
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Pending Applications - Takes 1 column */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Applications</h2>
                            <Button
                                variant="primary"
                                onClick={() => navigate('/applications')}
                                className="dark:text-white"
                                icon={<ArrowRight className="w-4 h-4" />}
                            >
                                Review All
                            </Button>
                        </div>

                        {pendingApplications.length === 0 ? (
                            <div className="text-center py-16 px-6 border-2 border-dashed border-gray-300 rounded-lg">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Inbox Clear</h3>
                                <p className="text-gray-600">No pending applications to review.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {pendingApplications.map((application) => (
                                    <div key={application.id} className="group flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-semibold text-gray-600">
                                                {((application.developer.first_name || 'A').charAt(0) + (application.developer.last_name || 'B').charAt(0))}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900 text-sm">
                                                    {`${application.developer.first_name || ''} ${application.developer.last_name || ''}`.trim() || 'Anonymous'}
                                                </p>
                                                <p className="text-xs text-gray-500">{application.project.title}</p>
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            onClick={() => navigate('/applications')}
                                            variant="secondary"
                                            className="opacity-0 group-hover:opacity-100"
                                        >
                                            Review
                                        </Button>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>
            </div>

                {/* Quick Actions Footer - Empowering & Clean */}
                <div className="mt-12 bg-gray-100 rounded-xl p-8 border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
                        <div 
                            className={`group p-4 rounded-lg transition-all duration-300 ${!isVerified ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white cursor-pointer'}`}
                            onClick={() => isVerified && navigate('/projects/create')}
                        >
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                <Plus className="h-6 w-6 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900">Create Project</h3>
                             {!isVerified && (
                                <p className="text-xs text-gray-500 mt-1">Verification needed</p>
                            )}
            </div>

                        <div className="group p-4 rounded-lg hover:bg-white cursor-pointer transition-all duration-300" onClick={() => navigate('/applications')}>
                            <div className="relative w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                {stats.pendingApplications > 0 && (
                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow">
                                        {stats.pendingApplications}
                                    </div>
                                )}
                                <Users className="h-6 w-6 text-green-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900">Review Applications</h3>
                </div>

                        <div className="group p-4 rounded-lg hover:bg-white cursor-pointer transition-all duration-300" onClick={() => navigate('/dashboard/projects')}>
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                <Building2 className="h-6 w-6 text-purple-600" />
                </div>
                            <h3 className="font-semibold text-gray-900">Manage Projects</h3>
            </div>

                        <div className="group p-4 rounded-lg hover:bg-white cursor-pointer transition-all duration-300" onClick={() => navigate('/profile')}>
                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-3">
                                <Settings className="h-6 w-6 text-gray-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900">Organization Settings</h3>
                        </div>
            </div>
                </div>
            </div>

    {/* Resubmit Modal */}
    <ResubmitProjectModal
      open={!!resubmitProject}
      project={resubmitProject ? toProjectWithTeamMembers(resubmitProject) : null}
      onClose={() => setResubmitProject(null)}
      onSuccess={() => { setResubmitProject(null); loadData(); }}
    />
        </div>
    );
};

export default OrganizationDashboard; 