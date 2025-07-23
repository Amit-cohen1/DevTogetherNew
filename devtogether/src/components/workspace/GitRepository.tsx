import React, { useState, useEffect } from 'react';
import { Github, GitBranch, GitCommit, Users, ExternalLink, Plus, Settings, Trash2, AlertCircle, Star, Eye, GitFork, Calendar, Code, LinkIcon, X, Check } from 'lucide-react';
import { gitRepositoryService, ProjectRepository, RepositoryCommit, RepositoryBranch, RepositoryContributor } from '../../services/gitRepositoryService';
import { useAuth } from '../../contexts/AuthContext';

interface GitRepositoryProps {
    projectId: string;
    isOwner: boolean;
    canManageRepository?: boolean;
}

export default function GitRepository({ projectId, isOwner, canManageRepository }: GitRepositoryProps) {
    const { user } = useAuth();
    const [repository, setRepository] = useState<ProjectRepository | null>(null);
    const [commits, setCommits] = useState<RepositoryCommit[]>([]);
    const [branches, setBranches] = useState<RepositoryBranch[]>([]);
    const [contributors, setContributors] = useState<RepositoryContributor[]>([]);
    const [loading, setLoading] = useState(true);
    const [showConnectModal, setShowConnectModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'commits' | 'branches' | 'contributors'>('overview');

    // Connect repository form state
    const [connectForm, setConnectForm] = useState({
        repository_url: '',
        description: '',
        is_private: true,
        github_token: ''
    });
    const [connectLoading, setConnectLoading] = useState(false);

    useEffect(() => {
        loadRepositoryData();
    }, [projectId]);

    // Auto-refresh repository status every 5 seconds if pending
    useEffect(() => {
        if (repository?.connection_status === 'pending') {
            const interval = setInterval(() => {
                loadRepositoryData();
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [repository?.connection_status]);

    const loadRepositoryData = async () => {
        setLoading(true);
        try {
            console.log('Loading repository data for project:', projectId);
            const repo = await gitRepositoryService.getProjectRepository(projectId);
            console.log('Repository data:', repo);
            setRepository(repo);

            if (repo) {
                // Load repository details
                const [commitsData, branchesData, contributorsData] = await Promise.all([
                    gitRepositoryService.getRepositoryCommits(repo.id),
                    gitRepositoryService.getRepositoryBranches(repo.id),
                    gitRepositoryService.getRepositoryContributors(repo.id)
                ]);

                console.log('Repository details loaded:', { 
                    commits: commitsData.length, 
                    branches: branchesData.length, 
                    contributors: contributorsData.length 
                });

                setCommits(commitsData);
                setBranches(branchesData);
                setContributors(contributorsData);
            }
        } catch (error) {
            console.error('Error loading repository data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefreshRepository = async () => {
        if (!repository) return;

        setLoading(true);
        try {
            console.log('Triggering manual repository refresh...');
            const result = await gitRepositoryService.refreshRepositoryData(repository.id);
            
            if (result.success) {
                // Wait a moment for the sync to complete, then reload
                setTimeout(() => {
                    loadRepositoryData();
                }, 2000);
            } else {
                alert(result.error || 'Failed to refresh repository data');
            }
        } catch (error) {
            console.error('Error refreshing repository:', error);
            alert('Failed to refresh repository data');
        }
    };

    const handleConnectRepository = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setConnectLoading(true);
        try {
            if (!gitRepositoryService.validateRepositoryUrl(connectForm.repository_url)) {
                alert('Please enter a valid repository URL (GitHub, GitLab, or Bitbucket)');
                return;
            }

            const result = await gitRepositoryService.connectRepository({
                project_id: projectId,
                repository_name: '', // Will be extracted from URL
                repository_url: connectForm.repository_url,
                description: connectForm.description,
                is_private: connectForm.is_private,
                github_token: connectForm.github_token || undefined
            }, user.id);

            if (result.success) {
                setShowConnectModal(false);
                setConnectForm({ repository_url: '', description: '', is_private: true, github_token: '' });
                // Force a fresh reload after connection with a delay to allow backend sync
                setTimeout(() => {
                    loadRepositoryData();
                }, 1000);
            } else {
                alert(result.error || 'Failed to connect repository');
            }
        } catch (error) {
            console.error('Error connecting repository:', error);
            alert('Failed to connect repository');
        } finally {
            setConnectLoading(false);
        }
    };

    const handleDisconnectRepository = async () => {
        if (!repository) return;

        if (!window.confirm('Are you sure you want to disconnect this repository? This will remove all repository data from the project.')) {
            return;
        }

        try {
            const result = await gitRepositoryService.disconnectRepository(repository.id);
            if (result.success) {
                await loadRepositoryData();
            } else {
                alert(result.error || 'Failed to disconnect repository');
            }
        } catch (error) {
            console.error('Error disconnecting repository:', error);
            alert('Failed to disconnect repository');
        }
    };

    const getConnectionStatusBadge = (status: string) => {
        const statusConfig = {
            connected: { color: 'bg-green-100 text-green-800', text: 'Connected', icon: Check },
            pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Connecting...', icon: Calendar },
            error: { color: 'bg-red-100 text-red-800', text: 'Error', icon: AlertCircle },
            disconnected: { color: 'bg-gray-100 text-gray-800', text: 'Disconnected', icon: X }
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.disconnected;
        const IconComponent = config.icon;

        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
                <IconComponent className="w-3 h-3" />
                {config.text}
            </span>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <span className="ml-3 text-gray-600">Loading repository...</span>
            </div>
        );
    }

    // No repository connected
    if (!repository) {
        return (
            <div className="text-center py-12">
                <Github className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Repository Connected</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Connect a Git repository to enable version control integration, track commits, and collaborate with your team.
                </p>
                {(isOwner || canManageRepository) && (
                    <button
                        onClick={() => setShowConnectModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Connect Repository
                    </button>
                )}

                {/* Connect Repository Modal */}
                {showConnectModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-md w-full p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Connect Repository</h3>
                                <button
                                    onClick={() => setShowConnectModal(false)}
                                    className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            
                            <form onSubmit={handleConnectRepository} className="space-y-4">
                                <div>
                                    <label htmlFor="repository_url" className="block text-sm font-medium text-gray-700 mb-2">
                                        Repository URL *
                                    </label>
                                    <input
                                        type="url"
                                        id="repository_url"
                                        required
                                        value={connectForm.repository_url}
                                        onChange={(e) => setConnectForm(prev => ({ ...prev, repository_url: e.target.value }))}
                                        placeholder="https://github.com/username/repository"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Supports GitHub, GitLab, and Bitbucket repositories
                                    </p>
                                </div>

                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                        Description (Optional)
                                    </label>
                                    <textarea
                                        id="description"
                                        rows={3}
                                        value={connectForm.description}
                                        onChange={(e) => setConnectForm(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Brief description of this repository..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="is_private"
                                        checked={connectForm.is_private}
                                        onChange={(e) => setConnectForm(prev => ({ ...prev, is_private: e.target.checked }))}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="is_private" className="ml-2 block text-sm text-gray-700">
                                        Private repository
                                    </label>
                                </div>

                                {connectForm.is_private && (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                        <div className="flex items-start gap-3">
                                            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                                            <div className="flex-1">
                                                <h4 className="text-sm font-medium text-yellow-800 mb-2">
                                                    GitHub Personal Access Token Required
                                                </h4>
                                                <p className="text-sm text-yellow-700 mb-3">
                                                    Private repositories require authentication. Please provide a GitHub Personal Access Token with repository access.
                                                </p>
                                                <div>
                                                    <label htmlFor="github_token" className="block text-sm font-medium text-gray-700 mb-1">
                                                        GitHub Personal Access Token (Optional)
                                                    </label>
                                                    <input
                                                        type="password"
                                                        id="github_token"
                                                        value={connectForm.github_token}
                                                        onChange={(e) => setConnectForm(prev => ({ ...prev, github_token: e.target.value }))}
                                                        placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                    />
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800">
                                                            Generate a token here →
                                                        </a>
                                                        <span className="ml-2">Requires 'repo' scope for private repositories</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowConnectModal(false)}
                                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={connectLoading}
                                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {connectLoading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Connecting...
                                            </>
                                        ) : (
                                            <>
                                                <LinkIcon className="w-4 h-4" />
                                                Connect Repository
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Repository connected - show details
    return (
        <div className="space-y-6">
            {/* Repository Header */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-gray-100 rounded-lg">
                            <span className="text-2xl">{gitRepositoryService.getRepositoryTypeIcon(repository.repository_type)}</span>
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-xl font-semibold text-gray-900">{repository.repository_name}</h2>
                                {getConnectionStatusBadge(repository.connection_status)}
                                {repository.is_private && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                                        <Eye className="w-3 h-3" />
                                        Private
                                    </span>
                                )}
                                <button
                                    onClick={handleRefreshRepository}
                                    className="text-gray-400 hover:text-gray-600 p-1"
                                    title="Refresh repository data from GitHub"
                                >
                                    <Settings className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-gray-600 text-sm mb-3">
                                {repository.description || 'No description provided'}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                    <Code className="w-4 h-4" />
                                    {repository.language || 'Unknown'}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Star className="w-4 h-4" />
                                    {repository.stars_count}
                                </span>
                                <span className="flex items-center gap-1">
                                    <GitFork className="w-4 h-4" />
                                    {repository.forks_count}
                                </span>
                                {repository.last_sync_at && (
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        Synced {formatDate(repository.last_sync_at)}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Mobile: Buttons one under the other */}
                <div className="block sm:hidden mt-3 space-y-2">
                    <button
                        onClick={() => window.open(repository.repository_url, '_blank')}
                        className="w-full px-3 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                    >
                        <ExternalLink className="w-4 h-4 inline mr-2" />
                        View Repository
                    </button>
                    {(isOwner || canManageRepository) && (
                        <button
                            onClick={handleDisconnectRepository}
                            className="w-full px-3 py-2 text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors text-sm"
                        >
                            <Trash2 className="w-4 h-4 inline mr-2" />
                            Disconnect
                        </button>
                    )}
                </div>

                {/* Desktop: Buttons side by side */}
                <div className="hidden sm:flex items-center gap-2 mt-3">
                    <button
                        onClick={() => window.open(repository.repository_url, '_blank')}
                        className="flex items-center gap-2 px-3 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                    >
                        <ExternalLink className="w-4 h-4" />
                        View Repository
                    </button>
                    {(isOwner || canManageRepository) && (
                        <button
                            onClick={handleDisconnectRepository}
                            className="flex items-center gap-2 px-3 py-2 text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors text-sm"
                        >
                            <Trash2 className="w-4 h-4" />
                            Disconnect
                        </button>
                    )}
                </div>

                {repository.sync_error_message && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2 text-red-800">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">Sync Error</span>
                        </div>
                        <p className="text-red-700 text-sm mt-1">{repository.sync_error_message}</p>
                    </div>
                )}
            </div>

            {/* Repository Tabs */}
            <div className="bg-white rounded-lg border border-gray-200">
                <div className="border-b border-gray-200">
                    {/* Mobile Tabs - 2x2 Grid */}
                    <div className="sm:hidden p-4">
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { id: 'overview', label: 'Overview', icon: Github },
                                { id: 'commits', label: `Commits (${commits.length})`, icon: GitCommit },
                                { id: 'branches', label: `Branches (${branches.length})`, icon: GitBranch },
                                { id: 'contributors', label: `Contributors (${contributors.length})`, icon: Users }
                            ].map((tab) => {
                                const IconComponent = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`flex flex-col items-center gap-1 p-3 text-xs font-medium rounded-lg transition-colors ${
                                            activeTab === tab.id
                                                ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-200'
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-2 border-gray-200'
                                        }`}
                                    >
                                        <IconComponent className="w-4 h-4" />
                                        <span className="text-center leading-tight">{tab.label.split(' ')[0]}</span>
                                        {tab.label.includes('(') && (
                                            <span className="text-[10px] opacity-75">
                                                ({tab.label.match(/\((\d+)\)/)?.[1] || '0'})
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Desktop Tabs - Horizontal */}
                    <nav className="hidden sm:flex gap-6 px-6 py-4">
                        {[
                            { id: 'overview', label: 'Overview', icon: Github },
                            { id: 'commits', label: `Commits (${commits.length})`, icon: GitCommit },
                            { id: 'branches', label: `Branches (${branches.length})`, icon: GitBranch },
                            { id: 'contributors', label: `Contributors (${contributors.length})`, icon: Users }
                        ].map((tab) => {
                            const IconComponent = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                        activeTab === tab.id
                                            ? 'bg-indigo-100 text-indigo-700'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                    }`}
                                >
                                    <IconComponent className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-medium text-gray-900 mb-3">Repository Stats</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span className="text-sm text-gray-600">Default Branch</span>
                                        <span className="text-sm font-medium text-gray-900">{repository.default_branch}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span className="text-sm text-gray-600">Repository Type</span>
                                        <span className="text-sm font-medium text-gray-900 capitalize">{repository.repository_type}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span className="text-sm text-gray-600">Owner</span>
                                        <span className="text-sm font-medium text-gray-900">{repository.owner_username}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-sm text-gray-600">Connected</span>
                                        <span className="text-sm font-medium text-gray-900">{formatDate(repository.created_at)}</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-900 mb-3">Quick Actions</h3>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => window.open(repository.repository_url, '_blank')}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-left text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        Open Repository
                                    </button>
                                    <button
                                        onClick={() => window.open(`${repository.repository_url}/issues`, '_blank')}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-left text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <AlertCircle className="w-4 h-4" />
                                        View Issues
                                    </button>
                                    <button
                                        onClick={() => window.open(`${repository.repository_url}/pulls`, '_blank')}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-left text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <GitBranch className="w-4 h-4" />
                                        Pull Requests
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'commits' && (
                        <div className="space-y-4">
                            {commits.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <GitCommit className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p>No commits synchronized yet</p>
                                </div>
                            ) : (
                                commits.map((commit) => (
                                    <div key={commit.id} className="border rounded-lg p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h4 className="font-medium text-gray-900 mb-1">
                                                    {gitRepositoryService.formatCommitMessage(commit.commit_message)}
                                                </h4>
                                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                                    <span>{commit.author_name || commit.author_username || 'Unknown'}</span>
                                                    <span>{formatDate(commit.commit_date)}</span>
                                                    {commit.branch_name && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                                            <GitBranch className="w-3 h-3" />
                                                            {commit.branch_name}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                                    <span className="text-green-600">+{commit.additions}</span>
                                                    <span className="text-red-600">-{commit.deletions}</span>
                                                    <span>{commit.changed_files} files</span>
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-500 font-mono">
                                                {commit.commit_sha.substring(0, 7)}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'branches' && (
                        <div className="space-y-4">
                            {branches.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <GitBranch className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p>No branches synchronized yet</p>
                                </div>
                            ) : (
                                branches.map((branch) => (
                                    <div key={branch.id} className="border rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <GitBranch className="w-4 h-4 text-gray-600" />
                                                <div>
                                                    <h4 className="font-medium text-gray-900">{branch.branch_name}</h4>
                                                    {branch.latest_commit_date && (
                                                        <p className="text-sm text-gray-600">
                                                            Last updated {formatDate(branch.latest_commit_date)}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {branch.is_default && (
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                                        Default
                                                    </span>
                                                )}
                                                {branch.is_protected && (
                                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                                                        Protected
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'contributors' && (
                        <div className="space-y-4">
                            {contributors.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p>No contributors synchronized yet</p>
                                </div>
                            ) : (
                                contributors.map((contributor) => (
                                    <div key={contributor.id} className="border rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                {contributor.avatar_url ? (
                                                    <img 
                                                        src={contributor.avatar_url} 
                                                        alt={contributor.display_name || contributor.github_username}
                                                        className="w-10 h-10 rounded-full"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                                        <Users className="w-5 h-5 text-gray-500" />
                                                    </div>
                                                )}
                                                <div>
                                                    <h4 className="font-medium text-gray-900">
                                                        {contributor.display_name || contributor.github_username}
                                                    </h4>
                                                    <p className="text-sm text-gray-600">
                                                        {gitRepositoryService.formatContributionStats(
                                                            contributor.total_commits,
                                                            contributor.total_additions,
                                                            contributor.total_deletions
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                            {contributor.last_commit_date && (
                                                <div className="text-sm text-gray-500">
                                                    Last commit {formatDate(contributor.last_commit_date)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 