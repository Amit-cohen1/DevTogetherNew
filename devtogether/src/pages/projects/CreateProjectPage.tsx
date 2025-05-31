import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../../components/layout'
import { CreateProjectForm } from '../../components/projects/CreateProjectForm'
import { ArrowLeft, Plus } from 'lucide-react'

export default function CreateProjectPage() {
    const navigate = useNavigate()

    const handleSuccess = (projectId: string) => {
        navigate(`/projects/${projectId}`)
    }

    const handleCancel = () => {
        navigate('/organization/dashboard')
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
                    <div className="mb-8">
                        <p className="text-lg text-gray-600">
                            Create a new project to connect with talented developers and bring your ideas to life.
                        </p>
                    </div>

                    <CreateProjectForm
                        onSuccess={handleSuccess}
                        onCancel={handleCancel}
                    />
                </div>
            </div>
        </Layout>
    )
} 