import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../../components/layout'
import { CreateProjectForm } from '../../components/projects/CreateProjectForm'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/Button'
import { ArrowLeft, Plus, AlertTriangle, Clock, Mail } from 'lucide-react'
import type { Profile } from '../../types/database';

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
    const orgProfile = profile as Profile | null;
    const isVerified = orgProfile?.organization_status === 'approved';

    // If not an organization, redirect (this should be handled by routing but adding as safety)
    if (!isOrganization) {
        navigate('/dashboard');
        return null;
    }

    // If not verified, redirect to pending approval
    if (!isVerified) {
        navigate('/pending-approval');
        return null;
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
                    {/* Show project creation form for verified organizations only */}
                    <div className="mb-8">
                        <p className="text-lg text-gray-600">
                            Create a new project to connect with talented developers and bring your ideas to life.
                        </p>
                        <div className="flex items-center bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4 rounded">
                            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                            <span className="text-yellow-800 font-medium">
                                All new projects require admin approval before becoming public. Your project will appear as <b>Pending Approval</b> until reviewed by the DevTogether team.
                            </span>
                        </div>
                    </div>

                    <CreateProjectForm
                        onSuccess={handleSuccess}
                        onCancel={handleCancel}
                    />
                </div>
            </div>
        </Layout>
    );
} 