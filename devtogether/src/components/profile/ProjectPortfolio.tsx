import React from 'react';
import { Briefcase, Clock, CheckCircle, Users, Calendar, ExternalLink, Award } from 'lucide-react';
import { ProjectPortfolioItem } from '../../services/profileService';

interface ProjectPortfolioProps {
    projects: ProjectPortfolioItem[];
    className?: string;
}

export const ProjectPortfolio: React.FC<ProjectPortfolioProps> = ({
    projects,
    className = ''
}) => {
    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'completed':
                return {
                    icon: CheckCircle,
                    color: 'text-green-600',
                    bgColor: 'bg-green-50',
                    borderColor: 'border-green-200',
                    label: 'Completed'
                };
            case 'active':
                return {
                    icon: Clock,
                    color: 'text-blue-600',
                    bgColor: 'bg-blue-50',
                    borderColor: 'border-blue-200',
                    label: 'Active'
                };
            default:
                return {
                    icon: Clock,
                    color: 'text-gray-600',
                    bgColor: 'bg-gray-50',
                    borderColor: 'border-gray-200',
                    label: 'Paused'
                };
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric'
        });
    };

    const calculateDuration = (startDate: string, endDate?: string) => {
        const start = new Date(startDate);
        const end = endDate ? new Date(endDate) : new Date();
        const diffInMs = end.getTime() - start.getTime();
        const diffInMonths = Math.floor(diffInMs / (1000 * 60 * 60 * 24 * 30));

        if (diffInMonths < 1) return '1 month';
        return `${diffInMonths} months`;
    };

    const activeProjects = projects.filter(p => p.status === 'active');
    const completedProjects = projects.filter(p => p.status === 'completed');

    if (projects.length === 0) {
        return (
            <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
                <div className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                        <Briefcase className="w-5 h-5 text-blue-600" />
                        Project Portfolio
                    </h2>
                    <div className="text-center py-8">
                        <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">No projects yet</p>
                        <p className="text-sm text-gray-500 mt-1">Start applying to projects to build your portfolio</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                    Project Portfolio
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                    Professional projects and collaborations
                </p>

                {/* Quick Stats */}
                <div className="flex items-center gap-6 mt-4">
                    <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-600">
                            {completedProjects.length} Completed
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-gray-600">
                            {activeProjects.length} Active
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-purple-600" />
                        <span className="text-sm text-gray-600">
                            {projects.length} Total
                        </span>
                    </div>
                </div>
            </div>

            <div className="p-6">
                {/* Active Projects */}
                {activeProjects.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-blue-600" />
                            Active Projects ({activeProjects.length})
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {activeProjects.map((project) => {
                                const statusConfig = getStatusConfig(project.status);
                                const StatusIcon = statusConfig.icon;

                                return (
                                    <div
                                        key={project.id}
                                        className={`p-6 rounded-lg border-2 ${statusConfig.borderColor} ${statusConfig.bgColor} hover:shadow-md transition-all group`}
                                    >
                                        {/* Project Header */}
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                                                    {project.title}
                                                </h4>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <span>{project.organization}</span>
                                                    <span>•</span>
                                                    <span>{project.role}</span>
                                                </div>
                                            </div>
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${statusConfig.bgColor} ${statusConfig.color}`}>
                                                <StatusIcon className="w-3 h-3" />
                                                {statusConfig.label}
                                            </span>
                                        </div>

                                        {/* Project Description */}
                                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                            {project.description}
                                        </p>

                                        {/* Technologies */}
                                        {project.technologies.length > 0 && (
                                            <div className="mb-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {project.technologies.slice(0, 4).map((tech, index) => (
                                                        <span
                                                            key={index}
                                                            className="px-2 py-1 text-xs bg-white border border-gray-200 rounded text-gray-700"
                                                        >
                                                            {tech}
                                                        </span>
                                                    ))}
                                                    {project.technologies.length > 4 && (
                                                        <span className="px-2 py-1 text-xs bg-gray-100 border border-gray-200 rounded text-gray-600">
                                                            +{project.technologies.length - 4} more
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Project Meta */}
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    <span>Started {formatDate(project.startDate)}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Users className="w-3 h-3" />
                                                    <span>{project.teamSize} member{project.teamSize !== 1 ? 's' : ''}</span>
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {calculateDuration(project.startDate)}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Completed Projects */}
                {completedProjects.length > 0 && (
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            Completed Projects ({completedProjects.length})
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {completedProjects.map((project) => {
                                const statusConfig = getStatusConfig(project.status);
                                const StatusIcon = statusConfig.icon;

                                return (
                                    <div
                                        key={project.id}
                                        className={`p-6 rounded-lg border-2 ${statusConfig.borderColor} ${statusConfig.bgColor} hover:shadow-md transition-all group`}
                                    >
                                        {/* Project Header */}
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-green-600 transition-colors">
                                                    {project.title}
                                                </h4>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <span>{project.organization}</span>
                                                    <span>•</span>
                                                    <span>{project.role}</span>
                                                </div>
                                            </div>
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${statusConfig.bgColor} ${statusConfig.color}`}>
                                                <StatusIcon className="w-3 h-3" />
                                                {statusConfig.label}
                                            </span>
                                        </div>

                                        {/* Project Description */}
                                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                            {project.description}
                                        </p>

                                        {/* Technologies */}
                                        {project.technologies.length > 0 && (
                                            <div className="mb-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {project.technologies.slice(0, 4).map((tech, index) => (
                                                        <span
                                                            key={index}
                                                            className="px-2 py-1 text-xs bg-white border border-gray-200 rounded text-gray-700"
                                                        >
                                                            {tech}
                                                        </span>
                                                    ))}
                                                    {project.technologies.length > 4 && (
                                                        <span className="px-2 py-1 text-xs bg-gray-100 border border-gray-200 rounded text-gray-600">
                                                            +{project.technologies.length - 4} more
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Outcomes */}
                                        {project.outcomes && project.outcomes.length > 0 && (
                                            <div className="mb-4">
                                                <h5 className="text-xs font-medium text-gray-700 mb-2">Key Achievements:</h5>
                                                <ul className="text-xs text-gray-600 space-y-1">
                                                    {project.outcomes.slice(0, 2).map((outcome, index) => (
                                                        <li key={index} className="flex items-start gap-2">
                                                            <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                                                            <span>{outcome}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Project Meta */}
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    <span>
                                                        {formatDate(project.startDate)} - {project.endDate ? formatDate(project.endDate) : 'Present'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Users className="w-3 h-3" />
                                                    <span>{project.teamSize} member{project.teamSize !== 1 ? 's' : ''}</span>
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {calculateDuration(project.startDate, project.endDate)}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Portfolio Summary */}
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-1">Portfolio Summary</h4>
                            <p className="text-xs text-gray-600">
                                {projects.length} total project{projects.length !== 1 ? 's' : ''} •
                                {completedProjects.length} completed •
                                {activeProjects.length} active
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-lg font-bold text-green-600">
                                {projects.length > 0 ? Math.round((completedProjects.length / projects.length) * 100) : 0}%
                            </div>
                            <div className="text-xs text-gray-600">Success Rate</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}; 