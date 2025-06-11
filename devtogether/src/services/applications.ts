import { supabase } from '../utils/supabase'
import { Application } from '../types/database'
import { notificationService } from './notificationService'

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
            // Insert the application
            const { data, error } = await supabase
                .from('applications')
                .insert([{
                    project_id: applicationData.project_id,
                    developer_id: applicationData.developer_id,
                    cover_letter: applicationData.cover_letter,
                    portfolio_links: applicationData.portfolio_links || [],
                    status: 'pending'
                }])
                .select(`
                    *,
                    project:projects(
                        title,
                        organization_id,
                        organization:profiles!projects_organization_id_fkey(organization_name)
                    ),
                    developer:profiles!applications_developer_id_fkey(first_name, last_name)
                `)
                .single()

            if (error) throw error
            if (!data) throw new Error('Failed to create application')

            // Send notification to organization about new application
            try {
                if (data.project && data.project.organization) {
                    const developerName = data.developer
                        ? `${data.developer.first_name || ''} ${data.developer.last_name || ''}`.trim() || 'A developer'
                        : 'A developer';

                    await notificationService.notifyNewApplication(
                        data.project.organization_id,
                        developerName,
                        data.project.title,
                        data.id,
                        data.project_id
                    );
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
            // First get applications
            const { data: applications, error: appsError } = await supabase
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
                    )
                `)
                .eq('project_id', projectId)
                .order('created_at', { ascending: false })

            if (appsError) throw appsError

            if (!applications || applications.length === 0) {
                return []
            }

            // Get developer IDs
            const developerIds = applications.map((app: any) => app.developer_id)

            // Get developer profiles
            const { data: developers, error: devsError } = await supabase
                .from('profiles')
                .select(`
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
                `)
                .in('id', developerIds)

            if (devsError) throw devsError

            // Combine applications with developer data
            const applicationsWithDevelopers = applications.map((app: any) => {
                const developer = developers?.find((dev: any) => dev.id === app.developer_id)

                return {
                    ...app,
                    developer: developer || {
                        id: app.developer_id,
                        first_name: null,
                        last_name: null,
                        email: 'Unknown User',
                        avatar_url: null,
                        bio: null,
                        skills: [],
                        portfolio: null,
                        github: null,
                        linkedin: null
                    },
                    project: app.project || {
                        id: app.project_id,
                        title: 'Unknown Project',
                        organization_id: '',
                        status: 'unknown',
                        organization: {
                            id: '',
                            organization_name: 'Unknown Organization',
                            avatar_url: null
                        }
                    }
                }
            })

            return applicationsWithDevelopers
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
            // First get applications
            const { data: applications, error: appsError } = await supabase
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
                    )
                `)
                .eq('developer_id', developerId)
                .order('created_at', { ascending: false })

            if (appsError) throw appsError

            if (!applications || applications.length === 0) {
                return []
            }

            // Get developer profile (since we know the developerId)
            const { data: developer, error: devError } = await supabase
                .from('profiles')
                .select(`
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
                `)
                .eq('id', developerId)
                .single()

            if (devError && devError.code !== 'PGRST116') throw devError

            // Combine applications with developer data
            const applicationsWithDeveloper = applications.map((app: any) => ({
                ...app,
                developer: developer || {
                    id: app.developer_id,
                    first_name: null,
                    last_name: null,
                    email: 'Unknown User',
                    avatar_url: null,
                    bio: null,
                    skills: [],
                    portfolio: null,
                    github: null,
                    linkedin: null
                },
                project: app.project || {
                    id: app.project_id,
                    title: 'Unknown Project',
                    organization_id: '',
                    status: 'unknown',
                    organization: {
                        id: '',
                        organization_name: 'Unknown Organization',
                        avatar_url: null
                    }
                }
            }))

            return applicationsWithDeveloper
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
            // First get the application
            const { data: application, error: appError } = await supabase
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
                    )
                `)
                .eq('id', applicationId)
                .single()

            if (appError && appError.code !== 'PGRST116') throw appError
            if (!application) return null

            // Get developer profile
            const { data: developer, error: devError } = await supabase
                .from('profiles')
                .select(`
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
                `)
                .eq('id', application.developer_id)
                .single()

            if (devError && devError.code !== 'PGRST116') throw devError

            // Combine application with developer data
            const applicationWithDetails = {
                ...application,
                developer: developer || {
                    id: application.developer_id,
                    first_name: null,
                    last_name: null,
                    email: 'Unknown User',
                    avatar_url: null,
                    bio: null,
                    skills: [],
                    portfolio: null,
                    github: null,
                    linkedin: null
                },
                project: application.project || {
                    id: application.project_id,
                    title: 'Unknown Project',
                    organization_id: '',
                    status: 'unknown',
                    organization: {
                        id: '',
                        organization_name: 'Unknown Organization',
                        avatar_url: null
                    }
                }
            }

            return applicationWithDetails
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
            // First update the application status
            const { data: updatedApp, error: updateError } = await supabase
                .from('applications')
                .update({
                    status,
                    updated_at: new Date().toISOString()
                })
                .eq('id', applicationId)
                .select()
                .single()

            if (updateError) throw updateError
            if (!updatedApp) throw new Error('Failed to update application')

            // Get project and organization details for notification
            const { data: project, error: projectError } = await supabase
                .from('projects')
                .select(`
                    id,
                    title,
                    organization_id,
                    organization:profiles!projects_organization_id_fkey(
                        id,
                        organization_name
                    )
                `)
                .eq('id', updatedApp.project_id)
                .single()

            if (projectError) {
                console.error('Error fetching project for notification:', projectError)
            }

            // Send notification to developer about status change
            try {
                if (project && project.organization) {
                    console.log('Sending notification to developer:', {
                        developerId: updatedApp.developer_id,
                        organizationName: project.organization.organization_name,
                        projectTitle: project.title,
                        status: status
                    })

                    await notificationService.notifyApplicationStatusChange(
                        updatedApp.developer_id,
                        project.organization.organization_name || 'Organization',
                        project.title,
                        status,
                        project.id
                    )

                    console.log('Notification sent successfully')
                } else {
                    console.error('Missing project or organization data for notification:', { project })
                }
            } catch (notificationError) {
                console.error('Failed to send status notification:', notificationError)
                // Don't fail the status update if notification fails
            }

            return updatedApp
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