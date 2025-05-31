import React, { useState } from 'react'
import { Search, Filter, X, ChevronDown } from 'lucide-react'
import { TECHNOLOGY_STACK_OPTIONS, DIFFICULTY_LEVELS, APPLICATION_TYPES, PROJECT_STATUSES } from '../../utils/constants'
import { Checkbox } from '../ui/Checkbox'

interface ProjectFiltersProps {
    searchTerm: string
    onSearchChange: (term: string) => void
    filters: {
        technology_stack: string[]
        difficulty_level: string[]
        application_type: string[]
        status: string[]
        is_remote?: boolean | null
    }
    onFiltersChange: (filters: any) => void
    onClearFilters: () => void
    resultCount?: number
}

export function ProjectFilters({
    searchTerm,
    onSearchChange,
    filters,
    onFiltersChange,
    onClearFilters,
    resultCount
}: ProjectFiltersProps) {
    const [showFilters, setShowFilters] = useState(false)
    const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
        technology: false,
        difficulty: true,
        application: true,
        status: true,
        location: true
    })

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }))
    }

    const handleTechnologyChange = (tech: string, checked: boolean) => {
        const newTech = checked
            ? [...filters.technology_stack, tech]
            : filters.technology_stack.filter(t => t !== tech)

        onFiltersChange({
            ...filters,
            technology_stack: newTech
        })
    }

    const handleDifficultyChange = (difficulty: string, checked: boolean) => {
        const newDifficulty = checked
            ? [...filters.difficulty_level, difficulty]
            : filters.difficulty_level.filter(d => d !== difficulty)

        onFiltersChange({
            ...filters,
            difficulty_level: newDifficulty
        })
    }

    const handleApplicationTypeChange = (type: string, checked: boolean) => {
        const newTypes = checked
            ? [...filters.application_type, type]
            : filters.application_type.filter(t => t !== type)

        onFiltersChange({
            ...filters,
            application_type: newTypes
        })
    }

    const handleStatusChange = (status: string, checked: boolean) => {
        const newStatuses = checked
            ? [...filters.status, status]
            : filters.status.filter(s => s !== status)

        onFiltersChange({
            ...filters,
            status: newStatuses
        })
    }

    const handleLocationChange = (isRemote: boolean | null) => {
        onFiltersChange({
            ...filters,
            is_remote: isRemote
        })
    }

    const hasActiveFilters =
        filters.technology_stack.length > 0 ||
        filters.difficulty_level.length > 0 ||
        filters.application_type.length > 0 ||
        filters.status.length > 0 ||
        filters.is_remote !== null

    const activeFilterCount =
        filters.technology_stack.length +
        filters.difficulty_level.length +
        filters.application_type.length +
        filters.status.length +
        (filters.is_remote !== null ? 1 : 0)

    return (
        <div className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                {/* Search Bar */}
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search projects by title, description, or technology..."
                                value={searchTerm}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>
                    </div>

                    {/* Filter Toggle */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <Filter className="h-5 w-5" />
                            <span>Filters</span>
                            {activeFilterCount > 0 && (
                                <span className="bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                    {activeFilterCount}
                                </span>
                            )}
                            <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                        </button>

                        {hasActiveFilters && (
                            <button
                                onClick={onClearFilters}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
                            >
                                <X className="h-4 w-4" />
                                Clear All
                            </button>
                        )}
                    </div>
                </div>

                {/* Results Count */}
                {typeof resultCount === 'number' && (
                    <div className="mt-3 text-sm text-gray-600">
                        {resultCount} project{resultCount !== 1 ? 's' : ''} found
                    </div>
                )}

                {/* Filters Panel */}
                {showFilters && (
                    <div className="mt-6 border-t border-gray-200 pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">

                            {/* Difficulty Level */}
                            <div>
                                <button
                                    onClick={() => toggleSection('difficulty')}
                                    className="flex items-center justify-between w-full text-sm font-medium text-gray-900 mb-3"
                                >
                                    Difficulty Level
                                    <ChevronDown className={`h-4 w-4 transition-transform ${expandedSections.difficulty ? 'rotate-180' : ''}`} />
                                </button>
                                {expandedSections.difficulty && (
                                    <div className="space-y-2">
                                        {DIFFICULTY_LEVELS.map((level) => (
                                            <Checkbox
                                                key={level.value}
                                                label={level.label}
                                                checked={filters.difficulty_level.includes(level.value)}
                                                onChange={(e) => handleDifficultyChange(level.value, e.target.checked)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Application Type */}
                            <div>
                                <button
                                    onClick={() => toggleSection('application')}
                                    className="flex items-center justify-between w-full text-sm font-medium text-gray-900 mb-3"
                                >
                                    Application Type
                                    <ChevronDown className={`h-4 w-4 transition-transform ${expandedSections.application ? 'rotate-180' : ''}`} />
                                </button>
                                {expandedSections.application && (
                                    <div className="space-y-2">
                                        {APPLICATION_TYPES.map((type) => (
                                            <Checkbox
                                                key={type.value}
                                                label={type.label}
                                                checked={filters.application_type.includes(type.value)}
                                                onChange={(e) => handleApplicationTypeChange(type.value, e.target.checked)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Status */}
                            <div>
                                <button
                                    onClick={() => toggleSection('status')}
                                    className="flex items-center justify-between w-full text-sm font-medium text-gray-900 mb-3"
                                >
                                    Status
                                    <ChevronDown className={`h-4 w-4 transition-transform ${expandedSections.status ? 'rotate-180' : ''}`} />
                                </button>
                                {expandedSections.status && (
                                    <div className="space-y-2">
                                        {PROJECT_STATUSES.map((status) => (
                                            <Checkbox
                                                key={status.value}
                                                label={status.label}
                                                checked={filters.status.includes(status.value)}
                                                onChange={(e) => handleStatusChange(status.value, e.target.checked)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Location */}
                            <div>
                                <button
                                    onClick={() => toggleSection('location')}
                                    className="flex items-center justify-between w-full text-sm font-medium text-gray-900 mb-3"
                                >
                                    Location
                                    <ChevronDown className={`h-4 w-4 transition-transform ${expandedSections.location ? 'rotate-180' : ''}`} />
                                </button>
                                {expandedSections.location && (
                                    <div className="space-y-2">
                                        <Checkbox
                                            label="Remote"
                                            checked={filters.is_remote === true}
                                            onChange={(e) => handleLocationChange(e.target.checked ? true : null)}
                                        />
                                        <Checkbox
                                            label="On-site"
                                            checked={filters.is_remote === false}
                                            onChange={(e) => handleLocationChange(e.target.checked ? false : null)}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Technology Stack */}
                            <div>
                                <button
                                    onClick={() => toggleSection('technology')}
                                    className="flex items-center justify-between w-full text-sm font-medium text-gray-900 mb-3"
                                >
                                    Technology ({filters.technology_stack.length})
                                    <ChevronDown className={`h-4 w-4 transition-transform ${expandedSections.technology ? 'rotate-180' : ''}`} />
                                </button>
                                {expandedSections.technology && (
                                    <div className="max-h-48 overflow-y-auto space-y-2">
                                        {TECHNOLOGY_STACK_OPTIONS.map((tech) => (
                                            <Checkbox
                                                key={tech}
                                                label={tech}
                                                checked={filters.technology_stack.includes(tech)}
                                                onChange={(e) => handleTechnologyChange(tech, e.target.checked)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
} 