import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://temp.supabase.co'
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'temp_key'

// Development mode check - if environment variables are not set or are placeholder values
const isDevelopmentMode = supabaseUrl === 'https://temp.supabase.co' || supabaseAnonKey === 'temp_key'

if (isDevelopmentMode) {
    console.warn('🚧 Running in development mode without real Supabase. UI testing only - authentication will not work.')
} else {
    console.log('✅ Running with real Supabase authentication')
}

let supabase: any = null

try {
    if (!isDevelopmentMode) {
        supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
            auth: {
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: true,
                flowType: 'pkce'
            }
        })
    } else {
        // Mock supabase client for development
        supabase = {
            auth: {
                signUp: () => Promise.resolve({
                    data: { user: null },
                    error: { message: 'Development mode - please set up real Supabase for authentication' }
                }),
                signInWithPassword: () => Promise.resolve({
                    data: { user: null },
                    error: { message: 'Development mode - please set up real Supabase for authentication' }
                }),
                signInWithOAuth: () => Promise.resolve({
                    error: { message: 'Development mode - please set up real Supabase for authentication' }
                }),
                signOut: () => Promise.resolve({ error: null }),
                resetPasswordForEmail: () => Promise.resolve({ error: null }),
                updateUser: () => Promise.resolve({ error: null }),
                getSession: () => Promise.resolve({ data: { session: null }, error: null }),
                getUser: () => Promise.resolve({ data: { user: null }, error: null }),
                refreshSession: () => Promise.resolve({ data: { session: null }, error: null }),
                onAuthStateChange: (callback: any) => {
                    // Mock subscription
                    return { data: { subscription: { unsubscribe: () => { } } } }
                }
            },
            from: () => ({
                select: () => ({
                    eq: () => ({
                        single: () => Promise.resolve({
                            data: null,
                            error: { message: 'Development mode - please set up real Supabase for database operations' }
                        })
                    })
                }),
                update: () => ({
                    eq: () => ({
                        select: () => ({
                            single: () => Promise.resolve({
                                data: null,
                                error: { message: 'Development mode - please set up real Supabase for database operations' }
                            })
                        })
                    })
                }),
                insert: () => Promise.resolve({
                    data: null,
                    error: { message: 'Development mode - please set up real Supabase for database operations' }
                })
            })
        }
    }
} catch (error) {
    console.error('Supabase initialization error:', error)
}

// OAuth provider configurations
export const oAuthProviders = {
    google: {
        provider: 'google' as const,
        options: {
            redirectTo: `${window.location.origin}/auth/callback`,
            queryParams: {
                access_type: 'offline',
                prompt: 'consent',
            },
        },
    },
    github: {
        provider: 'github' as const,
        options: {
            redirectTo: `${window.location.origin}/auth/callback`,
        },
    },
} as const

export type OAuthProvider = keyof typeof oAuthProviders
export { supabase } 