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
    Globe,
    Check,
    Target,
    Lightbulb,
    Monitor,
    FileText,
    Award
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
            // Add a small delay to ensure auth context is fully established
            if (user && isDeveloper) {
                setTimeout(() => {
                    checkApplicationStatus()
                }, 100)
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
            // Set hasApplied to false on error to allow the user to try applying
            // This prevents blocking the UI when there are permission issues
            setHasApplied(false)
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

    // Parse requirements into key features (basic implementation)
    const getKeyFeatures = (requirements: string) => {
        // Simple parsing - split by lines and filter non-empty
        const lines = requirements.split('\n').filter(line => line.trim())
        return lines.slice(0, 5) // Show first 5 as key features
    }

    // Parse technology stack into required and nice-to-have
    const getRequiredTech = () => {
        return project.technology_stack.slice(0, Math.ceil(project.technology_stack.length * 0.6))
    }

    const getNiceToHaveTech = () => {
        return project.technology_stack.slice(Math.ceil(project.technology_stack.length * 0.6))
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
                {/* Enhanced Header Section */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="flex items-center justify-between mb-6">
                            <button
                                onClick={() => navigate('/projects')}
                                className="flex items-center text-blue-100 hover:text-white transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5 mr-1" />
                                Back to Projects
                            </button>

                            {/* Status Badge */}
                            <span className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-4 py-2 rounded-full text-sm font-medium">
                                {project.status.replace('_', ' ').toUpperCase()}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-end">
                            {/* Main Project Info */}
                            <div className="lg:col-span-3">
                                <h1 className="text-4xl font-bold mb-4">
                                    {project.title}
                                </h1>

                                {/* Organization Info */}
                                <div className="flex items-center mb-6">
                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-white/20 mr-4">
                                        {project.organization?.avatar_url ? (
                                            <img
                                                src={project.organization.avatar_url}
                                                alt={project.organization.organization_name || 'Organization'}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Building className="w-6 h-6 text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <Link
                                            to={`/profile/${project.organization?.id}`}
                                            className="text-lg font-medium text-white hover:text-blue-100 transition-colors"
                                        >
                                            {project.organization?.organization_name || 'Organization'}
                                        </Link>
                                        {project.organization?.location && (
                                            <p className="text-blue-100 flex items-center text-sm">
                                                <MapPin className="h-4 w-4 mr-1" />
                                                {project.organization.location}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Quick Facts */}
                                <div className="flex flex-wrap gap-6 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Star className="h-4 w-4" />
                                        <span>{difficultyInfo?.label} Level</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4" />
                                        <span>{applicationTypeInfo?.label}</span>
                                    </div>
                                    {project.estimated_duration && (
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4" />
                                            <span>{project.estimated_duration}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        {project.is_remote ? (
                                            <>
                                                <Globe className="h-4 w-4" />
                                                <span>Remote</span>
                                            </>
                                        ) : (
                                            <>
                                                <MapPin className="h-4 w-4" />
                                                <span>On-site</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Apply Button in Header */}
                            <div className="lg:col-span-1 flex justify-end">
                                {canApply && (
                                    <Button
                                        onClick={() => setShowApplicationForm(true)}
                                        variant="outline"
                                        className="!bg-white !text-blue-600 hover:!bg-blue-50 !border-white/20 shadow-lg px-8 py-3 text-lg font-semibold"
                                        size="lg"
                                    >
                                        {getApplicationButtonText()}
                                    </Button>
                                )}
                                {hasApplied && (
                                    <div className="bg-green-500/20 backdrop-blur-sm border border-green-300/30 text-white px-6 py-3 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-5 w-5" />
                                            <span className="font-medium">Applied</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Left Column - Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Project Overview */}
                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Project Overview</h2>
                                <div className="prose prose-lg max-w-none">
                                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                        {project.description}
                                    </p>
                                </div>
                            </section>

                            {/* Key Features */}
                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <Target className="h-6 w-6 text-blue-600" />
                                    Key Features
                                </h2>
                                <div className="grid gap-3">
                                    {getKeyFeatures(project.requirements).map((feature, index) => (
                                        <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
                                            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <Check className="h-3 w-3 text-green-600" />
                                            </div>
                                            <span className="text-gray-700">{feature.trim()}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Project Timeline */}
                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <Calendar className="h-6 w-6 text-blue-600" />
                                    Project Timeline
                                </h2>
                                <div className="bg-white rounded-lg border border-gray-200 p-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-2">Project Duration</h4>
                                            <p className="text-gray-600">{project.estimated_duration || 'To be determined'}</p>
                                        </div>
                                        {project.deadline && (
                                            <div>
                                                <h4 className="font-semibold text-gray-900 mb-2">Application Deadline</h4>
                                                <p className="text-gray-600">{formatDate(project.deadline)}</p>
                                            </div>
                                        )}
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-2">Posted</h4>
                                            <p className="text-gray-600">{formatDate(project.created_at)}</p>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-2">Status</h4>
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusColors[project.status]}`}>
                                                {project.status.replace('_', ' ').toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Technical Requirements */}
                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <Code className="h-6 w-6 text-blue-600" />
                                    Technical Requirements
                                </h2>
                                <div className="space-y-6">
                                    {/* Required Technologies */}
                                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                            Required Technologies
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {getRequiredTech().map((tech, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200"
                                                >
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Nice to Have */}
                                    {getNiceToHaveTech().length > 0 && (
                                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                Nice to Have
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {getNiceToHaveTech().map((tech, index) => (
                                                    <span
                                                        key={index}
                                                        className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-green-50 text-green-700 border border-green-200"
                                                    >
                                                        {tech}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Development Environment */}
                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <Monitor className="h-6 w-6 text-blue-600" />
                                    Development Environment
                                </h2>
                                <div className="bg-white rounded-lg border border-gray-200 p-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-2">Work Type</h4>
                                            <p className="text-gray-600 flex items-center gap-2">
                                                {project.is_remote ? (
                                                    <>
                                                        <Globe className="h-4 w-4" />
                                                        Remote work
                                                    </>
                                                ) : (
                                                    <>
                                                        <MapPin className="h-4 w-4" />
                                                        On-site ({project.location || 'Location TBD'})
                                                    </>
                                                )}
                                            </p>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-2">Team Structure</h4>
                                            <p className="text-gray-600">
                                                {applicationTypeInfo?.label}
                                                {project.application_type !== 'individual' && project.max_team_size && (
                                                    ` (max ${project.max_team_size} members)`
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Application Guidelines */}
                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <FileText className="h-6 w-6 text-blue-600" />
                                    Application Guidelines
                                </h2>
                                <div className="bg-white rounded-lg border border-gray-200 p-6">
                                    <div className="prose max-w-none">
                                        <p className="text-gray-700 whitespace-pre-line">
                                            {project.requirements}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Selection Process */}
                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <Award className="h-6 w-6 text-blue-600" />
                                    Selection Process
                                </h2>
                                <div className="bg-white rounded-lg border border-gray-200 p-6">
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                                                1
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">Application Review</h4>
                                                <p className="text-gray-600 text-sm">Initial screening of applications and portfolios</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                                                2
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">Interview</h4>
                                                <p className="text-gray-600 text-sm">Discussion about your background and project fit</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                                                3
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">Final Selection</h4>
                                                <p className="text-gray-600 text-sm">Team selection and project onboarding</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* Right Column - Organization Info */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* Organization Card */}
                            {project.organization && (
                                <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-24">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Organization</h3>
                                    <div className="space-y-4">
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
                                                <Link
                                                    to={`/profile/${project.organization.id}`}
                                                    className="text-lg font-semibold text-blue-600 hover:text-blue-800 hover:underline block"
                                                >
                                                    {project.organization.organization_name}
                                                </Link>
                                                {project.organization.location && (
                                                    <p className="text-gray-600 text-sm flex items-center gap-1 mt-1">
                                                        <MapPin className="w-4 h-4" />
                                                        {project.organization.location}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {project.organization.bio && (
                                            <p className="text-gray-700 text-sm leading-relaxed">
                                                {project.organization.bio}
                                            </p>
                                        )}

                                        <div className="space-y-3 pt-4 border-t border-gray-200">
                                            {project.organization.website && (
                                                <a
                                                    href={project.organization.website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                                                >
                                                    <Globe className="w-4 h-4" />
                                                    Visit Website
                                                </a>
                                            )}
                                            <Link
                                                to={`/profile/${project.organization.id}`}
                                                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                                            >
                                                <Building className="w-4 h-4" />
                                                View Full Profile
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Project Quick Facts */}
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Facts</h3>
                                <div className="space-y-4">
                                    <div>
                                        <div className="text-sm text-gray-600 mb-1">Difficulty Level</div>
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${difficultyColors[project.difficulty_level]}`}>
                                            <Star className="h-4 w-4 mr-1" />
                                            {difficultyInfo?.label}
                                        </span>
                                    </div>

                                    <div>
                                        <div className="text-sm text-gray-600 mb-1">Team Size</div>
                                        <div className="text-gray-900">
                                            {applicationTypeInfo?.label}
                                            {project.application_type !== 'individual' && project.max_team_size && (
                                                ` (max ${project.max_team_size})`
                                            )}
                                        </div>
                                    </div>

                                    {project.estimated_duration && (
                                        <div>
                                            <div className="text-sm text-gray-600 mb-1">Duration</div>
                                            <div className="text-gray-900">{project.estimated_duration}</div>
                                        </div>
                                    )}

                                    {project.deadline && (
                                        <div>
                                            <div className="text-sm text-gray-600 mb-1">Application Deadline</div>
                                            <div className="text-gray-900">{formatDate(project.deadline)}</div>
                                        </div>
                                    )}

                                    <div>
                                        <div className="text-sm text-gray-600 mb-1">Location</div>
                                        <div className="text-gray-900">
                                            {project.is_remote ? 'Remote' : (project.location || 'On-site')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Ready to Apply Section */}
                    {canApply && (
                        <div className="mt-16 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-center text-white">
                            <h2 className="text-2xl font-bold mb-4">Ready to Start Your Journey?</h2>
                            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                                Join our community of developers and organizations building impactful projects together.
                                Your skills can make a real difference.
                            </p>
                            <Button
                                onClick={() => setShowApplicationForm(true)}
                                variant="outline"
                                className="!bg-white !text-blue-600 hover:!bg-blue-50 !border-white/20 shadow-lg px-8 py-3 text-lg font-semibold"
                                size="lg"
                            >
                                Apply to Project
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    )
} 