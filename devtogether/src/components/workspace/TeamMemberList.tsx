import React from 'react';
import { User, Crown, Mail, ExternalLink, Shield, Star, Clock } from 'lucide-react';
import { TeamMember } from '../../services/workspaceService';

interface TeamMemberListProps {
    projectId: string;
    teamMembers: TeamMember[];
    currentUserRole: 'organization' | 'developer' | 'admin' | null;
}

export default function TeamMemberList({ teamMembers, currentUserRole }: TeamMemberListProps) {
    const organizationMembers = teamMembers.filter(member => member.role === 'organization');
    const developerMembers = teamMembers.filter(member => member.role === 'developer');

    const formatJoinDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const MemberCard = ({ member }: { member: TeamMember }) => {
        // Enhanced display name logic - now shows private profiles to team members
        const displayName = member.role === 'organization'
            ? member.user.organization_name || 'Unnamed Organization'
            : `${member.user.first_name || ''} ${member.user.last_name || ''}`.trim() || 'Unnamed User';

        // Enhanced privacy display - shows when profile is private but still visible to team
        const isPrivateProfile = member.user.is_public === false;

        return (
            <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="relative">
                        {member.user.avatar_url ? (
                            <img
                                src={member.user.avatar_url}
                                alt={displayName}
                                className="w-12 h-12 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                                <User className="w-6 h-6 text-gray-500" />
                            </div>
                        )}

                        {/* Role indicator */}
                        {member.role === 'organization' && (
                            <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1">
                                <Crown className="w-3 h-3 text-white" />
                            </div>
                        )}

                        {/* Status manager indicator */}
                        {member.status_manager && member.role === 'developer' && (
                            <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-1">
                                <Shield className="w-3 h-3 text-white" />
                            </div>
                        )}

                        {/* Online status indicator */}
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${member.status === 'active' ? 'bg-green-400' : 'bg-gray-400'
                            }`} />
                    </div>

                    {/* Member info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-gray-900 truncate">
                                {displayName}
                            </h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${member.role === 'organization'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                                }`}>
                                {member.role === 'organization' ? 'Organization' : 'Developer'}
                            </span>
                            {member.status_manager && member.role !== 'organization' && (
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 flex items-center gap-1">
                                    <Shield className="w-3 h-3" />
                                    Status Manager
                                </span>
                            )}
                            {/* Privacy indicator for team context */}
                            {isPrivateProfile && (
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 flex items-center gap-1" title="Private profile - visible to team members only">
                                    <Shield className="w-3 h-3" />
                                    Private
                                </span>
                            )}
                        </div>

                        <p className="text-sm text-gray-600 mb-2">
                            {member.user.email}
                        </p>

                        {member.user.location && (
                            <p className="text-sm text-gray-500 mb-2">
                                📍 {member.user.location}
                            </p>
                        )}

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Joined {formatJoinDate(member.joinedAt)}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${member.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                                }`}>
                                {member.status}
                            </span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        {member.user.email && (
                            <button
                                onClick={() => window.location.href = `mailto:${member.user.email}`}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Send email"
                            >
                                <Mail className="w-4 h-4" />
                            </button>
                        )}

                        {/* Enhanced profile link with team context */}
                        <button
                            onClick={() => {
                                // Use security string URL if available, fallback to regular profile
                                const profileUrl = member.user.security_string 
                                    ? `/profile/${member.user.id}-${member.user.security_string}`
                                    : `/profile/${member.user.id}`;
                                window.open(profileUrl, '_blank');
                            }}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="View profile"
                        >
                            <ExternalLink className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Enhanced skills display with privacy context */}
                {member.role === 'developer' && member.user.skills && member.user.skills.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex flex-wrap gap-1">
                            {member.user.skills.slice(0, 4).map((skill, index) => (
                                <span
                                    key={index}
                                    className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-md"
                                >
                                    {skill}
                                </span>
                            ))}
                            {member.user.skills.length > 4 && (
                                <span className="px-2 py-1 text-xs font-medium text-gray-500 rounded-md">
                                    +{member.user.skills.length - 4} more
                                </span>
                            )}
                        </div>
                        {isPrivateProfile && (
                            <p className="text-xs text-purple-600 mt-1">
                                Skills visible to team members
                            </p>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Organization section */}
            {organizationMembers.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Crown className="w-5 h-5 text-yellow-500" />
                        Organization
                    </h3>
                    <div className="space-y-3">
                        {organizationMembers.map(member => (
                            <MemberCard key={member.id} member={member} />
                        ))}
                    </div>
                </div>
            )}

            {/* Developers section */}
            {developerMembers.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-500" />
                        Development Team ({developerMembers.length})
                    </h3>
                    <div className="space-y-3">
                        {developerMembers.map(member => (
                            <MemberCard key={member.id} member={member} />
                        ))}
                    </div>
                </div>
            )}

            {/* Empty state */}
            {teamMembers.length === 0 && (
                <div className="text-center py-8">
                    <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No team members found</p>
                </div>
            )}

            {/* Team privacy notice */}
            {teamMembers.some(member => member.user.is_public === false) && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-purple-600 mt-0.5" />
                        <div>
                            <h3 className="font-medium text-purple-800 mb-1">
                                Team Privacy Notice
                            </h3>
                            <p className="text-sm text-purple-700">
                                Some team members have private profiles. As a team member, you can see their information here, 
                                but their profiles won't appear in public discovery.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 