import React from 'react'
import { CheckCircle } from 'lucide-react'
import { cn } from '../../utils/cn'

interface OnboardingStep {
    id: string
    title: string
    description: string
}

interface OnboardingLayoutProps {
    children: React.ReactNode
    currentStep: number
    steps: OnboardingStep[]
    title: string
    subtitle?: string
}

export const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
    children,
    currentStep,
    steps,
    title,
    subtitle
}) => {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                    {subtitle && (
                        <p className="mt-2 text-lg text-gray-600">{subtitle}</p>
                    )}
                </div>

                {/* Progress Indicator */}
                <div className="mb-12">
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => {
                            const stepNumber = index + 1
                            const isCompleted = stepNumber < currentStep
                            const isCurrent = stepNumber === currentStep
                            const isUpcoming = stepNumber > currentStep

                            return (
                                <React.Fragment key={step.id}>
                                    <div className="flex flex-col items-center">
                                        {/* Step Circle */}
                                        <div
                                            className={cn(
                                                'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                                                {
                                                    'bg-primary-600 text-white': isCurrent,
                                                    'bg-green-500 text-white': isCompleted,
                                                    'bg-gray-200 text-gray-500': isUpcoming,
                                                }
                                            )}
                                        >
                                            {isCompleted ? (
                                                <CheckCircle className="w-6 h-6" />
                                            ) : (
                                                stepNumber
                                            )}
                                        </div>

                                        {/* Step Label */}
                                        <div className="mt-3 text-center max-w-24">
                                            <div
                                                className={cn(
                                                    'text-sm font-medium',
                                                    {
                                                        'text-primary-600': isCurrent,
                                                        'text-green-600': isCompleted,
                                                        'text-gray-500': isUpcoming,
                                                    }
                                                )}
                                            >
                                                {step.title}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {step.description}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Connector Line */}
                                    {index < steps.length - 1 && (
                                        <div
                                            className={cn(
                                                'flex-1 h-0.5 mx-4 transition-colors',
                                                {
                                                    'bg-green-500': stepNumber < currentStep,
                                                    'bg-gray-200': stepNumber >= currentStep,
                                                }
                                            )}
                                        />
                                    )}
                                </React.Fragment>
                            )
                        })}
                    </div>
                </div>

                {/* Content */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-8">
                        {children}
                    </div>
                </div>

                {/* Footer Help Text */}
                <div className="text-center mt-8">
                    <p className="text-sm text-gray-500">
                        Need help? Contact us at{' '}
                        <a
                            href="mailto:support@devtogether.com"
                            className="text-primary-600 hover:text-primary-500 font-medium"
                        >
                            support@devtogether.com
                        </a>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default OnboardingLayout 