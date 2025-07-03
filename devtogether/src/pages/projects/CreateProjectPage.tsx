import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../../components/layout'
import { CreateProjectForm } from '../../components/projects/CreateProjectForm'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/Button'
import { ArrowLeft, Plus, AlertTriangle, Clock, Mail } from 'lucide-react'

export default function CreateProjectPage() {
    const navigate = useNavigate()
    const { profile, isOrganization } = useAuth()

    const handleSuccess = (projectId: string) => {
        navigate(`/projects/${projectId}`)
    }

    const handleCancel = () => {
        navigate('/organization/dashboard')
    }

    // Check if organization is verified
    const isVerified = profile?.organization_verified === true
    const isPending = profile?.organization_verified === false && !profile?.organization_rejection_reason
    const isRejected = profile?.organization_rejection_reason

    // If not an organization, redirect (this should be handled by routing but adding as safety)
    if (!isOrganization) {
        navigate('/dashboard')
        return null
    }

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <div className="flex items-center">
                                <button
                                    onClick={handleCancel}
                                    className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
                                >
                                    <ArrowLeft className="h-5 w-5 mr-1" />
                                    Back to Dashboard
                                </button>
                                <div className="flex items-center">
                                    <Plus className="h-6 w-6 text-primary-600 mr-2" />
                                    <h1 className="text-2xl font-bold text-gray-900">Create New Project</h1>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {!isVerified ? (
                        // Show verification required message
                        <div className="bg-white rounded-lg shadow-lg p-8">
                            <div className="text-center">
                                {isPending ? (
                                    // Pending verification
                                    <>
                                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-6">
                                            <Clock className="h-8 w-8 text-yellow-600" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                            Organization Verification Pending
                                        </h2>
                                        <p className="text-gray-600 mb-6 max-w-2xl mx-auto leading-relaxed">
                                            Your organization is currently under review by our admin team. 
                                            You'll be able to create projects once your organization has been verified. 
                                            This process typically takes 1-2 business days.
                                        </p>
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                                            <div className="flex items-start">
                                                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                                                <div className="text-left">
                                                    <h3 className="text-sm font-medium text-yellow-800 mb-1">
                                                        What happens next?
                                                    </h3>
                                                    <div className="text-sm text-yellow-700 space-y-1">
                                                        <p>• Our team will review your organization details</p>
                                                        <p>• You'll receive an email notification once approved</p>
                                                        <p>• After approval, you can create unlimited projects</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : isRejected ? (
                                    // Rejected verification
                                    <>
                                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                                            <AlertTriangle className="h-8 w-8 text-red-600" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                            Organization Verification Required
                                        </h2>
                                        <p className="text-gray-600 mb-4 max-w-2xl mx-auto leading-relaxed">
                                            Your organization verification was not approved. 
                                            Please review the feedback below and update your organization profile.
                                        </p>
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                                            <div className="text-left">
                                                <h3 className="text-sm font-medium text-red-800 mb-2">
                                                    Rejection Reason:
                                                </h3>
                                                <p className="text-sm text-red-700">
                                                    {profile?.organization_rejection_reason}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                            <div className="flex items-start">
                                                <Mail className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                                                <div className="text-left">
                                                    <h3 className="text-sm font-medium text-blue-800 mb-1">
                                                        Need Help?
                                                    </h3>
                                                    <p className="text-sm text-blue-700">
                                                        Contact our support team if you need assistance with the verification process.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    // Default unverified state
                                    <>
                                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-6">
                                            <AlertTriangle className="h-8 w-8 text-gray-600" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                            Organization Verification Required
                                        </h2>
                                        <p className="text-gray-600 mb-6 max-w-2xl mx-auto leading-relaxed">
                                            Before you can create projects, your organization needs to be verified by our admin team. 
                                            This helps ensure the quality and legitimacy of projects on DevTogether.
                                        </p>
                                    </>
                                )}

                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Button
                                        onClick={() => navigate('/profile')}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        Update Organization Profile
                                    </Button>
                                    <Button
                                        onClick={handleCancel}
                                        variant="secondary"
                                    >
                                        Back to Dashboard
                                    </Button>
                                </div>

                                {isPending && (
                                    <div className="mt-8 pt-6 border-t border-gray-200">
                                        <p className="text-sm text-gray-500">
                                            Questions about the verification process? 
                                            <a href="mailto:support@devtogether.com" className="text-blue-600 hover:text-blue-800 ml-1">
                                                Contact Support
                                            </a>
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        // Show project creation form for verified organizations
                        <>
                            <div className="mb-8">
                                <p className="text-lg text-gray-600">
                                    Create a new project to connect with talented developers and bring your ideas to life.
                                </p>
                            </div>

                            <CreateProjectForm
                                onSuccess={handleSuccess}
                                onCancel={handleCancel}
                            />
                        </>
                    )}
                </div>
            </div>
        </Layout>
    )
} 