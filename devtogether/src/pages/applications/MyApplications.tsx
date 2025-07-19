import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../../components/layout'
import { useAuth } from '../../contexts/AuthContext'
import { applicationService, ApplicationWithDetails } from '../../services/applications'
import { Button } from '../../components/ui/Button'
import { FormField } from '../../components/ui/FormField'
import { Select } from '../../components/ui/Select'
import { toastService } from '../../services/toastService'
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

            toastService.success('Application withdrawn successfully')

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to withdraw application'
            setError(errorMessage)
            toastService.error(errorMessage)
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
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
                    {/* Header - Mobile Optimized */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Applications</h1>
                            <p className="text-gray-600 mt-1 sm:mt-2">Track the status of your project applications</p>
                        </div>
                        <Button 
                            onClick={loadApplications} 
                            variant="outline" 
                            className="flex items-center gap-2 w-full sm:w-auto justify-center"
                        >
                            <RefreshCw className="w-4 h-4" />
                            <span className="sm:inline">Refresh</span>
                        </Button>
                    </div>

                    {/* Stats - Enhanced Mobile Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
                        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                <div className="p-2 bg-gray-100 rounded-lg w-fit mx-auto sm:mx-0">
                                    <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
                                </div>
                                <div className="text-center sm:text-left">
                                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{stats.total}</h3>
                                    <p className="text-xs sm:text-sm text-gray-600">Total</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                <div className="p-2 bg-yellow-100 rounded-lg w-fit mx-auto sm:mx-0">
                                    <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
                                </div>
                                <div className="text-center sm:text-left">
                                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{stats.pending}</h3>
                                    <p className="text-xs sm:text-sm text-gray-600">Pending</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                <div className="p-2 bg-green-100 rounded-lg w-fit mx-auto sm:mx-0">
                                    <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                                </div>
                                <div className="text-center sm:text-left">
                                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{stats.accepted}</h3>
                                    <p className="text-xs sm:text-sm text-gray-600">Accepted</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                <div className="p-2 bg-red-100 rounded-lg w-fit mx-auto sm:mx-0">
                                    <XCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                                </div>
                                <div className="text-center sm:text-left">
                                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{stats.rejected}</h3>
                                    <p className="text-xs sm:text-sm text-gray-600">Rejected</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters - Mobile Optimized */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Search */}
                            <FormField label="Search">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <input
                                        type="text"
                                        placeholder="Search applications..."
                                        value={filters.searchQuery}
                                        onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                                        className="w-full pl-10 pr-3 py-3 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-base sm:text-sm"
                                    />
                                </div>
                            </FormField>

                            {/* Status Filter */}
                            <FormField label="Status">
                                <Select
                                    value={filters.status}
                                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                                    className="py-3 sm:py-2 text-base sm:text-sm"
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

                    {/* Applications List - Enhanced Mobile Layout */}
                    {filteredApplications.length === 0 ? (
                        <div className="bg-white rounded-lg border border-gray-200 p-8 sm:p-12 text-center">
                            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
                            <p className="text-gray-600 mb-4 px-4">
                                {applications.length === 0
                                    ? "You haven't applied to any projects yet. Start by browsing available projects."
                                    : "No applications match your current filters."
                                }
                            </p>
                            {applications.length === 0 && (
                                <Button onClick={() => navigate('/projects')} className="w-full sm:w-auto">
                                    Browse Projects
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4 sm:space-y-6">
                            {filteredApplications.map((application) => {
                                const projectStatus = application.project.status;
                                const isAccepted = application.status === 'accepted';
                                const isPending = application.status === 'pending';
                                const isRejected = application.status === 'rejected';
                                const canGoToWorkspace = isAccepted && projectStatus !== 'rejected';
                                const canViewProject = (
                                    (isAccepted && (projectStatus === 'rejected' || projectStatus === 'cancelled')) ||
                                    (isPending && projectStatus === 'open') ||
                                    (isRejected && projectStatus === 'open')
                                );
                                const canWithdraw = isPending && projectStatus === 'open';
                                
                                // Auto-withdraw pending if project is not open
                                if (isPending && projectStatus !== 'open') {
                                    application.status = 'withdrawn';
                                }
                                
                                return (
                                    <div key={application.id} className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
                                        {/* Mobile-Enhanced Header */}
                                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-start gap-3 sm:gap-4">
                                                    {/* Organization Avatar */}
                                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
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
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                                                            {application.project.title}
                                                        </h3>
                                                        <p className="text-gray-600 text-sm mb-2 truncate">
                                                            {application.project.organization.organization_name}
                                                        </p>
                                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-500">
                                                            <div className="flex items-center gap-1">
                                                                <Calendar className="w-4 h-4 flex-shrink-0" />
                                                                <span>Applied {formatDate(application.created_at)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Status Badge - Mobile Positioned */}
                                            <div className="flex sm:flex-col items-start sm:items-end gap-3">
                                                <span className={`inline-flex items-center px-3 py-1.5 sm:py-1 rounded-full text-sm font-medium border ${getStatusColor(application.status)}`}>
                                                    {getStatusIcon(application.status)}
                                                    <span className="ml-1.5 sm:ml-1">{application.status.toUpperCase()}</span>
                                                </span>
                                            </div>
                                        </div>

                                        {/* Status Message */}
                                        <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4">
                                            <p className="text-sm text-gray-700">
                                                {getStatusMessage(application.status)}
                                            </p>
                                        </div>

                                        {/* Mobile-Optimized Actions */}
                                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                            {canGoToWorkspace && (
                                                <Button
                                                    variant="outline"
                                                    onClick={() => navigate(`/workspace/${application.project_id}`)}
                                                    className="flex items-center justify-center gap-2 w-full sm:w-auto"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                    Enter Workspace
                                                </Button>
                                            )}
                                            
                                            {canViewProject && (
                                                <Button
                                                    variant="outline"
                                                    onClick={() => navigate(`/projects/${application.project_id}`)}
                                                    className="flex items-center justify-center gap-2 w-full sm:w-auto"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    View Project
                                                </Button>
                                            )}
                                            
                                            {canWithdraw && (
                                                <Button
                                                    variant="outline"
                                                    onClick={() => handleWithdrawApplication(application.id)}
                                                    className="flex items-center justify-center gap-2 w-full sm:w-auto text-red-600 border-red-300 hover:bg-red-50"
                                                >
                                                    <Archive className="w-4 h-4" />
                                                    Withdraw Application
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    )
} 