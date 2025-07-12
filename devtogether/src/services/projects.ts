import { supabase } from '../utils/supabase'
import { Project, Database, ProjectStatus } from '../types/database'
import type { TeamMember, ProjectWithTeamMembers } from '../types/database'
import { toastService } from './toastService';

export type CreateProjectData = Database['public']['Tables']['projects']['Insert']
export type UpdateProjectData = Database['public']['Tables']['projects']['Update']

// Supports multi-select filters for project queries
interface FilterOptions {
    status?: string | string[]  // Support both single and array
    difficulty_level?: string | string[]  // Support both single and array  
    application_type?: string | string[]  // Support both single and array
    technology_stack?: string[]
    organization_id?: string
    is_remote?: boolean | null
}

export const projectService = {
    // Create a new project
    async createProject(projectData: CreateProjectData): Promise<Project> {
        const { data, error } = await supabase
            .from('projects')
            .insert(projectData)
            .select()
            .single()

        if (error) {
            console.error('Error creating project:', error)
            throw new Error(error.message)
        }

        return data
    },

    // Get all projects (with optional filters)
    async getProjects(filters?: {
        status?: Project['status']
        difficulty_level?: Project['difficulty_level']
        application_type?: Project['application_type']
        technology_stack?: string[]
        organization_id?: string
    }): Promise<Project[]> {
        let query = supabase
            .from('projects')
            .select(`
        *,
        organization:profiles!projects_organization_id_fkey(*)
      `)
            .order('created_at', { ascending: false })
            .neq('status', 'rejected') // Exclude rejected projects for public/developer views

        // Apply filters
        if (filters?.status) {
            query = query.eq('status', filters.status)
        }

        if (filters?.difficulty_level) {
            query = query.eq('difficulty_level', filters.difficulty_level)
        }

        if (filters?.application_type) {
            query = query.eq('application_type', filters.application_type)
        }

        if (filters?.organization_id) {
            query = query.eq('organization_id', filters.organization_id)
        }

        if (filters?.technology_stack && filters.technology_stack.length > 0) {
            query = query.overlaps('technology_stack', filters.technology_stack)
        }

        const { data, error } = await query

        if (error) {
            console.error('Error fetching projects:', error)
            throw new Error(error.message)
        }

        return data || []
    },

    // Get all projects with team member data (for project discovery page) - updated with multi-select filter support
    async getProjectsWithTeamMembers(filters?: FilterOptions, includeRejected: boolean = false): Promise<ProjectWithTeamMembers[]> {
        console.log('🔍 ProjectService.getProjectsWithTeamMembers called with filters:', filters, 'includeRejected:', includeRejected)

        let query = supabase
            .from('projects')
            .select(`
            *,
            organization:profiles!projects_organization_id_fkey(
                id,
                organization_name,
                avatar_url,
                email,
                first_name,
                last_name,
                blocked,
                organization_status
            ),
            applications(
                id,
                status,
                status_manager,
                created_at,
                developer:profiles!applications_developer_id_fkey(
                    id,
                    first_name,
                    last_name,
                    avatar_url,
                    email,
                    blocked
                )
            )
        `)
            .order('created_at', { ascending: false })
            .eq('blocked', false); // Exclude blocked projects

        if (!includeRejected) {
            query = query.neq('status', 'rejected'); // Exclude rejected projects for public/developer views
        }

        // Apply filters - supports arrays for multi-select
        if (filters?.status) {
            if (Array.isArray(filters.status)) {
                query = query.in('status', filters.status);
            } else {
                query = query.eq('status', filters.status);
            }
        }

        if (filters?.difficulty_level) {
            if (Array.isArray(filters.difficulty_level)) {
                query = query.in('difficulty_level', filters.difficulty_level);
            } else {
                query = query.eq('difficulty_level', filters.difficulty_level);
            }
        }

        if (filters?.application_type) {
            if (Array.isArray(filters.application_type)) {
                query = query.in('application_type', filters.application_type);
            } else {
                query = query.eq('application_type', filters.application_type);
            }
        }

        if (filters?.organization_id) {
            query = query.eq('organization_id', filters.organization_id);
        }

        if (filters?.is_remote !== undefined && filters.is_remote !== null) {
            query = query.eq('is_remote', filters.is_remote);
        }

        if (filters?.technology_stack && filters.technology_stack.length > 0) {
            query = query.overlaps('technology_stack', filters.technology_stack);
        }

        const { data, error } = await query;

        console.log('📊 Raw Supabase query result:', { data, error });

        if (error) {
            console.error('❌ Error fetching projects with team members:', error);
            throw new Error(error.message);
        }

        const projectsWithTeamMembers = (data || []).filter((project: any) => {
            const org = project.organization;
            return org && org.blocked !== true && org.organization_status !== 'blocked';
        });

        const projectsWithTeamMembersFinal = projectsWithTeamMembers.map((project: any) => {
            console.log(`🏗️ Processing project: ${project.title}`);
            console.log(`   Organization:`, project.organization);
            console.log(`   Applications:`, project.applications);

            const teamMembers: TeamMember[] = [];

            // 1. Add organization owner as team leader (always first)
            if (project.organization) {
                const ownerMember: TeamMember = {
                    id: project.organization.id,
                    type: 'organization',
                    profile: {
                        id: project.organization.id,
                        first_name: project.organization.first_name,
                        last_name: project.organization.last_name,
                        organization_name: project.organization.organization_name,
                        avatar_url: project.organization.avatar_url,
                        email: project.organization.email
                    },
                    role: 'owner',
                    joined_at: project.created_at
                };

                teamMembers.push(ownerMember);
                console.log(`   ✅ Added organization owner:`, project.organization.organization_name || 'No Name');
            }

            // 2. Add accepted developers as team members
            const acceptedApplications = project.applications?.filter((app: any) =>
                app.status === 'accepted' && app.developer !== null
            ) || [];

            console.log(`   📨 Accepted applications: ${acceptedApplications.length}`);

            acceptedApplications.forEach((application: any) => {
                const devMember: TeamMember = {
                    id: application.developer.id,
                    type: 'developer',
                    profile: {
                        id: application.developer.id,
                        first_name: application.developer.first_name,
                        last_name: application.developer.last_name,
                        organization_name: null,
                        avatar_url: application.developer.avatar_url,
                        email: application.developer.email
                    },
                    role: application.status_manager === true ? 'status_manager' : 'member',
                    application: {
                        id: application.id,
                        project_id: project.id,
                        developer_id: application.developer.id,
                        status: application.status,
                        status_manager: application.status_manager,
                        created_at: application.created_at,
                        updated_at: application.created_at,
                        cover_letter: null,
                        portfolio_links: null
                    },
                    joined_at: application.created_at
                };

                teamMembers.push(devMember);
                console.log(`   ✅ Added developer:`, `${devMember.profile.first_name} ${devMember.profile.last_name}`, `(${devMember.role})`);
            });

            console.log(`   📊 Total team members for ${project.title}: ${teamMembers.length}`);

            // Filter applications to only accepted ones with valid developers for backward compatibility
            const validApplications = project.applications?.filter((app: any) =>
                app.status === 'accepted' && app.developer !== null
            ) || [];

            const result = {
                ...project,
                team_members: teamMembers,
                applications: validApplications
            };

            console.log(`   🏁 Final team_members count: ${result.team_members.length}`);

            return result;
        }) || [];

        console.log('✅ ProjectService.getProjectsWithTeamMembers completed, returning', projectsWithTeamMembersFinal.length, 'projects');

        return projectsWithTeamMembersFinal;
    },

    // Get a single project by ID
    async getProject(projectId: string): Promise<Project | null> {
        console.log('🔍 ProjectService.getProject called for projectId:', projectId)

        // Try a very simple query first to see if the basic project works
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('id', projectId)
            .single()

        console.log('📊 Simple getProject query result:', { data, error })

        if (error) {
            if (error.code === 'PGRST116') {
                return null // Project not found
            }
            console.error('Error fetching project:', error)
            throw new Error(error.message)
        }

        // If basic query works, try with organization
        const { data: dataWithOrg, error: errorWithOrg } = await supabase
            .from('projects')
            .select(`
                *,
                organization:profiles!projects_organization_id_fkey(*)
            `)
            .eq('id', projectId)
            .single()

        console.log('📊 getProject with organization result:', { dataWithOrg, errorWithOrg })

        if (errorWithOrg) {
            console.error('Error with organization join:', errorWithOrg)
            // Return basic data if organization join fails
            return data
        }

        // If organization works, try with applications
        const { data: dataWithApps, error: errorWithApps } = await supabase
            .from('projects')
            .select(`
                *,
                organization:profiles!projects_organization_id_fkey(*),
                applications(*)
            `)
            .eq('id', projectId)
            .single()

        console.log('📊 getProject with applications result:', { dataWithApps, errorWithApps })

        if (errorWithApps) {
            console.error('Error with applications join:', errorWithApps)
            // Return data with organization if applications join fails
            return dataWithOrg
        }

        // Finally try the full query
        const { data: fullData, error: fullError } = await supabase
            .from('projects')
            .select(`
                *,
                organization:profiles!projects_organization_id_fkey(*),
                applications(
                  *,
                  developer:profiles!applications_developer_id_fkey(*)
                )
            `)
            .eq('id', projectId)
            .single()

        console.log('📊 getProject FULL query result:', { fullData, fullError })

        if (fullError) {
            console.error('Error with full query:', fullError)
            // Return data with applications if full join fails
            return dataWithApps
        }

        return fullData
    },

    // Update a project
    async updateProject(projectId: string, updates: UpdateProjectData): Promise<Project> {
        const { data, error } = await supabase
            .from('projects')
            .update(updates)
            .eq('id', projectId)
            .select()
            .single()

        if (error) {
            console.error('Error updating project:', error)
            toastService.error('Failed to update project.');
            throw new Error(error.message)
        }

        toastService.project.updated();
        return data
    },

    // Delete a project
    async deleteProject(projectId: string): Promise<void> {
        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', projectId)

        if (error) {
            console.error('Error deleting project:', error)
            toastService.error('Failed to delete project.');
            throw new Error(error.message)
        }
        toastService.project.deleted();
    },

    // Get projects for organization dashboard
    async getOrganizationProjects(organizationId: string): Promise<Project[]> {
        return this.getProjects({ organization_id: organizationId })
    },

    // Search projects by title or description
    async searchProjects(searchTerm: string): Promise<Project[]> {
        const { data, error } = await supabase
            .from('projects')
            .select(`
        *,
        organization:profiles!projects_organization_id_fkey(*)
      `)
            .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
            .eq('status', 'open')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error searching projects:', error)
            throw new Error(error.message)
        }

        return data || []
    },

    // Get all projects for an organization with team and org info (for management page)
    async getOrganizationProjectsWithTeamMembers(organizationId: string): Promise<ProjectWithTeamMembers[]> {
        return this.getProjectsWithTeamMembers({ organization_id: organizationId })
    },

    // Get all projects for a developer (where they were accepted), with team members
    async getDeveloperProjectsWithTeamMembers(developerId: string, statusFilter?: string[]): Promise<ProjectWithTeamMembers[]> {
        // Fetch all applications for this developer with status 'accepted'
        let appQuery = supabase
            .from('applications')
            .select(`
                id,
                status,
                project_id,
                projects:projects!applications_project_id_fkey(
                    *,
                    organization:profiles!projects_organization_id_fkey(
                        id,
                        organization_name,
                        avatar_url,
                        email,
                        first_name,
                        last_name,
                        blocked,
                        organization_status
                    ),
                    applications(
                        id,
                        status,
                        status_manager,
                        created_at,
                        developer:profiles!applications_developer_id_fkey(
                            id,
                            first_name,
                            last_name,
                            avatar_url,
                            email,
                            blocked
                        )
                    )
                )
            `)
            .eq('developer_id', developerId)
            .eq('status', 'accepted');

        const { data, error } = await appQuery;
        if (error) {
            console.error('Error fetching developer projects:', error);
            throw new Error(error.message);
        }

        // Filter by project status if needed
        let projects: ProjectWithTeamMembers[] = (data || [])
            .map((app: any) => app.projects)
            .filter((project: any) => project && (!statusFilter || statusFilter.includes(project.status)));

        // Remove duplicates (if any)
        const seen = new Set();
        projects = projects.filter((proj: any) => {
            if (seen.has(proj.id)) return false;
            seen.add(proj.id);
            return true;
        });

        // Transform to include team members (reuse logic from getProjectsWithTeamMembers)
        return projects.map((project: any) => {
            const teamMembers: TeamMember[] = [];
            // Add org owner
            if (project.organization) {
                teamMembers.push({
                    id: project.organization.id,
                    type: 'organization',
                    profile: {
                        id: project.organization.id,
                        first_name: project.organization.first_name,
                        last_name: project.organization.last_name,
                        organization_name: project.organization.organization_name,
                        avatar_url: project.organization.avatar_url,
                        email: project.organization.email
                    },
                    role: 'owner',
                    joined_at: project.created_at
                });
            }
            // Add accepted developers
            const acceptedApplications = project.applications?.filter((app: any) =>
                app.status === 'accepted' && app.developer !== null
            ) || [];
            acceptedApplications.forEach((application: any) => {
                const isStatusManager = application.status_manager === true;
                teamMembers.push({
                    id: application.developer.id,
                    type: 'developer',
                    profile: {
                        id: application.developer.id,
                        first_name: application.developer.first_name,
                        last_name: application.developer.last_name,
                        avatar_url: application.developer.avatar_url,
                        email: application.developer.email
                    },
                    role: isStatusManager ? 'status_manager' : 'member',
                    joined_at: application.created_at
                });
            });
            return {
                ...project,
                teamMembers
            };
        });
    },

    async approveProject(projectId: string, adminId: string): Promise<boolean> {
        const { error } = await supabase
            .from('projects')
            .update({
                status: 'open',
                rejection_reason: null,
                can_resubmit: true,
                approved_by: adminId,
                approved_at: new Date().toISOString(),
            })
            .eq('id', projectId);
        return !error;
    },

    async rejectProject(projectId: string, adminId: string, reason: string, canResubmit = true): Promise<boolean> {
        const { error } = await supabase
            .from('projects')
            .update({
                status: 'rejected',
                rejection_reason: reason,
                can_resubmit: canResubmit,
                approved_by: adminId,
                approved_at: new Date().toISOString(),
            })
            .eq('id', projectId);
        return !error;
    },

    async resubmitProject(projectId: string): Promise<boolean> {
        const { error } = await supabase
            .from('projects')
            .update({
                status: 'pending',
                rejection_reason: null,
                can_resubmit: true,
            })
            .eq('id', projectId);
        return !error;
    },

    async requestWorkspaceAccess(projectId: string): Promise<boolean> {
        const { error } = await supabase
            .from('projects')
            .update({ admin_workspace_access_requested: true })
            .eq('id', projectId);
        if (error) {
            toastService.error('Failed to request workspace access.');
            return false;
        }
        toastService.success('Workspace access request sent to organization.');
        return true;
    },
    async grantWorkspaceAccess(projectId: string): Promise<boolean> {
        const { error } = await supabase
            .from('projects')
            .update({ admin_workspace_access_granted: true, admin_workspace_access_requested: false })
            .eq('id', projectId);
        if (error) {
            toastService.error('Failed to grant workspace access.');
            return false;
        }
        toastService.success('Admin workspace access granted.');
        return true;
    },
    async denyWorkspaceAccess(projectId: string): Promise<boolean> {
        const { error } = await supabase
            .from('projects')
            .update({ admin_workspace_access_granted: false, admin_workspace_access_requested: false })
            .eq('id', projectId);
        if (error) {
            toastService.error('Failed to deny workspace access.');
            return false;
        }
        toastService.success('Admin workspace access denied.');
        return true;
    },
} 