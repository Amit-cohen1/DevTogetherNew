import React from 'react'
import { ProjectWithTeamMembers } from '../../types/database'
import {
    Folder,
    Users,
    Calendar,
    MapPin,
    ExternalLink,
    Award,
    Clock,
    CheckCircle2,
    PlayCircle,
    XCircle,
    Crown,
    Star
} from 'lucide-react'

interface ProjectShowcaseProps {
    projects: ProjectWithTeamMembers[]
    isOwnProfile?: boolean
    className?: string
}

const STATUS_CONFIG = {
    open: {
        label: 'Open for Applications',
        icon: PlayCircle,
        color: 'bg-green-100 text-green-800 border-green-200',
        iconColor: 'text-green-600'
    },
    in_progress: {
        label: 'In Progress',
        icon: Clock,
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        iconColor: 'text-blue-600'
    },
    completed: {
        label: 'Completed',
        icon: CheckCircle2,
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        iconColor: 'text-purple-600'
    },
    cancelled: {
        label: 'Cancelled',
        icon: XCircle,
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        iconColor: 'text-gray-600'
    }
}

const DIFFICULTY_COLORS = {
    beginner: 'bg-green-100 text-green-700',
    intermediate: 'bg-yellow-100 text-yellow-700',
    advanced: 'bg-red-100 text-red-700'
}

export const ProjectShowcase: React.FC<ProjectShowcaseProps> = ({
    projects,
    isOwnProfile = false,
    className = ''
}) => {
    const handleProjectClick = (projectId: string) => {
        window.open(`/projects/${projectId}`, '_blank', 'noopener,noreferrer')
    }

    const formatDuration = (duration: string | null) => {
        if (!duration) return null
        return duration.replace(/(\d+)/, '$1')
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    if (projects.length === 0) {
        return isOwnProfile ? (
            <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
                <div className="text-center py-12">
                    <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No projects yet
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        Start creating projects to showcase your organization's work and attract talented developers.
                    </p>
                    <button
                        onClick={() => window.location.href = '/projects/create'}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                        <PlayCircle className="w-4 h-4" />
                        Create Your First Project
                    </button>
                </div>
            </div>
        ) : null
    }

    // Separate projects by status for better showcase
    const featuredProjects = projects.filter(p => p.status === 'completed').slice(0, 3)
    const activeProjects = projects.filter(p => p.status === 'in_progress' || p.status === 'open')
    const allProjects = [...featuredProjects, ...activeProjects].slice(0, 6)

    return (
        <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`} id="organization-projects">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Folder className="w-5 h-5 text-purple-600" />
                    Project Portfolio
                    <span className="text-sm text-gray-500">({projects.length})</span>
                </h2>

                {projects.length > 6 && (
                    <button
                        onClick={() => window.location.href = '/projects?organization=' + projects[0]?.organization_id}
                        className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center gap-1"
                    >
                        View All Projects
                        <ExternalLink className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allProjects.map((project) => {
                    const statusConfig = STATUS_CONFIG[project.status]
                    const StatusIcon = statusConfig.icon

                    return (
                        <div
                            key={project.id}
                            className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer group"
                            onClick={() => handleProjectClick(project.id)}
                        >
                            {/* Project Header */}
                            <div className="p-4 border-b border-gray-100">
                                <div className="flex items-start justify-between mb-3">
                                    <h3 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors line-clamp-2">
                                        {project.title}
                                    </h3>
                                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                                        <StatusIcon className={`w-3 h-3 ${statusConfig.iconColor}`} />
                                        {statusConfig.label}
                                    </div>
                                </div>

                                <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                                    {project.description}
                                </p>

                                {/* Technology Stack */}
                                <div className="flex flex-wrap gap-1 mb-3">
                                    {project.technology_stack.slice(0, 3).map((tech, index) => (
                                        <span
                                            key={index}
                                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                                        >
                                            {tech}
                                        </span>
                                    ))}
                                    {project.technology_stack.length > 3 && (
                                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                            +{project.technology_stack.length - 3}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Project Details */}
                            <div className="p-4 space-y-3">
                                {/* Team Members */}
                                {project.team_members && project.team_members.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-gray-400" />
                                        <div className="flex items-center gap-1">
                                            {project.team_members.slice(0, 4).map((member, index) => (
                                                <div key={member.id} className="relative">
                                                    <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                                                        {member.profile.avatar_url ? (
                                                            <img
                                                                src={member.profile.avatar_url}
                                                                alt={member.profile.first_name || 'Team member'}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full bg-gray-300"></div>
                                                        )}
                                                    </div>
                                                    {member.role === 'owner' && (
                                                        <Crown className="w-3 h-3 text-yellow-500 absolute -top-1 -right-1" />
                                                    )}
                                                    {member.role === 'status_manager' && (
                                                        <Star className="w-3 h-3 text-blue-500 absolute -top-1 -right-1" />
                                                    )}
                                                </div>
                                            ))}
                                            {project.team_members.length > 4 && (
                                                <span className="text-xs text-gray-500 ml-1">
                                                    +{project.team_members.length - 4}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Project Info */}
                                <div className="grid grid-cols-2 gap-3 text-xs text-gray-500">
                                    {/* Difficulty */}
                                    <div className="flex items-center gap-1">
                                        <Award className="w-3 h-3" />
                                        <span className={`px-2 py-0.5 rounded-full ${DIFFICULTY_COLORS[project.difficulty_level]}`}>
                                            {project.difficulty_level}
                                        </span>
                                    </div>

                                    {/* Duration */}
                                    {project.estimated_duration && (
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            <span>{formatDuration(project.estimated_duration)}</span>
                                        </div>
                                    )}

                                    {/* Location */}
                                    <div className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        <span>{project.is_remote ? 'Remote' : project.location || 'On-site'}</span>
                                    </div>

                                    {/* Created Date */}
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        <span>{formatDate(project.created_at)}</span>
                                    </div>
                                </div>

                                {/* Success Indicators */}
                                {project.status === 'completed' && (
                                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                                            <span className="text-sm font-medium text-green-700">
                                                Successfully Completed
                                            </span>
                                        </div>
                                        <div className="flex gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-3 h-3 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Project Statistics Summary */}
            {projects.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600 mb-1">
                                {projects.filter(p => p.status === 'completed').length}
                            </div>
                            <div className="text-sm text-gray-600">Completed</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600 mb-1">
                                {projects.filter(p => p.status === 'in_progress').length}
                            </div>
                            <div className="text-sm text-gray-600">In Progress</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600 mb-1">
                                {projects.filter(p => p.status === 'open').length}
                            </div>
                            <div className="text-sm text-gray-600">Open</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600 mb-1">
                                {projects.reduce((total, p) => total + (p.team_members?.length || 0), 0)}
                            </div>
                            <div className="text-sm text-gray-600">Total Collaborators</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
} 