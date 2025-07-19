import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { AuthService } from '../services/auth'
import { profileService } from '../services/profileService'
import { projectService } from '../services/projects'
import { Button } from '../components/ui/Button'
import { Layout } from '../components/layout'
import { ProfileHeader } from '../components/profile'
import EditProfileInline from '../components/profile/EditProfileInline'
import { DeveloperRatingDisplay } from '../components/profile/DeveloperRatingDisplay'
import { DeveloperFeedbackControls } from '../components/profile/DeveloperFeedbackControls'
import { ShareProfile } from '../components/profile/ShareProfile'
import { User, ProjectWithTeamMembers } from '../types/database'
import { Loader2, AlertCircle, Pencil, Calendar, MapPin, Globe, Github, Linkedin, Mail, Briefcase, X, Plus, Users, Award, Building, Code, Zap, Star, Trophy, ExternalLink, Clock, FolderOpen, Rocket, Target, Shield, Eye, ChevronRight, CheckCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toastService } from '../services/toastService'

const POPULAR_SKILLS = [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java',
    'HTML/CSS', 'Vue.js', 'Angular', 'Express.js', 'MongoDB', 'PostgreSQL',
    'Git', 'Docker', 'AWS', 'Firebase', 'GraphQL', 'REST APIs'
]

const ProfilePage: React.FC = () => {
    const { userIdWithSecurity } = useParams<{ userIdWithSecurity: string }>()
    const navigate = useNavigate()
    const { user: currentUser, profile: currentProfile, updateProfile } = useAuth()

    const [profile, setProfile] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [editMode, setEditMode] = useState(false)
    const [selectedSkills, setSelectedSkills] = useState<string[]>([])
    const [customSkill, setCustomSkill] = useState('')
    const [isGuestAccess, setIsGuestAccess] = useState(false)
    
    // NEW: Project showcase and feedback states
    const [developerProjects, setDeveloperProjects] = useState<ProjectWithTeamMembers[]>([])
    const [projectsLoading, setProjectsLoading] = useState(false)
    const [showAllProjects, setShowAllProjects] = useState(false)
    
    // NEW: Rating data states
    const [ratingStats, setRatingStats] = useState<any>(null)
    const [projectPortfolio, setProjectPortfolio] = useState<any[]>([])
    const [ratingLoading, setRatingLoading] = useState(false)

    // Parse security string URL format: userId-securityString
    const parseUserIdAndSecurity = (urlParam: string) => {
        if (!urlParam) return { userId: null, securityString: null }
        
        const lastDashIndex = urlParam.lastIndexOf('-')
        if (lastDashIndex === -1) {
            // Old format: just userId
            return { userId: urlParam, securityString: null }
        }
        
        const userId = urlParam.substring(0, lastDashIndex)
        const securityString = urlParam.substring(lastDashIndex + 1)
        return { userId, securityString }
    }

    const { userId, securityString } = parseUserIdAndSecurity(userIdWithSecurity || '')

    // Determine if viewing own profile
    const isOwnProfile = !userId || userId === currentUser?.id

    const {
        register,
        handleSubmit,
        formState: { errors, isDirty },
        setValue,
        reset,
        watch
    } = useForm({
        defaultValues: {
            first_name: '',
            last_name: '',
            organization_name: '',
            bio: '',
            location: '',
            website: '',
            portfolio: '',
            github: '',
            linkedin: ''
        }
    })

    useEffect(() => {
        const loadProfile = async () => {
            try {
                setLoading(true)
                setError(null)

                if (isOwnProfile) {
                    // User viewing their own profile
                    if (currentProfile) {
                        setProfile(currentProfile)
                        setIsGuestAccess(false)
                    } else {
                        setError('Profile not found')
                    }
                } else if (userId) {
                    // Viewing another user's profile
                    if (securityString) {
                        // Security string URL - supports guest access
                        try {
                            const userProfile = await profileService.getProfileBySecurityString(userId, securityString)
                            setProfile(userProfile)
                            setIsGuestAccess(!currentUser) // Guest if no current user
                        } catch (err) {
                            if (err instanceof Error && err.message.includes('not found')) {
                                setError('Profile not found or link has expired')
                } else {
                                setError('Unable to access this profile')
                            }
                        }
                    } else if (currentUser) {
                        // Legacy format for authenticated users only
                        const { profile: userProfile, error: profileError } = await AuthService.getUserProfile(userId)
                    if (profileError) {
                        setError(profileError.message)
                    } else {
                        setProfile(userProfile)
                            setIsGuestAccess(false)
                        }
                    } else {
                        // Guest trying to access profile without security string
                        setError('Profile access requires a valid link')
                    }
                } else {
                    setError('Profile not found')
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load profile')
            } finally {
                setLoading(false)
            }
        }
        loadProfile()
    }, [userId, securityString, currentProfile, isOwnProfile, currentUser])

    // NEW: Load developer projects for showcase (for developers AND admins)
    useEffect(() => {
        const loadDeveloperProjects = async () => {
            if (profile && (profile.role === 'developer' || profile.role === 'admin')) {
                setProjectsLoading(true)
                try {
                    const projects = await projectService.getDeveloperProjectsWithTeamMembers(profile.id)
                    setDeveloperProjects(projects)
                } catch (error) {
                    console.error('Error loading developer projects:', error)
                } finally {
                    setProjectsLoading(false)
                }
            }
        }
        loadDeveloperProjects()
    }, [profile])

    // NEW: Load rating data and project portfolio for developers AND admins
    useEffect(() => {
        const loadRatingData = async () => {
            if (profile && (profile.role === 'developer' || profile.role === 'admin')) {
                console.log('🌟 Loading rating data for user:', profile.id, 'role:', profile.role, 'email:', profile.email)
                setRatingLoading(true)
                try {
                    const [stats, portfolio] = await Promise.all([
                        profileService.getDeveloperRatingStats(profile.id),
                        profileService.getDeveloperProjectPortfolio(profile.id)
                    ])
                    
                    console.log('📊 Rating stats loaded:', stats)
                    console.log('📁 Project portfolio loaded:', portfolio)
                    
                    setRatingStats(stats)
                    setProjectPortfolio(portfolio)
                    
                    // Update the profile with rating data
                    if (stats && stats.average_rating) {
                        setProfile(prev => prev ? {
                            ...prev,
                            current_rating: stats.average_rating,
                            total_stars_earned: stats.total_rating
                        } : null)
                    }
                } catch (error) {
                    console.error('❌ Error loading rating data for user:', profile?.id, 'role:', profile?.role, 'error:', error)
                } finally {
                    setRatingLoading(false)
                }
            } else {
                console.log('⏭️ Skipping rating data load for user:', profile?.id, 'role:', profile?.role)
            }
        }
        loadRatingData()
    }, [profile?.id]) // Only depend on profile.id to avoid infinite loops

    // Reset form when entering edit mode or profile changes
    useEffect(() => {
        if (profile) {
            reset({
                first_name: profile.first_name || '',
                last_name: profile.last_name || '',
                organization_name: profile.organization_name || '',
                bio: profile.bio || '',
                location: profile.location || '',
                website: profile.website || '',
                portfolio: profile.portfolio || '',
                github: profile.github || '',
                linkedin: profile.linkedin || ''
            })
            setSelectedSkills(profile.skills || [])
            setCustomSkill('')
        }
    }, [profile, reset])

    const handleProfileUpdate = (updatedProfile: User) => {
        setProfile(updatedProfile)
        setEditMode(false)
    }

    const handleSkillToggle = (skill: string) => {
        const newSkills = selectedSkills.includes(skill)
            ? selectedSkills.filter(s => s !== skill)
            : [...selectedSkills, skill]
        setSelectedSkills(newSkills)
    }

    const handleAddCustomSkill = () => {
        if (customSkill.trim() && !selectedSkills.includes(customSkill.trim())) {
            setSelectedSkills([...selectedSkills, customSkill.trim()])
            setCustomSkill('')
        }
    }

    const onSave = handleSubmit(async (data) => {
        const updateData: Partial<User> = {
            ...data,
            skills: selectedSkills
        }

        // Remove empty strings to avoid overwriting with blanks
        Object.keys(updateData).forEach((key) => {
            const k = key as keyof typeof updateData
            if (updateData[k] === '') delete updateData[k]
        })

        const { success, error } = await updateProfile(updateData)

        if (success) {
            handleProfileUpdate({ ...(profile as User), ...updateData })
            setEditMode(false)
            // Show success feedback
            if (profile?.role === 'admin') {
                toastService.success('✅ Admin profile updated successfully! Your technical skills and information are now visible to the community.')
            } else {
                toastService.success('✅ Profile updated successfully!')
            }
        } else {
            toastService.error('❌ ' + (error || 'Failed to update profile. Please try again.'))
        }
    })

    const handleCancel = () => {
        setEditMode(false)
        // Reset form and skills to original values
        if (profile) {
            reset({
                first_name: profile.first_name || '',
                last_name: profile.last_name || '',
                organization_name: profile.organization_name || '',
                bio: profile.bio || '',
                location: profile.location || '',
                website: profile.website || '',
                portfolio: profile.portfolio || '',
                github: profile.github || '',
                linkedin: profile.linkedin || ''
            })
            setSelectedSkills(profile.skills || [])
            setCustomSkill('')
        }
    }

    // Helper functions
    const getDisplayName = () => {
        if (profile?.role === 'developer' || profile?.role === 'admin') {
            return `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
        }
        return profile?.organization_name || ''
    }

    const getInitials = () => {
        if (profile?.role === 'developer' || profile?.role === 'admin') {
            return `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`
        }
        return profile?.organization_name?.[0] || ''
    }

    const hasLocation = profile?.location && profile.location.trim() && profile.location.toLowerCase() !== 'undefined'

    // NEW: Project showcase component for visitors
    const ProjectShowcase = () => {
        if (!profile || (profile.role !== 'developer' && profile.role !== 'admin') || developerProjects.length === 0) return null

        const projectsToShow = showAllProjects ? developerProjects : developerProjects.slice(0, 3)

        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <FolderOpen className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Project Portfolio
                                </h2>
                                <p className="text-sm text-gray-600">
                                    {developerProjects.length} project{developerProjects.length !== 1 ? 's' : ''} completed
                                </p>
                            </div>
                        </div>
                        {developerProjects.length > 3 && (
                            <button
                                onClick={() => setShowAllProjects(!showAllProjects)}
                                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                            >
                                {showAllProjects ? 'Show Less' : `View All (${developerProjects.length})`}
                            </button>
                        )}
                    </div>
                </div>

                <div className="p-6">
                    {projectsLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="animate-pulse bg-gray-200 h-32 rounded-lg" />
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {projectsToShow.map((project) => (
                                <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 text-lg mb-1">
                                                {project.title}
                                            </h3>
                                            <p className="text-sm text-gray-600 mb-2">
                                                {project.organization?.organization_name}
                                            </p>
                                            <p className="text-gray-700 text-sm leading-relaxed line-clamp-2">
                                                {project.description}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2 ml-4">
                                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                                                project.status === 'in_progress' ? 'bg-green-100 text-green-800' :
                                                project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {project.status}
                                            </span>
                                            <span className={`px-2 py-1 text-xs rounded ${
                                                project.difficulty_level === 'beginner' ? 'bg-green-100 text-green-700' :
                                                project.difficulty_level === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                                {project.difficulty_level}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Technology Stack */}
                                    {project.technology_stack && project.technology_stack.length > 0 && (
                                        <div className="mb-3">
                                            <div className="flex flex-wrap gap-2">
                                                {project.technology_stack.slice(0, 4).map((tech, idx) => (
                                                    <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md border border-blue-200">
                                                        {tech}
                                                    </span>
                                                ))}
                                                {project.technology_stack.length > 4 && (
                                                    <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-md">
                                                        +{project.technology_stack.length - 4} more
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <Clock className="w-3 h-3" />
                                            {new Date(project.created_at).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {project.applications && project.applications.length > 1 && (
                                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Users className="w-3 h-3" />
                                                    {project.applications.length} developers
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        )
    }

    // NEW: Achievement badges component
    const AchievementBadges = () => {
        if (profile?.role !== 'developer') return null

        const achievements = []
        
        // Calculate achievements based on data
        if (developerProjects.length >= 5) {
            achievements.push({ icon: Trophy, label: 'Veteran Developer', color: 'text-yellow-600', bg: 'bg-yellow-100' })
        }
        if (developerProjects.length >= 1) {
            achievements.push({ icon: Rocket, label: 'Project Completer', color: 'text-blue-600', bg: 'bg-blue-100' })
        }
        if (profile.skills && profile.skills.length >= 10) {
            achievements.push({ icon: Code, label: 'Tech Expert', color: 'text-purple-600', bg: 'bg-purple-100' })
        }
        if (profile.current_rating && profile.current_rating >= 4) {
            achievements.push({ icon: Star, label: 'Top Rated', color: 'text-green-600', bg: 'bg-green-100' })
        }

        if (achievements.length === 0) return null

        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Award className="w-5 h-5 text-yellow-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Achievements</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {achievements.map((achievement, idx) => {
                        const Icon = achievement.icon
                        return (
                            <div key={idx} className={`flex items-center gap-3 p-3 ${achievement.bg} rounded-lg border`}>
                                <Icon className={`w-5 h-5 ${achievement.color}`} />
                                <span className={`font-medium ${achievement.color}`}>
                                    {achievement.label}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="flex items-center gap-3 text-gray-600">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span>Loading profile...</span>
                    </div>
                </div>
            </Layout>
        )
    }

    if (error || !profile) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Not Found</h2>
                        <p className="text-gray-600 mb-6">
                            {error || 'The profile you\'re looking for doesn\'t exist.'}
                        </p>
                        <Button onClick={() => navigate('/')} variant="primary">
                            Go Home
                        </Button>
                    </div>
                </div>
            </Layout>
        )
    }

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50">
                {/* Enhanced Header Section - More Premium Look */}
                <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-900/20" />
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%224%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30" />
                    
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                            
                            {/* Left: Avatar & Basic Info - Enhanced */}
                            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
                                {/* Avatar with Ring */}
                                <div className="flex flex-col items-center">
                                <div className="relative">
                                        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-white ring-4 ring-white/50">
                                        {editMode ? (
                                            <label className="w-full h-full flex items-center justify-center cursor-pointer group">
                                                {profile.avatar_url ? (
                                                    <img
                                                        src={profile.avatar_url}
                                                        alt={getDisplayName()}
                                                        className="w-full h-full object-cover group-hover:opacity-60 transition-opacity"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-200 to-purple-200">
                                                            <span className="text-3xl sm:text-4xl font-bold text-blue-700">
                                                            {getInitials()}
                                                        </span>
                                                    </div>
                                                )}
                                                <input type="file" accept="image/*" className="hidden" />
                                                <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 text-white font-semibold text-xs">Change Photo</span>
                                            </label>
                                        ) : (
                                            profile.avatar_url ? (
                                                <img
                                                    src={profile.avatar_url}
                                                    alt={getDisplayName()}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-200 to-purple-200">
                                                        <span className="text-3xl sm:text-4xl font-bold text-blue-700">
                                                        {getInitials()}
                                                    </span>
                                                </div>
                                            )
                                        )}
                                    </div>
                                    
                                        {/* Status Indicator for Visitors */}
                                        {!isOwnProfile && (
                                            <div className="absolute -top-1 -right-1">
                                                <div className="w-6 h-6 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
                                                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Enhanced Role Badge - Clean Separation */}
                                    <div className="mt-2">
                                        <span className={`inline-flex items-center px-3 py-1 text-xs font-bold rounded-full border-2 border-white shadow-lg whitespace-nowrap ${
                                            profile.role === 'developer' ? 'bg-blue-600 text-white' : 
                                            profile.role === 'admin' ? 'bg-yellow-500 text-black' : 
                                            'bg-purple-600 text-white'
                                        }`}>
                                            {profile.role === 'developer' ? '👨‍💻 Developer' : 
                                             profile.role === 'admin' ? '⚡ Admin' : '🏢 Organization'}
                                        </span>
                                    </div>
                                </div>

                                {/* Name & Enhanced Meta Info */}
                                <div className="text-center sm:text-left sm:pb-2">
                                    <div className="flex flex-col sm:flex-row sm:items-end gap-2 mb-2">
                                        <h1 className="text-3xl sm:text-4xl font-bold text-white">
                                        {getDisplayName()}
                                    </h1>
                                        {/* Rating Display for Developers */}
                                        {profile.role === 'developer' && profile.current_rating && profile.current_rating > 0 && (
                                            <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
                                                <Star className="w-4 h-4 text-yellow-300 fill-current" />
                                                <span className="text-white font-medium text-sm">
                                                    {profile.current_rating.toFixed(1)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-blue-100">
                                        {hasLocation && (
                                            <span className="flex items-center justify-center sm:justify-start gap-1 text-sm">
                                                <MapPin className="w-4 h-4" />
                                                {profile.location}
                                            </span>
                                        )}
                                        <span className="flex items-center justify-center sm:justify-start gap-1 text-sm">
                                            <Calendar className="w-4 h-4" />
                                            Member since {new Date(profile.created_at).toLocaleDateString('en-US', { 
                                                year: 'numeric', 
                                                month: 'long' 
                                            })}
                                        </span>
                                        {/* Privacy Indicator */}
                                        {!isOwnProfile && (
                                            <span className="flex items-center justify-center sm:justify-start gap-1 text-sm bg-white/20 px-2 py-1 rounded-full">
                                                <Eye className="w-3 h-3" />
                                                {profile.is_public ? 'Public Profile' : 'Shared via Link'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right: Enhanced Social Links & Actions */}
                            <div className="flex flex-col items-center lg:items-end gap-4">
                                {/* Social Links */}
                                <div className="flex gap-2">
                                    {profile.website && (
                                        <a
                                            href={profile.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-white/20 hover:bg-white/30 p-3 rounded-full text-white transition-all hover:scale-110"
                                            title="Website"
                                        >
                                            <Globe className="w-5 h-5" />
                                        </a>
                                    )}
                                    {profile.github && (
                                        <a
                                            href={profile.github}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-white/20 hover:bg-white/30 p-3 rounded-full text-white transition-all hover:scale-110"
                                            title="GitHub"
                                        >
                                            <Github className="w-5 h-5" />
                                        </a>
                                    )}
                                    {profile.linkedin && (
                                        <a
                                            href={profile.linkedin}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-white/20 hover:bg-white/30 p-3 rounded-full text-white transition-all hover:scale-110"
                                            title="LinkedIn"
                                        >
                                            <Linkedin className="w-5 h-5" />
                                        </a>
                                    )}
                                    {profile.portfolio && (
                                        <a
                                            href={profile.portfolio}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-white/20 hover:bg-white/30 p-3 rounded-full text-white transition-all hover:scale-110"
                                            title="Portfolio"
                                        >
                                            <ExternalLink className="w-5 h-5" />
                                        </a>
                                    )}
                                </div>

                                {/* Edit Button */}
                                {isOwnProfile && !editMode && (
                                    <button
                                        onClick={() => setEditMode(true)}
                                        className="bg-white hover:bg-gray-50 text-blue-700 border border-blue-200 shadow-xl px-6 py-3 rounded-lg font-medium text-sm transition-all hover:scale-105 flex items-center gap-2"
                                    >
                                        <Pencil className="w-4 h-4" />
                                        Edit Profile
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Enhanced Skills Preview */}
                        {(profile.role === 'developer' || profile.role === 'admin') && (() => {
                            const skillsToShow = editMode ? selectedSkills : (profile.skills || [])
                            return skillsToShow.length > 0 && (
                                <div className="mt-6 pt-6 border-t border-white/20">
                                    <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                                        {skillsToShow.slice(0, editMode ? 15 : 6).map((skill, idx) => (
                                            <span
                                                key={idx}
                                                className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all hover:scale-105 ${
                                                    editMode 
                                                        ? 'bg-green-100 text-green-800 border border-green-300' 
                                                        : 'bg-white/90 text-blue-700 hover:bg-white'
                                                }`}
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                        {skillsToShow.length > (editMode ? 15 : 6) && (
                                            <span className="px-3 py-1.5 bg-white/70 text-blue-700 text-sm font-medium rounded-full">
                                                +{skillsToShow.length - (editMode ? 15 : 6)} more
                                            </span>
                                        )}
                                    </div>
                                    {editMode && (
                                        <p className="text-white/80 text-xs mt-2 text-center lg:text-left">
                                            ✨ Real-time preview of your skills selection
                                        </p>
                                    )}
                                </div>
                            )
                        })()}
                    </div>
                </div>

                {/* Main Content - Enhanced Layout */}
                <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${editMode ? 'pb-24 md:pb-8' : ''}`}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* Main Content Column */}
                        <div className="lg:col-span-2 space-y-8">
                            
                            {editMode ? (
                                /* Edit Mode - Enhanced for Both Developers & Admins */
                                <form onSubmit={onSave} className="space-y-6">

                                    {/* Admin Profile Info Banner */}
                                    {profile.role === 'admin' && (
                                        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
                                            <div className="flex items-start gap-3">
                                                <Shield className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <h4 className="font-semibold text-yellow-800 mb-1">Admin Profile Enhancement</h4>
                                                    <p className="text-sm text-yellow-700">
                                                        As an admin, you can showcase your technical skills and achievements alongside your administrative role. 
                                                        This helps developers and organizations see your technical expertise.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Basic Information */}
                                    <div className="bg-white rounded-lg shadow-sm border p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                                        
                                        {profile.role === 'developer' || profile.role === 'admin' ? (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        First Name *
                                                    </label>
                                                    <input
                                                        {...register('first_name', { required: true })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        placeholder="Enter first name"
                                                    />
                                                    {errors.first_name && (
                                                        <p className="mt-1 text-sm text-red-600">First name is required</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Last Name *
                                                    </label>
                                                    <input
                                                        {...register('last_name', { required: true })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        placeholder="Enter last name"
                                                    />
                                                    {errors.last_name && (
                                                        <p className="mt-1 text-sm text-red-600">Last name is required</p>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Organization Name *
                                                </label>
                                                <input
                                                    {...register('organization_name', { required: true })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="Enter organization name"
                                                />
                                                {errors.organization_name && (
                                                    <p className="mt-1 text-sm text-red-600">Organization name is required</p>
                                                )}
                                            </div>
                                        )}

                                        <div className="mt-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Location
                                            </label>
                                            <input
                                                {...register('location')}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="City, Country"
                                            />
                                        </div>
                                    </div>

                                    {/* Bio */}
                                    <div className="bg-white rounded-lg shadow-sm border p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                            {(profile.role === 'developer' || profile.role === 'admin') ? 'About Me' : 'About the Organization'} *
                                        </h3>
                                        <textarea
                                            {...register('bio', { required: true })}
                                            rows={4}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                                            placeholder={`Tell us about ${(profile.role === 'developer' || profile.role === 'admin') ? 'yourself' : 'your organization'}...`}
                                        />
                                        {errors.bio && (
                                            <p className="mt-1 text-sm text-red-600">Bio is required</p>
                                        )}
                                    </div>

                                    {/* Skills (Developer & Admin) */}
                                    {(profile.role === 'developer' || profile.role === 'admin') && (
                                        <div className="bg-white rounded-lg shadow-sm border p-6">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                                Technical Skills
                                                {profile.role === 'admin' && (
                                                    <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded-full font-normal">
                                                        Admin Profile
                                                    </span>
                                                )}
                                            </h3>
                                            
                                            {/* Popular Skills */}
                                            <div className="mb-4">
                                                <p className="text-sm text-gray-600 mb-3">
                                                    {profile.role === 'admin' 
                                                        ? 'Add your technical skills to showcase your developer expertise:' 
                                                        : 'Select from popular skills:'}
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {POPULAR_SKILLS.map((skill) => (
                                                        <button
                                                            key={skill}
                                                            type="button"
                                                            onClick={() => handleSkillToggle(skill)}
                                                            className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                                                                selectedSkills.includes(skill)
                                                                    ? 'bg-blue-100 border-blue-300 text-blue-700'
                                                                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-blue-50'
                                                            }`}
                                                        >
                                                            {skill}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Custom Skill Input */}
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={customSkill}
                                                    onChange={(e) => setCustomSkill(e.target.value)}
                                                    placeholder="Add a custom skill..."
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomSkill())}
                                                />
                                                <Button
                                                    type="button"
                                                    onClick={handleAddCustomSkill}
                                                    disabled={!customSkill.trim()}
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </Button>
                                            </div>

                                            {/* Selected Skills */}
                                            {selectedSkills.length > 0 && (
                                                <div className="mt-4">
                                                    <p className="text-sm text-gray-600 mb-2">Selected skills:</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {selectedSkills.map((skill, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                                                            >
                                                                {skill}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleSkillToggle(skill)}
                                                                    className="ml-1 text-blue-500 hover:text-blue-700 font-medium"
                                                                >
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Links */}
                                    <div className="bg-white rounded-lg shadow-sm border p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Links</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Website
                                                </label>
                                                <input
                                                    {...register('website')}
                                                    type="url"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="https://yourwebsite.com"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    LinkedIn
                                                </label>
                                                <input
                                                    {...register('linkedin')}
                                                    type="url"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="https://linkedin.com/in/username"
                                                />
                                            </div>
                                            {(profile.role === 'developer' || profile.role === 'admin') && (
                                                <>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            GitHub
                                                        </label>
                                                        <input
                                                            {...register('github')}
                                                            type="url"
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                            placeholder="https://github.com/username"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Portfolio
                                                        </label>
                                                        <input
                                                            {...register('portfolio')}
                                                            type="url"
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                            placeholder="https://yourportfolio.com"
                                                        />
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>



                                    {/* Action Buttons – hidden (replaced by sticky footer for all viewports) */}
                                    <div className="hidden">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleCancel}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={!isDirty && selectedSkills.join(',') === (profile.skills || []).join(',')}
                                        >
                                            Save Changes
                                        </Button>
                                    </div>
                                </form>
                            ) : (
                                /* Enhanced View Mode */
                                <div className="space-y-8">
                                    
                                    {/* Bio/About - Enhanced */}
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                        <div className="flex items-center gap-2 mb-4">
                                            {profile.role === 'developer' ? (
                                                <Users className="w-5 h-5 text-blue-600" />
                                            ) : profile.role === 'admin' ? (
                                                <Shield className="w-5 h-5 text-red-600" />
                                            ) : (
                                                <Building className="w-5 h-5 text-purple-600" />
                                            )}
                                            <h3 className="text-xl font-semibold text-gray-900">
                                                {profile.role === 'developer' ? 'About Me' : 
                                                 profile.role === 'admin' ? 'About Me (Admin)' : 
                                                 'About the Organization'}
                                            </h3>
                                        </div>
                                        <p className="text-gray-700 leading-relaxed whitespace-pre-line text-lg">
                                            {profile.bio || (
                                                <span className="text-gray-400 italic">
                                                    {(profile.role === 'developer' || profile.role === 'admin') ? 'No bio provided.' : 'No description provided.'}
                                                </span>
                                            )}
                                        </p>
                                    </div>

                                    {/* VISITOR MODE: Developer/Admin Rating Display */}
                                    {(profile.role === 'developer' || profile.role === 'admin') && !isOwnProfile && (
                                        <DeveloperRatingDisplay 
                                            userId={profile.id} 
                                            showDetails={true}
                                            className="transform hover:scale-[1.02] transition-transform"
                                        />
                                    )}

                                    {/* VISITOR MODE: Project Showcase */}
                                    {!isOwnProfile && <ProjectShowcase />}

                                    {/* VISITOR MODE: Achievement Badges */}
                                    {!isOwnProfile && <AchievementBadges />}

                                    {/* Technical Skills (Developer/Admin only) - Enhanced */}
                                    {(profile.role === 'developer' || profile.role === 'admin') && profile.skills && profile.skills.length > 0 && (
                                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                            <div className="flex items-center gap-2 mb-6">
                                                <Code className="w-6 h-6 text-blue-600" />
                                                <h3 className="text-xl font-semibold text-gray-900">Technical Expertise</h3>
                                                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">
                                                    {profile.skills.length} skills
                                                </span>
                                            </div>
                                            
                                            {/* Enhanced Skills Grid - Fixed Alignment */}
                                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                                {profile.skills.map((skill, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="group bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3 text-center hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 cursor-default hover:scale-105 hover:shadow-md min-h-[3rem] flex items-center justify-center"
                                                    >
                                                        <div className="flex items-center justify-center gap-2 flex-wrap">
                                                            <Zap className="w-4 h-4 text-blue-600 group-hover:text-blue-700 flex-shrink-0" />
                                                            <span className="font-medium text-blue-800 group-hover:text-blue-900 text-sm leading-tight">
                                                                {skill}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Skills Categories */}
                                            <div className="mt-6 pt-6 border-t border-gray-100">
                                                <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                                                    {profile.skills.some(skill => ['JavaScript', 'TypeScript', 'Python', 'Java'].includes(skill)) && (
                                                        <span className="bg-gray-100 px-3 py-1 rounded-full font-medium">Programming Languages</span>
                                                    )}
                                                    {profile.skills.some(skill => ['React', 'Vue.js', 'Angular'].includes(skill)) && (
                                                        <span className="bg-gray-100 px-3 py-1 rounded-full font-medium">Frontend Frameworks</span>
                                                    )}
                                                    {profile.skills.some(skill => ['Node.js', 'Express.js'].includes(skill)) && (
                                                        <span className="bg-gray-100 px-3 py-1 rounded-full font-medium">Backend Technologies</span>
                                                    )}
                                                    {profile.skills.some(skill => ['MongoDB', 'PostgreSQL'].includes(skill)) && (
                                                        <span className="bg-gray-100 px-3 py-1 rounded-full font-medium">Databases</span>
                                                    )}
                                                    {profile.skills.some(skill => ['AWS', 'Docker', 'Git'].includes(skill)) && (
                                                        <span className="bg-gray-100 px-3 py-1 rounded-full font-medium">DevOps & Tools</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* OWNER MODE: Rating and Projects for own profile */}
                                    {isOwnProfile && (profile.role === 'developer' || profile.role === 'admin') && (
                                        <>
                                            <DeveloperRatingDisplay 
                                                userId={profile.id} 
                                                showDetails={true}
                                            />
                                            <ProjectShowcase />
                                        </>
                                    )}

                                    {/* OWNER MODE: Feedback Controls */}
                                    {isOwnProfile && (profile.role === 'developer' || profile.role === 'admin') && (
                                        <DeveloperFeedbackControls />
                                    )}

                                    {/* Enhanced Professional Highlights with Real Rating Data */}
                                    {(profile.role === 'developer' || profile.role === 'admin') && (
                                        <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 rounded-xl border border-gray-200 p-6">
                                            <div className="flex items-center gap-2 mb-6">
                                                <Trophy className="w-6 h-6 text-purple-600" />
                                                <h3 className="text-xl font-semibold text-gray-900">Achievement Overview</h3>
                                                {ratingLoading && (
                                                    <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                                                )}
                                            </div>
                                            
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                {/* Total Stars */}
                                                <div className="text-center p-4 bg-white rounded-xl border border-yellow-200 shadow-sm hover:shadow-md transition-shadow">
                                                    <div className="flex items-center justify-center mb-2">
                                                        <Star className="w-6 h-6 text-yellow-500 fill-current" />
                                                    </div>
                                                    <div className="text-2xl font-bold text-yellow-600 mb-1">
                                                        {ratingStats?.total_rating || 0}
                                                    </div>
                                                    <div className="text-xs text-yellow-800 font-medium">Total Stars</div>
                                                </div>
                                                
                                                {/* Average Rating */}
                                                <div className="text-center p-4 bg-white rounded-xl border border-purple-200 shadow-sm hover:shadow-md transition-shadow">
                                                    <div className="flex items-center justify-center mb-2">
                                                        <Award className="w-6 h-6 text-purple-500" />
                                                    </div>
                                                    <div className="text-2xl font-bold text-purple-600 mb-1">
                                                        {ratingStats?.average_rating ? ratingStats.average_rating.toFixed(1) : '0.0'}
                                                    </div>
                                                    <div className="text-xs text-purple-800 font-medium">Avg Rating</div>
                                                </div>
                                                
                                                {/* Completed Projects */}
                                                <div className="text-center p-4 bg-white rounded-xl border border-green-200 shadow-sm hover:shadow-md transition-shadow">
                                                    <div className="flex items-center justify-center mb-2">
                                                        <CheckCircle className="w-6 h-6 text-green-500" />
                                                    </div>
                                                    <div className="text-2xl font-bold text-green-600 mb-1">
                                                        {ratingStats?.completed_projects || 0}
                                                    </div>
                                                    <div className="text-xs text-green-800 font-medium">Completed</div>
                                                </div>

                                                {/* Active Projects */}
                                                <div className="text-center p-4 bg-white rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                                                    <div className="flex items-center justify-center mb-2">
                                                        <Clock className="w-6 h-6 text-blue-500" />
                                            </div>
                                                    <div className="text-2xl font-bold text-blue-600 mb-1">
                                                        {projectPortfolio.filter((p: any) => p.project_status === 'open' || p.project_status === 'active').length || 0}
                                                    </div>
                                                    <div className="text-xs text-blue-800 font-medium">Active</div>
                                                </div>
                                            </div>

                                            {/* Rating Breakdown */}
                                            {ratingStats && (ratingStats.submission_stars > 0 || ratingStats.completion_stars > 0) && (
                                                <div className="mt-6 pt-6 border-t border-gray-200">
                                                    <h4 className="text-sm font-medium text-gray-900 mb-3">Star Breakdown</h4>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                                            <span className="text-sm text-blue-800">Application Approved</span>
                                                            <div className="flex items-center gap-1">
                                                                <span className="font-semibold text-blue-900">{ratingStats.submission_stars}</span>
                                                                <Star className="w-4 h-4 text-blue-600 fill-current" />
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                                            <span className="text-sm text-green-800">Project Completed</span>
                                                            <div className="flex items-center gap-1">
                                                                <span className="font-semibold text-green-900">{ratingStats.completion_stars}</span>
                                                                <Star className="w-4 h-4 text-green-600 fill-current" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Enhanced Developer/Admin Projects Showcase with Ratings */}
                                    {(profile.role === 'developer' || profile.role === 'admin') && projectPortfolio && projectPortfolio.length > 0 && (
                                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="flex items-center gap-2">
                                                    <Briefcase className="w-6 h-6 text-green-600" />
                                                    <h3 className="text-xl font-semibold text-gray-900">Project Portfolio</h3>
                                                    <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">
                                                        {projectPortfolio.reduce((sum: number, p: any) => sum + (p.stars_earned || 0), 0)} total stars
                                                    </span>
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {projectPortfolio.length} {projectPortfolio.length === 1 ? 'project' : 'projects'}
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                {projectPortfolio.slice(0, 4).map((project: any) => (
                                                    <div 
                                                        key={project.project_id} 
                                                        className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow bg-gradient-to-br from-white to-gray-50"
                                                    >
                                                        {/* Project Header */}
                                                        <div className="flex items-start justify-between mb-4">
                                                            <div className="flex-1">
                                                                <h4 className="font-semibold text-gray-900 text-lg leading-tight mb-2">
                                                                    {project.project_title}
                                                                </h4>
                                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                    <Building className="w-4 h-4" />
                                                                    <span>{project.organization_name || 'Organization'}</span>
                                                                </div>
                                                            </div>
                                                            
                                                            {/* Project Status & Stars */}
                                                            <div className="flex flex-col items-end gap-2">
                                                                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                                    project.project_status === 'completed' ? 'bg-green-100 text-green-700' :
                                                                    project.project_status === 'open' ? 'bg-blue-100 text-blue-700' :
                                                                    project.project_status === 'active' ? 'bg-purple-100 text-purple-700' :
                                                                    'bg-gray-100 text-gray-700'
                                                                }`}>
                                                                    {project.project_status === 'completed' ? '✅ Completed' :
                                                                     project.project_status === 'open' ? '📢 Open' :
                                                                     project.project_status === 'active' ? '🚀 Active' :
                                                                     project.project_status.charAt(0).toUpperCase() + project.project_status.slice(1)}
                                                                </div>
                                                                
                                                                {/* Stars Earned */}
                                                                {project.stars_earned > 0 && (
                                                                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
                                                                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                                                        <span className="text-xs font-semibold text-yellow-700">{project.stars_earned}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Project Description */}
                                                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                                            {project.project_description}
                                                        </p>

                                                        {/* Team Role & Completion Date */}
                                                        <div className="mb-4">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    {project.is_status_manager ? (
                                                                        <div className="flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-md font-medium">
                                                                            <Shield className="w-3 h-3" />
                                                                            Status Manager
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md font-medium">
                                                                            <Users className="w-3 h-3" />
                                                                            Team Member
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                
                                                                {project.completed_at && (
                                                                    <span className="text-xs text-gray-500">
                                                                        Completed {new Date(project.completed_at).toLocaleDateString()}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Project Avatar */}
                                                        {project.organization_avatar && (
                                                            <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                                                                <img 
                                                                    src={project.organization_avatar} 
                                                                    alt={project.organization_name}
                                                                    className="w-6 h-6 rounded-full object-cover"
                                                                />
                                                                <span className="text-xs text-gray-600">{project.organization_name}</span>
                                                            </div>
                                                        )}
                                                        <div className="flex items-center justify-between text-sm">
                                                            <div className="flex items-center gap-4">
                                                                <div className="flex items-center gap-1 text-gray-500">
                                                                    <Clock className="w-4 h-4" />
                                                                    <span>{project.estimated_duration}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1 text-gray-500">
                                                                    <Users className="w-4 h-4" />
                                                                    <span>{project.applications?.filter((app: any) => app.status === 'accepted').length || 0} members</span>
                                                                </div>
                                                            </div>
                                                            
                                                            {/* Achievement Icons for in_progress projects */}
                                                            {project.status === 'in_progress' && (
                                                                <div className="flex items-center gap-1">
                                                                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                                                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                                                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                                                    <span className="text-xs text-yellow-600 font-medium ml-1">Earned 3★</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Show More Projects Link */}
                                            {developerProjects.length > 4 && (
                                                <div className="mt-6 text-center">
                                                    <button className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-2 mx-auto">
                                                        View all {developerProjects.length} projects
                                                        <ChevronRight className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Organization Summary - Enhanced */}
                                    {profile.role === 'organization' && (
                                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                            <div className="flex items-center gap-2 mb-6">
                                                <Building className="w-6 h-6 text-purple-600" />
                                                <h3 className="text-xl font-semibold text-gray-900">Organization Details</h3>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="space-y-6">
                                                    {hasLocation && (
                                                        <div>
                                                            <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Location</label>
                                                            <p className="text-gray-900 text-lg flex items-center gap-2 mt-1">
                                                                <MapPin className="w-5 h-5 text-gray-400" />
                                                                {profile.location}
                                                            </p>
                                                        </div>
                                                    )}
                                                    
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Member Since</label>
                                                        <p className="text-gray-900 text-lg mt-1">
                                                            {new Date(profile.created_at).toLocaleDateString('en-US', { 
                                                                year: 'numeric', 
                                                                month: 'long',
                                                                day: 'numeric'
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                <div className="space-y-6">
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Organization Name</label>
                                                        <p className="text-gray-900 font-semibold text-lg mt-1">
                                                            {profile.organization_name}
                                                        </p>
                                                    </div>
                                                    
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Status</label>
                                                        <p className="text-green-600 font-medium flex items-center gap-2 text-lg mt-1">
                                                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                                            Active Organization
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Enhanced Sidebar */}
                        <div className="space-y-6">
                            
                            {/* Contact Information - Enhanced */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Mail className="w-5 h-5 text-gray-400" />
                                    Contact Information
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                        <span className="text-gray-700 break-all font-medium">{profile.email}</span>
                                    </div>
                                    
                                    {hasLocation && (
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                            <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                            <span className="text-gray-700 font-medium">{profile.location}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Links - Enhanced */}
                            {(profile.website || profile.portfolio || profile.github || profile.linkedin) && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <Globe className="w-5 h-5 text-gray-400" />
                                        Links & Profiles
                                    </h3>
                                    <div className="space-y-3">
                                        {profile.website && (
                                            <a
                                                href={profile.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 text-blue-600 hover:text-blue-700 transition-all group p-3 bg-blue-50 rounded-lg hover:bg-blue-100"
                                            >
                                                <Globe className="w-5 h-5 flex-shrink-0" />
                                                <span className="group-hover:underline break-all font-medium">Website</span>
                                                <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </a>
                                        )}
                                        
                                        {profile.portfolio && (
                                            <a
                                                href={profile.portfolio}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 text-blue-600 hover:text-blue-700 transition-all group p-3 bg-blue-50 rounded-lg hover:bg-blue-100"
                                            >
                                                <Briefcase className="w-5 h-5 flex-shrink-0" />
                                                <span className="group-hover:underline break-all font-medium">Portfolio</span>
                                                <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </a>
                                        )}
                                        
                                        {profile.github && (
                                            <a
                                                href={profile.github}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 text-blue-600 hover:text-blue-700 transition-all group p-3 bg-blue-50 rounded-lg hover:bg-blue-100"
                                            >
                                                <Github className="w-5 h-5 flex-shrink-0" />
                                                <span className="group-hover:underline break-all font-medium">GitHub</span>
                                                <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </a>
                                        )}
                                        
                                        {profile.linkedin && (
                                            <a
                                                href={profile.linkedin}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 text-blue-600 hover:text-blue-700 transition-all group p-3 bg-blue-50 rounded-lg hover:bg-blue-100"
                                            >
                                                <Linkedin className="w-5 h-5 flex-shrink-0" />
                                                <span className="group-hover:underline break-all font-medium">LinkedIn</span>
                                                <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Share Profile - Enhanced */}
                            {isOwnProfile && (
                                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6">
                                    <ShareProfile userId={profile.id} />
                                </div>
                            )}

                            {/* Call to Action for Visitors */}
                            {!isOwnProfile && !isGuestAccess && profile.role === 'developer' && (
                                <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl border border-green-200 p-6">
                                    <div className="text-center">
                                        <Rocket className="w-8 h-8 text-green-600 mx-auto mb-3" />
                                        <h3 className="font-semibold text-green-900 mb-2">
                                            Interested in working together?
                                        </h3>
                                        <p className="text-green-700 text-sm mb-4">
                                            Connect with {getDisplayName()} through our platform
                                        </p>
                                        <Button
                                            onClick={() => navigate('/projects')}
                                            className="!bg-green-600 hover:!bg-green-700 w-full"
                                        >
                                            View Projects
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sticky Action Buttons for Mobile (Edit Mode Only) */}
                {editMode && (
                    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-xl z-50 p-4">
                        <div className="flex gap-3 max-w-sm mx-auto">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancel}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={onSave}
                                disabled={!isDirty && selectedSkills.join(',') === (profile.skills || []).join(',')}
                                className="flex-1"
                            >
                                Save Changes
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    )
}

export default ProfilePage