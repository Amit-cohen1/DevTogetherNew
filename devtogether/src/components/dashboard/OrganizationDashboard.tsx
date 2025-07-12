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
    MessageSquare,
    FolderOpen,
    Award
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
    // Remove resubmitTitle, resubmitDescription, resubmitError, resubmitSuccess, resubmitLoading
    const [orgProfileStats, setOrgProfileStats] = useState<ProfileStatsType | null>(null);

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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Greeting Banner */}
                <GreetingBanner
                    name={organizationName}
                />
                {/* ProfileStats (Platform Statistics) */}
                {orgProfileStats && (
                    <div className="mb-8">
                        <ProfileStatsComponent stats={orgProfileStats} />
                    </div>
                )}

                {/* Recent Applications - Compact Section */}
                <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">Recent Applications</h3>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => navigate('/applications')}
                            icon={<ArrowRight className="w-4 h-4" />}
                        >
                            View All
                        </Button>
                    </div>
                    {pendingApplications.length === 0 ? (
                        <div className="text-center py-6 text-gray-500 text-sm">No recent applications.</div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {pendingApplications.slice(0, 5).map((application) => (
                                <div key={application.id} className="flex items-center py-2 gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                                        {((application.developer.first_name || 'A').charAt(0) + (application.developer.last_name || 'B').charAt(0))}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-900 text-sm truncate">
                                                {`${application.developer.first_name || ''} ${application.developer.last_name || ''}`.trim() || 'Anonymous'}
                                            </span>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : application.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-500 truncate">{application.project.title}</div>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => navigate('/applications')}
                                    >
                                        Review
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Projects - Consistent Card */}
                <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">Recent Projects</h3>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => navigate('/dashboard/projects')}
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
                            {recentProjects.map((project) => {
                                // Status-based color and icon
                                let cardBg = 'bg-gray-50 border-gray-200';
                                let statusColor = 'bg-gray-100 text-gray-800 border-gray-300';
                                let statusIcon = <FolderOpen className="h-3 w-3 mr-1" />;
                                if (project.status === 'open') {
                                    cardBg = 'bg-green-50 border-green-200';
                                    statusColor = 'bg-green-100 text-green-800 border-green-300';
                                    statusIcon = <CheckCircle className="h-3 w-3 mr-1" />;
                                } else if (project.status === 'in_progress') {
                                    cardBg = 'bg-blue-50 border-blue-200';
                                    statusColor = 'bg-blue-100 text-blue-800 border-blue-300';
                                    statusIcon = <Clock className="h-3 w-3 mr-1" />;
                                } else if (project.status === 'completed') {
                                    cardBg = 'bg-green-50 border-green-200 ring-2 ring-green-300';
                                    statusColor = 'bg-green-100 text-green-800 border-green-300';
                                    statusIcon = <Award className="h-3 w-3 mr-1 text-green-500 animate-bounce" />;
                                } else if (project.status === 'rejected') {
                                    cardBg = 'bg-red-50 border-red-200';
                                    statusColor = 'bg-red-100 text-red-800 border-red-300';
                                    statusIcon = <AlertTriangle className="h-3 w-3 mr-1" />;
                                } else if (project.status === 'cancelled') {
                                    cardBg = 'bg-gray-100 border-gray-300';
                                    statusColor = 'bg-gray-200 text-gray-500 border-gray-300';
                                    statusIcon = <AlertTriangle className="h-3 w-3 mr-1" />;
                                }
                                return (
                                    <div key={project.id} className={`flex items-center p-4 rounded-2xl shadow border transition-colors ${cardBg}`}>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColor}`}>
                                                    {statusIcon}
                                                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                                                </span>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 ml-2">
                                                    <Users className="h-3 w-3 mr-1" />
                                                    {project.teamMemberCount} members
                                                </span>
                                            </div>
                                            <h3 className="font-semibold text-gray-900 text-base mb-1 mt-1">{project.title}</h3>
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
                                                Project Page
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div> {/* End of Recent Projects card */}

                {/* Remove empty Main Content Area grid for valid JSX */}

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