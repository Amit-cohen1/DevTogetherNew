import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Layout } from '../../components/layout'
import { useAuth } from '../../contexts/AuthContext'
import { projectService } from '../../services/projects'
import { applicationService } from '../../services/applications'
import { ApplicationForm } from '../../components/applications/ApplicationForm'
import { Project } from '../../types/database'
import { Button } from '../../components/ui/Button'
import {
    ArrowLeft,
    Building,
    MapPin,
    Clock,
    Calendar,
    Users,
    Star,
    Code,
    ExternalLink,
    Send,
    Loader2,
    AlertCircle,
    CheckCircle,
    Globe
} from 'lucide-react'
import { DIFFICULTY_LEVELS, APPLICATION_TYPES } from '../../utils/constants'

interface ProjectWithDetails extends Project {
    organization?: {
        id: string
        organization_name: string | null
        avatar_url: string | null
        bio: string | null
        website: string | null
        location: string | null
    }
    project_members?: Array<{
        id: string
        user: {
            id: string
            first_name: string | null
            last_name: string | null
            avatar_url: string | null
        }
        role: 'lead' | 'member'
    }>
    applications?: Array<{
        id: string
        developer: {
            id: string
            first_name: string | null
            last_name: string | null
        }
        status: string
    }>
}

export default function ProjectDetailsPage() {
    const { projectId } = useParams<{ projectId: string }>()
    const navigate = useNavigate()
    const { user, isDeveloper, isOrganization } = useAuth()

    const [project, setProject] = useState<ProjectWithDetails | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showApplicationForm, setShowApplicationForm] = useState(false)
    const [hasApplied, setHasApplied] = useState(false)
    const [checkingApplication, setCheckingApplication] = useState(false)

    useEffect(() => {
        if (projectId) {
            loadProject()
            if (user && isDeveloper) {
                checkApplicationStatus()
            }
        }
    }, [projectId, user, isDeveloper])

    const loadProject = async () => {
        try {
            setLoading(true)
            setError(null)
            const projectData = await projectService.getProject(projectId!)
            if (!projectData) {
                setError('Project not found')
                return
            }
            setProject(projectData as ProjectWithDetails)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load project')
        } finally {
            setLoading(false)
        }
    }

    const checkApplicationStatus = async () => {
        if (!user || !projectId) return

        try {
            setCheckingApplication(true)
            const applied = await applicationService.hasApplied(projectId, user.id)
            setHasApplied(applied)
        } catch (err) {
            console.error('Error checking application status:', err)
        } finally {
            setCheckingApplication(false)
        }
    }

    const handleApplicationSubmit = () => {
        setShowApplicationForm(false)
        setHasApplied(true)
        // Optionally show a toast notification
    }

    if (loading) {
        return (
            <Layout>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
                        <p className="text-gray-600">Loading project...</p>
                    </div>
                </div>
            </Layout>
        )
    }

    if (error || !project) {
        return (
            <Layout>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
                        <p className="text-red-600 mb-4">{error || 'Project not found'}</p>
                        <div className="space-x-4">
                            <button
                                onClick={() => navigate('/projects')}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                            >
                                Back to Projects
                            </button>
                            {error && (
                                <button
                                    onClick={loadProject}
                                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                                >
                                    Try Again
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </Layout>
        )
    }

    const difficultyInfo = DIFFICULTY_LEVELS.find(d => d.value === project.difficulty_level)
    const applicationTypeInfo = APPLICATION_TYPES.find(a => a.value === project.application_type)

    const statusColors = {
        open: 'bg-green-100 text-green-800 border-green-200',
        in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
        completed: 'bg-gray-100 text-gray-800 border-gray-200',
        cancelled: 'bg-red-100 text-red-800 border-red-200'
    }

    const difficultyColors = {
        beginner: 'bg-green-100 text-green-800',
        intermediate: 'bg-yellow-100 text-yellow-800',
        advanced: 'bg-red-100 text-red-800'
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        })
    }

    const canApply = isDeveloper &&
        project.status === 'open' &&
        user?.id !== project.organization_id &&
        !hasApplied

    const getApplicationButtonText = () => {
        if (checkingApplication) {
            return (
                <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Checking...
                </>
            )
        }
        if (hasApplied) {
            return (
                <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Application Submitted
                </>
            )
        }
        return (
            <>
                <Send className="h-5 w-5 mr-2" />
                Apply to Project
            </>
        )
    }

    // If showing application form, render it in full screen modal
    if (showApplicationForm) {
        return (
            <Layout>
                <div className="min-h-screen bg-gray-50 py-8">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <ApplicationForm
                            project={project}
                            onSubmit={handleApplicationSubmit}
                            onCancel={() => setShowApplicationForm(false)}
                        />
                    </div>
                </div>
            </Layout>
        )
    }

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex items-center justify-between mb-6">
                            <button
                                onClick={() => navigate('/projects')}
                                className="flex items-center text-gray-600 hover:text-gray-900"
                            >
                                <ArrowLeft className="h-5 w-5 mr-1" />
                                Back to Projects
                            </button>

                            {/* Status Badge */}
                            <span className={`
                inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border
                ${statusColors[project.status]}
              `}>
                                {project.status.replace('_', ' ').toUpperCase()}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Main Content */}
                            <div className="lg:col-span-2">
                                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                                    {project.title}
                                </h1>

                                {/* Organization Info */}
                                <div className="flex items-center mb-6">
                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 mr-4">
                                        {project.organization?.avatar_url ? (
                                            <img
                                                src={project.organization.avatar_url}
                                                alt={project.organization.organization_name || 'Organization'}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                                <Building className="w-6 h-6 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <Link
                                            to={`/profile/${project.organization?.id}`}
                                            className="text-lg font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                                        >
                                            {project.organization?.organization_name || 'Organization'}
                                        </Link>
                                        {project.organization?.location && (
                                            <p className="text-gray-600 flex items-center">
                                                <MapPin className="h-4 w-4 mr-1" />
                                                {project.organization.location}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="mb-8">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">About This Project</h2>
                                    <div className="prose prose-gray max-w-none">
                                        <p className="text-gray-700 whitespace-pre-line">
                                            {project.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Requirements */}
                                <div className="mb-8">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements & Expectations</h2>
                                    <div className="prose prose-gray max-w-none">
                                        <p className="text-gray-700 whitespace-pre-line">
                                            {project.requirements}
                                        </p>
                                    </div>
                                </div>

                                {/* About the Organization */}
                                {project.organization && (
                                    <div className="mb-8">
                                        <h2 className="text-xl font-semibold text-gray-900 mb-4">About the Organization</h2>
                                        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                                            <div className="flex items-start gap-4">
                                                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                                                    {project.organization.avatar_url ? (
                                                        <img
                                                            src={project.organization.avatar_url}
                                                            alt={project.organization.organization_name || 'Organization'}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                                            <Building className="w-8 h-8 text-gray-400" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-grow">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Link
                                                            to={`/profile/${project.organization.id}`}
                                                            className="text-lg font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                                                        >
                                                            {project.organization.organization_name}
                                                        </Link>
                                                        {project.organization.website && (
                                                            <a
                                                                href={project.organization.website}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-gray-400 hover:text-gray-600"
                                                                title="Visit website"
                                                            >
                                                                <ExternalLink className="w-4 h-4" />
                                                            </a>
                                                        )}
                                                    </div>

                                                    {project.organization.bio && (
                                                        <p className="text-gray-700 mb-3 whitespace-pre-line">
                                                            {project.organization.bio}
                                                        </p>
                                                    )}

                                                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                                        {project.organization.location && (
                                                            <div className="flex items-center gap-1">
                                                                <MapPin className="w-4 h-4" />
                                                                <span>{project.organization.location}</span>
                                                            </div>
                                                        )}
                                                        {project.organization.website && (
                                                            <div className="flex items-center gap-1">
                                                                <Globe className="w-4 h-4" />
                                                                <a
                                                                    href={project.organization.website}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-blue-600 hover:text-blue-800 hover:underline"
                                                                >
                                                                    Visit Website
                                                                </a>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                                        <Link
                                                            to={`/profile/${project.organization.id}`}
                                                            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
                                                        >
                                                            <Building className="w-4 h-4" />
                                                            View Full Organization Profile
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Technology Stack */}
                                <div className="mb-8">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Technology Stack</h2>
                                    <div className="flex flex-wrap gap-2">
                                        {project.technology_stack.map((tech, index) => (
                                            <span
                                                key={index}
                                                className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-700"
                                            >
                                                <Code className="h-4 w-4 mr-1" />
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar */}
                            <div className="lg:col-span-1">
                                <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-24">
                                    {/* Apply Button */}
                                    {canApply && (
                                        <div className="mb-6">
                                            <Button
                                                onClick={() => setShowApplicationForm(true)}
                                                className="w-full flex items-center justify-center gap-2"
                                                size="lg"
                                            >
                                                {getApplicationButtonText()}
                                            </Button>
                                        </div>
                                    )}

                                    {/* Already Applied Status */}
                                    {hasApplied && (
                                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                                            <div className="flex items-center gap-2 text-green-800">
                                                <CheckCircle className="h-5 w-5" />
                                                <span className="font-medium">Application Submitted</span>
                                            </div>
                                            <p className="text-sm text-green-700 mt-1">
                                                Your application is under review
                                            </p>
                                        </div>
                                    )}

                                    {/* Project Details */}
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-900 mb-2">Difficulty Level</h3>
                                            <span className={`
                        inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium
                        ${difficultyColors[project.difficulty_level]}
                      `}>
                                                <Star className="h-4 w-4 mr-1" />
                                                {difficultyInfo?.label}
                                            </span>
                                        </div>

                                        <div>
                                            <h3 className="text-sm font-medium text-gray-900 mb-2">Application Type</h3>
                                            <div className="flex items-center text-gray-600">
                                                <Users className="h-4 w-4 mr-2" />
                                                <span>
                                                    {applicationTypeInfo?.label}
                                                    {project.application_type !== 'individual' && project.max_team_size && (
                                                        ` (max ${project.max_team_size})`
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        {project.estimated_duration && (
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-900 mb-2">Estimated Duration</h3>
                                                <div className="flex items-center text-gray-600">
                                                    <Clock className="h-4 w-4 mr-2" />
                                                    <span>{project.estimated_duration}</span>
                                                </div>
                                            </div>
                                        )}

                                        {project.deadline && (
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-900 mb-2">Application Deadline</h3>
                                                <div className="flex items-center text-gray-600">
                                                    <Calendar className="h-4 w-4 mr-2" />
                                                    <span>{formatDate(project.deadline)}</span>
                                                </div>
                                            </div>
                                        )}

                                        <div>
                                            <h3 className="text-sm font-medium text-gray-900 mb-2">Location</h3>
                                            <div className="flex items-center text-gray-600">
                                                {project.is_remote ? (
                                                    <>
                                                        <Globe className="h-4 w-4 mr-2" />
                                                        <span>Remote</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <MapPin className="h-4 w-4 mr-2" />
                                                        <span>{project.location || 'On-site'}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-sm font-medium text-gray-900 mb-2">Posted</h3>
                                            <span className="text-gray-600">{formatDate(project.created_at)}</span>
                                        </div>
                                    </div>

                                    {/* Organization Links */}
                                    {project.organization?.website && (
                                        <div className="mt-6 pt-6 border-t border-gray-200">
                                            <a
                                                href={project.organization.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center text-primary-600 hover:text-primary-700"
                                            >
                                                <ExternalLink className="h-4 w-4 mr-2" />
                                                Visit Organization Website
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
} 