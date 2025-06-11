import React from 'react'
import { User } from '../../types/database'
import {
    Building,
    MapPin,
    Users,
    Award,
    ExternalLink,
    Globe,
    Mail,
    Star
} from 'lucide-react'

interface OrganizationHeroProps {
    profile: User
    stats: {
        totalProjects: number
        activeProjects: number
        completedProjects: number
        totalDevelopers: number
        successRate: number
    }
    isOwnProfile?: boolean
}

export const OrganizationHero: React.FC<OrganizationHeroProps> = ({
    profile,
    stats,
    isOwnProfile = false
}) => {
    const handleContactClick = () => {
        if (profile.website) {
            window.open(profile.website, '_blank', 'noopener,noreferrer')
        }
    }

    const handleViewProjectsClick = () => {
        // Scroll to projects section or navigate to projects
        const projectsSection = document.getElementById('organization-projects')
        if (projectsSection) {
            projectsSection.scrollIntoView({ behavior: 'smooth' })
        }
    }

    return (
        <div className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-blue-800 text-white overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-transparent"></div>

            {/* Content */}
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    {/* Organization Info */}
                    <div className="space-y-6">
                        {/* Avatar and Name */}
                        <div className="flex items-start gap-6">
                            <div className="flex-shrink-0">
                                <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 overflow-hidden">
                                    {profile.avatar_url ? (
                                        <img
                                            src={profile.avatar_url}
                                            alt={profile.organization_name || 'Organization'}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Building className="w-10 h-10 text-white/70" />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                                    {profile.organization_name || 'Organization'}
                                </h1>
                                {profile.location && (
                                    <div className="flex items-center gap-2 text-white/90 mb-4">
                                        <MapPin className="w-5 h-5" />
                                        <span className="text-lg">{profile.location}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Mission Statement */}
                        <div className="space-y-4">
                            {profile.bio ? (
                                <p className="text-lg lg:text-xl leading-relaxed text-white/95">
                                    {profile.bio.length > 200 ? `${profile.bio.substring(0, 200)}...` : profile.bio}
                                </p>
                            ) : (
                                <p className="text-lg lg:text-xl leading-relaxed text-white/95">
                                    Join us in creating meaningful technology solutions that make a real impact
                                    in communities around the world.
                                </p>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={handleViewProjectsClick}
                                className="inline-flex items-center justify-center px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-purple-900 font-semibold rounded-lg transition-colors shadow-lg"
                            >
                                <Users className="w-5 h-5 mr-2" />
                                View Open Projects
                            </button>

                            {profile.website && (
                                <button
                                    onClick={handleContactClick}
                                    className="inline-flex items-center justify-center px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors border border-white/30 backdrop-blur-sm"
                                >
                                    <Globe className="w-5 h-5 mr-2" />
                                    Visit Website
                                    <ExternalLink className="w-4 h-4 ml-2" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Statistics Dashboard */}
                    <div className="lg:pl-8">
                        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 lg:p-8">
                            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                                <Award className="w-6 h-6 text-yellow-400" />
                                Impact & Achievements
                            </h3>

                            <div className="grid grid-cols-2 gap-6">
                                {/* Total Projects */}
                                <div className="text-center">
                                    <div className="text-3xl lg:text-4xl font-bold text-yellow-400 mb-1">
                                        {stats.totalProjects}
                                    </div>
                                    <div className="text-sm lg:text-base text-white/80">
                                        Total Projects
                                    </div>
                                </div>

                                {/* Success Rate */}
                                <div className="text-center">
                                    <div className="text-3xl lg:text-4xl font-bold text-green-400 mb-1">
                                        {stats.successRate}%
                                    </div>
                                    <div className="text-sm lg:text-base text-white/80">
                                        Success Rate
                                    </div>
                                </div>

                                {/* Developers Collaborated */}
                                <div className="text-center">
                                    <div className="text-3xl lg:text-4xl font-bold text-blue-300 mb-1">
                                        {stats.totalDevelopers}
                                    </div>
                                    <div className="text-sm lg:text-base text-white/80">
                                        Developers
                                    </div>
                                </div>

                                {/* Active Projects */}
                                <div className="text-center">
                                    <div className="text-3xl lg:text-4xl font-bold text-orange-400 mb-1">
                                        {stats.activeProjects}
                                    </div>
                                    <div className="text-sm lg:text-base text-white/80">
                                        Active Now
                                    </div>
                                </div>
                            </div>

                            {/* Rating Display (if available) */}
                            <div className="mt-6 pt-6 border-t border-white/20">
                                <div className="flex items-center justify-center gap-2">
                                    <div className="flex gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-5 h-5 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-white/30'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-white/90 text-sm ml-2">
                                        4.8 organization rating
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Info Bar */}
                <div className="mt-8 lg:mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-white mb-1">
                            {new Date().getFullYear() - 2020}+
                        </div>
                        <div className="text-sm text-white/80">Years Active</div>
                    </div>

                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-white mb-1">
                            {stats.completedProjects}
                        </div>
                        <div className="text-sm text-white/80">Completed</div>
                    </div>

                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-white mb-1">
                            Remote
                        </div>
                        <div className="text-sm text-white/80">Work Style</div>
                    </div>
                </div>
            </div>
        </div>
    )
} 