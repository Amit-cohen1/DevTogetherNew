import React, { useState } from 'react'
import { Filter, ChevronDown, X, Calendar, MapPin } from 'lucide-react'
import { SearchFilters } from '../../types/database'
import { TECHNOLOGY_STACK_OPTIONS, DIFFICULTY_LEVELS, APPLICATION_TYPES, PROJECT_STATUSES } from '../../utils/constants'
import { Checkbox } from '../ui/Checkbox'

interface AdvancedFiltersProps {
    filters: SearchFilters
    onFiltersChange: (filters: SearchFilters) => void
    onClearFilters: () => void
    isExpanded?: boolean
    onToggleExpanded?: () => void
}

export function AdvancedFilters({
    filters,
    onFiltersChange,
    onClearFilters,
    isExpanded = false,
    onToggleExpanded
}: AdvancedFiltersProps) {
    const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
        technology: false,
        difficulty: true,
        application: true,
        status: true,
        location: true,
        dates: false,
        team: false
    })

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }))
    }

    const handleFilterChange = (key: keyof SearchFilters, value: any) => {
        onFiltersChange({
            ...filters,
            [key]: value
        })
    }

    const handleArrayFilterChange = (key: keyof SearchFilters, item: string, checked: boolean) => {
        const currentArray = (filters[key] as string[]) || []
        const newArray = checked
            ? [...currentArray, item]
            : currentArray.filter(i => i !== item)

        onFiltersChange({
            ...filters,
            [key]: newArray
        })
    }

    const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
        if (Array.isArray(value)) return value.length > 0
        if (key === 'date_range') return value?.start || value?.end
        if (key === 'location') return value?.city || value?.radius
        return value !== null && value !== undefined
    })

    const getActiveFilterCount = () => {
        let count = 0
        Object.entries(filters).forEach(([key, value]) => {
            if (Array.isArray(value)) count += value.length
            else if (key === 'date_range' && value) {
                if (value.start) count++
                if (value.end) count++
            }
            else if (key === 'location' && value) {
                if (value.city) count++
                if (value.radius) count++
            }
            else if (value !== null && value !== undefined) count++
        })
        return count
    }

    return (
        <div className="bg-white border border-gray-200 rounded-lg">
            {/* Filter Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <button
                    onClick={onToggleExpanded}
                    className="flex items-center gap-2 text-sm font-medium text-gray-900"
                >
                    <Filter className="h-4 w-4" />
                    <span>Advanced Filters</span>
                    {getActiveFilterCount() > 0 && (
                        <span className="bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {getActiveFilterCount()}
                        </span>
                    )}
                    <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>

                {hasActiveFilters && (
                    <button
                        onClick={onClearFilters}
                        className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
                    >
                        <X className="h-4 w-4" />
                        Clear All
                    </button>
                )}
            </div>

            {/* Filter Content */}
            {isExpanded && (
                <div className="p-4 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

                        {/* Technology Stack */}
                        <div>
                            <button
                                onClick={() => toggleSection('technology')}
                                className="flex items-center justify-between w-full text-sm font-medium text-gray-900 mb-3"
                            >
                                Technology Stack
                                <ChevronDown className={`h-4 w-4 transition-transform ${expandedSections.technology ? 'rotate-180' : ''}`} />
                            </button>
                            {expandedSections.technology && (
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {TECHNOLOGY_STACK_OPTIONS.map((tech: string) => (
                                        <Checkbox
                                            key={tech}
                                            label={tech}
                                            checked={filters.technology_stack?.includes(tech) || false}
                                            onChange={(e) => handleArrayFilterChange('technology_stack', tech, e.target.checked)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

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
                                            checked={filters.difficulty_level?.includes(level.value) || false}
                                            onChange={(e) => handleArrayFilterChange('difficulty_level', level.value, e.target.checked)}
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
                                            checked={filters.application_type?.includes(type.value) || false}
                                            onChange={(e) => handleArrayFilterChange('application_type', type.value, e.target.checked)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Project Status */}
                        <div>
                            <button
                                onClick={() => toggleSection('status')}
                                className="flex items-center justify-between w-full text-sm font-medium text-gray-900 mb-3"
                            >
                                Project Status
                                <ChevronDown className={`h-4 w-4 transition-transform ${expandedSections.status ? 'rotate-180' : ''}`} />
                            </button>
                            {expandedSections.status && (
                                <div className="space-y-2">
                                    {PROJECT_STATUSES.map((status) => (
                                        <Checkbox
                                            key={status.value}
                                            label={status.label}
                                            checked={filters.status?.includes(status.value) || false}
                                            onChange={(e) => handleArrayFilterChange('status', status.value, e.target.checked)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Second Row - More Advanced Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 border-t border-gray-200">

                        {/* Location & Remote */}
                        <div>
                            <button
                                onClick={() => toggleSection('location')}
                                className="flex items-center justify-between w-full text-sm font-medium text-gray-900 mb-3"
                            >
                                <span className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    Location & Remote
                                </span>
                                <ChevronDown className={`h-4 w-4 transition-transform ${expandedSections.location ? 'rotate-180' : ''}`} />
                            </button>
                            {expandedSections.location && (
                                <div className="space-y-3">
                                    {/* Remote Options */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                            Work Type
                                        </label>
                                        <div className="space-y-1">
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    name="remote"
                                                    checked={filters.is_remote === null}
                                                    onChange={() => handleFilterChange('is_remote', null)}
                                                    className="w-4 h-4 text-primary-600"
                                                />
                                                <span className="text-sm">Any</span>
                                            </label>
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    name="remote"
                                                    checked={filters.is_remote === true}
                                                    onChange={() => handleFilterChange('is_remote', true)}
                                                    className="w-4 h-4 text-primary-600"
                                                />
                                                <span className="text-sm">Remote</span>
                                            </label>
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    name="remote"
                                                    checked={filters.is_remote === false}
                                                    onChange={() => handleFilterChange('is_remote', false)}
                                                    className="w-4 h-4 text-primary-600"
                                                />
                                                <span className="text-sm">On-site</span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Location Search */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                            City/Location
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Enter city..."
                                            value={filters.location?.city || ''}
                                            onChange={(e) => handleFilterChange('location', {
                                                ...filters.location,
                                                city: e.target.value
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Date Range */}
                        <div>
                            <button
                                onClick={() => toggleSection('dates')}
                                className="flex items-center justify-between w-full text-sm font-medium text-gray-900 mb-3"
                            >
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    Date Range
                                </span>
                                <ChevronDown className={`h-4 w-4 transition-transform ${expandedSections.dates ? 'rotate-180' : ''}`} />
                            </button>
                            {expandedSections.dates && (
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                            Created After
                                        </label>
                                        <input
                                            type="date"
                                            value={filters.date_range?.start || ''}
                                            onChange={(e) => handleFilterChange('date_range', {
                                                ...filters.date_range,
                                                start: e.target.value
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                            Created Before
                                        </label>
                                        <input
                                            type="date"
                                            value={filters.date_range?.end || ''}
                                            onChange={(e) => handleFilterChange('date_range', {
                                                ...filters.date_range,
                                                end: e.target.value
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Team Size */}
                        <div>
                            <button
                                onClick={() => toggleSection('team')}
                                className="flex items-center justify-between w-full text-sm font-medium text-gray-900 mb-3"
                            >
                                Team Size
                                <ChevronDown className={`h-4 w-4 transition-transform ${expandedSections.team ? 'rotate-180' : ''}`} />
                            </button>
                            {expandedSections.team && (
                                <div className="space-y-2">
                                    {[
                                        { value: 'any', label: 'Any Size' },
                                        { value: '1', label: 'Solo (1 person)' },
                                        { value: '2-5', label: 'Small (2-5 people)' },
                                        { value: '6-10', label: 'Medium (6-10 people)' },
                                        { value: '10+', label: 'Large (10+ people)' }
                                    ].map((option) => (
                                        <label key={option.value} className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="team_size"
                                                checked={filters.team_size === option.value || (!filters.team_size && option.value === 'any')}
                                                onChange={() => handleFilterChange('team_size', option.value === 'any' ? undefined : option.value)}
                                                className="w-4 h-4 text-primary-600"
                                            />
                                            <span className="text-sm">{option.label}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
} 