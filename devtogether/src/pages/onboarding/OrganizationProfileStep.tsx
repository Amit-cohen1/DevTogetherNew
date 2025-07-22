import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { MapPin, Globe, ArrowLeft, Building, FileText, Link, Lightbulb, CheckCircle2, X } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { toastService } from '../../services/toastService'

interface OrganizationProfileFormData {
    organization_name: string;
    bio: string;
    location: string;
    website: string;
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
        formState: { errors },
        watch
    } = useForm<OrganizationProfileFormData>({
        defaultValues: {
            organization_name: profile?.organization_name || '',
            bio: profile?.bio || '',
            location: profile?.location || '',
            website: profile?.website || ''
        }
    })

    const watchedBio = watch('bio')
    const watchedOrgName = watch('organization_name')
    const bioLength = watchedBio?.length || 0
    const orgNameLength = watchedOrgName?.length || 0

    const onSubmit = async (data: OrganizationProfileFormData) => {
        try {
            setIsSubmitting(true)
            
            const profileUpdates = {
                organization_name: data.organization_name,
                bio: data.bio,
                location: data.location || null,
                website: data.website || null
            }
            
            const { success, error } = await updateProfile(profileUpdates)
            
            if (success) {
                toastService.success('Organization profile updated successfully!')
                onNext()
            } else {
                toastService.error(error || 'Failed to update profile. Please try again.')
            }
        } catch (error) {
            toastService.error('An unexpected error occurred. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-8">
            {/* Enhanced Header */}
            <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-violet-100 rounded-full border border-purple-200">
                    <Building className="w-4 h-4 text-purple-600" />
                    <span className="text-purple-800 font-semibold text-sm">Step 2 of 3</span>
                </div>
                
                <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    Complete Your Organization Profile
                </h2>
                
                <p className="text-lg text-gray-600 max-w-lg mx-auto leading-relaxed">
                    Help developers understand your mission and the impact they can make by working with your organization.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Organization Details Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-gradient-to-br from-purple-100 to-violet-100 rounded-lg">
                            <Building className="w-5 h-5 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">Organization Details</h3>
                    </div>

                    <div className="space-y-2">
                        <Input
                            label="Organization Name"
                            placeholder="Enter your organization's name"
                            required
                            error={errors.organization_name?.message}
                            className="transition-all duration-200 focus:scale-105"
                            {...register('organization_name', { required: 'Organization name is required' })}
                        />
                        <div className="text-right text-xs text-gray-400">
                            {orgNameLength}/100
                        </div>
                    </div>
                </div>

                {/* Mission & Impact Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
                            <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">Mission & Impact</h3>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                            Organization Mission & Description <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <textarea
                                rows={8}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 resize-none"
                                placeholder="Describe your organization's mission, the work you do, and the impact you're making. Share details about your cause, current projects, and how technology can help your mission. Be specific about the problems you're solving and the communities you serve..."
                                {...register('bio', {
                                    required: 'Please describe your organization',
                                    minLength: {
                                        value: 100,
                                        message: 'Please write at least 100 characters'
                                    }
                                })}
                            />
                            <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                                {bioLength}/1000
                            </div>
                        </div>
                        {errors.bio && (
                            <p className="text-sm text-red-600 flex items-center gap-1">
                                <X className="w-4 h-4" />
                                {errors.bio.message}
                            </p>
                        )}
                        
                        {/* Enhanced Tips Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <Lightbulb className="w-5 h-5 text-blue-600" />
                                    <h4 className="font-semibold text-blue-900">Content Tips</h4>
                                </div>
                                <ul className="text-sm text-blue-700 space-y-2">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
                                        <span>Clearly explain your mission and impact</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
                                        <span>Describe specific problems you're solving</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
                                        <span>Share success stories and achievements</span>
                                    </li>
                                </ul>
                            </div>
                            
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <Lightbulb className="w-5 h-5 text-green-600" />
                                    <h4 className="font-semibold text-green-900">Technical Needs</h4>
                                </div>
                                <ul className="text-sm text-green-700 space-y-2">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                                        <span>Mention types of technology projects you need</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                                        <span>Include information about your team and culture</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                                        <span>Describe how developers can make an impact</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Location & Contact Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg">
                            <MapPin className="w-5 h-5 text-orange-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">Location & Contact</h3>
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Optional</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Location"
                            icon={<MapPin className="w-5 h-5" />}
                            placeholder="City, State/Country"
                            helperText="Where is your organization based?"
                            error={errors.location?.message}
                            className="transition-all duration-200 focus:scale-105"
                            {...register('location')}
                        />

                        <Input
                            label="Website"
                            icon={<Globe className="w-5 h-5" />}
                            placeholder="https://yourorganization.org"
                            helperText="Your organization's main website"
                            error={errors.website?.message}
                            className="transition-all duration-200 focus:scale-105"
                            {...register('website', {
                                pattern: {
                                    value: /^https?:\/\/.+/,
                                    message: 'Please enter a valid URL starting with http:// or https://'
                                }
                            })}
                        />
                    </div>
                </div>

                {/* Preview Section */}
                {bioLength >= 100 && orgNameLength > 0 && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg">
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900">Profile Preview</h3>
                        </div>

                        <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                        <Building className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-900">{watchedOrgName}</h4>
                                        <p className="text-sm text-gray-600">Nonprofit Organization</p>
                                    </div>
                                </div>
                                <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
                                    {watchedBio}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                    {watch('location') && (
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />
                                            {watch('location')}
                                        </span>
                                    )}
                                    {watch('website') && (
                                        <span className="flex items-center gap-1">
                                            <Globe className="w-3 h-3" />
                                            Website
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Enhanced Navigation */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t border-gray-200">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onBack}
                        icon={<ArrowLeft className="w-4 h-4" />}
                        className="w-full sm:w-auto order-2 sm:order-1"
                    >
                        Back
                    </Button>

                    <div className="flex items-center gap-3 order-1 sm:order-2">
                        <div className="text-sm text-gray-500">
                            {bioLength >= 100 && orgNameLength > 0 ? (
                                <span className="text-green-600 flex items-center gap-1">
                                    <CheckCircle2 className="w-4 h-4" />
                                    Ready to continue
                                </span>
                            ) : (
                                <span>Complete required fields to continue</span>
                            )}
                        </div>
                        <Button
                            type="submit"
                            loading={isSubmitting}
                            disabled={isSubmitting || bioLength < 100 || orgNameLength === 0}
                            className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 px-8"
                        >
                            {isSubmitting ? 'Saving...' : 'Complete Profile'}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default OrganizationProfileStep 