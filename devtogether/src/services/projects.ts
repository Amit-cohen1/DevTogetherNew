import { supabase } from '../utils/supabase'
import { Project, Database, ProjectStatus } from '../types/database'
import type { TeamMember, ProjectWithTeamMembers } from '../types/database'
import { toastService } from './toastService';

export type CreateProjectData = Database['public']['Tables']['projects']['Insert']
export type UpdateProjectData = Database['public']['Tables']['projects']['Update']

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

    // Get all projects with team member data (for project discovery page)
    async getProjectsWithTeamMembers(filters?: {
        status?: Project['status']
        difficulty_level?: Project['difficulty_level']
        application_type?: Project['application_type']
        technology_stack?: string[]
        organization_id?: string
    }): Promise<ProjectWithTeamMembers[]> {
        console.log('🔍 ProjectService.getProjectsWithTeamMembers called with filters:', filters)

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
            .neq('status', 'rejected') // Exclude rejected projects for public/developer views
            .eq('blocked', false); // Exclude blocked projects

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

        console.log('📊 Raw Supabase query result:', { data, error })

        if (error) {
            console.error('❌ Error fetching projects with team members:', error)
            throw new Error(error.message)
        }

        // Filter out projects whose organization is blocked or has organization_status === 'blocked'
        const projectsWithTeamMembers = (data || []).filter((project: any) => {
            const org = project.organization;
            return org && org.blocked !== true && org.organization_status !== 'blocked';
        })

        // Transform data to include proper team member composition
        const projectsWithTeamMembersFinal = projectsWithTeamMembers.map((project: any) => {
            console.log(`🏗️ Processing project: ${project.title}`)
            console.log(`   Organization:`, project.organization)
            console.log(`   Applications:`, project.applications)

            const teamMembers: TeamMember[] = []

            // 1. Add organization owner as team leader (always first)
            if (project.organization) {
                const orgMember = {
                    id: project.organization.id,
                    type: 'organization' as const,
                    profile: {
                        id: project.organization.id,
                        first_name: project.organization.first_name,
                        last_name: project.organization.last_name,
                        organization_name: project.organization.organization_name,
                        avatar_url: project.organization.avatar_url,
                        email: project.organization.email
                    },
                    role: 'owner' as const,
                    joined_at: project.created_at // Project creation date
                }
                teamMembers.push(orgMember)
                console.log(`   ✅ Added organization owner:`, orgMember.profile.organization_name)
            }

            // 2. Add accepted developers as team members
            const acceptedApplications = project.applications?.filter((app: any) =>
                app.status === 'accepted' && app.developer !== null
            ) || []

            console.log(`   🔍 Found ${acceptedApplications.length} accepted applications`)

            acceptedApplications.forEach((application: any) => {
                const isStatusManager = application.status_manager === true

                const devMember = {
                    id: application.developer.id,
                    type: 'developer' as const,
                    profile: {
                        id: application.developer.id,
                        first_name: application.developer.first_name,
                        last_name: application.developer.last_name,
                        avatar_url: application.developer.avatar_url,
                        email: application.developer.email
                    },
                    role: isStatusManager ? 'status_manager' as const : 'member' as const,
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
                }

                teamMembers.push(devMember)
                console.log(`   ✅ Added developer:`, `${devMember.profile.first_name} ${devMember.profile.last_name}`, `(${devMember.role})`)
            })

            console.log(`   📊 Total team members for ${project.title}: ${teamMembers.length}`)

            // Filter applications to only accepted ones with valid developers for backward compatibility
            const validApplications = project.applications?.filter((app: any) =>
                app.status === 'accepted' && app.developer !== null
            ) || []

            const result = {
                ...project,
                team_members: teamMembers,
                applications: validApplications
            }

            console.log(`   🏁 Final team_members count: ${result.team_members.length}`)

            return result
        }) || []

        console.log('✅ ProjectService.getProjectsWithTeamMembers completed, returning', projectsWithTeamMembersFinal.length, 'projects')

        return projectsWithTeamMembersFinal
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
    }
} 