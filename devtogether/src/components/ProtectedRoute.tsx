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
    const { isAuthenticated, profile, loading, isAdmin } = useAuth()
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

    // If user is authenticated and is a pending organization, restrict access
    if (isAuthenticated && profile) {
        const userProfile = profile as import('../types/database').Profile;
        const isAuthRoute = location.pathname.startsWith('/auth');
        if (userProfile.role === 'organization') {
            if (userProfile.organization_status === 'pending') {
                if (!isAuthRoute && location.pathname !== '/pending-approval') {
                    return <Navigate to="/pending-approval" replace />;
                }
            } else if (userProfile.organization_status === 'rejected') {
                if (!isAuthRoute && location.pathname !== '/rejected-organization') {
                    return <Navigate to="/rejected-organization" replace />;
                }
            } else if (userProfile.organization_status === 'blocked' || userProfile.blocked) {
                if (!isAuthRoute && location.pathname !== '/blocked') {
                    return <Navigate to="/blocked" replace />;
                }
            }
        }
    }

    // If user is authenticated and blocked, redirect to /blocked
    if (isAuthenticated && profile) {
        const userProfile = profile as import('../types/database').Profile;
        const isBlocked =
            (userProfile.role === 'developer' && userProfile.blocked) ||
            (userProfile.role === 'organization' && (userProfile.organization_status === 'blocked' || userProfile.blocked));
        if (isBlocked) {
            return <Navigate to="/blocked" replace />;
        }
    }

    // If specific role is required, check user role
    if (requiredRole && profile) {
        const requiredRolesArray = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
        let hasRequiredRole = requiredRolesArray.includes(profile.role as any)

        // 1. Admin inherits developer rights (Option A)
        if (!hasRequiredRole && isAdmin && requiredRolesArray.includes('developer' as any)) {
            hasRequiredRole = true
        }

        // 2. Legacy admin flag satisfies admin requirement even if role !== 'admin'
        if (!hasRequiredRole && isAdmin && requiredRolesArray.includes('admin' as any)) {
            hasRequiredRole = true
        }

        if (!hasRequiredRole) {
            // Redirect to dashboard for all users (both roles use the same route)
            return <Navigate to="/dashboard" replace />
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
        const defaultRedirect = redirectTo || '/dashboard'
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
                <button
                    onClick={() => window.location.href = '/'}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    Go Home
                </button>
            </div>
        </div>
    )
}

export default ProtectedRoute 