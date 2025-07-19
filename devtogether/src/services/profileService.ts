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

// Enhanced with security string support
export interface ShareableProfile {
    shareToken: string;
    securityString: string;  // NEW: Security string for URLs
    isPublic: boolean;
    shareUrl: string;
    qrCodeUrl: string;
}

// Enhanced with rating data
export interface DeveloperRating {
    id: string;
    rating_type: 'submission_approved' | 'project_completed';
    stars_awarded: number;
    project_title: string;
    organization_name: string;
    awarded_at: string;
    notes?: string;
}

export interface DeveloperRatingStats {
    total_rating: number;
    submission_stars: number;
    completion_stars: number;
    total_projects: number;
    completed_projects: number;
    average_rating: number;
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

class ProfileService {
    // Check if RPC functions are available (for debugging schema cache issues)
    async testRpcFunctionsAvailable(): Promise<{ available: boolean; errors: string[] }> {
        const errors: string[] = [];
        
        try {
            // Test with a null UUID to see if simple functions are accessible
            const testId = '00000000-0000-0000-0000-000000000000';
            
            const testFunctions = [
                'developer_total_stars',
                'developer_average_rating', 
                'developer_completed_projects',
                'developer_submission_stars',
                'developer_completion_stars'
            ];

            for (const funcName of testFunctions) {
                const { error } = await supabase.rpc(funcName, { user_id: testId });
                if (error && error.code === 'PGRST202') {
                    errors.push(`${funcName} not available`);
                }
            }
            
            // Also test portfolio function
            const { error: portfolioError } = await supabase.rpc('get_developer_project_portfolio', {
                developer_user_id: testId
            });
            
            if (portfolioError && portfolioError.code === 'PGRST202') {
                errors.push('get_developer_project_portfolio not available');
            }
            
        } catch (error) {
            errors.push(`RPC test failed: ${error}`);
        }
        
        return {
            available: errors.length === 0,
            errors
        };
    }

    // Enhanced profile stats with rating system integration
    async getProfileStats(userId: string): Promise<ProfileStats> {
        try {
            // Get basic dashboard stats
            const dashboardStats = await dashboardService.getDeveloperStats(userId);

            // Try to get additional profile-specific data with enhanced privacy support
            let profileViews = 0;
            let createdAt = new Date();
            let updatedAt = new Date();

            try {
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('created_at, profile_views, updated_at, security_string')
                    .eq('id', userId)
                    .single();

                if (error) {
                    console.warn('Profile data not accessible:', error);
                    // Try to get basic profile info with enhanced RLS policies
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
                profileViews,
                platformDays,
                lastActivity: updatedAt.toISOString()
            };
        } catch (error) {
            console.error('Error fetching profile stats:', error);
            // Return fallback stats
            return {
                totalProjects: 0,
                activeProjects: 0,
                completedProjects: 0,
                totalApplications: 0,
                acceptedApplications: 0,
                acceptanceRate: 0,
                platformDays: 0,
                profileViews: 0,
                lastActivity: new Date().toISOString()
            };
        }
    }

    // Get developer rating stats using simple RPC functions
    async getDeveloperRatingStats(userId: string): Promise<DeveloperRatingStats> {
        try {
            // Use multiple simple RPC calls instead of one complex one
            const [
                totalStarsResult,
                avgRatingResult,
                completedProjectsResult,
                submissionStarsResult,
                completionStarsResult
            ] = await Promise.all([
                supabase.rpc('developer_total_stars', { user_id: userId }),
                supabase.rpc('developer_average_rating', { user_id: userId }),
                supabase.rpc('developer_completed_projects', { user_id: userId }),
                supabase.rpc('developer_submission_stars', { user_id: userId }),
                supabase.rpc('developer_completion_stars', { user_id: userId })
            ]);

            // Check if any of the calls failed
            const hasErrors = [
                totalStarsResult.error,
                avgRatingResult.error,
                completedProjectsResult.error,
                submissionStarsResult.error,
                completionStarsResult.error
            ].some(error => error);

            if (hasErrors) {
                console.warn('Some RPC functions not available, using fallback query');
                return this.getFallbackRatingStats(userId);
            }

            return {
                total_rating: totalStarsResult.data || 0,
                submission_stars: submissionStarsResult.data || 0,
                completion_stars: completionStarsResult.data || 0,
                total_projects: completedProjectsResult.data || 0,
                completed_projects: completedProjectsResult.data || 0,
                average_rating: avgRatingResult.data || 0
            };
        } catch (error) {
            console.warn('Error with RPC functions, using fallback:', error);
            return this.getFallbackRatingStats(userId);
        }
    }

    // Fallback method for rating stats when RPC is not available
    private async getFallbackRatingStats(userId: string): Promise<DeveloperRatingStats> {
        try {
            const { data: ratings, error } = await supabase
                .from('developer_ratings')
                .select('rating_type, stars_awarded')
                .eq('developer_id', userId);

            if (error) {
                console.error('Error in fallback rating stats query:', error);
                return {
                    total_rating: 0,
                    submission_stars: 0,
                    completion_stars: 0,
                    total_projects: 0,
                    completed_projects: 0,
                    average_rating: 0
                };
            }

            const totalStars = ratings?.reduce((sum: number, r: any) => sum + r.stars_awarded, 0) || 0;
            const submissionStars = ratings?.filter((r: any) => r.rating_type === 'submission_approved').reduce((sum: number, r: any) => sum + r.stars_awarded, 0) || 0;
            const completionStars = ratings?.filter((r: any) => r.rating_type === 'project_completed').reduce((sum: number, r: any) => sum + r.stars_awarded, 0) || 0;
            const currentRating = ratings?.length ? Math.min(totalStars / ratings.length, 5.0) : 0;
            const completedProjects = Math.floor(completionStars / 3); // 3 stars per completed project

            return {
                total_rating: totalStars,
                submission_stars: submissionStars,
                completion_stars: completionStars,
                total_projects: completedProjects,
                completed_projects: completedProjects,
                average_rating: currentRating
            };
        } catch (error) {
            console.error('Error in fallback rating stats query:', error);
            return {
                total_rating: 0,
                submission_stars: 0,
                completion_stars: 0,
                total_projects: 0,
                completed_projects: 0,
                average_rating: 0
            };
        }
    }

    // NEW: Get developer ratings history
    async getDeveloperRatings(userId: string): Promise<DeveloperRating[]> {
        try {
            const { data, error } = await supabase
                .from('developer_ratings')
                .select(`
                    id,
                    rating_type,
                    stars_awarded,
                    awarded_at,
                    notes,
                    projects (title),
                    awarded_by_profile:profiles!developer_ratings_awarded_by_fkey (organization_name)
                `)
                .eq('developer_id', userId)
                .order('awarded_at', { ascending: false });

            if (error) {
                console.warn('Error fetching developer ratings:', error);
                return [];
            }

            return data?.map((rating: any): DeveloperRating => ({
                id: rating.id,
                rating_type: rating.rating_type as 'submission_approved' | 'project_completed',
                stars_awarded: rating.stars_awarded,
                project_title: rating.projects?.title || 'Unknown Project',
                organization_name: rating.awarded_by_profile?.organization_name || 'Unknown Organization',
                awarded_at: rating.awarded_at,
                notes: rating.notes
            })) || [];
        } catch (error) {
            console.error('Error fetching developer ratings:', error);
            return [];
        }
    }

    // NEW: Get top 5 spotlight developers (highest rated with public profiles and spotlight enabled)
    async getSpotlightDevelopers(): Promise<User[]> {
        try {
            const { data: developers, error } = await supabase
                .from('profiles')
                .select(`
                    id,
                    first_name,
                    last_name,
                    bio,
                    avatar_url,
                    skills,
                    github,
                    portfolio,
                    linkedin,
                    security_string,
                    is_public,
                    spotlight_enabled
                `)
                .eq('role', 'developer')
                .eq('is_public', true)
                .eq('spotlight_enabled', true)
                .order('total_stars_earned', { ascending: false })
                .limit(5);
            
            if (error) {
                console.warn('Error fetching spotlight developers:', error);
                return [];
            }

            return developers || [];
        } catch (error) {
            console.error('Error fetching spotlight developers:', error);
            return [];
        }
    }

    // NEW: Get single rotating spotlight developer
    async getSpotlightDeveloper(): Promise<User | null> {
        try {
            const developers = await this.getSpotlightDevelopers();
            
            if (developers.length === 0) {
                return null;
            }

            // Rotate based on day of week to change spotlight regularly
            const dayOfWeek = new Date().getDay();
            const selectedIndex = dayOfWeek % developers.length;
            
            return developers[selectedIndex];
        } catch (error) {
            console.error('Error fetching spotlight developer:', error);
            return null;
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
            // Try to get existing security string first
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('security_string, share_token, is_public')
                .eq('id', userId)
                .single();

            let securityString = profile?.security_string;
            let shareToken = profile?.share_token;
            let isPublic = profile?.is_public ?? true;

            // Generate new security string if missing
            if (!securityString) {
                try {
                    // Generate a new random security string (8-10 characters)
                    const newSecurityString = Math.random().toString(36).substring(2, 10);
                    
                    // Update the user's security string directly
                    const { data: updateData, error: stringError } = await supabase
                        .from('profiles')
                        .update({ 
                            security_string: newSecurityString,
                            security_string_updated_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', userId)
                        .select('security_string')
                        .single();

                    if (!stringError && updateData) {
                        securityString = updateData.security_string;
                    } else {
                        securityString = newSecurityString;
                    }
                } catch (stringGenError) {
                    console.warn('Could not generate security string:', stringGenError);
                    securityString = `fallback-${Date.now()}`;
                }
            }

            // Generate new share token if missing
            if (!shareToken) {
                shareToken = crypto.randomUUID();
                try {
                    await supabase
                    .from('profiles')
                    .update({ share_token: shareToken })
                    .eq('id', userId);
            } catch (updateError) {
                    console.warn('Unable to update share token:', updateError);
                }
            }

            // Create URLs with security string system - always use security string for consistency
            const baseUrl = window.location.origin;
            const secureProfileUrl = `${baseUrl}/profile/${userId}-${securityString}`;
            
            // Always use security string URL for better privacy control
            // Private profiles can still be shared via secure URL, just not publicly discoverable
            const shareUrl = secureProfileUrl;

            return {
                shareToken: shareToken || `fallback-${Date.now()}`,
                securityString: securityString || `fallback-${Date.now()}`,
                isPublic,
                shareUrl,
                qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`
            };
        } catch (error) {
            console.error('Error generating shareable profile:', error);
            // Return fallback data to prevent UI breaking
            const fallbackToken = 'fallback-' + Date.now();
            const baseUrl = window.location.origin;
            const fallbackUrl = `${baseUrl}/profile/${userId}-${fallbackToken}`;
            return {
                shareToken: fallbackToken,
                securityString: fallbackToken,
                isPublic: true,
                shareUrl: fallbackUrl, // Use security string format even for fallback
                qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(fallbackUrl)}`
            };
        }
    }

    // Enhanced with security string support
    async getProfileBySecurityString(userId: string, securityString: string): Promise<User | null> {
        try {
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .eq('security_string', securityString)
                .single();

            if (error) {
                console.warn('Profile not found or access denied:', error);
                return null;
            }

            // Track profile view for security string access
            if (profile) {
                try {
                    await this.trackProfileView(profile.id);
                } catch (analyticsError) {
                    console.warn('Profile view tracking failed:', analyticsError);
                }
            }

            return profile;
        } catch (error) {
            console.error('Error fetching profile by security string:', error);
            return null;
        }
    }

    // Enhanced privacy settings update
    async updatePrivacySettings(userId: string, isPublic: boolean): Promise<void> {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ 
                    is_public: isPublic,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId);

            if (error) {
                throw new Error(`Failed to update privacy settings: ${error.message}`);
            }
        } catch (error) {
            console.error('Error updating privacy settings:', error);
            throw error;
        }
    }

    // Enhanced spotlight settings update
    async updateSpotlightSettings(userId: string, spotlightEnabled: boolean): Promise<void> {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ 
                    spotlight_enabled: spotlightEnabled,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId);

            if (error) {
                throw new Error(`Failed to update spotlight settings: ${error.message}`);
            }
        } catch (error) {
            console.error('Error updating spotlight settings:', error);
            throw error;
        }
    }

    // NEW: Regenerate security string for user
    async regenerateSecurityString(userId: string): Promise<string> {
        try {
            // Generate a new random security string (8-10 characters)
            const newSecurityString = Math.random().toString(36).substring(2, 10);
            
            // Update the user's security string directly
            const { data, error } = await supabase
                .from('profiles')
                .update({ 
                    security_string: newSecurityString,
                    security_string_updated_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId)
                .select('security_string')
                .single();

            if (error) {
                throw new Error(`Failed to regenerate security string: ${error.message}`);
            }

            return data?.security_string || newSecurityString;
        } catch (error) {
            console.error('Error regenerating security string:', error);
            throw error;
        }
    }

    // Enhanced profile access with team context support
    async getProfileWithTeamContext(profileId: string, requesterId?: string): Promise<User | null> {
        try {
            // Use enhanced RLS policies that support team context
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', profileId)
                .single();

            if (error) {
                console.warn('Profile access denied or not found:', error);
                return null;
            }

            // Track profile view if viewer is different from profile owner
            if (profile && requesterId && requesterId !== profileId) {
                try {
                    await this.trackProfileView(profileId, requesterId);
                } catch (analyticsError) {
                    console.warn('Profile view tracking failed:', analyticsError);
                }
            }

            return profile;
        } catch (error) {
            console.error('Error fetching profile with team context:', error);
            return null;
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



    // Get developer project portfolio
    async getDeveloperProjectPortfolio(developerId: string) {
        try {
            const { data, error } = await supabase.rpc('get_developer_project_portfolio', {
                developer_user_id: developerId
            });

            if (error) {
                // Handle schema cache refresh issues gracefully
                if (error.code === 'PGRST202' && error.message?.includes('Could not find the function')) {
                    console.warn('RPC function not found, using fallback query for project portfolio.');
                    return this.getFallbackProjectPortfolio(developerId);
                }
                
                console.error('Error fetching developer project portfolio:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Error fetching project portfolio:', error);
            return [];
        }
    }

    // Fallback method for project portfolio when RPC is not available
    private async getFallbackProjectPortfolio(developerId: string) {
        try {
            const { data, error } = await supabase
                .from('applications')
                .select(`
                    status_manager,
                    project:projects(
                        id,
                        title,
                        description,
                        status,
                        updated_at,
                        organization:profiles!projects_organization_id_fkey(
                            organization_name,
                            avatar_url
                        )
                    )
                `)
                .eq('developer_id', developerId)
                .eq('status', 'accepted');

            if (error) {
                console.error('Error in fallback project portfolio query:', error);
                return [];
            }

            return (data || []).map((app: any) => ({
                project_id: app.project?.id,
                project_title: app.project?.title || 'Unknown Project',
                project_description: app.project?.description || '',
                project_status: app.project?.status || 'unknown',
                organization_name: app.project?.organization?.organization_name || 'Unknown Organization',
                organization_avatar: app.project?.organization?.avatar_url || null,
                team_role: app.status_manager ? 'Status Manager' : 'Team Member',
                is_status_manager: app.status_manager || false,
                completed_at: app.project?.status === 'completed' ? app.project?.updated_at : null,
                stars_earned: 0 // Would need separate query for this
            }));
        } catch (error) {
            console.error('Error in fallback project portfolio query:', error);
            return [];
        }
    }

    // Get comprehensive developer rating summary
    async getDeveloperRatingSummary(developerId: string) {
        try {
            const { data, error } = await supabase.rpc('get_developer_rating_summary', {
                developer_user_id: developerId
            });

            if (error) {
                // Handle schema cache refresh issues gracefully by using the rating stats method
                console.warn('RPC function not found, using rating stats method instead.');
                const stats = await this.getDeveloperRatingStats(developerId);
                return {
                    total_stars_earned: stats.total_rating,
                    current_rating: stats.average_rating,
                    completed_projects: stats.completed_projects,
                    submission_stars: stats.submission_stars,
                    completion_stars: stats.completion_stars,
                    quality_stars: 0
                };
            }

            return data?.[0] || null;
        } catch (error) {
            console.error('Error fetching rating summary:', error);
            return null;
        }
    }





    async updateProfile(userId: string, updates: Partial<User>): Promise<{ success: boolean; error?: string }> {
        if (!updates.first_name || !updates.last_name) {
            return { success: false, error: 'First and last name are required.' };
        }
        // ... existing code for updating profile ...
        return { success: false, error: 'Not implemented.' };
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
}

export const profileService = new ProfileService(); 