import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import type { UserRole } from '../types/database'

interface ProtectedRouteProps {
    children: React.ReactNode
    requiredRole?: UserRole | UserRole[]
    requireAuth?: boolean
    redirectTo?: string
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    requiredRole,
    requireAuth = true,
    redirectTo = '/auth/login'
}) => {
    const { isAuthenticated, profile, loading } = useAuth()
    const location = useLocation()

    // Show loading state while auth is initializing
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        )
    }

    // If authentication is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
        return (
            <Navigate
                to={redirectTo}
                state={{ from: location.pathname }}
                replace
            />
        )
    }

    // If specific role is required, check user role
    if (requiredRole && profile) {
        const hasRequiredRole = Array.isArray(requiredRole)
            ? requiredRole.includes(profile.role)
            : profile.role === requiredRole

        if (!hasRequiredRole) {
            // Redirect to appropriate dashboard based on user role
            const roleDashboard = profile.role === 'developer' ? '/dashboard' : '/organization/dashboard'
            return <Navigate to={roleDashboard} replace />
        }
    }

    // If we reach here, user has access to the route
    return <>{children}</>
}

interface PublicRouteProps {
    children: React.ReactNode
    redirectTo?: string
}

export const PublicRoute: React.FC<PublicRouteProps> = ({
    children,
    redirectTo
}) => {
    const { isAuthenticated, profile, loading } = useAuth()

    // Show loading state while auth is initializing
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        )
    }

    // If user is authenticated, redirect to appropriate dashboard
    if (isAuthenticated && profile) {
        const defaultRedirect = redirectTo ||
            (profile.role === 'developer' ? '/dashboard' : '/organization/dashboard')

        return <Navigate to={defaultRedirect} replace />
    }

    // If not authenticated, show the public route
    return <>{children}</>
}

interface RoleRouteProps {
    children: React.ReactNode
    allowedRoles: UserRole | UserRole[]
    fallbackComponent?: React.ReactNode
}

export const RoleRoute: React.FC<RoleRouteProps> = ({
    children,
    allowedRoles,
    fallbackComponent
}) => {
    const { profile, loading, isAuthenticated } = useAuth()

    // Show loading state while auth is initializing
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        )
    }

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/auth/login" replace />
    }

    // Check if user has required role
    if (profile) {
        const hasAllowedRole = Array.isArray(allowedRoles)
            ? allowedRoles.includes(profile.role)
            : profile.role === allowedRoles

        if (hasAllowedRole) {
            return <>{children}</>
        }
    }

    // If user doesn't have required role, show fallback or redirect
    if (fallbackComponent) {
        return <>{fallbackComponent}</>
    }

    // Default fallback: unauthorized message
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
                <p className="text-gray-600 mb-6">
                    You don't have permission to access this page.
                </p>
                <Navigate to="/" replace />
            </div>
        </div>
    )
}

export default ProtectedRoute 