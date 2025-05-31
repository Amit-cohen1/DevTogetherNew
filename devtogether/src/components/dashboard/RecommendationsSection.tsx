import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ArrowRight, Users, Calendar, MapPin } from 'lucide-react';
import { RecommendedProject } from '../../services/dashboardService';

interface RecommendationsSectionProps {
    recommendations: RecommendedProject[];
    loading?: boolean;
}

const RecommendationsSection: React.FC<RecommendationsSectionProps> = ({
    recommendations,
    loading = false
}) => {
    const navigate = useNavigate();

    const getMatchScoreColor = (score: number) => {
        if (score >= 80) return 'bg-green-100 text-green-800 border-green-200';
        if (score >= 60) return 'bg-blue-100 text-blue-800 border-blue-200';
        if (score >= 40) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        return 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'beginner':
                return 'bg-green-100 text-green-800';
            case 'intermediate':
                return 'bg-yellow-100 text-yellow-800';
            case 'advanced':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended for You</h3>
                <div className="space-y-4">
                    {[...Array(3)].map((_, index) => (
                        <div key={index} className="animate-pulse border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                </div>
                                <div className="h-6 bg-gray-200 rounded w-16"></div>
                            </div>
                            <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (recommendations.length === 0) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended for You</h3>
                <div className="text-center py-8">
                    <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No Recommendations Available</h4>
                    <p className="text-gray-600 mb-4">
                        Complete your profile with skills and preferences to get personalized project recommendations.
                    </p>
                    <button
                        onClick={() => navigate('/profile')}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Update Profile
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recommended for You</h3>
                <button
                    onClick={() => navigate('/projects')}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                    Browse All Projects
                </button>
            </div>

            <div className="space-y-4">
                {recommendations.map((project) => (
                    <div
                        key={project.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors cursor-pointer"
                        onClick={() => navigate(`/projects/${project.id}`)}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                    <h4 className="font-medium text-gray-900">{project.title}</h4>
                                    <span
                                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getMatchScoreColor(
                                            project.matchScore
                                        )}`}
                                    >
                                        <Star className="w-3 h-3 mr-1" />
                                        {project.matchScore}% match
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                    {project.description}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                            <div className="flex items-center space-x-1">
                                <Users className="w-4 h-4" />
                                <span>{project.users?.name}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(project.created_at).toLocaleDateString()}</span>
                            </div>
                            {project.location && (
                                <div className="flex items-center space-x-1">
                                    <MapPin className="w-4 h-4" />
                                    <span>{project.location}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center space-x-2 mb-3">
                            <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(
                                    project.difficulty_level
                                )}`}
                            >
                                {project.difficulty_level}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {project.application_type}
                            </span>
                        </div>

                        {project.technology_stack && project.technology_stack.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                                {project.technology_stack.slice(0, 4).map((tech, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800"
                                    >
                                        {tech}
                                    </span>
                                ))}
                                {project.technology_stack.length > 4 && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                                        +{project.technology_stack.length - 4} more
                                    </span>
                                )}
                            </div>
                        )}

                        {project.matchReasons && project.matchReasons.length > 0 && (
                            <div className="mb-3">
                                <h5 className="text-xs font-medium text-gray-700 mb-1">Why this matches:</h5>
                                <div className="flex flex-wrap gap-1">
                                    {project.matchReasons.map((reason, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-50 text-green-700 border border-green-200"
                                        >
                                            {reason}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                            <div className="flex items-center text-xs text-gray-500">
                                <span>Click to view details and apply</span>
                            </div>
                            <ArrowRight className="w-4 h-4 text-blue-600" />
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 text-center">
                <button
                    onClick={() => navigate('/projects')}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                    See More Recommendations
                </button>
            </div>
        </div>
    );
};

export default RecommendationsSection; 