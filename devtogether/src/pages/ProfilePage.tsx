import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { AuthService } from '../services/auth'
import { Button } from '../components/ui/Button'
import { Layout } from '../components/layout'
import { ProfileHeader } from '../components/profile'
import EditProfileInline from '../components/profile/EditProfileInline'
import { User } from '../types/database'
import { Loader2, AlertCircle, Pencil, Calendar, MapPin, Globe, Github, Linkedin, Mail, Briefcase, X, Plus, Users, Award, Building, Code, Zap } from 'lucide-react'
import { ShareProfile } from '../components/profile/ShareProfile'
import { useForm } from 'react-hook-form'

const POPULAR_SKILLS = [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java',
    'HTML/CSS', 'Vue.js', 'Angular', 'Express.js', 'MongoDB', 'PostgreSQL',
    'Git', 'Docker', 'AWS', 'Firebase', 'GraphQL', 'REST APIs'
]

const ProfilePage: React.FC = () => {
    const { userId } = useParams<{ userId: string }>()
    const navigate = useNavigate()
    const { user: currentUser, profile: currentProfile, updateProfile } = useAuth()

    const [profile, setProfile] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [editMode, setEditMode] = useState(false)
    const [selectedSkills, setSelectedSkills] = useState<string[]>([])
    const [customSkill, setCustomSkill] = useState('')

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
                    if (currentProfile) {
                        setProfile(currentProfile)
                    } else {
                        setError('Profile not found')
                    }
                } else {
                    const { profile: userProfile, error: profileError } = await AuthService.getUserProfile(userId!)
                    if (profileError) {
                        setError(profileError.message)
                    } else {
                        setProfile(userProfile)
                    }
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load profile')
            } finally {
                setLoading(false)
            }
        }
        loadProfile()
    }, [userId, currentProfile, isOwnProfile])

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
        } else {
            alert(error || 'Failed to update profile')
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
                {/* Compact Header Section */}
                <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-900/20" />
                    
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                            
                            {/* Left: Avatar & Basic Info */}
                            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4">
                                {/* Avatar */}
                                <div className="relative">
                                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white">
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
                                                        <span className="text-2xl sm:text-3xl font-bold text-blue-700">
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
                                                    <span className="text-2xl sm:text-3xl font-bold text-blue-700">
                                                        {getInitials()}
                                                    </span>
                                                </div>
                                            )
                                        )}
                                    </div>
                                    
                                    {/* Role Badge */}
                                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full border-2 border-white shadow-md ${
                                            profile.role === 'developer' ? 'bg-blue-100 text-blue-800' : 
                                            profile.role === 'admin' ? 'bg-yellow-100 text-yellow-800' : 
                                            'bg-purple-100 text-purple-800'
                                        }`}>
                                            {profile.role === 'developer' ? 'Developer' : 
                                             profile.role === 'admin' ? 'Admin' : 'Organization'}
                                        </span>
                                    </div>
                                </div>

                                {/* Name & Meta Info */}
                                <div className="text-center sm:text-left sm:pb-2">
                                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                                        {getDisplayName()}
                                    </h1>
                                    
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
                                    </div>
                                </div>
                            </div>

                            {/* Right: Social Links & Edit Button */}
                            <div className="flex flex-col items-center lg:items-end gap-3">
                                {/* Social Links */}
                                <div className="flex gap-2">
                                    {profile.website && (
                                        <a
                                            href={profile.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-white/20 hover:bg-white/30 p-2 rounded-full text-white transition-colors"
                                            title="Website"
                                        >
                                            <Globe className="w-4 h-4" />
                                        </a>
                                    )}
                                    {profile.github && (
                                        <a
                                            href={profile.github}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-white/20 hover:bg-white/30 p-2 rounded-full text-white transition-colors"
                                            title="GitHub"
                                        >
                                            <Github className="w-4 h-4" />
                                        </a>
                                    )}
                                    {profile.linkedin && (
                                        <a
                                            href={profile.linkedin}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-white/20 hover:bg-white/30 p-2 rounded-full text-white transition-colors"
                                            title="LinkedIn"
                                        >
                                            <Linkedin className="w-4 h-4" />
                                        </a>
                                    )}
                                </div>

                                {/* Edit Button */}
                                {isOwnProfile && !editMode && (
                                    <button
                                        onClick={() => setEditMode(true)}
                                        className="bg-white hover:bg-gray-50 text-blue-700 border border-blue-200 shadow-lg px-4 py-2 rounded-md font-medium text-sm transition-colors flex items-center gap-2"
                                    >
                                        <Pencil className="w-4 h-4" />
                                        Edit Profile
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Skills Preview for Developers - Limited preview to encourage scrolling down */}
                        {profile.role === 'developer' && (() => {
                            const skillsToShow = editMode ? selectedSkills : (profile.skills || [])
                            return skillsToShow.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-white/20">
                                    <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                                        {skillsToShow.slice(0, editMode ? 15 : 3).map((skill, idx) => (
                                            <span
                                                key={idx}
                                                className={`px-3 py-1 text-sm font-medium rounded-full ${
                                                    editMode 
                                                        ? 'bg-green-100 text-green-800 border border-green-300' 
                                                        : 'bg-white/90 text-blue-700'
                                                }`}
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                        {skillsToShow.length > (editMode ? 15 : 3) && (
                                            <span className="px-3 py-1 bg-white/70 text-blue-700 text-sm font-medium rounded-full">
                                                +{skillsToShow.length - (editMode ? 15 : 3)} more
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

                {/* Main Content */}
                <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${editMode ? 'pb-24 md:pb-8' : ''}`}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* Main Content Column */}
                        <div className="lg:col-span-2 space-y-6">
                            
                            {editMode ? (
                                /* Edit Mode */
                                <form onSubmit={onSave} className="space-y-6">
                                    
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
                                            {profile.role === 'developer' ? 'About Me' : 'About the Organization'} *
                                        </h3>
                                        <textarea
                                            {...register('bio', { required: true })}
                                            rows={4}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                                            placeholder={`Tell us about ${profile.role === 'developer' ? 'yourself' : 'your organization'}...`}
                                        />
                                        {errors.bio && (
                                            <p className="mt-1 text-sm text-red-600">Bio is required</p>
                                        )}
                                    </div>

                                    {/* Skills (Developer only) */}
                                    {profile.role === 'developer' && (
                                        <div className="bg-white rounded-lg shadow-sm border p-6">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills</h3>
                                            
                                            {/* Popular Skills */}
                                            <div className="mb-4">
                                                <p className="text-sm text-gray-600 mb-3">Select from popular skills:</p>
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
                                            {profile.role === 'developer' && (
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
                                /* View Mode - Enhanced Content */
                                <div className="space-y-6">
                                    
                                    {/* Bio/About */}
                                    <div className="bg-white rounded-lg shadow-sm border p-6">
                                        <div className="flex items-center gap-2 mb-4">
                                            {profile.role === 'developer' ? (
                                                <Users className="w-5 h-5 text-blue-600" />
                                            ) : (
                                                <Building className="w-5 h-5 text-purple-600" />
                                            )}
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {profile.role === 'developer' ? 'About Me' : 'About the Organization'}
                                            </h3>
                                        </div>
                                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                            {profile.bio || (
                                                <span className="text-gray-400 italic">
                                                    {profile.role === 'developer' ? 'No bio provided.' : 'No description provided.'}
                                                </span>
                                            )}
                                        </p>
                                    </div>

                                    {/* Technical Skills (Developer only) */}
                                    {profile.role === 'developer' && profile.skills && profile.skills.length > 0 && (
                                        <div className="bg-white rounded-lg shadow-sm border p-6">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Code className="w-5 h-5 text-blue-600" />
                                                <h3 className="text-lg font-semibold text-gray-900">Technical Skills</h3>
                                                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                                                    {profile.skills.length} skills
                                                </span>
                                            </div>
                                            
                                            {/* Skills Grid */}
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                                {profile.skills.map((skill, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="group bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 text-center hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 cursor-default"
                                                    >
                                                        <div className="flex items-center justify-center gap-1">
                                                            <Zap className="w-3 h-3 text-blue-600 group-hover:text-blue-700" />
                                                            <span className="text-sm font-medium text-blue-800 group-hover:text-blue-900">
                                                                {skill}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Skills Categories (if we had categories) */}
                                            <div className="mt-4 pt-4 border-t border-gray-100">
                                                <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                                                    {profile.skills.some(skill => ['JavaScript', 'TypeScript', 'Python', 'Java'].includes(skill)) && (
                                                        <span className="bg-gray-100 px-2 py-1 rounded">Programming Languages</span>
                                                    )}
                                                    {profile.skills.some(skill => ['React', 'Vue.js', 'Angular'].includes(skill)) && (
                                                        <span className="bg-gray-100 px-2 py-1 rounded">Frontend Frameworks</span>
                                                    )}
                                                    {profile.skills.some(skill => ['Node.js', 'Express.js'].includes(skill)) && (
                                                        <span className="bg-gray-100 px-2 py-1 rounded">Backend Technologies</span>
                                                    )}
                                                    {profile.skills.some(skill => ['MongoDB', 'PostgreSQL'].includes(skill)) && (
                                                        <span className="bg-gray-100 px-2 py-1 rounded">Databases</span>
                                                    )}
                                                    {profile.skills.some(skill => ['AWS', 'Docker', 'Git'].includes(skill)) && (
                                                        <span className="bg-gray-100 px-2 py-1 rounded">DevOps & Tools</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Professional Highlights (Developer) */}
                                    {profile.role === 'developer' && (profile.skills && profile.skills.length > 0) && (
                                        <div className="bg-white rounded-lg shadow-sm border p-6">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Award className="w-5 h-5 text-yellow-600" />
                                                <h3 className="text-lg font-semibold text-gray-900">Professional Summary</h3>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                                                    <div className="text-2xl font-bold text-blue-600 mb-1">
                                                        {profile.skills.length}
                                                    </div>
                                                    <div className="text-sm text-blue-800 font-medium">Technical Skills</div>
                                                </div>
                                                
                                                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                                                    <div className="text-2xl font-bold text-green-600 mb-1">
                                                        {new Date().getFullYear() - new Date(profile.created_at).getFullYear() || '<1'}
                                                    </div>
                                                    <div className="text-sm text-green-800 font-medium">Years on Platform</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Organization Summary */}
                                    {profile.role === 'organization' && (
                                        <div className="bg-white rounded-lg shadow-sm border p-6">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Building className="w-5 h-5 text-purple-600" />
                                                <h3 className="text-lg font-semibold text-gray-900">Organization Summary</h3>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-4">
                                                    {hasLocation && (
                                                        <div>
                                                            <label className="text-sm font-medium text-gray-500">Location</label>
                                                            <p className="text-gray-900 flex items-center gap-1">
                                                                <MapPin className="w-4 h-4 text-gray-400" />
                                                                {profile.location}
                                                            </p>
                                                        </div>
                                                    )}
                                                    
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-500">Member Since</label>
                                                        <p className="text-gray-900">
                                                            {new Date(profile.created_at).toLocaleDateString('en-US', { 
                                                                year: 'numeric', 
                                                                month: 'long',
                                                                day: 'numeric'
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-500">Organization Name</label>
                                                        <p className="text-gray-900 font-medium">
                                                            {profile.organization_name}
                                                        </p>
                                                    </div>
                                                    
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-500">Status</label>
                                                        <p className="text-green-600 font-medium flex items-center gap-1">
                                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                            Active
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            
                            {/* Contact Information */}
                            <div className="bg-white rounded-lg shadow-sm border p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                        <span className="text-gray-700 break-all">{profile.email}</span>
                                    </div>
                                    
                                    {hasLocation && (
                                        <div className="flex items-center gap-3">
                                            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                            <span className="text-gray-700">{profile.location}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Links */}
                            {(profile.website || profile.portfolio || profile.github || profile.linkedin) && (
                                <div className="bg-white rounded-lg shadow-sm border p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Links</h3>
                                    <div className="space-y-3">
                                        {profile.website && (
                                            <a
                                                href={profile.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 text-blue-600 hover:text-blue-700 transition-colors group"
                                            >
                                                <Globe className="w-4 h-4 flex-shrink-0" />
                                                <span className="group-hover:underline break-all">Website</span>
                                            </a>
                                        )}
                                        
                                        {profile.portfolio && (
                                            <a
                                                href={profile.portfolio}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 text-blue-600 hover:text-blue-700 transition-colors group"
                                            >
                                                <Briefcase className="w-4 h-4 flex-shrink-0" />
                                                <span className="group-hover:underline break-all">Portfolio</span>
                                            </a>
                                        )}
                                        
                                        {profile.github && (
                                            <a
                                                href={profile.github}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 text-blue-600 hover:text-blue-700 transition-colors group"
                                            >
                                                <Github className="w-4 h-4 flex-shrink-0" />
                                                <span className="group-hover:underline break-all">GitHub</span>
                                            </a>
                                        )}
                                        
                                        {profile.linkedin && (
                                            <a
                                                href={profile.linkedin}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 text-blue-600 hover:text-blue-700 transition-colors group"
                                            >
                                                <Linkedin className="w-4 h-4 flex-shrink-0" />
                                                <span className="group-hover:underline break-all">LinkedIn</span>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Share Profile */}
                            <div className="bg-white rounded-lg shadow-sm border p-6">
                                <ShareProfile userId={profile.id} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sticky Action Buttons for Mobile (Edit Mode Only) */}
                {editMode && (
                    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 p-4">
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