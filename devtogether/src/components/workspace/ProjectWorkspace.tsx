import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { ArrowLeft, Users, Activity, Zap, MessageCircle, Loader, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { workspaceService, WorkspaceData } from '../../services/workspaceService';
import TeamMemberList from './TeamMemberList';
import TeamManagement from './team/TeamManagement';
import ProjectStatus from './ProjectStatus';
import QuickActions from './QuickActions';
import ChatContainer from './chat/ChatContainer';
import { Layout } from '../layout/Layout';
import StatusManagerNotification from './StatusManagerNotification';

type WorkspaceSection = 'overview' | 'team' | 'status' | 'actions' | 'chat';

export default function ProjectWorkspace() {
    const { projectId } = useParams<{ projectId: string }>();
    const { user } = useAuth();
    const [workspaceData, setWorkspaceData] = useState<WorkspaceData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeSection, setActiveSection] = useState<WorkspaceSection>('overview');

    const loadWorkspaceData = useCallback(async () => {
        if (!projectId || !user) return;

        setLoading(true);
        setError(null);

        try {
            const data = await workspaceService.getWorkspaceData(projectId, user.id);

            if (!data) {
                setError('Workspace not found or access denied');
                return;
            }

            if (!data.isMember) {
                setError('You are not a member of this project workspace');
                return;
            }

            setWorkspaceData(data);
        } catch (err) {
            console.error('Error loading workspace:', err);
            setError('Failed to load workspace data');
        } finally {
            setLoading(false);
        }
    }, [projectId, user?.id]);

    useEffect(() => {
        if (projectId && user) {
            loadWorkspaceData();
        }
    }, [projectId, user?.id, loadWorkspaceData]);

    const handleStatusUpdate = () => {
        // Reload workspace data to reflect status changes
        loadWorkspaceData();
    };

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (!projectId) {
        return <Navigate to="/projects" />;
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading workspace...</p>
                </div>
            </div>
        );
    }

    if (error || !workspaceData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4 max-w-md">
                        {error || 'Unable to access workspace'}
                    </div>
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const { project, teamMembers, isOwner, userRole } = workspaceData;

    // Check if current user can edit status (owner or promoted developer)
    const canEditStatus = isOwner || (
        user && userRole === 'developer' &&
        teamMembers.some(member =>
            member.user.id === user.id && member.status_manager === true
        )
    );

    // Check if current user is a status manager (but not the owner)
    const userIsStatusManager = user && userRole === 'developer' && !isOwner &&
        teamMembers.some(member =>
            member.user.id === user.id && member.status_manager === true
        );

    const navigationItems = [
        { id: 'overview' as WorkspaceSection, label: 'Overview', icon: Activity },
        { id: 'team' as WorkspaceSection, label: 'Team', icon: Users },
        { id: 'status' as WorkspaceSection, label: 'Status', icon: Activity },
        { id: 'chat' as WorkspaceSection, label: 'Chat', icon: MessageCircle },
        { id: 'actions' as WorkspaceSection, label: 'Actions', icon: Zap },
    ];

    return (
        <Layout>
            <div className="bg-gray-50">
                {/* Header */}
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="py-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => window.history.back()}
                                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                    </button>
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-900">
                                            {project.title}
                                        </h1>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Project Workspace
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${project.status === 'open' ? 'bg-gray-100 text-gray-800' :
                                        project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                            project.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                'bg-red-100 text-red-800'
                                        }`}>
                                        {project.status.replace('_', ' ').charAt(0).toUpperCase() + project.status.slice(1).replace('_', ' ')}
                                    </span>

                                    <div className="text-sm text-gray-600">
                                        {teamMembers.length} member{teamMembers.length !== 1 ? 's' : ''}
                                    </div>
                                </div>
                            </div>

                            {/* Navigation */}
                            <div className="mt-6">
                                <nav className="flex space-x-8" aria-label="Workspace navigation">
                                    {navigationItems.map((item) => {
                                        const IconComponent = item.icon;
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => setActiveSection(item.id)}
                                                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeSection === item.id
                                                    ? 'border-blue-500 text-blue-600'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                    }`}
                                            >
                                                <IconComponent className="w-4 h-4" />
                                                {item.label}
                                            </button>
                                        );
                                    })}
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content Area */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Overview Section */}
                            {activeSection === 'overview' && (
                                <div className="space-y-6">
                                    {/* Status Manager Notification */}
                                    <StatusManagerNotification
                                        userIsStatusManager={!!userIsStatusManager}
                                        projectId={project.id}
                                    />

                                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                            Project Overview
                                        </h2>
                                        <div className="prose prose-sm max-w-none">
                                            <p className="text-gray-700 mb-4">{project.description}</p>

                                            <h3 className="text-lg font-medium text-gray-900 mb-2">Requirements</h3>
                                            <div className="text-gray-700 whitespace-pre-wrap">
                                                {project.requirements}
                                            </div>

                                            <h3 className="text-lg font-medium text-gray-900 mb-2 mt-6">Technology Stack</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {project.technology_stack.map((tech, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full"
                                                    >
                                                        {tech}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Team Section */}
                            {activeSection === 'team' && (
                                <div data-section="team">
                                    <TeamManagement
                                        projectId={project.id}
                                        isOwner={isOwner}
                                    />
                                </div>
                            )}

                            {/* Status Section */}
                            {activeSection === 'status' && (
                                <div>
                                    <ProjectStatus
                                        project={project}
                                        isOwner={isOwner}
                                        canEditStatus={canEditStatus}
                                        onStatusUpdate={handleStatusUpdate}
                                    />
                                </div>
                            )}

                            {/* Actions Section */}
                            {activeSection === 'actions' && (
                                <div>
                                    <QuickActions
                                        projectId={project.id}
                                        isOwner={isOwner}
                                        userRole={userRole}
                                        onSectionChange={(section: string) => setActiveSection(section as WorkspaceSection)}
                                    />
                                </div>
                            )}

                            {/* Chat Section */}
                            {activeSection === 'chat' && (
                                <div className="h-96 lg:h-[600px]">
                                    <ChatContainer
                                        projectId={project.id}
                                        teamMembers={teamMembers.map(member => ({
                                            id: member.id,
                                            user: {
                                                first_name: member.user.first_name || undefined,
                                                last_name: member.user.last_name || undefined,
                                                organization_name: member.user.organization_name || undefined
                                            }
                                        }))}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Quick Project Info */}
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Quick Info
                                </h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Difficulty:</span>
                                        <span className="font-medium capitalize">{project.difficulty_level}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Application Type:</span>
                                        <span className="font-medium capitalize">{project.application_type}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Max Team Size:</span>
                                        <span className="font-medium">{project.max_team_size || 'Flexible'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Location:</span>
                                        <span className="font-medium">
                                            {project.is_remote ? 'Remote' : project.location || 'Not specified'}
                                        </span>
                                    </div>
                                    {project.estimated_duration && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Duration:</span>
                                            <span className="font-medium">{project.estimated_duration}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Team Summary */}
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Team Summary
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Total Members:</span>
                                        <span className="font-medium">{teamMembers.length}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Developers:</span>
                                        <span className="font-medium">
                                            {teamMembers.filter(m => m.role === 'developer').length}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Organizations:</span>
                                        <span className="font-medium">
                                            {teamMembers.filter(m => m.role === 'organization').length}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Your Role */}
                            {userRole === 'developer' && (
                                <div className="bg-white rounded-lg border border-gray-200 p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        Your Role
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded">
                                                Developer
                                            </span>
                                        </div>
                                        {userIsStatusManager && (
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 text-sm font-medium rounded border border-blue-200 flex items-center gap-1">
                                                    Status Manager
                                                    <Shield className="w-4 h-4 text-blue-600" />
                                                </span>
                                            </div>
                                        )}

                                        {userIsStatusManager && (
                                            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                                <p className="text-xs text-blue-700">
                                                    You have additional permissions to manage project status and updates.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Quick Navigation */}
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Navigation
                                </h3>
                                <div className="space-y-2">
                                    {navigationItems.map((item) => {
                                        const IconComponent = item.icon;
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => setActiveSection(item.id)}
                                                className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors ${activeSection === item.id
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'text-gray-600 hover:bg-gray-100'
                                                    }`}
                                            >
                                                <IconComponent className="w-4 h-4" />
                                                {item.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
} 