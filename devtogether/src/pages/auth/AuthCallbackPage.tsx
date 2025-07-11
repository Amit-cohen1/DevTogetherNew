import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Loader2, AlertCircle } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import type { Profile } from '../../types/database';

export const AuthCallbackPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const { user, profile, loading: authLoading } = useAuth()

    useEffect(() => {
        const handleAuthCallback = async () => {
            try {
                // Check for error params from OAuth provider
                const errorParam = searchParams.get('error')
                const errorDescription = searchParams.get('error_description')

                if (errorParam) {
                    setError(errorDescription || 'Authentication failed')
                    setIsLoading(false)
                    return
                }

                // Wait for auth context to finish loading
                if (authLoading) {
                    return
                }

                // If user is authenticated, determine where to redirect
                if (user && profile) {
                    // Check if this is a new OAuth user without complete profile setup
                    // New OAuth users will have the default 'developer' role but no bio
                    if (!profile.bio && !profile.first_name && !profile.last_name && !profile.organization_name) {
                        // This is likely a new OAuth user - redirect to role selection
                        navigate('/auth/select-role', { replace: true })
                        return
                    }

                    // If organization and not verified, redirect to pending approval
                    const orgProfile = profile as Profile | null;
                    if (orgProfile?.role === 'organization' && orgProfile.organization_status === 'pending') {
                        navigate('/pending-approval', { replace: true })
                        return
                    }

                    // Existing user with complete profile - redirect to dashboard
                    const redirectTo = profile.role === 'developer'
                        ? '/dashboard'
                        : '/organization/dashboard'
                    navigate(redirectTo, { replace: true })
                    return
                }

                // If no user after auth loading is complete, there was an error
                if (!authLoading && !user) {
                    setError('Authentication failed. Please try again.')
                }

                setIsLoading(false)
            } catch (err) {
                setError('An unexpected error occurred during authentication.')
                setIsLoading(false)
            }
        }

        // Add a small delay to ensure auth state is properly updated
        const timeoutId = setTimeout(handleAuthCallback, 1000)

        return () => clearTimeout(timeoutId)
    }, [searchParams, navigate, user, profile, authLoading])

    if (isLoading || authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary-600" />
                    <h2 className="mt-4 text-lg font-medium text-gray-900">
                        Completing sign in...
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Please wait while we set up your account
                    </p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
                        <h2 className="mt-6 text-3xl font-bold text-gray-900">
                            Authentication Error
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            {error}
                        </p>
                    </div>

                    <div className="space-y-4">
                        <Button
                            type="button"
                            size="lg"
                            className="w-full"
                            onClick={() => navigate('/auth/login')}
                        >
                            Try again
                        </Button>

                        <div className="text-center">
                            <p className="text-xs text-gray-500">
                                If this problem persists, please contact support at{' '}
                                <a
                                    href="mailto:devtogether.help@gmail.com"
                                    className="text-primary-600 hover:text-primary-500"
                                >
                                    devtogether.help@gmail.com
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // This should not normally be reached, but just in case
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <h2 className="text-lg font-medium text-gray-900">
                    Redirecting...
                </h2>
            </div>
        </div>
    )
}

export default AuthCallbackPage 