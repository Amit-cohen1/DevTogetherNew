import { supabase } from '../utils/supabase'

export interface PendingOrganization {
  id: string
  email: string
  organization_name: string
  bio?: string
  website?: string
  location?: string
  created_at: string
  organization_verified: boolean
  organization_verified_at?: string
  organization_verified_by?: string
  organization_rejection_reason?: string
}

export interface PartnerApplication {
  id: string
  organization_id: string
  company_size: string
  industry: string
  why_partner: string
  website: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  reviewed_at?: string
  reviewed_by?: string
  organization?: {
    email: string
    organization_name: string
    bio?: string
  }
}

export interface AdminStats {
  totalOrganizations: number
  verifiedOrganizations: number
  pendingOrganizations: number
  rejectedOrganizations: number
  totalPartnerApplications: number
  pendingPartnerApplications: number
  totalProjects: number
  totalDevelopers: number
}

class AdminService {
  // Get admin statistics
  async getAdminStats(): Promise<AdminStats> {
    try {
      // Get organization stats
      const { data: orgStats } = await supabase
        .from('profiles')
        .select('organization_verified')
        .eq('role', 'organization')

      // Get partner application stats
      const { data: partnerStats } = await supabase
        .from('partner_applications')
        .select('status')

      // Get total projects
      const { count: totalProjects } = await supabase
        .from('projects')
        .select('*', { count: 'exact' })

      // Get total developers
      const { count: totalDevelopers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .eq('role', 'developer')

      const totalOrganizations = orgStats?.length || 0
      const verifiedOrganizations = orgStats?.filter((org: any) => org.organization_verified === true).length || 0
      const pendingOrganizations = orgStats?.filter((org: any) => org.organization_verified === false).length || 0
      const rejectedOrganizations = orgStats?.filter((org: any) => org.organization_rejection_reason !== null).length || 0

      const totalPartnerApplications = partnerStats?.length || 0
      const pendingPartnerApplications = partnerStats?.filter((app: any) => app.status === 'pending').length || 0

      return {
        totalOrganizations,
        verifiedOrganizations,
        pendingOrganizations,
        rejectedOrganizations,
        totalPartnerApplications,
        pendingPartnerApplications,
        totalProjects: totalProjects || 0,
        totalDevelopers: totalDevelopers || 0
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error)
      throw error
    }
  }

  // Get pending organizations
  async getPendingOrganizations(): Promise<PendingOrganization[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'organization')
        .eq('organization_verified', false)
        .is('organization_rejection_reason', null)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching pending organizations:', error)
      throw error
    }
  }

  // Get all organizations with status
  async getAllOrganizations(): Promise<PendingOrganization[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'organization')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching organizations:', error)
      throw error
    }
  }

  // Approve organization
  async approveOrganization(organizationId: string, adminId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          organization_verified: true,
          organization_verified_at: new Date().toISOString(),
          organization_verified_by: adminId,
          organization_rejection_reason: null
        })
        .eq('id', organizationId)

      if (error) throw error
    } catch (error) {
      console.error('Error approving organization:', error)
      throw error
    }
  }

  // Reject organization
  async rejectOrganization(organizationId: string, adminId: string, reason: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          organization_verified: false,
          organization_verified_at: null,
          organization_verified_by: adminId,
          organization_rejection_reason: reason
        })
        .eq('id', organizationId)

      if (error) throw error
    } catch (error) {
      console.error('Error rejecting organization:', error)
      throw error
    }
  }

  // Get partner applications
  async getPartnerApplications(): Promise<PartnerApplication[]> {
    try {
      const { data, error } = await supabase
        .from('partner_applications')
        .select(`
          *,
          organization:organization_id (
            email,
            organization_name,
            bio
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching partner applications:', error)
      throw error
    }
  }

  // Approve partner application
  async approvePartnerApplication(applicationId: string, adminId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('partner_applications')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: adminId
        })
        .eq('id', applicationId)

      if (error) throw error
    } catch (error) {
      console.error('Error approving partner application:', error)
      throw error
    }
  }

  // Reject partner application
  async rejectPartnerApplication(applicationId: string, adminId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('partner_applications')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: adminId
        })
        .eq('id', applicationId)

      if (error) throw error
    } catch (error) {
      console.error('Error rejecting partner application:', error)
      throw error
    }
  }

  // Check if user is admin
  async isUserAdmin(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', userId)
        .single()

      if (error) throw error
      return data?.is_admin || false
    } catch (error) {
      console.error('Error checking admin status:', error)
      return false
    }
  }

  // Grant admin access
  async grantAdminAccess(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: true })
        .eq('id', userId)

      if (error) throw error
    } catch (error) {
      console.error('Error granting admin access:', error)
      throw error
    }
  }

  // Revoke admin access
  async revokeAdminAccess(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: false })
        .eq('id', userId)

      if (error) throw error
    } catch (error) {
      console.error('Error revoking admin access:', error)
      throw error
    }
  }
}

export const adminService = new AdminService() 