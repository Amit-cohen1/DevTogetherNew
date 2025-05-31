import React, { useState, useEffect, useMemo } from 'react'
import { Layout } from '../../components/layout'
import { ProjectCard } from '../../components/projects/ProjectCard'
import { ProjectFilters } from '../../components/projects/ProjectFilters'
import { projectService } from '../../services/projects'
import { Project } from '../../types/database'
import { Loader2, FolderOpen, AlertCircle } from 'lucide-react'

interface ProjectsWithOrganization extends Project {
    organization?: {
        organization_name: string | null
        avatar_url: string | null
    }
}

export default function ProjectsPage() {
    const [projects, setProjects] = useState<ProjectsWithOrganization[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [sortBy, setSortBy] = useState<'created_at' | 'deadline' | 'title'>('created_at')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

    const [filters, setFilters] = useState({
        technology_stack: [] as string[],
        difficulty_level: [] as string[],
        application_type: [] as string[],
        status: ['open'] as string[], // Default to open projects
        is_remote: null as boolean | null
    })

    useEffect(() => {
        loadProjects()
    }, [])

    const loadProjects = async () => {
        try {
            setLoading(true)
            setError(null)
            const projectsData = await projectService.getProjects()
            setProjects(projectsData as ProjectsWithOrganization[])
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load projects')
        } finally {
            setLoading(false)
        }
    }

    // Filter and search projects
    const filteredProjects = useMemo(() => {
        let filtered = projects

        // Search filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase()
            filtered = filtered.filter(project =>
                project.title.toLowerCase().includes(searchLower) ||
                project.description.toLowerCase().includes(searchLower) ||
                project.requirements.toLowerCase().includes(searchLower) ||
                project.technology_stack.some(tech => tech.toLowerCase().includes(searchLower)) ||
                project.organization?.organization_name?.toLowerCase().includes(searchLower)
            )
        }

        // Technology stack filter
        if (filters.technology_stack.length > 0) {
            filtered = filtered.filter(project =>
                filters.technology_stack.some(tech =>
                    project.technology_stack.includes(tech)
                )
            )
        }

        // Difficulty level filter
        if (filters.difficulty_level.length > 0) {
            filtered = filtered.filter(project =>
                filters.difficulty_level.includes(project.difficulty_level)
            )
        }

        // Application type filter
        if (filters.application_type.length > 0) {
            filtered = filtered.filter(project =>
                filters.application_type.includes(project.application_type)
            )
        }

        // Status filter
        if (filters.status.length > 0) {
            filtered = filtered.filter(project =>
                filters.status.includes(project.status)
            )
        }

        // Location filter
        if (filters.is_remote !== null) {
            filtered = filtered.filter(project =>
                project.is_remote === filters.is_remote
            )
        }

        // Sort projects
        filtered.sort((a, b) => {
            let aValue: any, bValue: any

            switch (sortBy) {
                case 'created_at':
                    aValue = new Date(a.created_at)
                    bValue = new Date(b.created_at)
                    break
                case 'deadline':
                    aValue = a.deadline ? new Date(a.deadline) : new Date('9999-12-31')
                    bValue = b.deadline ? new Date(b.deadline) : new Date('9999-12-31')
                    break
                case 'title':
                    aValue = a.title.toLowerCase()
                    bValue = b.title.toLowerCase()
                    break
                default:
                    return 0
            }

            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
            return 0
        })

        return filtered
    }, [projects, searchTerm, filters, sortBy, sortOrder])

    const handleFiltersChange = (newFilters: typeof filters) => {
        setFilters(newFilters)
    }

    const handleClearFilters = () => {
        setFilters({
            technology_stack: [],
            difficulty_level: [],
            application_type: [],
            status: ['open'],
            is_remote: null
        })
        setSearchTerm('')
    }

    if (loading) {
        return (
            <Layout>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
                        <p className="text-gray-600">Loading projects...</p>
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
                        <button
                            onClick={loadProjects}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </Layout>
        )
    }

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                                    <FolderOpen className="h-8 w-8 mr-3 text-primary-600" />
                                    Discover Projects
                                </h1>
                                <p className="mt-2 text-lg text-gray-600">
                                    Find exciting projects to contribute to and grow your skills
                                </p>
                            </div>

                            {/* Sort Options */}
                            <div className="flex items-center gap-4">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                >
                                    <option value="created_at">Latest</option>
                                    <option value="deadline">Deadline</option>
                                    <option value="title">Title</option>
                                </select>

                                <button
                                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                                >
                                    {sortOrder === 'asc' ? '↑' : '↓'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <ProjectFilters
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    onClearFilters={handleClearFilters}
                    resultCount={filteredProjects.length}
                />

                {/* Projects Grid */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {filteredProjects.length === 0 ? (
                        <div className="text-center py-12">
                            <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
                            <p className="text-gray-600 mb-4">
                                {searchTerm || Object.values(filters).some(f => Array.isArray(f) ? f.length > 0 : f !== null)
                                    ? 'Try adjusting your search or filters'
                                    : 'No projects are currently available'
                                }
                            </p>
                            {(searchTerm || Object.values(filters).some(f => Array.isArray(f) ? f.length > 0 : f !== null)) && (
                                <button
                                    onClick={handleClearFilters}
                                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProjects.map((project) => (
                                <ProjectCard key={project.id} project={project} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    )
} 