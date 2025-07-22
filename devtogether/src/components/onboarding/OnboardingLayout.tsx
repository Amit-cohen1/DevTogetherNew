import React from 'react'
import { CheckCircle, Sparkles } from 'lucide-react'
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
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%227%22%20cy%3D%227%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>

            <div className="relative z-10 max-w-5xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
                {/* Enhanced Header */}
                <div className="text-center mb-8 sm:mb-12">
                    <div className="flex items-center justify-center mb-4">
                        <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl shadow-sm">
                            <Sparkles className="w-8 h-8 text-indigo-600" />
                        </div>
                    </div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent mb-3">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                            {subtitle}
                        </p>
                    )}
                </div>

                {/* Enhanced Progress Indicator */}
                <div className="mb-8 sm:mb-12">
                    <div className="flex items-center justify-between max-w-2xl mx-auto px-4">
                        {steps.map((step, index) => {
                            const stepNumber = index + 1
                            const isCompleted = stepNumber < currentStep
                            const isCurrent = stepNumber === currentStep
                            const isUpcoming = stepNumber > currentStep

                            return (
                                <React.Fragment key={step.id}>
                                    <div className="flex flex-col items-center relative">
                                        {/* Enhanced Step Circle */}
                                        <div className="relative">
                                            {(isCurrent || isCompleted) && (
                                                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full blur-sm opacity-60 animate-pulse"></div>
                                            )}
                                            <div
                                                className={cn(
                                                    'relative w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-sm sm:text-base font-bold transition-all duration-300 transform border-4',
                                                    {
                                                        'bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-blue-300 shadow-lg scale-110': isCurrent,
                                                        'bg-gradient-to-br from-green-500 to-emerald-600 text-white border-green-300 shadow-lg': isCompleted,
                                                        'bg-white text-gray-400 border-gray-200 shadow-sm': isUpcoming,
                                                    }
                                                )}
                                            >
                                                {isCompleted ? (
                                                    <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7" />
                                                ) : (
                                                    stepNumber
                                                )}
                                            </div>
                                        </div>

                                        {/* Enhanced Step Label */}
                                        <div className="mt-3 sm:mt-4 text-center max-w-20 sm:max-w-24">
                                            <div
                                                className={cn(
                                                    'text-xs sm:text-sm font-semibold transition-colors',
                                                    {
                                                        'text-blue-600': isCurrent,
                                                        'text-green-600': isCompleted,
                                                        'text-gray-500': isUpcoming,
                                                    }
                                                )}
                                            >
                                                {step.title}
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1 hidden sm:block">
                                                {step.description}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Enhanced Connector Line */}
                                    {index < steps.length - 1 && (
                                        <div className="flex-1 mx-2 sm:mx-4 relative">
                                            <div
                                                className={cn(
                                                    'h-1 rounded-full transition-all duration-500',
                                                    {
                                                        'bg-gradient-to-r from-green-400 to-emerald-500 shadow-sm': stepNumber < currentStep,
                                                        'bg-gradient-to-r from-blue-400 to-indigo-500 shadow-sm': stepNumber === currentStep - 1,
                                                        'bg-gray-200': stepNumber >= currentStep,
                                                    }
                                                )}
                                            />
                                        </div>
                                    )}
                                </React.Fragment>
                            )
                        })}
                    </div>
                </div>

                {/* Enhanced Content Card */}
                <div className="relative">
                    {/* Card Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-indigo-400/20 rounded-3xl blur-xl"></div>
                    
                    {/* Main Card */}
                    <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
                        {/* Card Header Accent */}
                        <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
                        
                        {/* Content */}
                        <div className="p-6 sm:p-8 lg:p-12">
                            {children}
                        </div>
                    </div>
                </div>

                {/* Enhanced Footer */}
                <div className="text-center mt-8 sm:mt-12">
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/60 backdrop-blur-sm rounded-full border border-gray-200/50 shadow-sm">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <p className="text-sm text-gray-600">
                            Need help? Contact us at{' '}
                            <a
                                href="mailto:devtogether.help@gmail.com"
                                className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
                            >
                                devtogether.help@gmail.com
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OnboardingLayout 