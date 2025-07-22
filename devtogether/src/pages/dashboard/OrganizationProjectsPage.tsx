import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { projectService } from '../../services/projects';
import { ProjectWithTeamMembers } from '../../types/database';
import { ProjectCard } from '../../components/projects/ProjectCard';
import { Layout } from '../../components/layout/Layout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { ResubmitProjectModal } from '../../components/projects/ResubmitProjectModal';
import {
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Grid3X3,
  List,
  Plus,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Star,
  TrendingUp,
  AlertTriangle,
  Eye,
  Settings,
  RefreshCw,
  Target,
  Zap,
  Award,
  Calendar,
  Building,
  FileText,
  Sparkles,
  Activity,
  Briefcase,
  Heart,
  Lightbulb,
  MessageSquare,
  Code,
  Download
} from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Projects', count: 0, color: 'bg-gray-50 text-gray-700', icon: Target },
  { value: 'pending', label: 'Pending Review', count: 0, color: 'bg-yellow-50 text-yellow-700', icon: Clock },
  { value: 'open', label: 'Open', count: 0, color: 'bg-emerald-50 text-emerald-700', icon: Zap },
  { value: 'in_progress', label: 'In Progress', count: 0, color: 'bg-blue-50 text-blue-700', icon: Activity },
  { value: 'completed', label: 'Completed', count: 0, color: 'bg-green-50 text-green-700', icon: CheckCircle },
  { value: 'cancelled', label: 'Cancelled', count: 0, color: 'bg-gray-50 text-gray-500', icon: XCircle },
  { value: 'rejected', label: 'Rejected', count: 0, color: 'bg-red-50 text-red-700', icon: AlertTriangle },
];

const SORT_OPTIONS = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'title', label: 'Project Name' },
  { value: 'status', label: 'Status' },
  { value: 'deadline', label: 'Deadline' },
  { value: 'applications', label: 'Applications' },
  { value: 'team_size', label: 'Team Size' },
];

const VIEW_MODES = [
  { value: 'grid', label: 'Grid View', icon: Grid3X3 },
  { value: 'list', label: 'List View', icon: List },
];

export default function OrganizationProjectsPage() {
  const { profile } = useAuth();
  const [allProjects, setAllProjects] = useState<ProjectWithTeamMembers[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resubmitProject, setResubmitProject] = useState<ProjectWithTeamMembers | null>(null);
  
  // Enhanced filtering and sorting states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    if (!profile?.id) return;
    loadProjects();
  }, [profile?.id]);

  const loadProjects = async () => {
    if (!profile?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
    // Always include rejected projects for org dashboard
    // Organization owners can see private team member profiles
      const data = await projectService.getProjectsWithTeamMembers({ organization_id: profile.id }, true, true);
      setAllProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  // Enhanced filtering and sorting logic
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = allProjects;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(project => 
        project.title.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query) ||
        project.technology_stack.some(tech => tech.toLowerCase().includes(query)) ||
        project.team_members?.some(member => 
          member.profile.first_name?.toLowerCase().includes(query) ||
          member.profile.last_name?.toLowerCase().includes(query)
        )
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    // Sorting
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'deadline':
          const aDeadline = a.deadline ? new Date(a.deadline).getTime() : 0;
          const bDeadline = b.deadline ? new Date(b.deadline).getTime() : 0;
          comparison = aDeadline - bDeadline;
          break;
        case 'applications':
          comparison = (a.applications?.length || 0) - (b.applications?.length || 0);
          break;
        case 'team_size':
          comparison = (a.team_members?.length || 0) - (b.team_members?.length || 0);
          break;
        case 'recent':
        default:
          comparison = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [allProjects, searchQuery, statusFilter, sortBy, sortOrder]);

  // Calculate stats for status filters
  const statusCounts = useMemo(() => {
    const counts = STATUS_OPTIONS.map(option => ({
      ...option,
      count: option.value === 'all' 
        ? allProjects.length 
        : allProjects.filter(p => p.status === option.value).length
    }));
    return counts;
  }, [allProjects]);

  // Calculate comprehensive organization metrics
  const organizationMetrics = useMemo(() => {
    const totalProjects = allProjects.length;
    const activeProjects = allProjects.filter(p => ['open', 'in_progress'].includes(p.status)).length;
    const completedProjects = allProjects.filter(p => p.status === 'completed').length;
    const pendingProjects = allProjects.filter(p => p.status === 'pending').length;
    const rejectedProjects = allProjects.filter(p => p.status === 'rejected').length;
    
    const totalApplications = allProjects.reduce((sum, p) => sum + (p.applications?.length || 0), 0);
    const totalTeamMembers = allProjects.reduce((sum, p) => sum + (p.team_members?.length || 0), 0);
    const averageTeamSize = totalProjects > 0 ? Math.round((totalTeamMembers / totalProjects) * 10) / 10 : 0;
    
    const successRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;
    const applicationRate = totalProjects > 0 ? Math.round((totalApplications / totalProjects) * 10) / 10 : 0;
    
    const mostUsedTechnologies = allProjects
      .flatMap(p => p.technology_stack)
      .reduce((acc, tech) => {
        acc[tech] = (acc[tech] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    
    const topTechnologies = Object.entries(mostUsedTechnologies)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([tech, count]) => ({ tech, count }));

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      pendingProjects,
      rejectedProjects,
      totalApplications,
      totalTeamMembers,
      averageTeamSize,
      successRate,
      applicationRate,
      topTechnologies
    };
  }, [allProjects]);

  const handleResubmitSuccess = () => {
    setResubmitProject(null);
    loadProjects();
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Enhanced Header with Gradient */}
        <div className="relative bg-gradient-to-br from-purple-900 via-blue-800 to-indigo-900 overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:60px_60px]" />
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 via-blue-800/80 to-indigo-900/90" />
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
            {/* Header Content */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-medium mb-3">
                  <Building className="h-4 w-4 mr-2" />
                  Organization Dashboard
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">My Projects</h1>
                <p className="text-blue-100 text-lg">Manage your organization's project portfolio and team development</p>
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
                  onClick={loadProjects} 
                  variant="outline" 
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  icon={<RefreshCw className="w-4 h-4" />}
                >
                  Refresh
                </Button>
              <Button
                  onClick={() => window.location.href = '/projects/create'}
                  className="bg-purple-600 text-white hover:bg-purple-700 shadow-lg border border-purple-600"
                  icon={<Plus className="w-4 h-4" />}
              >
                  New Project
              </Button>
              </div>
            </div>

            {/* Comprehensive Metrics Dashboard */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-6">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <Target className="w-5 h-5 text-white/80" />
                  <span className="text-2xl font-bold text-white">{organizationMetrics.totalProjects}</span>
                </div>
                <p className="text-white/70 text-sm font-medium">Total Projects</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <Activity className="w-5 h-5 text-blue-300" />
                  <span className="text-2xl font-bold text-white">{organizationMetrics.activeProjects}</span>
                </div>
                <p className="text-white/70 text-sm font-medium">Active Now</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle className="w-5 h-5 text-green-300" />
                  <span className="text-2xl font-bold text-white">{organizationMetrics.completedProjects}</span>
                </div>
                <p className="text-white/70 text-sm font-medium">Completed</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="w-5 h-5 text-yellow-300" />
                  <span className="text-2xl font-bold text-white">{organizationMetrics.pendingProjects}</span>
                </div>
                <p className="text-white/70 text-sm font-medium">Pending</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <Users className="w-5 h-5 text-purple-300" />
                  <span className="text-2xl font-bold text-white">{organizationMetrics.totalTeamMembers}</span>
                </div>
                <p className="text-white/70 text-sm font-medium">Team Members</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <FileText className="w-5 h-5 text-orange-300" />
                  <span className="text-2xl font-bold text-white">{organizationMetrics.totalApplications}</span>
                </div>
                <p className="text-white/70 text-sm font-medium">Applications</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="w-5 h-5 text-green-300" />
                  <span className="text-2xl font-bold text-white">{organizationMetrics.successRate}%</span>
                </div>
                <p className="text-white/70 text-sm font-medium">Success Rate</p>
              </div>
            </div>

            {/* Analytics Panel */}
            {showAnalytics && (
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Project Analytics
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Key Insights */}
                  <div>
                    <h4 className="text-white/90 font-medium mb-3">Key Insights</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/70">Average Team Size</span>
                        <span className="text-white font-medium">{organizationMetrics.averageTeamSize} members</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/70">Applications per Project</span>
                        <span className="text-white font-medium">{organizationMetrics.applicationRate} avg</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/70">Rejection Rate</span>
                        <span className="text-white font-medium">
                          {organizationMetrics.totalProjects > 0 
                            ? Math.round((organizationMetrics.rejectedProjects / organizationMetrics.totalProjects) * 100)
                            : 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Top Technologies */}
                  <div>
                    <h4 className="text-white/90 font-medium mb-3">Most Used Technologies</h4>
                    <div className="space-y-2">
                      {organizationMetrics.topTechnologies.map((tech, index) => (
                        <div key={tech.tech} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-white/60"></span>
                            <span className="text-white/70">{tech.tech}</span>
                          </div>
                          <span className="text-white font-medium">{tech.count} projects</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Enhanced Search and Filter Bar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search projects, technologies, team members..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
              </div>

              {/* Filter Controls */}
              <div className="flex items-center gap-3">
                <Button
                  variant={showFilters ? 'primary' : 'outline'}
                  onClick={() => setShowFilters(!showFilters)}
                  icon={<Filter className="w-4 h-4" />}
                  className="lg:hidden"
                >
                  Filters
                </Button>

                <div className="hidden lg:flex items-center gap-3">
                  <Select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="w-40"
                  >
                    {SORT_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </Select>

                  <Button
                    variant="outline"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    icon={sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                  />

                  <div className="flex bg-gray-100 rounded-lg p-1">
                    {VIEW_MODES.map(mode => {
                      const IconComponent = mode.icon;
                      return (
                        <button
                          key={mode.value}
                          onClick={() => setViewMode(mode.value as 'grid' | 'list')}
                          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            viewMode === mode.value
                              ? 'bg-white text-blue-600 shadow-sm'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          <IconComponent className="w-4 h-4" />
                          <span className="hidden sm:inline">{mode.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Filters */}
            {showFilters && (
              <div className="lg:hidden mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                  >
                    {SORT_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </Select>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      icon={sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                      className="flex-1"
                    >
                      {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                    </Button>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  {VIEW_MODES.map(mode => {
                    const IconComponent = mode.icon;
                    return (
                      <button
                        key={mode.value}
                        onClick={() => setViewMode(mode.value as 'grid' | 'list')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-1 justify-center ${
                          viewMode === mode.value
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                        {mode.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Status Filter Tabs with Enhanced Design */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {statusCounts.map((status) => {
                const IconComponent = status.icon;
                return (
                  <button
                    key={status.value}
                    onClick={() => setStatusFilter(status.value)}
                    className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      statusFilter === status.value
                        ? `${status.color} border-2 border-current shadow-lg scale-105`
                        : 'bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{status.label}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      statusFilter === status.value ? 'bg-white/20' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {status.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Projects Grid/List */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-56 bg-gray-100 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : error ? (
            <div className="text-center py-16">
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-md mx-auto">
                <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Projects</h3>
                <p className="text-red-700 mb-4">{error}</p>
                <Button onClick={loadProjects} variant="outline" className="border-red-300 text-red-700 hover:bg-red-50">
                  Try Again
                </Button>
              </div>
            </div>
          ) : filteredAndSortedProjects.length === 0 ? (
            <div className="text-center py-16">
              {allProjects.length === 0 ? (
                <div className="max-w-md mx-auto">
                  <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-8 border border-purple-200">
                    <Briefcase className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Projects Yet</h3>
                    <p className="text-gray-600 mb-6">
                      Start building your project portfolio. Create your first project to connect with talented developers!
                    </p>
                    <Button 
                      onClick={() => window.location.href = '/projects/create'}
                      icon={<Plus className="w-4 h-4" />}
                      className="w-full sm:w-auto"
                    >
                      Create Project
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="max-w-md mx-auto">
                  <div className="bg-yellow-50 rounded-xl p-8 border border-yellow-200">
                    <Search className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Matching Projects</h3>
                    <p className="text-gray-600 mb-6">
                      No projects match your current search and filter criteria. Try adjusting your filters.
                    </p>
                    <Button 
                      onClick={() => {
                        setSearchQuery('');
                        setStatusFilter('all');
                      }}
                      variant="outline"
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              )}
          </div>
        ) : (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" 
              : "space-y-4"
            }>
              {filteredAndSortedProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                  variant={viewMode === 'list' ? 'list' : 'default'}
                onResubmitClick={() => setResubmitProject(project)}
              />
            ))}
          </div>
        )}

          {/* Results Summary */}
          {filteredAndSortedProjects.length > 0 && (
            <div className="mt-8 text-center text-gray-600">
              <p>
                Showing {filteredAndSortedProjects.length} of {allProjects.length} projects
                {searchQuery && ` matching "${searchQuery}"`}
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Resubmit Modal */}
      <ResubmitProjectModal
        open={!!resubmitProject}
        project={resubmitProject}
        onClose={() => setResubmitProject(null)}
        onSuccess={handleResubmitSuccess}
      />
    </Layout>
  );
} 