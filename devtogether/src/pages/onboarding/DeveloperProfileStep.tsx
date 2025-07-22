import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { MapPin, Globe, Github, Linkedin, ArrowLeft } from 'lucide-react'
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
    const { updateProfile, profile } = useAuth()

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue
    } = useForm<DeveloperProfileFormData>({
        defaultValues: {
            bio: profile?.bio || '',
            location: profile?.location || '',
            website: profile?.website || '',
            github: profile?.github || '',
            linkedin: profile?.linkedin || '',
            portfolio: profile?.portfolio || ''
        }
    })

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
        }
    }

    const onSubmit = async (data: DeveloperProfileFormData) => {
        if (!data.first_name || !data.last_name) {
            toastService.error('First and last name are required.')
            return
        }
        try {
            setIsSubmitting(true)

            const profileData = {
                role: 'developer' as const,
                firstName: data.first_name,
                lastName: data.last_name,
                bio: data.bio,
                skills: selectedSkills,
                location: data.location || undefined,
                website: data.website || undefined,
                github: data.github || undefined,
                linkedin: data.linkedin || undefined,
                portfolio: data.portfolio || undefined
            }

            // Update the profile (all users have profiles now)
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
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Complete Your Developer Profile
                </h2>
                <p className="text-gray-600">
                    Help organizations understand your skills and experience
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

                {/* Bio */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        About You <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Tell organizations about yourself, your experience, and what motivates you..."
                        {...register('bio', {
                            required: 'Please tell us about yourself',
                            minLength: {
                                value: 50,
                                message: 'Please write at least 50 characters'
                            }
                        })}
                    />
                    {errors.bio && (
                        <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
                    )}
                </div>

                {/* Skills */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Skills <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                            {POPULAR_SKILLS.map((skill) => (
                                <button
                                    key={skill}
                                    type="button"
                                    onClick={() => handleSkillToggle(skill)}
                                    className={`px-3 py-1 text-sm rounded-full border transition-colors ${selectedSkills.includes(skill)
                                            ? 'bg-primary-100 border-primary-300 text-primary-700'
                                            : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    {skill}
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={customSkill}
                                onChange={(e) => setCustomSkill(e.target.value)}
                                placeholder="Add custom skill..."
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomSkill())}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleAddCustomSkill}
                                disabled={!customSkill.trim()}
                            >
                                Add
                            </Button>
                        </div>

                        {selectedSkills.length === 0 && (
                            <p className="text-sm text-red-600">Please select at least one skill</p>
                        )}
                    </div>
                </div>

                {/* Location */}
                <Input
                    label="Location"
                    icon={<MapPin className="w-5 h-5" />}
                    placeholder="City, State/Country"
                    error={errors.location?.message}
                    {...register('location')}
                />

                {/* Links */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Website"
                        icon={<Globe className="w-5 h-5" />}
                        placeholder="https://yourwebsite.com"
                        error={errors.website?.message}
                        {...register('website', {
                            pattern: {
                                value: /^https?:\/\/.+/,
                                message: 'Please enter a valid URL starting with http:// or https://'
                            }
                        })}
                    />

                    <Input
                        label="Portfolio"
                        icon={<Globe className="w-5 h-5" />}
                        placeholder="https://portfolio.com"
                        error={errors.portfolio?.message}
                        {...register('portfolio', {
                            pattern: {
                                value: /^https?:\/\/.+/,
                                message: 'Please enter a valid URL starting with http:// or https://'
                            }
                        })}
                    />

                    <Input
                        label="GitHub"
                        icon={<Github className="w-5 h-5" />}
                        placeholder="https://github.com/username"
                        error={errors.github?.message}
                        {...register('github', {
                            pattern: {
                                value: /^https?:\/\/(www\.)?github\.com\/.+/,
                                message: 'Please enter a valid GitHub URL'
                            }
                        })}
                    />

                    <Input
                        label="LinkedIn"
                        icon={<Linkedin className="w-5 h-5" />}
                        placeholder="https://linkedin.com/in/username"
                        error={errors.linkedin?.message}
                        {...register('linkedin', {
                            pattern: {
                                value: /^https?:\/\/(www\.)?linkedin\.com\/in\/.+/,
                                message: 'Please enter a valid LinkedIn URL'
                            }
                        })}
                    />
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
                        disabled={isSubmitting || selectedSkills.length === 0}
                    >
                        {isSubmitting ? 'Saving...' : 'Complete Profile'}
                    </Button>
                </div>
            </form>
        </div>
    )
}

export default DeveloperProfileStep 