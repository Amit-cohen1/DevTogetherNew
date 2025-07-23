import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../../components/layout'
import { useAuth } from '../../contexts/AuthContext'
import { applicationService, ApplicationWithDetails } from '../../services/applications'
import { toastService } from '../../services/toastService'
import { projectService } from '../../services/projects'
import { ApplicationCard } from '../../components/applications/ApplicationCard'
import { ApplicationReviewModal } from '../../components/applications/ApplicationReviewModal'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import {
    Search,
    Filter,
    SortAsc,
    SortDesc,
    Check,
    X,
    Loader2,
    AlertTriangle,
    Users,
    Clock,
    CheckCircle,
    XCircle,
    Archive,
    MoreHorizontal,
    RefreshCw,
    Target,
    TrendingUp,
    Award,
    Activity,
    FileText,
    Building,
    Grid3X3,
    List,
    Plus,
    BarChart3,
    Zap,
    Calendar,
    Star,
    Briefcase
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
    field: string
    direction: 'asc' | 'desc'
}

const STATUS_OPTIONS = [
    { value: 'all', label: 'All Applications', count: 0, color: 'bg-gray-50 text-gray-700', icon: Target },
    { value: 'pending', label: 'Pending Review', count: 0, color: 'bg-yellow-50 text-yellow-700', icon: Clock },
    { value: 'accepted', label: 'Accepted', count: 0, color: 'bg-green-50 text-green-700', icon: CheckCircle },
    { value: 'rejected', label: 'Rejected', count: 0, color: 'bg-red-50 text-red-700', icon: XCircle },
    { value: 'withdrawn', label: 'Withdrawn', count: 0, color: 'bg-gray-50 text-gray-500', icon: Archive },
];

const SORT_OPTIONS = [
    { value: 'created_at', label: 'Application Date' },
    { value: 'developer_name', label: 'Developer Name' },
    { value: 'status', label: 'Status' },
    { value: 'project_name', label: 'Project Name' },
];

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

    // Enhanced filtering and UI states
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [projectFilter, setProjectFilter] = useState('all');
    const [dateRangeFilter, setDateRangeFilter] = useState('all');
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [showFilters, setShowFilters] = useState(false);
    const [showAnalytics, setShowAnalytics] = useState(false);

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
    }, [applications, searchQuery, statusFilter, projectFilter, dateRangeFilter, sortBy, sortOrder])

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
        if (statusFilter !== 'all') {
            filtered = filtered.filter(app => app.status === statusFilter)
        }

        // Apply project filter
        if (projectFilter !== 'all') {
            filtered = filtered.filter(app => app.project_id === projectFilter)
        }

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(app =>
                `${app.developer.first_name} ${app.developer.last_name}`.toLowerCase().includes(query) ||
                app.developer.email.toLowerCase().includes(query) ||
                app.project.title.toLowerCase().includes(query) ||
                (app.cover_letter && app.cover_letter.toLowerCase().includes(query))
            )
        }

        // Apply date range filter
        if (dateRangeFilter !== 'all') {
            const now = new Date()
            const filterDate = new Date()

            switch (dateRangeFilter) {
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

            if (dateRangeFilter !== 'all') {
                filtered = filtered.filter(app => new Date(app.created_at) >= filterDate)
            }
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let aValue: any
            let bValue: any

            switch (sortBy) {
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
                case 'project_name':
                    aValue = a.project.title.toLowerCase()
                    bValue = b.project.title.toLowerCase()
                    break
                default:
                    aValue = a.created_at
                    bValue = b.created_at
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1
            } else {
                return aValue < bValue ? 1 : -1
            }
        })

        setFilteredApplications(filtered)
    }

    // Calculate enhanced metrics
    const enhancedMetrics = {
        totalApplications: stats.total,
        pendingReview: stats.pending,
        totalProjects: userProjects.length,
        acceptanceRate: stats.total > 0 ? Math.round((stats.accepted / stats.total) * 100) : 0,
        averagePerProject: userProjects.length > 0 ? Math.round((stats.total / userProjects.length) * 10) / 10 : 0,
        thisWeekApplications: applications.filter(app => {
            const appDate = new Date(app.created_at);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return appDate >= weekAgo;
        }).length
    };

    // Update status counts for tabs
    const statusOptionsWithCounts = STATUS_OPTIONS.map(option => ({
        ...option,
        count: option.value === 'all' ? stats.total : stats[option.value as keyof ApplicationStats] || 0
    }));

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
            
            const count = pendingApplications.length
            const actionText = action === 'accept' ? 'accepted' : 'rejected'
            toastService.success(`${count} application${count === 1 ? '' : 's'} ${actionText} successfully`)
            
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : `Failed to ${action} applications`
            setError(errorMessage)
            toastService.error(errorMessage)
        }
    }

    if (!isOrganization) {
        return null
    }

    if (error) {
        return (
            <Layout>
                <div className="min-h-screen bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-md mx-auto">
                            <div className="text-red-600 mb-4">
                                <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                                <h3 className="text-lg font-semibold">Applications Error</h3>
                            </div>
                            <p className="text-red-700 mb-6">{error}</p>
                            <Button onClick={loadData} className="w-full">
                                Try Again
                            </Button>
                        </div>
                    </div>
                </div>
            </Layout>
        )
    }

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50">
                {/* Enhanced Header with Gradient */}
                <div className="relative bg-gradient-to-br from-violet-900 via-purple-800 to-indigo-900 overflow-hidden">
                    <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:60px_60px]" />
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-900/90 via-purple-800/80 to-indigo-900/90" />
                    
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
                        {/* Header Content */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <div>
                                <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-medium mb-3">
                                    <Users className="h-4 w-4 mr-2" />
                                    Applications Dashboard
                                </div>
                                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                                    Application Management
                                </h1>
                                <p className="text-blue-100 text-lg">Review and manage developer applications for your projects</p>
                        </div>
                            
                            <div className="flex items-center gap-3">
                                <Button
                                    onClick={() => setShowAnalytics(!showAnalytics)}
                                    variant="outline"
                                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                                    icon={<BarChart3 className="w-4 h-4" />}
                                >
                                    Analytics
                                </Button>
                                <Button
                                    onClick={() => setShowFilters(!showFilters)}
                                    variant="outline"
                                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                                    icon={<Filter className="w-4 h-4" />}
                                >
                                    Filters
                                </Button>
                        <Button 
                            onClick={loadData} 
                            variant="outline" 
                                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                                    icon={<RefreshCw className="w-4 h-4" />}
                                >
                                    Refresh
                                </Button>
                            </div>
                        </div>

                        {/* Enhanced Metrics Dashboard */}
                        {!loading && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <FileText className="w-5 h-5 text-white/80" />
                                        <span className="text-2xl font-bold text-white">{enhancedMetrics.totalApplications}</span>
                                    </div>
                                    <p className="text-white/70 text-sm font-medium">Total Apps</p>
                                </div>
                                
                                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <Clock className="w-5 h-5 text-yellow-300" />
                                        <span className="text-2xl font-bold text-white">{enhancedMetrics.pendingReview}</span>
                                    </div>
                                    <p className="text-white/70 text-sm font-medium">Pending</p>
                                </div>
                                
                                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <Briefcase className="w-5 h-5 text-blue-300" />
                                        <span className="text-2xl font-bold text-white">{enhancedMetrics.totalProjects}</span>
                            </div>
                                    <p className="text-white/70 text-sm font-medium">Projects</p>
                                </div>
                                
                                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <TrendingUp className="w-5 h-5 text-green-300" />
                                        <span className="text-2xl font-bold text-white">{enhancedMetrics.acceptanceRate}%</span>
                                    </div>
                                    <p className="text-white/70 text-sm font-medium">Accept Rate</p>
                                </div>
                                
                                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <BarChart3 className="w-5 h-5 text-purple-300" />
                                        <span className="text-2xl font-bold text-white">{enhancedMetrics.averagePerProject}</span>
                            </div>
                                    <p className="text-white/70 text-sm font-medium">Avg/Project</p>
                                </div>
                                
                                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <Calendar className="w-5 h-5 text-cyan-300" />
                                        <span className="text-2xl font-bold text-white">{enhancedMetrics.thisWeekApplications}</span>
                                    </div>
                                    <p className="text-white/70 text-sm font-medium">This Week</p>
                                </div>
                            </div>
                        )}

                        {/* Analytics Panel */}
                        {showAnalytics && (
                            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 mb-6">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5" />
                                    Application Analytics
                                </h3>
                                
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Application Insights */}
                                    <div>
                                        <h4 className="text-white/90 font-medium mb-3">Application Metrics</h4>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-white/70">Acceptance Rate</span>
                                                <span className="text-white font-medium">{enhancedMetrics.acceptanceRate}%</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-white/70">Average per Project</span>
                                                <span className="text-white font-medium">{enhancedMetrics.averagePerProject} apps</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-white/70">Weekly Applications</span>
                                                <span className="text-white font-medium">{enhancedMetrics.thisWeekApplications} new</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Status Breakdown */}
                                    <div>
                                        <h4 className="text-white/90 font-medium mb-3">Status Breakdown</h4>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-white/70">Pending Review</span>
                                                <span className="text-yellow-300 font-medium">{stats.pending}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-white/70">Accepted</span>
                                                <span className="text-green-300 font-medium">{stats.accepted}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-white/70">Rejected</span>
                                                <span className="text-red-300 font-medium">{stats.rejected}</span>
                                </div>
                            </div>
                        </div>

                                    {/* Performance Insights */}
                                    <div>
                                        <h4 className="text-white/90 font-medium mb-3">Performance</h4>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-white/70">Active Projects</span>
                                                <span className="text-white font-medium">{enhancedMetrics.totalProjects}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-white/70">Response Rate</span>
                                                <span className="text-white font-medium">
                                                    {stats.total > 0 ? Math.round(((stats.accepted + stats.rejected) / stats.total) * 100) : 0}%
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-white/70">Average Turnaround</span>
                                                <span className="text-white font-medium">2-4 days</span>
                                            </div>
                                        </div>
                                </div>
                                </div>
                            </div>
                        )}

                        {/* Filters Panel */}
                        {showFilters && (
                            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 mb-6">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <Filter className="w-5 h-5" />
                                    Advanced Filtering & Search
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <div>
                                        <label className="block text-white/90 text-sm font-medium mb-2">Search Applications</label>
                                <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
                                    <input
                                        type="text"
                                                placeholder="Search developers, projects, or notes..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full pl-10 pr-3 py-2 bg-white/10 border border-white/20 text-white placeholder-white/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/30"
                                    />
                                </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-white/90 text-sm font-medium mb-2">Filter by Project</label>
                                        <select
                                            value={projectFilter}
                                            onChange={(e) => setProjectFilter(e.target.value)}
                                            className="w-full py-2 px-3 bg-white/10 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white/30"
                                >
                                    <option value="all">All Projects</option>
                                    {userProjects.map(project => (
                                                <option key={project.id} value={project.id} className="text-gray-900">
                                            {project.title}
                                        </option>
                                    ))}
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-white/90 text-sm font-medium mb-2">Date Range</label>
                                        <select
                                            value={dateRangeFilter}
                                            onChange={(e) => setDateRangeFilter(e.target.value)}
                                            className="w-full py-2 px-3 bg-white/10 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white/30"
                                >
                                    <option value="all">All Time</option>
                                            <option value="today" className="text-gray-900">Today</option>
                                            <option value="week" className="text-gray-900">This Week</option>
                                            <option value="month" className="text-gray-900">This Month</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <label className="text-white/90 text-sm font-medium">Sort by:</label>
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="py-1 px-2 bg-white/10 border border-white/20 text-white rounded text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
                                        >
                                            {SORT_OPTIONS.map(option => (
                                                <option key={option.value} value={option.value} className="text-gray-900">
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                        </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setSortOrder('desc')}
                                            className={`flex items-center gap-1 px-2 py-1 rounded text-sm transition-colors ${
                                                sortOrder === 'desc' 
                                                    ? 'bg-white/20 text-white' 
                                                    : 'bg-white/10 text-white/70 hover:bg-white/15'
                                            }`}
                                        >
                                            <SortDesc className="w-3 h-3" />
                                            Desc
                                        </button>
                                        <button
                                            onClick={() => setSortOrder('asc')}
                                            className={`flex items-center gap-1 px-2 py-1 rounded text-sm transition-colors ${
                                                sortOrder === 'asc' 
                                                    ? 'bg-white/20 text-white' 
                                                    : 'bg-white/10 text-white/70 hover:bg-white/15'
                                            }`}
                                        >
                                            <SortAsc className="w-3 h-3" />
                                            Asc
                                        </button>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setViewMode('list')}
                                            className={`flex items-center gap-1 px-2 py-1 rounded text-sm transition-colors ${
                                                viewMode === 'list' 
                                                    ? 'bg-white/20 text-white' 
                                                    : 'bg-white/10 text-white/70 hover:bg-white/15'
                                            }`}
                                        >
                                            <List className="w-3 h-3" />
                                            List
                                        </button>
                                        <button
                                            onClick={() => setViewMode('grid')}
                                            className={`flex items-center gap-1 px-2 py-1 rounded text-sm transition-colors ${
                                                viewMode === 'grid' 
                                                    ? 'bg-white/20 text-white' 
                                                    : 'bg-white/10 text-white/70 hover:bg-white/15'
                                            }`}
                                        >
                                            <Grid3X3 className="w-3 h-3" />
                                            Grid
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <Loader2 className="h-8 w-8 animate-spin text-violet-600 mx-auto mb-4" />
                                <p className="text-gray-600">Loading applications...</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Enhanced Status Tabs */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8 overflow-hidden">
                                <div className="border-b border-gray-200">
                                    <div className="flex overflow-x-auto scrollbar-hide">
                                        {statusOptionsWithCounts.map((status) => {
                                            const Icon = status.icon;
                                            const isActive = statusFilter === status.value;
                                            
                                            return (
                                                <button
                                                    key={status.value}
                                                    onClick={() => setStatusFilter(status.value)}
                                                    className={`flex items-center gap-3 px-6 py-4 whitespace-nowrap border-b-2 transition-colors ${
                                                        isActive
                                                            ? 'border-violet-500 bg-violet-50'
                                                            : 'border-transparent hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <Icon className={`w-4 h-4 ${isActive ? 'text-violet-600' : 'text-gray-400'}`} />
                                                    <span className={`font-medium ${isActive ? 'text-violet-900' : 'text-gray-700'}`}>
                                                        {status.label}
                                                    </span>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        isActive ? 'bg-violet-100 text-violet-800' : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                        {status.count}
                                            </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Bulk Actions Bar */}
                                {showBulkActions && (
                                    <div className="bg-blue-50 border-b border-blue-200 px-6 py-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-blue-800">
                                                {selectedApplications.size} application{selectedApplications.size === 1 ? '' : 's'} selected
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    onClick={handleSelectAll}
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    {selectedApplications.size === filteredApplications.length ? 'Deselect All' : 'Select All'}
                                                </Button>
                                                <Button
                                                    onClick={() => handleBulkAction('accept')}
                                                    size="sm"
                                                    className="bg-green-600 hover:bg-green-700"
                                                    icon={<Check className="w-4 h-4" />}
                                                >
                                                    Accept Selected
                                                </Button>
                                                <Button
                                                    onClick={() => handleBulkAction('reject')}
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-red-600 border-red-300 hover:bg-red-50"
                                                    icon={<X className="w-4 h-4" />}
                                                >
                                                    Reject Selected
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                    </div>

                            {/* Applications Content */}
                    {filteredApplications.length === 0 ? (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Users className="h-8 w-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                        {applications.length === 0 ? 'No Applications Yet' : 'No Matching Applications'}
                                    </h3>
                                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                {applications.length === 0
                                    ? "You don't have any applications yet. Applications will appear here as developers apply to your projects."
                                            : "No applications match your current search criteria. Try adjusting your filters or search terms."
                                }
                            </p>
                                    {applications.length === 0 && (
                                        <Button 
                                            onClick={() => navigate('/projects/create')} 
                                            className="inline-flex items-center gap-2"
                                            icon={<Plus className="w-4 h-4" />}
                                        >
                                            Create Your First Project
                                        </Button>
                                    )}
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
                        </>
                    )}
                </div>
            </div>

            {/* Review Modal */}
            <ApplicationReviewModal
                application={selectedApplication!}
                isOpen={showReviewModal}
                onClose={() => setShowReviewModal(false)}
                onStatusUpdate={handleStatusUpdate}
            />
        </Layout>
    )
} 