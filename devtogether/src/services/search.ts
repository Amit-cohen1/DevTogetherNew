import { supabase } from '../utils/supabase'
import { Project, SearchHistory, SearchFilters, SearchResult, SearchSuggestion, PopularSearch } from '../types/database'

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
            let supabaseQuery = supabase
                .from('projects')
                .select(`
          *,
          organization:profiles!projects_organization_id_fkey(
            organization_name,
            avatar_url
          ),
          applications(
            id,
            status,
            developer:profiles!applications_developer_id_fkey(
              id,
              first_name,
              last_name,
              avatar_url
            )
          )
        `, { count: 'exact' })

            // Full-text search across multiple fields
            if (query.trim()) {
                supabaseQuery = supabaseQuery.or([
                    `title.ilike.%${query}%`,
                    `description.ilike.%${query}%`,
                    `requirements.ilike.%${query}%`,
                    `technology_stack.cs.{${query}}`
                ].join(','))
            }

            // Apply filters
            if (filters.technology_stack?.length) {
                supabaseQuery = supabaseQuery.overlaps('technology_stack', filters.technology_stack)
            }

            if (filters.difficulty_level?.length) {
                supabaseQuery = supabaseQuery.in('difficulty_level', filters.difficulty_level)
            }

            if (filters.application_type?.length) {
                supabaseQuery = supabaseQuery.in('application_type', filters.application_type)
            }

            if (filters.status?.length) {
                supabaseQuery = supabaseQuery.in('status', filters.status)
            } else {
                // Default to open projects only if no status filter
                supabaseQuery = supabaseQuery.eq('status', 'open')
            }

            if (filters.is_remote !== null && filters.is_remote !== undefined) {
                supabaseQuery = supabaseQuery.eq('is_remote', filters.is_remote)
            }

            // Date range filters
            if (filters.date_range?.start) {
                supabaseQuery = supabaseQuery.gte('created_at', filters.date_range.start)
            }

            if (filters.date_range?.end) {
                supabaseQuery = supabaseQuery.lte('created_at', filters.date_range.end)
            }

            // Sorting
            switch (sort_by) {
                case 'created_at':
                    supabaseQuery = supabaseQuery.order('created_at', { ascending: sort_order === 'asc' })
                    break
                case 'deadline':
                    supabaseQuery = supabaseQuery.order('deadline', { ascending: sort_order === 'asc', nullsFirst: false })
                    break
                case 'title':
                    supabaseQuery = supabaseQuery.order('title', { ascending: sort_order === 'asc' })
                    break
                case 'popularity':
                    // Sort by application count (to be implemented with joins)
                    supabaseQuery = supabaseQuery.order('created_at', { ascending: false })
                    break
                default: // relevance
                    supabaseQuery = supabaseQuery.order('created_at', { ascending: false })
            }

            // Pagination
            const offset = (page - 1) * limit
            supabaseQuery = supabaseQuery.range(offset, offset + limit - 1)

            const { data, error, count } = await supabaseQuery

            if (error) {
                console.error('Search error:', error)
                throw new Error(error.message)
            }

            const searchTime = Date.now() - startTime

            // Get search suggestions if query is short
            const suggestions = query.length < 3 ? await this.getSearchSuggestions(query) : []

            // Filter to only include accepted applications for each project
            const projectsWithAcceptedMembers = data?.map((project: any) => ({
                ...project,
                applications: project.applications?.filter((app: any) => app.status === 'accepted') || []
            })) || []

            return {
                projects: projectsWithAcceptedMembers,
                total_count: count || 0,
                search_time: searchTime,
                suggestions: suggestions.map(s => s.text)
            }
        } catch (error) {
            console.error('Full-text search failed:', error)
            throw error
        }
    },

    // Get search suggestions based on input
    async getSearchSuggestions(partial: string): Promise<SearchSuggestion[]> {
        if (!partial.trim()) return []

        try {
            const suggestions: SearchSuggestion[] = []

            // Technology suggestions
            const { data: techSuggestions } = await supabase
                .from('projects')
                .select('technology_stack')
                .textSearch('technology_stack', `${partial}:*`)
                .limit(5)

            if (techSuggestions) {
                const techs = techSuggestions
                    .flatMap((p: any) => p.technology_stack || [])
                    .filter((tech: string) => tech.toLowerCase().includes(partial.toLowerCase()))
                    .slice(0, 3)

                techs.forEach((tech: string) => {
                    if (!suggestions.find(s => s.text === tech)) {
                        suggestions.push({ text: tech, type: 'technology' })
                    }
                })
            }

            // Project title suggestions
            const { data: projectSuggestions } = await supabase
                .from('projects')
                .select('title')
                .ilike('title', `%${partial}%`)
                .limit(3)

            if (projectSuggestions) {
                projectSuggestions.forEach((project: any) => {
                    suggestions.push({ text: project.title, type: 'project' })
                })
            }

            // Organization suggestions
            const { data: orgSuggestions } = await supabase
                .from('profiles')
                .select('organization_name')
                .not('organization_name', 'is', null)
                .ilike('organization_name', `%${partial}%`)
                .limit(2)

            if (orgSuggestions) {
                orgSuggestions.forEach((org: any) => {
                    if (org.organization_name) {
                        suggestions.push({ text: org.organization_name, type: 'organization' })
                    }
                })
            }

            return suggestions.slice(0, 8)
        } catch (error) {
            console.error('Error getting search suggestions:', error)
            return []
        }
    },

    // Save search to history
    async saveSearchToHistory(userId: string, searchTerm: string, filters: SearchFilters, resultCount: number): Promise<void> {
        try {
            // Only save non-empty search terms
            if (!searchTerm.trim()) return

            await supabase
                .from('search_history')
                .insert({
                    user_id: userId,
                    search_term: searchTerm,
                    filters: filters as any,
                    result_count: resultCount
                })

            // Update popular searches
            await this.updatePopularSearches(searchTerm)
        } catch (error) {
            console.error('Error saving search history:', error)
            // Don't throw error for history saving failures
        }
    },

    // Get user's search history
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
            console.error('Error fetching search history:', error)
            return []
        }
    },

    // Delete search history
    async deleteSearchHistory(userId: string, searchHistoryId?: string): Promise<void> {
        try {
            let query = supabase
                .from('search_history')
                .delete()
                .eq('user_id', userId)

            if (searchHistoryId) {
                query = query.eq('id', searchHistoryId)
            }

            const { error } = await query

            if (error) throw error
        } catch (error) {
            console.error('Error deleting search history:', error)
            throw error
        }
    },

    // Update popular searches
    async updatePopularSearches(searchTerm: string): Promise<void> {
        try {
            // Only update for non-empty search terms
            if (!searchTerm.trim()) return

            const normalizedTerm = searchTerm.toLowerCase().trim()

            // Try to insert first (for new search terms)
            const { error: insertError } = await supabase
                .from('popular_searches')
                .insert({
                    search_term: normalizedTerm,
                    search_count: 1,
                    last_searched: new Date().toISOString()
                })

            // If insert failed due to unique constraint, update existing record
            if (insertError && insertError.code === '23505') {
                // Get current count and increment it
                const { data: existingSearch, error: selectError } = await supabase
                    .from('popular_searches')
                    .select('search_count')
                    .eq('search_term', normalizedTerm)
                    .single()

                if (!selectError && existingSearch) {
                    await supabase
                        .from('popular_searches')
                        .update({
                            search_count: existingSearch.search_count + 1,
                            last_searched: new Date().toISOString()
                        })
                        .eq('search_term', normalizedTerm)
                }
            } else if (insertError) {
                // Some other error occurred
                console.error('Error inserting popular search:', insertError)
            }
        } catch (error) {
            console.error('Error updating popular searches:', error)
            // Don't throw error for popular searches failures
        }
    },

    // Get popular searches
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
            console.error('Error fetching popular searches:', error)
            return []
        }
    },

    // Track search analytics
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

    // Get quick search results (for navbar search)
    async quickSearch(query: string, limit: number = 5): Promise<Project[]> {
        if (!query.trim()) return []

        try {
            const { data } = await supabase
                .from('projects')
                .select(`
          id,
          title,
          description,
          technology_stack,
          difficulty_level,
          status,
          organization:profiles!projects_organization_id_fkey(organization_name, avatar_url),
          applications(
            id,
            status,
            developer:profiles!applications_developer_id_fkey(
              id,
              first_name,
              last_name,
              avatar_url
            )
          )
        `)
                .or(`title.ilike.%${query}%,description.ilike.%${query}%,technology_stack.cs.{${query}}`)
                .eq('status', 'open')
                .order('created_at', { ascending: false })
                .limit(limit)

            // Filter to only include accepted applications
            const projectsWithAcceptedMembers = data?.map((project: any) => ({
                ...project,
                applications: project.applications?.filter((app: any) => app.status === 'accepted') || []
            })) || []

            return projectsWithAcceptedMembers
        } catch (error) {
            console.error('Quick search error:', error)
            return []
        }
    }
} 