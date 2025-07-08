import { supabase } from '../utils/supabase';
import { User } from '../types/database';
import { projectService } from './projects';
import type { TeamMember as DatabaseTeamMember } from '../types/database';
import { toastService } from './toastService';

export interface TeamMember {
    id: string;
    project_id: string;
    user_id: string;
    role: 'owner' | 'member';
    joined_at: string;
    status: 'active' | 'inactive';
    status_manager?: boolean; // Can this developer manage project status updates
    user: User;
}

export interface TeamActivity {
    id: string;
    project_id: string;
    user_id: string;
    activity_type: 'member_joined' | 'member_left' | 'member_removed' | 'project_updated' | 'message_sent' | 'milestone_reached';
    description: string;
    metadata?: Record<string, any>;
    created_at: string;
    user: User;
}

export interface TeamInvitation {
    id: string;
    project_id: string;
    email: string;
    invited_by: string;
    invited_at: string;
    status: 'pending' | 'accepted' | 'declined' | 'expired';
    expires_at: string;
}

export interface TeamStats {
    total_members: number;
    active_members: number;
    recent_activities: number;
    messages_count: number;
    completion_rate: number;
}

class TeamService {
    // Get team members for a project using the new team member structure
    async getTeamMembers(projectId: string): Promise<TeamMember[]> {
        try {
            // Use projectService to get unified team member data
            const projectsWithMembers = await projectService.getProjectsWithTeamMembers();
            const project = projectsWithMembers.find(p => p.id === projectId);

            if (!project) {
                throw new Error('Project not found');
            }

            // Convert new team member structure to legacy format for backward compatibility
            const legacyTeamMembers: TeamMember[] = project.team_members.map((member: DatabaseTeamMember) => {
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
                    is_admin: null,
                    organization_verified: null,
                    organization_verified_at: null,
                    organization_verified_by: null,
                    organization_rejection_reason: null,
                    onboarding_complete: null,
                    created_at: '',
                    updated_at: ''
                };

                return {
                    id: `${member.type}-${member.id}`,
                    project_id: projectId,
                    user_id: member.profile.id,
                    role: member.role === 'owner' ? 'owner' : 'member',
                    joined_at: member.joined_at || project.created_at,
                    status: 'active' as const,
                    status_manager: member.role === 'owner' || member.role === 'status_manager',
                    user
                };
            });

            return legacyTeamMembers;
        } catch (error) {
            console.error('Error fetching team members:', error);
            throw error;
        }
    }

    // Remove a team member (organization owners only)
    async removeMember(projectId: string, userId: string, currentUserId: string): Promise<void> {
        try {
            // Verify current user is the organization owner
            const { data: project, error: projectError } = await supabase
                .from('projects')
                .select('organization_id')
                .eq('id', projectId)
                .single();

            if (projectError) throw projectError;

            if (project.organization_id !== currentUserId) {
                throw new Error('Only organization owners can remove team members');
            }

            // Update application status to 'removed'
            const { error: updateError } = await supabase
                .from('applications')
                .update({
                    status: 'removed',
                    updated_at: new Date().toISOString()
                })
                .eq('project_id', projectId)
                .eq('developer_id', userId)
                .eq('status', 'accepted');

            if (updateError) throw updateError;

            // Log team activity
            await this.logActivity(projectId, currentUserId, 'member_removed',
                `Removed team member from project`, { removed_user_id: userId });

        } catch (error) {
            console.error('Error removing team member:', error);
            throw error;
        }
    }

    // Leave project (developers only)
    async leaveProject(projectId: string, userId: string): Promise<void> {
        try {
            // Update application status to 'withdrawn'
            const { error: updateError } = await supabase
                .from('applications')
                .update({
                    status: 'withdrawn',
                    updated_at: new Date().toISOString()
                })
                .eq('project_id', projectId)
                .eq('developer_id', userId)
                .eq('status', 'accepted');

            if (updateError) throw updateError;

            // Log team activity
            await this.logActivity(projectId, userId, 'member_left',
                `Left the project team`);

            toastService.project.left();
        } catch (error) {
            console.error('Error leaving project:', error);
            toastService.error('Failed to leave the project.');
            throw error;
        }
    }

    // Get team activities
    async getTeamActivities(projectId: string, limit: number = 20): Promise<TeamActivity[]> {
        try {
            const { data, error } = await supabase
                .from('team_activities')
                .select(`
                    *,
                    user:user_id (*)
                `)
                .eq('project_id', projectId)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching team activities:', error);
            throw error;
        }
    }

    // Log team activity
    async logActivity(
        projectId: string,
        userId: string,
        activityType: TeamActivity['activity_type'],
        description: string,
        metadata?: Record<string, any>
    ): Promise<void> {
        try {
            const { error } = await supabase
                .from('team_activities')
                .insert({
                    project_id: projectId,
                    user_id: userId,
                    activity_type: activityType,
                    description,
                    metadata,
                    created_at: new Date().toISOString()
                });

            if (error) throw error;
        } catch (error) {
            console.error('Error logging team activity:', error);
            // Don't throw - activity logging is not critical
        }
    }

    // Get team statistics
    async getTeamStats(projectId: string): Promise<TeamStats> {
        try {
            const teamMembers = await this.getTeamMembers(projectId);

            // Get recent activities count (last 7 days)
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const { data: recentActivities, error: activitiesError } = await supabase
                .from('team_activities')
                .select('id')
                .eq('project_id', projectId)
                .gte('created_at', sevenDaysAgo.toISOString());

            if (activitiesError) throw activitiesError;

            // Get messages count
            const { data: messages, error: messagesError } = await supabase
                .from('messages')
                .select('id')
                .eq('project_id', projectId);

            if (messagesError) throw messagesError;

            // Calculate completion rate based on project status and team engagement
            const completionRate = this.calculateCompletionRate(teamMembers.length,
                recentActivities?.length || 0, messages?.length || 0);

            return {
                total_members: teamMembers.length,
                active_members: teamMembers.filter(m => m.status === 'active').length,
                recent_activities: recentActivities?.length || 0,
                messages_count: messages?.length || 0,
                completion_rate: completionRate
            };
        } catch (error) {
            console.error('Error fetching team stats:', error);
            return {
                total_members: 0,
                active_members: 0,
                recent_activities: 0,
                messages_count: 0,
                completion_rate: 0
            };
        }
    }

    // Calculate project completion rate based on team engagement
    private calculateCompletionRate(memberCount: number, recentActivities: number, messageCount: number): number {
        if (memberCount === 0) return 0;

        // Simple algorithm based on team engagement
        const activityScore = Math.min(recentActivities * 5, 40); // Max 40 points for activities
        const messageScore = Math.min(messageCount * 2, 30); // Max 30 points for messages
        const teamSizeScore = Math.min(memberCount * 10, 30); // Max 30 points for team size

        return Math.min(activityScore + messageScore + teamSizeScore, 100);
    }

    // Send team invitation (future feature - placeholder)
    async sendInvitation(projectId: string, email: string, invitedBy: string): Promise<TeamInvitation> {
        try {
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

            const { data, error } = await supabase
                .from('team_invitations')
                .insert({
                    project_id: projectId,
                    email,
                    invited_by: invitedBy,
                    invited_at: new Date().toISOString(),
                    expires_at: expiresAt.toISOString(),
                    status: 'pending'
                })
                .select()
                .single();

            if (error) throw error;

            // Log activity
            await this.logActivity(projectId, invitedBy, 'member_joined',
                `Invited ${email} to join the team`, { invited_email: email });

            return data;
        } catch (error) {
            console.error('Error sending team invitation:', error);
            throw error;
        }
    }

    // Promote developer to status manager (organization owners only)
    async promoteDeveloper(projectId: string, developerId: string, currentUserId: string): Promise<void> {
        try {
            // Verify current user is the organization owner
            const { data: project, error: projectError } = await supabase
                .from('projects')
                .select('organization_id')
                .eq('id', projectId)
                .single();

            if (projectError) throw projectError;

            if (project.organization_id !== currentUserId) {
                throw new Error('Only organization owners can promote developers');
            }

            // Update application to set status_manager = true
            const { error: updateError } = await supabase
                .from('applications')
                .update({
                    status_manager: true,
                    updated_at: new Date().toISOString()
                })
                .eq('project_id', projectId)
                .eq('developer_id', developerId)
                .eq('status', 'accepted');

            if (updateError) throw updateError;

            // Log team activity
            await this.logActivity(projectId, currentUserId, 'project_updated',
                `Promoted developer to status manager`, { promoted_user_id: developerId });

        } catch (error) {
            console.error('Error promoting developer:', error);
            throw error;
        }
    }

    // Demote developer from status manager (organization owners only)
    async demoteDeveloper(projectId: string, developerId: string, currentUserId: string): Promise<void> {
        try {
            // Verify current user is the organization owner
            const { data: project, error: projectError } = await supabase
                .from('projects')
                .select('organization_id')
                .eq('id', projectId)
                .single();

            if (projectError) throw projectError;

            if (project.organization_id !== currentUserId) {
                throw new Error('Only organization owners can demote developers');
            }

            // Update application to set status_manager = false
            const { error: updateError } = await supabase
                .from('applications')
                .update({
                    status_manager: false,
                    updated_at: new Date().toISOString()
                })
                .eq('project_id', projectId)
                .eq('developer_id', developerId)
                .eq('status', 'accepted');

            if (updateError) throw updateError;

            // Log team activity
            await this.logActivity(projectId, currentUserId, 'project_updated',
                `Removed developer from status manager role`, { demoted_user_id: developerId });

        } catch (error) {
            console.error('Error demoting developer:', error);
            throw error;
        }
    }
}

export const teamService = new TeamService(); 