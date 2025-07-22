import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout'
import { DeveloperProfileStep } from './DeveloperProfileStep'
import { OrganizationProfileStep } from './OrganizationProfileStep'
import { WelcomeStep } from './WelcomeStep'

const DEVELOPER_STEPS = [
    {
        id: 'welcome',
        title: 'Welcome',
        description: 'Getting started'
    },
    {
        id: 'profile',
        title: 'Profile',
        description: 'Complete your profile'
    },
    {
        id: 'complete',
        title: 'Complete',
        description: 'All set!'
    }
]

const ORGANIZATION_STEPS = [
    {
        id: 'welcome',
        title: 'Welcome',
        description: 'Getting started'
    },
    {
        id: 'profile',
        title: 'Organization',
        description: 'Organization details'
    },
    {
        id: 'complete',
        title: 'Complete',
        description: 'All set!'
    }
]

export const OnboardingPage: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(1)
    const { profile, loading, isAuthenticated, updateProfile } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        // Redirect if not authenticated
        if (!loading && !isAuthenticated) {
            navigate('/auth/login')
            return
        }

        // If user already has completed onboarding, redirect to dashboard
        if (profile && profile.onboarding_complete) {
            const dashboardPath = (profile.role === 'developer' || profile.role === 'admin') ? '/dashboard' : '/organization/dashboard'
            navigate(dashboardPath)
        }
    }, [loading, isAuthenticated, profile, navigate])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        )
    }

    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-lg font-medium text-gray-900">Loading profile...</h2>
                </div>
            </div>
        )
    }

    const steps = (profile.role === 'developer' || profile.role === 'admin') ? DEVELOPER_STEPS : ORGANIZATION_STEPS
    const title = (profile.role === 'developer' || profile.role === 'admin')
        ? 'Welcome to DevTogether!'
        : 'Welcome to DevTogether!'
    const subtitle = (profile.role === 'developer' || profile.role === 'admin')
        ? 'Let\'s set up your developer profile'
        : 'Let\'s set up your organization profile'

    const handleNext = () => {
        if (currentStep < steps.length) {
            setCurrentStep(currentStep + 1)
        }
    }

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
        }
    }

    const handleComplete = async () => {
        try {
            // Mark onboarding as complete
            const { success, error } = await updateProfile({ onboarding_complete: true })
            
            if (success) {
                // Navigate based on role
                if (profile?.role === 'organization') {
                    navigate('/pending-approval')
                } else {
                    const dashboardPath = (profile?.role === 'developer' || profile?.role === 'admin') ? '/dashboard' : '/organization/dashboard'
                    navigate(dashboardPath)
                }
            } else {
                console.error('Failed to complete onboarding:', error)
            }
        } catch (error) {
            console.error('Error completing onboarding:', error)
        }
    }

    const renderCurrentStep = () => {
        const stepId = steps[currentStep - 1]?.id

        switch (stepId) {
            case 'welcome':
                return (
                    <WelcomeStep
                        userRole={profile.role}
                        onNext={handleNext}
                    />
                )
            case 'profile':
                if (profile.role === 'developer' || profile.role === 'admin') {
                    return (
                        <DeveloperProfileStep
                            onNext={handleNext}
                            onBack={handleBack}
                        />
                    )
                } else {
                    return (
                        <OrganizationProfileStep
                            onNext={handleNext}
                            onBack={handleBack}
                        />
                    )
                }
            case 'complete':
                return (
                    <WelcomeStep
                        userRole={profile.role}
                        isComplete={true}
                        onNext={handleComplete}
                    />
                )
            default:
                return null
        }
    }

    return (
        <OnboardingLayout
            currentStep={currentStep}
            steps={steps}
            title={title}
            subtitle={subtitle}
        >
            {renderCurrentStep()}
        </OnboardingLayout>
    )
}

export default OnboardingPage 