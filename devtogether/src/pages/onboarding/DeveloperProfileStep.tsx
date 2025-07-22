import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { MapPin, Globe, Github, Linkedin, ArrowLeft, User, Code2, Link, Sparkles, Plus, X, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { toastService } from '../../services/toastService'

interface DeveloperProfileFormData {
    first_name: string
    last_name: string
    bio: string
    skills: string
    location: string
    website: string
    github: string
    linkedin: string
    portfolio: string
}

interface DeveloperProfileStepProps {
    onNext: () => void
    onBack: () => void
}

const POPULAR_SKILLS = [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java',
    'HTML/CSS', 'Vue.js', 'Angular', 'Express.js', 'MongoDB', 'PostgreSQL',
    'Git', 'Docker', 'AWS', 'Firebase', 'GraphQL', 'REST APIs'
]

export const DeveloperProfileStep: React.FC<DeveloperProfileStepProps> = ({
    onNext,
    onBack
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [selectedSkills, setSelectedSkills] = useState<string[]>([])
    const [customSkill, setCustomSkill] = useState('')
    const [showCustomSkill, setShowCustomSkill] = useState(false)
    const { updateProfile, profile } = useAuth()

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch
    } = useForm<DeveloperProfileFormData>({
        defaultValues: {
            first_name: profile?.first_name || '',
            last_name: profile?.last_name || '',
            bio: profile?.bio || '',
            location: profile?.location || '',
            website: profile?.website || '',
            github: profile?.github || '',
            linkedin: profile?.linkedin || '',
            portfolio: profile?.portfolio || ''
        }
    })

    const watchedBio = watch('bio')
    const bioLength = watchedBio?.length || 0

    const handleSkillToggle = (skill: string) => {
        const newSkills = selectedSkills.includes(skill)
            ? selectedSkills.filter(s => s !== skill)
            : [...selectedSkills, skill]

        setSelectedSkills(newSkills)
        setValue('skills', newSkills.join(', '))
    }

    const handleAddCustomSkill = () => {
        if (customSkill.trim() && !selectedSkills.includes(customSkill.trim())) {
            const newSkills = [...selectedSkills, customSkill.trim()]
            setSelectedSkills(newSkills)
            setValue('skills', newSkills.join(', '))
            setCustomSkill('')
            setShowCustomSkill(false)
        }
    }

    const handleRemoveSkill = (skillToRemove: string) => {
        const newSkills = selectedSkills.filter(skill => skill !== skillToRemove)
        setSelectedSkills(newSkills)
        setValue('skills', newSkills.join(', '))
    }

    const onSubmit = async (data: DeveloperProfileFormData) => {
        if (!data.first_name || !data.last_name) {
            toastService.error('First and last name are required.')
            return
        }
        try {
            setIsSubmitting(true)

            const profileUpdates = {
                first_name: data.first_name,
                last_name: data.last_name,
                bio: data.bio,
                skills: selectedSkills,
                location: data.location || null,
                website: data.website || null,
                github: data.github || null,
                linkedin: data.linkedin || null,
                portfolio: data.portfolio || null
            }

            const { success, error } = await updateProfile(profileUpdates)

            if (success) {
                toastService.success('Profile updated successfully!')
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
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full border border-blue-200">
                    <User className="w-4 h-4 text-blue-600" />
                    <span className="text-blue-800 font-semibold text-sm">Step 2 of 3</span>
                </div>
                
                <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Build Your Developer Profile
                </h2>
                
                <p className="text-lg text-gray-600 max-w-lg mx-auto leading-relaxed">
                    Help organizations understand your skills and experience. This information will be used to match you with relevant projects.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Personal Information Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
                            <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">Personal Information</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Input
                                label="First Name"
                                placeholder="Enter your first name"
                                error={errors.first_name?.message}
                                className="transition-all duration-200 focus:scale-105"
                                {...register('first_name', { required: 'First name is required' })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Input
                                label="Last Name"
                                placeholder="Enter your last name"
                                error={errors.last_name?.message}
                                className="transition-all duration-200 focus:scale-105"
                                {...register('last_name', { required: 'Last name is required' })}
                            />
                        </div>
                    </div>
                </div>

                {/* About You Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-gradient-to-br from-purple-100 to-violet-100 rounded-lg">
                            <Sparkles className="w-5 h-5 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">About You</h3>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                            Tell us about yourself <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <textarea
                                rows={5}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                                placeholder="Share your programming journey, interests, and what motivates you to work on nonprofit projects. Mention your experience level, favorite technologies, and what you hope to achieve..."
                                {...register('bio', {
                                    required: 'Please tell us about yourself',
                                    minLength: {
                                        value: 50,
                                        message: 'Please write at least 50 characters'
                                    }
                                })}
                            />
                            <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                                {bioLength}/500
                            </div>
                        </div>
                        {errors.bio && (
                            <p className="text-sm text-red-600 flex items-center gap-1">
                                <X className="w-4 h-4" />
                                {errors.bio.message}
                            </p>
                        )}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-700 leading-relaxed">
                                💡 <strong>Tip:</strong> Share your passion for technology and social impact. Organizations love to see developers who are genuinely interested in making a difference!
                            </p>
                        </div>
                    </div>
                </div>

                {/* Skills Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg">
                            <Code2 className="w-5 h-5 text-green-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">Technical Skills</h3>
                    </div>

                    <div className="space-y-4">
                        <label className="block text-sm font-semibold text-gray-700">
                            Select your skills <span className="text-red-500">*</span>
                        </label>
                        
                        {/* Selected Skills Display */}
                        {selectedSkills.length > 0 && (
                            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                                <div className="flex items-center gap-2 mb-3">
                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                    <span className="text-sm font-semibold text-green-800">Selected Skills ({selectedSkills.length})</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {selectedSkills.map((skill) => (
                                        <div
                                            key={skill}
                                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-green-300 rounded-full text-sm font-medium text-green-800 shadow-sm"
                                        >
                                            {skill}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveSkill(skill)}
                                                className="text-green-600 hover:text-green-800 transition-colors"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Popular Skills */}
                        <div className="space-y-3">
                            <div className="flex flex-wrap gap-2">
                                {POPULAR_SKILLS.map((skill) => (
                                    <button
                                        key={skill}
                                        type="button"
                                        onClick={() => handleSkillToggle(skill)}
                                        className={`px-4 py-2 text-sm rounded-full border-2 transition-all duration-200 transform hover:scale-105 ${
                                            selectedSkills.includes(skill)
                                                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 border-blue-500 text-white shadow-lg'
                                                : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:shadow-md'
                                        }`}
                                    >
                                        {skill}
                                    </button>
                                ))}
                            </div>

                            {/* Add Custom Skill */}
                            <div className="flex items-center gap-3">
                                {!showCustomSkill ? (
                                    <button
                                        type="button"
                                        onClick={() => setShowCustomSkill(true)}
                                        className="inline-flex items-center gap-2 px-4 py-2 text-sm border-2 border-dashed border-gray-300 rounded-full text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add custom skill
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={customSkill}
                                            onChange={(e) => setCustomSkill(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleAddCustomSkill()}
                                            placeholder="Enter skill name"
                                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddCustomSkill}
                                            className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                                        >
                                            Add
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowCustomSkill(false)
                                                setCustomSkill('')
                                            }}
                                            className="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-400 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {selectedSkills.length === 0 && (
                            <p className="text-sm text-red-600 flex items-center gap-1">
                                <X className="w-4 h-4" />
                                Please select at least one skill
                            </p>
                        )}
                    </div>
                </div>

                {/* Location Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg">
                            <MapPin className="w-5 h-5 text-orange-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">Location</h3>
                    </div>

                    <Input
                        label="Where are you located?"
                        icon={<MapPin className="w-5 h-5" />}
                        placeholder="e.g., San Francisco, CA or Remote"
                        helperText="This helps organizations understand your time zone and availability"
                        error={errors.location?.message}
                        className="transition-all duration-200 focus:scale-105"
                        {...register('location')}
                    />
                </div>

                {/* Professional Links Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg">
                            <Link className="w-5 h-5 text-indigo-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">Professional Links</h3>
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Optional</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Portfolio Website"
                            icon={<Globe className="w-5 h-5" />}
                            placeholder="https://yourportfolio.com"
                            helperText="Showcase your best work"
                            error={errors.portfolio?.message}
                            className="transition-all duration-200 focus:scale-105"
                            {...register('portfolio', {
                                pattern: {
                                    value: /^https?:\/\/.+/,
                                    message: 'Please enter a valid URL starting with http:// or https://'
                                }
                            })}
                        />

                        <Input
                            label="Personal Website"
                            icon={<Globe className="w-5 h-5" />}
                            placeholder="https://yourwebsite.com"
                            helperText="Your personal blog or website"
                            error={errors.website?.message}
                            className="transition-all duration-200 focus:scale-105"
                            {...register('website', {
                                pattern: {
                                    value: /^https?:\/\/.+/,
                                    message: 'Please enter a valid URL starting with http:// or https://'
                                }
                            })}
                        />

                        <Input
                            label="GitHub Profile"
                            icon={<Github className="w-5 h-5" />}
                            placeholder="https://github.com/username"
                            helperText="Show your code contributions"
                            error={errors.github?.message}
                            className="transition-all duration-200 focus:scale-105"
                            {...register('github', {
                                pattern: {
                                    value: /^https?:\/\/(www\.)?github\.com\/.+/,
                                    message: 'Please enter a valid GitHub URL'
                                }
                            })}
                        />

                        <Input
                            label="LinkedIn Profile"
                            icon={<Linkedin className="w-5 h-5" />}
                            placeholder="https://linkedin.com/in/username"
                            helperText="Professional networking profile"
                            error={errors.linkedin?.message}
                            className="transition-all duration-200 focus:scale-105"
                            {...register('linkedin', {
                                pattern: {
                                    value: /^https?:\/\/(www\.)?linkedin\.com\/in\/.+/,
                                    message: 'Please enter a valid LinkedIn URL'
                                }
                            })}
                        />
                    </div>
                </div>

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
                            {selectedSkills.length > 0 && bioLength >= 50 ? (
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
                            disabled={isSubmitting || selectedSkills.length === 0 || bioLength < 50}
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 px-8"
                        >
                            {isSubmitting ? 'Saving...' : 'Complete Profile'}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default DeveloperProfileStep 