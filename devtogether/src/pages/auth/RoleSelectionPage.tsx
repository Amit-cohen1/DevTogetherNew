import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { User, Building, ArrowRight } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import type { UserRole } from '../../types/database'

export const RoleSelectionPage: React.FC = () => {
    const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { updateProfile, profile } = useAuth()
    const navigate = useNavigate()

    const handleRoleSelection = (role: UserRole) => {
        setSelectedRole(role)
        setError(null)
    }

    const handleContinue = async () => {
        if (!selectedRole || !profile) {
            setError('Please select a role to continue')
            return
        }

        try {
            setIsSubmitting(true)
            setError(null)

            // Update the user's role
            const { success, error } = await updateProfile({ role: selectedRole })

            if (!success) {
                setError(error || 'Failed to update role. Please try again.')
                return
            }

            // Redirect to onboarding
            navigate('/onboarding', { replace: true })
        } catch (err) {
            setError('An unexpected error occurred. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    // If user already has profile setup, redirect
    React.useEffect(() => {
        if (profile && (profile.bio || profile.first_name || profile.organization_name)) {
            const redirectTo = profile.role === 'developer' ? '/dashboard' : '/organization/dashboard'
            navigate(redirectTo, { replace: true })
        }
    }, [profile, navigate])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <Link to="/" className="flex items-center justify-center space-x-3 mb-6">
                        <img
                            src="/images/devtogether-icon.svg"
                            alt="DevTogether"
                            className="w-12 h-12"
                        />
                        <span className="text-2xl font-bold text-gray-900">DevTogether</span>
                    </Link>
                    <h2 className="mt-6 text-3xl font-bold text-gray-900">
                        Choose your role
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        How would you like to use DevTogether?
                    </p>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                        <div className="text-sm text-red-600">{error}</div>
                    </div>
                )}

                {/* Role Selection */}
                <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                        {/* Developer Role */}
                        <button
                            type="button"
                            onClick={() => handleRoleSelection('developer')}
                            className={`p-6 border-2 rounded-lg text-left transition-colors ${selectedRole === 'developer'
                                ? 'border-primary-500 bg-primary-50 text-primary-700'
                                : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <div className="flex items-start space-x-4">
                                <User className="w-8 h-8 mt-1" />
                                <div>
                                    <div className="font-medium text-lg">Developer</div>
                                    <div className="text-sm text-gray-500 mt-1">
                                        I want to find projects to work on and contribute to nonprofit organizations
                                    </div>
                                    <div className="text-xs text-gray-400 mt-2">
                                        ✓ Browse and apply to projects<br />
                                        ✓ Showcase your skills<br />
                                        ✓ Collaborate with nonprofits
                                    </div>
                                </div>
                            </div>
                        </button>

                        {/* Organization Role */}
                        <button
                            type="button"
                            onClick={() => handleRoleSelection('organization')}
                            className={`p-6 border-2 rounded-lg text-left transition-colors ${selectedRole === 'organization'
                                ? 'border-primary-500 bg-primary-50 text-primary-700'
                                : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <div className="flex items-start space-x-4">
                                <Building className="w-8 h-8 mt-1" />
                                <div>
                                    <div className="font-medium text-lg">Organization</div>
                                    <div className="text-sm text-gray-500 mt-1">
                                        I represent a nonprofit organization looking for developer talent
                                    </div>
                                    <div className="text-xs text-gray-400 mt-2">
                                        ✓ Post project opportunities<br />
                                        ✓ Review developer applications<br />
                                        ✓ Manage project teams
                                    </div>
                                </div>
                            </div>
                        </button>
                    </div>

                    {/* Continue Button */}
                    <Button
                        type="button"
                        size="lg"
                        className="w-full"
                        onClick={handleContinue}
                        disabled={!selectedRole || isSubmitting}
                    >
                        {isSubmitting ? (
                            <div className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Setting up...
                            </div>
                        ) : (
                            <div className="flex items-center justify-center">
                                Continue
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </div>
                        )}
                    </Button>
                </div>

                {/* Footer */}
                <div className="text-center">
                    <p className="text-xs text-gray-500">
                        You can change your role later in your profile settings
                    </p>
                </div>
            </div>
        </div>
    )
}

export default RoleSelectionPage 