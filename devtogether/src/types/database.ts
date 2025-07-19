export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    email: string
                    role: 'developer' | 'organization' | 'admin'
                    first_name: string | null
                    last_name: string | null
                    organization_name: string | null
                    bio: string | null
                    skills: string[] | null
                    location: string | null
                    website: string | null
                    linkedin: string | null
                    github: string | null
                    portfolio: string | null
                    avatar_url: string | null
                    is_public: boolean | null
                    share_token: string | null
                    security_string: string | null
                    security_string_updated_at: string | null
                    profile_views: number | null
                    organization_verified: boolean | null
                    organization_verified_at: string | null
                    organization_verified_by: string | null
                    organization_rejection_reason: string | null
                    onboarding_complete: boolean | null
                    current_rating: number | null
                    total_stars_earned: number | null
                    spotlight_enabled: boolean | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    email: string
                    role: 'developer' | 'organization' | 'admin'
                    first_name?: string | null
                    last_name?: string | null
                    organization_name?: string | null
                    bio?: string | null
                    skills?: string[] | null
                    location?: string | null
                    website?: string | null
                    linkedin?: string | null
                    github?: string | null
                    portfolio?: string | null
                    avatar_url?: string | null
                    is_public?: boolean | null
                    share_token?: string | null
                    security_string?: string | null
                    security_string_updated_at?: string | null
                    profile_views?: number | null
                    organization_verified?: boolean | null
                    organization_verified_at?: string | null
                    organization_verified_by?: string | null
                    organization_rejection_reason?: string | null
                    onboarding_complete?: boolean | null
                    current_rating?: number | null
                    total_stars_earned?: number | null
                    spotlight_enabled?: boolean | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    role?: 'developer' | 'organization' | 'admin'
                    first_name?: string | null
                    last_name?: string | null
                    organization_name?: string | null
                    bio?: string | null
                    skills?: string[] | null
                    location?: string | null
                    website?: string | null
                    linkedin?: string | null
                    github?: string | null
                    portfolio?: string | null
                    avatar_url?: string | null
                    is_public?: boolean | null
                    share_token?: string | null
                    security_string?: string | null
                    security_string_updated_at?: string | null
                    profile_views?: number | null
                    organization_verified?: boolean | null
                    organization_verified_at?: string | null
                    organization_verified_by?: string | null
                    organization_rejection_reason?: string | null
                    onboarding_complete?: boolean | null
                    current_rating?: number | null
                    total_stars_earned?: number | null
                    spotlight_enabled?: boolean | null
                    created_at?: string
                    updated_at?: string
                }
            }
            projects: {
                Row: {
                    id: string
                    organization_id: string
                    title: string
                    description: string
                    requirements: string
                    technology_stack: string[]
                    difficulty_level: 'beginner' | 'intermediate' | 'advanced'
                    status: 'pending' | 'open' | 'in_progress' | 'completed' | 'cancelled' | 'rejected'
                    application_type: 'individual' | 'team' | 'both'
                    max_team_size: number | null
                    deadline: string | null
                    estimated_duration: string | null
                    is_remote: boolean
                    location: string | null
                    rejection_reason: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    organization_id: string
                    title: string
                    description: string
                    requirements: string
                    technology_stack: string[]
                    difficulty_level: 'beginner' | 'intermediate' | 'advanced'
                    status?: 'pending' | 'open' | 'in_progress' | 'completed' | 'cancelled' | 'rejected'
                    application_type: 'individual' | 'team' | 'both'
                    max_team_size?: number | null
                    deadline?: string | null
                    estimated_duration?: string | null
                    is_remote?: boolean
                    location?: string | null
                    rejection_reason?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    organization_id?: string
                    title?: string
                    description?: string
                    requirements?: string
                    technology_stack?: string[]
                    difficulty_level?: 'beginner' | 'intermediate' | 'advanced'
                    status?: 'pending' | 'open' | 'in_progress' | 'completed' | 'cancelled' | 'rejected'
                    application_type?: 'individual' | 'team' | 'both'
                    max_team_size?: number | null
                    deadline?: string | null
                    estimated_duration?: string | null
                    is_remote?: boolean
                    location?: string | null
                    rejection_reason?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            applications: {
                Row: {
                    id: string
                    project_id: string
                    developer_id: string
                    status: 'pending' | 'accepted' | 'rejected' | 'withdrawn' | 'removed'
                    cover_letter: string | null
                    portfolio_links: string[] | null
                    status_manager: boolean | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    project_id: string
                    developer_id: string
                    status?: 'pending' | 'accepted' | 'rejected' | 'withdrawn' | 'removed'
                    cover_letter?: string | null
                    portfolio_links?: string[] | null
                    status_manager?: boolean | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    project_id?: string
                    developer_id?: string
                    status?: 'pending' | 'accepted' | 'rejected' | 'withdrawn' | 'removed'
                    cover_letter?: string | null
                    portfolio_links?: string[] | null
                    status_manager?: boolean | null
                    created_at?: string
                    updated_at?: string
                }
            }
            messages: {
                Row: {
                    id: string
                    project_id: string
                    sender_id: string
                    content: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    project_id: string
                    sender_id: string
                    content: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    project_id?: string
                    sender_id?: string
                    content?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            search_history: {
                Row: {
                    id: string
                    user_id: string
                    search_term: string
                    filters: Json | null
                    result_count: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    search_term: string
                    filters?: Json | null
                    result_count: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    search_term?: string
                    filters?: Json | null
                    result_count?: number
                    created_at?: string
                }
            }
            popular_searches: {
                Row: {
                    id: string
                    search_term: string
                    search_count: number
                    last_searched: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    search_term: string
                    search_count?: number
                    last_searched?: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    search_term?: string
                    search_count?: number
                    last_searched?: string
                    created_at?: string
                }
            }
            search_analytics: {
                Row: {
                    id: string
                    search_term: string
                    user_id: string | null
                    result_count: number
                    clicked_project_id: string | null
                    click_position: number | null
                    session_id: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    search_term: string
                    user_id?: string | null
                    result_count: number
                    clicked_project_id?: string | null
                    click_position?: number | null
                    session_id?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    search_term?: string
                    user_id?: string | null
                    result_count?: number
                    clicked_project_id?: string | null
                    click_position?: number | null
                    session_id?: string | null
                    created_at?: string
                }
            }
            team_activities: {
                Row: {
                    id: string
                    project_id: string
                    user_id: string
                    activity_type: 'joined' | 'left' | 'promoted' | 'demoted' | 'status_updated' | 'message_sent'
                    activity_data: Json | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    project_id: string
                    user_id: string
                    activity_type: 'joined' | 'left' | 'promoted' | 'demoted' | 'status_updated' | 'message_sent'
                    activity_data?: Json | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    project_id?: string
                    user_id?: string
                    activity_type?: 'joined' | 'left' | 'promoted' | 'demoted' | 'status_updated' | 'message_sent'
                    activity_data?: Json | null
                    created_at?: string
                }
            }
            partner_applications: {
                Row: {
                    id: string
                    organization_id: string
                    company_size: string
                    industry: string
                    why_partner: string
                    website: string
                    status: 'pending' | 'approved' | 'rejected'
                    created_at: string
                    reviewed_at: string | null
                    reviewed_by: string | null
                }
                Insert: {
                    id?: string
                    organization_id: string
                    company_size: string
                    industry: string
                    why_partner: string
                    website: string
                    status?: 'pending' | 'approved' | 'rejected'
                    created_at?: string
                    reviewed_at?: string | null
                    reviewed_by?: string | null
                }
                Update: {
                    id?: string
                    organization_id?: string
                    company_size?: string
                    industry?: string
                    why_partner?: string
                    website?: string
                    status?: 'pending' | 'approved' | 'rejected'
                    created_at?: string
                    reviewed_at?: string | null
                    reviewed_by?: string | null
                }
            }
            profile_analytics: {
                Row: {
                    id: string
                    profile_id: string
                    viewer_id: string | null
                    view_date: string
                    view_type: 'direct' | 'shared_link' | 'search'
                    created_at: string
                }
                Insert: {
                    id?: string
                    profile_id: string
                    viewer_id?: string | null
                    view_date?: string
                    view_type: 'direct' | 'shared_link' | 'search'
                    created_at?: string
                }
                Update: {
                    id?: string
                    profile_id?: string
                    viewer_id?: string | null
                    view_date?: string
                    view_type?: 'direct' | 'shared_link' | 'search'
                    created_at?: string
                }
            }
            organization_images: {
                Row: {
                    id: string
                    organization_id: string
                    image_url: string
                    category: 'team' | 'office' | 'events' | 'projects' | 'impact' | null
                    title: string | null
                    description: string | null
                    display_order: number | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    organization_id: string
                    image_url: string
                    category?: 'team' | 'office' | 'events' | 'projects' | 'impact' | null
                    title?: string | null
                    description?: string | null
                    display_order?: number | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    organization_id?: string
                    image_url?: string
                    category?: 'team' | 'office' | 'events' | 'projects' | 'impact' | null
                    title?: string | null
                    description?: string | null
                    display_order?: number | null
                    created_at?: string
                    updated_at?: string
                }
            }
            organization_metrics: {
                Row: {
                    id: string
                    organization_id: string
                    metric_name: string
                    metric_value: string
                    metric_type: 'number' | 'percentage' | 'text' | null
                    display_order: number | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    organization_id: string
                    metric_name: string
                    metric_value: string
                    metric_type?: 'number' | 'percentage' | 'text' | null
                    display_order?: number | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    organization_id?: string
                    metric_name?: string
                    metric_value?: string
                    metric_type?: 'number' | 'percentage' | 'text' | null
                    display_order?: number | null
                    created_at?: string
                    updated_at?: string
                }
            }
            developer_testimonials: {
                Row: {
                    id: string
                    organization_id: string
                    developer_id: string
                    testimonial_text: string
                    project_id: string | null
                    rating: number | null
                    is_featured: boolean | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    organization_id: string
                    developer_id: string
                    testimonial_text: string
                    project_id?: string | null
                    rating?: number | null
                    is_featured?: boolean | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    organization_id?: string
                    developer_id?: string
                    testimonial_text?: string
                    project_id?: string | null
                    rating?: number | null
                    is_featured?: boolean | null
                    created_at?: string
                    updated_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

// Common types
export type User = Tables<'profiles'>
export interface Project {
    id: string
    organization_id: string
    title: string
    description: string
    requirements: string
    technology_stack: string[]
    difficulty_level: 'beginner' | 'intermediate' | 'advanced'
    status: 'pending' | 'open' | 'in_progress' | 'completed' | 'cancelled' | 'rejected'
    application_type: 'individual' | 'team' | 'both'
    max_team_size: number | null
    deadline: string | null
    estimated_duration: string | null
    is_remote: boolean
    location: string | null
    rejection_reason: string | null
    created_at: string
    updated_at: string
    // New fields for admin workspace access
    admin_workspace_access_requested?: boolean
    admin_workspace_access_granted?: boolean
    // Add can_resubmit for rejected projects
    can_resubmit?: boolean
}
export type Application = Tables<'applications'>
export type Message = Tables<'messages'>
export type ProfileAnalytics = Tables<'profile_analytics'>

export type UserRole = User['role']
export type ProjectStatus = 'pending' | 'open' | 'in_progress' | 'completed' | 'cancelled' | 'rejected';
export type DifficultyLevel = Project['difficulty_level']
export type ApplicationType = Project['application_type']
export type ApplicationStatus = Application['status']

// Add OrganizationStatus type
export type OrganizationStatus = 'pending' | 'approved' | 'rejected' | 'blocked';

// Extend Profile type
export interface Profile {
    id: string
    email: string
    role: 'developer' | 'organization' | 'admin'
    first_name: string | null
    last_name: string | null
    organization_name: string | null
    bio: string | null
    skills: string[] | null
    location: string | null
    website: string | null
    linkedin: string | null
    github: string | null
    portfolio: string | null
    avatar_url: string | null
    is_public: boolean | null
    share_token: string | null
    profile_views: number | null
    /**
     * @deprecated Use organization_status instead
     */
    organization_verified: boolean | null
    organization_verified_at: string | null
    organization_verified_by: string | null
    organization_rejection_reason: string | null
    onboarding_complete: boolean | null
    created_at: string
    updated_at: string
    // New moderation fields
    organization_status?: OrganizationStatus // 'pending', 'approved', 'rejected', 'blocked'
    can_resubmit?: boolean
    blocked?: boolean
    blocked_reason?: string | null
}

// Search related types
export interface SearchHistory {
    id: string
    user_id: string
    search_term: string
    filters: Json | null
    result_count: number
    created_at: string
}

export interface PopularSearch {
    id: string
    search_term: string
    search_count: number
    last_searched: string
    created_at: string
}

export interface SearchAnalytics {
    id: string
    search_term: string
    user_id: string | null
    result_count: number
    clicked_project_id: string | null
    click_position: number | null
    session_id: string | null
    created_at: string
}

export interface SearchFilters {
    technology_stack?: string[]
    difficulty_level?: string[]
    application_type?: string[]
    status?: string[]
    is_remote?: boolean | null
    organization_type?: string
    team_size?: string
    date_range?: {
        start?: string
        end?: string
    }
    location?: {
        city?: string
        radius?: number
    }
}

export interface SearchResult {
    projects: ProjectWithTeamMembers[]
    total_count: number
    search_time: number
    suggestions?: string[]
}

export interface SearchSuggestion {
    text: string
    type: 'project' | 'technology' | 'organization' | 'skill'
    count?: number
}

// Team Member interfaces for proper team composition
export interface TeamMember {
    id: string
    type: 'organization' | 'developer'
    profile: {
        id: string
        first_name: string | null
        last_name: string | null
        organization_name?: string | null
        avatar_url: string | null
        email?: string
        is_public?: boolean | null
        security_string?: string | null
        skills?: string[] | null
    }
    role: 'owner' | 'member' | 'status_manager'
    application?: Application // Only present for developers
    joined_at?: string
    status?: 'active' | 'inactive'
    status_manager?: boolean
}

export interface ProjectWithTeamMembers extends Project {
    organization?: {
        id: string
        organization_name: string | null
        avatar_url: string | null
        email?: string
    }
    team_members: TeamMember[]
    applications?: Array<{
        id: string
        status: string
        status_manager?: boolean
        developer: {
            id: string
            first_name: string | null
            last_name: string | null
            avatar_url: string | null
        } | null
    }>
    rejection_reason: string | null
    // New fields for admin workspace access
    admin_workspace_access_requested?: boolean
    admin_workspace_access_granted?: boolean
    // Add can_resubmit for rejected projects
    can_resubmit?: boolean
}

// New enhanced organization profile types
export type OrganizationImage = Tables<'organization_images'>
export type OrganizationMetric = Tables<'organization_metrics'>
export type DeveloperTestimonial = Tables<'developer_testimonials'>
export type PartnerApplication = Tables<'partner_applications'>

export type ImageCategory = OrganizationImage['category']
export type MetricType = OrganizationMetric['metric_type']

// Enhanced organization profile interfaces
export interface OrganizationProfileData {
    profile: User
    images: OrganizationImage[]
    metrics: OrganizationMetric[]
    testimonials: DeveloperTestimonial[]
    projects: ProjectWithTeamMembers[]
    stats: {
        totalProjects: number
        activeProjects: number
        completedProjects: number
        totalDevelopers: number
        successRate: number
    }
}

export interface OrganizationGalleryImage {
    id: string
    url: string
    title?: string
    description?: string
    category: ImageCategory
} 