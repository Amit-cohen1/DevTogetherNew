import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { ArrowLeft, Users, Activity, Zap, MessageCircle, Loader, Shield, Globe, Clock, Menu, X, ChevronDown, ChevronUp, Star, Settings, CheckCircle } from 'lucide-react';
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
    
    // Mobile-specific states
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
        details: false,
        tech: false,
        stats: false
    });

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

    const toggleSection = (section: string) => {
        setCollapsedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (!projectId) {
        return <Navigate to="/projects" />;
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <Loader className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading workspace...</p>
                </div>
            </div>
        );
    }

    if (error || !workspaceData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center max-w-md w-full">
                    <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
                        {error || 'Unable to access workspace'}
                    </div>
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mx-auto"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const project = workspaceData.project;

    if (user?.role === 'admin' && !adminAccessAllowed) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center max-w-md w-full">
                    <div className="bg-blue-100 text-blue-800 p-4 rounded-lg mb-4">
                        Admin access to this workspace is locked.<br />
                        The organization must approve your access request before you can enter this workspace.
                    </div>
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mx-auto"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const { teamMembers, isOwner, userRole } = workspaceData;

    // Enhanced status manager permissions check
    const currentUserMember = teamMembers.find(member => member.user.id === user?.id);
    const isStatusManager = currentUserMember?.status_manager === true;
    
    // Check if current user can edit status (owner or promoted developer)
    const canEditStatus = isOwner || isStatusManager;

    const navigationItems = [
        { id: 'overview' as WorkspaceSection, label: 'Overview', icon: Activity, badge: null },
        { id: 'team' as WorkspaceSection, label: 'Team', icon: Users, badge: teamMembers.length },
        { id: 'status' as WorkspaceSection, label: 'Status', icon: Settings, badge: canEditStatus ? 'MANAGE' : null },
        { id: 'chat' as WorkspaceSection, label: 'Chat', icon: MessageCircle, badge: null },
        { id: 'actions' as WorkspaceSection, label: 'Actions', icon: Zap, badge: null },
    ];

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50">
                {/* Mobile-Enhanced Header Section */}
                <div className="relative bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-700 overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-indigo-900/20" />
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%224%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30" />
                    
                    <div className="relative p-4 sm:p-6">
                        <div className="flex flex-col space-y-4">
                            {/* Header row with back button and mobile menu */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <button
                                        onClick={() => window.history.back()}
                                        className="p-2 sm:p-3 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-all hover:scale-105 shadow-lg"
                                    >
                                        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </button>
                                    <div className="min-w-0 flex-1">
                                        <h1 className="text-xl sm:text-3xl font-bold text-white mb-1 truncate">
                                            {project.title}
                                        </h1>
                                        <p className="text-white/80 text-sm sm:text-lg">
                                            Project Workspace
                                        </p>
                                    </div>
                                </div>
                                
                                {/* Mobile menu button */}
                                <button
                                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                    className="p-2 sm:p-3 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-all lg:hidden"
                                >
                                    {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                                </button>
                            </div>

                            {/* Status & Role Indicators - Mobile Optimized */}
                            <div className="flex flex-wrap gap-2 sm:gap-3">
                                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${
                                        project.status === 'open' ? 'bg-green-400' :
                                        project.status === 'in_progress' ? 'bg-blue-400' :
                                        project.status === 'completed' ? 'bg-purple-400' :
                                        'bg-gray-400'
                                    }`} />
                                    <span className="text-white/90 text-xs sm:text-sm font-medium capitalize">
                                        {project.status.replace('_', ' ')}
                                    </span>
                                </div>
                                
                                {isOwner && (
                                    <div className="bg-yellow-500/20 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2">
                                        <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-300" />
                                        <span className="text-yellow-100 text-xs sm:text-sm font-medium">Owner</span>
                                    </div>
                                )}
                                
                                {isStatusManager && (
                                    <div className="bg-green-500/20 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2">
                                        <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-green-300" />
                                        <span className="text-green-100 text-xs sm:text-sm font-medium">Status Manager</span>
                                    </div>
                                )}

                                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2">
                                    <Users className="w-3 h-3 sm:w-4 sm:h-4 text-white/80" />
                                    <span className="text-white/90 text-xs sm:text-sm font-medium">
                                        {teamMembers.length} member{teamMembers.length !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            </div>

                            {/* Project Key Details in Blue Header - Always Visible */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                                <div className="bg-white/15 backdrop-blur-sm rounded-lg p-2 sm:p-3 border border-white/20">
                                    <div className="text-xs font-medium text-white/70 mb-1">Difficulty</div>
                                    <div className="text-sm font-bold text-white capitalize">{project.difficulty_level}</div>
                                </div>
                                <div className="bg-white/15 backdrop-blur-sm rounded-lg p-2 sm:p-3 border border-white/20">
                                    <div className="text-xs font-medium text-white/70 mb-1">Duration</div>
                                    <div className="text-sm font-bold text-white">{project.estimated_duration || 'Flexible'}</div>
                                </div>
                                <div className="bg-white/15 backdrop-blur-sm rounded-lg p-2 sm:p-3 border border-white/20">
                                    <div className="text-xs font-medium text-white/70 mb-1">Location</div>
                                    <div className="text-sm font-bold text-white">
                                        {project.is_remote ? 'Remote' : project.location || 'On-site'}
                                    </div>
                                </div>
                                {project.deadline && (
                                    <div className="bg-white/15 backdrop-blur-sm rounded-lg p-2 sm:p-3 border border-white/20">
                                        <div className="text-xs font-medium text-white/70 mb-1">Deadline</div>
                                        <div className="text-sm font-bold text-white">
                                            {new Date(project.deadline).toLocaleDateString()}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Desktop Navigation */}
                            <div className="hidden lg:block">
                                <nav className="flex flex-wrap gap-2" aria-label="Workspace navigation">
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
                                                {item.badge && (
                                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                                        activeSection === item.id 
                                                            ? 'bg-indigo-100 text-indigo-700' 
                                                            : 'bg-white/20 text-white/90'
                                                    }`}>
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation Drawer */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden bg-white border-b border-gray-200 shadow-lg">
                        <div className="p-4">
                            <nav className="grid grid-cols-2 gap-3" aria-label="Mobile workspace navigation">
                                {navigationItems.map((item) => {
                                    const IconComponent = item.icon;
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => {
                                                setActiveSection(item.id);
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className={`flex flex-col items-center gap-2 p-4 rounded-xl font-medium text-sm transition-all ${
                                                activeSection === item.id
                                                    ? 'bg-indigo-50 text-indigo-600 border-2 border-indigo-200'
                                                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
                                            }`}
                                        >
                                            <IconComponent className="w-5 h-5" />
                                            <span>{item.label}</span>
                                            {item.badge && (
                                                <span className={`text-xs px-2 py-1 rounded-full ${
                                                    activeSection === item.id 
                                                        ? 'bg-indigo-100 text-indigo-700' 
                                                        : 'bg-gray-200 text-gray-600'
                                                }`}>
                                                    {item.badge}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>
                )}

                {/* Main Content - Mobile Optimized */}
                <div className="p-4 sm:p-6">
                    <div className="max-w-7xl mx-auto">
                        {/* Overview Section - Mobile Enhanced with Collapsible Sections */}
                        {activeSection === 'overview' && (
                            <div className="space-y-4 sm:space-y-6">
                                {/* Status Manager Notification */}
                                <StatusManagerNotification
                                    userIsStatusManager={!!isStatusManager}
                                    projectId={project.id}
                                />

                                {/* Mobile-Optimized Overview Cards */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                                    {/* Main Overview */}
                                    <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                                        {/* Project Details - Collapsible on Mobile */}
                                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                            <button
                                                onClick={() => toggleSection('details')}
                                                className="w-full flex items-center justify-between p-4 sm:p-6 text-left hover:bg-gray-50 lg:cursor-default"
                                            >
                                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                                    <Activity className="w-5 h-5 text-indigo-600" />
                                                    Project Overview
                                                </h3>
                                                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform lg:hidden ${
                                                    collapsedSections.details ? '' : 'rotate-180'
                                                }`} />
                                            </button>
                                            <div className={`${collapsedSections.details ? 'hidden' : 'block'} lg:block`}>
                                                <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-4">
                                                    <p className="text-gray-600 leading-relaxed">
                                                        {project.description}
                                                    </p>
                                                    
                                                    {/* Project Requirements Section */}
                                                    {project.requirements && (
                                                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                                            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                                                                <CheckCircle className="w-4 h-4" />
                                                                Project Requirements
                                                            </h4>
                                                            <p className="text-blue-800 text-sm leading-relaxed">
                                                                {project.requirements}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Technology Stack - Collapsible on Mobile */}
                                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                            <button
                                                onClick={() => toggleSection('tech')}
                                                className="w-full flex items-center justify-between p-4 sm:p-6 text-left hover:bg-gray-50 lg:cursor-default"
                                            >
                                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                                    <Zap className="w-5 h-5 text-purple-600" />
                                                    Technology Stack
                                                    <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
                                                        {project.technology_stack.length}
                                                    </span>
                                                </h3>
                                                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform lg:hidden ${
                                                    collapsedSections.tech ? '' : 'rotate-180'
                                                }`} />
                                            </button>
                                            <div className={`${collapsedSections.tech ? 'hidden' : 'block'} lg:block`}>
                                                <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                                                    <div className="flex flex-wrap gap-2">
                                                        {project.technology_stack.map((tech, index) => (
                                                            <span
                                                                key={index}
                                                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200"
                                                            >
                                                                {tech}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Enhanced Sidebar - Mobile Optimized */}
                                    <div className="space-y-4 sm:space-y-6">
                                        {/* Quick Stats - Collapsible on Mobile */}
                                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                            <button
                                                onClick={() => toggleSection('stats')}
                                                className="w-full flex items-center justify-between p-4 sm:p-6 text-left hover:bg-gray-50 lg:cursor-default"
                                            >
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    Quick Stats
                                                </h3>
                                                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform lg:hidden ${
                                                    collapsedSections.stats ? '' : 'rotate-180'
                                                }`} />
                                            </button>
                                            <div className={`${collapsedSections.stats ? 'hidden' : 'block'} lg:block`}>
                                                <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                                                    <div className="grid grid-cols-1 gap-3">
                                                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <Users className="w-5 h-5 text-blue-600" />
                                                                    <span className="font-semibold text-blue-800">Team</span>
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
                                                                    {teamMembers.filter(m => m.user.role === 'developer').length}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        
                                                        {teamMembers.filter(m => m.status_manager).length > 0 && (
                                                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-2">
                                                                        <Shield className="w-5 h-5 text-purple-600" />
                                                                        <span className="font-semibold text-purple-800">Managers</span>
                                                                    </div>
                                                                    <span className="text-2xl font-bold text-purple-600">
                                                                        {teamMembers.filter(m => m.status_manager).length}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Project Info */}
                                        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                                Project Details
                                            </h3>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                    <span className="text-blue-800 font-medium flex items-center gap-2">
                                                        <Clock className="w-4 h-4" />
                                                        Duration
                                                    </span>
                                                    <span className="font-bold text-blue-800">
                                                        {project.estimated_duration || 'Flexible'}
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

                        {/* Status Section - Enhanced for Status Managers */}
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

                        {/* Chat Section - Mobile Optimized */}
                        {activeSection === 'chat' && (
                            <div className="h-[calc(100vh-300px)] sm:h-96 lg:h-[600px]">
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
                </div>
            </div>
        </Layout>
    );
} 