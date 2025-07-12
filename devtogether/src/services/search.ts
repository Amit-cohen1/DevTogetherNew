import { supabase } from '../utils/supabase'
import { Project, SearchHistory, SearchFilters, SearchResult, SearchSuggestion, PopularSearch, SearchAnalytics } from '../types/database'
import { projectService } from './projects'

export interface AdvancedSearchParams {
    query: string
    filters?: SearchFilters
    sort_by?: 'relevance' | 'created_at' | 'deadline' | 'title' | 'popularity'
    sort_order?: 'asc' | 'desc'
    page?: number
    limit?: number
}

export const searchService = {
    // Full-text search with advanced filtering
    async performFullTextSearch(params: AdvancedSearchParams): Promise<SearchResult> {
        const startTime = Date.now()
        const { query, filters = {}, sort_by = 'relevance', sort_order = 'desc', page = 1, limit = 20 } = params

        try {
            // Prepare project service filters - FIXED: Now properly handles multi-select
            const projectFilters: any = {};
            
            // Status filter - use all selected statuses
            if (filters.status?.length) {
                projectFilters.status = filters.status; // Pass entire array
            }
            
            // Difficulty level filter - use all selected levels
            if (filters.difficulty_level?.length) {
                projectFilters.difficulty_level = filters.difficulty_level; // Pass entire array
            }
            
            // Application type filter - use all selected types
            if (filters.application_type?.length) {
                projectFilters.application_type = filters.application_type; // Pass entire array
            }
            
            // Technology stack filter
            if (filters.technology_stack?.length) {
                projectFilters.technology_stack = filters.technology_stack;
            }
            
            // Remote work filter
            if (filters.is_remote !== null && filters.is_remote !== undefined) {
                projectFilters.is_remote = filters.is_remote;
            }

            // Get projects with proper team member composition using enhanced filters
            const allProjects = await projectService.getProjectsWithTeamMembers(projectFilters);

            // Filter projects based on search query
            let filteredProjects = allProjects

            if (query.trim()) {
                const searchTerm = query.toLowerCase()
                filteredProjects = allProjects.filter(project =>
                    project.title.toLowerCase().includes(searchTerm) ||
                    project.description.toLowerCase().includes(searchTerm) ||
                    project.requirements.toLowerCase().includes(searchTerm) ||
                    project.technology_stack.some(tech => tech.toLowerCase().includes(searchTerm)) ||
                    project.organization?.organization_name?.toLowerCase().includes(searchTerm)
                )
            }

            // Apply additional filters that aren't handled by projectService
            
            // Date range filters
            if (filters.date_range?.start) {
                filteredProjects = filteredProjects.filter(project =>
                    new Date(project.created_at) >= new Date(filters.date_range!.start!)
                )
            }

            if (filters.date_range?.end) {
                filteredProjects = filteredProjects.filter(project =>
                    new Date(project.created_at) <= new Date(filters.date_range!.end!)
                )
            }

            // Team size filter
            if (filters.team_size) {
                filteredProjects = filteredProjects.filter(project => {
                    const teamSize = project.applications?.filter(app => app.status === 'accepted').length || 0;
                    
                    switch (filters.team_size) {
                        case 'solo':
                            return teamSize <= 1;
                        case 'small':
                            return teamSize >= 2 && teamSize <= 5;
                        case 'medium':
                            return teamSize >= 6 && teamSize <= 10;
                        case 'large':
                            return teamSize > 10;
                        default:
                            return true;
                    }
                });
            }

            // Location filter
            if (filters.location?.city) {
                filteredProjects = filteredProjects.filter(project =>
                    project.location?.toLowerCase().includes(filters.location!.city!.toLowerCase())
                )
            }

            // Sorting
            switch (sort_by) {
                case 'created_at':
                    filteredProjects.sort((a, b) => {
                        const dateA = new Date(a.created_at).getTime()
                        const dateB = new Date(b.created_at).getTime()
                        return sort_order === 'asc' ? dateA - dateB : dateB - dateA
                    })
                    break
                case 'deadline':
                    filteredProjects.sort((a, b) => {
                        const deadlineA = a.deadline ? new Date(a.deadline).getTime() : Infinity
                        const deadlineB = b.deadline ? new Date(b.deadline).getTime() : Infinity
                        return sort_order === 'asc' ? deadlineA - deadlineB : deadlineB - deadlineA
                    })
                    break
                case 'title':
                    filteredProjects.sort((a, b) => {
                        const comparison = a.title.localeCompare(b.title)
                        return sort_order === 'asc' ? comparison : -comparison
                    })
                    break
                case 'relevance':
                    // For relevance, we'll sort by search term match quality
                    if (query.trim()) {
                        const searchTerm = query.toLowerCase()
                        filteredProjects.sort((a, b) => {
                            const scoreA = this.calculateRelevanceScore(a, searchTerm)
                            const scoreB = this.calculateRelevanceScore(b, searchTerm)
                            return sort_order === 'asc' ? scoreA - scoreB : scoreB - scoreA
                        })
                    }
                    break
                case 'popularity':
                    // Sort by number of applications or team members
                    filteredProjects.sort((a, b) => {
                        const popularityA = (a.applications?.length || 0)
                        const popularityB = (b.applications?.length || 0)
                        return sort_order === 'asc' ? popularityA - popularityB : popularityB - popularityA
                    })
                    break
            }

            // Pagination
            const startIndex = (page - 1) * limit
            const endIndex = startIndex + limit
            const paginatedProjects = filteredProjects.slice(startIndex, endIndex)

            const searchTime = Date.now() - startTime

            return {
                projects: paginatedProjects,
                total_count: filteredProjects.length,
                search_time: searchTime,
                suggestions: query.trim() ? this.generateSearchSuggestions(query, filteredProjects) : []
            }

        } catch (error) {
            console.error('Search error:', error)
            throw new Error('Search failed. Please try again.')
        }
    },

    // Calculate relevance score for search results
    calculateRelevanceScore(project: any, searchTerm: string): number {
        let score = 0
        
        // Title match (highest weight)
        if (project.title.toLowerCase().includes(searchTerm)) {
            score += 10
            if (project.title.toLowerCase().startsWith(searchTerm)) {
                score += 5 // Bonus for starting with search term
            }
        }
        
        // Description match
        if (project.description.toLowerCase().includes(searchTerm)) {
            score += 5
        }
        
        // Technology stack match
        if (project.technology_stack.some((tech: string) => tech.toLowerCase().includes(searchTerm))) {
            score += 7
        }
        
        // Organization name match
        if (project.organization?.organization_name?.toLowerCase().includes(searchTerm)) {
            score += 6
        }
        
        // Requirements match
        if (project.requirements.toLowerCase().includes(searchTerm)) {
            score += 3
        }
        
        return score
    },

    // Generate search suggestions based on results
    generateSearchSuggestions(query: string, projects: any[]): string[] {
        const suggestions: Set<string> = new Set()
        const queryLower = query.toLowerCase()
        
        // Extract technology suggestions
        projects.forEach(project => {
            project.technology_stack.forEach((tech: string) => {
                if (tech.toLowerCase().includes(queryLower) && tech.toLowerCase() !== queryLower) {
                    suggestions.add(tech)
                }
            })
        })
        
        // Extract organization suggestions
        projects.forEach(project => {
            if (project.organization?.organization_name) {
                const orgName = project.organization.organization_name
                if (orgName.toLowerCase().includes(queryLower) && orgName.toLowerCase() !== queryLower) {
                    suggestions.add(orgName)
                }
            }
        })
        
        return Array.from(suggestions).slice(0, 5) // Limit to 5 suggestions
    },

    // Quick search for autocomplete
    async quickSearch(query: string, limit: number = 10): Promise<Project[]> {
        try {
            const { data, error } = await supabase
                .from('projects')
                .select(`
                    id,
                    title,
                    description,
                    technology_stack,
                    status,
                    organization:profiles!projects_organization_id_fkey(
                        organization_name,
                        avatar_url
                    )
                `)
                .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
                .eq('status', 'open')
                .limit(limit)

            if (error) throw error
            return data || []
        } catch (error) {
            console.error('Quick search error:', error)
            return []
        }
    },

    // Get search suggestions for autocomplete
    async getSearchSuggestions(partial: string, limit: number = 5): Promise<SearchSuggestion[]> {
        try {
            const suggestions: SearchSuggestion[] = []

            // Technology suggestions
            const { data: techSuggestions } = await supabase
                .from('projects')
                .select('technology_stack')
                .eq('status', 'open')

            const techSet: Set<string> = new Set()
            techSuggestions?.forEach((project: any) => {
                (project.technology_stack || []).forEach((tech: string) => {
                    if (tech.toLowerCase().includes(partial.toLowerCase())) {
                        techSet.add(tech)
                    }
                })
            })

            Array.from(techSet).slice(0, limit).forEach(tech => {
                suggestions.push({
                    type: 'technology',
                    text: tech,
                    count: 0 // Could be calculated if needed
                })
            })

            // Project title suggestions
            const { data: projectSuggestions } = await supabase
                .from('projects')
                .select('title')
                .ilike('title', `%${partial}%`)
                .eq('status', 'open')
                .limit(limit)

            projectSuggestions?.forEach((project: any) => {
                suggestions.push({
                    type: 'project',
                    text: project.title,
                    count: 0
                })
            })

            return suggestions.slice(0, limit)
        } catch (error) {
            console.error('Error getting search suggestions:', error)
            return []
        }
    },

    // Search history management
    async saveSearchToHistory(userId: string, searchTerm: string, filters: SearchFilters, resultCount: number): Promise<void> {
        try {
            await supabase
                .from('search_history')
                .insert({
                    user_id: userId,
                    search_term: searchTerm,
                    filters: filters as any,
                    result_count: resultCount
                })
        } catch (error) {
            console.error('Error saving search to history:', error)
        }
    },

    async getSearchHistory(userId: string, limit: number = 10): Promise<SearchHistory[]> {
        try {
            const { data, error } = await supabase
                .from('search_history')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(limit)

            if (error) throw error
            return data || []
        } catch (error) {
            console.error('Error getting search history:', error)
            return []
        }
    },

    async deleteSearchHistory(userId: string, searchHistoryId?: string): Promise<void> {
        try {
            let query = supabase
                .from('search_history')
                .delete()
                .eq('user_id', userId)

            if (searchHistoryId) {
                query = query.eq('id', searchHistoryId)
            }

            await query
        } catch (error) {
            console.error('Error deleting search history:', error)
        }
    },

    // Popular searches
    async getPopularSearches(limit: number = 10): Promise<PopularSearch[]> {
        try {
            const { data, error } = await supabase
                .from('popular_searches')
                .select('*')
                .order('search_count', { ascending: false })
                .limit(limit)

            if (error) throw error
            return data || []
        } catch (error) {
            console.error('Error getting popular searches:', error)
            return []
        }
    },

    async updatePopularSearch(searchTerm: string): Promise<void> {
        try {
            // First try to increment existing record
            const { data: existing, error: fetchError } = await supabase
                .from('popular_searches')
                .select('*')
                .eq('search_term', searchTerm)
                .single()

            if (fetchError && fetchError.code !== 'PGRST116') {
                throw fetchError
            }

            if (existing) {
                // Update existing record
                await supabase
                    .from('popular_searches')
                    .update({
                        search_count: existing.search_count + 1,
                        last_searched: new Date().toISOString()
                    })
                    .eq('id', existing.id)
            } else {
                // Create new record
                await supabase
                    .from('popular_searches')
                    .insert({
                        search_term: searchTerm,
                        search_count: 1,
                        last_searched: new Date().toISOString()
                    })
            }
        } catch (error) {
            console.error('Error updating popular search:', error)
        }
    },

    // Search analytics
    async trackSearchAnalytics(
        searchTerm: string, 
        userId: string | null, 
        resultCount: number, 
        clickedProjectId?: string, 
        clickPosition?: number,
        sessionId?: string
    ): Promise<void> {
        try {
            await supabase
                .from('search_analytics')
                .insert({
                    search_term: searchTerm,
                    user_id: userId,
                    result_count: resultCount,
                    clicked_project_id: clickedProjectId,
                    click_position: clickPosition,
                    session_id: sessionId
                })
        } catch (error) {
            console.error('Error tracking search analytics:', error)
        }
    },

    async getSearchAnalytics(startDate?: string, endDate?: string): Promise<SearchAnalytics[]> {
        try {
            let query = supabase
                .from('search_analytics')
                .select('*')
                .order('created_at', { ascending: false })

            if (startDate) {
                query = query.gte('created_at', startDate)
            }

            if (endDate) {
                query = query.lte('created_at', endDate)
            }

            const { data, error } = await query

            if (error) throw error
            return data || []
        } catch (error) {
            console.error('Error getting search analytics:', error)
            return []
        }
    }
}