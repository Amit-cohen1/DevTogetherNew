import React, { useState } from 'react'
import { Grid, List, MoreVertical, Clock, Users, MapPin, Calendar, ArrowUpDown } from 'lucide-react'
import { Project } from '../../types/database'
import { ProjectCard } from '../projects/ProjectCard'
import { searchService } from '../../services/search'
import { useAuth } from '../../contexts/AuthContext'

interface SearchResultsProps {
    projects: Project[]
    totalCount: number
    searchTime: number
    currentQuery: string
    isLoading?: boolean
    onSortChange?: (sortBy: string, sortOrder: 'asc' | 'desc') => void
    onProjectClick?: (projectId: string, position: number) => void
}

type ViewMode = 'grid' | 'list' | 'compact'
type SortOption = 'relevance' | 'created_at' | 'deadline' | 'title'

export function SearchResults({
    projects,
    totalCount,
    searchTime,
    currentQuery,
    isLoading = false,
    onSortChange,
    onProjectClick
}: SearchResultsProps) {
    const [viewMode, setViewMode] = useState<ViewMode>('grid')
    const [sortBy, setSortBy] = useState<SortOption>('relevance')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
    const { user } = useAuth()

    const handleSortChange = (newSortBy: SortOption) => {
        const newSortOrder = sortBy === newSortBy && sortOrder === 'desc' ? 'asc' : 'desc'
        setSortBy(newSortBy)
        setSortOrder(newSortOrder)
        onSortChange?.(newSortBy, newSortOrder)
    }

    const handleProjectClick = (projectId: string, index: number) => {
        // Track click analytics
        if (user) {
            searchService.trackSearchAnalytics(
                currentQuery,
                user.id,
                totalCount,
                projectId,
                index + 1
            )
        }

        onProjectClick?.(projectId, index)
    }

    const getSortLabel = (option: SortOption) => {
        switch (option) {
            case 'relevance': return 'Relevance'
            case 'created_at': return 'Date Created'
            case 'deadline': return 'Deadline'
            case 'title': return 'Title'
            default: return option
        }
    }

    const formatSearchTime = (time: number) => {
        if (time < 1000) return `${time}ms`
        return `${(time / 1000).toFixed(2)}s`
    }

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-48 mb-4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array(6).fill(0).map((_, i) => (
                            <div key={i} className="bg-gray-200 rounded-lg h-48"></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Results Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-600">
                        <span className="font-medium">{totalCount.toLocaleString()}</span> project{totalCount !== 1 ? 's' : ''} found
                        {currentQuery && (
                            <span className="ml-2">
                                for "<span className="font-medium text-gray-900">{currentQuery}</span>"
                            </span>
                        )}
                        <span className="ml-2 text-gray-400">
                            ({formatSearchTime(searchTime)})
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Sort Options */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Sort by:</span>
                        <div className="relative">
                            <select
                                value={sortBy}
                                onChange={(e) => handleSortChange(e.target.value as SortOption)}
                                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white hover:bg-gray-50 pr-8 appearance-none cursor-pointer"
                            >
                                <option value="relevance">Relevance</option>
                                <option value="created_at">Date Created</option>
                                <option value="deadline">Deadline</option>
                                <option value="title">Title</option>
                            </select>
                            <ArrowUpDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
                        </div>

                        <button
                            onClick={() => handleSortChange(sortBy)}
                            className="p-1.5 border border-gray-300 rounded-lg hover:bg-gray-50"
                            title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                        >
                            <ArrowUpDown className={`h-4 w-4 text-gray-600 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                        </button>
                    </div>

                    {/* View Mode Toggle */}
                    <div className="flex items-center border border-gray-300 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100'}`}
                            title="Grid View"
                        >
                            <Grid className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100'}`}
                            title="List View"
                        >
                            <List className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('compact')}
                            className={`p-1.5 rounded ${viewMode === 'compact' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100'}`}
                            title="Compact View"
                        >
                            <MoreVertical className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Results Grid/List */}
            {projects.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                        <Grid className="h-16 w-16 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
                    <p className="text-gray-600">
                        Try adjusting your search terms or filters to find more projects.
                    </p>
                </div>
            ) : (
                <>
                    {/* Grid View */}
                    {viewMode === 'grid' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {projects.map((project, index) => (
                                <div
                                    key={project.id}
                                    onClick={() => handleProjectClick(project.id, index)}
                                    className="cursor-pointer"
                                >
                                    <ProjectCard project={project} />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* List View */}
                    {viewMode === 'list' && (
                        <div className="space-y-4">
                            {projects.map((project, index) => (
                                <div
                                    key={project.id}
                                    onClick={() => handleProjectClick(project.id, index)}
                                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                {project.title}
                                            </h3>
                                            <p className="text-gray-600 mb-4 line-clamp-2">
                                                {project.description}
                                            </p>

                                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>{new Date(project.created_at).toLocaleDateString()}</span>
                                                </div>

                                                {project.deadline && (
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-4 w-4" />
                                                        <span>Due {new Date(project.deadline).toLocaleDateString()}</span>
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-1">
                                                    <MapPin className="h-4 w-4" />
                                                    <span>{project.is_remote ? 'Remote' : 'On-site'}</span>
                                                </div>

                                                <div className="flex items-center gap-1">
                                                    <Users className="h-4 w-4" />
                                                    <span>Max {project.max_team_size || 'N/A'} members</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-2 ml-6">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${project.difficulty_level === 'beginner' ? 'bg-green-100 text-green-800' :
                                                project.difficulty_level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                {project.difficulty_level}
                                            </span>

                                            <div className="flex flex-wrap gap-1">
                                                {project.technology_stack.slice(0, 3).map((tech) => (
                                                    <span
                                                        key={tech}
                                                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                                                    >
                                                        {tech}
                                                    </span>
                                                ))}
                                                {project.technology_stack.length > 3 && (
                                                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                                        +{project.technology_stack.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Compact View */}
                    {viewMode === 'compact' && (
                        <div className="space-y-2">
                            {projects.map((project, index) => (
                                <div
                                    key={project.id}
                                    onClick={() => handleProjectClick(project.id, index)}
                                    className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-gray-900 truncate">
                                                {project.title}
                                            </h4>
                                            <p className="text-sm text-gray-600 truncate">
                                                {project.description}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-4 ml-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${project.difficulty_level === 'beginner' ? 'bg-green-100 text-green-800' :
                                                project.difficulty_level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                {project.difficulty_level}
                                            </span>

                                            <div className="flex gap-1">
                                                {project.technology_stack.slice(0, 2).map((tech) => (
                                                    <span
                                                        key={tech}
                                                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                                                    >
                                                        {tech}
                                                    </span>
                                                ))}
                                                {project.technology_stack.length > 2 && (
                                                    <span className="text-xs text-gray-500">
                                                        +{project.technology_stack.length - 2}
                                                    </span>
                                                )}
                                            </div>

                                            <span className="text-xs text-gray-500">
                                                {new Date(project.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    )
} 