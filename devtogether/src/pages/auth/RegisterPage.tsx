import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Mail, Lock, User, Building, Github } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Layout } from '../../components/layout'
import type { SignUpData } from '../../services/auth'
import type { UserRole } from '../../types/database'

interface RegisterFormData {
    email: string
    password: string
    confirmPassword: string
    role: UserRole
    firstName?: string
    lastName?: string
    organizationName?: string
}

export const RegisterPage: React.FC = () => {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [authError, setAuthError] = useState<string | null>(null)
    const [selectedRole, setSelectedRole] = useState<UserRole>('developer')

    const { signUp, signInWithOAuth } = useAuth()
    const navigate = useNavigate()

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue
    } = useForm<RegisterFormData>({
        defaultValues: {
            role: 'developer'
        }
    })

    const password = watch('password')

    const onSubmit = async (data: RegisterFormData) => {
        try {
            setIsSubmitting(true)
            setAuthError(null)

            const signUpData: SignUpData = {
                email: data.email,
                password: data.password,
                role: data.role,
                firstName: data.firstName,
                lastName: data.lastName,
                organizationName: data.organizationName
            }

            const { success, error } = await signUp(signUpData)

            if (success) {
                if (data.role === 'organization') {
                    navigate('/pending-approval')
                } else {
                    navigate('/auth/verify-email', {
                        state: { email: data.email }
                    })
                }
            } else {
                setAuthError(error || 'Registration failed. Please try again.')
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
        } catch (error) {
            setAuthError('OAuth sign-in failed. Please try again.')
        }
    }

    const handleRoleChange = (role: UserRole) => {
        setSelectedRole(role)
        setValue('role', role)
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
                            Create your account
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Join DevTogether and start collaborating
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

                    {/* Registration Form */}
                    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        {/* Role Selection */}
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-700">
                                I am a... <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => handleRoleChange('developer')}
                                    className={`p-4 border-2 rounded-lg text-center transition-colors ${selectedRole === 'developer'
                                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <User className="w-6 h-6 mx-auto mb-2" />
                                    <div className="font-medium text-sm">Developer</div>
                                    <div className="text-xs text-gray-500">Looking for projects</div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleRoleChange('organization')}
                                    className={`p-4 border-2 rounded-lg text-center transition-colors ${selectedRole === 'organization'
                                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <Building className="w-6 h-6 mx-auto mb-2" />
                                    <div className="font-medium text-sm">Organization</div>
                                    <div className="text-xs text-gray-500">Posting projects</div>
                                </button>
                            </div>
                        </div>

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

                            {selectedRole === 'developer' ? (
                                <div className="grid grid-cols-2 gap-3">
                                    <Input
                                        label="First name"
                                        required
                                        placeholder="First name"
                                        error={errors.firstName?.message}
                                        {...register('firstName', {
                                            required: 'First name is required'
                                        })}
                                    />

                                    <Input
                                        label="Last name"
                                        required
                                        placeholder="Last name"
                                        error={errors.lastName?.message}
                                        {...register('lastName', {
                                            required: 'Last name is required'
                                        })}
                                    />
                                </div>
                            ) : (
                                <Input
                                    label="Organization name"
                                    required
                                    placeholder="Enter organization name"
                                    error={errors.organizationName?.message}
                                    {...register('organizationName', {
                                        required: 'Organization name is required'
                                    })}
                                />
                            )}

                            <Input
                                label="Password"
                                type="password"
                                required
                                icon={<Lock className="w-5 h-5" />}
                                placeholder="Create a password"
                                error={errors.password?.message}
                                {...register('password', {
                                    required: 'Password is required',
                                    minLength: {
                                        value: 8,
                                        message: 'Password must be at least 8 characters'
                                    },
                                    pattern: {
                                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                                        message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
                                    }
                                })}
                            />

                            <Input
                                label="Confirm password"
                                type="password"
                                required
                                icon={<Lock className="w-5 h-5" />}
                                placeholder="Confirm your password"
                                error={errors.confirmPassword?.message}
                                {...register('confirmPassword', {
                                    required: 'Please confirm your password',
                                    validate: value =>
                                        value === password || 'Passwords do not match'
                                })}
                            />
                        </div>

                        {/* Terms Agreement */}
                        <div className="text-xs text-gray-500">
                            By creating an account, you agree to our{' '}
                            <Link to="/terms" className="text-primary-600 hover:text-primary-500">
                                Terms of Service
                            </Link>{' '}
                            and{' '}
                            <Link to="/privacy" className="text-primary-600 hover:text-primary-500">
                                Privacy Policy
                            </Link>
                            .
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            size="lg"
                            className="w-full"
                            loading={isSubmitting}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Creating account...' : 'Create account'}
                        </Button>
                    </form>

                    {/* Sign In Link */}
                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link
                                to="/auth/login"
                                className="font-medium text-primary-600 hover:text-primary-500"
                            >
                                Sign in here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default RegisterPage 