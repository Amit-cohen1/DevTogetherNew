import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Session } from '@supabase/supabase-js'
import { AuthService, type AuthUser, type SignUpData, type SignInData, type PasswordResetData, type OAuthProvider } from '../services/auth'
import type { User } from '../types/database'
import { toastService } from '../services/toastService';

interface AuthContextType {
    // Auth state
    user: AuthUser | null
    profile: User | null
    session: Session | null
    loading: boolean

    // Auth actions
    signUp: (data: SignUpData) => Promise<{ success: boolean; error: string | null }>
    signIn: (data: SignInData) => Promise<{ success: boolean; error: string | null }>
    signInWithOAuth: (provider: OAuthProvider) => Promise<{ success: boolean; error: string | null }>
    signOut: () => Promise<{ success: boolean; error: string | null }>
    resetPassword: (data: PasswordResetData) => Promise<{ success: boolean; error: string | null }>
    updatePassword: (newPassword: string) => Promise<{ success: boolean; error: string | null }>
    updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; error: string | null }>
    refreshSession: () => Promise<void>

    // Utility methods
    isAuthenticated: boolean
    isDeveloper: boolean
    isOrganization: boolean
    isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
    children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null)
    const [profile, setProfile] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)

    // Initialize auth state
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                setLoading(true)

                // Get current session
                const { session: currentSession, error: sessionError } = await AuthService.getSession()

                if (sessionError) {
                    console.error('Session error:', sessionError.message)
                    return
                }

                if (currentSession) {
                    setSession(currentSession)
                    setUser(currentSession.user as AuthUser)

                    // Load user profile
                    await loadUserProfile(currentSession.user.id)
                }
            } catch (error) {
                console.error('Auth initialization error:', error)
            } finally {
                setLoading(false)
            }
        }

        initializeAuth()
    }, [])

    // Subscribe to auth changes
    useEffect(() => {
        const { data: { subscription } } = AuthService.onAuthStateChange(async (authUser) => {
            setUser(authUser)

            if (authUser) {
                // Get fresh session
                const { session: currentSession } = await AuthService.getSession()
                setSession(currentSession)

                // Load user profile
                await loadUserProfile(authUser.id)
            } else {
                setSession(null)
                setProfile(null)
            }

            setLoading(false)
        })

        return () => {
            subscription?.unsubscribe()
        }
    }, [])

    // Load user profile from database
    const loadUserProfile = async (userId: string) => {
        try {
            const { profile: userProfile, error } = await AuthService.getUserProfile(userId)

            if (error) {
                console.error('Error loading user profile:', error.message)
                return
            }

            setProfile(userProfile)
        } catch (error) {
            console.error('Profile loading error:', error)
        }
    }

    // Sign up
    const signUp = async (data: SignUpData): Promise<{ success: boolean; error: string | null }> => {
        try {
            const { user, error } = await AuthService.signUp(data)

            if (error) {
                return { success: false, error: error.message }
            }

            // Note: User will be automatically handled by auth state change listener
            return { success: true, error: null }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            }
        }
    }

    // Sign in
    const signIn = async (data: SignInData): Promise<{ success: boolean; error: string | null }> => {
        try {
            const { user, error } = await AuthService.signIn(data)

            if (error) {
                toastService.auth.loginError();
                return { success: false, error: error.message }
            }

            toastService.auth.loginSuccess();
            // Note: User will be automatically handled by auth state change listener
            return { success: true, error: null }
        } catch (error) {
            toastService.auth.loginError();
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            }
        }
    }

    // Sign in with OAuth
    const signInWithOAuth = async (provider: OAuthProvider): Promise<{ success: boolean; error: string | null }> => {
        try {
            const { error } = await AuthService.signInWithOAuth(provider)

            if (error) {
                return { success: false, error: error.message }
            }

            return { success: true, error: null }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            }
        }
    }

    // Sign out
    const signOut = async (): Promise<{ success: boolean; error: string | null }> => {
        try {
            const { error } = await AuthService.signOut()

            if (error) {
                toastService.error('Failed to sign out')
                return { success: false, error: error.message }
            }

            // Clear local state
            setUser(null)
            setProfile(null)
            setSession(null)

            toastService.auth.logoutSuccess();
            return { success: true, error: null }
        } catch (error) {
            toastService.error('Failed to sign out')
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            }
        }
    }

    // Reset password
    const resetPassword = async (data: PasswordResetData): Promise<{ success: boolean; error: string | null }> => {
        try {
            const { error } = await AuthService.resetPassword(data)

            if (error) {
                return { success: false, error: error.message }
            }

            return { success: true, error: null }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            }
        }
    }

    // Update password
    const updatePassword = async (newPassword: string): Promise<{ success: boolean; error: string | null }> => {
        try {
            const { error } = await AuthService.updatePassword(newPassword)

            if (error) {
                return { success: false, error: error.message }
            }

            return { success: true, error: null }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            }
        }
    }

    // Update profile
    const updateProfile = async (updates: Partial<User>): Promise<{ success: boolean; error: string | null }> => {
        try {
            if (!user) {
                toastService.profile.error();
                return { success: false, error: 'User not authenticated' }
            }

            const { profile: updatedProfile, error } = await AuthService.updateUserProfile(user.id, updates)

            if (error) {
                toastService.profile.error();
                return { success: false, error: error.message }
            }

            setProfile(updatedProfile)
            toastService.profile.updated();
            return { success: true, error: null }
        } catch (error) {
            toastService.profile.error();
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            }
        }
    }

    // Refresh session
    const refreshSession = async (): Promise<void> => {
        try {
            const { session: newSession } = await AuthService.refreshSession()
            setSession(newSession)
        } catch (error) {
            console.error('Session refresh error:', error)
        }
    }

    // Computed values
    const isAuthenticated = !!user && !!session
    const isDeveloper = ['developer', 'admin'].includes((profile?.role as unknown as string) ?? '')
    const isOrganization = (profile?.role as unknown as string) === 'organization'
    // Admin can be flagged either via dedicated role (future) or legacy boolean flag
    const isAdmin = (profile?.role as unknown as string) === 'admin' || profile?.is_admin === true

    const value: AuthContextType = {
        // State
        user,
        profile,
        session,
        loading,

        // Actions
        signUp,
        signIn,
        signInWithOAuth,
        signOut,
        resetPassword,
        updatePassword,
        updateProfile,
        refreshSession,

        // Computed values
        isAuthenticated,
        isDeveloper,
        isOrganization,
        isAdmin,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext)

    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }

    return context
}

export default AuthContext 