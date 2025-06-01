import React, { useState, useEffect, useRef } from 'react'
import { Search, Clock, TrendingUp, X, ArrowRight } from 'lucide-react'
import { searchService } from '../../services/search'
import { SearchSuggestion, SearchHistory, PopularSearch } from '../../types/database'
import { useAuth } from '../../contexts/AuthContext'

interface SearchBarProps {
    value: string
    onChange: (value: string) => void
    onSubmit: (query: string) => void
    placeholder?: string
    showSuggestions?: boolean
    className?: string
}

export function SearchBar({
    value,
    onChange,
    onSubmit,
    placeholder = "Search projects, technologies, organizations...",
    showSuggestions = true,
    className = ""
}: SearchBarProps) {
    const [focused, setFocused] = useState(false)
    const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
    const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([])
    const [popularSearches, setPopularSearches] = useState<PopularSearch[]>([])
    const [loading, setLoading] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(-1)

    const inputRef = useRef<HTMLInputElement>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const { user } = useAuth()

    useEffect(() => {
        if (focused && showSuggestions) {
            loadSearchData()
        }
    }, [focused])

    useEffect(() => {
        const delayedSuggestions = setTimeout(() => {
            if (value.length >= 1 && focused) {
                loadSuggestions(value)
            } else {
                setSuggestions([])
            }
        }, 300)

        return () => clearTimeout(delayedSuggestions)
    }, [value, focused])

    const loadSearchData = async () => {
        try {
            if (user) {
                const history = await searchService.getSearchHistory(user.id, 5)
                setSearchHistory(history)
            }

            const popular = await searchService.getPopularSearches(5)
            setPopularSearches(popular)
        } catch (error) {
            console.error('Error loading search data:', error)
        }
    }

    const loadSuggestions = async (query: string) => {
        try {
            setLoading(true)
            const suggestions = await searchService.getSearchSuggestions(query)
            setSuggestions(suggestions)
        } catch (error) {
            console.error('Error loading suggestions:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = (query: string = value) => {
        if (query.trim()) {
            onSubmit(query.trim())
            setFocused(false)
            setSelectedIndex(-1)
            inputRef.current?.blur()
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        const allItems = [
            ...suggestions,
            ...searchHistory.map(h => ({ text: h.search_term, type: 'history' as const })),
            ...popularSearches.map(p => ({ text: p.search_term, type: 'popular' as const }))
        ]

        switch (e.key) {
            case 'Enter':
                e.preventDefault()
                if (selectedIndex >= 0 && allItems[selectedIndex]) {
                    handleSubmit(allItems[selectedIndex].text)
                } else {
                    handleSubmit()
                }
                break
            case 'ArrowDown':
                e.preventDefault()
                setSelectedIndex(prev => Math.min(prev + 1, allItems.length - 1))
                break
            case 'ArrowUp':
                e.preventDefault()
                setSelectedIndex(prev => Math.max(prev - 1, -1))
                break
            case 'Escape':
                setFocused(false)
                setSelectedIndex(-1)
                inputRef.current?.blur()
                break
        }
    }

    const handleSuggestionClick = (suggestion: string) => {
        onChange(suggestion)
        handleSubmit(suggestion)
    }

    const clearSearch = () => {
        onChange('')
        inputRef.current?.focus()
    }

    const getIconForType = (type: string) => {
        switch (type) {
            case 'history':
                return <Clock className="h-4 w-4 text-gray-400" />
            case 'popular':
                return <TrendingUp className="h-4 w-4 text-gray-400" />
            default:
                return <Search className="h-4 w-4 text-gray-400" />
        }
    }

    const shouldShowDropdown = focused && showSuggestions && (
        value.length > 0 ? suggestions.length > 0 :
            (searchHistory.length > 0 || popularSearches.length > 0)
    )

    return (
        <div className={`relative ${className}`}>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                    ref={inputRef}
                    type="text"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => {
                        // Delay blur to allow clicking on suggestions
                        setTimeout(() => setFocused(false), 200)
                    }}
                    onKeyDown={handleKeyDown}
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                />

                {value && (
                    <button
                        onClick={clearSearch}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
                    >
                        <X className="h-4 w-4 text-gray-400" />
                    </button>
                )}
            </div>

            {/* Suggestions Dropdown */}
            {shouldShowDropdown && (
                <div
                    ref={dropdownRef}
                    className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
                >
                    {/* Suggestions */}
                    {value.length > 0 && suggestions.length > 0 && (
                        <div className="p-2">
                            <div className="text-xs font-medium text-gray-500 mb-2 px-2">Suggestions</div>
                            {suggestions.map((suggestion, index) => (
                                <button
                                    key={`suggestion-${index}`}
                                    onClick={() => handleSuggestionClick(suggestion.text)}
                                    className={`w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 flex items-center gap-3 ${selectedIndex === index ? 'bg-primary-50 text-primary-700' : ''
                                        }`}
                                >
                                    {getIconForType(suggestion.type)}
                                    <span className="flex-1 truncate">{suggestion.text}</span>
                                    <span className="text-xs text-gray-400 capitalize">{suggestion.type}</span>
                                    <ArrowRight className="h-3 w-3 text-gray-400" />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Search History */}
                    {value.length === 0 && searchHistory.length > 0 && (
                        <div className="p-2 border-t border-gray-100">
                            <div className="text-xs font-medium text-gray-500 mb-2 px-2">Recent Searches</div>
                            {searchHistory.map((item, index) => (
                                <button
                                    key={`history-${item.id}`}
                                    onClick={() => handleSuggestionClick(item.search_term)}
                                    className={`w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 flex items-center gap-3 ${selectedIndex === (suggestions.length + index) ? 'bg-primary-50 text-primary-700' : ''
                                        }`}
                                >
                                    <Clock className="h-4 w-4 text-gray-400" />
                                    <span className="flex-1 truncate">{item.search_term}</span>
                                    <span className="text-xs text-gray-400">{item.result_count} results</span>
                                    <ArrowRight className="h-3 w-3 text-gray-400" />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Popular Searches */}
                    {value.length === 0 && popularSearches.length > 0 && (
                        <div className="p-2 border-t border-gray-100">
                            <div className="text-xs font-medium text-gray-500 mb-2 px-2">Trending</div>
                            {popularSearches.map((item, index) => (
                                <button
                                    key={`popular-${item.id}`}
                                    onClick={() => handleSuggestionClick(item.search_term)}
                                    className={`w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 flex items-center gap-3 ${selectedIndex === (suggestions.length + searchHistory.length + index) ? 'bg-primary-50 text-primary-700' : ''
                                        }`}
                                >
                                    <TrendingUp className="h-4 w-4 text-gray-400" />
                                    <span className="flex-1 truncate">{item.search_term}</span>
                                    <span className="text-xs text-gray-400">{item.search_count} searches</span>
                                    <ArrowRight className="h-3 w-3 text-gray-400" />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Loading */}
                    {loading && (
                        <div className="p-4 text-center text-sm text-gray-500">
                            Loading suggestions...
                        </div>
                    )}
                </div>
            )}
        </div>
    )
} 