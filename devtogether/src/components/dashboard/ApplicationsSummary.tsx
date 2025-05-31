import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Clock,
    CheckCircle,
    XCircle,
    User,
    ArrowUpRight,
    UserCheck,
    UserX,
    AlertCircle
} from 'lucide-react';
import { ApplicationSummary } from '../../services/organizationDashboardService';
import { Button } from '../ui/Button';

interface ApplicationsSummaryProps {
    applications: ApplicationSummary[];
    loading?: boolean;
    onQuickReview?: (applicationId: string, action: 'accept' | 'reject') => Promise<void>;
}

const ApplicationsSummary: React.FC<ApplicationsSummaryProps> = ({
    applications,
    loading = false,
    onQuickReview
}) => {
    const navigate = useNavigate();

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'accepted':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            case 'withdrawn':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <Clock className="w-3 h-3" />;
            case 'accepted':
                return <CheckCircle className="w-3 h-3" />;
            case 'rejected':
                return <XCircle className="w-3 h-3" />;
            case 'withdrawn':
                return <AlertCircle className="w-3 h-3" />;
            default:
                return <Clock className="w-3 h-3" />;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleQuickAction = async (applicationId: string, action: 'accept' | 'reject') => {
        if (onQuickReview) {
            await onQuickReview(applicationId, action);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                    <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
                </div>
                <div className="space-y-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4 p-4 border border-gray-100 rounded-lg animate-pulse">
                            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                            <div className="flex-1">
                                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                            </div>
                            <div className="h-6 bg-gray-200 rounded w-16"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Recent Applications</h3>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/applications')}
                    icon={<ArrowUpRight className="w-4 h-4" />}
                >
                    View All
                </Button>
            </div>

            {applications.length === 0 ? (
                <div className="text-center py-8">
                    <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No Applications Yet</h4>
                    <p className="text-gray-600">
                        Applications from developers will appear here once you create projects.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {applications.map((application) => (
                        <div
                            key={application.id}
                            className="flex items-center space-x-4 p-4 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors"
                        >
                            {/* Developer Avatar */}
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                                {application.developer.avatar_url ? (
                                    <img
                                        src={application.developer.avatar_url}
                                        alt={`${application.developer.first_name} ${application.developer.last_name}`}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <User className="w-5 h-5 text-gray-400" />
                                )}
                            </div>

                            {/* Application Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-3 mb-1">
                                    <h4 className="text-sm font-medium text-gray-900 truncate">
                                        {application.developer.first_name} {application.developer.last_name}
                                    </h4>
                                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                                        {getStatusIcon(application.status)}
                                        <span className="capitalize">{application.status}</span>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                    <span className="truncate">Applied to {application.project.title}</span>
                                    <span>{formatDate(application.created_at)}</span>
                                </div>

                                {/* Skills Preview */}
                                {application.developer.skills && application.developer.skills.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {application.developer.skills.slice(0, 3).map((skill, index) => (
                                            <span
                                                key={index}
                                                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                        {application.developer.skills.length > 3 && (
                                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                                                +{application.developer.skills.length - 3} more
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Quick Actions */}
                            <div className="flex items-center space-x-2">
                                {application.status === 'pending' && onQuickReview && (
                                    <>
                                        <button
                                            onClick={() => handleQuickAction(application.id, 'accept')}
                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                            title="Quick Accept"
                                        >
                                            <UserCheck className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleQuickAction(application.id, 'reject')}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Quick Reject"
                                        >
                                            <UserX className="w-4 h-4" />
                                        </button>
                                    </>
                                )}

                                <button
                                    onClick={() => navigate(`/applications`)}
                                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                                    title="View Application"
                                >
                                    <ArrowUpRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Summary Footer */}
            {applications.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-100 text-center">
                    <p className="text-sm text-gray-600">
                        Showing {applications.length} most recent applications
                    </p>
                </div>
            )}
        </div>
    );
};

export default ApplicationsSummary; 