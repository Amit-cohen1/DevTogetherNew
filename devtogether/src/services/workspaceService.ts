import { supabase } from '../utils/supabase';
import { Project, User, Application } from '../types/database';

export interface TeamMember {
    id: string;
    user: User;
    role: 'organization' | 'developer';
    joinedAt: string;
    status: 'active' | 'inactive';
    status_manager?: boolean; // Can this developer manage project status
}

export interface WorkspaceData {
    project: Project;
    teamMembers: TeamMember[];
    isOwner: boolean;
    isMember: boolean;
    userRole: 'organization' | 'developer' | null;
}

export interface ProjectStatusUpdate {
    currentPhase: string;
    progress: number;
    nextMilestone?: string;
    deadline?: string;
    notes?: string;
}

class WorkspaceService {
    async getWorkspaceData(projectId: string, userId: string): Promise<WorkspaceData | null> {
        try {
            // Get project details
            const { data: project, error: projectError } = await supabase
                .from('projects')
                .select('*')
                .eq('id', projectId)
                .single();

            if (projectError || !project) {
                throw new Error('Project not found');
            }

            // Get organization owner details
            const { data: organizationUser, error: orgError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', project.organization_id)
                .single();

            if (orgError || !organizationUser) {
                throw new Error('Organization not found');
            }

            // Get accepted applications for team members
            const { data: acceptedApplications, error: applicationsError } = await supabase
                .from('applications')
                .select(`
          *,
          profiles!developer_id(*)
        `)
                .eq('project_id', projectId)
                .eq('status', 'accepted');

            if (applicationsError) {
                console.error('Error fetching team members:', applicationsError);
                return null;
            }

            // Build team members list
            const teamMembers: TeamMember[] = [];

            // Add organization owner
            teamMembers.push({
                id: organizationUser.id,
                user: organizationUser,
                role: 'organization',
                joinedAt: project.created_at,
                status: 'active',
                status_manager: true // Organization owners can always manage status
            });

            // Add accepted developers
            if (acceptedApplications) {
                acceptedApplications.forEach((app: any) => {
                    teamMembers.push({
                        id: app.profiles.id,
                        user: app.profiles,
                        role: 'developer',
                        joinedAt: app.updated_at,
                        status: 'active',
                        status_manager: app.status_manager || false
                    });
                });
            }

            // Check user permissions
            const isOwner = project.organization_id === userId;
            const isMember = teamMembers.some(member => member.user.id === userId);
            const userRole = isOwner ? 'organization' :
                teamMembers.find(m => m.user.id === userId && m.role === 'developer') ? 'developer' :
                    null;

            return {
                project,
                teamMembers,
                isOwner,
                isMember,
                userRole
            };
        } catch (error) {
            console.error('Error fetching workspace data:', error);
            return null;
        }
    }

    async updateProjectStatus(projectId: string, statusUpdate: ProjectStatusUpdate): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('projects')
                .update({
                    status: statusUpdate.currentPhase,
                    updated_at: new Date().toISOString()
                })
                .eq('id', projectId);

            if (error) {
                console.error('Error updating project status:', error);
                return false;
            }

            // TODO: In future phases, we'll store detailed status updates in a separate table
            // For now, we just update the basic project status

            return true;
        } catch (error) {
            console.error('Error updating project status:', error);
            return false;
        }
    }

    async getUserActiveProjects(userId: string): Promise<Project[]> {
        try {
            // Get projects where user is organization owner
            const { data: ownedProjects, error: ownedError } = await supabase
                .from('projects')
                .select('*')
                .eq('organization_id', userId);

            if (ownedError) {
                console.error('Error fetching owned projects:', ownedError);
            }

            // Get projects where user has accepted applications
            const { data: acceptedApplications, error: acceptedError } = await supabase
                .from('applications')
                .select(`
          projects(*)
        `)
                .eq('developer_id', userId)
                .eq('status', 'accepted');

            if (acceptedError) {
                console.error('Error fetching accepted applications:', acceptedError);
            }

            // Combine and deduplicate projects
            const allProjects: Project[] = [];

            if (ownedProjects) {
                allProjects.push(...ownedProjects);
            }

            if (acceptedApplications) {
                acceptedApplications.forEach((app: any) => {
                    if (app.projects && !allProjects.find(p => p.id === app.projects.id)) {
                        allProjects.push(app.projects as Project);
                    }
                });
            }

            return allProjects;
        } catch (error) {
            console.error('Error fetching user active projects:', error);
            return [];
        }
    }

    async checkWorkspaceAccess(projectId: string, userId: string): Promise<boolean> {
        try {
            const workspaceData = await this.getWorkspaceData(projectId, userId);
            return workspaceData?.isMember || false;
        } catch (error) {
            console.error('Error checking workspace access:', error);
            return false;
        }
    }

    async getTeamMemberCount(projectId: string): Promise<number> {
        try {
            const { count, error } = await supabase
                .from('applications')
                .select('id', { count: 'exact' })
                .eq('project_id', projectId)
                .eq('status', 'accepted');

            if (error) {
                console.error('Error getting team member count:', error);
                return 0;
            }

            // Add 1 for the organization owner
            return (count || 0) + 1;
        } catch (error) {
            console.error('Error getting team member count:', error);
            return 0;
        }
    }
}

export const workspaceService = new WorkspaceService(); 