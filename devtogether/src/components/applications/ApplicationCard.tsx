import React from 'react'
import {
    User,
    Calendar,
    Mail,
    ExternalLink,
    Star,
    Eye,
    Clock,
    Github,
    Linkedin,
    Globe
} from 'lucide-react'
import { Button } from '../ui/Button'
import { ApplicationWithDetails } from '../../services/applications'

interface ApplicationCardProps {
    application: ApplicationWithDetails
    onReview: (application: ApplicationWithDetails) => void
    onSelect?: (applicationId: string, selected: boolean) => void
    isSelected?: boolean
}

export const ApplicationCard: React.FC<ApplicationCardProps> = ({
    application,
    onReview,
    onSelect,
    isSelected = false
}) => {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200'
            case 'accepted':
                return 'bg-green-100 text-green-800 border-green-200'
            case 'rejected':
                return 'bg-red-100 text-red-800 border-red-200'
            case 'withdrawn':
                return 'bg-gray-100 text-gray-800 border-gray-200'
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    const getTimeSinceApplication = () => {
        const now = new Date()
        const applicationDate = new Date(application.created_at)
        const diffTime = Math.abs(now.getTime() - applicationDate.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays === 1) return '1 day ago'
        if (diffDays < 7) return `${diffDays} days ago`
        if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
        return `${Math.ceil(diffDays / 30)} months ago`
    }

    const hasPortfolioLinks = application.portfolio_links && application.portfolio_links.length > 0
    const hasSkills = application.developer?.skills && application.developer.skills.length > 0

    // Handle missing developer data
    const developer = application.developer || {
        id: application.developer_id || 'unknown',
        first_name: null,
        last_name: null,
        email: 'Unknown User',
        avatar_url: null,
        bio: null,
        skills: [],
        portfolio: null,
        github: null,
        linkedin: null
    }

    const developerName = `${developer.first_name || ''} ${developer.last_name || ''}`.trim() || 'Unknown User'

    return (
        <div className={`bg-white rounded-lg border-2 transition-all hover:shadow-md ${isSelected ? 'border-primary-500 shadow-lg' : 'border-gray-200'
            }`}>
            <div className="p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                        {/* Selection Checkbox */}
                        {onSelect && (
                            <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => onSelect(application.id, e.target.checked)}
                                className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded flex-shrink-0"
                            />
                        )}

                        {/* Avatar */}
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                            {developer.avatar_url ? (
                                <img
                                    src={developer.avatar_url}
                                    alt={developerName}
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                            ) : (
                                <User className="w-6 h-6 text-gray-400" />
                            )}
                        </div>

                        {/* Developer Info */}
                        <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-gray-900 truncate">
                                {developerName}
                            </h3>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600 mt-1">
                                <div className="flex items-center gap-1">
                                    <Mail className="w-4 h-4 flex-shrink-0" />
                                    <span className="truncate">{developer.email}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4 flex-shrink-0" />
                                    <span className="whitespace-nowrap">{formatDate(application.created_at)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4 flex-shrink-0" />
                                    <span className="whitespace-nowrap">{getTimeSinceApplication()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Status and Actions */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(application.status)}`}>
                            {application.status.toUpperCase()}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onReview(application)}
                            className="flex items-center gap-1 w-full sm:w-auto justify-center"
                        >
                            <Eye className="w-4 h-4" />
                            Review
                        </Button>
                    </div>
                </div>

                {/* Bio */}
                {developer.bio && (
                    <div className="mb-4">
                        <p className="text-gray-700 text-sm line-clamp-2">{developer.bio}</p>
                    </div>
                )}

                {/* Skills */}
                {hasSkills && (
                    <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                            {developer.skills!.slice(0, 5).map((skill, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                    <Star className="w-3 h-3 mr-1" />
                                    {skill}
                                </span>
                            ))}
                            {developer.skills!.length > 5 && (
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                                    +{developer.skills!.length - 5} more
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Profile Links */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                    {developer.portfolio && (
                        <a
                            href={developer.portfolio}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 whitespace-nowrap"
                        >
                            <Globe className="w-4 h-4 flex-shrink-0" />
                            Portfolio
                        </a>
                    )}
                    {developer.github && (
                        <a
                            href={developer.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 whitespace-nowrap"
                        >
                            <Github className="w-4 h-4 flex-shrink-0" />
                            GitHub
                        </a>
                    )}
                    {developer.linkedin && (
                        <a
                            href={developer.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 whitespace-nowrap"
                        >
                            <Linkedin className="w-4 h-4 flex-shrink-0" />
                            LinkedIn
                        </a>
                    )}
                    {hasPortfolioLinks && (
                        <span className="text-sm text-gray-600 flex items-center gap-1 whitespace-nowrap">
                            <ExternalLink className="w-4 h-4 flex-shrink-0" />
                            {application.portfolio_links!.length} portfolio link{application.portfolio_links!.length > 1 ? 's' : ''}
                        </span>
                    )}
                </div>

                {/* Cover Letter Preview */}
                {application.cover_letter && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="text-sm text-gray-600">
                            <span className="font-medium">Cover Letter:</span>
                            <p className="mt-1 line-clamp-2">{application.cover_letter}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
} 