import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { projectService, CreateProjectData } from '../../services/projects'
import { toastService } from '../../services/toastService';
import {
    TECHNOLOGY_STACK_OPTIONS,
    DIFFICULTY_LEVELS,
    APPLICATION_TYPES,
    ESTIMATED_DURATIONS
} from '../../utils/constants'
import { TechnologyStackSelector } from './TechnologyStackSelector'
import { Button } from '../ui/Button'
import { FormField } from '../ui/FormField'
import { Textarea } from '../ui/Textarea'
import { Select } from '../ui/Select'
import { RadioGroup } from '../ui/RadioGroup'
import { Checkbox } from '../ui/Checkbox'
import { Calendar, MapPin, Users, Clock, AlertCircle } from 'lucide-react'

interface CreateProjectFormData {
    title: string
    description: string
    requirements: string
    technology_stack: string[]
    difficulty_level: 'beginner' | 'intermediate' | 'advanced'
    application_type: 'individual' | 'team' | 'both'
    max_team_size?: number
    deadline?: string
    estimated_duration?: string
    is_remote: boolean
    location?: string
}

interface CreateProjectFormProps {
    onSuccess?: (projectId: string) => void
    onCancel?: () => void
}

export function CreateProjectForm({ onSuccess, onCancel }: CreateProjectFormProps) {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        control,
        watch,
        formState: { errors },
        setValue
    } = useForm<CreateProjectFormData>({
        defaultValues: {
            technology_stack: [],
            difficulty_level: 'beginner',
            application_type: 'both',
            is_remote: true
        }
    })

    const applicationType = watch('application_type')
    const isRemote = watch('is_remote')

    const onSubmit = async (data: CreateProjectFormData) => {
        if (!user) {
            setSubmitError('You must be logged in to create a project')
            return
        }

        setIsSubmitting(true)
        setSubmitError(null)

        try {
            const projectData: CreateProjectData = {
                organization_id: user.id,
                title: data.title,
                description: data.description,
                requirements: data.requirements,
                technology_stack: data.technology_stack,
                difficulty_level: data.difficulty_level,
                application_type: data.application_type,
                max_team_size: data.application_type === 'individual' ? 1 : data.max_team_size || null,
                deadline: data.deadline || null,
                estimated_duration: data.estimated_duration || null,
                is_remote: data.is_remote,
                location: data.is_remote ? null : data.location || null,
                status: 'pending'
            }

            const project = await projectService.createProject(projectData)

            toastService.project.created();

            if (onSuccess) {
                onSuccess(project.id)
            } else {
                navigate(`/projects/${project.id}`)
            }
        } catch (error) {
            toastService.error(error instanceof Error ? error.message : 'Failed to create project');
            setSubmitError(error instanceof Error ? error.message : 'Failed to create project')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Basic Information</h3>

                <div className="space-y-6">
                    <FormField
                        label="Project Title"
                        error={errors.title?.message}
                        required
                    >
                        <input
                            {...register('title', {
                                required: 'Project title is required',
                                minLength: {
                                    value: 3,
                                    message: 'Title must be at least 3 characters'
                                },
                                maxLength: {
                                    value: 100,
                                    message: 'Title must be less than 100 characters'
                                }
                            })}
                            type="text"
                            className="input"
                            placeholder="Enter project title..."
                        />
                    </FormField>

                    <FormField
                        label="Project Description"
                        error={errors.description?.message}
                        required
                    >
                        <Textarea
                            {...register('description', {
                                required: 'Project description is required',
                                minLength: {
                                    value: 50,
                                    message: 'Description must be at least 50 characters'
                                }
                            })}
                            rows={4}
                            placeholder="Describe your project, its goals, and what you hope to achieve..."
                        />
                    </FormField>

                    <FormField
                        label="Requirements & Expectations"
                        error={errors.requirements?.message}
                        required
                    >
                        <Textarea
                            {...register('requirements', {
                                required: 'Requirements are required',
                                minLength: {
                                    value: 30,
                                    message: 'Requirements must be at least 30 characters'
                                }
                            })}
                            rows={4}
                            placeholder="List the specific requirements, skills needed, and expectations for developers..."
                        />
                    </FormField>
                </div>
            </div>

            {/* Technical Details */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Technical Details</h3>

                <div className="space-y-6">
                    <FormField
                        label="Technology Stack"
                        error={errors.technology_stack?.message}
                        required
                    >
                        <Controller
                            name="technology_stack"
                            control={control}
                            rules={{
                                validate: (value) =>
                                    value.length > 0 || 'At least one technology must be selected'
                            }}
                            render={({ field }) => (
                                <TechnologyStackSelector
                                    selectedTechnologies={field.value}
                                    onSelectionChange={field.onChange}
                                    options={TECHNOLOGY_STACK_OPTIONS}
                                />
                            )}
                        />
                    </FormField>

                    <FormField
                        label="Difficulty Level"
                        error={errors.difficulty_level?.message}
                        required
                    >
                        <Controller
                            name="difficulty_level"
                            control={control}
                            render={({ field }) => (
                                <RadioGroup
                                    options={DIFFICULTY_LEVELS}
                                    value={field.value}
                                    onChange={field.onChange}
                                    name="difficulty_level"
                                />
                            )}
                        />
                    </FormField>
                </div>
            </div>

            {/* Team Configuration */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Team Configuration
                </h3>

                <div className="space-y-6">
                    <FormField
                        label="Application Type"
                        error={errors.application_type?.message}
                        required
                    >
                        <Controller
                            name="application_type"
                            control={control}
                            render={({ field }) => (
                                <RadioGroup
                                    options={APPLICATION_TYPES}
                                    value={field.value}
                                    onChange={field.onChange}
                                    name="application_type"
                                />
                            )}
                        />
                    </FormField>

                    {applicationType !== 'individual' && (
                        <FormField
                            label="Maximum Team Size"
                            error={errors.max_team_size?.message}
                        >
                            <input
                                {...register('max_team_size', {
                                    valueAsNumber: true,
                                    min: {
                                        value: 2,
                                        message: 'Team size must be at least 2'
                                    },
                                    max: {
                                        value: 10,
                                        message: 'Team size cannot exceed 10'
                                    }
                                })}
                                type="number"
                                min="2"
                                max="10"
                                className="input"
                                placeholder="e.g., 4"
                            />
                        </FormField>
                    )}
                </div>
            </div>

            {/* Timeline & Location */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Timeline & Location
                </h3>

                <div className="space-y-6">
                    <FormField
                        label="Estimated Duration"
                        error={errors.estimated_duration?.message}
                    >
                        <Select
                            {...register('estimated_duration')}
                            className="input"
                        >
                            <option value="">Select duration...</option>
                            {ESTIMATED_DURATIONS.map((duration) => (
                                <option key={duration} value={duration}>
                                    {duration}
                                </option>
                            ))}
                        </Select>
                    </FormField>

                    <FormField
                        label="Application Deadline"
                        error={errors.deadline?.message}
                    >
                        <input
                            {...register('deadline')}
                            type="date"
                            className="input"
                            min={new Date().toISOString().split('T')[0]}
                        />
                    </FormField>

                    <FormField
                        label="Work Location"
                        error={errors.is_remote?.message}
                    >
                        <div className="space-y-4">
                            <label className="flex items-center">
                                <input
                                    {...register('is_remote')}
                                    type="radio"
                                    value="true"
                                    className="radio"
                                />
                                <span className="ml-2">Remote work</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    {...register('is_remote')}
                                    type="radio"
                                    value="false"
                                    className="radio"
                                />
                                <span className="ml-2">In-person</span>
                            </label>
                        </div>
                    </FormField>

                    {!isRemote && (
                        <FormField
                            label="Location"
                            error={errors.location?.message}
                        >
                            <input
                                {...register('location', {
                                    required: !isRemote ? 'Location is required for in-person projects' : false
                                })}
                                type="text"
                                className="input"
                                placeholder="e.g., San Francisco, CA"
                            />
                        </FormField>
                    )}
                </div>
            </div>

            {/* Error Display */}
            {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                        <span className="text-red-700">{submitError}</span>
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                {onCancel && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                )}
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="min-w-[120px]"
                >
                    {isSubmitting ? 'Creating...' : 'Create Project'}
                </Button>
            </div>
        </form>
    )
} 