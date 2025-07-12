import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, Send, ExternalLink, ArrowUpRight } from 'lucide-react';

interface ApplicationWithProject {
    id: string;
    project_id: string;
    developer_id: string;
    status: 'pending' | 'accepted' | 'rejected' | 'withdrawn' | 'removed';
    cover_letter: string | null;
    portfolio_links: string[] | null;
    created_at: string;
    updated_at: string;
    projects?: {
        id: string;
        title: string;
        organization_id: string;
        users?: {
            name: string;
        };
    };
}

interface ApplicationsTrackerProps {
    applications: ApplicationWithProject[];
    loading?: boolean;
}

const ApplicationsTracker: React.FC<ApplicationsTrackerProps> = ({
    applications,
    loading = false
}) => {
    const navigate = useNavigate();

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'accepted':
                return {
                    label: 'Accepted',
                    className: 'bg-green-100 text-green-800 border-green-200',
                    icon: <CheckCircle className="w-3 h-3" />
                };
            case 'rejected':
                return {
                    label: 'Declined',
                    className: 'bg-red-100 text-red-800 border-red-200',
                    icon: <XCircle className="w-3 h-3" />
                };
            case 'pending':
                return {
                    label: 'Under Review',
                    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                    icon: <Clock className="w-3 h-3" />
                };
            default:
                return {
                    label: 'Submitted',
                    className: 'bg-gray-100 text-gray-800 border-gray-200',
                    icon: <Send className="w-3 h-3" />
                };
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Applications</h3>
                    <div className="text-sm text-blue-600 font-medium">View All →</div>
                </div>
                <div className="space-y-4">
                    {[...Array(4)].map((_, index) => (
                        <div key={index} className="animate-pulse flex items-center space-x-4 py-3">
                            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                            <div className="flex-1">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                            <div className="w-20 h-6 bg-gray-200 rounded"></div>
                            <div className="w-12 h-6 bg-gray-200 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    if (applications.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Applications</h3>
                </div>
                <div className="text-center py-12">
                    <Send className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No Applications Yet</h4>
                    <p className="text-gray-600 mb-6">
                        Start your journey by applying to projects that match your skills and interests.
                    </p>
                    <button
                        onClick={() => navigate('/projects')}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Find Projects
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Recent Applications</h3>
                <button
                    onClick={() => navigate('/my-applications')}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
                >
                    <span>View All</span>
                    <ArrowUpRight className="w-4 h-4" />
                </button>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-100">
                <div className="col-span-5">Project</div>
                <div className="col-span-3">Organization</div>
                <div className="col-span-2">Date Applied</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-1 text-right">Action</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-50">
                {applications.slice(0, 4).map((application) => {
                    const statusConfig = getStatusConfig(application.status);
                    return (
                        <div
                            key={application.id}
                            className="grid grid-cols-12 gap-4 px-4 py-4 hover:bg-gray-25 transition-colors items-center"
                        >
                            {/* Project */}
                            <div className="col-span-5 flex items-center space-x-3">
                                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                                    <div className="w-4 h-4 bg-yellow-500 rounded-sm"></div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900 line-clamp-1">
                                        {application.projects?.title}
                                    </h4>
                                    <p className="text-xs text-gray-500">Frontend Developer</p>
                                </div>
                            </div>

                            {/* Organization */}
                            <div className="col-span-3 flex items-center">
                                <span className="text-sm text-gray-600">
                                    {application.projects?.users?.name}
                                </span>
                            </div>

                            {/* Date Applied */}
                            <div className="col-span-2 flex items-center">
                                <span className="text-sm text-gray-600">
                                    {new Date(application.created_at).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </span>
                            </div>

                            {/* Status */}
                            <div className="col-span-1 flex items-center min-w-[90px]">
                                <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${statusConfig.className}`}>
                                    {statusConfig.icon}
                                    <span className="hidden sm:inline">{statusConfig.label}</span>
                                </span>
                            </div>

                            {/* Action */}
                            <div className="col-span-1 flex items-center justify-end min-w-[48px] ml-2">
                                {application.status === 'accepted' ? (
                                    <button
                                        onClick={() => navigate(`/workspace/${application.project_id}`)}
                                        className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                                        title="Open Workspace"
                                    >
                                        <ExternalLink className="w-5 h-5" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => navigate(`/projects/${application.project_id}`)}
                                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        View
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ApplicationsTracker; 