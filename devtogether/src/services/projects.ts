import { supabase } from '../utils/supabase'
import { Project, Database } from '../types/database'

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
    }): Promise<Project[]> {
        let query = supabase
            .from('projects')
            .select(`
        *,
        organization:profiles!projects_organization_id_fkey(*),
        applications(
          id,
          status,
          developer:profiles!applications_developer_id_fkey(
            id,
            first_name,
            last_name,
            avatar_url
          )
        )
      `)
            .order('created_at', { ascending: false })

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
            console.error('Error fetching projects with team members:', error)
            throw new Error(error.message)
        }

        // Filter to only include accepted applications for each project
        const projectsWithAcceptedMembers = data?.map((project: any) => ({
            ...project,
            applications: project.applications?.filter((app: any) => app.status === 'accepted') || []
        })) || []

        return projectsWithAcceptedMembers
    },

    // Get a single project by ID
    async getProject(projectId: string): Promise<Project | null> {
        const { data, error } = await supabase
            .from('projects')
            .select(`
        *,
        organization:profiles!projects_organization_id_fkey(*),
        project_members(
          *,
          user:profiles!project_members_user_id_fkey(*)
        ),
        applications(
          *,
          developer:profiles!applications_developer_id_fkey(*)
        )
      `)
            .eq('id', projectId)
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                return null // Project not found
            }
            console.error('Error fetching project:', error)
            throw new Error(error.message)
        }

        return data
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
            throw new Error(error.message)
        }

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
            throw new Error(error.message)
        }
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
    }
} 