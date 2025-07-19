import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../../components/layout'
import { useAuth } from '../../contexts/AuthContext'
import { applicationService, ApplicationWithDetails } from '../../services/applications'
import { projectService } from '../../services/projects'
import { ApplicationCard } from '../../components/applications/ApplicationCard'
import { ApplicationReviewModal } from '../../components/applications/ApplicationReviewModal'
import { Button } from '../../components/ui/Button'
import { FormField } from '../../components/ui/FormField'
import { Select } from '../../components/ui/Select'
import {
    Search,
    Filter,
    SortAsc,
    SortDesc,
    Check,
    X,
    Loader2,
    AlertCircle,
    Users,
    Clock,
    CheckCircle,
    XCircle,
    Archive,
    MoreHorizontal
} from 'lucide-react'
import { Project } from '../../types/database'

interface ApplicationStats {
    total: number
    pending: number
    accepted: number
    rejected: number
    withdrawn: number
}

interface FilterOptions {
    status: string
    project: string
    dateRange: string
    searchQuery: string
}

interface SortOption {
    field: 'created_at' | 'developer_name' | 'status'
    direction: 'asc' | 'desc'
}

export default function ApplicationsDashboard() {
    const { user, isOrganization } = useAuth()
    const navigate = useNavigate()

    // State
    const [applications, setApplications] = useState<ApplicationWithDetails[]>([])
    const [filteredApplications, setFilteredApplications] = useState<ApplicationWithDetails[]>([])
    const [userProjects, setUserProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [stats, setStats] = useState<ApplicationStats>({
        total: 0,
        pending: 0,
        accepted: 0,
        rejected: 0,
        withdrawn: 0
    })

    // Modal and selection state
    const [selectedApplication, setSelectedApplication] = useState<ApplicationWithDetails | null>(null)
    const [showReviewModal, setShowReviewModal] = useState(false)
    const [selectedApplications, setSelectedApplications] = useState<Set<string>>(new Set())
    const [showBulkActions, setShowBulkActions] = useState(false)

    // Filter and sort state
    const [filters, setFilters] = useState<FilterOptions>({
        status: 'all',
        project: 'all',
        dateRange: 'all',
        searchQuery: ''
    })
    const [sort, setSort] = useState<SortOption>({
        field: 'created_at',
        direction: 'desc'
    })

    // Redirect if not organization
    useEffect(() => {
        if (!isOrganization) {
            navigate('/dashboard')
        }
    }, [isOrganization, navigate])

    // Load data
    useEffect(() => {
        if (user && isOrganization) {
            loadData()
        }
    }, [user, isOrganization])

    // Apply filters and sorting
    useEffect(() => {
        applyFiltersAndSort()
    }, [applications, filters, sort])

    // Update bulk actions visibility
    useEffect(() => {
        setShowBulkActions(selectedApplications.size > 0)
    }, [selectedApplications])

    const loadData = async () => {
        try {
            setLoading(true)
            setError(null)

            // Load user's projects
            const projects = await projectService.getOrganizationProjects(user!.id)
            setUserProjects(projects)

            // Load all applications for user's projects
            const allApplications: ApplicationWithDetails[] = []

            for (const project of projects) {
                const projectApplications = await applicationService.getProjectApplications(project.id)
                allApplications.push(...projectApplications)
            }

            setApplications(allApplications)

            // Calculate stats
            const newStats = {
                total: allApplications.length,
                pending: allApplications.filter(app => app.status === 'pending').length,
                accepted: allApplications.filter(app => app.status === 'accepted').length,
                rejected: allApplications.filter(app => app.status === 'rejected').length,
                withdrawn: allApplications.filter(app => app.status === 'withdrawn').length
            }
            setStats(newStats)

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load applications')
        } finally {
            setLoading(false)
        }
    }

    const applyFiltersAndSort = () => {
        let filtered = [...applications]

        // Apply status filter
        if (filters.status !== 'all') {
            filtered = filtered.filter(app => app.status === filters.status)
        }

        // Apply project filter
        if (filters.project !== 'all') {
            filtered = filtered.filter(app => app.project_id === filters.project)
        }

        // Apply search filter
        if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase()
            filtered = filtered.filter(app =>
                `${app.developer.first_name} ${app.developer.last_name}`.toLowerCase().includes(query) ||
                app.developer.email.toLowerCase().includes(query) ||
                app.project.title.toLowerCase().includes(query) ||
                (app.cover_letter && app.cover_letter.toLowerCase().includes(query))
            )
        }

        // Apply date range filter
        if (filters.dateRange !== 'all') {
            const now = new Date()
            const filterDate = new Date()

            switch (filters.dateRange) {
                case 'today':
                    filterDate.setHours(0, 0, 0, 0)
                    break
                case 'week':
                    filterDate.setDate(now.getDate() - 7)
                    break
                case 'month':
                    filterDate.setMonth(now.getMonth() - 1)
                    break
            }

            if (filters.dateRange !== 'all') {
                filtered = filtered.filter(app => new Date(app.created_at) >= filterDate)
            }
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let aValue: any
            let bValue: any

            switch (sort.field) {
                case 'created_at':
                    aValue = new Date(a.created_at).getTime()
                    bValue = new Date(b.created_at).getTime()
                    break
                case 'developer_name':
                    aValue = `${a.developer.first_name} ${a.developer.last_name}`.toLowerCase()
                    bValue = `${b.developer.first_name} ${b.developer.last_name}`.toLowerCase()
                    break
                case 'status':
                    aValue = a.status
                    bValue = b.status
                    break
                default:
                    aValue = a.created_at
                    bValue = b.created_at
            }

            if (sort.direction === 'asc') {
                return aValue > bValue ? 1 : -1
            } else {
                return aValue < bValue ? 1 : -1
            }
        })

        setFilteredApplications(filtered)
    }

    const handleReviewApplication = (application: ApplicationWithDetails) => {
        setSelectedApplication(application)
        setShowReviewModal(true)
    }

    const handleStatusUpdate = (applicationId: string, status: 'accepted' | 'rejected') => {
        // Update the application in the list
        setApplications(prev =>
            prev.map(app =>
                app.id === applicationId
                    ? { ...app, status }
                    : app
            )
        )

        // Update stats
        setStats(prev => {
            const newStats = { ...prev }
            // This is a simplified update - in a real app you'd recalculate properly
            if (status === 'accepted') {
                newStats.accepted++
                newStats.pending--
            } else if (status === 'rejected') {
                newStats.rejected++
                newStats.pending--
            }
            return newStats
        })
    }

    const handleSelectApplication = (applicationId: string, selected: boolean) => {
        const newSelected = new Set(selectedApplications)
        if (selected) {
            newSelected.add(applicationId)
        } else {
            newSelected.delete(applicationId)
        }
        setSelectedApplications(newSelected)
    }

    const handleSelectAll = () => {
        if (selectedApplications.size === filteredApplications.length) {
            setSelectedApplications(new Set())
        } else {
            setSelectedApplications(new Set(filteredApplications.map(app => app.id)))
        }
    }

    const handleBulkAction = async (action: 'accept' | 'reject') => {
        try {
            const pendingApplications = Array.from(selectedApplications).filter(id => {
                const app = applications.find(a => a.id === id)
                return app && app.status === 'pending'
            })

            // Update applications
            for (const applicationId of pendingApplications) {
                await applicationService.updateApplicationStatus(applicationId, action === 'accept' ? 'accepted' : 'rejected')
                handleStatusUpdate(applicationId, action === 'accept' ? 'accepted' : 'rejected')
            }

            setSelectedApplications(new Set())
        } catch (err) {
            setError(err instanceof Error ? err.message : `Failed to ${action} applications`)
        }
    }

    if (!isOrganization) {
        return null
    }

    if (loading) {
        return (
            <Layout>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
                        <p className="text-gray-600">Loading applications...</p>
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
                        <Button onClick={loadData}>Try Again</Button>
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
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Applications Dashboard</h1>
                        <p className="text-gray-600 mt-2">Manage applications for your projects</p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-8">
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="flex items-center">
                                <Users className="h-8 w-8 text-gray-600" />
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

                    {/* Filters and Actions */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
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

                            {/* Project Filter */}
                            <FormField label="Project">
                                <Select
                                    value={filters.project}
                                    onChange={(e) => setFilters(prev => ({ ...prev, project: e.target.value }))}
                                >
                                    <option value="all">All Projects</option>
                                    {userProjects.map(project => (
                                        <option key={project.id} value={project.id}>
                                            {project.title}
                                        </option>
                                    ))}
                                </Select>
                            </FormField>

                            {/* Date Range Filter */}
                            <FormField label="Date Range">
                                <Select
                                    value={filters.dateRange}
                                    onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                                >
                                    <option value="all">All Time</option>
                                    <option value="today">Today</option>
                                    <option value="week">Past Week</option>
                                    <option value="month">Past Month</option>
                                </Select>
                            </FormField>
                        </div>

                        {/* Sort and Bulk Actions */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                {/* Sort */}
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                    <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Sort by:</span>
                                    <Select
                                        value={`${sort.field}-${sort.direction}`}
                                        onChange={(e) => {
                                            const [field, direction] = e.target.value.split('-') as [typeof sort.field, typeof sort.direction]
                                            setSort({ field, direction })
                                        }}
                                        className="w-full sm:w-auto"
                                    >
                                        <option value="created_at-desc">Newest First</option>
                                        <option value="created_at-asc">Oldest First</option>
                                        <option value="developer_name-asc">Name A-Z</option>
                                        <option value="developer_name-desc">Name Z-A</option>
                                        <option value="status-asc">Status A-Z</option>
                                    </Select>
                                </div>

                                {/* Select All */}
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={selectedApplications.size === filteredApplications.length && filteredApplications.length > 0}
                                        onChange={handleSelectAll}
                                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                    />
                                    <span className="text-sm text-gray-700 whitespace-nowrap">Select All ({filteredApplications.length})</span>
                                </div>
                            </div>

                            {/* Bulk Actions */}
                            {showBulkActions && (
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                    <span className="text-sm text-gray-700 text-center sm:text-left">{selectedApplications.size} selected</span>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleBulkAction('accept')}
                                            className="flex-1 sm:flex-none text-green-600 border-green-300 hover:bg-green-50"
                                        >
                                            <Check className="w-4 h-4 mr-1" />
                                            Accept
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleBulkAction('reject')}
                                            className="flex-1 sm:flex-none text-red-600 border-red-300 hover:bg-red-50"
                                        >
                                            <X className="w-4 h-4 mr-1" />
                                            Reject
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Applications List */}
                    {filteredApplications.length === 0 ? (
                        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
                            <p className="text-gray-600">
                                {applications.length === 0
                                    ? "You don't have any applications yet. Applications will appear here as developers apply to your projects."
                                    : "No applications match your current filters. Try adjusting your search criteria."
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredApplications.map((application) => (
                                <ApplicationCard
                                    key={application.id}
                                    application={application}
                                    onReview={handleReviewApplication}
                                    onSelect={handleSelectApplication}
                                    isSelected={selectedApplications.has(application.id)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Review Modal */}
            {selectedApplication && (
                <ApplicationReviewModal
                    application={selectedApplication}
                    isOpen={showReviewModal}
                    onClose={() => {
                        setShowReviewModal(false)
                        setSelectedApplication(null)
                    }}
                    onStatusUpdate={handleStatusUpdate}
                />
            )}
        </Layout>
    )
} 