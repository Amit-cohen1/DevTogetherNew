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
    User,
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
    Award,
    X
} from 'lucide-react'
import { DIFFICULTY_LEVELS, APPLICATION_TYPES } from '../../utils/constants'
import { toastService } from '../../services/toastService';

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
    can_resubmit: boolean;
    rejection_reason: string | null;
}

export default function ProjectDetailsPage() {
    const { projectId } = useParams<{ projectId: string }>()
    const navigate = useNavigate()
    const { user, isDeveloper, isOrganization } = useAuth()

    const [project, setProject] = useState<ProjectWithDetails | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showApplicationModal, setShowApplicationModal] = useState(false)
    const [hasApplied, setHasApplied] = useState(false)
    const [checkingApplication, setCheckingApplication] = useState(false)
    const [resubmitting, setResubmitting] = useState(false);

    useEffect(() => {
        if (projectId) {
            loadProject()
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
            setHasApplied(false)
        } finally {
            setCheckingApplication(false)
        }
    }

    const handleApplicationSubmit = () => {
        setShowApplicationModal(false)
        setHasApplied(true)
    }

    const handleResubmit = async () => {
        if (!project) return;
        setResubmitting(true);
        try {
            await projectService.resubmitProject(project.id);
            toastService.success('Project resubmitted for review.');
            await loadProject();
        } catch (err) {
            toastService.error('Failed to resubmit project.');
        } finally {
            setResubmitting(false);
        }
    };

    // Loading state
    if (loading) {
        return (
            <Layout>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                        <p className="text-gray-600">Loading project...</p>
                    </div>
                </div>
            </Layout>
        )
    }

    // Error state
    if (error || !project) {
        return (
            <Layout>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
                        <p className="text-red-600 mb-4">{error || 'Project not found'}</p>
                        <div className="space-x-4">
                            <Button onClick={() => navigate(-1)} variant="outline">
                                Back
                            </Button>
                            {error && (
                                <Button onClick={loadProject}>
                                    Try Again
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </Layout>
        )
    }

    const difficultyInfo = DIFFICULTY_LEVELS.find(d => d.value === project.difficulty_level)
    const applicationTypeInfo = APPLICATION_TYPES.find(a => a.value === project.application_type)

    // Professional status colors - clean and consistent
    const statusStyles = {
        open: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
        completed: 'bg-gray-50 text-gray-700 border-gray-200',
        cancelled: 'bg-orange-50 text-orange-700 border-orange-200',
        pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        rejected: 'bg-red-50 text-red-700 border-red-200',
    }

    // Header colors based on project status - single colors, no gradients
    const headerColors = {
        open: 'bg-emerald-600',
        in_progress: 'bg-blue-600', 
        completed: 'bg-gray-600',
        cancelled: 'bg-orange-600',
        pending: 'bg-yellow-600',
        rejected: 'bg-red-600',
    }

    const difficultyStyles = {
        beginner: 'bg-green-50 text-green-700 border-green-200',
        intermediate: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        advanced: 'bg-red-50 text-red-700 border-red-200'
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        })
    }

    // Application logic
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

    // Parse requirements into key features
    const getKeyFeatures = (requirements: string) => {
        const lines = requirements.split('\n').filter(line => line.trim())
        return lines.slice(0, 5)
    }

    // Parse technology stack
    const getRequiredTech = () => {
        return project.technology_stack.slice(0, Math.ceil(project.technology_stack.length * 0.6))
    }

    const getNiceToHaveTech = () => {
        return project.technology_stack.slice(Math.ceil(project.technology_stack.length * 0.6))
    }

    // Developer-specific logic
    if (isDeveloper) {
        const userApp = project.applications?.find(app => app.developer.id === user?.id);
        const isTeamMember = userApp?.status === 'accepted';
        const isPending = userApp?.status === 'pending';
        const isRejected = userApp?.status === 'rejected';
        const isRemoved = userApp?.status === 'removed';
        // Allow reapplication if project is open and user is not currently a team member or pending
        // Removed developers can reapply to open projects (not blocked like rejected)
        const canApply = project.status === 'open' && !isTeamMember && !isPending && !isRejected;
        const canView =
            (project.status === 'open') ||
            (project.status === 'completed') ||
            (isTeamMember && ['in_progress', 'cancelled', 'rejected', 'completed'].includes(project.status));

        // Access denied for developers
        if (!canView) {
            return (
                <Layout>
                    <div className="min-h-screen flex items-center justify-center bg-gray-50">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center max-w-md">
                            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
                            <p className="text-gray-600 mb-6">You do not have access to this project.</p>
                            <Button onClick={() => navigate(-1)}>
                                Back
                            </Button>
                        </div>
                    </div>
                </Layout>
            );
        }

        // Developer status indicators
        let statusBadge = null;
        if (isPending) statusBadge = <span className="ml-3 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm font-medium">Application Pending</span>;
        if (isTeamMember) statusBadge = <span className="ml-3 px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">Team Member</span>;
        if (isRejected) statusBadge = <span className="ml-3 px-3 py-1 rounded-full bg-red-100 text-red-800 text-sm font-medium">Application Rejected</span>;
        if (isRemoved) statusBadge = <span className="ml-3 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-sm font-medium">Removed from Team • Can Reapply</span>;

        const isCompleted = project.status === 'completed';
        const showWorkspace = isTeamMember && project.status !== 'rejected';

        // Developer view
        return (
            <Layout>
                <div className="min-h-screen bg-gray-50">
                    {/* Clean Header */}
                    <div className={`${headerColors[project.status]} text-white`}>
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                            <div className="flex items-center justify-between mb-6">
                                <button
                                    onClick={() => navigate(-1)}
                                    className="flex items-center text-white/80 hover:text-white transition-colors"
                                >
                                    <ArrowLeft className="h-5 w-5 mr-2" />
                                    Back
                                </button>
                                <span className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-3 py-1 rounded-full text-sm font-medium">
                                    {project.status.replace('_', ' ').toUpperCase()}
                                </span>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center flex-wrap gap-2 mb-2">
                                        <h1 className="text-3xl font-bold text-white">
                                            {project.title}
                                        </h1>
                                        {statusBadge}
                                    </div>

                                    <div className="flex items-center text-white/80 mb-4">
                                        <div className="w-8 h-8 rounded-full overflow-hidden bg-white/20 mr-3">
                                            {project.organization?.avatar_url ? (
                                                <img
                                                    src={project.organization.avatar_url}
                                                    alt={project.organization.organization_name || 'Organization'}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Building className="w-4 h-4 text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <span className="font-medium">
                                            {project.organization?.organization_name || 'Organization'}
                                        </span>
                                        {project.organization?.location && (
                                            <span className="flex items-center text-sm ml-4">
                                                <MapPin className="h-4 w-4 mr-1" />
                                                {project.organization.location}
                                            </span>
                                        )}
                                    </div>

                                    {/* Quick facts */}
                                    <div className="flex flex-wrap gap-4 text-sm text-white/80">
                                        <div className="flex items-center gap-1">
                                            <Star className="h-4 w-4" />
                                            <span>{difficultyInfo?.label}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Users className="h-4 w-4" />
                                            <span>{applicationTypeInfo?.label}</span>
                                        </div>
                                        {project.estimated_duration && (
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-4 w-4" />
                                                <span>{project.estimated_duration}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1">
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

                                {/* Action buttons */}
                                <div className="flex flex-col sm:flex-row gap-3">
                                    {canApply && (
                                        <Button
                                            onClick={() => setShowApplicationModal(true)}
                                            variant="outline"
                                            className="!bg-white !text-gray-900 hover:!bg-gray-50"
                                            size="lg"
                                        >
                                            <Send className="h-5 w-5 mr-2" />
                                            Apply to Project
                                        </Button>
                                    )}

                                    {isPending && (
                                        <div className="bg-yellow-400/20 backdrop-blur-sm border border-yellow-300/30 text-white px-4 py-2 rounded-lg text-center">
                                            Your application is pending review
                                        </div>
                                    )}

                                    {isRejected && (
                                        <div className="bg-red-400/20 backdrop-blur-sm border border-red-300/30 text-white px-4 py-2 rounded-lg text-center">
                                            Application was rejected
                                        </div>
                                    )}

                                    {showWorkspace && (
                                        <Button
                                            onClick={() => navigate(`/workspace/${project.id}`)}
                                            variant="outline"
                                            className="!bg-white !text-gray-900 hover:!bg-gray-50"
                                            size="lg"
                                        >
                                            Go to Workspace
                                        </Button>
                                    )}

                                    {isCompleted && isTeamMember && (
                                        <div className="bg-green-400/20 backdrop-blur-sm border border-green-300/30 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                                            <Award className="h-5 w-5" />
                                            Project Completed!
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main content */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left column - Main content */}
                            <div className="lg:col-span-2 space-y-8">
                                {/* Project Overview */}
                                <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Overview</h2>
                                    <div className="prose max-w-none">
                                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                            {project.description}
                                        </p>
                                    </div>
                                </section>

                                {/* Key Features */}
                                <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <Target className="h-5 w-5 text-blue-600" />
                                        Key Features
                                    </h2>
                                    <div className="space-y-3">
                                        {getKeyFeatures(project.requirements).map((feature, index) => (
                                            <div key={index} className="flex items-start gap-3">
                                                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <Check className="h-3 w-3 text-green-600" />
                                                </div>
                                                <span className="text-gray-700">{feature.trim()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {/* Technology Stack */}
                                <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <Code className="h-5 w-5 text-blue-600" />
                                        Technology Stack
                                    </h2>
                                    <div className="space-y-4">
                                        {/* Required */}
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-900 mb-2">Required</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {getRequiredTech().map((tech, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-sm font-medium"
                                                    >
                                                        {tech}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Nice to have */}
                                        {getNiceToHaveTech().length > 0 && (
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-900 mb-2">Nice to Have</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {getNiceToHaveTech().map((tech, index) => (
                                                        <span
                                                            key={index}
                                                            className="px-3 py-1 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg text-sm font-medium"
                                                        >
                                                            {tech}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </section>

                                {/* Requirements */}
                                <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-blue-600" />
                                        Requirements & Guidelines
                                    </h2>
                                    <div className="prose max-w-none">
                                        <p className="text-gray-700 whitespace-pre-line">
                                            {project.requirements}
                                        </p>
                                    </div>
                                </section>

                                {/* Organization rejection/resubmit section - Developer View */}
                                {isOrganization && project.organization_id === user?.id &&
                                  (['rejected', 'cancelled'].includes(project.status) && project.rejection_reason) && (
                                    <section className="bg-red-50 border border-red-200 rounded-xl p-6">
                                        <h3 className="text-lg font-semibold text-red-800 mb-2 flex items-center gap-2">
                                            <AlertCircle className="w-5 h-5" />
                                            Project Rejected
                                        </h3>
                                        <p className="text-red-700 mb-4">
                                            <strong>Reason:</strong> {project.rejection_reason}
                                        </p>
                                        {project.can_resubmit && (
                                            <Button
                                                onClick={handleResubmit}
                                                disabled={resubmitting}
                                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                            >
                                                {resubmitting ? 'Resubmitting...' : 'Resubmit for Review'}
                                            </Button>
                                        )}
                                    </section>
                                )}
                            </div>

                            {/* Right column - Sidebar */}
                            <div className="space-y-6">
                                {/* Organization info */}
                                {project.organization && (
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Organization</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-3">
                                                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                                                    {project.organization.avatar_url ? (
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
                                                    <h4 className="font-semibold text-gray-900">
                                                        {project.organization.organization_name}
                                                    </h4>
                                                    {project.organization.location && (
                                                        <p className="text-sm text-gray-600 flex items-center gap-1">
                                                            <MapPin className="w-4 h-4" />
                                                            {project.organization.location}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {project.organization.bio && (
                                                <p className="text-sm text-gray-700">
                                                    {project.organization.bio}
                                                </p>
                                            )}

                                            <div className="space-y-2">
                                                {project.organization.website && (
                                                    <a
                                                        href={project.organization.website}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
                                                    >
                                                        <Globe className="w-4 h-4" />
                                                        Visit Website
                                                    </a>
                                                )}
                                                <Link
                                                    to={`/profile/${project.organization.id}`}
                                                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
                                                >
                                                    <Building className="w-4 h-4" />
                                                    View Profile
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Project details */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Details</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="text-sm text-gray-600 mb-1">Difficulty</div>
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-medium border ${difficultyStyles[project.difficulty_level]}`}>
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
                                                <div className="text-sm text-gray-600 mb-1">Deadline</div>
                                                <div className="text-gray-900">{formatDate(project.deadline)}</div>
                                            </div>
                                        )}

                                        <div>
                                            <div className="text-sm text-gray-600 mb-1">Location</div>
                                            <div className="text-gray-900">
                                                {project.is_remote ? 'Remote' : (project.location || 'On-site')}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="text-sm text-gray-600 mb-1">Posted</div>
                                            <div className="text-gray-900">{formatDate(project.created_at)}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Application Modal */}
                {showApplicationModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-900">Apply to Project</h2>
                                <button
                                    onClick={() => setShowApplicationModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                            <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
                                <ApplicationForm
                                    project={project}
                                    onSubmit={handleApplicationSubmit}
                                    onCancel={() => setShowApplicationModal(false)}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </Layout>
        );
    }

    // Organization and general user view (original logic with updated styling)
    return (
        <Layout>
            <div className="min-h-screen bg-gray-50">
                {/* Clean Header */}
                <div className={`${headerColors[project.status]} text-white`}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex items-center justify-between mb-6">
                            <button
                                onClick={() => navigate(-1)}
                                className="flex items-center text-white/80 hover:text-white transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5 mr-2" />
                                Back
                            </button>
                            <span className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-3 py-1 rounded-full text-sm font-medium">
                                {project.status.replace('_', ' ').toUpperCase()}
                            </span>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold text-white mb-2">
                                    {project.title}
                                </h1>

                                <div className="flex items-center text-white/80 mb-4">
                                    <div className="w-8 h-8 rounded-full overflow-hidden bg-white/20 mr-3">
                                        {project.organization?.avatar_url ? (
                                            <img
                                                src={project.organization.avatar_url}
                                                alt={project.organization.organization_name || 'Organization'}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Building className="w-4 h-4 text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <Link
                                        to={`/profile/${project.organization?.id}`}
                                        className="font-medium hover:text-white transition-colors"
                                    >
                                        {project.organization?.organization_name || 'Organization'}
                                    </Link>
                                    {project.organization?.location && (
                                        <span className="flex items-center text-sm ml-4">
                                            <MapPin className="h-4 w-4 mr-1" />
                                            {project.organization.location}
                                        </span>
                                    )}
                                </div>

                                {/* Quick facts */}
                                <div className="flex flex-wrap gap-4 text-sm text-white/80">
                                    <div className="flex items-center gap-1">
                                        <Star className="h-4 w-4" />
                                        <span>{difficultyInfo?.label}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Users className="h-4 w-4" />
                                        <span>{applicationTypeInfo?.label}</span>
                                    </div>
                                    {project.estimated_duration && (
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" />
                                            <span>{project.estimated_duration}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1">
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

                            {/* Action buttons - including organization workspace access */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                {/* Organization workspace access for their own projects */}
                                {isOrganization && project.organization_id === user?.id && project.status !== 'rejected' && (
                                    <Button
                                        onClick={() => navigate(`/workspace/${project.id}`)}
                                        variant="outline"
                                        className="!bg-white !text-gray-900 hover:!bg-gray-50"
                                        size="lg"
                                    >
                                        Go to Workspace
                                    </Button>
                                )}

                                {/* Apply button for general users (developers) */}
                                {canApply && (
                                    <Button
                                        onClick={() => setShowApplicationModal(true)}
                                        variant="outline"
                                        className="!bg-white !text-gray-900 hover:!bg-gray-50"
                                        size="lg"
                                        disabled={checkingApplication}
                                    >
                                        {getApplicationButtonText()}
                                    </Button>
                                )}

                                {hasApplied && (
                                    <div className="bg-green-400/20 backdrop-blur-sm border border-green-300/30 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                                        <CheckCircle className="h-5 w-5" />
                                        <span>Applied</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main content with same structure as developer view */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left column - Main content */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Project Overview */}
                            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Overview</h2>
                                <div className="prose max-w-none">
                                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                        {project.description}
                                    </p>
                                </div>
                            </section>

                            {/* Key Features */}
                            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Target className="h-5 w-5 text-blue-600" />
                                    Key Features
                                </h2>
                                <div className="space-y-3">
                                    {getKeyFeatures(project.requirements).map((feature, index) => (
                                        <div key={index} className="flex items-start gap-3">
                                            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <Check className="h-3 w-3 text-green-600" />
                                            </div>
                                            <span className="text-gray-700">{feature.trim()}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Timeline */}
                            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-blue-600" />
                                    Project Timeline
                                </h2>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-sm text-gray-600 mb-1">Duration</div>
                                        <div className="text-gray-900">{project.estimated_duration || 'To be determined'}</div>
                                    </div>
                                    {project.deadline && (
                                        <div>
                                            <div className="text-sm text-gray-600 mb-1">Application Deadline</div>
                                            <div className="text-gray-900">{formatDate(project.deadline)}</div>
                                        </div>
                                    )}
                                    <div>
                                        <div className="text-sm text-gray-600 mb-1">Posted</div>
                                        <div className="text-gray-900">{formatDate(project.created_at)}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-600 mb-1">Status</div>
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusStyles[project.status]}`}>
                                            {project.status.replace('_', ' ').toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            </section>

                            {/* Technology Stack */}
                            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Code className="h-5 w-5 text-blue-600" />
                                    Technology Stack
                                </h2>
                                <div className="space-y-4">
                                    {/* Required */}
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                            Required Technologies
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {getRequiredTech().map((tech, index) => (
                                                <span
                                                    key={index}
                                                    className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-sm font-medium"
                                                >
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Nice to have */}
                                    {getNiceToHaveTech().length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                Nice to Have
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {getNiceToHaveTech().map((tech, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-3 py-1 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg text-sm font-medium"
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
                            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Monitor className="h-5 w-5 text-blue-600" />
                                    Work Environment
                                </h2>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-sm text-gray-600 mb-1">Work Type</div>
                                        <div className="text-gray-900 flex items-center gap-2">
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
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-600 mb-1">Team Structure</div>
                                        <div className="text-gray-900">
                                            {applicationTypeInfo?.label}
                                            {project.application_type !== 'individual' && project.max_team_size && (
                                                ` (max ${project.max_team_size} members)`
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Requirements */}
                            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                    Application Guidelines
                                </h2>
                                <div className="prose max-w-none">
                                    <p className="text-gray-700 whitespace-pre-line">
                                        {project.requirements}
                                    </p>
                                </div>
                            </section>

                            {/* Selection Process */}
                            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Award className="h-5 w-5 text-blue-600" />
                                    Selection Process
                                </h2>
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
                            </section>

                            {/* Organization rejection/resubmit section */}
                            {isOrganization && project.organization_id === user?.id &&
                              (['rejected', 'cancelled'].includes(project.status) && project.rejection_reason) && (
                                <section className="bg-red-50 border border-red-200 rounded-xl p-6">
                                    <h3 className="text-lg font-semibold text-red-800 mb-2 flex items-center gap-2">
                                        <AlertCircle className="w-5 h-5" />
                                        Project Rejected
                                    </h3>
                                    <p className="text-red-700 mb-4">
                                        <strong>Reason:</strong> {project.rejection_reason}
                                    </p>
                                    {project.can_resubmit && (
                                        <Button
                                            onClick={handleResubmit}
                                            disabled={resubmitting}
                                        >
                                            {resubmitting ? 'Resubmitting...' : 'Resubmit for Review'}
                                        </Button>
                                    )}
                                </section>
                            )}

                            {/* Team Members section for organization owners */}
                            {isOrganization && project.organization_id === user?.id && project.applications && project.applications.length > 0 && (
                                <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <Users className="h-5 w-5 text-blue-600" />
                                        Team Members & Applications
                                    </h2>
                                    <div className="space-y-3">
                                        {project.applications.map((application, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                                        <User className="w-4 h-4 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {application.developer.first_name} {application.developer.last_name}
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            Application {application.status}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                                    application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {application.status.toUpperCase()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>

                        {/* Right column - Sidebar */}
                        <div className="space-y-6">
                            {/* Organization info */}
                            {project.organization && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Organization</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                                                {project.organization.avatar_url ? (
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
                                                <h4 className="font-semibold text-blue-600">
                                                    {project.organization.organization_name}
                                                </h4>
                                                {project.organization.location && (
                                                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                                                        <MapPin className="w-4 h-4" />
                                                        {project.organization.location}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {project.organization.bio && (
                                            <p className="text-sm text-gray-700 leading-relaxed">
                                                {project.organization.bio}
                                            </p>
                                        )}

                                        <div className="space-y-2">
                                            {project.organization.website && (
                                                <a
                                                    href={project.organization.website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
                                                >
                                                    <Globe className="w-4 h-4" />
                                                    Visit Website
                                                </a>
                                            )}
                                            <Link
                                                to={`/profile/${project.organization.id}`}
                                                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
                                            >
                                                <Building className="w-4 h-4" />
                                                View Full Profile
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Project quick facts */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Facts</h3>
                                <div className="space-y-4">
                                    <div>
                                        <div className="text-sm text-gray-600 mb-1">Difficulty Level</div>
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-medium border ${difficultyStyles[project.difficulty_level]}`}>
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

                    {/* Call to action for eligible users */}
                    {canApply && (
                        <div className={`mt-16 ${headerColors[project.status]} rounded-xl p-8 text-center text-white`}>
                            <h2 className="text-2xl font-bold mb-4">Ready to Start Your Journey?</h2>
                            <p className="text-white/80 mb-6 max-w-2xl mx-auto">
                                Join our community of developers and organizations building impactful projects together.
                                Your skills can make a real difference.
                            </p>
                            <Button
                                onClick={() => setShowApplicationModal(true)}
                                variant="outline"
                                className="!bg-white !text-gray-900 hover:!bg-gray-50"
                                size="lg"
                            >
                                Apply to Project
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Application Modal */}
            {showApplicationModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900">Apply to Project</h2>
                            <button
                                onClick={() => setShowApplicationModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
                            <ApplicationForm
                                project={project}
                                onSubmit={handleApplicationSubmit}
                                onCancel={() => setShowApplicationModal(false)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    )
}