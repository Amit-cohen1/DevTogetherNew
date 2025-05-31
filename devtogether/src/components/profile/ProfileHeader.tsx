import React from 'react'
import { User } from '../../types/database'
import { Button } from '../ui/Button'
import {
    Edit,
    MapPin,
    Globe,
    Github,
    Linkedin,
    Calendar,
    Building,
    User as UserIcon
} from 'lucide-react'

interface ProfileHeaderProps {
    profile: User
    isOwnProfile: boolean
    onEditClick: () => void
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
    profile,
    isOwnProfile,
    onEditClick
}) => {
    const displayName = profile.role === 'developer'
        ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
        : profile.organization_name

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long'
        })
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Cover Section */}
            <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>

            {/* Profile Info Section */}
            <div className="px-6 pb-6">
                {/* Avatar and Basic Info */}
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-16 mb-4">
                    <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full bg-white p-1 shadow-lg">
                                {profile.avatar_url ? (
                                    <img
                                        src={profile.avatar_url}
                                        alt={displayName || 'Profile'}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center">
                                        {profile.role === 'developer' ? (
                                            <UserIcon className="w-12 h-12 text-gray-400" />
                                        ) : (
                                            <Building className="w-12 h-12 text-gray-400" />
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Role Badge */}
                            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                                <span className={`
                                    px-3 py-1 text-xs font-medium rounded-full
                                    ${profile.role === 'developer'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-purple-100 text-purple-800'
                                    }
                                `}>
                                    {profile.role === 'developer' ? 'Developer' : 'Organization'}
                                </span>
                            </div>
                        </div>

                        {/* Name and Title */}
                        <div className="mt-4 sm:mt-0">
                            <h1 className="text-2xl font-bold text-gray-900">
                                {displayName || 'Unnamed User'}
                            </h1>
                        </div>
                    </div>

                    {/* Edit Button */}
                    {isOwnProfile && (
                        <Button
                            onClick={onEditClick}
                            variant="outline"
                            className="mt-4 sm:mt-0 self-start sm:self-auto"
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Profile
                        </Button>
                    )}
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                    {/* Location */}
                    {profile.location && (
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{profile.location}</span>
                        </div>
                    )}

                    {/* Website */}
                    {profile.website && (
                        <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-gray-400" />
                            <a
                                href={profile.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:text-blue-800 truncate"
                            >
                                {profile.website.replace(/^https?:\/\//, '')}
                            </a>
                        </div>
                    )}

                    {/* GitHub */}
                    {profile.github && (
                        <div className="flex items-center gap-2">
                            <Github className="w-4 h-4 text-gray-400" />
                            <a
                                href={profile.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:text-blue-800 truncate"
                            >
                                GitHub
                            </a>
                        </div>
                    )}

                    {/* LinkedIn */}
                    {profile.linkedin && (
                        <div className="flex items-center gap-2">
                            <Linkedin className="w-4 h-4 text-gray-400" />
                            <a
                                href={profile.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:text-blue-800 truncate"
                            >
                                LinkedIn
                            </a>
                        </div>
                    )}

                    {/* Member Since */}
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                            Member since {formatDate(profile.created_at)}
                        </span>
                    </div>
                </div>

                {/* Skills (for developers) */}
                {profile.role === 'developer' && profile.skills && profile.skills.length > 0 && (
                    <div className="mt-6">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Skills</h3>
                        <div className="flex flex-wrap gap-2">
                            {profile.skills.map((skill, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
} 