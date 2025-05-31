import React, { useState } from 'react'
import {
    X,
    User,
    FileText,
    Link as LinkIcon,
    ExternalLink,
    Mail,
    MapPin,
    Calendar,
    Clock,
    Check,
    XIcon,
    Loader2,
    AlertCircle,
    Github,
    Linkedin,
    Globe,
    Star
} from 'lucide-react'
import { Button } from '../ui/Button'
import { ApplicationWithDetails } from '../../services/applications'
import { applicationService } from '../../services/applications'

interface ApplicationReviewModalProps {
    application: ApplicationWithDetails
    isOpen: boolean
    onClose: () => void
    onStatusUpdate: (applicationId: string, status: 'accepted' | 'rejected') => void
}

export const ApplicationReviewModal: React.FC<ApplicationReviewModalProps> = ({
    application,
    isOpen,
    onClose,
    onStatusUpdate
}) => {
    const [isUpdating, setIsUpdating] = useState(false)
    const [error, setError] = useState<string | null>(null)

    if (!isOpen) return null

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        })
    }

    const parsePortfolioLinks = (portfolioLinks: string[] | null) => {
        if (!portfolioLinks) return []

        return portfolioLinks.map(link => {
            const parts = link.split(': ')
            return {
                title: parts[0] || 'Portfolio Link',
                url: parts[1] || link
            }
        })
    }

    const handleStatusUpdate = async (status: 'accepted' | 'rejected') => {
        setIsUpdating(true)
        setError(null)

        try {
            await applicationService.updateApplicationStatus(application.id, status)
            onStatusUpdate(application.id, status)
            onClose()
        } catch (err) {
            setError(err instanceof Error ? err.message : `Failed to ${status} application`)
        } finally {
            setIsUpdating(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800'
            case 'accepted':
                return 'bg-green-100 text-green-800'
            case 'rejected':
                return 'bg-red-100 text-red-800'
            case 'withdrawn':
                return 'bg-gray-100 text-gray-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const portfolioLinks = parsePortfolioLinks(application.portfolio_links)

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                {/* Background overlay */}
                <div
                    className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                    onClick={onClose}
                />

                {/* Modal panel */}
                <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-primary-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Application Review
                                </h2>
                                <p className="text-sm text-gray-600">
                                    {application.project.title}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                                {application.status.toUpperCase()}
                            </span>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                        <div className="p-6 space-y-6">
                            {/* Error Display */}
                            {error && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                                    <div>
                                        <h3 className="text-sm font-medium text-red-800">Error</h3>
                                        <p className="text-sm text-red-700 mt-1">{error}</p>
                                    </div>
                                </div>
                            )}

                            {/* Applicant Information */}
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    Applicant Information
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Basic Info */}
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Name</label>
                                            <p className="text-gray-900">
                                                {application.developer.first_name} {application.developer.last_name}
                                            </p>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Email</label>
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-4 h-4 text-gray-400" />
                                                <a
                                                    href={`mailto:${application.developer.email}`}
                                                    className="text-primary-600 hover:text-primary-700"
                                                >
                                                    {application.developer.email}
                                                </a>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Application Date</label>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                <span className="text-gray-900">{formatDate(application.created_at)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Profile Links */}
                                    <div className="space-y-3">
                                        {application.developer.portfolio && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-700">Portfolio</label>
                                                <a
                                                    href={application.developer.portfolio}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
                                                >
                                                    <Globe className="w-4 h-4" />
                                                    View Portfolio
                                                    <ExternalLink className="w-3 h-3" />
                                                </a>
                                            </div>
                                        )}

                                        {application.developer.github && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-700">GitHub</label>
                                                <a
                                                    href={application.developer.github}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
                                                >
                                                    <Github className="w-4 h-4" />
                                                    View GitHub
                                                    <ExternalLink className="w-3 h-3" />
                                                </a>
                                            </div>
                                        )}

                                        {application.developer.linkedin && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-700">LinkedIn</label>
                                                <a
                                                    href={application.developer.linkedin}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
                                                >
                                                    <Linkedin className="w-4 h-4" />
                                                    View LinkedIn
                                                    <ExternalLink className="w-3 h-3" />
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Developer Bio */}
                                {application.developer.bio && (
                                    <div className="mt-4">
                                        <label className="text-sm font-medium text-gray-700">Bio</label>
                                        <p className="text-gray-900 mt-1">{application.developer.bio}</p>
                                    </div>
                                )}

                                {/* Skills */}
                                {application.developer.skills && application.developer.skills.length > 0 && (
                                    <div className="mt-4">
                                        <label className="text-sm font-medium text-gray-700">Skills</label>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {application.developer.skills.map((skill, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                                >
                                                    <Star className="w-3 h-3 mr-1" />
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Cover Letter */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    Cover Letter
                                </h3>
                                <div className="bg-white border border-gray-200 rounded-lg p-4">
                                    {application.cover_letter ? (
                                        <div className="prose prose-gray max-w-none">
                                            <p className="text-gray-900 whitespace-pre-line">{application.cover_letter}</p>
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 italic">No cover letter provided</p>
                                    )}
                                </div>
                            </div>

                            {/* Portfolio Links */}
                            {portfolioLinks.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <LinkIcon className="w-5 h-5" />
                                        Portfolio Links
                                    </h3>
                                    <div className="space-y-3">
                                        {portfolioLinks.map((link, index) => (
                                            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h4 className="font-medium text-gray-900">{link.title}</h4>
                                                        <p className="text-sm text-gray-600">{link.url}</p>
                                                    </div>
                                                    <a
                                                        href={link.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1 text-primary-600 hover:text-primary-700 text-sm font-medium"
                                                    >
                                                        View
                                                        <ExternalLink className="w-4 h-4" />
                                                    </a>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    {application.status === 'pending' && (
                        <div className="flex items-center justify-end gap-4 px-6 py-4 border-t border-gray-200 bg-gray-50">
                            <Button
                                variant="outline"
                                onClick={onClose}
                                disabled={isUpdating}
                            >
                                Close
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => handleStatusUpdate('rejected')}
                                disabled={isUpdating}
                                className="text-red-600 border-red-300 hover:bg-red-50"
                            >
                                {isUpdating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Rejecting...
                                    </>
                                ) : (
                                    <>
                                        <XIcon className="w-4 h-4 mr-2" />
                                        Reject
                                    </>
                                )}
                            </Button>
                            <Button
                                onClick={() => handleStatusUpdate('accepted')}
                                disabled={isUpdating}
                                className="bg-green-600 text-white hover:bg-green-700"
                            >
                                {isUpdating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Accepting...
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-4 h-4 mr-2" />
                                        Accept
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
} 