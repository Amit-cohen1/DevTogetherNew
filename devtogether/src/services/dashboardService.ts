import { supabase } from '../utils/supabase';
import { Project, Application, User } from '../types/database';

export interface DeveloperStats {
    totalApplications: number;
    acceptedApplications: number;
    rejectedApplications: number;
    pendingApplications: number;
    acceptanceRate: number;
    activeProjects: number;
    completedProjects: number;
}

export interface DashboardProject extends Project {
    application_status?: string;
    workspace_last_activity?: string;
    progress?: number;
    dueDate?: string | null;
    teamMembers?: {
        id: string;
        name: string;
        avatar?: string | null;
        role: 'organization' | 'developer';
    }[];
    users?: {
        id: string;
        name: string;
        avatar_url?: string;
    };
}

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    achieved: boolean;
    progress?: number;
    maxProgress?: number;
}

export interface RecommendedProject extends Project {
    matchScore: number;
    matchReasons: string[];
    users?: {
        id: string;
        name: string;
        avatar_url?: string;
    };
}

interface ApplicationWithProject {
    status: string;
    projects: {
        id: string;
        status: string;
    };
}

export interface RecentAchievement extends Achievement {
    earnedDate?: string;
    earnedTimestamp?: string;
}

export interface ActivityItem {
    id: string;
    type: 'application_submitted' | 'application_accepted' | 'application_rejected' | 'message_sent' | 'message_received' | 'project_joined' | 'project_completed';
    title: string;
    description: string;
    timestamp: string;
    relatedId?: string; // project_id, application_id, etc.
    relatedData?: any;
}

class DashboardService {
    async getDeveloperStats(userId: string): Promise<DeveloperStats> {
        try {
            // Get all applications for the user
            const { data: applications, error: appsError } = await supabase
                .from('applications')
                .select('status')
                .eq('developer_id', userId);

            if (appsError) throw appsError;

            // Calculate application statistics
            const totalApplications = applications?.length || 0;
            const acceptedApplications = applications?.filter((app: any) => app.status === 'accepted').length || 0;
            const rejectedApplications = applications?.filter((app: any) => app.status === 'rejected').length || 0;
            const pendingApplications = applications?.filter((app: any) => app.status === 'pending').length || 0;
            const acceptanceRate = totalApplications > 0 ? (acceptedApplications / totalApplications) * 100 : 0;

            // Get active projects (where user has accepted application)
            const { data: activeProjectsData, error: activeError } = await supabase
                .from('applications')
                .select(`
          projects (
            id,
            status
          )
        `)
                .eq('developer_id', userId)
                .eq('status', 'accepted');

            if (activeError) throw activeError;

            const activeProjects = activeProjectsData?.filter(
                (app: any) => app.projects && app.projects.status === 'active'
            ).length || 0;

            const completedProjects = activeProjectsData?.filter(
                (app: any) => app.projects && app.projects.status === 'completed'
            ).length || 0;

            return {
                totalApplications,
                acceptedApplications,
                rejectedApplications,
                pendingApplications,
                acceptanceRate: Math.round(acceptanceRate),
                activeProjects,
                completedProjects
            };
        } catch (error) {
            console.error('Error fetching developer stats:', error);
            throw error;
        }
    }

    async getActiveProjects(userId: string): Promise<DashboardProject[]> {
        try {
            // Get user's accepted applications with project details
            const { data, error } = await supabase
                .from('applications')
                .select(`
          id,
          status,
          developer_id,
          project_id,
          projects (
            id,
            title,
            description,
            organization_id,
            technology_stack,
            deadline,
            status,
            created_at
          )
        `)
                .eq('developer_id', userId)
                .eq('status', 'accepted');

            if (error) throw error;

            // Process each project to add additional details
            const projectsWithDetails = await Promise.all(
                (data || []).map(async (app: any) => {
                    const project = app.projects;
                    if (!project) return null;

                    // Get organization details
                    let orgData = null;
                    if (project?.organization_id) {
                        const { data: org } = await supabase
                            .from('profiles')
                            .select('id, first_name, last_name, organization_name, avatar_url')
                            .eq('id', project.organization_id)
                            .single();
                        orgData = org ? {
                            ...org,
                            name: org.organization_name || `${org.first_name || ''} ${org.last_name || ''}`.trim()
                        } : null;
                    }

                    // Get team members (accepted applications + organization owner)
                    const teamMembers = [];

                    // Add organization owner
                    if (orgData) {
                        teamMembers.push({
                            id: orgData.id,
                            name: orgData.name,
                            avatar: orgData.avatar_url,
                            role: 'organization'
                        });
                    }

                    // Get other accepted developers for this project
                    const { data: otherMembers } = await supabase
                        .from('applications')
                        .select(`
                            profiles!developer_id(id, first_name, last_name, avatar_url)
                        `)
                        .eq('project_id', project.id)
                        .eq('status', 'accepted')
                        .neq('developer_id', userId); // Exclude current user

                    if (otherMembers) {
                        otherMembers.forEach((member: any) => {
                            if (member.profiles) {
                                teamMembers.push({
                                    id: member.profiles.id,
                                    name: `${member.profiles.first_name || ''} ${member.profiles.last_name || ''}`.trim(),
                                    avatar: member.profiles.avatar_url,
                                    role: 'developer'
                                });
                            }
                        });
                    }

                    // Add current user to team members
                    const { data: currentUser } = await supabase
                        .from('profiles')
                        .select('id, first_name, last_name, avatar_url')
                        .eq('id', userId)
                        .single();

                    if (currentUser) {
                        teamMembers.push({
                            id: currentUser.id,
                            name: `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim(),
                            avatar: currentUser.avatar_url,
                            role: 'developer'
                        });
                    }

                    // Calculate progress based on project status
                    // This is a simple calculation - you might want to make this more sophisticated
                    let progress = 0;
                    switch (project.status) {
                        case 'open':
                            progress = 10;
                            break;
                        case 'in_progress':
                            progress = 50;
                            break;
                        case 'completed':
                            progress = 100;
                            break;
                        default:
                            progress = 25;
                    }

                    return {
                        ...project,
                        application_status: app.status,
                        users: orgData,
                        teamMembers,
                        progress,
                        dueDate: project.deadline ? new Date(project.deadline).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        }) : null
                    };
                })
            );

            // Filter out null projects before returning
            return projectsWithDetails.filter(project => project !== null) as DashboardProject[];
        } catch (error) {
            console.error('Error fetching active projects:', error);
            throw error;
        }
    }

    async getRecentApplications(userId: string, limit: number = 5): Promise<Application[]> {
        try {
            const { data, error } = await supabase
                .from('applications')
                .select(`
          *,
          projects (
            id,
            title,
            organization_id
          )
        `)
                .eq('developer_id', userId)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;

            // Get organization details separately for each application
            const applicationsWithOrgs = await Promise.all(
                (data || []).map(async (app: any) => {
                    if (app.projects?.organization_id) {
                        const { data: orgData } = await supabase
                            .from('profiles')
                            .select('first_name, last_name, organization_name')
                            .eq('id', app.projects.organization_id)
                            .single();

                        return {
                            ...app,
                            projects: {
                                ...app.projects,
                                users: orgData ? {
                                    name: orgData.organization_name || `${orgData.first_name || ''} ${orgData.last_name || ''}`.trim()
                                } : null
                            }
                        };
                    }
                    return app;
                })
            );

            return applicationsWithOrgs;
        } catch (error) {
            console.error('Error fetching recent applications:', error);
            throw error;
        }
    }

    async getAchievements(userId: string, stats: DeveloperStats): Promise<Achievement[]> {
        try {
            // Define achievement criteria
            const achievements: Achievement[] = [
                {
                    id: 'first_application',
                    title: 'First Step',
                    description: 'Submit your first project application',
                    icon: 'Send',
                    achieved: stats.totalApplications >= 1
                },
                {
                    id: 'five_applications',
                    title: 'Active Seeker',
                    description: 'Submit 5 project applications',
                    icon: 'Target',
                    achieved: stats.totalApplications >= 5,
                    progress: Math.min(stats.totalApplications, 5),
                    maxProgress: 5
                },
                {
                    id: 'first_acceptance',
                    title: 'Breakthrough',
                    description: 'Get your first application accepted',
                    icon: 'CheckCircle',
                    achieved: stats.acceptedApplications >= 1
                },
                {
                    id: 'high_acceptance_rate',
                    title: 'Quality Applications',
                    description: 'Maintain a 50%+ acceptance rate with 3+ applications',
                    icon: 'TrendingUp',
                    achieved: stats.acceptanceRate >= 50 && stats.totalApplications >= 3
                },
                {
                    id: 'active_collaborator',
                    title: 'Team Player',
                    description: 'Work on 2 active projects simultaneously',
                    icon: 'Users',
                    achieved: stats.activeProjects >= 2,
                    progress: Math.min(stats.activeProjects, 2),
                    maxProgress: 2
                },
                {
                    id: 'project_completer',
                    title: 'Finisher',
                    description: 'Complete your first project',
                    icon: 'Award',
                    achieved: stats.completedProjects >= 1
                },
                {
                    id: 'experienced_developer',
                    title: 'Experienced',
                    description: 'Complete 3 projects',
                    icon: 'Star',
                    achieved: stats.completedProjects >= 3,
                    progress: Math.min(stats.completedProjects, 3),
                    maxProgress: 3
                }
            ];

            return achievements;
        } catch (error) {
            console.error('Error calculating achievements:', error);
            throw error;
        }
    }

    async getRecommendedProjects(userId: string, limit: number = 3): Promise<RecommendedProject[]> {
        try {
            // Get user profile to understand skills (only use fields that exist)
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('skills')
                .eq('id', userId)
                .single();

            if (profileError) throw profileError;

            // Get projects the user hasn't applied to
            const { data: userApplications, error: appsError } = await supabase
                .from('applications')
                .select('project_id')
                .eq('developer_id', userId);

            if (appsError) throw appsError;

            const appliedProjectIds = userApplications?.map((app: any) => app.project_id) || [];

            // Get available projects
            let projectsQuery = supabase
                .from('projects')
                .select(`
          *
        `)
                .eq('status', 'open');

            // Only add the filter if there are applied project IDs
            if (appliedProjectIds.length > 0) {
                projectsQuery = projectsQuery.not('id', 'in', `(${appliedProjectIds.join(',')})`);
            }

            const { data: projects, error: projectsError } = await projectsQuery.limit(10);

            if (projectsError) throw projectsError;

            // Get organization details for each project and calculate match scores
            const recommendedProjects: RecommendedProject[] = await Promise.all(
                (projects || []).map(async (project: any) => {
                    let matchScore = 0;
                    const matchReasons: string[] = [];

                    // Get organization info
                    let orgData = null;
                    if (project.organization_id) {
                        const { data: org } = await supabase
                            .from('profiles')
                            .select('id, first_name, last_name, organization_name, avatar_url')
                            .eq('id', project.organization_id)
                            .single();
                        orgData = org ? {
                            ...org,
                            name: org.organization_name || `${org.first_name || ''} ${org.last_name || ''}`.trim()
                        } : null;
                    }

                    // Skill matching (only matching criterion since other fields don't exist)
                    if (profile?.skills && project.technology_stack) {
                        const userSkills = profile.skills.map((skill: string) => skill.toLowerCase());
                        const projectTechs = project.technology_stack.map((tech: string) => tech.toLowerCase());
                        const skillMatches = projectTechs.filter((tech: string) =>
                            userSkills.some((skill: string) => tech.includes(skill) || skill.includes(tech))
                        );

                        if (skillMatches.length > 0) {
                            matchScore += skillMatches.length * 30; // Increased weight since it's the main factor
                            matchReasons.push(`Matches ${skillMatches.length} of your skills`);
                        }
                    }

                    // Recent activity bonus
                    const daysSinceCreated = Math.floor(
                        (Date.now() - new Date(project.created_at).getTime()) / (1000 * 60 * 60 * 24)
                    );
                    if (daysSinceCreated <= 7) {
                        matchScore += 10;
                        matchReasons.push('Recently posted');
                    }

                    // Add some base score for all projects
                    matchScore += 10;
                    if (matchReasons.length === 0) {
                        matchReasons.push('Available project');
                    }

                    return {
                        ...project,
                        users: orgData,
                        matchScore: Math.min(matchScore, 100),
                        matchReasons
                    };
                })
            );

            return recommendedProjects.sort((a: RecommendedProject, b: RecommendedProject) => b.matchScore - a.matchScore).slice(0, limit);
        } catch (error) {
            console.error('Error fetching recommended projects:', error);
            throw error;
        }
    }

    async refreshDashboardData(userId: string) {
        try {
            const [stats, activeProjects, recentApplications] = await Promise.all([
                this.getDeveloperStats(userId),
                this.getActiveProjects(userId),
                this.getRecentApplications(userId)
            ]);

            const [recentAchievements, recentActivity, recommendations] = await Promise.all([
                this.getRecentAchievements(userId),
                this.getRecentActivity(userId),
                this.getRecommendedProjects(userId)
            ]);

            // Also get all achievements for backward compatibility
            const achievements = await this.getAchievements(userId, stats);

            return {
                stats,
                activeProjects,
                recentApplications,
                achievements,
                recentAchievements,
                recentActivity,
                recommendations
            };
        } catch (error) {
            console.error('Error refreshing dashboard data:', error);
            throw error;
        }
    }

    async getRecentAchievements(userId: string, limit: number = 4): Promise<RecentAchievement[]> {
        try {
            // Get user stats and all achievements
            const stats = await this.getDeveloperStats(userId);
            const allAchievements = await this.getAchievements(userId, stats);

            // Get application history to determine when achievements were earned
            const { data: applications, error: appsError } = await supabase
                .from('applications')
                .select('status, created_at, updated_at')
                .eq('developer_id', userId)
                .order('created_at', { ascending: true });

            if (appsError) throw appsError;

            const recentAchievements: RecentAchievement[] = [];

            // Calculate when each achievement was earned
            allAchievements.forEach(achievement => {
                if (!achievement.achieved) return;

                let earnedDate: string | undefined;
                let earnedTimestamp: string | undefined;

                switch (achievement.id) {
                    case 'first_application':
                        if (applications && applications.length > 0) {
                            earnedDate = applications[0].created_at;
                            earnedTimestamp = new Date(applications[0].created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                            });
                        }
                        break;

                    case 'five_applications':
                        if (applications && applications.length >= 5) {
                            earnedDate = applications[4].created_at; // 5th application (index 4)
                            earnedTimestamp = new Date(applications[4].created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                            });
                        }
                        break;

                    case 'first_acceptance':
                        const firstAccepted = applications?.find((app: any) => app.status === 'accepted');
                        if (firstAccepted) {
                            earnedDate = firstAccepted.updated_at;
                            earnedTimestamp = new Date(firstAccepted.updated_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                            });
                        }
                        break;

                    case 'high_acceptance_rate':
                        // Earned when user first achieved 50%+ rate with 3+ applications
                        const acceptedApps = applications?.filter((app: any) => app.status === 'accepted') || [];
                        if (acceptedApps.length > 0 && applications && applications.length >= 3) {
                            // Use the date when they reached the threshold
                            const thresholdApp = acceptedApps[Math.ceil(applications.length * 0.5) - 1];
                            if (thresholdApp) {
                                earnedDate = thresholdApp.updated_at;
                                earnedTimestamp = new Date(thresholdApp.updated_at).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                });
                            }
                        }
                        break;

                    default:
                        // For other achievements, use a recent date as approximation
                        earnedTimestamp = new Date().toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        });
                }

                recentAchievements.push({
                    ...achievement,
                    earnedDate,
                    earnedTimestamp
                });
            });

            // Sort by earned date (most recent first) and return limited results
            return recentAchievements
                .filter(achievement => achievement.achieved)
                .sort((a, b) => {
                    if (!a.earnedDate || !b.earnedDate) return 0;
                    return new Date(b.earnedDate).getTime() - new Date(a.earnedDate).getTime();
                })
                .slice(0, limit);

        } catch (error) {
            console.error('Error fetching recent achievements:', error);
            throw error;
        }
    }

    async getRecentActivity(userId: string, limit: number = 4): Promise<ActivityItem[]> {
        try {
            const activities: ActivityItem[] = [];

            // Get recent applications
            const { data: recentApps, error: appsError } = await supabase
                .from('applications')
                .select(`
                    id,
                    status,
                    created_at,
                    updated_at,
                    projects (
                        id,
                        title,
                        organization_id,
                        users:profiles!projects_organization_id_fkey (
                            organization_name,
                            first_name,
                            last_name
                        )
                    )
                `)
                .eq('developer_id', userId)
                .order('updated_at', { ascending: false })
                .limit(5);

            if (appsError) throw appsError;

            // Process application activities
            recentApps?.forEach((app: any) => {
                const orgName = app.projects?.users?.organization_name ||
                    `${app.projects?.users?.first_name || ''} ${app.projects?.users?.last_name || ''}`.trim() ||
                    'Unknown Organization';

                // Application submission
                activities.push({
                    id: `app_submitted_${app.id}`,
                    type: 'application_submitted',
                    title: 'Application Submitted',
                    description: `Applied to ${app.projects?.title} at ${orgName}`,
                    timestamp: this.formatActivityTime(app.created_at),
                    relatedId: app.projects?.id,
                    relatedData: app
                });

                // Application status changes (if updated after creation)
                if (app.updated_at !== app.created_at && app.status !== 'pending') {
                    let activityType: ActivityItem['type'];
                    let title: string;
                    let description: string;

                    switch (app.status) {
                        case 'accepted':
                            activityType = 'application_accepted';
                            title = 'Application Accepted';
                            description = `Your application to ${app.projects?.title} was accepted!`;
                            break;
                        case 'rejected':
                            activityType = 'application_rejected';
                            title = 'Application Decision';
                            description = `Application to ${app.projects?.title} was not selected`;
                            break;
                        default:
                            return; // Skip other statuses
                    }

                    activities.push({
                        id: `app_${app.status}_${app.id}`,
                        type: activityType,
                        title,
                        description,
                        timestamp: this.formatActivityTime(app.updated_at),
                        relatedId: app.projects?.id,
                        relatedData: app
                    });
                }
            });

            // Get recent messages - split into two queries to avoid RLS issues
            const activities_messages: any[] = [];

            // First, get messages sent by the user
            const { data: sentMessages, error: sentError } = await supabase
                .from('messages')
                .select(`
                    id,
                    content,
                    created_at,
                    sender_id,
                    project_id,
                    projects (
                        id,
                        title
                    ),
                    sender:profiles!messages_sender_id_fkey (
                        first_name,
                        last_name,
                        organization_name,
                        role
                    )
                `)
                .eq('sender_id', userId)
                .order('created_at', { ascending: false })
                .limit(5);

            if (!sentError && sentMessages) {
                activities_messages.push(...sentMessages);
            }

            // Second, get user's accepted project IDs
            const { data: acceptedProjects, error: projectsError } = await supabase
                .from('applications')
                .select('project_id')
                .eq('developer_id', userId)
                .eq('status', 'accepted');

            if (!projectsError && acceptedProjects && acceptedProjects.length > 0) {
                const projectIds = acceptedProjects.map((app: { project_id: string }) => app.project_id);

                // Get messages from projects where user is a member
                const { data: projectMessages, error: projMsgError } = await supabase
                    .from('messages')
                    .select(`
                        id,
                        content,
                        created_at,
                        sender_id,
                        project_id,
                        projects (
                            id,
                            title
                        ),
                        sender:profiles!messages_sender_id_fkey (
                            first_name,
                            last_name,
                            organization_name,
                            role
                        )
                    `)
                    .in('project_id', projectIds)
                    .neq('sender_id', userId) // Exclude messages already fetched above
                    .order('created_at', { ascending: false })
                    .limit(5);

                if (!projMsgError && projectMessages) {
                    activities_messages.push(...projectMessages);
                }
            }

            // Process all messages and remove duplicates
            const uniqueMessages = activities_messages
                .filter((message, index, self) =>
                    index === self.findIndex(m => m.id === message.id)
                )
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, 3);

            uniqueMessages.forEach((message: any) => {
                const senderName = message.sender?.organization_name ||
                    `${message.sender?.first_name || ''} ${message.sender?.last_name || ''}`.trim() ||
                    'Team member';

                const isSentByUser = message.sender_id === userId;

                activities.push({
                    id: `message_${message.id}`,
                    type: isSentByUser ? 'message_sent' : 'message_received',
                    title: isSentByUser ? 'Message Sent' : 'New Message',
                    description: isSentByUser
                        ? `You sent a message in ${message.projects?.title}`
                        : `${senderName} sent you a message in ${message.projects?.title}`,
                    timestamp: this.formatActivityTime(message.created_at),
                    relatedId: message.projects?.id,
                    relatedData: message
                });
            });

            // Sort all activities by timestamp and return limited results
            return activities
                .sort((a, b) => {
                    // Extract the actual date for sorting
                    const getDateFromTimestamp = (timestamp: string) => {
                        if (timestamp.includes('Today')) return new Date();
                        if (timestamp.includes('Yesterday')) {
                            const yesterday = new Date();
                            yesterday.setDate(yesterday.getDate() - 1);
                            return yesterday;
                        }
                        return new Date(timestamp);
                    };

                    return getDateFromTimestamp(b.timestamp).getTime() - getDateFromTimestamp(a.timestamp).getTime();
                })
                .slice(0, limit);

        } catch (error) {
            console.error('Error fetching recent activity:', error);
            throw error;
        }
    }

    private formatActivityTime(dateString: string): string {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
        const diffInDays = Math.floor(diffInHours / 24);

        if (diffInHours < 1) {
            return 'Just now';
        } else if (diffInHours < 24) {
            return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
        } else if (diffInDays === 1) {
            return 'Yesterday';
        } else if (diffInDays < 7) {
            return `${diffInDays} days ago`;
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        }
    }
}

export const dashboardService = new DashboardService(); 