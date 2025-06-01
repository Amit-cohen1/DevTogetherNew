import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Layout } from '../../components/layout'
import type { PasswordResetData } from '../../services/auth'

interface ForgotPasswordFormData {
    email: string
}

export const ForgotPasswordPage: React.FC = () => {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [authError, setAuthError] = useState<string | null>(null)
    const [submittedEmail, setSubmittedEmail] = useState<string>('')

    const { resetPassword } = useAuth()

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<ForgotPasswordFormData>()

    const onSubmit = async (data: ForgotPasswordFormData) => {
        try {
            setIsSubmitting(true)
            setAuthError(null)

            const resetData: PasswordResetData = {
                email: data.email
            }

            const { success, error } = await resetPassword(resetData)

            if (success) {
                setSubmittedEmail(data.email)
                setIsSuccess(true)
            } else {
                setAuthError(error || 'Failed to send reset email. Please try again.')
            }
        } catch (error) {
            setAuthError('An unexpected error occurred. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isSuccess) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-md w-full space-y-8">
                        <div className="text-center">
                            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                            <h2 className="mt-6 text-3xl font-bold text-gray-900">
                                Check your email
                            </h2>
                            <p className="mt-2 text-sm text-gray-600">
                                We've sent a password reset link to{' '}
                                <span className="font-medium text-gray-900">{submittedEmail}</span>
                            </p>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                            <div className="text-sm text-blue-600 space-y-2">
                                <p>
                                    <strong>Next steps:</strong>
                                </p>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Check your email inbox for the reset link</li>
                                    <li>Click the link to create a new password</li>
                                    <li>Don't forget to check your spam folder</li>
                                </ul>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Button
                                type="button"
                                size="lg"
                                className="w-full"
                                onClick={() => {
                                    setIsSuccess(false)
                                    setSubmittedEmail('')
                                }}
                            >
                                Send another email
                            </Button>

                            <div className="text-center">
                                <Link
                                    to="/auth/login"
                                    className="inline-flex items-center text-sm text-primary-600 hover:text-primary-500 font-medium"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-1" />
                                    Back to sign in
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        )
    }

    return (
        <Layout>
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    {/* Header */}
                    <div className="text-center">
                        <Link to="/" className="flex items-center justify-center space-x-3 mb-6">
                            <img
                                src="/images/devtogether-icon.svg"
                                alt="DevTogether"
                                className="w-12 h-12"
                            />
                            <span className="text-2xl font-bold text-gray-900">DevTogether</span>
                        </Link>
                        <h2 className="mt-6 text-3xl font-bold text-gray-900">
                            Reset your password
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Enter your email address and we'll send you a link to reset your password
                        </p>
                    </div>

                    {/* Error Alert */}
                    {authError && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-4">
                            <div className="text-sm text-red-600">{authError}</div>
                        </div>
                    )}

                    {/* Reset Form */}
                    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        <Input
                            label="Email address"
                            type="email"
                            required
                            icon={<Mail className="w-5 h-5" />}
                            placeholder="Enter your email address"
                            error={errors.email?.message}
                            {...register('email', {
                                required: 'Email is required',
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: 'Please enter a valid email address'
                                }
                            })}
                        />

                        <Button
                            type="submit"
                            size="lg"
                            className="w-full"
                            loading={isSubmitting}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Sending reset link...' : 'Send reset link'}
                        </Button>
                    </form>

                    {/* Back to Login */}
                    <div className="text-center">
                        <Link
                            to="/auth/login"
                            className="inline-flex items-center text-sm text-primary-600 hover:text-primary-500 font-medium"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Back to sign in
                        </Link>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default ForgotPasswordPage 