import React, { useState, useMemo } from 'react'
import { Search, X, Plus, Code } from 'lucide-react'

interface TechnologyStackSelectorProps {
    selectedTechnologies: string[]
    onSelectionChange: (technologies: string[]) => void
    options: string[]
    maxSelections?: number
}

export function TechnologyStackSelector({
    selectedTechnologies,
    onSelectionChange,
    options,
    maxSelections = 10
}: TechnologyStackSelectorProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [isExpanded, setIsExpanded] = useState(false)

    // Filter options based on search term
    const filteredOptions = useMemo(() => {
        if (!searchTerm) return options
        return options.filter(tech =>
            tech.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }, [options, searchTerm])

    // Group options by category for better organization
    const groupedOptions = useMemo(() => {
        const groups: { [key: string]: string[] } = {
            'Frontend': [],
            'Backend': [],
            'Database': [],
            'Cloud & DevOps': [],
            'Mobile': [],
            'Other': []
        }

        filteredOptions.forEach(tech => {
            if (['React', 'Vue.js', 'Angular', 'Next.js', 'Nuxt.js', 'Svelte', 'TypeScript', 'JavaScript', 'HTML/CSS', 'Tailwind CSS', 'Bootstrap', 'Material-UI', 'Sass/SCSS'].includes(tech)) {
                groups['Frontend'].push(tech)
            } else if (['Node.js', 'Express.js', 'NestJS', 'Python', 'Django', 'Flask', 'FastAPI', 'Java', 'Spring Boot', 'C#', '.NET', 'PHP', 'Laravel', 'Ruby', 'Ruby on Rails', 'Go', 'Rust'].includes(tech)) {
                groups['Backend'].push(tech)
            } else if (['PostgreSQL', 'MySQL', 'MongoDB', 'SQLite', 'Redis', 'Firebase', 'Supabase'].includes(tech)) {
                groups['Database'].push(tech)
            } else if (['AWS', 'Google Cloud', 'Azure', 'Docker', 'Kubernetes', 'CI/CD', 'GitHub Actions', 'Vercel', 'Netlify', 'Heroku'].includes(tech)) {
                groups['Cloud & DevOps'].push(tech)
            } else if (['React Native', 'Flutter', 'iOS', 'Android', 'Ionic'].includes(tech)) {
                groups['Mobile'].push(tech)
            } else {
                groups['Other'].push(tech)
            }
        })

        // Remove empty groups
        return Object.entries(groups).filter(([_, techs]) => techs.length > 0)
    }, [filteredOptions])

    const toggleTechnology = (tech: string) => {
        if (selectedTechnologies.includes(tech)) {
            onSelectionChange(selectedTechnologies.filter(t => t !== tech))
        } else if (selectedTechnologies.length < maxSelections) {
            onSelectionChange([...selectedTechnologies, tech])
        }
    }

    const removeTechnology = (tech: string) => {
        onSelectionChange(selectedTechnologies.filter(t => t !== tech))
    }

    return (
        <div className="space-y-4">
            {/* Selected Technologies */}
            {selectedTechnologies.length > 0 && (
                <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">
                        Selected Technologies ({selectedTechnologies.length}/{maxSelections})
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {selectedTechnologies.map((tech) => (
                            <span
                                key={tech}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                            >
                                <Code className="h-3 w-3 mr-1" />
                                {tech}
                                <button
                                    type="button"
                                    onClick={() => removeTechnology(tech)}
                                    className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary-200 hover:bg-primary-300 transition-colors"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Technology Selection */}
            <div className="border border-gray-300 rounded-lg">
                {/* Search Header */}
                <div className="p-4 border-b border-gray-200">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search technologies..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onFocus={() => setIsExpanded(true)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                    {!isExpanded && (
                        <button
                            type="button"
                            onClick={() => setIsExpanded(true)}
                            className="mt-2 text-sm text-primary-600 hover:text-primary-700 flex items-center"
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            Browse all technologies
                        </button>
                    )}
                </div>

                {/* Technology Options */}
                {(isExpanded || searchTerm) && (
                    <div className="max-h-64 overflow-y-auto">
                        {groupedOptions.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                                No technologies found matching "{searchTerm}"
                            </div>
                        ) : (
                            <div className="p-4 space-y-4">
                                {groupedOptions.map(([category, techs]) => (
                                    <div key={category}>
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                                            {category}
                                        </h4>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                            {techs.map((tech) => {
                                                const isSelected = selectedTechnologies.includes(tech)
                                                const isDisabled = !isSelected && selectedTechnologies.length >= maxSelections

                                                return (
                                                    <button
                                                        key={tech}
                                                        type="button"
                                                        onClick={() => toggleTechnology(tech)}
                                                        disabled={isDisabled}
                                                        className={`
                              text-left px-3 py-2 text-sm rounded-md border transition-colors
                              ${isSelected
                                                                ? 'bg-primary-50 border-primary-200 text-primary-700'
                                                                : isDisabled
                                                                    ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                                                                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                                                            }
                            `}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <span>{tech}</span>
                                                            {isSelected && (
                                                                <span className="text-primary-500">✓</span>
                                                            )}
                                                        </div>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Footer */}
                {isExpanded && (
                    <div className="p-3 border-t border-gray-200 bg-gray-50">
                        <button
                            type="button"
                            onClick={() => {
                                setIsExpanded(false)
                                setSearchTerm('')
                            }}
                            className="text-sm text-gray-600 hover:text-gray-700"
                        >
                            Collapse
                        </button>
                    </div>
                )}
            </div>

            {selectedTechnologies.length >= maxSelections && (
                <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
                    You've reached the maximum of {maxSelections} technologies. Remove some to add others.
                </div>
            )}
        </div>
    )
} 