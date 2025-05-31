import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Project } from '../../types/database'
import { useAuth } from '../../contexts/AuthContext'
import { workspaceService } from '../../services/workspaceService'
import {
    MapPin,
    Users,
    Clock,
    Calendar,
    Building,
    Code,
    Star,
    ExternalLink,
    Settings
} from 'lucide-react'
import { DIFFICULTY_LEVELS, APPLICATION_TYPES } from '../../utils/constants'

interface ProjectCardProps {
    project: Project & {
        organization?: {
            organization_name: string | null
            avatar_url: string | null
        }
    }
}

export function ProjectCard({ project }: ProjectCardProps) {
    const { user } = useAuth()
    const [hasWorkspaceAccess, setHasWorkspaceAccess] = useState(false)
    const [checkingAccess, setCheckingAccess] = useState(false)

    const difficultyInfo = DIFFICULTY_LEVELS.find(d => d.value === project.difficulty_level)
    const applicationTypeInfo = APPLICATION_TYPES.find(a => a.value === project.application_type)

    const difficultyColors = {
        beginner: 'bg-green-100 text-green-800 border-green-200',
        intermediate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        advanced: 'bg-red-100 text-red-800 border-red-200'
    }

    const statusColors = {
        open: 'bg-blue-100 text-blue-800 border-blue-200',
        in_progress: 'bg-orange-100 text-orange-800 border-orange-200',
        completed: 'bg-gray-100 text-gray-800 border-gray-200',
        cancelled: 'bg-red-100 text-red-800 border-red-200'
    }

    useEffect(() => {
        if (user && project.id) {
            checkWorkspaceAccess()
        }
    }, [user, project.id])

    const checkWorkspaceAccess = async () => {
        if (!user) return

        setCheckingAccess(true)
        try {
            const hasAccess = await workspaceService.checkWorkspaceAccess(project.id, user.id)
            setHasWorkspaceAccess(hasAccess)
        } catch (error) {
            console.error('Error checking workspace access:', error)
            setHasWorkspaceAccess(false)
        } finally {
            setCheckingAccess(false)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    const isDeadlineSoon = (deadline: string | null) => {
        if (!deadline) return false
        const deadlineDate = new Date(deadline)
        const now = new Date()
        const daysUntilDeadline = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        return daysUntilDeadline <= 7 && daysUntilDeadline > 0
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            {/* Header */}
            <div className="p-6 pb-4">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <Link
                            to={`/projects/${project.id}`}
                            className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors line-clamp-2"
                        >
                            {project.title}
                        </Link>

                        {/* Organization */}
                        <div className="flex items-center mt-2 text-sm text-gray-600">
                            <Building className="h-4 w-4 mr-1" />
                            <Link
                                to={`/profile/${project.organization_id}`}
                                className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                            >
                                {project.organization?.organization_name || 'Organization'}
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Team Member Badge */}
                        {hasWorkspaceAccess && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                Team Member
                            </span>
                        )}

                        {/* Status Badge */}
                        <span className={`
                            inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                            ${statusColors[project.status]}
                        `}>
                            {project.status.replace('_', ' ').toUpperCase()}
                        </span>
                    </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                    {project.description}
                </p>

                {/* Tech Stack */}
                <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                        {project.technology_stack.slice(0, 4).map((tech, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
                            >
                                <Code className="h-3 w-3 mr-1" />
                                {tech}
                            </span>
                        ))}
                        {project.technology_stack.length > 4 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-500">
                                +{project.technology_stack.length - 4} more
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Details */}
            <div className="px-6 pb-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                    {/* Difficulty */}
                    <div className="flex items-center">
                        <Star className="h-4 w-4 mr-1 text-gray-400" />
                        <span className={`
                            px-2 py-1 rounded-full text-xs font-medium border
                            ${difficultyColors[project.difficulty_level]}
                        `}>
                            {difficultyInfo?.label}
                        </span>
                    </div>

                    {/* Application Type */}
                    <div className="flex items-center text-gray-600">
                        <Users className="h-4 w-4 mr-1" />
                        <span className="text-xs">
                            {applicationTypeInfo?.label}
                            {project.application_type !== 'individual' && project.max_team_size && (
                                ` (max ${project.max_team_size})`
                            )}
                        </span>
                    </div>
                </div>

                {/* Duration & Deadline */}
                <div className="flex items-center justify-between text-sm text-gray-600">
                    {project.estimated_duration && (
                        <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            <span className="text-xs">{project.estimated_duration}</span>
                        </div>
                    )}

                    {project.deadline && (
                        <div className={`flex items-center ${isDeadlineSoon(project.deadline) ? 'text-orange-600' : ''}`}>
                            <Calendar className="h-4 w-4 mr-1" />
                            <span className="text-xs">
                                Due {formatDate(project.deadline)}
                                {isDeadlineSoon(project.deadline) && (
                                    <span className="ml-1 font-medium">(Soon!)</span>
                                )}
                            </span>
                        </div>
                    )}
                </div>

                {/* Location */}
                <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-xs">
                        {project.is_remote ? 'Remote' : project.location || 'On-site'}
                    </span>
                </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 rounded-b-lg">
                <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                        Posted {formatDate(project.created_at)}
                    </span>

                    <div className="flex items-center gap-3">
                        {/* Workspace Access Button */}
                        {hasWorkspaceAccess && (
                            <Link
                                to={`/workspace/${project.id}`}
                                className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg transition-colors"
                            >
                                <Settings className="h-4 w-4 mr-1" />
                                Workspace
                            </Link>
                        )}

                        {/* View Details Button */}
                        <Link
                            to={`/projects/${project.id}`}
                            className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700"
                        >
                            View Details
                            <ExternalLink className="h-4 w-4 ml-1" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
} 