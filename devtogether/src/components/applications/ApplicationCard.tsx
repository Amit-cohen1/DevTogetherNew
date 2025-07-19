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
        <div className={`bg-white rounded-lg border-2 transition-all hover:shadow-md ${isSelected ? 'border-primary-500 shadow-lg' : 'border-gray-200'}`}>
            <div className="p-4 sm:p-6">
                {/* Header - Mobile Enhanced */}
                <div className="flex flex-col gap-4 mb-4">
                    <div className="flex items-start gap-3 sm:gap-4">
                        {/* Selection Checkbox - Better Mobile Position */}
                        {onSelect && (
                            <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => onSelect(application.id, e.target.checked)}
                                className="mt-1 h-5 w-5 sm:h-4 sm:w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded flex-shrink-0"
                            />
                        )}

                        {/* Avatar */}
                        <div className="w-12 h-12 sm:w-12 sm:h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                            {developer.avatar_url ? (
                                <img
                                    src={developer.avatar_url}
                                    alt={developerName}
                                    className="w-12 h-12 sm:w-12 sm:h-12 rounded-full object-cover"
                                />
                            ) : (
                                <User className="w-6 h-6 text-gray-400" />
                            )}
                        </div>

                        {/* Developer Info - Mobile Optimized */}
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 line-clamp-1 sm:line-clamp-2 text-base sm:text-lg">
                                {developerName}
                            </h3>
                            <div className="flex flex-col gap-1 sm:gap-2 text-sm text-gray-600 mt-1">
                                <div className="flex items-center gap-1">
                                    <Mail className="w-4 h-4 flex-shrink-0" />
                                    <span className="truncate">{developer.email}</span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                        <span className="whitespace-nowrap">{formatDate(application.created_at)}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                        <span className="whitespace-nowrap">{getTimeSinceApplication()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Status and Actions - Mobile Layout */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <span className={`inline-flex items-center px-3 py-2 sm:py-1 rounded-full text-sm font-medium border self-start ${getStatusColor(application.status)}`}>
                            {application.status.toUpperCase()}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onReview(application)}
                            className="flex items-center justify-center gap-1 w-full sm:w-auto py-2.5 sm:py-2"
                        >
                            <Eye className="w-4 h-4" />
                            <span>Review Application</span>
                        </Button>
                    </div>
                </div>

                {/* Bio - Mobile Optimized */}
                {developer.bio && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-700 text-sm line-clamp-3 sm:line-clamp-2">{developer.bio}</p>
                    </div>
                )}

                {/* Skills - Mobile Grid */}
                {hasSkills && (
                    <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Skills</h4>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                            {developer.skills?.slice(0, 6).map((skill, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                    {skill}
                                </span>
                            ))}
                            {developer.skills && developer.skills.length > 6 && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                    +{developer.skills.length - 6} more
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Portfolio Links - Mobile Responsive */}
                {hasPortfolioLinks && (
                    <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Portfolio</h4>
                        <div className="flex flex-wrap gap-2">
                            {application.portfolio_links?.slice(0, 3).map((link, index) => {
                                const parts = link.split(': ')
                                const title = parts[0] || 'Portfolio Link'
                                const url = parts[1] || link
                                return (
                                    <a
                                        key={index}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 bg-primary-50 px-2 py-1 rounded-md border border-primary-200 hover:border-primary-300 transition-colors"
                                    >
                                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                        <span className="truncate max-w-[120px] sm:max-w-none">{title}</span>
                                    </a>
                                )
                            })}
                            {application.portfolio_links && application.portfolio_links.length > 3 && (
                                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                                    +{application.portfolio_links.length - 3} more
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Social Links - Mobile Layout */}
                {(developer.portfolio || developer.github || developer.linkedin) && (
                    <div className="border-t border-gray-200 pt-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Links</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {developer.portfolio && (
                                <a
                                    href={developer.portfolio}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 p-2 hover:bg-primary-50 rounded-lg transition-colors"
                                >
                                    <Globe className="w-4 h-4 flex-shrink-0" />
                                    <span className="truncate">Portfolio</span>
                                </a>
                            )}
                            {developer.github && (
                                <a
                                    href={developer.github}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 p-2 hover:bg-primary-50 rounded-lg transition-colors"
                                >
                                    <Github className="w-4 h-4 flex-shrink-0" />
                                    <span className="truncate">GitHub</span>
                                </a>
                            )}
                            {developer.linkedin && (
                                <a
                                    href={developer.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 p-2 hover:bg-primary-50 rounded-lg transition-colors"
                                >
                                    <Linkedin className="w-4 h-4 flex-shrink-0" />
                                    <span className="truncate">LinkedIn</span>
                                </a>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
} 