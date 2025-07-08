import React, { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { User } from '../../types/database'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import {
    X,
    Upload,
    Loader2,
    User as UserIcon,
    Building,
    AlertCircle,
    Check
} from 'lucide-react'
import { supabase } from '../../utils/supabase'
import { toastService } from '../../services/toastService';

interface EditProfileModalProps {
    profile: User
    onClose: () => void
    onSave: (updatedProfile: User) => void
}

interface ProfileFormData {
    first_name?: string
    last_name?: string
    organization_name?: string
    bio?: string
    location?: string
    website?: string
    linkedin?: string
    github?: string
    portfolio?: string
    skills?: string[]
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
    profile,
    onClose,
    onSave
}) => {
    const { updateProfile } = useAuth()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [uploadingAvatar, setUploadingAvatar] = useState(false)
    const [skillInput, setSkillInput] = useState('')
    const [skills, setSkills] = useState<string[]>(profile.skills || [])
    const fileInputRef = useRef<HTMLInputElement>(null)

    const isDeveloperRole = profile.role === 'developer' || profile.role === 'admin'

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch
    } = useForm<ProfileFormData>({
        defaultValues: {
            first_name: profile.first_name || '',
            last_name: profile.last_name || '',
            organization_name: profile.organization_name || '',
            bio: profile.bio || '',
            location: profile.location || '',
            website: profile.website || '',
            linkedin: profile.linkedin || '',
            github: profile.github || '',
            portfolio: profile.portfolio || '',
            skills: profile.skills || []
        }
    })

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        try {
            setUploadingAvatar(true)
            setError(null)

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                throw new Error('File size must be less than 5MB')
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                throw new Error('Please select an image file')
            }

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
                toastService.profile.error();
                throw new Error(`Upload failed: ${uploadError.message}`)
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(data.path)

            // Update profile with new avatar URL
            const { success, error: updateError } = await updateProfile({
                avatar_url: publicUrl
            })

            if (!success || updateError) {
                toastService.profile.error();
                throw new Error(updateError || 'Failed to update profile')
            }

            // Update local profile data
            onSave({ ...profile, avatar_url: publicUrl })
            toastService.profile.imageUploaded();

        } catch (err) {
            console.error('Avatar upload error:', err)
            setError(err instanceof Error ? err.message : 'Failed to upload avatar')
        } finally {
            setUploadingAvatar(false)
        }
    }

    const addSkill = () => {
        const trimmedSkill = skillInput.trim()
        if (trimmedSkill && !skills.includes(trimmedSkill)) {
            const newSkills = [...skills, trimmedSkill]
            setSkills(newSkills)
            setValue('skills', newSkills)
            setSkillInput('')
        }
    }

    const removeSkill = (skillToRemove: string) => {
        const newSkills = skills.filter(skill => skill !== skillToRemove)
        setSkills(newSkills)
        setValue('skills', newSkills)
    }

    const onSubmit = async (data: ProfileFormData) => {
        if (!data.first_name || !data.last_name) {
            setError('First and last name are required.');
            return;
        }
        try {
            setLoading(true)
            setError(null)

            // Prepare update data
            const updateData: Partial<User> = {
                ...data,
                skills: skills
            }

            // Remove empty strings
            Object.keys(updateData).forEach(key => {
                if (updateData[key as keyof User] === '') {
                    updateData[key as keyof User] = null as any
                }
            })

            const { success, error: updateError } = await updateProfile(updateData)

            if (!success || updateError) {
                throw new Error(updateError || 'Failed to update profile')
            }

            // Update local profile data
            onSave({ ...profile, ...updateData, skills })

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update profile')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Edit Profile
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                    {/* Error Message */}
                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                            <span className="text-sm text-red-700">{error}</span>
                        </div>
                    )}

                    {/* Avatar Upload */}
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-full bg-white border-2 border-gray-200 overflow-hidden">
                                {profile.avatar_url ? (
                                    <img
                                        src={profile.avatar_url}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                        {isDeveloperRole ? (
                                            <UserIcon className="w-8 h-8 text-gray-400" />
                                        ) : (
                                            <Building className="w-8 h-8 text-gray-400" />
                                        )}
                                    </div>
                                )}
                            </div>
                            {uploadingAvatar && (
                                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                                </div>
                            )}
                        </div>
                        <div>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingAvatar}
                                className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                            >
                                <Upload className="w-4 h-4" />
                                Change Photo
                            </button>
                            <p className="text-xs text-gray-500 mt-1">
                                JPG, PNG up to 5MB
                            </p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarUpload}
                                className="hidden"
                            />
                        </div>
                    </div>

                    {/* Personal Information */}
                    {isDeveloperRole ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="First Name"
                                error={errors.first_name?.message}
                                {...register('first_name', { required: 'First name is required' })}
                            />
                            <Input
                                label="Last Name"
                                error={errors.last_name?.message}
                                {...register('last_name', { required: 'Last name is required' })}
                            />
                        </div>
                    ) : (
                        <Input
                            label="Organization Name"
                            {...register('organization_name', { required: 'Organization name is required' })}
                            error={errors.organization_name?.message}
                        />
                    )}

                    {/* Bio */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Bio
                        </label>
                        <textarea
                            {...register('bio')}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder={isDeveloperRole
                                ? "Tell us about yourself, your interests, and what you're looking for..."
                                : "Describe your organization's mission and what you do..."
                            }
                        />
                    </div>

                    {/* Location */}
                    <Input
                        label="Location"
                        {...register('location')}
                        placeholder="City, Country"
                    />

                    {/* Skills (Developer only) */}
                    {isDeveloperRole && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Skills
                            </label>
                            <div className="flex gap-2 mb-3">
                                <input
                                    type="text"
                                    value={skillInput}
                                    onChange={(e) => setSkillInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                    placeholder="Add a skill..."
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <Button
                                    type="button"
                                    onClick={addSkill}
                                    variant="outline"
                                    disabled={!skillInput.trim()}
                                >
                                    Add
                                </Button>
                            </div>
                            {skills.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {skills.map((skill, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                                        >
                                            {skill}
                                            <button
                                                type="button"
                                                onClick={() => removeSkill(skill)}
                                                className="text-blue-500 hover:text-blue-700"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Links */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-gray-700">Links</h3>

                        <Input
                            label="Website"
                            type="url"
                            {...register('website')}
                            placeholder="https://yourwebsite.com"
                        />

                        <Input
                            label="LinkedIn"
                            type="url"
                            {...register('linkedin')}
                            placeholder="https://linkedin.com/in/yourprofile"
                        />

                        {isDeveloperRole && (
                            <>
                                <Input
                                    label="GitHub"
                                    type="url"
                                    {...register('github')}
                                    placeholder="https://github.com/yourusername"
                                />

                                <Input
                                    label="Portfolio"
                                    type="url"
                                    {...register('portfolio')}
                                    placeholder="https://yourportfolio.com"
                                />
                            </>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Check className="w-4 h-4 mr-2" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
} 