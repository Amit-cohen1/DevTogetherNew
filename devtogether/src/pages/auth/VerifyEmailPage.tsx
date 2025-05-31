import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Mail, RefreshCw } from 'lucide-react'
import { Button } from '../../components/ui/Button'

export const VerifyEmailPage: React.FC = () => {
    const location = useLocation()
    const email = (location.state as any)?.email || ''

    const handleResendEmail = () => {
        // This would trigger a resend verification email API call
        // For now, we'll just show a message
        alert('Verification email resent! Please check your inbox.')
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
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
                            <li>Check your inbox for an email from DevTogether</li>
                            <li>Click the verification link in the email</li>
                            <li>Don't forget to check your spam folder</li>
                            <li>The link will expire in 24 hours</li>
                        </ul>
                    </div>
                </div>

                <div className="space-y-4">
                    <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        className="w-full"
                        onClick={handleResendEmail}
                        icon={<RefreshCw className="w-4 h-4" />}
                    >
                        Resend verification email
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
                            href="mailto:support@devtogether.com"
                            className="text-primary-600 hover:text-primary-500"
                        >
                            support@devtogether.com
                        </a>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default VerifyEmailPage 