import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../../components/layout'
import { useAuth } from '../../contexts/AuthContext'
import { applicationService, ApplicationWithDetails } from '../../services/applications'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { toastService } from '../../services/toastService'
import {
    Search,
    Calendar,
    Clock,
    ExternalLink,
    Eye,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Archive,
    Loader2,
    FileText,
    Building,
    MapPin,
    Star,
    RefreshCw,
    Filter,
    TrendingUp,
    Award,
    Users,
    Target,
    Activity,
    Code,
    Briefcase,
    Grid3X3,
    List,
    Sparkles,
    Plus,
    BarChart3,
    Heart,
    Zap
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

const STATUS_OPTIONS = [
    { value: 'all', label: 'All Applications', count: 0, color: 'bg-gray-50 text-gray-700', icon: Target },
    { value: 'pending', label: 'Under Review', count: 0, color: 'bg-yellow-50 text-yellow-700', icon: Clock },
    { value: 'accepted', label: 'Accepted', count: 0, color: 'bg-green-50 text-green-700', icon: CheckCircle },
    { value: 'rejected', label: 'Not Selected', count: 0, color: 'bg-red-50 text-red-700', icon: XCircle },
    { value: 'withdrawn', label: 'Withdrawn', count: 0, color: 'bg-gray-50 text-gray-500', icon: Archive },
];

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

    // Enhanced filtering and UI states
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

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
    }, [applications, searchQuery, statusFilter])

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
        if (statusFilter !== 'all') {
            filtered = filtered.filter(app => app.status === statusFilter)
        }

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
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

    // Calculate enhanced metrics
    const enhancedMetrics = {
        totalApplications: stats.total,
        pendingReview: stats.pending,
        successRate: stats.total > 0 ? Math.round((stats.accepted / stats.total) * 100) : 0,
        activeWorkspaces: stats.accepted,
        averageResponseTime: '3-5 days', // Could be calculated from real data
        thisMonthApplications: applications.filter(app => {
            const appDate = new Date(app.created_at);
            const now = new Date();
            return appDate.getMonth() === now.getMonth() && appDate.getFullYear() === now.getFullYear();
        }).length
    };

    // Update status counts for tabs
    const statusOptionsWithCounts = STATUS_OPTIONS.map(option => ({
        ...option,
        count: option.value === 'all' ? stats.total : stats[option.value as keyof ApplicationStats] || 0
    }));

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
                            <Button onClick={loadApplications} className="w-full">
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
                <div className="relative bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 overflow-hidden">
                    <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:60px_60px]" />
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/90 via-teal-800/80 to-cyan-900/90" />
                    
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
                        {/* Header Content */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                            <div>
                                <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-medium mb-3">
                                    <FileText className="h-4 w-4 mr-2" />
                                    My Applications
                                </div>
                                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                                    Application Tracker
                                </h1>
                                <p className="text-blue-100 text-lg">Track your project applications and opportunities</p>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <Button
                                    onClick={() => setShowFilters(!showFilters)}
                                    variant="outline"
                                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                                    icon={<Filter className="w-4 h-4" />}
                                >
                                    Filters
                                </Button>
                                <Button 
                                    onClick={loadApplications} 
                                    variant="outline" 
                                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                                    icon={<RefreshCw className="w-4 h-4" />}
                                >
                                    Refresh
                                </Button>
                                <Button 
                                    onClick={() => navigate('/projects')}
                                    className="bg-white text-emerald-900 hover:bg-blue-50 shadow-lg border border-blue-200"
                                    icon={<Plus className="w-4 h-4" />}
                                >
                                    Apply to Projects
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
                                    <p className="text-white/70 text-sm font-medium">Under Review</p>
                                </div>
                                
                                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <CheckCircle className="w-5 h-5 text-green-300" />
                                        <span className="text-2xl font-bold text-white">{enhancedMetrics.activeWorkspaces}</span>
                                    </div>
                                    <p className="text-white/70 text-sm font-medium">Active</p>
                                </div>
                                
                                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <TrendingUp className="w-5 h-5 text-green-300" />
                                        <span className="text-2xl font-bold text-white">{enhancedMetrics.successRate}%</span>
                                    </div>
                                    <p className="text-white/70 text-sm font-medium">Success Rate</p>
                                </div>
                                
                                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <Calendar className="w-5 h-5 text-blue-300" />
                                        <span className="text-2xl font-bold text-white">{enhancedMetrics.thisMonthApplications}</span>
                                    </div>
                                    <p className="text-white/70 text-sm font-medium">This Month</p>
                                </div>
                                
                                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <Activity className="w-5 h-5 text-purple-300" />
                                        <span className="text-lg font-bold text-white">{enhancedMetrics.averageResponseTime}</span>
                                    </div>
                                    <p className="text-white/70 text-sm font-medium">Avg Response</p>
                                </div>
                            </div>
                        )}

                        {/* Filters Panel */}
                        {showFilters && (
                            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 mb-6">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <Filter className="w-5 h-5" />
                                    Search & Filter Applications
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-white/90 text-sm font-medium mb-2">Search Applications</label>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
                                            <input
                                                type="text"
                                                placeholder="Search by project, organization, or notes..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full pl-10 pr-3 py-2 bg-white/10 border border-white/20 text-white placeholder-white/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/30"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-white/90 text-sm font-medium mb-2">View Mode</label>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setViewMode('grid')}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                                                    viewMode === 'grid' 
                                                        ? 'bg-white/20 text-white' 
                                                        : 'bg-white/10 text-white/70 hover:bg-white/15'
                                                }`}
                                            >
                                                <Grid3X3 className="w-4 h-4" />
                                                Grid
                                            </button>
                                            <button
                                                onClick={() => setViewMode('list')}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                                                    viewMode === 'list' 
                                                        ? 'bg-white/20 text-white' 
                                                        : 'bg-white/10 text-white/70 hover:bg-white/15'
                                                }`}
                                            >
                                                <List className="w-4 h-4" />
                                                List
                                            </button>
                                        </div>
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
                                <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mx-auto mb-4" />
                                <p className="text-gray-600">Loading your applications...</p>
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
                                                            ? 'border-emerald-500 bg-emerald-50'
                                                            : 'border-transparent hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`} />
                                                    <span className={`font-medium ${isActive ? 'text-emerald-900' : 'text-gray-700'}`}>
                                                        {status.label}
                                                    </span>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                        {status.count}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Applications Content */}
                            {filteredApplications.length === 0 ? (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FileText className="h-8 w-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                        {applications.length === 0 ? 'No Applications Yet' : 'No Matching Applications'}
                                    </h3>
                                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                        {applications.length === 0
                                            ? "You haven't applied to any projects yet. Start by exploring exciting opportunities and applying to projects that match your skills."
                                            : "No applications match your current search criteria. Try adjusting your filters or search terms."
                                        }
                                    </p>
                                    {applications.length === 0 && (
                                        <Button 
                                            onClick={() => navigate('/projects')} 
                                            className="inline-flex items-center gap-2"
                                            icon={<Search className="w-4 h-4" />}
                                        >
                                            Discover Projects
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <div className={`${
                                    viewMode === 'grid' 
                                        ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' 
                                        : 'space-y-4'
                                }`}>
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

                                        return (
                                            <div key={application.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                                                {/* Application Header */}
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-cyan-100 rounded-lg flex items-center justify-center">
                                                            <Building className="w-6 h-6 text-emerald-600" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                                                                {application.project.title}
                                                            </h3>
                                                            <p className="text-gray-600 text-sm">
                                                                {application.project.organization.organization_name}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex flex-col items-end gap-2">
                                                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(application.status)}`}>
                                                            {getStatusIcon(application.status)}
                                                            {application.status.charAt(0).toUpperCase() + application.status.slice(1).replace('_', ' ')}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            Applied {formatDate(application.created_at)}
                                                        </span>
                                                    </div>
                                                </div>

                                                                                                 {/* Application Description */}
                                                 <div className="mb-4">
                                                     {(application.project as any).description && (
                                                         <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                                                             {(application.project as any).description}
                                                         </p>
                                                     )}
                                                     
                                                     {/* Technology Stack */}
                                                     {(application.project as any).technology_stack && (application.project as any).technology_stack.length > 0 && (
                                                         <div className="flex flex-wrap gap-1 mb-2">
                                                             {(application.project as any).technology_stack.slice(0, 3).map((tech: string, index: number) => (
                                                                 <span key={index} className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">
                                                                     {tech}
                                                                 </span>
                                                             ))}
                                                             {(application.project as any).technology_stack.length > 3 && (
                                                                 <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-50 text-gray-600 text-xs font-medium">
                                                                     +{(application.project as any).technology_stack.length - 3} more
                                                                 </span>
                                                             )}
                                                         </div>
                                                     )}
                                                 </div>

                                                {/* Status Message */}
                                                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                                    <p className="text-sm text-gray-700">
                                                        {getStatusMessage(application.status)}
                                                    </p>
                                                </div>

                                                {/* Application Actions */}
                                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                                    {canGoToWorkspace && (
                                                        <Button
                                                            onClick={() => navigate(`/workspace/${application.project_id}`)}
                                                            className="flex items-center justify-center gap-2 flex-1"
                                                            icon={<ExternalLink className="w-4 h-4" />}
                                                        >
                                                            Enter Workspace
                                                        </Button>
                                                    )}
                                                    
                                                    {canViewProject && (
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => navigate(`/projects/${application.project_id}`)}
                                                            className="flex items-center justify-center gap-2 flex-1"
                                                            icon={<Eye className="w-4 h-4" />}
                                                        >
                                                            View Project
                                                        </Button>
                                                    )}
                                                    
                                                    {canWithdraw && (
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => handleWithdrawApplication(application.id)}
                                                            className="flex items-center justify-center gap-2 text-red-600 border-red-300 hover:bg-red-50"
                                                            icon={<Archive className="w-4 h-4" />}
                                                        >
                                                            Withdraw
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </Layout>
    )
} 