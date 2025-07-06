import { supabase } from '../utils/supabase';

export interface PlatformStats {
    totalDevelopers: number;
    totalOrganizations: number;
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalApplications: number;
    acceptedApplications: number;
    successRate: number; // percentage of completed projects
    completionRate: number; // percentage of applications that get accepted
}

class PlatformStatsService {
    /**
     * Get platform-wide statistics for display on landing pages and homepage
     */
    async getPlatformStats(): Promise<PlatformStats> {
        try {
            console.log('Fetching platform statistics...');

            // Fetch all data in parallel for better performance
            const [
                developersResult,
                organizationsResult,
                projectsResult,
                applicationsResult
            ] = await Promise.all([
                // Get total developers
                supabase
                    .from('profiles')
                    .select('id', { count: 'exact', head: true })
                    .eq('role', 'developer'),

                // Get total organizations
                supabase
                    .from('profiles')
                    .select('id', { count: 'exact', head: true })
                    .eq('role', 'organization'),

                // Get all projects with their status
                supabase
                    .from('projects')
                    .select('id, status'),

                // Get all applications with their status
                supabase
                    .from('applications')
                    .select('id, status')
            ]);

            // Handle potential errors
            if (developersResult.error) {
                console.error('Error fetching developers:', developersResult.error);
            }
            if (organizationsResult.error) {
                console.error('Error fetching organizations:', organizationsResult.error);
            }
            if (projectsResult.error) {
                console.error('Error fetching projects:', projectsResult.error);
            }
            if (applicationsResult.error) {
                console.error('Error fetching applications:', applicationsResult.error);
            }

            // Calculate statistics with fallback to 0
            const totalDevelopers = developersResult.count || 0;
            const totalOrganizations = organizationsResult.count || 0;
            
            const projects = projectsResult.data || [];
            const totalProjects = projects.length;
            const activeProjects = projects.filter((p: any) => p.status === 'active' || p.status === 'in_progress').length;
            const completedProjects = projects.filter((p: any) => p.status === 'completed').length;
            
            const applications = applicationsResult.data || [];
            const totalApplications = applications.length;
            const acceptedApplications = applications.filter((a: any) => a.status === 'accepted').length;

            // Calculate rates
            const successRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;
            const completionRate = totalApplications > 0 ? Math.round((acceptedApplications / totalApplications) * 100) : 0;

            const stats = {
                totalDevelopers,
                totalOrganizations,
                totalProjects,
                activeProjects,
                completedProjects,
                totalApplications,
                acceptedApplications,
                successRate,
                completionRate
            };

            console.log('Platform statistics calculated:', stats);
            return stats;

        } catch (error) {
            console.error('Error fetching platform statistics:', error);
            
            // Return fallback statistics if there's an error
            return {
                totalDevelopers: 0,
                totalOrganizations: 0,
                totalProjects: 0,
                activeProjects: 0,
                completedProjects: 0,
                totalApplications: 0,
                acceptedApplications: 0,
                successRate: 0,
                completionRate: 0
            };
        }
    }

    /**
     * Get formatted statistics for display (adds + suffix and handles formatting)
     */
    async getFormattedPlatformStats(): Promise<{
        developers: string;
        organizations: string;
        projects: string;
        successRate: string;
    }> {
        try {
            const stats = await this.getPlatformStats();

            // Format numbers with appropriate suffixes
            const formatNumber = (num: number): string => {
                if (num === 0) return '0';
                if (num < 10) return num.toString();
                return `${num}+`;
            };

            return {
                developers: formatNumber(stats.totalDevelopers),
                organizations: formatNumber(stats.totalOrganizations),
                projects: formatNumber(stats.totalProjects),
                successRate: `${stats.successRate}%`
            };
        } catch (error) {
            console.error('Error formatting platform statistics:', error);
            
            // Return fallback formatted stats
            return {
                developers: '0',
                organizations: '0',
                projects: '0',
                successRate: '0%'
            };
        }
    }

    /**
     * Get statistics specifically for homepage display
     */
    async getHomepageStats(): Promise<{
        activeProjects: string;
        totalDevelopers: string;
        totalOrganizations: string;
        completionRate: string;
    }> {
        try {
            const stats = await this.getPlatformStats();

            // Format numbers for homepage display
            const formatNumber = (num: number): string => {
                if (num === 0) return '0';
                if (num < 10) return num.toString();
                return `${num}+`;
            };

            return {
                activeProjects: formatNumber(stats.totalProjects), // Use total projects as "active projects" includes all posted
                totalDevelopers: formatNumber(stats.totalDevelopers),
                totalOrganizations: formatNumber(stats.totalOrganizations),
                completionRate: `${stats.completionRate}%` // Use application completion rate as "completion rate"
            };
        } catch (error) {
            console.error('Error getting homepage statistics:', error);
            
            return {
                activeProjects: '0',
                totalDevelopers: '0',
                totalOrganizations: '0',
                completionRate: '0%'
            };
        }
    }
}

export const platformStatsService = new PlatformStatsService();

// New method for developer spotlight real data
export async function getDeveloperSpotlightStats(developerId: string): Promise<{
    projectsCompleted: number;
    successRate: number;
    recentProjects: Array<{ name: string; status: string; organization?: string }>;
    primaryRole?: string;
}> {
    try {
        console.log('Fetching developer spotlight stats for:', developerId);

        // Get developer's applications and projects
        const [applicationsResult, profileResult] = await Promise.all([
            supabase
                .from('applications')
                .select(`
                    status,
                    project:projects (
                        id,
                        title,
                        status,
                        organization:profiles!projects_organization_id_fkey (
                            organization_name
                        )
                    )
                `)
                .eq('developer_id', developerId),

            supabase
                .from('profiles')
                .select('skills')
                .eq('id', developerId)
                .single()
        ]);

        if (applicationsResult.error) {
            console.error('Error fetching developer applications:', applicationsResult.error);
        }
        if (profileResult.error) {
            console.error('Error fetching developer profile:', profileResult.error);
        }

        const applications = applicationsResult.data || [];
        const profile = profileResult.data;

        // Calculate projects completed (accepted applications with completed projects)
        const acceptedApplications = applications.filter((app: any) => app.status === 'accepted');
        const completedProjects = acceptedApplications.filter(
            (app: any) => app.project && app.project.status === 'completed'
        );
        const projectsCompleted = completedProjects.length;

        // Calculate success rate (percentage of accepted applications)
        const totalApplications = applications.length;
        const acceptedCount = acceptedApplications.length;
        const successRate = totalApplications > 0 ? Math.round((acceptedCount / totalApplications) * 100) : 0;

        // Get recent projects (limit to 2 most recent)
        const recentProjects = acceptedApplications
            .slice(-2)
            .map((app: any) => ({
                name: app.project?.title || 'Unnamed Project',
                status: app.project?.status === 'completed' ? 'Complete' : 'In Progress',
                organization: app.project?.organization?.organization_name
            }))
            .reverse();

        // Determine primary role from skills
        const skills = profile?.skills || [];
        const primaryRole = determinePrimaryRole(skills);

        return {
            projectsCompleted,
            successRate,
            recentProjects,
            primaryRole
        };

    } catch (error) {
        console.error('Error fetching developer spotlight stats:', error);
        
        // Return fallback data
        return {
            projectsCompleted: 0,
            successRate: 0,
            recentProjects: [],
            primaryRole: 'Developer'
        };
    }
}

// New method for landing page testimonials
export async function getLandingPageTestimonials(): Promise<{
    developerTestimonials: Array<{
        name: string;
        role: string;
        quote: string;
        avatar_url?: string;
    }>;
    organizationTestimonials: Array<{
        name: string;
        role: string;
        organization: string;
        quote: string;
        avatar_url?: string;
    }>;
}> {
    try {
        console.log('Fetching landing page testimonials...');

        // Get featured testimonials from the database
        const testimonialsResult = await supabase
            .from('developer_testimonials')
            .select(`
                testimonial_text,
                rating,
                developer:profiles!developer_testimonials_developer_id_fkey (
                    first_name,
                    last_name,
                    avatar_url,
                    skills
                ),
                organization:profiles!developer_testimonials_organization_id_fkey (
                    first_name,
                    last_name,
                    organization_name
                )
            `)
            .eq('is_featured', true)
            .gte('rating', 4) // Only high-rated testimonials
            .limit(6); // Get 6 for both landing pages

        if (testimonialsResult.error) {
            console.error('Error fetching testimonials:', testimonialsResult.error);
            return { developerTestimonials: [], organizationTestimonials: [] };
        }

        const testimonials = testimonialsResult.data || [];

        // Process testimonials for developer landing page (from developer perspective)
        const developerTestimonials = testimonials.slice(0, 3).map((t: any) => ({
            name: `${t.developer?.first_name || ''} ${t.developer?.last_name || ''}`.trim() || 'Developer',
            role: determinePrimaryRole(t.developer?.skills || []),
            quote: t.testimonial_text,
            avatar_url: t.developer?.avatar_url
        }));

        // Process testimonials for organization landing page (from organization perspective)  
        const organizationTestimonials = testimonials.slice(3, 6).map((t: any) => ({
            name: `${t.organization?.first_name || ''} ${t.organization?.last_name || ''}`.trim() || 'Organization Contact',
            role: 'Program Manager', // Default role for organization contacts
            organization: t.organization?.organization_name || 'Partner Organization',
            quote: t.testimonial_text,
            avatar_url: t.organization?.avatar_url
        }));

        return {
            developerTestimonials,
            organizationTestimonials
        };

    } catch (error) {
        console.error('Error fetching landing page testimonials:', error);
        return { developerTestimonials: [], organizationTestimonials: [] };
    }
}

// New method for homepage partner organizations
export async function getPartnerOrganizations(): Promise<Array<{
    id: string;
    name: string;
    logo?: string;
    website?: string;
}>> {
    try {
        console.log('Fetching partner organizations...');

        // Get organizations that have completed projects or have active projects
        const organizationsResult = await supabase
            .from('profiles')
            .select(`
                id,
                organization_name,
                avatar_url,
                website,
                projects:projects!projects_organization_id_fkey (
                    id,
                    status
                )
            `)
            .eq('role', 'organization')
            .not('organization_name', 'is', null)
            .not('organization_name', 'eq', '')
            .limit(10);

        if (organizationsResult.error) {
            console.error('Error fetching partner organizations:', organizationsResult.error);
            return [];
        }

        const organizations = organizationsResult.data || [];

        // Filter and sort organizations by project activity
        const partnerOrgs = organizations
            .filter((org: any) => org.projects && org.projects.length > 0) // Has at least one project
            .map((org: any) => ({
                id: org.id,
                name: org.organization_name,
                logo: org.avatar_url,
                website: org.website
            }))
            .slice(0, 5); // Limit to 5 for the homepage display

        console.log('Found partner organizations:', partnerOrgs.length);
        return partnerOrgs;

    } catch (error) {
        console.error('Error fetching partner organizations:', error);
        return [];
    }
}

// Helper function to determine primary role from skills
function determinePrimaryRole(skills: string[]): string {
    if (!skills || skills.length === 0) return 'Developer';

    // Define role mapping based on skills
    const roleMap = {
        'Frontend': ['React', 'Vue.js', 'Angular', 'HTML', 'CSS', 'JavaScript', 'TypeScript', 'Tailwind CSS'],
        'Backend': ['Node.js', 'Python', 'Java', 'Django', 'Express.js', 'Ruby', 'PHP'],
        'Full-Stack': ['Full-Stack', 'MERN', 'MEAN', 'Django', 'Ruby on Rails'],
        'Mobile': ['React Native', 'Flutter', 'Swift', 'Kotlin', 'iOS', 'Android'],
        'DevOps': ['Docker', 'AWS', 'Kubernetes', 'CI/CD', 'Azure', 'Google Cloud'],
        'Data': ['Python', 'R', 'SQL', 'Machine Learning', 'Data Science', 'Analytics'],
        'UI/UX': ['UI/UX Design', 'Figma', 'Adobe XD', 'Sketch', 'Design'],
        'QA': ['Testing', 'QA', 'Selenium', 'Jest', 'Cypress']
    };

    // Count matches for each role
    const roleCounts: { [key: string]: number } = {};
    
    Object.entries(roleMap).forEach(([role, roleSkills]) => {
        roleCounts[role] = roleSkills.filter(skill => 
            skills.some(userSkill => 
                userSkill.toLowerCase().includes(skill.toLowerCase()) ||
                skill.toLowerCase().includes(userSkill.toLowerCase())
            )
        ).length;
    });

    // Find the role with the most matches
    const bestRole = Object.entries(roleCounts).reduce(
        (best, [role, count]) => count > best.count ? { role, count } : best,
        { role: 'Developer', count: 0 }
    );

    return bestRole.count > 0 ? `${bestRole.role} Developer` : 'Developer';
}

export default platformStatsService; 