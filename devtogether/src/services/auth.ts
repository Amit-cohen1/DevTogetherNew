import { AuthError, Session, User as SupabaseUser, AuthChangeEvent } from '@supabase/supabase-js'
import { supabase, oAuthProviders, type OAuthProvider } from '../utils/supabase'
import type { User, UserRole } from '../types/database'

// Re-export types for easier importing
export type { OAuthProvider }

export interface AuthUser extends SupabaseUser {
    user_metadata: {
        full_name?: string
        avatar_url?: string
        [key: string]: any
    }
}

export interface SignUpData {
    email: string
    password: string
    role: UserRole
    firstName?: string
    lastName?: string
    organizationName?: string
}

export interface SignInData {
    email: string
    password: string
}

export interface PasswordResetData {
    email: string
}

export class AuthService {
    /**
     * Sign up a new user with email and password
     */
    static async signUp(data: SignUpData): Promise<{ user: AuthUser | null; error: AuthError | null }> {
        try {
            const { email, password, role, firstName, lastName, organizationName } = data

            const { data: authData, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                    data: {
                        role,
                        first_name: firstName,
                        last_name: lastName,
                        organization_name: organizationName,
                        full_name: role === 'organization'
                            ? organizationName
                            : `${firstName || ''} ${lastName || ''}`.trim()
                    }
                }
            })

            if (signUpError) {
                return { user: null, error: signUpError }
            }

            return { user: authData.user as AuthUser, error: null }
        } catch (error) {
            return {
                user: null,
                error: new AuthError(error instanceof Error ? error.message : 'Unknown error')
            }
        }
    }

    /**
     * Sign in with email and password
     */
    static async signIn(data: SignInData): Promise<{ user: AuthUser | null; error: AuthError | null }> {
        try {
            const { email, password } = data

            const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password
            })

            if (signInError) {
                return { user: null, error: signInError }
            }

            return { user: authData.user as AuthUser, error: null }
        } catch (error) {
            return {
                user: null,
                error: new AuthError(error instanceof Error ? error.message : 'Unknown error')
            }
        }
    }

    /**
     * Sign in with OAuth provider
     */
    static async signInWithOAuth(provider: OAuthProvider): Promise<{ error: AuthError | null }> {
        try {
            const providerConfig = oAuthProviders[provider]

            const { error } = await supabase.auth.signInWithOAuth(providerConfig)

            return { error }
        } catch (error) {
            return {
                error: new AuthError(error instanceof Error ? error.message : 'Unknown error')
            }
        }
    }

    /**
     * Sign out the current user
     */
    static async signOut(): Promise<{ error: AuthError | null }> {
        try {
            const { error } = await supabase.auth.signOut()
            return { error }
        } catch (error) {
            return {
                error: new AuthError(error instanceof Error ? error.message : 'Unknown error')
            }
        }
    }

    /**
     * Send password reset email
     */
    static async resetPassword(data: PasswordResetData): Promise<{ error: AuthError | null }> {
        try {
            const { email } = data

            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/reset-password`
            })

            return { error }
        } catch (error) {
            return {
                error: new AuthError(error instanceof Error ? error.message : 'Unknown error')
            }
        }
    }

    /**
     * Resend email verification
     */
    static async resendEmailVerification(email: string): Promise<{ error: AuthError | null }> {
        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: email,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`
                }
            })

            return { error }
        } catch (error) {
            return {
                error: new AuthError(error instanceof Error ? error.message : 'Unknown error')
            }
        }
    }

    /**
     * Verify email with token (called from callback)
     */
    static async verifyEmail(token: string, email: string): Promise<{ error: AuthError | null }> {
        try {
            const { error } = await supabase.auth.verifyOtp({
                token_hash: token,
                type: 'signup',
                email: email
            })

            return { error }
        } catch (error) {
            return {
                error: new AuthError(error instanceof Error ? error.message : 'Unknown error')
            }
        }
    }

    /**
     * Update user password
     */
    static async updatePassword(newPassword: string): Promise<{ error: AuthError | null }> {
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            })

            return { error }
        } catch (error) {
            return {
                error: new AuthError(error instanceof Error ? error.message : 'Unknown error')
            }
        }
    }

    /**
     * Get current session
     */
    static async getSession(): Promise<{ session: Session | null; error: AuthError | null }> {
        try {
            const { data, error } = await supabase.auth.getSession()
            return { session: data.session, error }
        } catch (error) {
            return {
                session: null,
                error: new AuthError(error instanceof Error ? error.message : 'Unknown error')
            }
        }
    }

    /**
     * Get current user
     */
    static async getCurrentUser(): Promise<{ user: AuthUser | null; error: AuthError | null }> {
        try {
            const { data, error } = await supabase.auth.getUser()
            return { user: data.user as AuthUser, error }
        } catch (error) {
            return {
                user: null,
                error: new AuthError(error instanceof Error ? error.message : 'Unknown error')
            }
        }
    }

    /**
     * Refresh the current session
     */
    static async refreshSession(): Promise<{ session: Session | null; error: AuthError | null }> {
        try {
            const { data, error } = await supabase.auth.refreshSession()
            return { session: data.session, error }
        } catch (error) {
            return {
                session: null,
                error: new AuthError(error instanceof Error ? error.message : 'Unknown error')
            }
        }
    }

    /**
     * Subscribe to auth state changes
     */
    static onAuthStateChange(callback: (user: AuthUser | null) => void) {
        return supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
            callback(session?.user as AuthUser || null)
        })
    }



    /**
     * Get user profile from database
     */
    static async getUserProfile(userId: string): Promise<{ profile: User | null; error: Error | null }> {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle()

            if (error) {
                return { profile: null, error: new Error(error.message) }
            }

            // If no profile exists, try to create one from auth.users data
            if (!data) {
                // Get the auth user data
                const { data: authUser, error: authError } = await supabase.auth.getUser()

                if (authError || !authUser.user || authUser.user.id !== userId) {
                    return { profile: null, error: new Error('User not found') }
                }

                // Generate a unique security string for the profile
                const securityString = Math.random().toString(36).substring(2, 10)
                
                // Create profile from auth user data
                const newProfile = {
                    id: authUser.user.id,
                    email: authUser.user.email!,
                    role: (authUser.user.user_metadata?.role || 'developer') as UserRole,
                    first_name: authUser.user.user_metadata?.first_name || null,
                    last_name: authUser.user.user_metadata?.last_name || null,
                    organization_name: authUser.user.user_metadata?.organization_name || null,
                    bio: null,
                    skills: [],
                    location: null,
                    website: null,
                    linkedin: null,
                    github: null,
                    portfolio: null,
                    avatar_url: authUser.user.user_metadata?.avatar_url || null,
                    is_public: true,
                    share_token: null,
                    profile_views: 0,
                    security_string: securityString, // ✅ FIXED: Added required security_string
                    security_string_updated_at: new Date().toISOString()
                }

                try {
                    const { data: createdProfile, error: createError } = await supabase
                        .from('profiles')
                        .insert([newProfile])
                        .select()
                        .single()

                    if (createError) {
                        // If RLS error, provide helpful message
                        if (createError.message.includes('row-level security policy')) {
                            return {
                                profile: null,
                                error: new Error(
                                    'Profile creation blocked by security policy. Please run the migration script in Supabase SQL Editor. See: migrate_existing_users.sql'
                                )
                            }
                        }
                        return { profile: null, error: new Error(`Failed to create profile: ${createError.message}`) }
                    }

                    return { profile: createdProfile, error: null }
                } catch (insertError) {
                    // If INSERT fails due to RLS, provide helpful guidance
                    return {
                        profile: null,
                        error: new Error(
                            'Cannot create profile due to database security policies. Please run the migration script: migrate_existing_users.sql'
                        )
                    }
                }
            }

            return { profile: data, error: null }
        } catch (error) {
            return {
                profile: null,
                error: new Error(error instanceof Error ? error.message : 'Unknown error')
            }
        }
    }

    /**
     * Update user profile in database
     */
    static async updateUserProfile(
        userId: string,
        updates: Partial<User>
    ): Promise<{ profile: User | null; error: Error | null }> {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq('id', userId)
                .select()
                .single()

            if (error) {
                return { profile: null, error: new Error(error.message) }
            }

            return { profile: data, error: null }
        } catch (error) {
            return {
                profile: null,
                error: new Error(error instanceof Error ? error.message : 'Unknown error')
            }
        }
    }
} 