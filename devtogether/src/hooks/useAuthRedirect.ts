import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import type { UserRole } from '../types/database'

interface UseAuthRedirectOptions {
    requireAuth?: boolean
    requiredRole?: UserRole | UserRole[]
    redirectTo?: string
    redirectOnAuth?: string
}

export const useAuthRedirect = (options: UseAuthRedirectOptions = {}) => {
    const {
        requireAuth = false,
        requiredRole,
        redirectTo = '/auth/login',
        redirectOnAuth
    } = options

    const { isAuthenticated, profile, loading } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        // Don't redirect while loading
        if (loading) return

        // If auth is required but user is not authenticated
        if (requireAuth && !isAuthenticated) {
            navigate(redirectTo, {
                state: { from: location.pathname },
                replace: true
            })
            return
        }

        // If user is authenticated but shouldn't be on this route
        if (isAuthenticated && redirectOnAuth) {
            const defaultRedirect = profile?.role === 'developer'
                ? '/dashboard'
                : '/organization/dashboard'

            navigate(redirectOnAuth || defaultRedirect, { replace: true })
            return
        }

        // Check role requirements
        if (requiredRole && profile) {
            const hasRequiredRole = Array.isArray(requiredRole)
                ? requiredRole.includes(profile.role)
                : profile.role === requiredRole

            if (!hasRequiredRole) {
                const roleDashboard = profile.role === 'developer'
                    ? '/dashboard'
                    : '/organization/dashboard'
                navigate(roleDashboard, { replace: true })
            }
        }
    }, [
        isAuthenticated,
        profile,
        loading,
        requireAuth,
        requiredRole,
        redirectTo,
        redirectOnAuth,
        navigate,
        location.pathname
    ])

    return {
        isAuthenticated,
        profile,
        loading,
        canAccess: loading
            ? false
            : !requireAuth || (isAuthenticated && (!requiredRole || (
                profile && (
                    Array.isArray(requiredRole)
                        ? requiredRole.includes(profile.role)
                        : profile.role === requiredRole
                )
            )))
    }
}

export default useAuthRedirect 