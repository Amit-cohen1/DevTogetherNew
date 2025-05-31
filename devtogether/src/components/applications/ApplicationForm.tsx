import React, { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import {
    Send,
    Loader2,
    X,
    Plus,
    ExternalLink,
    User,
    FileText,
    Link as LinkIcon,
    Eye,
    AlertCircle,
    CheckCircle
} from 'lucide-react'
import { Button } from '../ui/Button'
import { FormField } from '../ui/FormField'
import { Textarea } from '../ui/Textarea'
import { Project } from '../../types/database'
import { applicationService, ApplicationCreateData } from '../../services/applications'
import { useAuth } from '../../contexts/AuthContext'

interface ApplicationFormProps {
    project: Project
    onSubmit: () => void
    onCancel: () => void
}

interface ApplicationFormData {
    cover_letter: string
    portfolio_links: Array<{ url: string; title: string }>
}

interface ApplicationPreviewProps {
    formData: ApplicationFormData
    project: Project
    developer: {
        first_name: string | null
        last_name: string | null
        email: string
        skills: string[] | null
        bio: string | null
    }
    onEdit: () => void
    onSubmit: () => void
    onCancel: () => void
    isSubmitting: boolean
}

const ApplicationPreview: React.FC<ApplicationPreviewProps> = ({
    formData,
    project,
    developer,
    onEdit,
    onSubmit,
    onCancel,
    isSubmitting
}) => {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        })
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <Eye className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Application Preview</h2>
                        <p className="text-sm text-gray-600">Review your application before submitting</p>
                    </div>
                </div>
                <Button variant="outline" onClick={onEdit} disabled={isSubmitting}>
                    Edit Application
                </Button>
            </div>

            {/* Application Content */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                {/* Application Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">
                                Application for: {project.title}
                            </h3>
                            <p className="text-sm text-gray-600">
                                Submitted on: {formatDate(new Date().toISOString())}
                            </p>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Pending Review
                        </span>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Applicant Information */}
                    <div>
                        <h4 className="text-base font-medium text-gray-900 mb-3 flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Applicant Information
                        </h4>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                            <div>
                                <span className="text-sm font-medium text-gray-700">Name: </span>
                                <span className="text-sm text-gray-900">
                                    {developer.first_name} {developer.last_name}
                                </span>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-gray-700">Email: </span>
                                <span className="text-sm text-gray-900">{developer.email}</span>
                            </div>
                            {developer.skills && developer.skills.length > 0 && (
                                <div>
                                    <span className="text-sm font-medium text-gray-700">Skills: </span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {developer.skills.map((skill, index) => (
                                            <span
                                                key={index}
                                                className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {developer.bio && (
                                <div>
                                    <span className="text-sm font-medium text-gray-700">Bio: </span>
                                    <p className="text-sm text-gray-900 mt-1">{developer.bio}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Cover Letter */}
                    <div>
                        <h4 className="text-base font-medium text-gray-900 mb-3 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Cover Letter
                        </h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                            {formData.cover_letter ? (
                                <div className="prose prose-sm max-w-none">
                                    <p className="text-gray-900 whitespace-pre-line">{formData.cover_letter}</p>
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">No cover letter provided</p>
                            )}
                        </div>
                    </div>

                    {/* Portfolio Links */}
                    {formData.portfolio_links.length > 0 && (
                        <div>
                            <h4 className="text-base font-medium text-gray-900 mb-3 flex items-center gap-2">
                                <LinkIcon className="w-4 h-4" />
                                Portfolio Links
                            </h4>
                            <div className="space-y-2">
                                {formData.portfolio_links.map((link, index) => (
                                    <div key={index} className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-gray-900">{link.title}</p>
                                            <p className="text-sm text-gray-600">{link.url}</p>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-gray-400" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4 mt-6">
                <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
                    Cancel
                </Button>
                <Button onClick={onSubmit} disabled={isSubmitting} className="flex items-center gap-2">
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        <>
                            <Send className="w-4 h-4" />
                            Submit Application
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}

export const ApplicationForm: React.FC<ApplicationFormProps> = ({
    project,
    onSubmit,
    onCancel
}) => {
    const { user, profile } = useAuth()
    const [step, setStep] = useState<'form' | 'preview'>('form')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const {
        control,
        register,
        handleSubmit,
        watch,
        formState: { errors, isValid }
    } = useForm<ApplicationFormData>({
        defaultValues: {
            cover_letter: '',
            portfolio_links: []
        },
        mode: 'onChange'
    })

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'portfolio_links'
    })

    const watchedData = watch()

    const addPortfolioLink = () => {
        append({ url: '', title: '' })
    }

    const removePortfolioLink = (index: number) => {
        remove(index)
    }

    const validateUrl = (url: string) => {
        try {
            new URL(url)
            return true
        } catch {
            return 'Please enter a valid URL'
        }
    }

    const handleFormSubmit = (data: ApplicationFormData) => {
        setStep('preview')
    }

    const submitApplication = async () => {
        if (!user) return

        setIsSubmitting(true)
        setError(null)

        try {
            const applicationData: ApplicationCreateData = {
                project_id: project.id,
                developer_id: user.id,
                cover_letter: watchedData.cover_letter || undefined,
                portfolio_links: watchedData.portfolio_links
                    .filter(link => link.url.trim() && link.title.trim())
                    .map(link => `${link.title}: ${link.url}`)
            }

            await applicationService.submitApplication(applicationData)
            setSuccess(true)

            // Show success message and close after delay
            setTimeout(() => {
                onSubmit()
            }, 2000)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to submit application')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (success) {
        return (
            <div className="max-w-md mx-auto text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Application Submitted!</h2>
                <p className="text-gray-600 mb-4">
                    Your application has been sent to the organization. You'll hear back from them soon.
                </p>
                <Button onClick={onSubmit}>Done</Button>
            </div>
        )
    }

    if (step === 'preview') {
        return (
            <ApplicationPreview
                formData={watchedData}
                project={project}
                developer={{
                    first_name: profile?.first_name || null,
                    last_name: profile?.last_name || null,
                    email: user?.email || '',
                    skills: profile?.skills || null,
                    bio: profile?.bio || null
                }}
                onEdit={() => setStep('form')}
                onSubmit={submitApplication}
                onCancel={onCancel}
                isSubmitting={isSubmitting}
            />
        )
    }

    return (
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <Send className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Apply to Project</h2>
                        <p className="text-sm text-gray-600">{project.title}</p>
                    </div>
                </div>
                <Button variant="outline" onClick={onCancel}>
                    <X className="w-4 h-4" />
                </Button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                        <h3 className="text-sm font-medium text-red-800">Application Error</h3>
                        <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                {/* Cover Letter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cover Letter
                        <span className="text-gray-500 font-normal ml-1">(Optional)</span>
                    </label>
                    <Textarea
                        {...register('cover_letter')}
                        placeholder="Tell the organization why you're interested in this project and what you can bring to it..."
                        rows={8}
                        className="min-h-[200px]"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                        Tip: Mention specific aspects of the project that interest you and highlight relevant experience.
                    </p>
                </div>

                {/* Portfolio Links */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <label className="block text-sm font-medium text-gray-700">
                            Portfolio Links
                            <span className="text-gray-500 font-normal ml-1">(Optional)</span>
                        </label>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addPortfolioLink}
                            className="flex items-center gap-1"
                        >
                            <Plus className="w-4 h-4" />
                            Add Link
                        </Button>
                    </div>

                    {fields.length === 0 ? (
                        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                            <LinkIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">No portfolio links added yet</p>
                            <p className="text-xs text-gray-400 mt-1">
                                Add links to your projects, GitHub repos, or portfolio
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {fields.map((field, index) => (
                                <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <h4 className="text-sm font-medium text-gray-900">Link {index + 1}</h4>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removePortfolioLink(index)}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-1 gap-3">
                                        <FormField
                                            label="Title"
                                            error={errors.portfolio_links?.[index]?.title?.message}
                                        >
                                            <input
                                                {...register(`portfolio_links.${index}.title` as const, {
                                                    required: fields[index]?.url ? 'Title is required when URL is provided' : false
                                                })}
                                                type="text"
                                                placeholder="e.g., Personal Portfolio, GitHub Project"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                            />
                                        </FormField>

                                        <FormField
                                            label="URL"
                                            error={errors.portfolio_links?.[index]?.url?.message}
                                        >
                                            <input
                                                {...register(`portfolio_links.${index}.url` as const, {
                                                    required: fields[index]?.title ? 'URL is required when title is provided' : false,
                                                    validate: (value) => !value || validateUrl(value)
                                                })}
                                                type="url"
                                                placeholder="https://..."
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                            />
                                        </FormField>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <p className="text-sm text-gray-500 mt-2">
                        Share relevant projects or repositories that showcase your skills for this project.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={!isValid}>
                        Review Application
                    </Button>
                </div>
            </form>
        </div>
    )
} 