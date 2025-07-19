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
    CheckCircle,
    Edit3,
    ArrowLeft,
    Trash2
} from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
import { Project } from '../../types/database'
import { applicationService, ApplicationCreateData } from '../../services/applications'
import { useAuth } from '../../contexts/AuthContext'
import { toastService } from '../../services/toastService'

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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Review Your Application</h3>
                    <p className="text-sm text-gray-600">Please review your application before submitting</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={onEdit} disabled={isSubmitting}>
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit
                    </Button>
                </div>
            </div>

            {/* Application Preview */}
            <div className="bg-gray-50 rounded-xl p-6 space-y-6">
                {/* Project Info */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2">Applying to:</h4>
                    <div className="text-sm text-gray-600">
                        <p className="font-medium text-gray-900">{project.title}</p>
                        <p>Application Date: {formatDate(new Date().toISOString())}</p>
                    </div>
                </div>

                {/* Developer Information */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Your Information
                    </h4>
                    <div className="space-y-3">
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
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {developer.skills.map((skill, index) => (
                                        <span
                                            key={index}
                                            className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded text-xs font-medium"
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
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Cover Letter
                    </h4>
                    {formData.cover_letter ? (
                        <div className="prose prose-sm max-w-none">
                            <p className="text-gray-900 whitespace-pre-line leading-relaxed">
                                {formData.cover_letter}
                            </p>
                        </div>
                    ) : (
                        <p className="text-gray-500 italic">No cover letter provided</p>
                    )}
                </div>

                {/* Portfolio Links */}
                {formData.portfolio_links.length > 0 && (
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <h4 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <LinkIcon className="w-4 h-4" />
                            Portfolio Links
                        </h4>
                        <div className="space-y-3">
                            {formData.portfolio_links.map((link, index) => (
                                <div key={index} className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900">{link.title}</p>
                                        <p className="text-sm text-blue-600 hover:text-blue-700">
                                            <a href={link.url} target="_blank" rel="noopener noreferrer">
                                                {link.url}
                                            </a>
                                        </p>
                                    </div>
                                    <ExternalLink className="w-4 h-4 text-gray-400" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-between gap-3 pt-6 border-t border-gray-200">
                <Button variant="outline" onClick={onCancel} disabled={isSubmitting} className="w-full sm:w-auto">
                    Cancel
                </Button>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <Button variant="outline" onClick={onEdit} disabled={isSubmitting} className="w-full sm:w-auto">
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit Application
                    </Button>
                    <Button onClick={onSubmit} disabled={isSubmitting} className="w-full sm:w-auto">
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4 mr-2" />
                                Submit Application
                            </>
                        )}
                    </Button>
                </div>
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
            toastService.project.applicationSubmitted()

            // Show success message and close after delay
            setTimeout(() => {
                onSubmit()
            }, 2000)
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to submit application'
            setError(errorMessage)
            toastService.project.applicationError()
        } finally {
            setIsSubmitting(false)
        }
    }

    // Success state
    if (success) {
        return (
            <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Application Submitted!</h3>
                <p className="text-gray-600 mb-6">
                    Your application has been sent to the organization.
                    You'll hear back from them soon.
                </p>
                <Button onClick={onSubmit}>Done</Button>
            </div>
        )
    }

    // Preview step
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

    // Form step
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Apply to Project</h3>
                    <p className="text-sm text-gray-600">{project.title}</p>
                </div>
            </div>

            {/* Error message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                        <h4 className="text-sm font-medium text-red-800">Application Error</h4>
                        <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                {/* Cover Letter Section */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <h4 className="text-base font-semibold text-gray-900">Cover Letter</h4>
                        <span className="text-sm text-gray-500">(Optional)</span>
                    </div>
                    
                    <div className="space-y-3">
                        <Textarea
                            {...register('cover_letter')}
                            placeholder="Tell the organization why you're interested in this project and what you can bring to it..."
                            rows={8}
                            className="min-h-[200px] resize-none"
                        />
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-sm text-blue-800">
                                <strong>Tip:</strong> Mention specific aspects of the project that interest you and highlight relevant experience or skills.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Portfolio Links Section */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <LinkIcon className="w-5 h-5 text-blue-600" />
                            <h4 className="text-base font-semibold text-gray-900">Portfolio Links</h4>
                            <span className="text-sm text-gray-500">(Optional)</span>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addPortfolioLink}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Link
                        </Button>
                    </div>

                    {fields.length === 0 ? (
                        <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                            <LinkIcon className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                            <p className="text-sm text-gray-600 mb-3">No portfolio links added yet</p>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={addPortfolioLink}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Your First Link
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {fields.map((field, index) => (
                                <div key={field.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <div className="flex items-center justify-between mb-3">
                                        <h5 className="text-sm font-medium text-gray-900">
                                            Portfolio Link {index + 1}
                                        </h5>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => removePortfolioLink(index)}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Title <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                {...register(`portfolio_links.${index}.title`, {
                                                    required: 'Title is required'
                                                })}
                                                placeholder="e.g., My React Portfolio"
                                                error={errors.portfolio_links?.[index]?.title?.message}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                URL <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                {...register(`portfolio_links.${index}.url`, {
                                                    required: 'URL is required',
                                                    validate: validateUrl
                                                })}
                                                placeholder="https://your-portfolio.com"
                                                error={errors.portfolio_links?.[index]?.url?.message}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            
                            <div className="text-center">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addPortfolioLink}
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Another Link
                                </Button>
                            </div>
                        </div>
                    )}

                    <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <p className="text-sm text-gray-700">
                            <strong>Suggestions:</strong> Include links to your GitHub repositories, live projects, personal website, or other relevant work samples.
                        </p>
                    </div>
                </div>

                {/* Form Actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-between gap-3 pt-6 border-t border-gray-200">
                    <Button variant="outline" onClick={onCancel} className="w-full sm:w-auto">
                        Cancel
                    </Button>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <Button type="submit" className="w-full sm:w-auto">
                            <Eye className="w-4 h-4 mr-2" />
                            Preview Application
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    )
}