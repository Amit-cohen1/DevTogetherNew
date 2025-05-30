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
            users: {
                Row: {
                    id: string
                    email: string
                    role: 'developer' | 'organization'
                    full_name: string | null
                    avatar_url: string | null
                    bio: string | null
                    skills: string[] | null
                    github_url: string | null
                    linkedin_url: string | null
                    portfolio_url: string | null
                    organization_name: string | null
                    organization_website: string | null
                    organization_description: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    email: string
                    role: 'developer' | 'organization'
                    full_name?: string | null
                    avatar_url?: string | null
                    bio?: string | null
                    skills?: string[] | null
                    github_url?: string | null
                    linkedin_url?: string | null
                    portfolio_url?: string | null
                    organization_name?: string | null
                    organization_website?: string | null
                    organization_description?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    role?: 'developer' | 'organization'
                    full_name?: string | null
                    avatar_url?: string | null
                    bio?: string | null
                    skills?: string[] | null
                    github_url?: string | null
                    linkedin_url?: string | null
                    portfolio_url?: string | null
                    organization_name?: string | null
                    organization_website?: string | null
                    organization_description?: string | null
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
                    technologies: string[]
                    difficulty_level: 'beginner' | 'intermediate' | 'advanced'
                    estimated_duration: string
                    status: 'open' | 'in_progress' | 'completed' | 'cancelled'
                    team_size: number
                    application_deadline: string | null
                    start_date: string | null
                    end_date: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    organization_id: string
                    title: string
                    description: string
                    requirements: string
                    technologies: string[]
                    difficulty_level: 'beginner' | 'intermediate' | 'advanced'
                    estimated_duration: string
                    status?: 'open' | 'in_progress' | 'completed' | 'cancelled'
                    team_size: number
                    application_deadline?: string | null
                    start_date?: string | null
                    end_date?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    organization_id?: string
                    title?: string
                    description?: string
                    requirements?: string
                    technologies?: string[]
                    difficulty_level?: 'beginner' | 'intermediate' | 'advanced'
                    estimated_duration?: string
                    status?: 'open' | 'in_progress' | 'completed' | 'cancelled'
                    team_size?: number
                    application_deadline?: string | null
                    start_date?: string | null
                    end_date?: string | null
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
                    cover_letter: string
                    portfolio_links: string[] | null
                    availability: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    project_id: string
                    developer_id: string
                    status?: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
                    cover_letter: string
                    portfolio_links?: string[] | null
                    availability: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    project_id?: string
                    developer_id?: string
                    status?: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
                    cover_letter?: string
                    portfolio_links?: string[] | null
                    availability?: string
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
                }
                Insert: {
                    id?: string
                    project_id: string
                    sender_id: string
                    content: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    project_id?: string
                    sender_id?: string
                    content?: string
                    created_at?: string
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
    }
} 