import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../../components/layout'
import { useAuth } from '../../contexts/AuthContext'
import { applicationService, ApplicationWithDetails } from '../../services/applications'
import { Button } from '../../components/ui/Button'
import { FormField } from '../../components/ui/FormField'
import { Select } from '../../components/ui/Select'
import {
    Search,
    Calendar,
    Clock,
    ExternalLink,
    Eye,
    AlertCircle,
    CheckCircle,
    XCircle,
    Archive,
    Loader2,
    FileText,
    Building,
    MapPin,
    Star,
    RefreshCw
} from 'lucide-react'

interface ApplicationStats {
    total: number
    pending: number
    accepted: number
    rejected: number
    withdrawn: number
}

interface FilterOptions {
    status: string
    searchQuery: string
}

export default function MyApplications() {
    const { user, isDeveloper } = useAuth()
    const navigate = useNavigate()

    // State
    const [applications, setApplications] = useState<ApplicationWithDetails[]>([])
    const [filteredApplications, setFilteredApplications] = useState<ApplicationWithDetails[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [stats, setStats] = useState<ApplicationStats>({
        total: 0,
        pending: 0,
        accepted: 0,
        rejected: 0,
        withdrawn: 0
    })

    // Filter state
    const [filters, setFilters] = useState<FilterOptions>({
        status: 'all',
        searchQuery: ''
    })

    // Redirect if not developer
    useEffect(() => {
        if (!isDeveloper) {
            navigate('/dashboard')
        }
    }, [isDeveloper, navigate])

    // Load data
    useEffect(() => {
        if (user && isDeveloper) {
            loadApplications()
        }
    }, [user, isDeveloper])

    // Apply filters
    useEffect(() => {
        applyFilters()
    }, [applications, filters])

    const loadApplications = async () => {
        try {
            setLoading(true)
            setError(null)

            const userApplications = await applicationService.getDeveloperApplications(user!.id)
            setApplications(userApplications)

            // Calculate stats
            const newStats = {
                total: userApplications.length,
                pending: userApplications.filter(app => app.status === 'pending').length,
                accepted: userApplications.filter(app => app.status === 'accepted').length,
                rejected: userApplications.filter(app => app.status === 'rejected').length,
                withdrawn: userApplications.filter(app => app.status === 'withdrawn').length
            }
            setStats(newStats)

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load applications')
        } finally {
            setLoading(false)
        }
    }

    const applyFilters = () => {
        let filtered = [...applications]

        // Apply status filter
        if (filters.status !== 'all') {
            filtered = filtered.filter(app => app.status === filters.status)
        }

        // Apply search filter
        if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase()
            filtered = filtered.filter(app =>
                app.project.title.toLowerCase().includes(query) ||
                app.project.organization.organization_name?.toLowerCase().includes(query) ||
                (app.cover_letter && app.cover_letter.toLowerCase().includes(query))
            )
        }

        // Sort by created date (newest first)
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

        setFilteredApplications(filtered)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'long',
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

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <Clock className="w-4 h-4" />
            case 'accepted':
                return <CheckCircle className="w-4 h-4" />
            case 'rejected':
                return <XCircle className="w-4 h-4" />
            case 'withdrawn':
                return <Archive className="w-4 h-4" />
            default:
                return <Clock className="w-4 h-4" />
        }
    }

    const getStatusMessage = (status: string) => {
        switch (status) {
            case 'pending':
                return 'Your application is being reviewed by the organization.'
            case 'accepted':
                return 'Congratulations! Your application has been accepted.'
            case 'rejected':
                return 'Your application was not selected for this project.'
            case 'withdrawn':
                return 'You withdrew your application for this project.'
            default:
                return 'Application status unknown.'
        }
    }

    const handleWithdrawApplication = async (applicationId: string) => {
        try {
            await applicationService.withdrawApplication(applicationId)

            // Update the application in the list
            setApplications(prev =>
                prev.map(app =>
                    app.id === applicationId
                        ? { ...app, status: 'withdrawn' }
                        : app
                )
            )

            // Update stats
            setStats(prev => ({
                ...prev,
                pending: prev.pending - 1,
                withdrawn: prev.withdrawn + 1
            }))

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to withdraw application')
        }
    }

    if (!isDeveloper) {
        return null
    }

    if (loading) {
        return (
            <Layout>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
                        <p className="text-gray-600">Loading your applications...</p>
                    </div>
                </div>
            </Layout>
        )
    }

    if (error) {
        return (
            <Layout>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
                        <p className="text-red-600 mb-4">{error}</p>
                        <Button onClick={loadApplications}>Try Again</Button>
                    </div>
                </div>
            </Layout>
        )
    }

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
                            <p className="text-gray-600 mt-2">Track the status of your project applications</p>
                        </div>
                        <Button onClick={loadApplications} variant="outline" className="flex items-center gap-2">
                            <RefreshCw className="w-4 h-4" />
                            Refresh
                        </Button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="flex items-center">
                                <FileText className="h-8 w-8 text-gray-600" />
                                <div className="ml-4">
                                    <h3 className="text-lg font-semibold text-gray-900">{stats.total}</h3>
                                    <p className="text-sm text-gray-600">Total Applications</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="flex items-center">
                                <Clock className="h-8 w-8 text-yellow-600" />
                                <div className="ml-4">
                                    <h3 className="text-lg font-semibold text-gray-900">{stats.pending}</h3>
                                    <p className="text-sm text-gray-600">Pending Review</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="flex items-center">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                                <div className="ml-4">
                                    <h3 className="text-lg font-semibold text-gray-900">{stats.accepted}</h3>
                                    <p className="text-sm text-gray-600">Accepted</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="flex items-center">
                                <XCircle className="h-8 w-8 text-red-600" />
                                <div className="ml-4">
                                    <h3 className="text-lg font-semibold text-gray-900">{stats.rejected}</h3>
                                    <p className="text-sm text-gray-600">Rejected</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="flex items-center">
                                <Archive className="h-8 w-8 text-gray-600" />
                                <div className="ml-4">
                                    <h3 className="text-lg font-semibold text-gray-900">{stats.withdrawn}</h3>
                                    <p className="text-sm text-gray-600">Withdrawn</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Search */}
                            <FormField label="Search">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <input
                                        type="text"
                                        placeholder="Search applications..."
                                        value={filters.searchQuery}
                                        onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>
                            </FormField>

                            {/* Status Filter */}
                            <FormField label="Status">
                                <Select
                                    value={filters.status}
                                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="pending">Pending</option>
                                    <option value="accepted">Accepted</option>
                                    <option value="rejected">Rejected</option>
                                    <option value="withdrawn">Withdrawn</option>
                                </Select>
                            </FormField>
                        </div>
                    </div>

                    {/* Applications List */}
                    {filteredApplications.length === 0 ? (
                        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
                            <p className="text-gray-600 mb-4">
                                {applications.length === 0
                                    ? "You haven't applied to any projects yet. Start by browsing available projects."
                                    : "No applications match your current filters."
                                }
                            </p>
                            {applications.length === 0 && (
                                <Button onClick={() => navigate('/projects')}>
                                    Browse Projects
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {filteredApplications.map((application) => (
                                <div key={application.id} className="bg-white rounded-lg border border-gray-200 p-6">
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-start gap-4">
                                                {/* Organization Avatar */}
                                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                                    {application.project.organization.avatar_url ? (
                                                        <img
                                                            src={application.project.organization.avatar_url}
                                                            alt={application.project.organization.organization_name || 'Organization'}
                                                            className="w-12 h-12 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <Building className="w-6 h-6 text-gray-400" />
                                                    )}
                                                </div>

                                                {/* Project Info */}
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                                        {application.project.title}
                                                    </h3>
                                                    <p className="text-gray-600 text-sm mb-2">
                                                        {application.project.organization.organization_name}
                                                    </p>
                                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="w-4 h-4" />
                                                            <span>Applied {formatDate(application.created_at)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status and Actions */}
                                        <div className="flex items-center gap-3">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(application.status)}`}>
                                                {getStatusIcon(application.status)}
                                                <span className="ml-1">{application.status.toUpperCase()}</span>
                                            </span>

                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => navigate(`/projects/${application.project_id}`)}
                                                    className="flex items-center gap-1"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    View Project
                                                </Button>

                                                {application.status === 'pending' && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleWithdrawApplication(application.id)}
                                                        className="text-red-600 border-red-300 hover:bg-red-50"
                                                    >
                                                        Withdraw
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status Message */}
                                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-700 flex items-center gap-2">
                                            {getStatusIcon(application.status)}
                                            {getStatusMessage(application.status)}
                                        </p>
                                    </div>

                                    {/* Cover Letter Preview */}
                                    {application.cover_letter && (
                                        <div className="border-t border-gray-200 pt-4">
                                            <h4 className="text-sm font-medium text-gray-900 mb-2">Cover Letter</h4>
                                            <p className="text-sm text-gray-700 line-clamp-3">
                                                {application.cover_letter}
                                            </p>
                                        </div>
                                    )}

                                    {/* Portfolio Links */}
                                    {application.portfolio_links && application.portfolio_links.length > 0 && (
                                        <div className="border-t border-gray-200 pt-4 mt-4">
                                            <h4 className="text-sm font-medium text-gray-900 mb-2">Portfolio Links</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {application.portfolio_links.map((link, index) => {
                                                    const parts = link.split(': ')
                                                    const title = parts[0] || 'Portfolio Link'
                                                    const url = parts[1] || link
                                                    return (
                                                        <a
                                                            key={index}
                                                            href={url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
                                                        >
                                                            <ExternalLink className="w-3 h-3" />
                                                            {title}
                                                        </a>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    )
} 