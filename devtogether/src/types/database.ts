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
export type User = Tables<'users'>
export type Project = Tables<'projects'>
export type Application = Tables<'applications'>
export type Message = Tables<'messages'>
export type ProjectMember = Tables<'project_members'>

export type UserRole = User['role']
export type ProjectStatus = Project['status']
export type DifficultyLevel = Project['difficulty_level']
export type ApplicationType = Project['application_type']
export type ApplicationStatus = Application['status'] 