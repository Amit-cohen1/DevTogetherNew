import React from 'react'
import { User } from '../../types/database'
import {
    ExternalLink,
    Github,
    Globe,
    Code,
    BookOpen,
    Trophy
} from 'lucide-react'

interface DeveloperProfileProps {
    profile: User
    isOwnProfile: boolean
}

export const DeveloperProfile: React.FC<DeveloperProfileProps> = ({
    profile,
    isOwnProfile
}) => {
    return (
        <div className="space-y-6">
            {/* About Section */}
            {profile.bio && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                        About
                    </h2>
                    <div className="prose prose-gray max-w-none">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line break-words">
                            {profile.bio}
                        </p>
                    </div>
                </div>
            )}

            {/* Skills Section */}
            {profile.skills && profile.skills.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Code className="w-5 h-5 text-blue-600" />
                        Technical Skills
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {profile.skills.map((skill, index) => (
                            <div
                                key={index}
                                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-center"
                            >
                                <span className="text-sm font-medium text-gray-700">
                                    {skill}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Portfolio Section */}
            {profile.portfolio && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-blue-600" />
                        Portfolio
                    </h2>
                    <div className="space-y-4">
                        <a
                            href={profile.portfolio}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                        >
                            <div className="flex-shrink-0">
                                <Globe className="w-6 h-6 text-gray-400 group-hover:text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 group-hover:text-blue-800">
                                    Portfolio Website
                                </p>
                                <p className="text-sm text-gray-500 truncate">
                                    {profile.portfolio}
                                </p>
                            </div>
                            <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                        </a>
                    </div>
                </div>
            )}

            {/* Social Links Section */}
            {(profile.github || profile.linkedin) && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Connect With Me
                    </h2>
                    <div className="space-y-3">
                        {profile.github && (
                            <a
                                href={profile.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-gray-800 hover:bg-gray-50 transition-colors group"
                            >
                                <Github className="w-5 h-5 text-gray-600 group-hover:text-gray-800" />
                                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                                    GitHub Profile
                                </span>
                                <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
                            </a>
                        )}

                        {profile.linkedin && (
                            <a
                                href={profile.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-colors group"
                            >
                                <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">in</span>
                                </div>
                                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">
                                    LinkedIn Profile
                                </span>
                                <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
                            </a>
                        )}
                    </div>
                </div>
            )}

            {/* Empty State for Own Profile */}
            {isOwnProfile && !profile.bio && (!profile.skills || profile.skills.length === 0) && !profile.portfolio && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="text-center py-8">
                        <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Complete Your Profile
                        </h3>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                            Add your bio, skills, and portfolio links to help organizations
                            discover your talents and connect with you.
                        </p>
                        <button
                            onClick={() => {/* This will be handled by parent component */ }}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Code className="w-4 h-4 mr-2" />
                            Add Profile Information
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
} 