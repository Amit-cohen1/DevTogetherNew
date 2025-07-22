import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Mail, RefreshCw, CheckCircle } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Layout } from '../../components/layout'
import { useAuth } from '../../contexts/AuthContext'

export const VerifyEmailPage: React.FC = () => {
    const location = useLocation()
    const email = (location.state as any)?.email || 'your email'
    const { resendEmailVerification } = useAuth()
    
    const [isResending, setIsResending] = useState(false)
    const [resendSuccess, setResendSuccess] = useState(false)
    const [resendError, setResendError] = useState<string | null>(null)

    const handleResendEmail = async () => {
        if (!email || email === 'your email') {
            setResendError('Email address is required to resend verification')
            return
        }

        setIsResending(true)
        setResendError(null)
        
        try {
            const { success, error } = await resendEmailVerification(email)
            
            if (success) {
                setResendSuccess(true)
                setTimeout(() => setResendSuccess(false), 5000) // Hide success after 5 seconds
            } else {
                setResendError(error || 'Failed to resend verification email')
            }
        } catch (error) {
            setResendError('An unexpected error occurred')
        } finally {
            setIsResending(false)
        }
    }

    return (
        <Layout>
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <Link to="/" className="flex items-center justify-center space-x-3 mb-6">
                            <img
                                src="/images/devtogether-icon.svg"
                                alt="DevTogether"
                                className="w-12 h-12"
                            />
                            <span className="text-2xl font-bold text-gray-900">DevTogether</span>
                        </Link>
                        <Mail className="mx-auto h-12 w-12 text-primary-600" />
                        <h2 className="mt-6 text-3xl font-bold text-gray-900">
                            Verify your email
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            We've sent a verification link to{' '}
                            {email && (
                                <span className="font-medium text-gray-900">{email}</span>
                            )}
                        </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                        <div className="text-sm text-blue-600 space-y-2">
                            <p>
                                <strong>Please check your email and click the verification link to continue.</strong>
                            </p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Check your inbox for an email from Supabase</li>
                                <li>Click the verification link in the email</li>
                                <li>Don't forget to check your spam folder</li>
                                <li>The link will expire in 24 hours</li>
                            </ul>
                            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                                <p className="text-xs text-yellow-700">
                                    <strong>Note:</strong> Email verification is limited during development. 
                                    For faster registration, use Google or GitHub instead.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Error Alert */}
                    {resendError && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-4">
                            <div className="text-sm text-red-600">{resendError}</div>
                        </div>
                    )}

                    {/* Success Alert */}
                    {resendSuccess && (
                        <div className="bg-green-50 border border-green-200 rounded-md p-4">
                            <div className="flex items-center gap-2 text-sm text-green-600">
                                <CheckCircle className="w-4 h-4" />
                                <span>Verification email sent successfully! Please check your inbox.</span>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            className="w-full"
                            onClick={handleResendEmail}
                            icon={<RefreshCw className="w-4 h-4" />}
                            loading={isResending}
                            disabled={isResending}
                        >
                            {isResending ? 'Sending...' : 'Resend verification email'}
                        </Button>

                        <div className="text-center">
                            <p className="text-sm text-gray-600">
                                Already verified?{' '}
                                <Link
                                    to="/auth/login"
                                    className="font-medium text-primary-600 hover:text-primary-500"
                                >
                                    Sign in here
                                </Link>
                            </p>
                        </div>
                    </div>

                    <div className="text-center">
                        <p className="text-xs text-gray-500">
                            Having trouble? Contact our support team at{' '}
                            <a
                                href="mailto:devtogether.help@gmail.com"
                                className="text-primary-600 hover:text-primary-500"
                            >
                                devtogether.help@gmail.com
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default VerifyEmailPage 