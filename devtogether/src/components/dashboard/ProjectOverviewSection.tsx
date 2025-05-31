import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ExternalLink,
    Users,
    Clock,
    Settings,
    MessageSquare,
    ArrowUpRight,
    Eye,
    Edit3,
    AlertCircle,
    CheckCircle
} from 'lucide-react';
import { DashboardProject } from '../../services/organizationDashboardService';
import { Button } from '../ui/Button';

interface ProjectOverviewSectionProps {
    projects: DashboardProject[];
    loading?: boolean;
}

const ProjectOverviewSection: React.FC<ProjectOverviewSectionProps> = ({
    projects,
    loading = false
}) => {
    const navigate = useNavigate();

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open':
                return 'bg-green-100 text-green-800';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800';
            case 'completed':
                return 'bg-gray-100 text-gray-800';
            case 'paused':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'open':
                return <AlertCircle className="w-3 h-3" />;
            case 'in_progress':
                return <Clock className="w-3 h-3" />;
            case 'completed':
                return <CheckCircle className="w-3 h-3" />;
            default:
                return <Clock className="w-3 h-3" />;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                    <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
                </div>
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="border border-gray-100 rounded-lg p-4 animate-pulse">
                            <div className="h-5 bg-gray-200 rounded w-1/2 mb-3"></div>
                            <div className="flex items-center space-x-4">
                                <div className="h-4 bg-gray-200 rounded w-16"></div>
                                <div className="h-4 bg-gray-200 rounded w-20"></div>
                                <div className="h-4 bg-gray-200 rounded w-24"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Active Projects</h3>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/organization/projects')}
                    icon={<ArrowUpRight className="w-4 h-4" />}
                >
                    View All
                </Button>
            </div>

            {projects.length === 0 ? (
                <div className="text-center py-8">
                    <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No Projects Yet</h4>
                    <p className="text-gray-600 mb-4">
                        Create your first project to start connecting with developers.
                    </p>
                    <Button
                        onClick={() => navigate('/projects/create')}
                        icon={<ExternalLink className="w-4 h-4" />}
                    >
                        Create Project
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {projects.map((project) => (
                        <div
                            key={project.id}
                            className="border border-gray-100 rounded-lg p-4 hover:border-gray-200 transition-colors"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <h4 className="text-sm font-medium text-gray-900 mb-1">
                                        {project.title}
                                    </h4>
                                    <p className="text-xs text-gray-600 line-clamp-2">
                                        {project.description}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-2 ml-4">
                                    <button
                                        onClick={() => navigate(`/projects/${project.id}`)}
                                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                        title="View Project"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => navigate(`/projects/${project.id}/edit`)}
                                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                        title="Edit Project"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                                        {getStatusIcon(project.status)}
                                        <span className="capitalize">{project.status.replace('_', ' ')}</span>
                                    </div>

                                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                                        <Users className="w-3 h-3" />
                                        <span>{project.teamMemberCount} members</span>
                                    </div>

                                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                                        <Clock className="w-3 h-3" />
                                        <span>Active {formatDate(project.lastActivity || project.created_at)}</span>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    {project.pendingApplications > 0 && (
                                        <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                                            <span>{project.pendingApplications} pending</span>
                                        </div>
                                    )}

                                    <button
                                        onClick={() => navigate(`/workspace/${project.id}`)}
                                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                        title="Open Workspace"
                                    >
                                        <MessageSquare className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Recent Applications Preview */}
                            {project.recentApplications && project.recentApplications.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-gray-100">
                                    <div className="text-xs text-gray-500 mb-2">Recent Applications:</div>
                                    <div className="flex -space-x-2">
                                        {project.recentApplications.slice(0, 3).map((app) => (
                                            <div
                                                key={app.id}
                                                className="w-6 h-6 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center overflow-hidden"
                                                title={`${app.developer.first_name} ${app.developer.last_name}`}
                                            >
                                                {app.developer.avatar_url ? (
                                                    <img
                                                        src={app.developer.avatar_url}
                                                        alt={`${app.developer.first_name} ${app.developer.last_name}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-xs text-gray-600">
                                                        {app.developer.first_name?.[0]}{app.developer.last_name?.[0]}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                        {project.applicationCount > 3 && (
                                            <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs text-gray-600">
                                                +{project.applicationCount - 3}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProjectOverviewSection; 