import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { ArrowLeft, Users, Activity, Zap, MessageCircle, Loader, Shield, Globe, Clock } from 'lucide-react';
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

    // New: check admin workspace access
    const [adminAccessAllowed, setAdminAccessAllowed] = useState(true);
    useEffect(() => {
        if (user?.role === 'admin' && projectId) {
            workspaceService.checkWorkspaceAccess(projectId, user.id, 'admin').then(setAdminAccessAllowed);
        }
    }, [user?.role, projectId, user?.id]);

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

    const project = workspaceData.project;
    if (['pending', 'rejected'].includes(project.status)) {
        let message = '';
        if (project.status === 'pending') {
            message = 'This project is awaiting admin approval. The workspace will be available once the project is approved by an admin.';
        } else if (project.status === 'rejected') {
            if ((project as any).can_resubmit) {
                message = 'This project was rejected by an admin. You can fix the issues and resubmit the project for review.';
            } else {
                message = 'This project was rejected by an admin and cannot be resubmitted automatically. If you believe this is a mistake, please contact devtogether.help@gmail.com for support.';
            }
        }
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg mb-4 max-w-md">
                        {message}
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

    if (user?.role === 'admin' && !adminAccessAllowed) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="bg-blue-100 text-blue-800 p-4 rounded-lg mb-4 max-w-md">
                        Admin access to this workspace is locked.<br />
                        The organization must approve your access request before you can enter this workspace.
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

    const { teamMembers, isOwner, userRole } = workspaceData;

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
            <div className="min-h-screen bg-gray-50">
                {/* Enhanced Header Section - Premium Look */}
                <div className="relative bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-700 overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-indigo-900/20" />
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%224%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30" />
                    
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                            {/* Left: Project Info & Navigation */}
                            <div className="flex flex-col gap-6">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => window.history.back()}
                                        className="p-3 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-all hover:scale-105 shadow-lg"
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                    </button>
                                    <div>
                                        <h1 className="text-3xl font-bold text-white mb-1">
                                            {project.title}
                                        </h1>
                                        <p className="text-white/80 text-lg">
                                            Project Workspace
                                        </p>
                                    </div>
                                </div>

                                {/* Enhanced Status & Team Info */}
                                <div className="flex flex-wrap items-center gap-4">
                                    <div className={`px-4 py-2 rounded-xl font-semibold text-sm shadow-lg border-2 border-white/20 ${
                                        project.status === 'open' ? 'bg-slate-500/90 text-white' :
                                        project.status === 'in_progress' ? 'bg-blue-500/90 text-white' :
                                        project.status === 'completed' ? 'bg-green-500/90 text-white' :
                                        'bg-red-500/90 text-white'
                                    }`}>
                                        <div className="flex items-center gap-2">
                                            {project.status === 'open' && <Activity className="w-4 h-4" />}
                                            {project.status === 'in_progress' && <Zap className="w-4 h-4" />}
                                            {project.status === 'completed' && <Activity className="w-4 h-4" />}
                                            {project.status.replace('_', ' ').charAt(0).toUpperCase() + project.status.slice(1).replace('_', ' ')}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-xl text-white border-2 border-white/20">
                                        <Users className="w-4 h-4" />
                                        <span className="font-medium">
                                            {teamMembers.length} member{teamMembers.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>

                                    {/* Admin indicator if admin has access */}
                                    {user?.role === 'admin' && adminAccessAllowed && (
                                        <div className="flex items-center gap-2 bg-yellow-500/90 px-4 py-2 rounded-xl text-white border-2 border-yellow-400/50">
                                            <Shield className="w-4 h-4" />
                                            <span className="font-medium text-sm">Admin Access</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right: Quick Project Stats */}
                            <div className="flex gap-3">
                                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 text-center border border-white/30">
                                    <div className="text-2xl font-bold text-white">
                                        {project.technology_stack.length}
                                    </div>
                                    <div className="text-white/80 text-xs font-medium">Tech Stack</div>
                                </div>
                                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 text-center border border-white/30">
                                    <div className="text-2xl font-bold text-white">
                                        {project.estimated_duration || 'TBD'}
                                    </div>
                                    <div className="text-white/80 text-xs font-medium">Duration</div>
                                </div>
                            </div>
                        </div>

                        {/* Enhanced Navigation */}
                        <div className="mt-8">
                            <nav className="flex flex-wrap gap-2 lg:gap-4" aria-label="Workspace navigation">
                                {navigationItems.map((item) => {
                                    const IconComponent = item.icon;
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => setActiveSection(item.id)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all hover:scale-105 ${
                                                activeSection === item.id
                                                    ? 'bg-white text-indigo-600 shadow-lg border-2 border-white/50'
                                                    : 'bg-white/20 text-white hover:bg-white/30 border-2 border-white/20'
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

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content Area */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Overview Section */}
                            {activeSection === 'overview' && (
                                <div className="space-y-6">
                                    {/* Status Manager Notification */}
                                    <StatusManagerNotification
                                        userIsStatusManager={!!userIsStatusManager}
                                        projectId={project.id}
                                    />

                                    {/* Enhanced Project Overview */}
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-200">
                                            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                                                <div className="p-2 bg-blue-100 rounded-lg">
                                                    <Activity className="w-6 h-6 text-blue-600" />
                                                </div>
                                                Project Overview
                                            </h2>
                                            <p className="text-gray-600">Complete project details and requirements</p>
                                        </div>
                                        
                                        <div className="p-6 space-y-6">
                                            {/* Description */}
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                    <MessageCircle className="w-5 h-5 text-blue-600" />
                                                    Description
                                                </h3>
                                                <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                    {project.description}
                                                </p>
                                            </div>

                                            {/* Requirements */}
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                    <Activity className="w-5 h-5 text-green-600" />
                                                    Requirements
                                                </h3>
                                                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                                    <div className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                                                        {project.requirements}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Technology Stack */}
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                    <Zap className="w-5 h-5 text-purple-600" />
                                                    Technology Stack
                                                    <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
                                                        {project.technology_stack.length} technologies
                                                    </span>
                                                </h3>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                                    {project.technology_stack.map((tech, index) => (
                                                        <div
                                                            key={index}
                                                            className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-3 text-center hover:from-purple-100 hover:to-blue-100 transition-all duration-300 cursor-default hover:scale-105 hover:shadow-md"
                                                        >
                                                            <div className="flex items-center justify-center gap-2">
                                                                <Zap className="w-4 h-4 text-purple-600" />
                                                                <span className="font-medium text-purple-800">
                                                                    {tech}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
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

                        {/* Enhanced Sidebar */}
                        <div className="space-y-6">
                            {/* Enhanced Project Info Cards */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 border-b border-gray-200">
                                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            <Activity className="w-5 h-5 text-green-600" />
                                        </div>
                                        Quick Info
                                    </h3>
                                </div>
                                
                                <div className="p-6 space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                                        <span className="text-orange-800 font-medium flex items-center gap-2">
                                            <Zap className="w-4 h-4" />
                                            Difficulty
                                        </span>
                                        <span className={`font-bold px-3 py-1 rounded-full text-xs ${
                                            project.difficulty_level === 'beginner' ? 'bg-green-100 text-green-800' :
                                            project.difficulty_level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {project.difficulty_level}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                                        <span className="text-blue-800 font-medium flex items-center gap-2">
                                            <Activity className="w-4 h-4" />
                                            Type
                                        </span>
                                        <span className="font-bold text-blue-800 capitalize">
                                            {project.application_type}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                                        <span className="text-purple-800 font-medium flex items-center gap-2">
                                            <Users className="w-4 h-4" />
                                            Max Team
                                        </span>
                                        <span className="font-bold text-purple-800">
                                            {project.max_team_size || 'Flexible'}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                                        <span className="text-indigo-800 font-medium flex items-center gap-2">
                                            <Globe className="w-4 h-4" />
                                            Location
                                        </span>
                                        <span className="font-bold text-indigo-800">
                                            {project.is_remote ? '🌍 Remote' : project.location || 'Not specified'}
                                        </span>
                                    </div>
                                    
                                    {project.estimated_duration && (
                                        <div className="flex items-center justify-between p-3 bg-teal-50 rounded-lg border border-teal-200">
                                            <span className="text-teal-800 font-medium flex items-center gap-2">
                                                <Clock className="w-4 h-4" />
                                                Duration
                                            </span>
                                            <span className="font-bold text-teal-800">
                                                {project.estimated_duration}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Enhanced Team Summary */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 border-b border-gray-200">
                                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <div className="p-2 bg-purple-100 rounded-lg">
                                            <Users className="w-5 h-5 text-purple-600" />
                                        </div>
                                        Team Overview
                                    </h3>
                                </div>
                                
                                <div className="p-6 space-y-4">
                                    <div className="grid grid-cols-1 gap-3">
                                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-5 h-5 text-blue-600" />
                                                    <span className="font-semibold text-blue-800">Total Members</span>
                                                </div>
                                                <span className="text-2xl font-bold text-blue-600">{teamMembers.length}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Zap className="w-5 h-5 text-green-600" />
                                                    <span className="font-semibold text-green-800">Developers</span>
                                                </div>
                                                <span className="text-2xl font-bold text-green-600">
                                                    {teamMembers.filter(m => m.role === 'developer').length}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-xl border border-orange-200">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Activity className="w-5 h-5 text-orange-600" />
                                                    <span className="font-semibold text-orange-800">Organizations</span>
                                                </div>
                                                <span className="text-2xl font-bold text-orange-600">
                                                    {teamMembers.filter(m => m.role === 'organization').length}
                                                </span>
                                            </div>
                                        </div>
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

                            {/* Admin Role Section */}
                            {userRole === 'admin' && (
                                <div className="bg-white rounded-lg border border-gray-200 p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        Your Role
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-1 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 text-sm font-medium rounded border border-purple-200 flex items-center gap-1">
                                                Platform Admin
                                                <Shield className="w-4 h-4 text-purple-600" />
                                            </span>
                                        </div>
                                        <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                                            <p className="text-xs text-purple-700">
                                                You have admin access to this workspace. You can view project activity and collaborate with the team.
                                            </p>
                                        </div>
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