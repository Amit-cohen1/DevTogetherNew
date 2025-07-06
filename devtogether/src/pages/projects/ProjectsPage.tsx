import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Layout } from '../../components/layout'
import { ProjectCard } from '../../components/projects/ProjectCard'
import { searchService, AdvancedSearchParams } from '../../services/search'
import { SearchFilters, SearchResult, Project } from '../../types/database'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/Button'
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
    Loader2,
    AlertCircle,
    Lightbulb,
    TrendingUp,
    Heart
} from 'lucide-react'
import { DIFFICULTY_LEVELS, APPLICATION_TYPES, TECHNOLOGY_STACK_OPTIONS } from '../../utils/constants'

export default function ProjectsPage() {
    const [searchParams, setSearchParams] = useSearchParams()
    const { user } = useAuth()
    const navigate = useNavigate()

    // Search state
    const [query, setQuery] = useState(searchParams.get('q') || '')
    const [filters, setFilters] = useState<SearchFilters>({
        status: ['open'] // Will be updated based on user role in useEffect
    })
    const [results, setResults] = useState<SearchResult | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // UI state
    const [currentPage, setCurrentPage] = useState(1)
    const [sortBy, setSortBy] = useState<AdvancedSearchParams['sort_by']>('created_at')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
    const [showSkillsForm, setShowSkillsForm] = useState(false)
    const [userSkills, setUserSkills] = useState('')
    const [expandedFilterSections, setExpandedFilterSections] = useState({
        technologies: true,
        experience: true,
        causeAreas: true,
        timeCommitment: true,
        status: true
    })

    // Initialize from URL params and load initial projects
    useEffect(() => {
        const urlQuery = searchParams.get('q')
        const urlFilters = searchParams.get('filters')
        const urlPage = searchParams.get('page')
        const urlSort = searchParams.get('sort')

        if (urlQuery) setQuery(urlQuery)
        if (urlPage) setCurrentPage(parseInt(urlPage, 10))
        if (urlSort) setSortBy(urlSort as AdvancedSearchParams['sort_by'])

        // Always load projects on page load, with or without search query
        const sortValue = urlSort ? (urlSort as AdvancedSearchParams['sort_by']) : 'created_at'
        const searchQuery = urlQuery || ''

        // Smart default status filtering based on user role
        let defaultStatusFilters: string[]
        if (user && user.role === 'developer') {
            // Developers should see projects they can apply to AND projects they're working on
            defaultStatusFilters = ['open', 'in_progress']
        } else {
            // Organizations/visitors see only open projects by default
            defaultStatusFilters = ['open']
        }

        // Determine final filters: URL filters take precedence, then role-based defaults
        let finalFilters: SearchFilters
        if (urlFilters) {
            try {
                finalFilters = JSON.parse(urlFilters)
            } catch (e) {
                console.error('Invalid filters in URL:', e)
                finalFilters = { status: defaultStatusFilters }
            }
        } else {
            finalFilters = { status: defaultStatusFilters }
        }

        // Update component state to reflect the actual filters being used
        setFilters(finalFilters)

        performSearch(searchQuery, finalFilters, 1, sortValue)
    }, [searchParams, user])

    // Update URL when search parameters change
    const updateURL = useCallback((newQuery: string, newFilters: SearchFilters, page: number = 1) => {
        const params = new URLSearchParams()

        if (newQuery) params.set('q', newQuery)
        if (Object.keys(newFilters).length > 0) params.set('filters', JSON.stringify(newFilters))
        if (page > 1) params.set('page', page.toString())
        if (sortBy && sortBy !== 'created_at') params.set('sort', sortBy)

        setSearchParams(params)
    }, [sortBy, setSearchParams])

    // Perform search
    const performSearch = async (
        searchQuery: string,
        searchFilters: SearchFilters,
        page: number = 1,
        sort: AdvancedSearchParams['sort_by'] = 'created_at',
        order: 'asc' | 'desc' = 'desc'
    ) => {
        try {
            setLoading(true)
            setError(null)

            const searchParams: AdvancedSearchParams = {
                query: searchQuery,
                filters: searchFilters,
                sort_by: sort,
                sort_order: order,
                page,
                limit: 20
            }

            const searchResult = await searchService.performFullTextSearch(searchParams)
            console.log('🔍 Search results received:', searchResult)
            console.log('🔍 First project applications:', (searchResult.projects[0] as any)?.applications)
            setResults(searchResult)

            // Save to search history only if there's an actual search query
            if (user && searchQuery.trim()) {
                await searchService.saveSearchToHistory(
                    user.id,
                    searchQuery,
                    searchFilters,
                    searchResult.total_count
                )
            }

            setCurrentPage(page)

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Search failed')
            console.error('Search error:', err)
        } finally {
            setLoading(false)
        }
    }

    // Handle search submission
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setCurrentPage(1)
        updateURL(query, filters, 1)
        performSearch(query, filters, 1, sortBy, sortOrder)
    }

    // Handle filter changes
    const handleFilterChange = (filterType: keyof SearchFilters, value: string, checked: boolean) => {
        const newFilters = { ...filters }

        if (checked) {
            // Add to filter array
            if (filterType === 'technology_stack') {
                newFilters.technology_stack = [...(newFilters.technology_stack || []), value]
            } else if (filterType === 'difficulty_level') {
                newFilters.difficulty_level = [...(newFilters.difficulty_level || []), value]
            } else if (filterType === 'application_type') {
                newFilters.application_type = [...(newFilters.application_type || []), value]
            } else if (filterType === 'status') {
                newFilters.status = [...(newFilters.status || []), value]
            }
        } else {
            // Remove from filter array
            if (filterType === 'technology_stack') {
                newFilters.technology_stack = (newFilters.technology_stack || []).filter(item => item !== value)
            } else if (filterType === 'difficulty_level') {
                newFilters.difficulty_level = (newFilters.difficulty_level || []).filter(item => item !== value)
            } else if (filterType === 'application_type') {
                newFilters.application_type = (newFilters.application_type || []).filter(item => item !== value)
            } else if (filterType === 'status') {
                newFilters.status = (newFilters.status || []).filter(item => item !== value)
            }
        }

        setFilters(newFilters)
        setCurrentPage(1)
        updateURL(query, newFilters, 1)
        performSearch(query, newFilters, 1, sortBy, sortOrder)
    }

    // Handle custom filter changes for cause areas and time commitment
    const handleCustomFilterChange = (filterType: string, value: string, checked: boolean) => {
        const newFilters = { ...filters }

        // Store custom filters in a generic way (for future database schema updates)
        if (!newFilters.technology_stack) newFilters.technology_stack = []

        if (checked) {
            // For now, we'll add these as tags in technology_stack for search
            newFilters.technology_stack = [...newFilters.technology_stack, `${filterType}:${value}`]
        } else {
            newFilters.technology_stack = newFilters.technology_stack.filter(item => item !== `${filterType}:${value}`)
        }

        setFilters(newFilters)
        setCurrentPage(1)
        updateURL(query, newFilters, 1)
        performSearch(query, newFilters, 1, sortBy, sortOrder)
    }

    // Check if custom filter is active
    const isCustomFilterActive = (filterType: string, value: string) => {
        return filters.technology_stack?.includes(`${filterType}:${value}`) || false
    }

    // Handle clear all filters
    const handleClearFilters = () => {
        // Smart default status filtering based on user role
        let defaultStatusFilters: string[]
        if (user && user.role === 'developer') {
            // Developers should see projects they can apply to AND projects they're working on
            defaultStatusFilters = ['open', 'in_progress']
        } else {
            // Organizations/visitors see only open projects by default
            defaultStatusFilters = ['open']
        }

        const clearedFilters = { status: defaultStatusFilters }
        setFilters(clearedFilters)
        setCurrentPage(1)
        updateURL(query, clearedFilters, 1)
        performSearch(query, clearedFilters, 1, sortBy, sortOrder)
    }

    // Toggle filter section
    const toggleFilterSection = (section: keyof typeof expandedFilterSections) => {
        setExpandedFilterSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }))
    }

    // Handle pagination
    const handlePageChange = (page: number) => {
        setCurrentPage(page)
        updateURL(query, filters, page)
        performSearch(query, filters, page, sortBy, sortOrder)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    // Handle skills-based matching
    const handleSkillsMatch = () => {
        if (!userSkills.trim()) return

        // Create a search query from skills
        const skillsQuery = userSkills.trim()
        setQuery(skillsQuery)
        setShowSkillsForm(false)

        // Update filters to match skills
        const matchFilters = {
            ...filters,
            technology_stack: userSkills.split(',').map(s => s.trim()).filter(Boolean)
        }

        setFilters(matchFilters)
        updateURL(skillsQuery, matchFilters, 1)
        performSearch(skillsQuery, matchFilters, 1, 'relevance', 'desc')
    }

    // Get active filter count
    const getActiveFilterCount = () => {
        let count = 0
        Object.values(filters).forEach(filterArray => {
            if (Array.isArray(filterArray)) {
                count += filterArray.length
            }
        })
        return count - 1 // Subtract 1 for default status filter
    }

    // Cause areas mapping (example)
    const causeAreas = [
        { label: 'Healthcare', value: 'healthcare' },
        { label: 'Education', value: 'education' },
        { label: 'Community Development', value: 'community' },
        { label: 'Human Rights', value: 'human_rights' },
        { label: 'Environment', value: 'environment' },
        { label: 'Technology for Good', value: 'tech_for_good' }
    ]

    // Time commitment mapping
    const timeCommitments = [
        { label: 'Short (< 4 weeks)', value: 'short' },
        { label: 'Medium (1-6 months)', value: 'medium' },
        { label: 'Long (6+ months)', value: 'long' }
    ]

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                {/* Professional Blue Hero Section */}
                <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 dark:from-blue-700 dark:via-blue-800 dark:to-blue-900">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                        <div className="text-center mb-10">
                            <h1 className="text-4xl font-bold text-white mb-4 sm:text-5xl lg:text-6xl">
                                Discover Meaningful Projects
                            </h1>
                            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
                                Connect with impactful projects that match your skills and make a difference in the nonprofit sector
                            </p>
                        </div>

                        {/* Enhanced Search Interface */}
                        <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                    <Search className="h-6 w-6 text-blue-300" />
                                </div>
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search by project, organization, or technology..."
                                    className="block w-full pl-14 pr-32 py-5 text-lg text-gray-900 bg-white/95 backdrop-blur-sm border-0 rounded-2xl focus:ring-4 focus:ring-white/30 focus:bg-white placeholder-gray-500 shadow-2xl"
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                    <Button
                                        type="submit"
                                        className="px-8 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                                    >
                                        Search
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Enhanced Filters Sidebar */}
                        <div className="lg:w-80 flex-shrink-0">
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 sticky top-24 backdrop-blur-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Filter className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                        Filters
                                    </h2>
                                    {getActiveFilterCount() > 0 && (
                                        <button
                                            onClick={handleClearFilters}
                                            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors"
                                        >
                                            Clear all
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-6">
                                    {/* Technologies */}
                                    <div className="border-b border-gray-100 dark:border-gray-700 pb-6">
                                        <button
                                            onClick={() => toggleFilterSection('technologies')}
                                            className="flex items-center justify-between w-full text-left hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                                        >
                                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Technologies</h3>
                                            {expandedFilterSections.technologies ? (
                                                <ChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                                            ) : (
                                                <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                                            )}
                                        </button>
                                        {expandedFilterSections.technologies && (
                                            <div className="mt-4 space-y-3 max-h-48 overflow-y-auto">
                                                {TECHNOLOGY_STACK_OPTIONS.slice(0, 8).map((tech) => (
                                                    <label key={tech} className="flex items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg p-2 transition-colors cursor-pointer group">
                                                        <input
                                                            type="checkbox"
                                                            checked={filters.technology_stack?.includes(tech) || false}
                                                            onChange={(e) => handleFilterChange('technology_stack', tech, e.target.checked)}
                                                            className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700"
                                                        />
                                                        <span className="ml-3 text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">{tech}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Experience Level */}
                                    <div className="border-b border-gray-100 dark:border-gray-700 pb-6">
                                        <button
                                            onClick={() => toggleFilterSection('experience')}
                                            className="flex items-center justify-between w-full text-left hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                                        >
                                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Experience Level</h3>
                                            {expandedFilterSections.experience ? (
                                                <ChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                                            ) : (
                                                <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                                            )}
                                        </button>
                                        {expandedFilterSections.experience && (
                                            <div className="mt-4 space-y-3">
                                                {DIFFICULTY_LEVELS.map((level) => (
                                                    <label key={level.value} className="flex items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg p-2 transition-colors cursor-pointer group">
                                                        <input
                                                            type="checkbox"
                                                            checked={filters.difficulty_level?.includes(level.value) || false}
                                                            onChange={(e) => handleFilterChange('difficulty_level', level.value, e.target.checked)}
                                                            className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700"
                                                        />
                                                        <span className="ml-3 text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">{level.label}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Cause Areas */}
                                    <div className="border-b border-gray-100 dark:border-gray-700 pb-6">
                                        <button
                                            onClick={() => toggleFilterSection('causeAreas')}
                                            className="flex items-center justify-between w-full text-left hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                                        >
                                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Cause Areas</h3>
                                            {expandedFilterSections.causeAreas ? (
                                                <ChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                                            ) : (
                                                <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                                            )}
                                        </button>
                                        {expandedFilterSections.causeAreas && (
                                            <div className="mt-4 space-y-3">
                                                {causeAreas.map((cause) => (
                                                    <label key={cause.value} className="flex items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg p-2 transition-colors cursor-pointer group">
                                                        <input
                                                            type="checkbox"
                                                            checked={isCustomFilterActive('cause_area', cause.value)}
                                                            onChange={(e) => handleCustomFilterChange('cause_area', cause.value, e.target.checked)}
                                                            className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700"
                                                        />
                                                        <span className="ml-3 text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">{cause.label}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Time Commitment */}
                                    <div className="border-b border-gray-100 dark:border-gray-700 pb-6">
                                        <button
                                            onClick={() => toggleFilterSection('timeCommitment')}
                                            className="flex items-center justify-between w-full text-left hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                                        >
                                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Time Commitment</h3>
                                            {expandedFilterSections.timeCommitment ? (
                                                <ChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                                            ) : (
                                                <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                                            )}
                                        </button>
                                        {expandedFilterSections.timeCommitment && (
                                            <div className="mt-4 space-y-3">
                                                {timeCommitments.map((time) => (
                                                    <label key={time.value} className="flex items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg p-2 transition-colors cursor-pointer group">
                                                        <input
                                                            type="checkbox"
                                                            checked={isCustomFilterActive('time_commitment', time.value)}
                                                            onChange={(e) => handleCustomFilterChange('time_commitment', time.value, e.target.checked)}
                                                            className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700"
                                                        />
                                                        <span className="ml-3 text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">{time.label}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Project Status */}
                                    <div>
                                        <button
                                            onClick={() => toggleFilterSection('status')}
                                            className="flex items-center justify-between w-full text-left hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                                        >
                                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Project Status</h3>
                                            {expandedFilterSections.status ? (
                                                <ChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                                            ) : (
                                                <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                                            )}
                                        </button>
                                        {expandedFilterSections.status && (
                                            <div className="mt-4 space-y-3">
                                                <label className="flex items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg p-2 transition-colors cursor-pointer group">
                                                    <input
                                                        type="checkbox"
                                                        checked={filters.status?.includes('open') || false}
                                                        onChange={(e) => handleFilterChange('status', 'open', e.target.checked)}
                                                        className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700"
                                                    />
                                                    <span className="ml-3 text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">Open for Applications</span>
                                                </label>
                                                <label className="flex items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg p-2 transition-colors cursor-pointer group">
                                                    <input
                                                        type="checkbox"
                                                        checked={filters.status?.includes('in_progress') || false}
                                                        onChange={(e) => handleFilterChange('status', 'in_progress', e.target.checked)}
                                                        className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700"
                                                    />
                                                    <span className="ml-3 text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">Starting</span>
                                                </label>
                                                <label className="flex items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg p-2 transition-colors cursor-pointer group">
                                                    <input
                                                        type="checkbox"
                                                        checked={filters.status?.includes('completed') || false}
                                                        onChange={(e) => handleFilterChange('status', 'completed', e.target.checked)}
                                                        className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700"
                                                    />
                                                    <span className="ml-3 text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">Completed Projects</span>
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Professional Content Area */}
                        <div className="flex-1 min-w-0">
                            {/* Enhanced Results Header */}
                            {results && (
                                <div className="mb-8 flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 backdrop-blur-sm">
                                    <div className="flex items-center gap-4">
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {results.total_count} Projects Found
                                        </h2>
                                        {results.search_time && (
                                            <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                                                {results.search_time}ms
                                            </span>
                                        )}
                                    </div>
                                    <select
                                        value={`${sortBy}-${sortOrder}`}
                                        onChange={(e) => {
                                            const [newSortBy, newSortOrder] = e.target.value.split('-')
                                            setSortBy(newSortBy as AdvancedSearchParams['sort_by'])
                                            setSortOrder(newSortOrder as 'asc' | 'desc')
                                            performSearch(query, filters, 1, newSortBy as AdvancedSearchParams['sort_by'], newSortOrder as 'asc' | 'desc')
                                        }}
                                        className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                    >
                                        <option value="created_at-desc">Newest First</option>
                                        <option value="created_at-asc">Oldest First</option>
                                        <option value="relevance-desc">Most Relevant</option>
                                        <option value="title-asc">Title A-Z</option>
                                        <option value="title-desc">Title Z-A</option>
                                    </select>
                                </div>
                            )}

                            {/* Elegant Error State */}
                            {error && (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 mb-8 shadow-lg backdrop-blur-sm">
                                    <div className="flex items-center">
                                        <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 mr-3" />
                                        <div className="text-red-700 dark:text-red-300 text-sm font-medium">
                                            Error: {error}
                                        </div>
                                        <button
                                            onClick={() => performSearch(query, filters, currentPage, sortBy, sortOrder)}
                                            className="ml-4 text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100 text-sm font-medium transition-colors"
                                        >
                                            Try Again
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Professional Loading State */}
                            {loading && (
                                <div className="flex items-center justify-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 backdrop-blur-sm">
                                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
                                    <span className="ml-3 text-gray-600 dark:text-gray-400 font-medium">Searching projects...</span>
                                </div>
                            )}

                            {/* Enhanced Project Grid */}
                            {results && !loading && (
                                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                                    {results.projects.map((project, index) => {
                                        // Simplified variant assignment for professional consistency
                                        let variant: 'default' | 'large' | 'featured' = 'default'

                                        // Every 7th card is large for visual variety
                                        if (index % 7 === 0 && index > 0) {
                                            variant = 'large'
                                        } else if (index % 5 === 2) {
                                            variant = 'featured'
                                        }

                                        return (
                                            <ProjectCard
                                                key={project.id}
                                                project={project}
                                                variant={variant}
                                            />
                                        )
                                    })}
                                </div>
                            )}

                            {/* Enhanced Empty State */}
                            {results && !loading && results.projects.length === 0 && (
                                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 backdrop-blur-sm">
                                    <Search className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-6" />
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                                        No projects found
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                                        Try adjusting your search terms or filters to discover more projects that match your interests.
                                    </p>
                                    <Button 
                                        onClick={handleClearFilters} 
                                        variant="outline"
                                        className="px-6 py-3"
                                    >
                                        Clear Filters
                                    </Button>
                                </div>
                            )}

                            {/* Professional Pagination */}
                            {results && results.total_count > 20 && (
                                <div className="mt-12 flex items-center justify-center">
                                    <div className="flex items-center space-x-1">
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium transition-colors"
                                        >
                                            Previous
                                        </button>

                                        {Array.from({ length: Math.min(5, Math.ceil(results.total_count / 20)) }, (_, i) => {
                                            const page = i + 1
                                            return (
                                                <button
                                                    key={page}
                                                    onClick={() => handlePageChange(page)}
                                                    className={`px-4 py-2.5 border rounded-lg text-sm font-medium transition-colors ${currentPage === page
                                                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                                        : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                                                        }`}
                                                >
                                                    {page}
                                                </button>
                                            )
                                        })}

                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage >= Math.ceil(results.total_count / 20)}
                                            className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium transition-colors"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sophisticated Skills Matching Section */}
                    <div className="mt-24 bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800 dark:to-blue-900/10 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 lg:p-12 backdrop-blur-sm">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-12">
                                <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mx-auto mb-6">
                                    <Lightbulb className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Find Projects That Match Your Skills</h2>
                                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                                    Discover opportunities that align with your experience and drive meaningful impact in the nonprofit sector
                                </p>
                            </div>

                            <div className="grid lg:grid-cols-2 gap-12">
                                <div className="space-y-6">
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Tell us about yourself</h3>
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                                Experience Level
                                            </label>
                                            <select className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-base">
                                                <option value="">Select your experience level</option>
                                                <option value="beginner">Beginner (0-1 years)</option>
                                                <option value="intermediate">Intermediate (2-4 years)</option>
                                                <option value="advanced">Advanced (5+ years)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                                Your Skills & Technologies
                                            </label>
                                            <input
                                                type="text"
                                                value={userSkills}
                                                onChange={(e) => setUserSkills(e.target.value)}
                                                placeholder="e.g., React, Python, UI/UX Design, Data Analysis"
                                                className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-base"
                                            />
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Separate skills with commas for better matching</p>
                                        </div>
                                        <Button
                                            onClick={handleSkillsMatch}
                                            disabled={!userSkills.trim()}
                                            className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 text-base"
                                        >
                                            Find Matching Projects
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Why skill matching helps</h3>
                                    <div className="space-y-6">
                                        <div className="flex items-start gap-4 group">
                                            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-1 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                                                <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900 dark:text-white text-base mb-2">Relevant Opportunities</h4>
                                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">Find projects where your skills are needed and valued by nonprofit organizations</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4 group">
                                            <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-1 group-hover:bg-green-100 dark:group-hover:bg-green-900/30 transition-colors">
                                                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900 dark:text-white text-base mb-2">Skill Development</h4>
                                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">Discover opportunities to grow and learn new technologies while building your portfolio</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4 group">
                                            <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-1 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 transition-colors">
                                                <Heart className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900 dark:text-white text-base mb-2">Better Matches</h4>
                                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">Higher chance of application success with relevant skills and meaningful impact</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
} 