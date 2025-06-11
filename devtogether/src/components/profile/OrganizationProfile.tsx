import React, { useState, useEffect } from 'react'
import { User } from '../../types/database'
import { OrganizationHero } from '../organization/OrganizationHero'
import { ImageGallery } from '../organization/ImageGallery'
import { ProjectShowcase } from '../organization/ProjectShowcase'
import { organizationProfileService } from '../../services/organizationProfileService'
import {
    ExternalLink,
    Globe,
    Building,
    BookOpen,
    Target,
    Users,
    Loader2
} from 'lucide-react'

interface OrganizationProfileProps {
    profile: User
    isOwnProfile: boolean
}

export const OrganizationProfile: React.FC<OrganizationProfileProps> = ({
    profile,
    isOwnProfile
}) => {
    const [profileData, setProfileData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const loadProfileData = async () => {
            try {
                setLoading(true)
                const data = await organizationProfileService.getOrganizationProfileData(profile.id)
                if (data) {
                    setProfileData(data)
                } else {
                    // Fallback to basic profile with empty enhanced features
                    setProfileData({
                        profile,
                        images: [],
                        metrics: [],
                        testimonials: [],
                        projects: [],
                        stats: {
                            totalProjects: 0,
                            activeProjects: 0,
                            completedProjects: 0,
                            totalDevelopers: 0,
                            successRate: 0
                        }
                    })
                }
            } catch (err) {
                console.error('Error loading organization profile data:', err)
                setError('Failed to load profile data')
                // Still show basic profile
                setProfileData({
                    profile,
                    images: [],
                    metrics: [],
                    testimonials: [],
                    projects: [],
                    stats: {
                        totalProjects: 0,
                        activeProjects: 0,
                        completedProjects: 0,
                        totalDevelopers: 0,
                        successRate: 0
                    }
                })
            } finally {
                setLoading(false)
            }
        }

        loadProfileData()
    }, [profile.id])

    const handleImageUpload = async (file: File, category: any, title?: string, description?: string) => {
        try {
            const result = await organizationProfileService.uploadOrganizationImage(
                profile.id,
                file,
                category,
                title,
                description
            )

            if (result.success && result.image) {
                // Refresh profile data to show new image
                const updatedData = await organizationProfileService.getOrganizationProfileData(profile.id)
                if (updatedData) {
                    setProfileData(updatedData)
                }
            } else {
                throw new Error(result.error || 'Upload failed')
            }
        } catch (error) {
            console.error('Image upload failed:', error)
            throw error
        }
    }

    const handleImageDelete = async (imageId: string) => {
        try {
            const result = await organizationProfileService.deleteOrganizationImage(imageId)

            if (result.success) {
                // Remove image from local state
                setProfileData((prev: any) => ({
                    ...prev,
                    images: prev.images.filter((img: any) => img.id !== imageId)
                }))
            } else {
                throw new Error(result.error || 'Delete failed')
            }
        } catch (error) {
            console.error('Image delete failed:', error)
            throw error
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                    <p className="text-gray-600">Loading organization profile...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        )
    }

    if (!profileData) {
        return null
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <OrganizationHero
                profile={profileData.profile}
                stats={profileData.stats}
                isOwnProfile={isOwnProfile}
            />

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* About Section */}
                {profileData.profile.bio && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-purple-600" />
                            About Our Organization
                        </h2>
                        <div className="prose prose-gray max-w-none">
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line break-words">
                                {profileData.profile.bio}
                            </p>
                        </div>
                    </div>
                )}

                {/* Mission & Impact Section for organizations without bio */}
                {!profileData.profile.bio && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Target className="w-5 h-5 text-purple-600" />
                            Our Mission
                        </h2>
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <p className="text-purple-800 text-sm">
                                We're committed to making a positive impact through technology and collaboration with talented developers.
                            </p>
                        </div>
                    </div>
                )}

                {/* Image Gallery */}
                <ImageGallery
                    images={profileData.images || []}
                    isOwnProfile={isOwnProfile}
                    onImageUpload={isOwnProfile ? handleImageUpload : undefined}
                    onImageDelete={isOwnProfile ? handleImageDelete : undefined}
                />

                {/* Project Showcase */}
                <ProjectShowcase
                    projects={profileData.projects || []}
                    isOwnProfile={isOwnProfile}
                />

                {/* Organization Details */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Building className="w-5 h-5 text-purple-600" />
                        Organization Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Organization Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Organization Name
                            </label>
                            <p className="text-gray-900 bg-gray-50 p-3 rounded-lg border">
                                {profileData.profile.organization_name || 'Not specified'}
                            </p>
                        </div>

                        {/* Location */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Location
                            </label>
                            <p className="text-gray-900 bg-gray-50 p-3 rounded-lg border">
                                {profileData.profile.location || 'Not specified'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Website & Links Section */}
                {(profileData.profile.website || profileData.profile.linkedin) && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Connect With Us
                        </h2>
                        <div className="space-y-3">
                            {profileData.profile.website && (
                                <a
                                    href={profileData.profile.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors group"
                                >
                                    <div className="flex-shrink-0">
                                        <Globe className="w-6 h-6 text-gray-400 group-hover:text-purple-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 group-hover:text-purple-800">
                                            Organization Website
                                        </p>
                                        <p className="text-sm text-gray-500 truncate">
                                            {profileData.profile.website}
                                        </p>
                                    </div>
                                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-purple-600" />
                                </a>
                            )}

                            {profileData.profile.linkedin && (
                                <a
                                    href={profileData.profile.linkedin}
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

                {/* Collaboration Opportunities */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-purple-600" />
                        Working With Developers
                    </h2>
                    <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
                        <h3 className="font-medium text-gray-900 mb-2">
                            We're looking for passionate developers!
                        </h3>
                        <p className="text-gray-700 text-sm mb-4">
                            Join our mission and gain real-world experience while making a meaningful impact.
                            We offer mentorship, skill development, and the opportunity to work on projects
                            that matter.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                                Mentorship Available
                            </span>
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                Real-world Projects
                            </span>
                            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                Portfolio Building
                            </span>
                        </div>
                    </div>
                </div>

                {/* Empty State for Own Profile */}
                {isOwnProfile && !profileData.profile.bio && !profileData.profile.website && profileData.images.length === 0 && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="text-center py-8">
                            <Building className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Complete Your Organization Profile
                            </h3>
                            <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                Add your organization's mission, website, and photos to help developers
                                understand your work and get excited about collaborating with you.
                            </p>
                            <button
                                onClick={() => {/* This will be handled by parent component */ }}
                                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                            >
                                <Building className="w-4 h-4 mr-2" />
                                Edit Organization Profile
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
} 