import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { workspaceService } from '../../services/workspaceService'
import type { ProjectWithTeamMembers, TeamMember } from '../../types/database'
import {
    MapPin,
    Users,
    Clock,
    Calendar,
    Building,
    Code,
    Star,
    Settings,
    Bookmark,
    Award,
    ArrowRight,
    CheckCircle,
    Crown,
    Shield,
    ExternalLink,
    X
} from 'lucide-react'
import { DIFFICULTY_LEVELS, APPLICATION_TYPES } from '../../utils/constants'
import { projectService } from '../../services/projects'
import { ResubmitProjectModal } from './ResubmitProjectModal';

interface ProjectCardProps {
    project: ProjectWithTeamMembers & {
        admin_workspace_access_requested?: boolean;
        admin_workspace_access_granted?: boolean;
    }
    variant?: 'default' | 'large' | 'featured' | 'list'
    onResubmitted?: () => void;
    onResubmitClick?: () => void;
}

export function ProjectCard({ project, variant = 'default', onResubmitted, onResubmitClick }: ProjectCardProps) {
    const { user } = useAuth()
    const [hasWorkspaceAccess, setHasWorkspaceAccess] = useState(false)
    const [isBookmarked, setIsBookmarked] = useState(false)

    // Debug logging
    console.log('🃏 ProjectCard received project:', project.title)
    console.log('  📋 Applications:', project.applications)
    console.log('  👥 Team Members:', project.team_members)
    console.log('  🏢 Organization:', project.organization)
    console.log('  🔢 Team Members Count:', project.team_members?.length || 0)

    // Add user context for debugging RLS issue
    console.log('  🔐 Current user ID:', user?.id)
    console.log('  🏛️ Project org ID:', project.organization_id)
    console.log('  ✅ Is org owner?', user?.id === project.organization_id)
    console.log('  🕐 User auth time:', user?.created_at)
    console.log('  📧 User email:', user?.email)

    const difficultyInfo = DIFFICULTY_LEVELS.find(d => d.value === project.difficulty_level)
    const applicationTypeInfo = APPLICATION_TYPES.find(a => a.value === project.application_type)

    // Professional status color mapping
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-50 text-yellow-800 border-yellow-300'
            case 'open':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200'
            case 'in_progress':
                return 'bg-blue-50 text-blue-700 border-blue-200'
            case 'completed':
                return 'bg-green-50 text-green-700 border-green-400'
            case 'cancelled':
                return 'bg-gray-100 text-gray-400 border-gray-200'
            case 'rejected':
                return 'bg-red-50 text-red-700 border-red-200'
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200'
        }
    }

    // Professional difficulty color mapping
    const getDifficultyColor = (level: string) => {
        switch (level) {
            case 'beginner':
                return 'bg-green-50 text-green-700 border-green-200'
            case 'intermediate':
                return 'bg-yellow-50 text-yellow-700 border-yellow-200'
            case 'advanced':
                return 'bg-red-50 text-red-700 border-red-200'
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200'
        }
    }

    // Enhanced card classes for professional design
    const getCardClasses = () => {
        const statusColor = {
            open: 'border-green-400 bg-green-50',
            in_progress: 'border-blue-400 bg-blue-50',
            completed: 'border-green-400 bg-green-50 ring-2 ring-green-300',
            cancelled: 'border-red-400 bg-red-50',
            rejected: 'border-red-500 bg-red-50',
            pending: 'border-yellow-300 bg-yellow-50',
        }[project.status] || 'border-gray-200 bg-white';
        
        if (variant === 'list') {
            return `group relative rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border overflow-hidden w-full ${statusColor}`;
        }
        
        const baseClasses = `group relative rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:border-gray-300 overflow-hidden w-full flex flex-col h-full backdrop-blur-sm ${statusColor}`;
        switch (variant) {
            case 'featured':
                return `${baseClasses} ring-2 ring-blue-100 hover:ring-blue-200`;
            case 'large':
                return `${baseClasses} hover:scale-[1.02] transform-gpu`;
            default:
                return `${baseClasses} hover:-translate-y-1`;
        }
    }

    const getContentPadding = () => {
        switch (variant) {
            case 'list':
                return 'p-4 sm:p-6'
            case 'large':
                return 'p-8'
            case 'featured':
                return 'p-7'
            default:
                return 'p-6'
        }
    }

    const getDescriptionLines = () => {
        switch (variant) {
            case 'list':
                return 'line-clamp-1'
            case 'large':
                return 'line-clamp-4'
            case 'featured':
                return 'line-clamp-3'
            default:
                return 'line-clamp-2'
        }
    }

    useEffect(() => {
        if (user && project.id) {
            checkWorkspaceAccess()
        }
    }, [user, project.id])

    const checkWorkspaceAccess = async () => {
        if (!user) return

        try {
            const hasAccess = await workspaceService.checkWorkspaceAccess(project.id, user.id)
            setHasWorkspaceAccess(hasAccess)
        } catch (error) {
            console.error('Error checking workspace access:', error)
            setHasWorkspaceAccess(false)
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

    // Enhanced team member display function with privacy support
    const renderTeamMemberAvatar = (member: TeamMember) => {
        const displayName = member.type === 'organization'
            ? member.profile.organization_name || 'Organization'
            : `${member.profile.first_name || ''} ${member.profile.last_name || ''}`.trim() || 'Unknown User';

        const initials = member.type === 'organization'
            ? (member.profile.organization_name?.[0] || 'O').toUpperCase()
            : `${member.profile.first_name?.[0] || ''}${member.profile.last_name?.[0] || ''}`.toUpperCase() || 'U';

        // Enhanced privacy indicator
        const isPrivateProfile = member.profile.is_public === false;

        return (
            <div
                key={member.id}
                className={`w-7 h-7 rounded-full bg-white border-2 flex items-center justify-center overflow-hidden shadow-sm relative ${
                    member.role === 'owner' ? 'border-yellow-300' : 
                    member.role === 'status_manager' ? 'border-blue-300' :
                    'border-blue-200'
                }`}
                title={`${displayName}${
                    member.role === 'owner' ? ' (Owner)' : 
                    member.role === 'status_manager' ? ' (Status Manager)' : ''
                }${isPrivateProfile ? ' (Private Profile)' : ''}`}
                onClick={() => {
                    // Use security string URL if available
                    const profileUrl = member.profile.security_string
                        ? `/profile/${member.profile.id}-${member.profile.security_string}`
                        : `/profile/${member.profile.id}`;
                    window.open(profileUrl, '_blank');
                }}
                style={{ cursor: 'pointer' }}
            >
                {member.profile.avatar_url ? (
                    <img
                        src={member.profile.avatar_url}
                        alt={displayName}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <span className={`text-xs font-medium ${
                        member.role === 'owner' ? 'text-yellow-700' : 
                        member.role === 'status_manager' ? 'text-blue-700' :
                        'text-blue-700'
                    }`}>
                        {initials}
                    </span>
                )}
                
                {/* Role indicators */}
                {member.role === 'owner' && (
                    <Crown className="w-2.5 h-2.5 text-yellow-600 absolute -top-1 -right-1 bg-white rounded-full p-0.5" />
                )}
                {member.role === 'status_manager' && (
                    <Shield className="w-2.5 h-2.5 text-blue-600 absolute -top-1 -right-1 bg-white rounded-full p-0.5" />
                )}
                
                {/* Privacy indicator */}
                {isPrivateProfile && (
                    <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-purple-500 rounded-full border border-white flex items-center justify-center">
                        <Shield className="w-1.5 h-1.5 text-white" />
                    </div>
                )}
            </div>
        );
    };

    // List variant layout
    if (variant === 'list') {
        return (
            <div className={getCardClasses()}>
                <div className={`${getContentPadding()} flex flex-col sm:flex-row gap-4`}>
                    {/* Left Section - Main Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        {project.status === 'open' && 'Open'}
                                        {project.status === 'pending' && 'Pending'}
                                        {project.status === 'in_progress' && 'In Progress'}
                                        {project.status === 'completed' && 'Completed'}
                                        {project.status === 'cancelled' && 'Cancelled'}
                                        {project.status === 'rejected' && 'Rejected'}
                                    </span>
                                    {hasWorkspaceAccess && (
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                            <Award className="h-3 w-3 mr-1" />
                                            Team Member
                                        </span>
                                    )}
                                </div>
                                
                                <Link
                                    to={`/projects/${project.id}`}
                                    className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors block mb-1 truncate"
                                >
                                    {project.title}
                                </Link>
                                
                                <Link
                                    to={`/profile/${project.organization_id}`}
                                    className="inline-flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors mb-2"
                                >
                                    <Building className="h-3.5 w-3.5 mr-1.5" />
                                    {project.organization?.organization_name || 'Organization'}
                                </Link>
                                
                                <p className={`text-gray-700 text-sm leading-relaxed mb-3 ${getDescriptionLines()}`}>
                                    {project.description}
                                </p>
                            </div>
                            
                            <button
                                onClick={() => setIsBookmarked(!isBookmarked)}
                                className={`p-2 rounded-lg transition-colors sm:ml-4 ${isBookmarked
                                    ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
                            </button>
                        </div>

                        {/* Technology Stack - Compact */}
                        <div className="flex flex-wrap gap-1.5 mb-3">
                            {project.technology_stack.slice(0, 4).map((tech, index) => (
                                <span
                                    key={index}
                                    className="inline-block px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-medium"
                                >
                                    {tech}
                                </span>
                            ))}
                            {project.technology_stack.length > 4 && (
                                <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-700 text-xs font-medium">
                                    +{project.technology_stack.length - 4}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Right Section - Metadata & Actions */}
                    <div className="sm:w-64 flex flex-col justify-between">
                        {/* Team Members */}
                        {project.team_members && project.team_members.length > 0 && (
                            <div className="bg-blue-50 rounded-lg p-3 mb-3">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-blue-800">Team</span>
                                    <span className="text-xs text-blue-700">{project.team_members.length} members</span>
                                </div>
                                <div className="flex -space-x-2">
                                    {project.team_members.slice(0, 4).map(renderTeamMemberAvatar)}
                                    {project.team_members.length > 4 && (
                                        <div className="w-7 h-7 rounded-full bg-blue-200 border-2 border-blue-200 flex items-center justify-center">
                                            <span className="text-xs text-blue-800 font-medium">
                                                +{project.team_members.length - 4}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Quick Info */}
                        <div className="space-y-2 mb-4">
                            <div className="flex items-center justify-between text-xs text-gray-600">
                                <div className="flex items-center">
                                    <Star className="h-3 w-3 mr-1" />
                                    <span>{difficultyInfo?.label}</span>
                                </div>
                                {project.estimated_duration && (
                                    <div className="flex items-center">
                                        <Clock className="h-3 w-3 mr-1" />
                                        <span>{project.estimated_duration}</span>
                                    </div>
                                )}
                            </div>
                            
                            {project.deadline && (
                                <div className="flex items-center text-xs">
                                    <Calendar className="h-3 w-3 mr-1.5 text-gray-500" />
                                    <span className={`${isDeadlineSoon(project.deadline) ? 'text-orange-600 font-medium' : 'text-gray-600'}`}>
                                        {formatDate(project.deadline)}
                                        {isDeadlineSoon(project.deadline) && <span className="ml-1 text-orange-500">(Soon)</span>}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                            {hasWorkspaceAccess && (
                                <Link
                                    to={`/workspace/${project.id}`}
                                    className="inline-flex items-center px-3 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                                >
                                    <Settings className="h-3 w-3 mr-1" />
                                    Workspace
                                </Link>
                            )}

                            <Link
                                to={`/projects/${project.id}`}
                                className="inline-flex items-center px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors border border-blue-200 flex-1 justify-center"
                            >
                                View Details
                                <ArrowRight className="h-3 w-3 ml-1" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Grid variant layout (existing)
    return (
        <div className={getCardClasses()}>
            {/* Professional Header */}
            <div className={`${getContentPadding()} flex-1 flex flex-col`}>
                {/* Top Row: Status & Bookmark */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                        {project.status === 'completed' && (
                            <span title="Project Completed!">
                                <Award className="h-4 w-4 text-green-500 mr-1 animate-bounce" />
                            </span>
                        )}
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {project.status === 'open' && 'Open'}
                            {project.status === 'pending' && 'Pending Approval'}
                            {project.status === 'in_progress' && 'In Progress'}
                            {project.status === 'completed' && 'Completed'}
                            {project.status === 'cancelled' && 'Cancelled'}
                            {project.status === 'rejected' && 'Rejected'}
                        </span>
                        {/* Show rejection reason if cancelled */}
                        {project.status === 'cancelled' && project.rejection_reason && (
                          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-xs">
                            <b>Project was rejected.</b><br />
                            Reason: {project.rejection_reason}
                          </div>
                        )}
                        {hasWorkspaceAccess && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                <Award className="h-3 w-3 mr-1" />
                                Team Member
                            </span>
                        )}
                    </div>
                    <button
                        onClick={() => setIsBookmarked(!isBookmarked)}
                        className={`p-2 rounded-lg transition-colors ${isBookmarked
                            ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
                    </button>
                </div>



                {/* Project Title & Organization */}
                <div className="mb-4">
                    <Link
                        to={`/projects/${project.id}`}
                        className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors block mb-2 leading-tight"
                    >
                        {project.title}
                    </Link>
                    <Link
                        to={`/profile/${project.organization_id}`}
                        className="inline-flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors"
                    >
                        <Building className="h-3.5 w-3.5 mr-1.5" />
                        {project.organization?.organization_name || 'Organization'}
                    </Link>
                </div>

                {/* Description */}
                <p className={`text-gray-700 text-sm leading-relaxed mb-4 ${getDescriptionLines()}`}>
                    {project.description}
                </p>

                {/* Key Info Cards - More Visual Hierarchy */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    {/* Difficulty & Type */}
                    <div className="space-y-2">
                        <div className="flex items-center text-xs text-gray-500">
                            <Star className="h-3 w-3 mr-1" />
                            Difficulty
                        </div>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(project.difficulty_level)}`}>
                            {difficultyInfo?.label}
                        </span>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center text-xs text-gray-500">
                            <Users className="h-3 w-3 mr-1" />
                            Team Type
                        </div>
                        <span className="text-xs text-gray-700 font-medium">
                            {applicationTypeInfo?.label}
                        </span>
                    </div>
                </div>

                {/* Team Members Section - More Prominent */}
                {project.team_members && project.team_members.length > 0 && (
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl p-3 mb-4 border border-blue-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center text-sm text-blue-800 font-medium">
                                <Users className="h-4 w-4 mr-2" />
                                Team Members
                            </div>
                            <div className="flex items-center">
                                <div className="flex -space-x-2 mr-3">
                                    {project.team_members.slice(0, 3).map(renderTeamMemberAvatar)}
                                    {project.team_members.length > 3 && (
                                        <div className="w-7 h-7 rounded-full bg-blue-200 border-2 border-blue-200 flex items-center justify-center shadow-sm">
                                            <span className="text-xs text-blue-800 font-medium">
                                                +{project.team_members.length - 3}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <span className="text-xs text-blue-700 font-medium">
                                    {project.team_members.length} member{project.team_members.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                        </div>
                        
                        {/* Privacy notice for team members */}
                        {project.team_members.some(member => member.profile.is_public === false) && (
                            <div className="mt-2 pt-2 border-t border-blue-200">
                                <p className="text-xs text-blue-700 flex items-center gap-1">
                                    <Shield className="w-3 h-3" />
                                    Some team members have private profiles
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Technology Stack - Enhanced Layout */}
                <div className="mb-4">
                    <div className="flex items-center mb-2">
                        <Code className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                        <span className="text-xs text-gray-500 font-medium">Technologies</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {project.technology_stack.slice(0, variant === 'large' ? 6 : 4).map((tech, index) => (
                            <span
                                key={index}
                                className="inline-block px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 text-xs font-medium hover:from-gray-200 hover:to-gray-300 transition-all duration-200 shadow-sm"
                            >
                                {tech}
                            </span>
                        ))}
                        {project.technology_stack.length > (variant === 'large' ? 6 : 4) && (
                            <span className="inline-flex items-center px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 text-xs font-medium cursor-pointer hover:from-blue-200 hover:to-blue-300 transition-all duration-200 shadow-sm"
                                title={`Other technologies: ${project.technology_stack.slice(variant === 'large' ? 6 : 4).join(', ')}`}
                            >
                                +{project.technology_stack.length - (variant === 'large' ? 6 : 4)} more
                            </span>
                        )}
                    </div>
                </div>

                {/* Project Details - Better Organized */}
                <div className="space-y-2 mb-6 flex-1">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                        {project.estimated_duration && (
                            <div className="flex items-center">
                                <Clock className="h-3.5 w-3.5 mr-1.5" />
                                <span className="text-xs">{project.estimated_duration}</span>
                            </div>
                        )}
                        <div className="flex items-center">
                            <MapPin className="h-3.5 w-3.5 mr-1.5" />
                            <span className="text-xs">{project.is_remote ? 'Remote' : project.location || 'On-site'}</span>
                        </div>
                    </div>

                    {project.deadline && (
                        <div className="flex items-center text-sm">
                            <Calendar className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                            <span className={`text-xs ${isDeadlineSoon(project.deadline) ? 'text-orange-600 font-medium' : 'text-gray-600'}`}>
                                Deadline: {formatDate(project.deadline)}
                                {isDeadlineSoon(project.deadline) && <span className="ml-1 text-orange-500">(Soon)</span>}
                            </span>
                        </div>
                    )}

                    {project.status === 'rejected' && user?.id === project.organization_id && project.rejection_reason && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            <b>Rejection Reason:</b> {project.rejection_reason}
                        </div>
                    )}

                    {project.status === 'rejected' && (project as any).can_resubmit && user?.id === project.organization_id && (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
                            <p><b>Project was rejected.</b> You can resubmit it.</p>
                            <button
                                className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors mt-2"
                                onClick={onResubmitClick}
                            >
                                <Settings className="h-3.5 w-3.5 mr-1.5" />
                                Resubmit Project
                            </button>
                        </div>
                    )}

                    {/* Additional content for large cards */}
                    {variant === 'large' && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <h4 className="text-sm font-semibold text-gray-900 mb-2">Why This Project Matters</h4>
                            <ul className="text-xs text-gray-700 space-y-1">
                                <li>• Build real-world experience with modern technologies</li>
                                <li>• Contribute to meaningful social impact</li>
                                <li>• Collaborate with experienced team members</li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {/* Enhanced Footer - Always at Bottom */}
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100/50 border-t border-gray-200 mt-auto backdrop-blur-sm">
                <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                        Posted {formatDate(project.created_at)}
                    </div>

                    <div className="flex items-center gap-2">
                        {hasWorkspaceAccess && (
                            <Link
                                to={`/workspace/${project.id}`}
                                className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                            >
                                <Settings className="h-3.5 w-3.5 mr-1.5" />
                                Workspace
                            </Link>
                        )}

                        <Link
                            to={`/projects/${project.id}`}
                            className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors border border-blue-200"
                        >
                            Project Page
                            <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
} 