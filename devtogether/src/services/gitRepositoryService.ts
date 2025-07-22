import { supabase } from '../utils/supabase';
import { toastService } from './toastService';

export interface ProjectRepository {
    id: string;
    project_id: string;
    repository_name: string;
    repository_url: string;
    repository_type: 'github' | 'gitlab' | 'bitbucket' | 'other';
    provider_repo_id?: string;
    owner_username?: string;
    default_branch: string;
    connection_status: 'connected' | 'disconnected' | 'error' | 'pending';
    last_sync_at?: string;
    sync_error_message?: string;
    is_private: boolean;
    description?: string;
    language?: string;
    stars_count: number;
    forks_count: number;
    created_by: string;
    created_at: string;
    updated_at: string;
}

export interface RepositoryCommit {
    id: string;
    repository_id: string;
    commit_sha: string;
    commit_message: string;
    author_name?: string;
    author_email?: string;
    author_username?: string;
    commit_date: string;
    additions: number;
    deletions: number;
    changed_files: number;
    branch_name?: string;
    synced_at: string;
}

export interface RepositoryBranch {
    id: string;
    repository_id: string;
    branch_name: string;
    is_default: boolean;
    is_protected: boolean;
    latest_commit_sha?: string;
    latest_commit_date?: string;
    ahead_by: number;
    behind_by: number;
    synced_at: string;
}

export interface RepositoryContributor {
    id: string;
    repository_id: string;
    github_username: string;
    display_name?: string;
    email?: string;
    avatar_url?: string;
    total_commits: number;
    total_additions: number;
    total_deletions: number;
    first_commit_date?: string;
    last_commit_date?: string;
    user_id?: string;
    synced_at: string;
}

export interface ConnectRepositoryData {
    project_id: string;
    repository_name: string;
    repository_url: string;
    repository_type?: 'github' | 'gitlab' | 'bitbucket' | 'other';
    owner_username?: string;
    is_private?: boolean;
    description?: string;
    github_token?: string; // Personal Access Token for private repos
}

export interface GitHubRepositoryInfo {
    id: number;
    name: string;
    full_name: string;
    html_url: string;
    description?: string;
    private: boolean;
    default_branch: string;
    language?: string;
    stargazers_count: number;
    forks_count: number;
    owner: {
        login: string;
        avatar_url: string;
    };
}

class GitRepositoryService {
    /**
     * Connect a repository to a project
     */
    async connectRepository(data: ConnectRepositoryData, userId: string): Promise<{ success: boolean; repository?: ProjectRepository; error?: string }> {
        try {
            // Extract owner and repo name from URL
            const repoInfo = this.parseRepositoryUrl(data.repository_url);
            if (!repoInfo) {
                return { success: false, error: 'Invalid repository URL format' };
            }

            // Check if repository is already connected to this project
            const { data: existing } = await supabase
                .from('project_repositories')
                .select('id')
                .eq('project_id', data.project_id)
                .single();

            if (existing) {
                return { success: false, error: 'A repository is already connected to this project' };
            }

            const repositoryData = {
                project_id: data.project_id,
                repository_name: repoInfo.name,
                repository_url: data.repository_url,
                repository_type: data.repository_type || repoInfo.type,
                owner_username: repoInfo.owner,
                default_branch: 'main',
                connection_status: 'pending' as const,
                is_private: data.is_private ?? true,
                description: data.description,
                stars_count: 0,
                forks_count: 0,
                created_by: userId
            };

            const { data: repository, error } = await supabase
                .from('project_repositories')
                .insert(repositoryData)
                .select()
                .single();

            if (error) {
                console.error('Error connecting repository:', error);
                return { success: false, error: error.message };
            }

            // Try to fetch repository info from GitHub API if possible
            if (repoInfo.type === 'github') {
                this.syncRepositoryInfo(repository.id, data.github_token);
            }

            toastService.success('Repository connected successfully!');
            return { success: true, repository };
        } catch (error) {
            console.error('Error connecting repository:', error);
            return { success: false, error: 'Failed to connect repository' };
        }
    }

    /**
     * Get repository for a project
     */
    async getProjectRepository(projectId: string): Promise<ProjectRepository | null> {
        try {
            // Add cache busting to ensure fresh data
            const { data, error } = await supabase
                .from('project_repositories')
                .select('*')
                .eq('project_id', projectId)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    // No repository found
                    return null;
                }
                console.error('Error fetching repository:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Error fetching repository:', error);
            return null;
        }
    }

    /**
     * Get recent commits for a repository
     */
    async getRepositoryCommits(repositoryId: string, limit: number = 10): Promise<RepositoryCommit[]> {
        try {
            const { data, error } = await supabase
                .from('repository_commits')
                .select('*')
                .eq('repository_id', repositoryId)
                .order('commit_date', { ascending: false })
                .limit(limit);

            if (error) {
                console.error('Error fetching commits:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Error fetching commits:', error);
            return [];
        }
    }

    /**
     * Get branches for a repository
     */
    async getRepositoryBranches(repositoryId: string): Promise<RepositoryBranch[]> {
        try {
            const { data, error } = await supabase
                .from('repository_branches')
                .select('*')
                .eq('repository_id', repositoryId)
                .order('is_default', { ascending: false });

            if (error) {
                console.error('Error fetching branches:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Error fetching branches:', error);
            return [];
        }
    }

    /**
     * Get contributors for a repository
     */
    async getRepositoryContributors(repositoryId: string): Promise<RepositoryContributor[]> {
        try {
            const { data, error } = await supabase
                .from('repository_contributors')
                .select('*')
                .eq('repository_id', repositoryId)
                .order('total_commits', { ascending: false });

            if (error) {
                console.error('Error fetching contributors:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Error fetching contributors:', error);
            return [];
        }
    }

    /**
     * Disconnect repository from project
     */
    async disconnectRepository(repositoryId: string): Promise<{ success: boolean; error?: string }> {
        try {
            const { error } = await supabase
                .from('project_repositories')
                .delete()
                .eq('id', repositoryId);

            if (error) {
                console.error('Error disconnecting repository:', error);
                return { success: false, error: error.message };
            }

            toastService.success('Repository disconnected successfully');
            return { success: true };
        } catch (error) {
            console.error('Error disconnecting repository:', error);
            return { success: false, error: 'Failed to disconnect repository' };
        }
    }

    /**
     * Update repository connection status
     */
    async updateConnectionStatus(
        repositoryId: string, 
        status: 'connected' | 'disconnected' | 'error' | 'pending',
        errorMessage?: string
    ): Promise<{ success: boolean; error?: string }> {
        try {
            const updates: any = {
                connection_status: status,
                last_sync_at: new Date().toISOString()
            };

            if (errorMessage) {
                updates.sync_error_message = errorMessage;
            } else {
                updates.sync_error_message = null;
            }

            const { error } = await supabase
                .from('project_repositories')
                .update(updates)
                .eq('id', repositoryId);

            if (error) {
                console.error('Error updating connection status:', error);
                return { success: false, error: error.message };
            }

            return { success: true };
        } catch (error) {
            console.error('Error updating connection status:', error);
            return { success: false, error: 'Failed to update connection status' };
        }
    }

    /**
     * Parse repository URL to extract owner, name, and type
     */
    private parseRepositoryUrl(url: string): { owner: string; name: string; type: 'github' | 'gitlab' | 'bitbucket' | 'other' } | null {
        try {
            const urlObj = new URL(url);
            
            // GitHub
            if (urlObj.hostname === 'github.com' || urlObj.hostname === 'www.github.com') {
                const pathParts = urlObj.pathname.split('/').filter(part => part.length > 0);
                if (pathParts.length >= 2) {
                    return {
                        owner: pathParts[0],
                        name: pathParts[1].replace('.git', ''),
                        type: 'github'
                    };
                }
            }
            
            // GitLab
            if (urlObj.hostname === 'gitlab.com' || urlObj.hostname === 'www.gitlab.com') {
                const pathParts = urlObj.pathname.split('/').filter(part => part.length > 0);
                if (pathParts.length >= 2) {
                    return {
                        owner: pathParts[0],
                        name: pathParts[1].replace('.git', ''),
                        type: 'gitlab'
                    };
                }
            }
            
            // Bitbucket
            if (urlObj.hostname === 'bitbucket.org' || urlObj.hostname === 'www.bitbucket.org') {
                const pathParts = urlObj.pathname.split('/').filter(part => part.length > 0);
                if (pathParts.length >= 2) {
                    return {
                        owner: pathParts[0],
                        name: pathParts[1].replace('.git', ''),
                        type: 'bitbucket'
                    };
                }
            }

            // Generic case
            const pathParts = urlObj.pathname.split('/').filter(part => part.length > 0);
            if (pathParts.length >= 2) {
                return {
                    owner: pathParts[0],
                    name: pathParts[1].replace('.git', ''),
                    type: 'other'
                };
            }

            return null;
        } catch (error) {
            console.error('Error parsing repository URL:', error);
            return null;
        }
    }

    /**
     * Sync repository info from GitHub API with authentication support
     */
    private async syncRepositoryInfo(repositoryId: string, githubToken?: string): Promise<void> {
        try {
            // Get repository data from database
            const { data: repo, error } = await supabase
                .from('project_repositories')
                .select('*')
                .eq('id', repositoryId)
                .single();

            if (error || !repo) {
                await this.updateConnectionStatus(repositoryId, 'error', 'Repository not found');
                return;
            }

            // Only sync GitHub repositories for now
            if (repo.repository_type !== 'github') {
                await this.updateConnectionStatus(repositoryId, 'connected');
                return;
            }

            console.log('Starting GitHub sync for repository:', repo.repository_name);

            // Try to fetch repository info from GitHub API
            const repoInfo = await this.fetchGitHubRepositoryInfo(repo.owner_username, repo.repository_name.replace('.git', ''), githubToken);
            
            if (repoInfo) {
                // Update repository with real GitHub data
                await supabase
                    .from('project_repositories')
                    .update({
                        description: repoInfo.description || repo.description,
                        language: repoInfo.language || repo.language,
                        stars_count: repoInfo.stargazers_count || 0,
                        forks_count: repoInfo.forks_count || 0,
                        is_private: repoInfo.private,
                        default_branch: repoInfo.default_branch || 'main',
                        provider_repo_id: repoInfo.full_name,
                        connection_status: 'connected',
                        last_sync_at: new Date().toISOString()
                    })
                    .eq('id', repositoryId);

                console.log('Repository info updated, syncing additional data...');

                // Always try to fetch commits, branches, and contributors for public repos
                // For private repos, only if token is provided
                if (!repoInfo.private || githubToken) {
                    await Promise.all([
                        this.syncRepositoryCommits(repositoryId, repo.owner_username, repo.repository_name, githubToken),
                        this.syncRepositoryBranches(repositoryId, repo.owner_username, repo.repository_name, githubToken),
                        this.syncRepositoryContributors(repositoryId, repo.owner_username, repo.repository_name, githubToken)
                    ]);
                }

                console.log('GitHub sync completed successfully');
                toastService.success('Repository synchronized successfully!');
            } else {
                // If we can't access the repo (private without token), still mark as connected
                await this.updateConnectionStatus(repositoryId, 'connected', 'Limited access - provide GitHub token for full sync');
                toastService.info('Repository connected with limited access. Add a GitHub token for full synchronization.');
            }
        } catch (error) {
            console.error('Error syncing repository info:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            await this.updateConnectionStatus(repositoryId, 'error', `Failed to sync repository information: ${errorMessage}`);
        }
    }

    /**
     * Fetch repository information from GitHub API
     */
    private async fetchGitHubRepositoryInfo(owner: string, repo: string, token?: string): Promise<GitHubRepositoryInfo | null> {
        try {
            const headers: Record<string, string> = {
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'DevTogether-Platform'
            };

            // Add authentication for private repositories
            if (token) {
                headers['Authorization'] = `token ${token}`;
            }

            console.log(`Fetching GitHub repo info for ${owner}/${repo}`);

            const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
                method: 'GET',
                headers
            });

            if (!response.ok) {
                if (response.status === 404) {
                    console.log('Repository not found or private without access');
                    return null;
                }
                if (response.status === 401) {
                    console.log('Unauthorized - invalid or missing GitHub token');
                    return null;
                }
                if (response.status === 403) {
                    console.log('GitHub API rate limit exceeded');
                    throw new Error('GitHub API rate limit exceeded. Please try again later.');
                }
                throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log('GitHub repo info fetched successfully:', data.name);
            return data;
        } catch (error) {
            console.error('Error fetching GitHub repository info:', error);
            throw error;
        }
    }

    /**
     * Sync recent commits from GitHub API (enhanced version)
     */
    private async syncRepositoryCommits(repositoryId: string, owner: string, repo: string, token?: string): Promise<void> {
        try {
            const headers: Record<string, string> = {
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'DevTogether-Platform'
            };

            if (token) {
                headers['Authorization'] = `token ${token}`;
            }

            console.log(`Fetching commits for ${owner}/${repo}`);

            const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=20`, {
                method: 'GET',
                headers
            });

            if (!response.ok) {
                console.log('Could not fetch commits:', response.status);
                return;
            }

            const commits = await response.json();
            console.log(`Fetched ${commits.length} commits from GitHub API`);
            
            // Clear existing commits for this repository first
            try {
                await supabase
                    .from('repository_commits')
                    .delete()
                    .eq('repository_id', repositoryId);
            } catch (deleteError) {
                console.log('Note: Could not clear existing commits, will upsert instead');
            }

            let successCount = 0;

            // Insert commits using the new upsert function
            for (const commit of commits) {
                try {
                    // Use the upsert function for more reliable insertion
                    const { error } = await supabase
                        .rpc('upsert_repository_commit', {
                            p_repository_id: repositoryId,
                            p_commit_sha: commit.sha,
                            p_commit_message: commit.commit.message,
                            p_author_name: commit.commit.author?.name || null,
                            p_author_email: commit.commit.author?.email || null,
                            p_author_username: commit.author?.login || null,
                            p_commit_date: commit.commit.author?.date || null,
                            p_additions: 0, // Will be updated with detailed stats if needed
                            p_deletions: 0,
                            p_changed_files: 0,
                            p_branch_name: 'main'
                        });

                    if (error) {
                        console.error('Error upserting commit:', commit.sha.substring(0, 7), error);
                    } else {
                        successCount++;
                    }

                    // Small delay to avoid overwhelming the database
                    await new Promise(resolve => setTimeout(resolve, 50));
                } catch (commitError) {
                    console.error('Error processing commit:', commit.sha.substring(0, 7), commitError);
                }
            }

            console.log(`Successfully synced ${successCount}/${commits.length} commits`);
        } catch (error) {
            console.error('Error syncing commits:', error);
            throw error;
        }
    }

    /**
     * Sync branches from GitHub API
     */
    private async syncRepositoryBranches(repositoryId: string, owner: string, repo: string, token?: string): Promise<void> {
        try {
            const headers: Record<string, string> = {
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'DevTogether-Platform'
            };

            if (token) {
                headers['Authorization'] = `token ${token}`;
            }

            console.log(`Fetching branches for ${owner}/${repo}`);

            const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/branches`, {
                method: 'GET',
                headers
            });

            if (!response.ok) {
                console.log('Could not fetch branches:', response.status);
                return;
            }

            const branches = await response.json();
            console.log(`Fetched ${branches.length} branches from GitHub API`);

            // Get the default branch from the repository info
            const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
                method: 'GET',
                headers
            });

            let defaultBranch = 'main';
            if (repoResponse.ok) {
                const repoData = await repoResponse.json();
                defaultBranch = repoData.default_branch;
            }

            // Clear existing branches for this repository
            await supabase
                .from('repository_branches')
                .delete()
                .eq('repository_id', repositoryId);

            // Insert branches into database
            for (const branch of branches) {
                try {
                    await supabase
                        .from('repository_branches')
                        .insert({
                            repository_id: repositoryId,
                            branch_name: branch.name,
                            is_default: branch.name === defaultBranch,
                            is_protected: branch.protected || false,
                            latest_commit_sha: branch.commit?.sha,
                            latest_commit_date: branch.commit?.commit?.author?.date,
                            ahead_by: 0,
                            behind_by: 0
                        });
                } catch (branchError) {
                    console.error('Error inserting branch:', branchError);
                }
            }

            console.log(`Successfully synced ${branches.length} branches`);
        } catch (error) {
            console.error('Error syncing branches:', error);
            throw error;
        }
    }

    /**
     * Sync contributors from GitHub API
     */
    private async syncRepositoryContributors(repositoryId: string, owner: string, repo: string, token?: string): Promise<void> {
        try {
            const headers: Record<string, string> = {
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'DevTogether-Platform'
            };

            if (token) {
                headers['Authorization'] = `token ${token}`;
            }

            console.log(`Fetching contributors for ${owner}/${repo}`);

            const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contributors`, {
                method: 'GET',
                headers
            });

            if (!response.ok) {
                console.log('Could not fetch contributors:', response.status);
                return;
            }

            const contributors = await response.json();
            console.log(`Fetched ${contributors.length} contributors from GitHub API`);

            // Clear existing contributors for this repository first
            try {
                await supabase
                    .from('repository_contributors')
                    .delete()
                    .eq('repository_id', repositoryId);
            } catch (deleteError) {
                console.log('Note: Could not clear existing contributors, will upsert instead');
            }

            let successCount = 0;

            // Insert contributors using the new upsert function
            for (const contributor of contributors) {
                try {
                    // Fetch additional user details if needed
                    let userInfo = { name: null, email: null };
                    if (token) {
                        try {
                            const userResponse = await fetch(`https://api.github.com/users/${contributor.login}`, {
                                method: 'GET',
                                headers
                            });
                            if (userResponse.ok) {
                                userInfo = await userResponse.json();
                            }
                        } catch (userError) {
                            console.log('Could not fetch detailed user info for:', contributor.login);
                        }
                    }

                    // Use the upsert function for more reliable insertion
                    const { error } = await supabase
                        .rpc('upsert_repository_contributor', {
                            p_repository_id: repositoryId,
                            p_github_username: contributor.login,
                            p_display_name: userInfo.name || contributor.login,
                            p_email: userInfo.email || null,
                            p_avatar_url: contributor.avatar_url || null,
                            p_total_commits: contributor.contributions || 0
                        });

                    if (error) {
                        console.error('Error upserting contributor:', contributor.login, error);
                    } else {
                        successCount++;
                    }

                    // Small delay to avoid rate limiting
                    await new Promise(resolve => setTimeout(resolve, 100));
                } catch (contributorError) {
                    console.error('Error processing contributor:', contributor.login, contributorError);
                }
            }

            console.log(`Successfully synced ${successCount}/${contributors.length} contributors`);
        } catch (error) {
            console.error('Error syncing contributors:', error);
            throw error;
        }
    }

    /**
     * Manual refresh repository data - new method to trigger sync
     */
    async refreshRepositoryData(repositoryId: string, githubToken?: string): Promise<{ success: boolean; error?: string }> {
        try {
            const { data: repo, error } = await supabase
                .from('project_repositories')
                .select('*')
                .eq('id', repositoryId)
                .single();

            if (error || !repo) {
                return { success: false, error: 'Repository not found' };
            }

            // Update status to pending while syncing
            await this.updateConnectionStatus(repositoryId, 'pending');

            // Trigger full sync
            await this.syncRepositoryInfo(repositoryId, githubToken);

            return { success: true };
        } catch (error) {
            console.error('Error refreshing repository data:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            await this.updateConnectionStatus(repositoryId, 'error', errorMessage);
            return { success: false, error: errorMessage };
        }
    }

    /**
     * Generate repository URL for different providers
     */
    generateRepositoryUrl(owner: string, name: string, type: 'github' | 'gitlab' | 'bitbucket' = 'github'): string {
        switch (type) {
            case 'github':
                return `https://github.com/${owner}/${name}`;
            case 'gitlab':
                return `https://gitlab.com/${owner}/${name}`;
            case 'bitbucket':
                return `https://bitbucket.org/${owner}/${name}`;
            default:
                return `https://github.com/${owner}/${name}`;
        }
    }

    /**
     * Validate repository URL format
     */
    validateRepositoryUrl(url: string): boolean {
        try {
            const urlObj = new URL(url);
            const validHosts = ['github.com', 'gitlab.com', 'bitbucket.org'];
            const isValidHost = validHosts.some(host => 
                urlObj.hostname === host || urlObj.hostname === `www.${host}`
            );
            
            if (!isValidHost) return false;
            
            const pathParts = urlObj.pathname.split('/').filter(part => part.length > 0);
            return pathParts.length >= 2;
        } catch {
            return false;
        }
    }

    /**
     * Format commit message for display
     */
    formatCommitMessage(message: string, maxLength: number = 60): string {
        if (message.length <= maxLength) return message;
        return message.substring(0, maxLength) + '...';
    }

    /**
     * Get repository type icon
     */
    getRepositoryTypeIcon(type: string): string {
        const icons = {
            github: '🐙',
            gitlab: '🦊',
            bitbucket: '🪣',
            other: '📂'
        };
        return icons[type as keyof typeof icons] || icons.other;
    }

    /**
     * Format contribution stats
     */
    formatContributionStats(commits: number, additions: number, deletions: number): string {
        return `${commits} commits, +${additions}/-${deletions} lines`;
    }
}

export const gitRepositoryService = new GitRepositoryService(); 