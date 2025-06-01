import { supabase } from '../utils/supabase'
import { Application } from '../types/database'
import { notificationService } from './notifications'

export interface ApplicationCreateData {
    project_id: string
    developer_id: string
    cover_letter?: string
    portfolio_links?: string[]
}

export interface ApplicationUpdateData {
    status?: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
    cover_letter?: string
    portfolio_links?: string[]
}

export interface ApplicationWithDetails extends Application {
    project: {
        id: string
        title: string
        organization_id: string
        status: string
        organization: {
            id: string
            organization_name: string | null
            avatar_url: string | null
        }
    }
    developer: {
        id: string
        first_name: string | null
        last_name: string | null
        email: string
        avatar_url: string | null
        bio: string | null
        skills: string[] | null
        portfolio: string | null
        github: string | null
        linkedin: string | null
    }
}

class ApplicationService {
    /**
     * Submit a new application
     */
    async submitApplication(applicationData: ApplicationCreateData): Promise<Application> {
        try {
            // Check if user already applied
            const { data: existingApplication, error: checkError } = await supabase
                .from('applications')
                .select('id')
                .eq('project_id', applicationData.project_id)
                .eq('developer_id', applicationData.developer_id)
                .single()

            if (checkError && checkError.code !== 'PGRST116') {
                throw checkError
            }

            if (existingApplication) {
                throw new Error('You have already applied to this project')
            }

            // Submit application
            const { data, error } = await supabase
                .from('applications')
                .insert([{
                    ...applicationData,
                    status: 'pending'
                }])
                .select()
                .single()

            if (error) throw error
            if (!data) throw new Error('Failed to create application')

            // Get project and developer details for notification
            try {
                const { data: projectData } = await supabase
                    .from('projects')
                    .select(`
                        title,
                        organization_id,
                        organization:profiles!projects_organization_id_fkey(organization_name)
                    `)
                    .eq('id', applicationData.project_id)
                    .single()

                const { data: developerData } = await supabase
                    .from('profiles')
                    .select('first_name, last_name')
                    .eq('id', applicationData.developer_id)
                    .single()

                if (projectData && developerData) {
                    const developerName = `${developerData.first_name} ${developerData.last_name}`

                    // Notify organization of new application
                    await notificationService.notifyNewApplication(
                        projectData.organization_id,
                        projectData.title,
                        developerName,
                        applicationData.project_id
                    )
                }
            } catch (notificationError) {
                console.error('Failed to send new application notification:', notificationError)
                // Don't fail the application submission if notification fails
            }

            return data
        } catch (error) {
            console.error('Error submitting application:', error)
            throw error
        }
    }

    /**
     * Get applications for a specific project (for organizations)
     */
    async getProjectApplications(projectId: string): Promise<ApplicationWithDetails[]> {
        try {
            const { data, error } = await supabase
                .from('applications')
                .select(`
          *,
          project:projects(
            id,
            title,
            organization_id,
            status,
            organization:profiles!projects_organization_id_fkey(
              id,
              organization_name,
              avatar_url
            )
          ),
          developer:profiles!applications_developer_id_fkey(
            id,
            first_name,
            last_name,
            email,
            avatar_url,
            bio,
            skills,
            portfolio,
            github,
            linkedin
          )
        `)
                .eq('project_id', projectId)
                .order('created_at', { ascending: false })

            if (error) throw error
            return data || []
        } catch (error) {
            console.error('Error fetching project applications:', error)
            throw error
        }
    }

    /**
     * Get applications for a specific developer
     */
    async getDeveloperApplications(developerId: string): Promise<ApplicationWithDetails[]> {
        try {
            const { data, error } = await supabase
                .from('applications')
                .select(`
          *,
          project:projects(
            id,
            title,
            organization_id,
            status,
            organization:profiles!projects_organization_id_fkey(
              id,
              organization_name,
              avatar_url
            )
          ),
          developer:profiles!applications_developer_id_fkey(
            id,
            first_name,
            last_name,
            email,
            avatar_url,
            bio,
            skills,
            portfolio,
            github,
            linkedin
          )
        `)
                .eq('developer_id', developerId)
                .order('created_at', { ascending: false })

            if (error) throw error
            return data || []
        } catch (error) {
            console.error('Error fetching developer applications:', error)
            throw error
        }
    }

    /**
     * Get a specific application with details
     */
    async getApplication(applicationId: string): Promise<ApplicationWithDetails | null> {
        try {
            const { data, error } = await supabase
                .from('applications')
                .select(`
          *,
          project:projects(
            id,
            title,
            organization_id,
            status,
            organization:profiles!projects_organization_id_fkey(
              id,
              organization_name,
              avatar_url
            )
          ),
          developer:profiles!applications_developer_id_fkey(
            id,
            first_name,
            last_name,
            email,
            avatar_url,
            bio,
            skills,
            portfolio,
            github,
            linkedin
          )
        `)
                .eq('id', applicationId)
                .single()

            if (error && error.code !== 'PGRST116') throw error
            return data
        } catch (error) {
            console.error('Error fetching application:', error)
            throw error
        }
    }

    /**
     * Update application status (for organizations)
     */
    async updateApplicationStatus(
        applicationId: string,
        status: 'accepted' | 'rejected'
    ): Promise<Application> {
        try {
            const { data, error } = await supabase
                .from('applications')
                .update({
                    status,
                    updated_at: new Date().toISOString()
                })
                .eq('id', applicationId)
                .select(`
                    *,
                    project:projects(
                        title,
                        organization:profiles!projects_organization_id_fkey(organization_name)
                    ),
                    developer:profiles!applications_developer_id_fkey(id)
                `)
                .single()

            if (error) throw error
            if (!data) throw new Error('Failed to update application')

            // Send notification to developer about status change
            try {
                if (data.project && data.project.organization) {
                    await notificationService.notifyApplicationStatus(
                        data.developer_id,
                        data.project.title,
                        data.project.organization.organization_name || 'Organization',
                        status
                    )
                }
            } catch (notificationError) {
                console.error('Failed to send status notification:', notificationError)
                // Don't fail the status update if notification fails
            }

            return data
        } catch (error) {
            console.error('Error updating application status:', error)
            throw error
        }
    }

    /**
     * Withdraw application (for developers)
     */
    async withdrawApplication(applicationId: string): Promise<Application> {
        try {
            const { data, error } = await supabase
                .from('applications')
                .update({
                    status: 'withdrawn',
                    updated_at: new Date().toISOString()
                })
                .eq('id', applicationId)
                .select()
                .single()

            if (error) throw error
            if (!data) throw new Error('Failed to withdraw application')

            return data
        } catch (error) {
            console.error('Error withdrawing application:', error)
            throw error
        }
    }

    /**
     * Update application details (for developers, only if status is pending)
     */
    async updateApplication(
        applicationId: string,
        updateData: ApplicationUpdateData
    ): Promise<Application> {
        try {
            const { data, error } = await supabase
                .from('applications')
                .update({
                    ...updateData,
                    updated_at: new Date().toISOString()
                })
                .eq('id', applicationId)
                .eq('status', 'pending') // Only allow updates for pending applications
                .select()
                .single()

            if (error) throw error
            if (!data) throw new Error('Failed to update application or application is no longer pending')

            return data
        } catch (error) {
            console.error('Error updating application:', error)
            throw error
        }
    }

    /**
     * Check if a developer has already applied to a project
     */
    async hasApplied(projectId: string, developerId: string): Promise<boolean> {
        try {
            // First, verify we have the required parameters
            if (!projectId || !developerId) {
                console.warn('hasApplied: Missing required parameters', { projectId, developerId });
                return false;
            }

            // Check if we have a valid auth session
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError) {
                console.error('hasApplied: Session error:', sessionError);
                return false;
            }

            if (!session) {
                console.warn('hasApplied: No active session');
                return false;
            }

            // Verify the current user matches the developerId
            if (session.user.id !== developerId) {
                console.warn('hasApplied: User ID mismatch', { sessionUserId: session.user.id, developerId });
                return false;
            }

            // Try the query with enhanced error handling
            const { data, error } = await supabase
                .from('applications')
                .select('id')
                .eq('project_id', projectId)
                .eq('developer_id', developerId)
                .maybeSingle(); // Use maybeSingle instead of single to avoid PGRST116 errors

            if (error) {
                console.error('hasApplied: Query error:', error);
                // If it's an RLS error, try alternative approach
                if (error.code === 'PGRST301' || error.code === 'PGRST116' || error.message.includes('row-level security') || error.message.includes('Not Acceptable')) {
                    console.warn('hasApplied: RLS restriction, trying alternative query');

                    // Alternative approach: get all user's applications and check if project exists
                    const { data: userApps, error: altError } = await supabase
                        .from('applications')
                        .select('project_id')
                        .eq('developer_id', developerId);

                    if (altError) {
                        console.error('hasApplied: Alternative query also failed:', altError);
                        return false;
                    }

                    return !!(userApps?.some((app: { project_id: string }) => app.project_id === projectId));
                }
                throw error;
            }

            return !!data;
        } catch (error) {
            console.error('hasApplied: Unexpected error:', error);
            // Return false on any error to prevent blocking the UI
            return false;
        }
    }

    /**
     * Get application statistics for a project
     */
    async getProjectApplicationStats(projectId: string) {
        try {
            const { data, error } = await supabase
                .from('applications')
                .select('status')
                .eq('project_id', projectId)

            if (error) throw error

            const stats = {
                total: data?.length || 0,
                pending: data?.filter((app: { status: string }) => app.status === 'pending').length || 0,
                accepted: data?.filter((app: { status: string }) => app.status === 'accepted').length || 0,
                rejected: data?.filter((app: { status: string }) => app.status === 'rejected').length || 0,
                withdrawn: data?.filter((app: { status: string }) => app.status === 'withdrawn').length || 0
            }

            return stats
        } catch (error) {
            console.error('Error fetching application stats:', error)
            throw error
        }
    }

    /**
     * Get application statistics for a developer
     */
    async getDeveloperApplicationStats(developerId: string) {
        try {
            const { data, error } = await supabase
                .from('applications')
                .select('status')
                .eq('developer_id', developerId)

            if (error) throw error

            const stats = {
                total: data?.length || 0,
                pending: data?.filter((app: { status: string }) => app.status === 'pending').length || 0,
                accepted: data?.filter((app: { status: string }) => app.status === 'accepted').length || 0,
                rejected: data?.filter((app: { status: string }) => app.status === 'rejected').length || 0,
                withdrawn: data?.filter((app: { status: string }) => app.status === 'withdrawn').length || 0
            }

            return stats
        } catch (error) {
            console.error('Error fetching application stats:', error)
            throw error
        }
    }
}

export const applicationService = new ApplicationService() 