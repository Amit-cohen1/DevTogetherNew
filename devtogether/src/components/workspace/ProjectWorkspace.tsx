import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { ArrowLeft, Users, Activity, Zap, MessageCircle, Loader, Shield, Globe, Clock, Menu, X, ChevronDown, ChevronUp, Star, Settings, CheckCircle, FileText, Calendar, Video, Github, Plus, ExternalLink } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { workspaceService, WorkspaceData } from '../../services/workspaceService';
import { meetingService, ProjectMeeting } from '../../services/meetingService';
import { supabase } from '../../utils/supabase';
import TeamMemberList from './TeamMemberList';
import TeamManagement from './team/TeamManagement';
import ProjectStatus from './ProjectStatus';
import QuickActions from './QuickActions';
import ChatContainer from './chat/ChatContainer';
import SharedFiles from './SharedFiles';
import GitRepository from './GitRepository';
import MeetingSchedulerModal from './MeetingSchedulerModal';
import ScheduledMeetingsModal from './ScheduledMeetingsModal';
import { Layout } from '../layout/Layout';
import StatusManagerNotification from './StatusManagerNotification';

type WorkspaceSection = 'overview' | 'team' | 'status' | 'chat' | 'files' | 'meetings' | 'git';

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

    // Meeting modal states
    const [showMeetingScheduler, setShowMeetingScheduler] = useState(false);
    const [showScheduledMeetings, setShowScheduledMeetings] = useState(false);
    
    // Meeting data state
    const [meetings, setMeetings] = useState<ProjectMeeting[]>([]);
    const [meetingsLoading, setMeetingsLoading] = useState(false);
    const [meetingNotifications, setMeetingNotifications] = useState<Array<{
        type: 'starting_soon' | 'in_progress' | 'ended';
        meeting: ProjectMeeting;
        message: string;
    }>>([]);



    // Load workspace data on component mount
    useEffect(() => {
        const loadData = async () => {
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
        };

        loadData();
    }, [projectId, user?.id]);

    // Load meetings on component mount and workspace data load
    useEffect(() => {
        if (workspaceData?.project && projectId) {
            const loadProjectMeetings = async () => {
                setMeetingsLoading(true);
                try {
                    const projectMeetings = await meetingService.getProjectMeetings(projectId, true); // Auto-update enabled
                    setMeetings(projectMeetings);
                    
                    // Get meeting notifications
                    const notifications = await meetingService.getMeetingNotifications(projectId);
                    setMeetingNotifications(notifications);
                } catch (error) {
                    console.error('Error loading meetings:', error);
                } finally {
                    setMeetingsLoading(false);
                }
            };

            loadProjectMeetings();
            
            // Start auto-status updates for this project
            meetingService.startAutoStatusUpdates(projectId, 1); // Update every minute
            
            // Set up periodic refresh for meetings
            const meetingRefreshInterval = setInterval(() => {
                loadProjectMeetings();
            }, 30000); // Refresh every 30 seconds

            return () => {
                clearInterval(meetingRefreshInterval);
                meetingService.stopAutoStatusUpdates();
            };
        }
    }, [workspaceData?.project, projectId]);

    // New: check admin workspace access
    const [adminAccessAllowed, setAdminAccessAllowed] = useState(true);
    useEffect(() => {
        if (user?.role === 'admin' && projectId) {
            workspaceService.checkWorkspaceAccess(projectId, user.id, 'admin').then(setAdminAccessAllowed);
        }
    }, [user?.role, projectId, user?.id]);

    // Check if user can create meetings (organization owner or status manager)
    const canCreateMeetings = useMemo(() => {
        if (!user || !workspaceData?.project) return false;
        
        // Organization owner can always create meetings
        if (workspaceData.project.organization_id === user.id) return true;
        
        // Check if user is a status manager
        const userTeamMember = workspaceData.teamMembers.find(member => member.id === user.id);
        return userTeamMember?.status_manager === true;
    }, [user, workspaceData]);

    // Check if user can start video calls (same as create meetings)
    const canStartVideoCall = canCreateMeetings;

    const handleStatusUpdate = () => {
        // Reload workspace data to reflect status changes
        if (!projectId || !user) return;
        
        const reloadData = async () => {
            try {
                const data = await workspaceService.getWorkspaceData(projectId, user.id);
                if (data && data.isMember) {
                    setWorkspaceData(data);
                }
            } catch (err) {
                console.error('Error reloading workspace:', err);
            }
        };
        
        reloadData();
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
    const isAdmin = user?.role === 'admin';
    
    // Check if current user can edit status (owner or promoted developer)
    const canEditStatus = isOwner || isStatusManager;
    
    // Role-based permissions for new features
    const canDeleteAnyFile = isOwner || isStatusManager || isAdmin;
    
    const navigationItems = [
        { id: 'overview' as WorkspaceSection, label: 'Overview', icon: Activity, badge: null },
        { id: 'chat' as WorkspaceSection, label: 'Chat', icon: MessageCircle, badge: null },
        { id: 'files' as WorkspaceSection, label: 'Files', icon: FileText, badge: null },
        { id: 'meetings' as WorkspaceSection, label: 'Meetings', icon: Calendar, badge: null },
        { id: 'git' as WorkspaceSection, label: 'Git', icon: Github, badge: null },
        { id: 'team' as WorkspaceSection, label: 'Team', icon: Users, badge: teamMembers.length },
        { id: 'status' as WorkspaceSection, label: 'Status', icon: Settings, badge: canEditStatus ? 'MANAGE' : null },
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
                            <nav className="space-y-3" aria-label="Mobile workspace navigation">
                                {/* Primary tabs - 2 columns grid */}
                                <div className="grid grid-cols-2 gap-3">
                                    {navigationItems.slice(0, 6).map((item) => {
                                        const IconComponent = item.icon;
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => {
                                                    setActiveSection(item.id);
                                                    setIsMobileMenuOpen(false);
                                                }}
                                                className={`flex flex-col items-center gap-2 p-3 rounded-xl font-medium text-sm transition-all ${
                                                    activeSection === item.id
                                                        ? 'bg-indigo-50 text-indigo-600 border-2 border-indigo-200'
                                                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
                                                }`}
                                            >
                                                <IconComponent className="w-5 h-5" />
                                                <span className="text-xs">{item.label}</span>
                                                {item.badge && (
                                                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                                        activeSection === item.id 
                                                            ? 'bg-indigo-100 text-indigo-700' 
                                                            : 'bg-gray-200 text-gray-600'
                                                    }`}>
                                                        {typeof item.badge === 'number' ? item.badge : item.badge}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                                
                                {/* Status tab - full width */}
                                {navigationItems.slice(6).map((item) => {
                                    const IconComponent = item.icon;
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => {
                                                setActiveSection(item.id);
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className={`w-full flex items-center justify-center gap-3 p-3 rounded-xl font-medium text-sm transition-all ${
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
                        {/* Enhanced Breadcrumb Navigation - UX Improvement */}
                        <div className="mb-6 flex items-center justify-between bg-white rounded-lg border border-gray-200 p-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span>Workspace</span>
                                <span className="text-gray-400">•</span>
                                <span className="capitalize font-medium text-gray-900">
                                    {activeSection === 'overview' ? 'Project Overview' :
                                     activeSection === 'chat' ? 'Team Chat' :
                                     activeSection === 'files' ? 'Project Files' :
                                     activeSection === 'meetings' ? 'Team Meetings' :
                                     activeSection === 'git' ? 'Git Repository' :
                                     activeSection === 'team' ? 'Team Management' :
                                     activeSection === 'status' ? 'Project Status' : activeSection}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                {activeSection !== 'overview' && (
                                    <button
                                        onClick={() => setActiveSection('overview')}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                                    >
                                        ← Back to Overview
                                    </button>
                                )}
                            </div>
                        </div>
                        {/* Overview Section - Mobile Enhanced with Collapsible Sections */}
                        {activeSection === 'overview' && (
                            <div className="space-y-4 sm:space-y-6">
                                {/* Status Manager Notification */}
                                <StatusManagerNotification
                                    userIsStatusManager={!!isStatusManager}
                                    projectId={project.id}
                                />

                                {/* Quick Action Floating Bar - UX Enhancement */}
                                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-4 shadow-lg">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-white font-semibold flex items-center gap-2">
                                            <Zap className="w-5 h-5" />
                                            Quick Actions
                                        </h3>
                                        <span className="text-blue-100 text-sm">Essential tools at your fingertips</span>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        <button
                                            onClick={() => setActiveSection('chat')}
                                            className="flex items-center gap-2 p-3 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-all hover:scale-105"
                                        >
                                            <MessageCircle className="w-4 h-4" />
                                            <span className="text-sm font-medium">Chat</span>
                                        </button>
                                        {canStartVideoCall ? (
                                            <button
                                                onClick={() => {
                                                    const meetingUrl = `https://meet.jit.si/devtogether-${project.id.slice(0, 8)}-${Date.now()}`;
                                                    window.open(meetingUrl, '_blank', 'width=1200,height=800');
                                                    if (window.confirm(`Video call started!\n\nRoom URL: ${meetingUrl}\n\nClick OK to copy the URL and share with your team.`)) {
                                                        navigator.clipboard.writeText(meetingUrl);
                                                    }
                                                }}
                                                className="flex items-center gap-2 p-3 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-all hover:scale-105"
                                            >
                                                <Video className="w-4 h-4" />
                                                <span className="text-sm font-medium">Start Video Call</span>
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => setActiveSection('meetings')}
                                                className="flex items-center gap-2 p-3 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-all hover:scale-105"
                                            >
                                                <Video className="w-4 h-4" />
                                                <span className="text-sm font-medium">Join Meeting</span>
                                            </button>
                                        )}
                                        <button
                                            onClick={() => setActiveSection('files')}
                                            className="flex items-center gap-2 p-3 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-all hover:scale-105"
                                        >
                                            <FileText className="w-4 h-4" />
                                            <span className="text-sm font-medium">Files</span>
                                        </button>
                                        <button
                                            onClick={async () => {
                                                if (workspaceData?.project?.organization_id) {
                                                    try {
                                                        const { data: orgProfile } = await supabase
                                                            .from('profiles')
                                                            .select('github')
                                                            .eq('id', workspaceData.project.organization_id)
                                                            .single();
                                                        
                                                        if (orgProfile?.github) {
                                                            const url = orgProfile.github.startsWith('http') 
                                                                ? orgProfile.github 
                                                                : `https://github.com/${orgProfile.github}`;
                                                            window.open(url, '_blank');
                                                        } else {
                                                            alert('No GitHub repository configured for this project.');
                                                        }
                                                    } catch (error) {
                                                        alert('Unable to access repository information.');
                                                    }
                                                }
                                            }}
                                            className="flex items-center gap-2 p-3 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-all hover:scale-105"
                                        >
                                            <Github className="w-4 h-4" />
                                            <span className="text-sm font-medium">Repository</span>
                                        </button>
                                    </div>
                                </div>

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

                        {/* Files Section */}
                        {activeSection === 'files' && (
                            <div className="bg-white rounded-lg border border-gray-200">
                                <div className="p-4 border-b border-gray-200">
                                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-blue-600" />
                                        Project Files
                                    </h2>
                                    <p className="text-gray-600 text-sm mt-1">Upload, view and manage project files</p>
                                </div>
                                <div className="overflow-y-auto max-h-[calc(100vh-300px)]">
                                    <SharedFiles 
                                        projectId={project.id} 
                                        isOwner={isOwner}
                                        canDeleteAnyFile={canDeleteAnyFile}
                                        userRole={userRole}
                                        userId={user?.id}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Meetings Section */}
                        {activeSection === 'meetings' && (
                            <div className="bg-white rounded-lg border border-gray-200">
                                <div className="p-4 sm:p-6 border-b border-gray-200">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                                                <Calendar className="w-5 h-5 text-indigo-600" />
                                                Team Meetings
                                            </h2>
                                            <p className="text-gray-600 text-sm mt-1">
                                                {meetings.length > 0 ? `${meetings.filter(m => new Date(m.meeting_date) >= new Date()).length} upcoming meeting${meetings.filter(m => new Date(m.meeting_date) >= new Date()).length !== 1 ? 's' : ''}` : 'Schedule and manage team meetings'}
                                            </p>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                            {canStartVideoCall && (
                                                <button
                                                    onClick={() => {
                                                        const meetingUrl = `https://meet.jit.si/devtogether-${project.id.slice(0, 8)}-${Date.now()}`;
                                                        window.open(meetingUrl, '_blank', 'width=1200,height=800');
                                                        if (window.confirm(`Video call started!\n\nRoom URL: ${meetingUrl}\n\nClick OK to copy the URL and share with your team.`)) {
                                                            navigator.clipboard.writeText(meetingUrl);
                                                        }
                                                    }}
                                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                                                >
                                                    <Video className="w-4 h-4" />
                                                    Start Video Call
                                                </button>
                                            )}
                                            {canCreateMeetings && (
                                                <button 
                                                    onClick={() => setShowMeetingScheduler(true)}
                                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    Schedule Meeting
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => setShowScheduledMeetings(true)}
                                                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                            >
                                                <Calendar className="w-4 h-4" />
                                                View All Meetings
                                            </button>
                                            {!canCreateMeetings && !canStartVideoCall && (
                                                <div className="text-gray-500 text-xs sm:text-sm italic">
                                                    Only project owners and status managers can create meetings and start video calls.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="p-4 sm:p-6">
                                    {/* Meeting Notifications */}
                                {meetingNotifications.length > 0 && (
                                    <div className="mb-6">
                                        {meetingNotifications.map((notification, index) => (
                                            <div 
                                                key={index}
                                                className={`flex items-center gap-3 p-4 rounded-lg mb-3 ${
                                                    notification.type === 'starting_soon' ? 'bg-yellow-50 border border-yellow-200' :
                                                    notification.type === 'in_progress' ? 'bg-green-50 border border-green-200' :
                                                    'bg-gray-50 border border-gray-200'
                                                }`}
                                            >
                                                <div className={`p-2 rounded-full ${
                                                    notification.type === 'starting_soon' ? 'bg-yellow-100' :
                                                    notification.type === 'in_progress' ? 'bg-green-100' :
                                                    'bg-gray-100'
                                                }`}>
                                                    {notification.type === 'starting_soon' ? (
                                                        <Clock className="w-5 h-5 text-yellow-600" />
                                                    ) : notification.type === 'in_progress' ? (
                                                        <Video className="w-5 h-5 text-green-600" />
                                                    ) : (
                                                        <CheckCircle className="w-5 h-5 text-gray-600" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <p className={`font-medium ${
                                                        notification.type === 'starting_soon' ? 'text-yellow-800' :
                                                        notification.type === 'in_progress' ? 'text-green-800' :
                                                        'text-gray-800'
                                                    }`}>
                                                        {notification.message}
                                                    </p>
                                                    {notification.type === 'in_progress' && notification.meeting.meeting_url && (
                                                        <button
                                                            onClick={() => window.open(notification.meeting.meeting_url, '_blank', 'width=1200,height=800')}
                                                            className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
                                                        >
                                                            <Video className="w-4 h-4" />
                                                            Join Now
                                                            <ExternalLink className="w-3 h-3" />
                                                        </button>
                                                    )}
                                                </div>
                                                {notification.type === 'ended' && (
                                                    <button
                                                        onClick={() => {
                                                            meetingService.updateMeetingStatus(notification.meeting.id, 'completed');
                                                            setMeetingNotifications(prev => prev.filter((_, i) => i !== index));
                                                        }}
                                                        className="text-gray-400 hover:text-gray-600"
                                                    >
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Enhanced Meetings List */}
                                {meetingsLoading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader className="h-6 w-6 animate-spin text-blue-600 mr-2" />
                                        <span className="text-gray-600">Loading meetings...</span>
                                    </div>
                                ) : meetings.length > 0 ? (
                                    <div className="space-y-4">
                                        {meetings.filter(meeting => {
                                            const meetingDate = new Date(meeting.meeting_date);
                                            const yesterday = new Date();
                                            yesterday.setDate(yesterday.getDate() - 1);
                                            return meetingDate >= yesterday;
                                        }).slice(0, 3).map((meeting) => {
                                            const isHappeningNow = meetingService.isMeetingActive(meeting);
                                            const isUpcoming = new Date(meeting.meeting_date) > new Date() && !isHappeningNow;
                                            const hasEnded = meetingService.isMeetingEnded(meeting);
                                            const isStartingSoon = meetingService.isMeetingStartingSoon(meeting);

                                            return (
                                                <div 
                                                    key={meeting.id} 
                                                    className={`p-4 rounded-lg border-l-4 ${
                                                        isHappeningNow ? 'bg-green-50 border-green-500' :
                                                        isStartingSoon ? 'bg-yellow-50 border-yellow-500' :
                                                        isUpcoming ? 'bg-blue-50 border-blue-500' :
                                                        hasEnded ? 'bg-gray-50 border-gray-400' :
                                                        'bg-white border-gray-300'
                                                    }`}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <h4 className="font-medium text-gray-900">{meeting.title}</h4>
                                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                                    meeting.status === 'in_progress' ? 'bg-green-100 text-green-800' :
                                                                    meeting.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                                                                    meeting.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                                                                    'bg-red-100 text-red-800'
                                                                }`}>
                                                                    {meeting.status === 'in_progress' ? 'Live Now' :
                                                                     meeting.status === 'scheduled' ? 'Scheduled' :
                                                                     meeting.status === 'completed' ? 'Completed' :
                                                                     'Cancelled'}
                                                                </span>
                                                                {isStartingSoon && (
                                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 animate-pulse">
                                                                        Starting Soon
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center text-sm text-gray-600 mb-2">
                                                                <Calendar className="w-4 h-4 mr-1" />
                                                                <span>{new Date(meeting.meeting_date).toLocaleDateString('en-US', {
                                                                    weekday: 'short',
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}</span>
                                                                <span className="mx-2">•</span>
                                                                <Clock className="w-4 h-4 mr-1" />
                                                                <span>{meeting.duration_minutes} min</span>
                                                                {meeting.organizer && (
                                                                    <>
                                                                        <span className="mx-2">•</span>
                                                                        <Users className="w-4 h-4 mr-1" />
                                                                        <span>
                                                                            {meeting.organizer.organization_name || 
                                                                             `${meeting.organizer.first_name} ${meeting.organizer.last_name}`}
                                                                        </span>
                                                                    </>
                                                                )}
                                                            </div>
                                                            {meeting.description && (
                                                                <p className="text-sm text-gray-700 mb-3">{meeting.description}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Video Call Button - Only show for active or upcoming meetings */}
                                                    {meeting.meeting_url && !hasEnded && meeting.status !== 'cancelled' && (
                                                        <div className="mt-3 flex items-center gap-2">
                                                            <button
                                                                onClick={() => window.open(meeting.meeting_url, '_blank', 'width=1200,height=800')}
                                                                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                                                    isHappeningNow ? 'bg-green-600 text-white hover:bg-green-700 animate-pulse' :
                                                                    isUpcoming ? 'bg-blue-600 text-white hover:bg-blue-700' :
                                                                    'bg-gray-600 text-white hover:bg-gray-700'
                                                                }`}
                                                            >
                                                                <Video className="w-4 h-4" />
                                                                {isHappeningNow ? 'Join Now' : 'Join Meeting'}
                                                                <ExternalLink className="w-3 h-3" />
                                                            </button>
                                                            {isHappeningNow && (
                                                                <span className="text-xs text-green-600 font-medium animate-pulse">
                                                                    🔴 Live
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                    
                                                    {/* Show "Meeting Ended" message for completed meetings */}
                                                    {hasEnded && meeting.status === 'completed' && (
                                                        <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                                                            <CheckCircle className="w-4 h-4" />
                                                            <span>Meeting ended</span>
                                                            {meeting.meeting_url && (
                                                                <span className="text-xs text-gray-500">
                                                                    (Video call closed)
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                        
                                        {/* Show More Button */}
                                        {meetings.length > 3 && (
                                            <button 
                                                onClick={() => setShowScheduledMeetings(true)}
                                                className="w-full p-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200 hover:border-blue-300"
                                            >
                                                View All {meetings.length} Meetings
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-gray-500">
                                        <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                        <p>No upcoming meetings</p>
                                        {canCreateMeetings && (
                                            <button 
                                                onClick={() => setShowMeetingScheduler(true)}
                                                className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
                                            >
                                                Schedule your first meeting
                                            </button>
                                        )}
                                    </div>
                                )}
                                </div>
                            </div>
                        )}

                        {/* Git Section */}
                        {activeSection === 'git' && (
                            <GitRepository
                                projectId={project.id}
                                isOwner={isOwner}
                                canManageRepository={canEditStatus}
                            />
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

            {/* Meeting Scheduler Modal */}
            <MeetingSchedulerModal
                projectId={project.id}
                isOpen={showMeetingScheduler}
                onClose={() => setShowMeetingScheduler(false)}
                onMeetingCreated={async () => {
                    // Refresh meetings data
                    if (!projectId) return;
                    setMeetingsLoading(true);
                    try {
                        const projectMeetings = await meetingService.getProjectMeetings(projectId, true);
                        setMeetings(projectMeetings);
                        const notifications = await meetingService.getMeetingNotifications(projectId);
                        setMeetingNotifications(notifications);
                    } catch (error) {
                        console.error('Error loading meetings:', error);
                    } finally {
                        setMeetingsLoading(false);
                    }
                }}
            />

            {/* Scheduled Meetings Modal */}
            <ScheduledMeetingsModal
                projectId={project.id}
                isOpen={showScheduledMeetings}
                onClose={() => setShowScheduledMeetings(false)}
                userRole={userRole}
                canCreateMeetings={canCreateMeetings}
            />
        </Layout>
    );
} 