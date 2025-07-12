import React from 'react'
import { Link } from 'react-router-dom'
import { 
    CheckCircle, 
    Clock, 
    Award, 
    ExternalLink, 
    Calendar,
    Users,
    MapPin,
    Crown,
    Shield,
    Code
} from 'lucide-react'
import { ProjectWithTeamMembers } from '../../types/database'

interface ProjectPortfolioProps {
    projects: ProjectWithTeamMembers[]
    userId: string
}

export const ProjectPortfolio: React.FC<ProjectPortfolioProps> = ({ projects, userId }) => {
    // 🔧 FIXED: Filter to only show projects user is actually part of
    const userProjects = projects.filter(project => {
        // Check if user is the organization that created the project
        if (project.organization_id === userId) {
            return true;
        }
        
        // Check if user is in team_members (accepted developer)
        return project.team_members?.some(member => 
            member.profile.id === userId && 
            member.type === 'developer' &&
            member.application?.status === 'accepted'
        );
    });

    // Now filter for active projects from user's actual projects
    const activeProjects = userProjects.filter(project => 
        ['open', 'in_progress'].includes(project.status)
    );
    
    const completedProjects = userProjects.filter(project => 
        project.status === 'completed'
    );

    const getUserRole = (project: ProjectWithTeamMembers) => {
        if (project.organization_id === userId) {
            return 'Organization Owner';
        }
        
        const memberInfo = project.team_members?.find(member => 
            member.profile.id === userId
        );
        
        if (memberInfo?.role === 'status_manager') {
            return 'Status Manager';
        }
        
        return 'Developer';
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'Organization Owner':
                return <Crown className="w-4 h-4 text-purple-600" />;
            case 'Status Manager':
                return <Shield className="w-4 h-4 text-blue-600" />;
            default:
                return <Code className="w-4 h-4 text-gray-600" />;
        }
    };

    // If no projects, don't render anything (as requested)
    if (userProjects.length === 0) {
        return null;
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            {/* Header with Real Stats */}
            <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                            <Award className="w-6 h-6 text-purple-600" />
                            Project Portfolio
                        </h2>
                        <p className="text-gray-600 mt-1">Professional projects and collaborations</p>
                    </div>
                    <Link 
                        to="/projects" 
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                    >
                        Discover More
                        <ExternalLink className="w-4 h-4" />
                    </Link>
                </div>

                {/* Real Stats - No Mock Data */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div>
                            <span className="text-sm text-gray-600">Completed</span>
                            <div className="font-semibold text-green-700">{completedProjects.length}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
                        <Clock className="w-5 h-5 text-blue-600" />
                        <div>
                            <span className="text-sm text-gray-600">Active</span>
                            <div className="font-semibold text-blue-700">{activeProjects.length}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
                        <Award className="w-5 h-5 text-purple-600" />
                        <div>
                            <span className="text-sm text-gray-600">Total</span>
                            <div className="font-semibold text-purple-700">{userProjects.length}</div>
                        </div>
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
                                const userRole = getUserRole(project);
                                const statusColor = project.status === 'open' ? 'text-green-700 bg-green-50 border-green-200' : 'text-blue-700 bg-blue-50 border-blue-200';

                                return (
                                    <Link
                                        key={project.id}
                                        to={`/projects/${project.id}`}
                                        className={`block p-6 rounded-lg border-2 ${statusColor} hover:shadow-md transition-all group`}
                                    >
                                        {/* Status & Role */}
                                        <div className="flex items-center justify-between mb-3">
                                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
                                                <Clock className="w-4 h-4" />
                                                {project.status === 'open' ? 'Open' : 'In Progress'}
                                            </div>
                                            <div className="flex items-center gap-1 text-xs text-gray-600 bg-white px-2 py-1 rounded-full border">
                                                {getRoleIcon(userRole)}
                                                {userRole}
                                            </div>
                                        </div>

                                        {/* Project Title */}
                                        <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                                            {project.title}
                                        </h4>

                                        {/* Organization */}
                                        <p className="text-sm text-gray-600 mb-3 flex items-center gap-1">
                                            <Users className="w-4 h-4" />
                                            {project.organization?.organization_name || 'Unknown Organization'}
                                        </p>

                                        {/* Project Details - Real Data */}
                                        <div className="space-y-2 text-xs text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                Started {new Date(project.created_at).toLocaleDateString()}
                                            </div>
                                            {project.location && (
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" />
                                                    {project.location}
                                                </div>
                                            )}
                                        </div>

                                        {/* Tech Stack - Real Data Only */}
                                        {project.technology_stack && project.technology_stack.length > 0 && (
                                            <div className="mt-3 flex flex-wrap gap-1">
                                                {project.technology_stack.slice(0, 3).map((tech) => (
                                                    <span
                                                        key={tech}
                                                        className="px-2 py-1 bg-white text-gray-600 text-xs rounded border"
                                                    >
                                                        {tech}
                                                    </span>
                                                ))}
                                                {project.technology_stack.length > 3 && (
                                                    <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded">
                                                        +{project.technology_stack.length - 3} more
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </Link>
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {completedProjects.map((project) => {
                                const userRole = getUserRole(project);
                                
                                return (
                                    <Link
                                        key={project.id}
                                        to={`/projects/${project.id}`}
                                        className="block p-4 rounded-lg border border-green-200 bg-green-50 hover:shadow-md transition-all group"
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                            <span className="text-sm font-medium text-green-700">Completed</span>
                                        </div>
                                        
                                        <h4 className="font-medium text-gray-900 mb-1 group-hover:text-green-600 transition-colors line-clamp-2">
                                            {project.title}
                                        </h4>
                                        
                                        <p className="text-sm text-gray-600 mb-2">
                                            {project.organization?.organization_name || 'Unknown Organization'}
                                        </p>

                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                            {getRoleIcon(userRole)}
                                            {userRole}
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Call to Action for No Active Projects */}
                {activeProjects.length === 0 && completedProjects.length > 0 && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 text-blue-700">
                            <Clock className="w-5 h-5" />
                            <span className="font-medium">Ready for New Projects!</span>
                        </div>
                        <p className="text-blue-600 text-sm mt-1">
                            You've completed {completedProjects.length} project{completedProjects.length > 1 ? 's' : ''}. 
                            Ready to take on new challenges?
                        </p>
                        <Link 
                            to="/projects" 
                            className="inline-flex items-center gap-1 mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                            Discover Projects
                            <ExternalLink className="w-4 h-4" />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};