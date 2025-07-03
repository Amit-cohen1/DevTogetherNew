import { supabase } from '../utils/supabase';
import { User, Project, Application } from '../types/database';
import { dashboardService } from './dashboardService';

export interface ProfileStats {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalApplications: number;
    acceptedApplications: number;
    acceptanceRate: number;
    platformDays: number;
    profileViews: number;
    lastActivity: string;
}

export interface ProjectPortfolioItem {
    id: string;
    title: string;
    description: string;
    technologies: string[];
    status: 'active' | 'completed' | 'paused';
    role: string;
    organization: string;
    startDate: string;
    endDate?: string;
    outcomes?: string[];
    teamSize: number;
}

export interface SkillProficiency {
    skill: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    recentUsage: boolean;
    projectCount: number;
}

export interface ShareableProfile {
    shareToken: string;
    isPublic: boolean;
    shareUrl: string;
    qrCodeUrl: string;
}

class ProfileService {
    async getProfileStats(userId: string): Promise<ProfileStats> {
        try {
            // Get basic dashboard stats
            const dashboardStats = await dashboardService.getDeveloperStats(userId);

            // Try to get additional profile-specific data with fallback
            let profileViews = 0;
            let createdAt = new Date();
            let updatedAt = new Date();

            try {
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('created_at, profile_views, updated_at')
                    .eq('id', userId)
                    .single();

                if (error) {
                    console.warn('Profile data not accessible:', error);
                    // Try to get basic profile info
                    const { data: basicProfile } = await supabase
                        .from('profiles')
                        .select('created_at, updated_at')
                        .eq('id', userId)
                        .single();

                    if (basicProfile) {
                        createdAt = new Date(basicProfile.created_at);
                        updatedAt = new Date(basicProfile.updated_at || basicProfile.created_at);
                    }
                } else if (profile) {
                    profileViews = profile.profile_views || 0;
                    createdAt = new Date(profile.created_at);
                    updatedAt = new Date(profile.updated_at || profile.created_at);
                }
            } catch (profileError) {
                console.warn('Profile views not available (migration may be needed):', profileError);
                // Use fallback date
                createdAt = new Date();
                updatedAt = new Date();
            }

            // Calculate platform days
            const platformDays = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

            return {
                totalProjects: dashboardStats.activeProjects + dashboardStats.completedProjects,
                activeProjects: dashboardStats.activeProjects,
                completedProjects: dashboardStats.completedProjects,
                totalApplications: dashboardStats.totalApplications,
                acceptedApplications: dashboardStats.acceptedApplications,
                acceptanceRate: dashboardStats.acceptanceRate,
                platformDays,
                profileViews,
                lastActivity: updatedAt.toISOString()
            };
        } catch (error) {
            console.error('Error fetching profile stats:', error);
            throw error;
        }
    }

    async getProjectPortfolio(userId: string): Promise<ProjectPortfolioItem[]> {
        try {
            // Get projects where user is a team member or has accepted application
            const { data: applications, error } = await supabase
                .from('applications')
                .select(`
                    status,
                    created_at,
                    projects (
                        id,
                        title,
                        description,
                        technology_stack,
                        status,
                        created_at,
                        updated_at,
                        organization:organization_id (
                            organization_name
                        )
                    )
                `)
                .eq('developer_id', userId)
                .eq('status', 'accepted');

            if (error) {
                console.warn('Error fetching applications:', error);
                return [];
            }

            if (!applications) return [];

            return applications
                .filter((app: any) => app.projects)
                .map((app: any) => {
                    const project = app.projects;
                    return {
                        id: project.id,
                        title: project.title,
                        description: project.description,
                        technologies: project.technology_stack || [],
                        status: project.status === 'completed' ? 'completed' : 'active',
                        role: 'Developer', // Could be enhanced with specific roles
                        organization: project.organization?.organization_name || 'Unknown Organization',
                        startDate: app.created_at,
                        endDate: project.status === 'completed' ? project.updated_at : undefined,
                        teamSize: 1 // This would need team member count from workspace
                    };
                });
        } catch (error) {
            console.error('Error fetching project portfolio:', error);
            // Return empty array on error to prevent UI breaking
            return [];
        }
    }

    async getSkillProficiency(userId: string): Promise<SkillProficiency[]> {
        try {
            // Get user's skills from profile with fallback
            let skills: string[] = [];

            try {
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('skills')
                    .eq('id', userId)
                    .single();

                if (error) {
                    console.warn('Error fetching skills:', error);
                    return [];
                }

                skills = profile?.skills || [];
            } catch (skillsError) {
                console.warn('Skills column not available or user has no skills:', skillsError);
                return [];
            }

            if (!skills.length) return [];

            // Get projects with technologies to calculate skill usage
            let applications: any[] = [];

            try {
                const { data: appData, error } = await supabase
                    .from('applications')
                    .select(`
                        created_at,
                        status,
                        projects (technology_stack)
                    `)
                    .eq('developer_id', userId)
                    .eq('status', 'accepted');

                if (error) {
                    console.warn('Error fetching applications for skill calculation:', error);
                } else {
                    applications = appData || [];
                }
            } catch (applicationsError) {
                console.warn('Applications data not available:', applicationsError);
                // Continue with empty applications for basic skill display
            }

            // Calculate skill proficiency based on usage
            const skillUsage = new Map<string, { count: number, recent: boolean }>();

            applications.forEach((app: any) => {
                if (app.projects?.technology_stack) {
                    const isRecent = new Date(app.created_at) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // Last 90 days

                    app.projects.technology_stack.forEach((tech: string) => {
                        const current = skillUsage.get(tech) || { count: 0, recent: false };
                        skillUsage.set(tech, {
                            count: current.count + 1,
                            recent: current.recent || isRecent
                        });
                    });
                }
            });

            // Return all user's skills with calculated or default proficiency
            const skillProficiencyData = skills.map((skill: string) => {
                const usage = skillUsage.get(skill) || { count: 0, recent: false };
                let level: 'beginner' | 'intermediate' | 'advanced' | 'expert' = 'beginner';

                if (usage.count >= 5) level = 'expert';
                else if (usage.count >= 3) level = 'advanced';
                else if (usage.count >= 1) level = 'intermediate';
                // If no project usage, default to 'beginner' level

                return {
                    skill,
                    level,
                    recentUsage: usage.recent,
                    projectCount: usage.count
                };
            });

            return skillProficiencyData;
        } catch (error) {
            console.error('Error calculating skill proficiency:', error);
            return [];
        }
    }

    async generateShareableProfile(userId: string): Promise<ShareableProfile> {
        try {
            // Generate unique share token
            const shareToken = crypto.randomUUID();

            // Try to update profile with share token
            try {
                const { error } = await supabase
                    .from('profiles')
                    .update({ share_token: shareToken })
                    .eq('id', userId);

                if (error) throw error;
            } catch (updateError) {
                console.warn('Unable to update share token (migration may be needed):', updateError);
                // Continue with generated token for URL generation
            }

            // Try to get current public status with fallback
            let isPublic = true;

            try {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('is_public')
                    .eq('id', userId)
                    .single();

                isPublic = profile?.is_public ?? true;
            } catch (publicError) {
                console.warn('Public status not available (migration may be needed):', publicError);
                // Default to true for basic functionality
            }

            const baseUrl = window.location.origin;
            const shareUrl = `${baseUrl}/profile/shared/${shareToken}`;

            return {
                shareToken,
                isPublic,
                shareUrl,
                qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`
            };
        } catch (error) {
            console.error('Error generating shareable profile:', error);
            // Return fallback data to prevent UI breaking
            const fallbackToken = 'fallback-' + Date.now();
            const baseUrl = window.location.origin;
            return {
                shareToken: fallbackToken,
                isPublic: true,
                shareUrl: `${baseUrl}/profile/${userId}`, // Fallback to regular profile URL
                qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${baseUrl}/profile/${userId}`)}`
            };
        }
    }

    async updatePrivacySettings(userId: string, isPublic: boolean): Promise<void> {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ is_public: isPublic })
                .eq('id', userId);

            if (error) throw error;
        } catch (error) {
            console.warn('Unable to update privacy settings (migration may be needed):', error);
            // Don't throw error to prevent UI breaking
        }
    }

    async trackProfileView(profileId: string, viewerId?: string): Promise<void> {
        try {
            // Try to increment profile view count
            try {
                await supabase.rpc('increment_profile_views', { profile_id: profileId });
            } catch (incrementError) {
                console.warn('Profile view tracking not available (migration may be needed):', incrementError);
            }

            // Try to record analytics if we have viewer info
            if (viewerId && viewerId !== profileId) {
                try {
                    await supabase
                        .from('profile_analytics')
                        .insert({
                            profile_id: profileId,
                            viewer_id: viewerId,
                            view_type: 'direct'
                        });
                } catch (analyticsError) {
                    console.warn('Profile analytics tracking not available (migration may be needed):', analyticsError);
                }
            }
        } catch (error) {
            console.warn('Error tracking profile view (non-critical):', error);
            // Don't throw error for analytics failures
        }
    }

    async getProfileByShareToken(shareToken: string): Promise<User | null> {
        try {
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('share_token', shareToken)
                .eq('is_public', true)
                .single();

            if (profile) {
                // Try to track shared link view
                try {
                    await supabase
                        .from('profile_analytics')
                        .insert({
                            profile_id: profile.id,
                            view_type: 'shared_link'
                        });
                } catch (analyticsError) {
                    console.warn('Share analytics tracking not available:', analyticsError);
                }
            }

            return profile;
        } catch (error) {
            console.warn('Shared profile access not available (migration may be needed):', error);
            return null;
        }
    }

    async getOrganizationStats(organizationId: string) {
        try {
            // Get organization's projects and stats
            const { data: projects } = await supabase
                .from('projects')
                .select('id, status, created_at')
                .eq('organization_id', organizationId);

            const { data: applications } = await supabase
                .from('applications')
                .select('status, created_at')
                .in('project_id', projects?.map((p: any) => p.id) || []);

            const totalProjects = projects?.length || 0;
            const activeProjects = projects?.filter((p: any) => p.status === 'active').length || 0;
            const completedProjects = projects?.filter((p: any) => p.status === 'completed').length || 0;

            const totalApplications = applications?.length || 0;
            const acceptedApplications = applications?.filter((a: any) => a.status === 'accepted').length || 0;

            return {
                totalProjects,
                activeProjects,
                completedProjects,
                totalApplications,
                acceptedApplications,
                successRate: totalApplications > 0 ? Math.round((acceptedApplications / totalApplications) * 100) : 0
            };
        } catch (error) {
            console.error('Error fetching organization stats:', error);
            throw error;
        }
    }

    async updateProfile(userId: string, updates: Partial<User>): Promise<{ success: boolean; error?: string }> {
        if (!updates.first_name || !updates.last_name) {
            return { success: false, error: 'First and last name are required.' };
        }
        // ... existing code for updating profile ...
        return { success: false, error: 'Not implemented.' };
    }
}

export const profileService = new ProfileService(); 