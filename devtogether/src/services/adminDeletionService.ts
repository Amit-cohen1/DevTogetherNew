import { supabase } from '../utils/supabase';

export interface DeletionAnalysis {
  safe_to_delete: boolean;
  impact_summary: string;
  deletion_impact: 'minimal' | 'low' | 'medium' | 'high';
  dependencies: {
    projects?: number;
    applications?: number;
    messages?: number;
    team_memberships?: number;
    active_projects?: number;
    pending_applications?: number;
    team_activities?: number;
  };
  warnings: string[];
  target_info: {
    id: string;
    name: string;
    email?: string;
    type: 'organization' | 'project' | 'developer';
    verified?: boolean;
    member_since?: string;
    experience_level?: string;
    active_projects_list?: string[];
    action_required?: string;
  };
}

export interface DeletionResult {
  success: boolean;
  message: string;
  audit_id?: string;
  errors?: string[];
}

class AdminDeletionService {
  // Verify current user has admin access
  async verifyAdminAccess(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Check if user has admin role by querying profiles table directly
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Admin verification failed:', error);
        return false;
      }

      return profile?.role === 'admin';
    } catch (error) {
      console.error('Admin verification failed:', error);
      return false;
    }
  }

  // Analyze organization deletion impact
  async analyzeOrganizationDeletion(orgId: string): Promise<DeletionAnalysis> {
    try {
      // Use enhanced backend function for comprehensive analysis
      const { data: impactData, error } = await supabase.rpc('get_org_deletion_impact', { 
        org_id: orgId 
      });

      if (error) {
        throw new Error(`Backend analysis failed: ${error.message}`);
      }

      if (impactData.error) {
        throw new Error(impactData.error);
      }

      // Generate warnings based on enhanced data
      const warnings: string[] = [];
      if (impactData.active_projects > 0) {
        warnings.push(`This organization has ${impactData.active_projects} active project(s) that will be affected`);
      }
      if (impactData.pending_applications > 0) {
        warnings.push(`${impactData.pending_applications} pending application(s) will be affected`);
      }
      if (impactData.projects_count > 0) {
        warnings.push(`${impactData.projects_count} total project(s) will be deleted`);
      }

      return {
        safe_to_delete: impactData.safe_to_delete,
        impact_summary: `Organization "${impactData.organization_name}" - Impact: ${impactData.deletion_impact}`,
        deletion_impact: impactData.deletion_impact,
        dependencies: {
          projects: impactData.projects_count,
          applications: impactData.applications_count,
          messages: impactData.messages_count,
          active_projects: impactData.active_projects,
          pending_applications: impactData.pending_applications
        },
        warnings,
        target_info: {
          id: orgId,
          name: impactData.organization_name,
          email: impactData.organization_email,
          type: 'organization',
          verified: impactData.organization_verified,
          member_since: impactData.member_since
        }
      };
    } catch (error) {
      console.error('Organization analysis failed:', error);
      throw new Error(`Failed to analyze organization: ${(error as Error).message}`);
    }
  }

  // Analyze project deletion impact
  async analyzeProjectDeletion(projectId: string): Promise<DeletionAnalysis> {
    try {
      // Use enhanced backend function for comprehensive analysis
      const { data: impactData, error } = await supabase.rpc('get_project_deletion_impact', { 
        target_project_id: projectId 
      });

      if (error) {
        throw new Error(`Backend analysis failed: ${error.message}`);
      }

      if (impactData.error) {
        throw new Error(impactData.error);
      }

      // Generate warnings based on enhanced data
      const warnings: string[] = [];
      if (impactData.active_applications > 0) {
        warnings.push(`${impactData.active_applications} team member(s) will lose access to this project`);
      }
      if (impactData.messages_count > 0) {
        warnings.push(`${impactData.messages_count} chat message(s) will be deleted`);
      }
      if (impactData.team_activities_count > 0) {
        warnings.push(`${impactData.team_activities_count} team activity record(s) will be deleted`);
      }

      return {
        safe_to_delete: impactData.safe_to_delete,
        impact_summary: `Project "${impactData.project_title}" - Impact: ${impactData.deletion_impact}`,
        deletion_impact: impactData.deletion_impact,
        dependencies: {
          applications: impactData.applications_count,
          messages: impactData.messages_count,
          team_memberships: impactData.active_applications,
          team_activities: impactData.team_activities_count
        },
        warnings,
        target_info: {
          id: projectId,
          name: impactData.project_title,
          type: 'project'
        }
      };
    } catch (error) {
      console.error('Project analysis failed:', error);
      throw new Error(`Failed to analyze project: ${(error as Error).message}`);
    }
  }

  // Analyze developer deletion impact
  async analyzeDeveloperDeletion(devId: string): Promise<DeletionAnalysis> {
    try {
      // Use enhanced backend function for comprehensive analysis
      const { data: impactData, error } = await supabase.rpc('get_developer_deletion_impact', { 
        target_developer_id: devId 
      });

      if (error) {
        throw new Error(`Backend analysis failed: ${error.message}`);
      }

      if (impactData.error) {
        throw new Error(impactData.error);
      }

      // Generate warnings based on enhanced data
      const warnings: string[] = [];
      if (impactData.active_applications > 0) {
        warnings.push(`${impactData.active_applications} active application(s) will be withdrawn`);
      }
      if (impactData.messages_count > 0) {
        warnings.push(`${impactData.messages_count} chat message(s) will be orphaned`);
      }
      if (impactData.active_projects?.length > 0) {
        warnings.push(`Active in projects: ${impactData.active_projects.join(', ')}`);
      }

      return {
        safe_to_delete: impactData.safe_to_delete,
        impact_summary: `Developer "${impactData.developer_name}" - Impact: ${impactData.deletion_impact}`,
        deletion_impact: impactData.deletion_impact,
        dependencies: {
          applications: impactData.applications_count,
          messages: impactData.messages_count,
          team_memberships: impactData.active_applications
        },
        warnings,
        target_info: {
          id: devId,
          name: impactData.developer_name,
          email: impactData.developer_email,
          type: 'developer',
          member_since: impactData.member_since,
          experience_level: impactData.experience_level,
          active_projects_list: impactData.active_projects,
          action_required: impactData.action_required
        }
      };
    } catch (error) {
      console.error('Developer analysis failed:', error);
      throw new Error(`Failed to analyze developer: ${(error as Error).message}`);
    }
  }

  // Perform safe organization deletion
  async safeDeleteOrganization(orgId: string, reason: string): Promise<DeletionResult> {
    try {
      // Verify admin access
      if (!await this.verifyAdminAccess()) {
        throw new Error('Admin access required');
      }

      // Analyze impact first
      const analysis = await this.analyzeOrganizationDeletion(orgId);
      if (!analysis.safe_to_delete) {
        return {
          success: false,
          message: 'Organization cannot be safely deleted due to dependencies',
          errors: analysis.warnings
        };
      }

      // Log the deletion attempt
      const { data: { user } } = await supabase.auth.getUser();
      const { data: auditId } = await supabase.rpc('log_admin_deletion', {
        deletion_type: 'organization',
        target_id: orgId,
        admin_id: user?.id,
        reason,
        cascade_details: { analysis }
      });

      // Completely delete the organization (profile + auth record)
      const { data: deletionResult, error } = await supabase
        .rpc('admin_complete_user_deletion', { user_id: orgId });

      if (error || !deletionResult?.success) {
        throw new Error(deletionResult?.error || 'Failed to delete organization');
      }

      return {
        success: true,
        message: `Organization "${analysis.target_info.name}" deleted successfully`,
        audit_id: auditId
      };
    } catch (error) {
      console.error('Organization deletion failed:', error);
      return {
        success: false,
        message: 'Failed to delete organization',
        errors: [(error as Error).message]
      };
    }
  }

  // Perform safe project deletion
  async safeDeleteProject(projectId: string, reason: string): Promise<DeletionResult> {
    try {
      // Verify admin access
      if (!await this.verifyAdminAccess()) {
        throw new Error('Admin access required');
      }

      // Analyze impact
      const analysis = await this.analyzeProjectDeletion(projectId);

      // Log the deletion attempt
      const { data: { user } } = await supabase.auth.getUser();
      const { data: auditId } = await supabase.rpc('log_admin_deletion', {
        deletion_type: 'project',
        target_id: projectId,
        admin_id: user?.id,
        reason,
        cascade_details: { analysis }
      });

      // Delete related data first (due to foreign key constraints)
      // Delete team activities
      await supabase.from('team_activities').delete().eq('project_id', projectId);
      
      // Delete messages
      await supabase.from('messages').delete().eq('project_id', projectId);
      
      // Delete applications
      await supabase.from('applications').delete().eq('project_id', projectId);
      
      // Delete the project
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) {
        throw error;
      }

      return {
        success: true,
        message: `Project "${analysis.target_info.name}" deleted successfully`,
        audit_id: auditId
      };
    } catch (error) {
      console.error('Project deletion failed:', error);
      return {
        success: false,
        message: 'Failed to delete project',
        errors: [(error as Error).message]
      };
    }
  }

  // Perform safe developer deletion
  async safeDeleteDeveloper(devId: string, reason: string): Promise<DeletionResult> {
    try {
      // Verify admin access
      if (!await this.verifyAdminAccess()) {
        throw new Error('Admin access required');
      }

      // Analyze impact
      const analysis = await this.analyzeDeveloperDeletion(devId);

      // Log the deletion attempt
      const { data: { user } } = await supabase.auth.getUser();
      const { data: auditId } = await supabase.rpc('log_admin_deletion', {
        deletion_type: 'developer',
        target_id: devId,
        admin_id: user?.id,
        reason,
        cascade_details: { analysis }
      });

      // Withdraw active applications first
      await supabase
        .from('applications')
        .update({ status: 'withdrawn' })
        .eq('developer_id', devId)
        .in('status', ['pending', 'accepted']);

      // Completely delete the developer (profile + auth record)
      const { data: deletionResult, error } = await supabase
        .rpc('admin_complete_user_deletion', { user_id: devId });

      if (error || !deletionResult?.success) {
        throw new Error(deletionResult?.error || 'Failed to delete developer');
      }

      return {
        success: true,
        message: `Developer "${analysis.target_info.name}" deleted successfully`,
        audit_id: auditId
      };
    } catch (error) {
      console.error('Developer deletion failed:', error);
      return {
        success: false,
        message: 'Failed to delete developer',
        errors: [(error as Error).message]
      };
    }
  }
}

export const adminDeletionService = new AdminDeletionService(); 