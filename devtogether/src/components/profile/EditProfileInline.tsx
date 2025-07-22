import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../contexts/AuthContext'
import { toastService } from '../../services/toastService'
import { User } from '../../types/database'
import { Button } from '../ui/Button'
import { FormField } from '../ui/FormField'
import { Textarea } from '../ui/Textarea'
import { supabase } from '../../utils/supabase'
// import { SkillsSelector } from './SkillsSelector'
import { 
    X, 
    Upload, 
    AlertCircle, 
    Loader2,
    Save,
    User as UserIcon,
    Building,
    Link as LinkIcon,
    Mail,
    MapPin,
    Globe,
    Github,
    Linkedin,
    Briefcase,
    Star,
    Check,
    Camera,
    Settings
} from 'lucide-react'

interface EditProfileInlineProps {
    profile: User
    onSave: (updatedProfile: User) => void
    onCancel: () => void
}

interface ProfileFormData {
    first_name: string
    last_name: string
    bio: string
    location: string
    portfolio: string
    github: string
    linkedin: string
    organization_name?: string
    website?: string
}

const EditProfileInline: React.FC<EditProfileInlineProps> = ({
    profile,
    onSave,
    onCancel
}) => {
    const { updateProfile } = useAuth()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [skills, setSkills] = useState<string[]>(profile.skills || [])
    const [uploading, setUploading] = useState(false)
    const [currentSection, setCurrentSection] = useState('basic')
    const [progress, setProgress] = useState(0)

    const {
        register,
        handleSubmit,
        formState: { errors, isDirty },
        reset,
        watch,
        setValue
    } = useForm<ProfileFormData>({
        defaultValues: {
            first_name: profile.first_name || '',
            last_name: profile.last_name || '',
            bio: profile.bio || '',
            location: profile.location || '',
            portfolio: profile.portfolio || '',
            github: profile.github || '',
            linkedin: profile.linkedin || '',
            organization_name: profile.organization_name || '',
            website: profile.website || ''
        }
    })

    const isDeveloper = ['developer', 'admin'].includes((profile?.role as unknown as string) ?? '')

    // Calculate completion progress
    useEffect(() => {
        const watchedFields = watch()
        const requiredFields = isDeveloper 
            ? ['first_name', 'last_name', 'bio']
            : ['organization_name', 'bio']
        
        const optionalFields = isDeveloper
            ? ['location', 'github', 'linkedin', 'portfolio']
            : ['location', 'website', 'linkedin']

        const completedRequired = requiredFields.filter(field => 
            watchedFields[field as keyof ProfileFormData]?.trim()
        ).length

        const completedOptional = optionalFields.filter(field => 
            watchedFields[field as keyof ProfileFormData]?.trim()
        ).length

        const skillsScore = skills.length > 0 ? 1 : 0
        const totalFields = requiredFields.length + optionalFields.length + 1
        const totalCompleted = completedRequired + completedOptional + skillsScore

        setProgress(Math.round((totalCompleted / totalFields) * 100))
    }, [watch(), skills, isDeveloper])

    const sections = [
        { id: 'basic', label: 'Basic Info', icon: UserIcon },
        { id: 'bio', label: 'About Me', icon: Star },
        { id: 'skills', label: 'Skills', icon: Briefcase, developerOnly: true },
        { id: 'links', label: 'Links & Contact', icon: LinkIcon },
    ].filter(section => !section.developerOnly || isDeveloper)

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            toastService.error('Please select a valid image file')
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            toastService.error('Image size must be less than 5MB')
            return
        }

        setUploading(true)
        toastService.info('Uploading profile picture...')

        try {
            // Generate unique filename with user folder structure
            const fileExt = file.name.split('.').pop()
            const fileName = `${profile.id}/avatar-${Date.now()}.${fileExt}`

            // Upload to Supabase Storage
            const { data, error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: true  // Allow overwriting existing files
                })

            if (uploadError) {
                console.error('Upload error:', uploadError)
                throw new Error(`Upload failed: ${uploadError.message}`)
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(data.path)

            // Update profile immediately via updateProfile
            const { success, error: updateError } = await updateProfile({
                avatar_url: publicUrl
            })

            if (!success || updateError) {
                throw new Error(updateError || 'Failed to update profile')
            }

            // Update local profile state immediately
            const updatedProfile = { ...profile, avatar_url: publicUrl }
            onSave(updatedProfile)
            toastService.success('Profile picture updated successfully!')

        } catch (err) {
            console.error('Avatar upload error:', err)
            toastService.error(err instanceof Error ? err.message : 'Failed to upload profile picture. Please try again.')
        } finally {
            setUploading(false)
        }
    }

    const onSubmit = async (data: ProfileFormData) => {
        const hasChanges = isDirty || 
            JSON.stringify(skills) !== JSON.stringify(profile.skills || [])

        if (!hasChanges) {
            toastService.info('No changes to save')
            return
        }

        try {
            setLoading(true)
            setError(null)

            const updateData: Partial<User> = {
                ...data,
                skills: skills
            }

            Object.keys(updateData).forEach(key => {
                if (updateData[key as keyof User] === '') {
                    updateData[key as keyof User] = null as any
                }
            })

            const { success, error: updateError } = await updateProfile(updateData)

            if (!success || updateError) {
                throw new Error(updateError || 'Failed to update profile')
            }

            onSave({ ...profile, ...updateData, skills })
            toastService.profile.updated()

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update profile'
            setError(errorMessage)
            
            if (errorMessage.includes('network')) {
                toastService.error('Network error. Please check your connection and try again.')
            } else if (errorMessage.includes('validation')) {
                toastService.error('Please check your information and try again.')
            } else {
                toastService.error('Failed to update profile. Please try again.')
            }
        } finally {
            setLoading(false)
        }
    }

    const handleSkillsChange = (newSkills: string[]) => {
        setSkills(newSkills)
        if (newSkills.length > (profile.skills?.length || 0)) {
            toastService.info('Skill added successfully')
        }
    }

    const getSectionIcon = (sectionId: string) => {
        const section = sections.find(s => s.id === sectionId)
        return section?.icon || UserIcon
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Progress Header */}
            <div className="bg-white rounded-xl p-6 mb-8 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                            <Settings className="w-8 h-8 text-blue-600" />
                            Edit Profile
                        </h2>
                        <p className="text-gray-600 mt-1">Update your professional information</p>
                    </div>
                    <Button onClick={onCancel} variant="outline" size="sm">
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                    </Button>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Profile Completion</span>
                        <span className="font-semibold text-blue-600">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="text-xs text-gray-500">
                        {progress >= 90 ? '🎉 Excellent! Your profile is almost complete!' :
                         progress >= 70 ? '👍 Great progress! Keep adding more details.' :
                         progress >= 50 ? '📝 Good start! Add more information to stand out.' :
                         '🚀 Let\'s build an amazing profile together!'}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Navigation */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm sticky top-4">
                        <h3 className="font-semibold text-gray-900 mb-4">Edit Sections</h3>
                        <nav className="space-y-2">
                            {sections.map((section) => {
                                const Icon = section.icon
                                return (
                                    <button
                                        key={section.id}
                                        onClick={() => setCurrentSection(section.id)}
                                        className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
                                            currentSection === section.id
                                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {section.label}
                                        {currentSection === section.id && (
                                            <Check className="w-4 h-4 ml-auto" />
                                        )}
                                    </button>
                                )
                            })}
                        </nav>
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        {/* Error Alert */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                                    <span className="text-sm text-red-700">{error}</span>
                                </div>
                            </div>
                        )}

                        {/* Section Content */}
                        <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
                            {/* Basic Info Section */}
                            {currentSection === 'basic' && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <UserIcon className="w-6 h-6 text-blue-600" />
                                        <h3 className="text-xl font-semibold text-gray-900">Basic Information</h3>
                                    </div>

                                    {/* Avatar Upload - Enhanced UI */}
                                    <div className="flex items-center gap-6">
                                        <div className="relative group">
                                            <div className="w-24 h-24 rounded-full bg-white border-4 border-gray-200 overflow-hidden shadow-lg transition-all duration-300 group-hover:shadow-xl">
                                                {profile.avatar_url ? (
                                                    <img
                                                        src={profile.avatar_url}
                                                        alt="Profile"
                                                        className={`w-full h-full object-cover transition-opacity duration-300 ${uploading ? 'opacity-50' : 'opacity-100'}`}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                                                        <span className="text-gray-400 text-2xl font-medium">
                                                            {profile.first_name?.[0] || profile.email?.[0] || '?'}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Upload Progress Overlay */}
                                            {uploading && (
                                                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                                                    <div className="flex flex-col items-center">
                                                        <Loader2 className="w-6 h-6 text-white animate-spin mb-1" />
                                                        <span className="text-white text-xs font-medium">Uploading...</span>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {/* Camera Upload Button */}
                                            <label className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 shadow-lg ring-2 ring-white ${uploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:scale-110'}`}>
                                                {uploading ? (
                                                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                                                ) : (
                                                    <Camera className="w-4 h-4 text-white" />
                                                )}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleAvatarUpload}
                                                    className="hidden"
                                                    disabled={uploading}
                                                />
                                            </label>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                                Profile Picture
                                                {uploading && (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        <Loader2 className="w-3 h-3 animate-spin mr-1" />
                                                        Uploading
                                                    </span>
                                                )}
                                            </h4>
                                            <p className="text-sm text-gray-600 mb-2">
                                                Upload a professional photo that represents you well.
                                            </p>
                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                    JPG, PNG, GIF
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                    Max 5MB
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                                    Square recommended
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Name Fields */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            label="First Name"
                                            error={errors.first_name?.message}
                                            required
                                        >
                                            <input
                                                {...register('first_name', { required: 'First name is required' })}
                                                type="text"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                placeholder="Enter your first name"
                                            />
                                        </FormField>

                                        <FormField
                                            label="Last Name"
                                            error={errors.last_name?.message}
                                            required
                                        >
                                            <input
                                                {...register('last_name', { required: 'Last name is required' })}
                                                type="text"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                placeholder="Enter your last name"
                                            />
                                        </FormField>
                                    </div>

                                    {/* Organization Name (for organizations) */}
                                    {!isDeveloper && (
                                        <FormField
                                            label="Organization Name"
                                            error={errors.organization_name?.message}
                                            required
                                        >
                                            <input
                                                {...register('organization_name', { required: 'Organization name is required' })}
                                                type="text"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                placeholder="Enter your organization name"
                                            />
                                        </FormField>
                                    )}

                                    {/* Location */}
                                    <FormField
                                        label="Location"
                                        error={errors.location?.message}
                                    >
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                {...register('location')}
                                                type="text"
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                placeholder="City, Country"
                                            />
                                        </div>
                                    </FormField>
                                </div>
                            )}

                            {/* Bio Section */}
                            {currentSection === 'bio' && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <Star className="w-6 h-6 text-blue-600" />
                                        <h3 className="text-xl font-semibold text-gray-900">About Me</h3>
                                    </div>

                                    <FormField
                                        label={isDeveloper ? "Professional Bio" : "Organization Description"}
                                        error={errors.bio?.message}
                                    >
                                        <Textarea
                                            {...register('bio')}
                                            rows={6}
                                            placeholder={isDeveloper ? 
                                                "Tell others about yourself, your experience, and what you're passionate about..." :
                                                "Describe your organization, mission, and what makes your company unique..."
                                            }
                                            className="resize-none"
                                        />
                                        <p className="text-sm text-gray-500 mt-2">
                                            Write a compelling description that showcases your {isDeveloper ? 'skills and experience' : 'organization\'s mission and values'}.
                                        </p>
                                    </FormField>
                                </div>
                            )}

                            {/* Skills Section (Developer only) */}
                            {currentSection === 'skills' && isDeveloper && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <Briefcase className="w-6 h-6 text-blue-600" />
                                        <h3 className="text-xl font-semibold text-gray-900">Skills & Expertise</h3>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                            Technical Skills
                                        </label>
                                        {/* <SkillsSelector
                                            selectedSkills={skills}
                                            onSkillsChange={handleSkillsChange}
                                        /> */}
                                        <p className="text-sm text-gray-500 mt-2">
                                            Add skills that showcase your technical expertise. Choose technologies you're comfortable working with.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Links Section */}
                            {currentSection === 'links' && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <LinkIcon className="w-6 h-6 text-blue-600" />
                                        <h3 className="text-xl font-semibold text-gray-900">Links & Contact</h3>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Portfolio/Website */}
                                            <FormField
                                                label={isDeveloper ? "Portfolio" : "Website"}
                                                error={isDeveloper ? errors.portfolio?.message : errors.website?.message}
                                            >
                                                <div className="relative">
                                                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                    <input
                                                        {...register(isDeveloper ? 'portfolio' : 'website', {
                                                            pattern: {
                                                                value: /^https?:\/\/.+/, // eslint-disable-line
                                                                message: 'Please enter a valid URL starting with http:// or https://'
                                                            }
                                                        })}
                                                        type="url"
                                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                        placeholder="https://your-site.com"
                                                    />
                                                </div>
                                            </FormField>

                                            {/* GitHub */}
                                            <FormField
                                                label="GitHub"
                                                error={errors.github?.message}
                                            >
                                                <div className="relative">
                                                    <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                    <input
                                                        {...register('github', {
                                                            pattern: {
                                                                value: /^https?:\/\/.+/, // eslint-disable-line
                                                                message: 'Please enter a valid URL starting with http:// or https://'
                                                            }
                                                        })}
                                                        type="url"
                                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                        placeholder="https://github.com/username"
                                                    />
                                                </div>
                                            </FormField>
                                        </div>

                                        {/* LinkedIn */}
                                        <FormField
                                            label="LinkedIn"
                                            error={errors.linkedin?.message}
                                        >
                                            <div className="relative">
                                                <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    {...register('linkedin', {
                                                        pattern: {
                                                            value: /^https?:\/\/.+/, // eslint-disable-line
                                                            message: 'Please enter a valid URL starting with http:// or https://'
                                                        }
                                                    })}
                                                    type="url"
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                    placeholder="https://linkedin.com/in/username"
                                                />
                                            </div>
                                        </FormField>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-4 pt-6">
                            <Button
                                type="button"
                                onClick={onCancel}
                                variant="outline"
                                disabled={loading}
                                className="px-6"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading || (!isDirty && JSON.stringify(skills) === JSON.stringify(profile.skills || []))}
                                className="px-6"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default EditProfileInline