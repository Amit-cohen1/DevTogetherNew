import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, Users, Calendar, Settings, Clock, ArrowUpRight } from 'lucide-react';
import { DashboardProject } from '../../services/dashboardService';

interface ActiveProjectsSectionProps {
    projects: DashboardProject[];
    loading?: boolean;
}

const ActiveProjectsSection: React.FC<ActiveProjectsSectionProps> = ({
    projects,
    loading = false
}) => {
    const navigate = useNavigate();

    const getProgressColor = (progress: number) => {
        if (progress >= 70) return 'bg-green-500';
        if (progress >= 40) return 'bg-blue-500';
        return 'bg-yellow-500';
    };

    const getProgressBgColor = (progress: number) => {
        if (progress >= 70) return 'bg-green-100';
        if (progress >= 40) return 'bg-blue-100';
        return 'bg-yellow-100';
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Active Projects</h3>
                    <div className="text-sm text-blue-600 font-medium">View All →</div>
                </div>
                <div className="space-y-4">
                    {[...Array(3)].map((_, index) => (
                        <div key={index} className="animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
                            <div className="flex space-x-2">
                                <div className="h-6 bg-gray-200 rounded w-16"></div>
                                <div className="h-6 bg-gray-200 rounded w-20"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (projects.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Active Projects</h3>
                </div>
                <div className="text-center py-12">
                    <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No Active Projects</h4>
                    <p className="text-gray-600 mb-6">
                        You're not currently working on any projects. Browse available projects to find your next opportunity!
                    </p>
                    <button
                        onClick={() => navigate('/projects')}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Find New Projects
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Active Projects</h3>
                <button
                    onClick={() => navigate('/my-applications?filter=accepted')}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
                >
                    <span>View All</span>
                    <ArrowUpRight className="w-4 h-4" />
                </button>
            </div>

            <div className="space-y-4">
                {projects
                    .filter(project => project !== null && project !== undefined)
                    .slice(0, 3)
                    .map((project) => (
                        <div
                            key={project.id}
                            className="border border-gray-100 rounded-lg p-5 hover:border-gray-200 transition-all duration-200 hover:shadow-sm"
                        >
                            {/* Project Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <h4 className="font-semibold text-gray-900">{project?.title || 'Untitled Project'}</h4>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-3">{project?.users?.name || 'Unknown Organization'}</p>
                                </div>
                                <button
                                    onClick={() => navigate(`/workspace/${project.id}`)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Progress Bar */}
                            {project.progress !== undefined && (
                                <div className="mb-4">
                                    <div className="flex items-center justify-between text-sm mb-2">
                                        <span className="text-gray-600 font-medium">Progress</span>
                                        <span className="font-semibold text-gray-900">{project.progress}%</span>
                                    </div>
                                    <div className={`${getProgressBgColor(project.progress)} rounded-full h-2 overflow-hidden`}>
                                        <div
                                            className={`${getProgressColor(project.progress)} h-2 rounded-full transition-all duration-500`}
                                            style={{ width: `${project.progress}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Due Date */}
                            {project.dueDate && (
                                <div className="flex items-center space-x-2 mb-4">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-600">Due Date</span>
                                    <span className="text-sm font-medium text-gray-900">{project.dueDate}</span>
                                </div>
                            )}

                            {/* Technology Stack */}
                            {project.technology_stack && project.technology_stack.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-4">
                                    {project.technology_stack.slice(0, 4).map((tech, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200"
                                        >
                                            {tech}
                                        </span>
                                    ))}
                                    {project.technology_stack.length > 4 && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                                            +{project.technology_stack.length - 4} more
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Team Members and Action */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    {project.teamMembers && project.teamMembers.length > 0 && (
                                        <div className="flex -space-x-2">
                                            {project.teamMembers.slice(0, 3).map((member, index) => (
                                                <div
                                                    key={member.id}
                                                    className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600"
                                                    title={member.name}
                                                >
                                                    {member.avatar ? (
                                                        <img
                                                            src={member.avatar}
                                                            alt={member.name}
                                                            className="w-full h-full rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        member.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'
                                                    )}
                                                </div>
                                            ))}
                                            {project.teamMembers.length > 3 && (
                                                <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-500">
                                                    +{project.teamMembers.length - 3}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => navigate(`/projects/${project.id}`)}
                                        className="text-xs text-gray-500 hover:text-gray-700 font-medium"
                                    >
                                        View Details
                                    </button>
                                    <button
                                        onClick={() => navigate(`/workspace/${project.id}`)}
                                        className="inline-flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded-md text-xs hover:bg-blue-700 transition-colors"
                                    >
                                        <span>Open</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
};

export default ActiveProjectsSection; 