import { supabase } from '../utils/supabase'
import {
    User,
    OrganizationImage,
    OrganizationMetric,
    DeveloperTestimonial,
    OrganizationProfileData,
    ProjectWithTeamMembers,
    ImageCategory,
    MetricType,
    Profile,
    OrganizationStatus
} from '../types/database'
import { projectService } from './projects'

export async function getOrganizationProfile(orgId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', orgId)
    .single();
  if (error) return null;
  return data as Profile;
}

export async function approveOrganization(orgId: string): Promise<boolean> {
  const { error } = await supabase
    .from('profiles')
    .update({
      organization_status: 'approved',
      organization_rejection_reason: null,
      can_resubmit: true,
      organization_verified: true, // for backward compatibility
      organization_verified_at: new Date().toISOString(),
    })
    .eq('id', orgId);
  return !error;
}

export async function rejectOrganization(orgId: string, reason: string, canResubmit = true): Promise<boolean> {
  const { error } = await supabase
    .from('profiles')
    .update({
      organization_status: 'rejected',
      organization_rejection_reason: reason,
      can_resubmit: canResubmit,
      organization_verified: false,
    })
    .eq('id', orgId);
  return !error;
}

export async function blockOrganization(orgId: string, reason?: string): Promise<boolean> {
  const { error } = await supabase
    .from('profiles')
    .update({
      organization_status: 'blocked',
      organization_rejection_reason: reason || 'Blocked by admin',
      can_resubmit: false,
      organization_verified: false,
    })
    .eq('id', orgId);
  return !error;
}

export async function resubmitOrganization(orgId: string, updatedData: Partial<Profile>): Promise<boolean> {
  // Only allow if current status is 'rejected' and can_resubmit is true
  const { data, error: fetchError } = await supabase
    .from('profiles')
    .select('organization_status, can_resubmit')
    .eq('id', orgId)
    .single();
  if (fetchError || !data || data.organization_status !== 'rejected' || !data.can_resubmit) return false;

  const { error } = await supabase
    .from('profiles')
    .update({
      ...updatedData,
      organization_status: 'pending',
      organization_rejection_reason: null,
    })
    .eq('id', orgId);
  return !error;
}

// Utility: check if org is approved
export function isOrganizationApproved(profile: Profile): boolean {
  return profile.organization_status === 'approved';
}

// Utility: check if org is blocked
export function isOrganizationBlocked(profile: Profile): boolean {
  return profile.organization_status === 'blocked';
}

// Utility: check if org is rejected
export function isOrganizationRejected(profile: Profile): boolean {
  return profile.organization_status === 'rejected';
}

// Utility: check if org is pending
export function isOrganizationPending(profile: Profile): boolean {
  return profile.organization_status === 'pending';
}

// Fetch the count of organizations
export async function getOrganizationCount(): Promise<number> {
  const { count, error } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'organization');
  if (error) {
    console.error('Error fetching organization count:', error);
    return 0;
  }
  return count || 0;
}

// Fetch the count of developers
export async function getDeveloperCount(): Promise<number> {
  const { count, error } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'developer');
  if (error) {
    console.error('Error fetching developer count:', error);
    return 0;
  }
  return count || 0;
}

class OrganizationProfileService {
    // Get complete organization profile data
    async getOrganizationProfileData(organizationId: string): Promise<OrganizationProfileData | null> {
        try {
            // Get organization profile
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', organizationId)
                .eq('role', 'organization')
                .single()

            if (profileError || !profile) {
                console.error('Error fetching organization profile:', profileError)
                return null
            }

            // Get all related data in parallel
            const [images, metrics, testimonials, projects, stats] = await Promise.all([
                this.getOrganizationImages(organizationId),
                this.getOrganizationMetrics(organizationId),
                this.getOrganizationTestimonials(organizationId),
                projectService.getProjectsWithTeamMembers({ organization_id: organizationId }),
                this.getOrganizationStats(organizationId)
            ])

            return {
                profile,
                images: images || [],
                metrics: metrics || [],
                testimonials: testimonials || [],
                projects: projects || [],
                stats: stats || {
                    totalProjects: 0,
                    activeProjects: 0,
                    completedProjects: 0,
                    totalDevelopers: 0,
                    successRate: 0
                }
            }
        } catch (error) {
            console.error('Error fetching organization profile data:', error)
            return null
        }
    }

    // Get organization images by category
    async getOrganizationImages(organizationId: string, category?: ImageCategory): Promise<OrganizationImage[] | null> {
        try {
            let query = supabase
                .from('organization_images')
                .select('*')
                .eq('organization_id', organizationId)
                .order('display_order', { ascending: true })
                .order('created_at', { ascending: false })

            if (category) {
                query = query.eq('category', category)
            }

            const { data, error } = await query

            if (error) {
                console.error('Error fetching organization images:', error)
                return []
            }

            return data || []
        } catch (error) {
            console.error('Error fetching organization images:', error)
            return []
        }
    }

    // Upload organization image
    async uploadOrganizationImage(
        organizationId: string,
        file: File,
        category: ImageCategory,
        title?: string,
        description?: string
    ): Promise<{ success: boolean; image?: OrganizationImage; error?: string }> {
        try {
            // Validate file
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                return { success: false, error: 'File size must be less than 10MB' }
            }

            if (!file.type.startsWith('image/')) {
                return { success: false, error: 'Please select an image file' }
            }

            // Generate unique filename
            const fileExt = file.name.split('.').pop()
            const fileName = `${organizationId}/gallery/${category}-${Date.now()}.${fileExt}`

            // Upload to Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('organization-images')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                })

            if (uploadError) {
                console.error('Upload error:', uploadError)
                return { success: false, error: `Upload failed: ${uploadError.message}` }
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('organization-images')
                .getPublicUrl(uploadData.path)

            // Save to database
            const { data: imageData, error: dbError } = await supabase
                .from('organization_images')
                .insert({
                    organization_id: organizationId,
                    image_url: publicUrl,
                    category,
                    title,
                    description,
                    display_order: 0
                })
                .select()
                .single()

            if (dbError) {
                console.error('Database error:', dbError)
                // Try to clean up uploaded file
                await supabase.storage.from('organization-images').remove([uploadData.path])
                return { success: false, error: 'Failed to save image information' }
            }

            return { success: true, image: imageData }
        } catch (error) {
            console.error('Error uploading organization image:', error)
            return { success: false, error: 'Upload failed. Please try again.' }
        }
    }

    // Delete organization image
    async deleteOrganizationImage(imageId: string): Promise<{ success: boolean; error?: string }> {
        try {
            // Get image data first to get the file path
            const { data: image, error: fetchError } = await supabase
                .from('organization_images')
                .select('image_url')
                .eq('id', imageId)
                .single()

            if (fetchError || !image) {
                return { success: false, error: 'Image not found' }
            }

            // Extract file path from URL
            const urlParts = image.image_url.split('/organization-images/')
            const filePath = urlParts[1]

            // Delete from database first
            const { error: dbError } = await supabase
                .from('organization_images')
                .delete()
                .eq('id', imageId)

            if (dbError) {
                console.error('Database delete error:', dbError)
                return { success: false, error: 'Failed to delete image' }
            }

            // Delete from storage
            if (filePath) {
                await supabase.storage
                    .from('organization-images')
                    .remove([filePath])
            }

            return { success: true }
        } catch (error) {
            console.error('Error deleting organization image:', error)
            return { success: false, error: 'Delete failed. Please try again.' }
        }
    }

    // Get organization metrics
    async getOrganizationMetrics(organizationId: string): Promise<OrganizationMetric[] | null> {
        try {
            const { data, error } = await supabase
                .from('organization_metrics')
                .select('*')
                .eq('organization_id', organizationId)
                .order('display_order', { ascending: true })
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Error fetching organization metrics:', error)
                return []
            }

            return data || []
        } catch (error) {
            console.error('Error fetching organization metrics:', error)
            return []
        }
    }

    // Save organization metric
    async saveOrganizationMetric(
        organizationId: string,
        metricName: string,
        metricValue: string,
        metricType: MetricType
    ): Promise<{ success: boolean; metric?: OrganizationMetric; error?: string }> {
        try {
            const { data, error } = await supabase
                .from('organization_metrics')
                .upsert({
                    organization_id: organizationId,
                    metric_name: metricName,
                    metric_value: metricValue,
                    metric_type: metricType,
                    display_order: 0
                })
                .select()
                .single()

            if (error) {
                console.error('Error saving organization metric:', error)
                return { success: false, error: 'Failed to save metric' }
            }

            return { success: true, metric: data }
        } catch (error) {
            console.error('Error saving organization metric:', error)
            return { success: false, error: 'Save failed. Please try again.' }
        }
    }

    // Get organization testimonials
    async getOrganizationTestimonials(organizationId: string, featured?: boolean): Promise<DeveloperTestimonial[] | null> {
        try {
            let query = supabase
                .from('developer_testimonials')
                .select(`
                    *,
                    developer:profiles!developer_testimonials_developer_id_fkey(*),
                    project:projects!developer_testimonials_project_id_fkey(*)
                `)
                .eq('organization_id', organizationId)
                .order('created_at', { ascending: false })

            if (featured !== undefined) {
                query = query.eq('is_featured', featured)
            }

            const { data, error } = await query

            if (error) {
                console.error('Error fetching organization testimonials:', error)
                return []
            }

            return data || []
        } catch (error) {
            console.error('Error fetching organization testimonials:', error)
            return []
        }
    }

    // Get organization statistics
    async getOrganizationStats(organizationId: string): Promise<{
        totalProjects: number
        activeProjects: number
        completedProjects: number
        totalDevelopers: number
        successRate: number
    } | null> {
        try {
            // Get project statistics
            const { data: projects, error: projectsError } = await supabase
                .from('projects')
                .select('id, status')
                .eq('organization_id', organizationId)

            if (projectsError) {
                console.error('Error fetching project stats:', projectsError)
                return null
            }

            const totalProjects = projects?.length || 0
            const activeProjects = projects?.filter((p: any) => p.status === 'in_progress').length || 0
            const completedProjects = projects?.filter((p: any) => p.status === 'completed').length || 0

            // Get unique developers who have worked with this organization
            const { data: applications, error: applicationsError } = await supabase
                .from('applications')
                .select('developer_id, project_id, projects!inner(organization_id)')
                .eq('status', 'accepted')
                .eq('projects.organization_id', organizationId)

            if (applicationsError) {
                console.error('Error fetching developer stats:', applicationsError)
            }

            const uniqueDevelopers = new Set(applications?.map((app: any) => app.developer_id) || [])
            const totalDevelopers = uniqueDevelopers.size

            // Calculate success rate (completed projects / total projects)
            const successRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0

            return {
                totalProjects,
                activeProjects,
                completedProjects,
                totalDevelopers,
                successRate
            }
        } catch (error) {
            console.error('Error calculating organization stats:', error)
            return null
        }
    }

    // Update image order
    async updateImageOrder(imageId: string, newOrder: number): Promise<{ success: boolean; error?: string }> {
        try {
            const { error } = await supabase
                .from('organization_images')
                .update({ display_order: newOrder })
                .eq('id', imageId)

            if (error) {
                console.error('Error updating image order:', error)
                return { success: false, error: 'Failed to update image order' }
            }

            return { success: true }
        } catch (error) {
            console.error('Error updating image order:', error)
            return { success: false, error: 'Update failed. Please try again.' }
        }
    }

    // Update metric order
    async updateMetricOrder(metricId: string, newOrder: number): Promise<{ success: boolean; error?: string }> {
        try {
            const { error } = await supabase
                .from('organization_metrics')
                .update({ display_order: newOrder })
                .eq('id', metricId)

            if (error) {
                console.error('Error updating metric order:', error)
                return { success: false, error: 'Failed to update metric order' }
            }

            return { success: true }
        } catch (error) {
            console.error('Error updating metric order:', error)
            return { success: false, error: 'Update failed. Please try again.' }
        }
    }
}

export const organizationProfileService = new OrganizationProfileService() 