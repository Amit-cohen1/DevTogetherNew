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
                    role: 'developer' | 'organization'
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
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    email: string
                    role: 'developer' | 'organization'
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
                    profile_views?: number | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    role?: 'developer' | 'organization'
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
                    profile_views?: number | null
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
                    status: 'open' | 'in_progress' | 'completed' | 'cancelled'
                    application_type: 'individual' | 'team' | 'both'
                    max_team_size: number | null
                    deadline: string | null
                    estimated_duration: string | null
                    is_remote: boolean
                    location: string | null
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
                    status?: 'open' | 'in_progress' | 'completed' | 'cancelled'
                    application_type: 'individual' | 'team' | 'both'
                    max_team_size?: number | null
                    deadline?: string | null
                    estimated_duration?: string | null
                    is_remote?: boolean
                    location?: string | null
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
                    status?: 'open' | 'in_progress' | 'completed' | 'cancelled'
                    application_type?: 'individual' | 'team' | 'both'
                    max_team_size?: number | null
                    deadline?: string | null
                    estimated_duration?: string | null
                    is_remote?: boolean
                    location?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            applications: {
                Row: {
                    id: string
                    project_id: string
                    developer_id: string
                    status: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
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
                    status?: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
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
                    status?: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
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
            project_members: {
                Row: {
                    id: string
                    project_id: string
                    user_id: string
                    role: 'lead' | 'member'
                    joined_at: string
                }
                Insert: {
                    id?: string
                    project_id: string
                    user_id: string
                    role?: 'lead' | 'member'
                    joined_at?: string
                }
                Update: {
                    id?: string
                    project_id?: string
                    user_id?: string
                    role?: 'lead' | 'member'
                    joined_at?: string
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
export type Project = Tables<'projects'>
export type Application = Tables<'applications'>
export type Message = Tables<'messages'>
export type ProjectMember = Tables<'project_members'>
export type ProfileAnalytics = Tables<'profile_analytics'>

export type UserRole = User['role']
export type ProjectStatus = Project['status']
export type DifficultyLevel = Project['difficulty_level']
export type ApplicationType = Project['application_type']
export type ApplicationStatus = Application['status']

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
    projects: Project[]
    total_count: number
    search_time: number
    suggestions?: string[]
}

export interface SearchSuggestion {
    text: string
    type: 'project' | 'technology' | 'organization' | 'skill'
    count?: number
} 