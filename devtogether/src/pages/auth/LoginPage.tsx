import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Mail, Lock, Github } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import type { SignInData } from '../../services/auth'

interface LoginFormData {
    email: string
    password: string
}

export const LoginPage: React.FC = () => {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [authError, setAuthError] = useState<string | null>(null)

    const { signIn, signInWithOAuth } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const from = (location.state as any)?.from || '/'

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<LoginFormData>()

    const onSubmit = async (data: LoginFormData) => {
        try {
            setIsSubmitting(true)
            setAuthError(null)

            const signInData: SignInData = {
                email: data.email,
                password: data.password
            }

            const { success, error } = await signIn(signInData)

            if (success) {
                navigate(from, { replace: true })
            } else {
                setAuthError(error || 'Login failed. Please try again.')
            }
        } catch (error) {
            setAuthError('An unexpected error occurred. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleOAuthSignIn = async (provider: 'google' | 'github') => {
        try {
            setAuthError(null)
            const { success, error } = await signInWithOAuth(provider)

            if (!success && error) {
                setAuthError(error)
            }
            // Note: OAuth redirects happen automatically, so we don't navigate here
        } catch (error) {
            setAuthError('OAuth sign-in failed. Please try again.')
        }
    }

    return (
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
                        Welcome back
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Sign in to your DevTogether account
                    </p>
                </div>

                {/* Error Alert */}
                {authError && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                        <div className="text-sm text-red-600">{authError}</div>
                    </div>
                )}

                {/* OAuth Buttons */}
                <div className="space-y-3">
                    <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        className="w-full"
                        onClick={() => handleOAuthSignIn('google')}
                        icon={
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                        }
                    >
                        Continue with Google
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        className="w-full"
                        onClick={() => handleOAuthSignIn('github')}
                        icon={<Github className="w-5 h-5" />}
                    >
                        Continue with GitHub
                    </Button>
                </div>

                {/* Divider */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-gray-50 text-gray-500">Or continue with email</span>
                    </div>
                </div>

                {/* Login Form */}
                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-4">
                        <Input
                            label="Email address"
                            type="email"
                            required
                            icon={<Mail className="w-5 h-5" />}
                            placeholder="Enter your email"
                            error={errors.email?.message}
                            {...register('email', {
                                required: 'Email is required',
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: 'Please enter a valid email address'
                                }
                            })}
                        />

                        <Input
                            label="Password"
                            type="password"
                            required
                            icon={<Lock className="w-5 h-5" />}
                            placeholder="Enter your password"
                            error={errors.password?.message}
                            {...register('password', {
                                required: 'Password is required',
                                minLength: {
                                    value: 6,
                                    message: 'Password must be at least 6 characters'
                                }
                            })}
                        />
                    </div>

                    {/* Forgot Password Link */}
                    <div className="flex items-center justify-end">
                        <Link
                            to="/auth/forgot-password"
                            className="text-sm text-primary-600 hover:text-primary-500 font-medium"
                        >
                            Forgot your password?
                        </Link>
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        size="lg"
                        className="w-full"
                        loading={isSubmitting}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Signing in...' : 'Sign in'}
                    </Button>
                </form>

                {/* Sign Up Link */}
                <div className="text-center">
                    <p className="text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link
                            to="/auth/register"
                            className="font-medium text-primary-600 hover:text-primary-500"
                        >
                            Sign up here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default LoginPage 