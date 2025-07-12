import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
    Search,
    Filter,
    ChevronDown,
    ChevronUp,
    Star,
    MapPin,
    Clock,
    Users,
    Code,
    Target,
    AlertCircle,
    Lightbulb,
    TrendingUp,
    Heart,
    X,
    Sparkles,
    Zap,
    Calendar,
    Building,
    Award,
    ArrowRight,
    Grid3X3,
    List,
    SlidersHorizontal,
    Plus,
    ExternalLink,
    BookOpen,
    Globe
} from 'lucide-react'

import { searchService } from '../../services/search';
import { ProjectWithTeamMembers, SearchFilters, SearchResult } from '../../types/database';
import { Navbar } from '../../components/layout/Navbar';
import { getOrganizationCount, getDeveloperCount } from '../../services/organizationProfileService';
import { ProjectCard } from '../../components/projects/ProjectCard';

// Mock technology options (you can replace with your actual constants)
const TECHNOLOGY_STACK_OPTIONS = [
    'React', 'Vue.js', 'Angular', 'Next.js', 'Nuxt.js', 'Svelte', 'TypeScript', 'JavaScript',
    'Node.js', 'Python', 'Django', 'Flask', 'Ruby', 'Rails', 'PHP', 'Laravel',
    'Java', 'Spring', 'C#', '.NET', 'Go', 'Rust', 'Swift', 'Kotlin'
]

// Only allowed statuses - no rejected/cancelled
const STATUS_OPTIONS = [
  { label: 'Open for Applications', value: 'open', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: <Zap className="h-4 w-4" /> },
  { label: 'In Progress', value: 'in_progress', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: <Clock className="h-4 w-4" /> },
  { label: 'Completed', value: 'completed', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: <Award className="h-4 w-4" /> },
];

const EXPERIENCE_OPTIONS = [
  { label: 'Beginner (0-1 years)', value: 'beginner', icon: <Sparkles className="h-4 w-4" /> },
  { label: 'Intermediate (2-4 years)', value: 'intermediate', icon: <Target className="h-4 w-4" /> },
  { label: 'Advanced (5+ years)', value: 'advanced', icon: <Star className="h-4 w-4" /> }
];

// Popular technologies to show first
const POPULAR_TECHNOLOGIES = ['React', 'JavaScript', 'TypeScript', 'Node.js', 'Python', 'Vue.js'];

// 1. Add types to ProjectCard props
// Project Card Component
// Remove the inline ProjectCardProps interface and ProjectCard component
// Project Card Component

export default function ProjectsPage() {
    // Search state
    const [query, setQuery] = useState<string>('');
    const [filters, setFilters] = useState<SearchFilters>({ status: ['open'], technology_stack: [], difficulty_level: [] });
    const [results, setResults] = useState<SearchResult | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [sortBy, setSortBy] = useState<'created_at' | 'relevance' | 'deadline' | 'title' | 'popularity'>('created_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [showAllTechnologies, setShowAllTechnologies] = useState<boolean>(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [filterModalOpen, setFilterModalOpen] = useState<boolean>(false);
    const [organizationCount, setOrganizationCount] = useState<number | null>(null);
    const [developerCount, setDeveloperCount] = useState<number | null>(null);

    useEffect(() => {
      getOrganizationCount().then(setOrganizationCount);
      getDeveloperCount().then(setDeveloperCount);
    }, []);

    // 4. Fetch real data on mount and whenever filters/search/sort/page change
    useEffect(() => {
      const fetchProjects = async () => {
        setLoading(true);
        setError(null);
        try {
          const res = await searchService.performFullTextSearch({
            query,
            filters,
            sort_by: sortBy,
            sort_order: sortOrder,
            page: currentPage,
            limit: 20
          });
          setResults(res);
        } catch (err: any) {
          setError(err.message || 'Failed to fetch projects');
        } finally {
          setLoading(false);
        }
      };
      fetchProjects();
    }, [query, filters, sortBy, sortOrder, currentPage]);

    // 5. Update handlers to work with real data
    const handleSearch = () => {
      setCurrentPage(1);
      // useEffect will trigger fetch
    };
    const handleFilterChange = (filterType: keyof SearchFilters, value: string, checked: boolean) => {
      const prev = Array.isArray(filters[filterType]) ? filters[filterType] as string[] : [];
      const newFilters = { ...filters };
      let updated: string[];
      if (checked) {
        updated = [...prev, value];
      } else {
        updated = prev.filter((item: string) => item !== value);
      }
      if (updated.length > 0) {
        // @ts-expect-error
        newFilters[filterType] = updated;
      } else {
        delete newFilters[filterType];
      }
      setFilters(newFilters as SearchFilters);
      setCurrentPage(1);
    };
    const handleCustomFilterChange = (filterType: keyof SearchFilters, value: string, checked: boolean) => {
      handleFilterChange(filterType, value, checked);
    };
    const isCustomFilterActive = (filterType: keyof SearchFilters, value: string) => {
      return Array.isArray(filters[filterType]) && (filters[filterType] as string[]).includes(value) || false;
    };
    const handleClearFilters = () => {
      const defaultStatusFilters = ['open'];
      const clearedFilters: SearchFilters = { status: defaultStatusFilters, technology_stack: [], difficulty_level: [] };
      setFilters(clearedFilters);
      setCurrentPage(1);
    };
    const getActiveFilterCount = () => {
      let count = 0;
      Object.values(filters).forEach(filterArray => {
        if (Array.isArray(filterArray)) {
          count += filterArray.length;
        }
      });
      return count - 1; // Subtract 1 for default status filter
    };

    // Get displayed technologies
    const displayedTechnologies = showAllTechnologies 
        ? TECHNOLOGY_STACK_OPTIONS 
        : POPULAR_TECHNOLOGIES

    // 6. Add Navbar at the top if not present
    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
                {/* ENHANCED HERO SECTION */}
                <div className="relative bg-gradient-to-br from-indigo-900 via-blue-800 to-purple-900 overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:60px_60px]" />
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 via-blue-800/80 to-purple-900/90" />
                    
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6">
                        <div className="text-center">
                            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-medium mb-6">
                                <Sparkles className="h-4 w-4 mr-2" />
                                Discover Meaningful Projects
                            </div>
                            
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
                                Build for
                                <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                                    Good
                                </span>
                            </h1>
                            
                            <p className="text-lg text-blue-100 max-w-3xl mx-auto mb-6 leading-relaxed">
                                Connect with impactful projects that match your skills and make a difference in the nonprofit sector.
                            </p>

                            {/* Enhanced Search Bar */}
                            <div className="max-w-3xl mx-auto mb-6">
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
                                    <div className="relative flex items-center bg-white rounded-2xl shadow-2xl">
                                        <span className="absolute left-6 text-gray-400">
                                            <Search className="h-6 w-6" />
                                        </span>
                                        <input
                                            type="text"
                                            value={query}
                                            onChange={(e) => setQuery(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                            placeholder="Search by project, organization, or technology..."
                                            className="block w-full pl-16 pr-40 py-3 text-lg text-gray-900 bg-transparent border-0 rounded-2xl focus:ring-0 focus:outline-none placeholder-gray-500"
                                        />
                                        <button
                                            onClick={handleSearch}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg transform transition hover:scale-105"
                                        >
                                            Search
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="flex flex-wrap justify-center gap-8 text-white/80 mb-2">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-white">{results?.total_count || '100+'}</div>
                                    <div className="text-sm">Active Projects</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-white">{organizationCount !== null ? organizationCount : '...'}</div>
                                    <div className="text-sm">Organizations</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-white">{developerCount !== null ? developerCount : '...'}</div>
                                    <div className="text-sm">Developers</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ENHANCED FILTER BAR */}
                <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex flex-col gap-4">
                            {/* Status Pills */}
                            <div className="flex flex-wrap gap-3 items-center">
                                <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <Filter className="h-4 w-4" />
                                    Status:
                                </span>
                                {STATUS_OPTIONS.map(opt => (
                                    <label key={opt.value} className="group cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={filters.status?.includes(opt.value) || false}
                                            onChange={e => handleFilterChange('status', opt.value, e.target.checked)}
                                            className="sr-only"
                                        />
                                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 text-sm font-medium transition-all duration-200 ${
                                            filters.status?.includes(opt.value) 
                                                ? opt.color + ' shadow-md transform scale-105' 
                                                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                        }`}>
                                            {opt.icon}
                                            {opt.label}
                                        </div>
                                    </label>
                                ))}
                            </div>

                            {/* Technology Pills */}
                            <div className="flex flex-wrap gap-3 items-center">
                                <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <Code className="h-4 w-4" />
                                    Technologies:
                                </span>
                                
                                {displayedTechnologies.map(tech => (
                                    <label key={tech} className="group cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={filters.technology_stack?.includes(tech) || false}
                                            onChange={e => handleFilterChange('technology_stack', tech, e.target.checked)}
                                            className="sr-only"
                                        />
                                        <div className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-all duration-200 ${
                                            filters.technology_stack?.includes(tech)
                                                ? 'bg-blue-100 text-blue-800 border-blue-300 shadow-md'
                                                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-200 hover:bg-blue-50'
                                        }`}>
                                            {tech}
                                        </div>
                                    </label>
                                ))}

                                {/* Show More/Less Button */}
                                <button
                                    onClick={() => setShowAllTechnologies(!showAllTechnologies)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 transition-all duration-200 text-sm font-medium border border-gray-300"
                                >
                                    {showAllTechnologies ? (
                                        <>
                                            <ChevronUp className="h-4 w-4" />
                                            Show Less
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="h-4 w-4" />
                                            Show All ({TECHNOLOGY_STACK_OPTIONS.length - POPULAR_TECHNOLOGIES.length} more)
                                        </>
                                    )}
                                </button>

                                {/* Advanced Filters Button */}
                                <button
                                    onClick={() => setFilterModalOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 hover:from-indigo-200 hover:to-purple-200 transition-all duration-200 text-sm font-medium border border-indigo-300"
                                >
                                    <SlidersHorizontal className="h-4 w-4" />
                                    Advanced Filters
                                    {getActiveFilterCount() > 0 && (
                                        <span className="bg-indigo-600 text-white text-xs px-2 py-1 rounded-full">
                                            {getActiveFilterCount()}
                                        </span>
                                    )}
                                </button>
                            </div>

                            {/* Active Filter Chips */}
                            {getActiveFilterCount() > 0 && (
                                <div className="flex flex-wrap gap-2 items-center">
                                    <span className="text-sm text-gray-500">Active filters:</span>
                                    
                                    {/* Non-default status filters */}
                                    {filters.status?.filter(val => val !== 'open').map(val => {
                                        const statusOpt = STATUS_OPTIONS.find(opt => opt.value === val)
                                        return (
                                            <span key={val} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm border border-blue-200">
                                                {statusOpt?.icon}
                                                {statusOpt?.label}
                                                <button 
                                                    onClick={() => handleFilterChange('status', val, false)}
                                                    className="ml-1 hover:text-blue-900"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </span>
                                        )
                                    })}

                                    {/* Other filter chips */}
                                    {Object.entries(filters).flatMap(([key, arr]: [string, unknown]) =>
                                        Array.isArray(arr) && key !== 'status'
                                            ? (arr as string[]).map((val: string) => (
                                                <span key={key + val} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm border border-gray-200">
                                                    {val}
                                                    <button 
                                                        onClick={() => handleFilterChange(key as keyof SearchFilters, val, false)}
                                                        className="ml-1 hover:text-gray-900"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </span>
                                            ))
                                            : []
                                    )}

                                    <button
                                        onClick={handleClearFilters}
                                        className="text-sm text-red-600 hover:text-red-800 font-medium ml-2"
                                    >
                                        Clear all
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header with View Controls */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                {results ? `${results.total_count} Projects Found` : 'Loading Projects...'}
                            </h2>
                            {query && (
                                <p className="text-gray-600">Searching for: "{query}"</p>
                            )}
                        </div>

                        <div className="flex items-center gap-4">
                            {/* View Mode Toggle */}
                            <div className="flex items-center bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-md transition-colors ${
                                        viewMode === 'grid' 
                                            ? 'bg-white text-gray-900 shadow-sm' 
                                            : 'text-gray-500 hover:text-gray-900'
                                    }`}
                                >
                                    <Grid3X3 className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-md transition-colors ${
                                        viewMode === 'list' 
                                            ? 'bg-white text-gray-900 shadow-sm' 
                                            : 'text-gray-500 hover:text-gray-900'
                                    }`}
                                >
                                    <List className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Sort Dropdown */}
                            <select
                                value={`${sortBy}-${sortOrder}`}
                                onChange={e => {
                                    const [newSortBy, newSortOrder] = e.target.value.split('-')
                                    setSortBy(newSortBy as 'created_at' | 'relevance' | 'deadline' | 'title' | 'popularity')
                                    setSortOrder(newSortOrder as 'asc' | 'desc')
                                }}
                                className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 shadow-sm"
                            >
                                <option value="created_at-desc">Newest First</option>
                                <option value="created_at-asc">Oldest First</option>
                                <option value="relevance-desc">Most Relevant</option>
                                <option value="title-asc">Title A-Z</option>
                                <option value="title-desc">Title Z-A</option>
                            </select>
                        </div>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="flex justify-center items-center py-16">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
                            <div className="flex items-center">
                                <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                                <div className="text-red-700 text-sm font-medium">
                                    Error: {error}
                                </div>
                                <button
                                    onClick={handleSearch}
                                    className="ml-4 text-red-700 hover:text-red-900 text-sm font-medium"
                                >
                                    Try Again
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Projects Grid/List */}
                    {results && !loading && (
                        <div className={viewMode === 'grid' 
                            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" 
                            : "space-y-6"
                        }>
                            {results.projects.map((project: ProjectWithTeamMembers, index: number) => {
                                let variant = 'default'
                                if (viewMode === 'grid') {
                                    if (index % 7 === 0 && index > 0) {
                                        variant = 'large'
                                    } else if (index % 5 === 2) {
                                        variant = 'featured'
                                    }
                                }
                                return (
                                    <ProjectCard
                                        key={project.id}
                                        project={project}
                                        variant={variant as 'default' | 'large' | 'featured'}
                                    />
                                )
                            })}
                        </div>
                    )}

                    {/* Empty State */}
                    {results && !loading && results.projects.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-200">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Search className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                No projects found
                            </h3>
                            <p className="text-gray-600 mb-8 max-w-md mx-auto">
                                Try adjusting your search terms or filters to discover more projects that match your interests.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button 
                                    onClick={handleClearFilters} 
                                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Clear Filters
                                </button>
                                <button 
                                    onClick={() => {setQuery(''); handleSearch();}} 
                                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Browse All Projects
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Advanced Filters Modal */}
                {filterModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setFilterModalOpen(false)} />
                        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                                    <SlidersHorizontal className="h-5 w-5 text-blue-600" />
                                    Advanced Filters
                                </h2>
                                <button
                                    onClick={() => setFilterModalOpen(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6 space-y-6 max-h-[calc(90vh-140px)] overflow-y-auto">
                                {/* Experience Level */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <Target className="h-4 w-4 text-gray-600" />
                                        Experience Level
                                    </h3>
                                    <div className="grid grid-cols-1 gap-3">
                                        {EXPERIENCE_OPTIONS.map((level) => (
                                            <label key={level.value} className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={filters.difficulty_level?.includes(level.value) || false}
                                                    onChange={(e) => handleFilterChange('difficulty_level', level.value, e.target.checked)}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <div className="flex items-center gap-3 ml-3">
                                                    {level.icon}
                                                    <span className="text-sm font-medium text-gray-700">{level.label}</span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
                                <button
                                    onClick={handleClearFilters}
                                    className="text-sm text-gray-600 hover:text-gray-800 font-medium"
                                >
                                    Clear all filters
                                </button>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setFilterModalOpen(false)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => setFilterModalOpen(false)}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Apply Filters
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}