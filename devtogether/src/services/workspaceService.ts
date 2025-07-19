import { supabase } from '../utils/supabase';
import { Project, User } from '../types/database';
import { projectService } from './projects';
import type { TeamMember as DatabaseTeamMember } from '../types/database';
import { toastService } from './toastService';

// Legacy interface for backward compatibility
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
    userRole: 'organization' | 'developer' | 'admin' | null;
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
            // Use the new projectService to get unified team member data
            const projectsWithMembers = await projectService.getProjectsWithTeamMembers();

            // Find the specific project
            const projectWithMembers = projectsWithMembers.find(p => p.id === projectId);

            if (!projectWithMembers) {
                // Fallback to individual project fetch if not found
                const project = await projectService.getProject(projectId);
                if (!project) {
                    throw new Error('Project not found');
                }
                // Add admin workspace fields if missing
                return {
                    project: {
                        ...project,
                        admin_workspace_access_requested: project.admin_workspace_access_requested ?? false,
                        admin_workspace_access_granted: project.admin_workspace_access_granted ?? false,
                    },
                    teamMembers: [],
                    isOwner: project.organization_id === userId,
                    isMember: project.organization_id === userId,
                    userRole: project.organization_id === userId ? 'organization' : null
                };
            }

            // Add admin workspace fields if missing
            const projectWithAdminFields = {
                ...projectWithMembers,
                admin_workspace_access_requested: projectWithMembers.admin_workspace_access_requested ?? false,
                admin_workspace_access_granted: projectWithMembers.admin_workspace_access_granted ?? false,
            };

            // Convert new team member structure to legacy format for backward compatibility
            const legacyTeamMembers: TeamMember[] = projectWithMembers.team_members.map((member: DatabaseTeamMember) => {
                // Create user object based on member type
                const user: User = {
                    id: member.profile.id,
                    email: member.profile.email || '',
                    role: member.type as 'developer' | 'organization',
                    first_name: member.profile.first_name,
                    last_name: member.profile.last_name,
                    organization_name: member.profile.organization_name || null,
                    bio: null,
                    skills: null,
                    location: null,
                    website: null,
                    linkedin: null,
                    github: null,
                    portfolio: null,
                    avatar_url: member.profile.avatar_url,
                    is_public: null,
                    share_token: null,
                    profile_views: null,
              
                    organization_verified: null,
                    organization_verified_at: null,
                    organization_verified_by: null,
                    organization_rejection_reason: null,
                    onboarding_complete: null,
                    created_at: '',
                    updated_at: ''
                };

                return {
                    id: member.id,
                    user,
                    role: member.type,
                    joinedAt: member.joined_at || projectWithMembers.created_at,
                    status: 'active' as const,
                    status_manager: member.role === 'owner' || member.role === 'status_manager'
                };
            });

            // Check user permissions
            const isOwner = projectWithMembers.organization_id === userId;
            const isMember = projectWithMembers.team_members.some(member => member.profile.id === userId);
            
            // Special case: Check if user is admin with granted workspace access
            const isAdminWithAccess = await this.checkIfAdminWithWorkspaceAccess(userId, projectWithAdminFields);
            
            // User has access if they are owner, team member, or admin with granted access
            const hasAccess = isMember || isAdminWithAccess;

            const userMember = projectWithMembers.team_members.find(m => m.profile.id === userId);
            const userRole = isOwner ? 'organization' :
                userMember?.type === 'developer' ? 'developer' : 
                isAdminWithAccess ? 'admin' : null;

            return {
                project: projectWithAdminFields,
                teamMembers: legacyTeamMembers,
                isOwner,
                isMember: hasAccess, // Updated to include admin access
                userRole
            };
        } catch (error) {
            console.error('Error fetching workspace data:', error);
            return null;
        }
    }

    // Helper method to check if user is admin with workspace access
    private async checkIfAdminWithWorkspaceAccess(userId: string, project: any): Promise<boolean> {
        try {
            // Check if user is admin
            const { data: userProfile, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', userId)
                .single();

            if (error || !userProfile) {
                return false;
            }

            // Check if user is admin
            const isAdmin = userProfile.role === 'admin';
            
            if (!isAdmin) {
                return false;
            }

            // If admin, check if workspace access is granted
            return project.admin_workspace_access_granted === true;
        } catch (error) {
            console.error('Error checking admin workspace access:', error);
            return false;
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
                toastService.error('Failed to update project status.');
                return false;
            }

            toastService.success('Project status updated successfully.');
            // TODO: In future phases, we'll store detailed status updates in a separate table
            // For now, we just update the basic project status

            return true;
        } catch (error) {
            console.error('Error updating project status:', error);
            toastService.error('Failed to update project status.');
            return false;
        }
    }

    async getUserActiveProjects(userId: string): Promise<Project[]> {
        try {
            // Use projectService to get projects with team members
            const allProjects = await projectService.getProjectsWithTeamMembers();

            // Filter projects where user is a team member (owner or accepted developer)
            const userProjects = allProjects.filter(project =>
                project.team_members.some(member => member.profile.id === userId)
            );

            return userProjects;
        } catch (error) {
            console.error('Error fetching user active projects:', error);
            return [];
        }
    }

    async checkWorkspaceAccess(projectId: string, userId: string, userRole?: string): Promise<boolean> {
        try {
            const workspaceData = await this.getWorkspaceData(projectId, userId);
            if (!workspaceData) return false;
            // If admin, check admin_workspace_access_granted
            if (userRole === 'admin') {
                // @ts-ignore: project may have extra fields
                return !!workspaceData.project.admin_workspace_access_granted;
            }
            return workspaceData.isMember || false;
        } catch (error) {
            console.error('Error checking workspace access:', error);
            return false;
        }
    }

    async getTeamMemberCount(projectId: string): Promise<number> {
        try {
            // Use projectService to get unified team member count
            const projectsWithMembers = await projectService.getProjectsWithTeamMembers();

            const project = projectsWithMembers.find(p => p.id === projectId);
            return project?.team_members.length || 0;
        } catch (error) {
            console.error('Error getting team member count:', error);
            return 0;
        }
    }
}

export const workspaceService = new WorkspaceService(); 