import React from 'react';
import { MessageCircle, FileText, Users, Settings, ExternalLink, Calendar, Video, Github } from 'lucide-react';

interface QuickActionsProps {
    projectId: string;
    isOwner: boolean;
    userRole: 'organization' | 'developer' | null;
    onSectionChange?: (section: string) => void;
}

export default function QuickActions({ projectId, isOwner, userRole, onSectionChange }: QuickActionsProps) {
    const handleAction = (action: string, url?: string) => {
        switch (action) {
            case 'messages':
                // Navigate to chat section
                onSectionChange?.('chat');
                break;
            case 'project-details':
                window.open(`/projects/${projectId}`, '_blank');
                break;
            case 'team':
                // Navigate to team section
                onSectionChange?.('team');
                break;
            case 'applications':
                if (isOwner) {
                    window.open('/dashboard/applications', '_blank');
                }
                break;
            case 'schedule':
                // TODO: Integrate with calendar service
                alert('Team scheduling will be available in future updates!');
                break;
            case 'video':
                // TODO: Integrate with video conferencing
                alert('Video calls will be available in future updates!');
                break;
            case 'github':
                // TODO: Connect to project repository
                alert('GitHub integration will be available in future updates!');
                break;
            case 'files':
                // TODO: File sharing and management
                alert('File sharing will be available in future updates!');
                break;
            default:
                if (url) {
                    window.open(url, '_blank');
                }
        }
    };

    const actions = [
        {
            id: 'messages',
            label: 'Team Chat',
            description: 'Communicate with team members',
            icon: MessageCircle,
            color: 'bg-blue-100 text-blue-600 hover:bg-blue-200',
            available: true, // Now available!
        },
        {
            id: 'project-details',
            label: 'Project Details',
            description: 'View full project information',
            icon: FileText,
            color: 'bg-green-100 text-green-600 hover:bg-green-200',
            available: true,
        },
        {
            id: 'team',
            label: 'Team Members',
            description: 'View team roster',
            icon: Users,
            color: 'bg-purple-100 text-purple-600 hover:bg-purple-200',
            available: true,
        },
        {
            id: 'applications',
            label: 'Applications',
            description: 'Manage project applications',
            icon: Settings,
            color: 'bg-orange-100 text-orange-600 hover:bg-orange-200',
            available: true,
            ownerOnly: true,
        },
        {
            id: 'schedule',
            label: 'Schedule Meeting',
            description: 'Plan team meetings',
            icon: Calendar,
            color: 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200',
            available: false, // Future feature
        },
        {
            id: 'video',
            label: 'Video Call',
            description: 'Start a team video call',
            icon: Video,
            color: 'bg-red-100 text-red-600 hover:bg-red-200',
            available: false, // Future feature
        },
        {
            id: 'github',
            label: 'Repository',
            description: 'Access project repository',
            icon: Github,
            color: 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            available: false, // Future feature
        },
        {
            id: 'files',
            label: 'Shared Files',
            description: 'Manage project files',
            icon: FileText,
            color: 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200',
            available: false, // Future feature
        },
    ];

    const availableActions = actions.filter(action => {
        if (action.ownerOnly && !isOwner) return false;
        return true;
    });

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableActions.map((action) => {
                    const IconComponent = action.icon;

                    return (
                        <button
                            key={action.id}
                            onClick={() => handleAction(action.id)}
                            disabled={!action.available}
                            className={`
                p-4 rounded-lg border-2 border-transparent transition-all duration-200 text-left
                ${action.available
                                    ? `${action.color} cursor-pointer transform hover:scale-105`
                                    : 'bg-gray-50 text-gray-400 cursor-not-allowed opacity-60'
                                }
              `}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`
                  p-2 rounded-lg
                  ${action.available
                                        ? 'bg-white bg-opacity-50'
                                        : 'bg-gray-200'
                                    }
                `}>
                                    <IconComponent className="w-5 h-5" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-medium text-sm">
                                            {action.label}
                                        </h4>
                                        {!action.available && (
                                            <span className="px-2 py-1 text-xs font-medium bg-gray-200 text-gray-600 rounded-full">
                                                Coming Soon
                                            </span>
                                        )}
                                        {action.available && action.id === 'project-details' && (
                                            <ExternalLink className="w-3 h-3" />
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                        {action.description}
                                    </p>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Help text */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-3">
                    <div className="p-1 bg-blue-100 rounded-full">
                        <MessageCircle className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-blue-900 mb-1">
                            Workspace Features
                        </h4>
                        <p className="text-sm text-blue-700">
                            This workspace will continue to evolve with new collaboration features.
                            Team messaging, file sharing, and video calls are coming soon!
                        </p>
                    </div>
                </div>
            </div>

            {/* Role-specific actions */}
            {userRole && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                        {userRole === 'organization' ? 'Organization Tools' : 'Developer Tools'}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {userRole === 'organization' ? (
                            <>
                                <button
                                    onClick={() => window.open('/dashboard/applications', '_blank')}
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    <Settings className="w-4 h-4" />
                                    Manage Applications
                                </button>
                                <button
                                    onClick={() => window.open('/projects/create', '_blank')}
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    <FileText className="w-4 h-4" />
                                    Create New Project
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => window.open('/applications', '_blank')}
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    <FileText className="w-4 h-4" />
                                    My Applications
                                </button>
                                <button
                                    onClick={() => window.open('/projects', '_blank')}
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    Find More Projects
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
} 