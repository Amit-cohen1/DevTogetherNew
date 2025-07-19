import { supabase } from '../utils/supabase'
import { toastService } from './toastService';

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
  onboarding_complete?: boolean
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
  pendingProjects: number
  totalDevelopers: number
}

class AdminService {
  // Get admin statistics
  async getAdminStats(): Promise<AdminStats> {
    try {
      // Get organization stats using organization_status (fixed)
      const { data: orgStats } = await supabase
        .from('profiles')
        .select('organization_status, organization_verified')
        .eq('role', 'organization')

      // Get partner application stats
      const { data: partnerStats } = await supabase
        .from('partner_applications')
        .select('status')

      // Get total projects
      const { count: totalProjects } = await supabase
        .from('projects')
        .select('*', { count: 'exact' })

      // Get pending projects
      const { count: pendingProjects } = await supabase
        .from('projects')
        .select('*', { count: 'exact' })
        .eq('status', 'pending')

      // Get total developers
      const { count: totalDevelopers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .eq('role', 'developer')

      const totalOrganizations = orgStats?.length || 0
      const verifiedOrganizations = orgStats?.filter((org: any) => org.organization_status === 'approved').length || 0
      const pendingOrganizations = orgStats?.filter((org: any) => (org.organization_status === 'pending' || org.organization_status === null)).length || 0
      const rejectedOrganizations = orgStats?.filter((org: any) => org.organization_status === 'rejected').length || 0

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
        pendingProjects: pendingProjects || 0,
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
      const { error } = await supabase.rpc('approve_organization', {
        p_organization_id: organizationId,
        p_admin_id: adminId,
      })

      if (error) throw error
      toastService.success('Organization approved.');
    } catch (error) {
      console.error('Error approving organization:', error)
      toastService.error('Failed to approve organization.');
      throw error
    }
  }

  // Reject organization
  async rejectOrganization(organizationId: string, adminId: string, reason: string, canResubmit: boolean): Promise<void> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          organization_status: 'rejected',
          organization_rejection_reason: reason,
          can_resubmit: canResubmit,
          organization_verified: false,
        })
        .eq('id', organizationId);

      if (error) throw error
      toastService.info('Organization rejected.');
    } catch (error) {
      console.error('Error rejecting organization:', error)
      toastService.error('Failed to reject organization.');
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
      toastService.success('Partner application approved.');
    } catch (error) {
      console.error('Error approving partner application:', error)
      toastService.error('Failed to approve partner application.');
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
      toastService.info('Partner application rejected.');
    } catch (error) {
      console.error('Error rejecting partner application:', error)
      toastService.error('Failed to reject partner application.');
      throw error
    }
  }

  // Check if user is admin
  async isUserAdmin(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()

      if (error) throw error
      return data?.role === 'admin'
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
        .update({ role: 'admin' })
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
        .update({ role: 'developer' })
        .eq('id', userId)

      if (error) throw error
    } catch (error) {
      console.error('Error revoking admin access:', error)
      throw error
    }
  }

  // Block developer
  async blockDeveloper(userId: string, reason: string): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({ blocked: true, blocked_reason: reason })
      .eq('id', userId)
      .eq('role', 'developer');
    if (error) throw error;
    await toastService.info('Developer blocked.');
    // Optionally: send notification to user
  }

  // Unblock developer
  async unblockDeveloper(userId: string): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({ blocked: false, blocked_reason: null })
      .eq('id', userId)
      .eq('role', 'developer');
    if (error) throw error;
    await toastService.info('Developer unblocked.');
    // Optionally: send notification to user
  }

  // Block organization (direct update)
  async blockOrganization(orgId: string, reason: string): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({ organization_status: 'blocked', blocked_reason: reason })
      .eq('id', orgId)
      .eq('role', 'organization');
    if (error) throw error;
    await toastService.info('Organization blocked.');
  }

  // Unblock organization (direct update)
  async unblockOrganization(orgId: string): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({ organization_status: 'approved', blocked_reason: null })
      .eq('id', orgId)
      .eq('role', 'organization');
    if (error) throw error;
    await toastService.info('Organization unblocked.');
  }

  // Block project
  async blockProject(projectId: string, reason: string): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .update({ blocked: true, blocked_reason: reason })
      .eq('id', projectId);
    if (error) throw error;
    await toastService.info('Project blocked.');
    // Optionally: send notification to org/team
  }

  // Unblock project
  async unblockProject(projectId: string): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .update({ blocked: false, blocked_reason: null })
      .eq('id', projectId);
    if (error) throw error;
    await toastService.info('Project unblocked.');
    // Optionally: send notification to org/team
  }

  // Get all developers (excluding admins)
  async getAllDevelopers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email, blocked, blocked_reason, role')
      .eq('role', 'developer');
    return { data, error };
  }
}

export const adminService = new AdminService() 