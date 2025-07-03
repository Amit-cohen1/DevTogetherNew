import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { MapPin, Globe, ArrowLeft } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

interface OrganizationProfileFormData {
    first_name: string
    last_name: string
    bio: string
    location: string
    website: string
}

interface OrganizationProfileStepProps {
    onNext: () => void
    onBack: () => void
}

export const OrganizationProfileStep: React.FC<OrganizationProfileStepProps> = ({
    onNext,
    onBack
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { updateProfile, profile } = useAuth()

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<OrganizationProfileFormData>({
        defaultValues: {
            first_name: profile?.first_name || '',
            last_name: profile?.last_name || '',
            bio: profile?.bio || '',
            location: profile?.location || '',
            website: profile?.website || ''
        }
    })

    const onSubmit = async (data: OrganizationProfileFormData) => {
        try {
            setIsSubmitting(true)
            const profileUpdates = {
                first_name: data.first_name,
                last_name: data.last_name,
                bio: data.bio,
                location: data.location || null,
                website: data.website || null
            }
            const { success, error } = await updateProfile(profileUpdates)
            if (success) {
                onNext()
            } else {
                alert(error || 'Failed to update profile. Please try again.')
            }
        } catch (error) {
            alert('An unexpected error occurred. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Complete Your Organization Profile
                </h2>
                <p className="text-gray-600">
                    Help developers understand your mission and the impact they can make
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Name Fields */}
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

                {/* Mission/Bio */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Organization Mission & Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Describe your organization's mission, the work you do, and the impact you're making. Help developers understand how they can contribute to your cause..."
                        {...register('bio', {
                            required: 'Please describe your organization',
                            minLength: {
                                value: 100,
                                message: 'Please write at least 100 characters'
                            }
                        })}
                    />
                    {errors.bio && (
                        <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                        Include information about your cause, current projects, and how technology can help your mission.
                    </p>
                </div>

                {/* Location */}
                <Input
                    label="Location"
                    icon={<MapPin className="w-5 h-5" />}
                    placeholder="City, State/Country"
                    helperText="Where is your organization based?"
                    error={errors.location?.message}
                    {...register('location')}
                />

                {/* Website */}
                <Input
                    label="Website"
                    icon={<Globe className="w-5 h-5" />}
                    placeholder="https://yourorganization.org"
                    helperText="Your organization's main website"
                    error={errors.website?.message}
                    {...register('website', {
                        pattern: {
                            value: /^https?:\/\/.+/,
                            message: 'Please enter a valid URL starting with http:// or https://'
                        }
                    })}
                />

                {/* Additional Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-medium text-blue-900 mb-2">Tips for a great profile:</h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Clearly explain your mission and impact</li>
                        <li>• Describe the types of technology projects you need</li>
                        <li>• Mention any current initiatives or programs</li>
                        <li>• Share what makes your organization unique</li>
                        <li>• Include information about your team and culture</li>
                    </ul>
                </div>

                {/* Navigation */}
                <div className="flex justify-between pt-6">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onBack}
                        icon={<ArrowLeft className="w-4 h-4" />}
                    >
                        Back
                    </Button>

                    <Button
                        type="submit"
                        loading={isSubmitting}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Saving...' : 'Complete Profile'}
                    </Button>
                </div>
            </form>
        </div>
    )
}

export default OrganizationProfileStep 