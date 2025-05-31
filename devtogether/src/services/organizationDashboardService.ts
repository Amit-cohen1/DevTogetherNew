import { supabase } from '../utils/supabase';
import { Project, Application, User } from '../types/database';

export interface OrganizationStats {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalApplications: number;
    pendingApplications: number;
    acceptedApplications: number;
    rejectedApplications: number;
    acceptanceRate: number;
    averageResponseTime: number; // in hours
    totalTeamMembers: number;
}

export interface DashboardProject extends Project {
    applicationCount: number;
    pendingApplications: number;
    acceptedApplications: number;
    teamMemberCount: number;
    lastActivity?: string;
    recentApplications?: ApplicationSummary[];
}

export interface ApplicationSummary {
    id: string;
    developer_id: string;
    project_id: string;
    status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
    created_at: string;
    updated_at: string;
    developer: {
        id: string;
        first_name: string | null;
        last_name: string | null;
        email: string;
        avatar_url: string | null;
        skills: string[] | null;
    };
    project: {
        id: string;
        title: string;
    };
}

export interface TeamAnalytics {
    totalMembers: number;
    activeMembers: number; // members with recent activity
    averageProjectsPerMember: number;
    memberDistribution: {
        projectId: string;
        projectTitle: string;
        memberCount: number;
        members: TeamMember[];
    }[];
    recentActivity: {
        memberId: string;
        memberName: string;
        action: string;
        timestamp: string;
        projectId: string;
        projectTitle: string;
    }[];
}

export interface TeamMember {
    id: string;
    name: string;
    avatar_url: string | null;
    role: 'organization' | 'developer';
    joinedAt: string;
    lastActivity?: string;
    projectCount: number;
}

class OrganizationDashboardService {
    async getOrganizationStats(organizationId: string): Promise<OrganizationStats> {
        try {
            // Get organization's projects
            const { data: projects, error: projectsError } = await supabase
                .from('projects')
                .select('id, status')
                .eq('organization_id', organizationId);

            if (projectsError) throw projectsError;

            const projectIds = projects?.map((p: any) => p.id) || [];

            // Get applications for organization's projects
            const { data: applications, error: applicationsError } = await supabase
                .from('applications')
                .select('id, status, created_at, updated_at, project_id')
                .in('project_id', projectIds);

            if (applicationsError) throw applicationsError;

            // Get team members (accepted applications)
            const { data: teamMembers, error: teamError } = await supabase
                .from('applications')
                .select('developer_id')
                .in('project_id', projectIds)
                .eq('status', 'accepted');

            if (teamError) throw teamError;

            // Calculate statistics
            const totalProjects = projects?.length || 0;
            const activeProjects = projects?.filter((p: any) => p.status === 'open' || p.status === 'in_progress').length || 0;
            const completedProjects = projects?.filter((p: any) => p.status === 'completed').length || 0;

            const totalApplications = applications?.length || 0;
            const pendingApplications = applications?.filter((a: any) => a.status === 'pending').length || 0;
            const acceptedApplications = applications?.filter((a: any) => a.status === 'accepted').length || 0;
            const rejectedApplications = applications?.filter((a: any) => a.status === 'rejected').length || 0;

            const acceptanceRate = totalApplications > 0 ? (acceptedApplications / totalApplications) * 100 : 0;

            // Calculate average response time (pending applications only)
            const responseTime = await this.calculateAverageResponseTime(applications || []);

            // Get unique team members
            const uniqueTeamMembers = new Set(teamMembers?.map((tm: any) => tm.developer_id)).size;

            return {
                totalProjects,
                activeProjects,
                completedProjects,
                totalApplications,
                pendingApplications,
                acceptedApplications,
                rejectedApplications,
                acceptanceRate,
                averageResponseTime: responseTime,
                totalTeamMembers: uniqueTeamMembers
            };
        } catch (error) {
            console.error('Error fetching organization stats:', error);
            throw error;
        }
    }

    async getProjectOverview(organizationId: string, limit: number = 6): Promise<DashboardProject[]> {
        try {
            const { data: projects, error: projectsError } = await supabase
                .from('projects')
                .select(`
                    *,
                    applications (
                        id,
                        status,
                        created_at,
                        developer_id,
                        users!applications_developer_id_fkey (
                            id,
                            first_name,
                            last_name,
                            email,
                            avatar_url,
                            skills
                        )
                    )
                `)
                .eq('organization_id', organizationId)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (projectsError) throw projectsError;

            const projectsWithStats = projects?.map((project: any) => {
                const applications = project.applications || [];
                const applicationCount = applications.length;
                const pendingApplications = applications.filter((app: any) => app.status === 'pending').length;
                const acceptedApplications = applications.filter((app: any) => app.status === 'accepted').length;
                const teamMemberCount = acceptedApplications;

                // Get recent applications (last 3)
                const recentApplications = applications
                    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .slice(0, 3)
                    .map((app: any) => ({
                        id: app.id,
                        developer_id: app.developer_id,
                        project_id: project.id,
                        status: app.status,
                        created_at: app.created_at,
                        updated_at: app.updated_at || app.created_at,
                        developer: {
                            id: app.users.id,
                            first_name: app.users.first_name,
                            last_name: app.users.last_name,
                            email: app.users.email,
                            avatar_url: app.users.avatar_url,
                            skills: app.users.skills
                        },
                        project: {
                            id: project.id,
                            title: project.title
                        }
                    }));

                return {
                    ...project,
                    applicationCount,
                    pendingApplications,
                    acceptedApplications,
                    teamMemberCount,
                    lastActivity: applications.length > 0
                        ? applications.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
                        : project.created_at,
                    recentApplications,
                    applications: undefined // Remove to clean up response
                };
            }) || [];

            return projectsWithStats;
        } catch (error) {
            console.error('Error fetching project overview:', error);
            throw error;
        }
    }

    async getRecentApplications(organizationId: string, limit: number = 8): Promise<ApplicationSummary[]> {
        try {
            // First get organization's project IDs
            const { data: projects, error: projectsError } = await supabase
                .from('projects')
                .select('id')
                .eq('organization_id', organizationId);

            if (projectsError) throw projectsError;

            const projectIds = projects?.map((p: any) => p.id) || [];

            if (projectIds.length === 0) return [];

            const { data: applications, error: applicationsError } = await supabase
                .from('applications')
                .select(`
                    id,
                    developer_id,
                    project_id,
                    status,
                    created_at,
                    updated_at,
                    developer:users!applications_developer_id_fkey (
                        id,
                        first_name,
                        last_name,
                        email,
                        avatar_url,
                        skills
                    ),
                    project:projects (
                        id,
                        title
                    )
                `)
                .in('project_id', projectIds)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (applicationsError) throw applicationsError;

            return applications?.map((app: any) => ({
                id: app.id,
                developer_id: app.developer_id,
                project_id: app.project_id,
                status: app.status,
                created_at: app.created_at,
                updated_at: app.updated_at,
                developer: app.developer,
                project: app.project
            })) || [];
        } catch (error) {
            console.error('Error fetching recent applications:', error);
            throw error;
        }
    }

    async getTeamAnalytics(organizationId: string): Promise<TeamAnalytics> {
        try {
            // Get organization's projects
            const { data: projects, error: projectsError } = await supabase
                .from('projects')
                .select('id, title')
                .eq('organization_id', organizationId);

            if (projectsError) throw projectsError;

            const projectIds = projects?.map((p: any) => p.id) || [];

            if (projectIds.length === 0) {
                return {
                    totalMembers: 0,
                    activeMembers: 0,
                    averageProjectsPerMember: 0,
                    memberDistribution: [],
                    recentActivity: []
                };
            }

            // Get team members (accepted applications)
            const { data: teamApplications, error: teamError } = await supabase
                .from('applications')
                .select(`
                    id,
                    developer_id,
                    project_id,
                    created_at,
                    developer:users!applications_developer_id_fkey (
                        id,
                        first_name,
                        last_name,
                        avatar_url
                    ),
                    project:projects (
                        id,
                        title
                    )
                `)
                .in('project_id', projectIds)
                .eq('status', 'accepted');

            if (teamError) throw teamError;

            // Calculate member distribution by project
            const memberDistribution = projects?.map((project: any) => {
                const projectMembers = teamApplications?.filter((app: any) => app.project_id === project.id) || [];
                return {
                    projectId: project.id,
                    projectTitle: project.title,
                    memberCount: projectMembers.length,
                    members: projectMembers.map((app: any) => ({
                        id: app.developer.id,
                        name: `${app.developer.first_name || ''} ${app.developer.last_name || ''}`.trim(),
                        avatar_url: app.developer.avatar_url,
                        role: 'developer' as const,
                        joinedAt: app.created_at,
                        projectCount: teamApplications?.filter((ta: any) => ta.developer_id === app.developer_id).length || 1
                    }))
                };
            }) || [];

            // Get unique team members
            const uniqueMembers = new Map();
            teamApplications?.forEach((app: any) => {
                const memberId = app.developer.id;
                if (!uniqueMembers.has(memberId)) {
                    uniqueMembers.set(memberId, {
                        id: app.developer.id,
                        name: `${app.developer.first_name || ''} ${app.developer.last_name || ''}`.trim(),
                        avatar_url: app.developer.avatar_url,
                        role: 'developer',
                        joinedAt: app.created_at,
                        projectCount: teamApplications.filter((ta: any) => ta.developer_id === app.developer_id).length
                    });
                }
            });

            const totalMembers = uniqueMembers.size;
            const activeMembers = totalMembers; // For now, all members are considered active
            const averageProjectsPerMember = totalMembers > 0 ? (teamApplications?.length || 0) / totalMembers : 0;

            // Get recent activity (latest team joins)
            const recentActivity = teamApplications
                ?.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, 5)
                .map((app: any) => ({
                    memberId: app.developer.id,
                    memberName: `${app.developer.first_name || ''} ${app.developer.last_name || ''}`.trim(),
                    action: 'joined_project',
                    timestamp: app.created_at,
                    projectId: app.project.id,
                    projectTitle: app.project.title
                })) || [];

            return {
                totalMembers,
                activeMembers,
                averageProjectsPerMember,
                memberDistribution,
                recentActivity
            };
        } catch (error) {
            console.error('Error fetching team analytics:', error);
            throw error;
        }
    }

    async refreshOrganizationData(organizationId: string) {
        try {
            const [stats, projects, applications, teamAnalytics] = await Promise.all([
                this.getOrganizationStats(organizationId),
                this.getProjectOverview(organizationId),
                this.getRecentApplications(organizationId),
                this.getTeamAnalytics(organizationId)
            ]);

            return {
                stats,
                projects,
                applications,
                teamAnalytics,
                lastUpdated: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error refreshing organization data:', error);
            throw error;
        }
    }

    private async calculateAverageResponseTime(applications: any[]): Promise<number> {
        const respondedApplications = applications.filter(app =>
            app.status !== 'pending' && app.updated_at && app.created_at
        );

        if (respondedApplications.length === 0) return 0;

        const totalResponseTime = respondedApplications.reduce((total, app) => {
            const created = new Date(app.created_at).getTime();
            const updated = new Date(app.updated_at).getTime();
            const responseTime = (updated - created) / (1000 * 60 * 60); // Convert to hours
            return total + responseTime;
        }, 0);

        return Math.round(totalResponseTime / respondedApplications.length);
    }
}

export const organizationDashboardService = new OrganizationDashboardService(); 