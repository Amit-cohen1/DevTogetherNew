import React, { useState, useEffect } from 'react';
import { Users, UserMinus, UserPlus, Activity, TrendingUp, MessageSquare, Clock, Shield, ShieldOff, Star } from 'lucide-react';
import { TeamMember, TeamStats, teamService } from '../../../services/teamService';
import { useAuth } from '../../../contexts/AuthContext';
import TeamActivityFeed from '../../workspace/team/TeamActivityFeed';
import InviteMemberModal from '../../workspace/team/InviteMemberModal';
import OrganizationFeedbackForm from './OrganizationFeedbackForm';

interface TeamManagementProps {
    projectId: string;
    isOwner: boolean;
}

export default function TeamManagement({ projectId, isOwner }: TeamManagementProps) {
    const { user } = useAuth();
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [teamStats, setTeamStats] = useState<TeamStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
    const [promotingMemberId, setPromotingMemberId] = useState<string | null>(null);
    const [feedbackMember, setFeedbackMember] = useState<{ id: string; name: string } | null>(null);

    useEffect(() => {
        loadTeamData();
    }, [projectId]);

    const loadTeamData = async () => {
        try {
            setLoading(true);
            const [members, stats] = await Promise.all([
                teamService.getTeamMembers(projectId),
                teamService.getTeamStats(projectId)
            ]);
            setTeamMembers(members);
            setTeamStats(stats);
        } catch (error) {
            console.error('Error loading team data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveMember = async (memberId: string, userId: string) => {
        if (!user || !isOwner) return;

        const confirmed = window.confirm('Are you sure you want to remove this team member? This action cannot be undone.');
        if (!confirmed) return;

        try {
            setRemovingMemberId(memberId);
            await teamService.removeMember(projectId, userId, user.id);
            await loadTeamData(); // Refresh team data
        } catch (error) {
            console.error('Error removing member:', error);
            alert('Failed to remove team member. Please try again.');
        } finally {
            setRemovingMemberId(null);
        }
    };

    const handleLeaveProject = async () => {
        if (!user) return;

        const confirmed = window.confirm('Are you sure you want to leave this project? You will lose access to the workspace and all project communications.');
        if (!confirmed) return;

        try {
            await teamService.leaveProject(projectId, user.id);
            // Redirect to dashboard or projects page
            window.location.href = '/dashboard';
        } catch (error) {
            console.error('Error leaving project:', error);
            alert('Failed to leave project. Please try again.');
        }
    };

    const handlePromoteDeveloper = async (memberId: string, userId: string) => {
        if (!user || !isOwner) return;

        const confirmed = window.confirm('Promote this developer to status manager? They will be able to update project status and progress.');
        if (!confirmed) return;

        try {
            setPromotingMemberId(memberId);
            await teamService.promoteDeveloper(projectId, userId, user.id);
            await loadTeamData(); // Refresh team data
        } catch (error) {
            console.error('Error promoting developer:', error);
            alert('Failed to promote developer. Please try again.');
        } finally {
            setPromotingMemberId(null);
        }
    };

    const handleDemoteDeveloper = async (memberId: string, userId: string) => {
        if (!user || !isOwner) return;

        const confirmed = window.confirm('Remove status manager permissions from this developer? They will no longer be able to update project status.');
        if (!confirmed) return;

        try {
            setPromotingMemberId(memberId);
            await teamService.demoteDeveloper(projectId, userId, user.id);
            await loadTeamData(); // Refresh team data
        } catch (error) {
            console.error('Error demoting developer:', error);
            alert('Failed to remove status manager permissions. Please try again.');
        } finally {
            setPromotingMemberId(null);
        }
    };

    const getDisplayName = (member: TeamMember) => {
        return member.user.role === 'organization'
            ? member.user.organization_name || 'Organization'
            : `${member.user.first_name || ''} ${member.user.last_name || ''}`.trim() || 'User';
    };

    const formatJoinDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-gray-200 h-24 rounded-lg"></div>
                        ))}
                    </div>
                    <div className="bg-gray-200 h-64 rounded-lg"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Users className="w-6 h-6 text-gray-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Team Management</h2>
                </div>
                {isOwner && (
                    <button
                        onClick={() => setShowInviteModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <UserPlus className="w-4 h-4" />
                        Invite Member
                    </button>
                )}
            </div>

            {/* Team Stats */}
            {teamStats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Users className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Members</p>
                                <p className="text-xl font-semibold text-gray-900">{teamStats.total_members}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Activity className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Recent Activity</p>
                                <p className="text-xl font-semibold text-gray-900">{teamStats.recent_activities}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <MessageSquare className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Messages</p>
                                <p className="text-xl font-semibold text-gray-900">{teamStats.messages_count}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <TrendingUp className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Engagement</p>
                                <p className="text-xl font-semibold text-gray-900">{teamStats.completion_rate}%</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Team Members List */}
            <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
                    <p className="text-sm text-gray-600 mt-1">
                        Manage your project team and member permissions
                    </p>
                </div>

                <div className="divide-y divide-gray-200">
                    {teamMembers.map((member) => (
                        <div key={member.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                                {/* Avatar */}
                                {member.user.avatar_url ? (
                                    <img
                                        src={member.user.avatar_url}
                                        alt={getDisplayName(member)}
                                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0"
                                    />
                                ) : (
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                        <Users className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
                                    </div>
                                )}

                                {/* Member Info */}
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1 sm:mb-0">
                                        <h4 className="font-medium text-gray-900 truncate">
                                            {getDisplayName(member)}
                                        </h4>
                                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${member.role === 'owner'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                {member.role === 'owner' ? 'Owner' : 'Member'}
                                            </span>
                                            {member.status_manager && member.role !== 'owner' && (
                                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 flex items-center gap-1">
                                                    <Shield className="w-3 h-3" />
                                                    <span className="hidden sm:inline">Status Manager</span>
                                                    <span className="sm:hidden">Manager</span>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600 truncate">
                                        {member.user.email}
                                    </p>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1 text-xs text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            Joined {formatJoinDate(member.joined_at)}
                                        </span>
                                        <span className={`text-xs px-2 py-1 rounded-full w-fit ${member.status === 'active'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {member.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions - Mobile Responsive */}
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:ml-4">
                                {isOwner && member.role !== 'owner' && (
                                    <>
                                        {/* Status Manager Toggle */}
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            {!member.status_manager ? (
                                                <button
                                                    onClick={() => handlePromoteDeveloper(member.id, member.user_id)}
                                                    disabled={promotingMemberId === member.id}
                                                    className="flex items-center justify-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 text-sm"
                                                >
                                                    <Shield className="w-4 h-4" />
                                                    <span className="hidden sm:inline">Promote to Status Manager</span>
                                                    <span className="sm:hidden">Promote</span>
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleDemoteDeveloper(member.id, member.user_id)}
                                                    disabled={promotingMemberId === member.id}
                                                    className="flex items-center justify-center gap-2 px-3 py-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-50 text-sm"
                                                >
                                                    <ShieldOff className="w-4 h-4" />
                                                    <span className="hidden sm:inline">Remove Status Manager</span>
                                                    <span className="sm:hidden">Demote</span>
                                                </button>
                                            )}

                                            {/* Remove Member */}
                                            <button
                                                onClick={() => handleRemoveMember(member.id, member.user_id)}
                                                disabled={removingMemberId === member.id}
                                                className="flex items-center justify-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 text-sm"
                                            >
                                                <UserMinus className="w-4 h-4" />
                                                <span className="hidden sm:inline">{removingMemberId === member.id ? 'Removing...' : 'Remove'}</span>
                                                <span className="sm:hidden">{removingMemberId === member.id ? '...' : 'Remove'}</span>
                                            </button>
                                        </div>
                                    </>
                                )}

                                {!isOwner && member.user_id === user?.id && (
                                    <button
                                        onClick={handleLeaveProject}
                                        className="flex items-center justify-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
                                    >
                                        <UserMinus className="w-4 h-4" />
                                        <span>Leave Project</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Team Activity Feed */}
            <TeamActivityFeed projectId={projectId} />

            {/* Invite Member Modal */}
            {showInviteModal && (
                <InviteMemberModal
                    projectId={projectId}
                    onClose={() => setShowInviteModal(false)}
                    onInviteSent={() => {
                        setShowInviteModal(false);
                        loadTeamData();
                    }}
                />
            )}

            {/* Organization Feedback Modal */}
            {feedbackMember && (
                <OrganizationFeedbackForm
                    projectId={projectId}
                    developerId={feedbackMember.id}
                    developerName={feedbackMember.name}
                    onClose={() => setFeedbackMember(null)}
                    onSuccess={() => {
                        setFeedbackMember(null);
                        // Optionally reload team data or show success message
                    }}
                />
            )}
        </div>
    );
} 