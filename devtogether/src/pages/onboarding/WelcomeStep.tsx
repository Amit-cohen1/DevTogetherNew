import React from 'react'
import { CheckCircle, Code, Building, Sparkles, ArrowRight, Heart, Users, Trophy } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import type { UserRole } from '../../types/database'

interface WelcomeStepProps {
    userRole: UserRole
    isComplete?: boolean
    onNext: () => void
}

export const WelcomeStep: React.FC<WelcomeStepProps> = ({
    userRole,
    isComplete = false,
    onNext
}) => {
    if (isComplete) {
        return (
            <div className="text-center space-y-8">
                {/* Celebration Animation */}
                <div className="relative">
                    <div className="mx-auto w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl relative overflow-hidden">
                        {/* Sparkles Animation */}
                        <div className="absolute inset-0 animate-ping bg-green-300 rounded-full opacity-20"></div>
                        <div className="absolute -top-2 -right-2 text-yellow-400 animate-bounce">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <div className="absolute -bottom-2 -left-2 text-yellow-400 animate-bounce delay-150">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <CheckCircle className="w-12 h-12 text-white relative z-10" />
                    </div>
                </div>

                {/* Success Message */}
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full border border-green-200">
                        <Trophy className="w-5 h-5 text-green-600" />
                        <span className="text-green-800 font-semibold text-sm">Profile Complete!</span>
                    </div>
                    
                    <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        You're all set!
                    </h2>
                    
                    <p className="text-lg text-gray-600 max-w-md mx-auto leading-relaxed">
                        {(userRole === 'developer' || userRole === 'admin')
                            ? 'Your developer profile is complete. Start exploring projects and connecting with organizations to make a real impact.'
                            : 'Your organization profile is complete. You can now start posting projects and finding talented developers to help your mission.'
                        }
                    </p>
                </div>

                {/* Benefits Preview */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
                    {(userRole === 'developer' || userRole === 'admin') ? (
                        <>
                            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                                <Code className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                                <h3 className="font-semibold text-blue-900 text-sm">Build Portfolio</h3>
                                <p className="text-xs text-blue-700 mt-1">Work on real projects</p>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-100">
                                <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                                <h3 className="font-semibold text-purple-900 text-sm">Network</h3>
                                <p className="text-xs text-purple-700 mt-1">Connect with organizations</p>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                                <Heart className="w-8 h-8 text-green-600 mx-auto mb-2" />
                                <h3 className="font-semibold text-green-900 text-sm">Make Impact</h3>
                                <p className="text-xs text-green-700 mt-1">Help worthy causes</p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                                <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                                <h3 className="font-semibold text-blue-900 text-sm">Find Talent</h3>
                                <p className="text-xs text-blue-700 mt-1">Connect with developers</p>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-100">
                                <Code className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                                <h3 className="font-semibold text-purple-900 text-sm">Build Solutions</h3>
                                <p className="text-xs text-purple-700 mt-1">Create digital impact</p>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                                <Heart className="w-8 h-8 text-green-600 mx-auto mb-2" />
                                <h3 className="font-semibold text-green-900 text-sm">Scale Mission</h3>
                                <p className="text-xs text-green-700 mt-1">Amplify your reach</p>
                            </div>
                        </>
                    )}
                </div>

                {/* Enhanced CTA Button */}
                <div className="pt-4">
                    <Button
                        onClick={onNext}
                        size="lg"
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 px-8 py-4 text-lg font-semibold"
                        icon={<ArrowRight className="w-5 h-5" />}
                    >
                        {(userRole === 'developer' || userRole === 'admin') ? 'Explore Projects' : 'Go to Dashboard'}
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="text-center space-y-8">
            {/* Enhanced Icon */}
            <div className="relative">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden group">
                    {/* Background Animation */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-indigo-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Floating Particles */}
                    <div className="absolute top-2 right-2 w-1 h-1 bg-blue-400 rounded-full animate-ping delay-100"></div>
                    <div className="absolute bottom-3 left-3 w-1 h-1 bg-indigo-400 rounded-full animate-ping delay-300"></div>
                    
                    {(userRole === 'developer' || userRole === 'admin') ? (
                        <Code className="w-10 h-10 text-blue-600 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                    ) : (
                        <Building className="w-10 h-10 text-indigo-600 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                    )}
                </div>
            </div>

            {/* Enhanced Welcome Message */}
            <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full border border-blue-200">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span className="text-blue-800 font-semibold text-sm">Welcome to DevTogether</span>
                </div>
                
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent leading-tight">
                    Let's Get Started!
                </h2>
                
                <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                    {(userRole === 'developer' || userRole === 'admin')
                        ? 'Connect with nonprofit organizations and gain real-world experience while making a positive impact through technology.'
                        : 'Find talented developers to help bring your nonprofit\'s mission to life through innovative technology solutions.'
                    }
                </p>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8 max-w-3xl mx-auto">
                {(userRole === 'developer' || userRole === 'admin') ? (
                    <>
                        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:shadow-md transition-shadow">
                            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mb-3 mx-auto">
                                <Code className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="font-semibold text-blue-900 mb-1">Real Projects</h3>
                            <p className="text-sm text-blue-700">Work on meaningful projects that matter</p>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 hover:shadow-md transition-shadow">
                            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mb-3 mx-auto">
                                <Users className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="font-semibold text-purple-900 mb-1">Connect</h3>
                            <p className="text-sm text-purple-700">Network with like-minded organizations</p>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
                            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mb-3 mx-auto">
                                <Heart className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="font-semibold text-green-900 mb-1">Make Impact</h3>
                            <p className="text-sm text-green-700">Create positive change in the world</p>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:shadow-md transition-shadow">
                            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mb-3 mx-auto">
                                <Users className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="font-semibold text-blue-900 mb-1">Find Talent</h3>
                            <p className="text-sm text-blue-700">Connect with skilled developers</p>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 hover:shadow-md transition-shadow">
                            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mb-3 mx-auto">
                                <Code className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="font-semibold text-purple-900 mb-1">Build Solutions</h3>
                            <p className="text-sm text-purple-700">Create digital tools for your mission</p>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
                            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mb-3 mx-auto">
                                <Heart className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="font-semibold text-green-900 mb-1">Scale Impact</h3>
                            <p className="text-sm text-green-700">Amplify your organization's reach</p>
                        </div>
                    </>
                )}
            </div>

            {/* Enhanced CTA Button */}
            <div className="pt-6">
                <Button
                    onClick={onNext}
                    size="lg"
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 px-8 py-4 text-lg font-semibold"
                    icon={<ArrowRight className="w-5 h-5" />}
                >
                    Get Started
                </Button>
            </div>
        </div>
    )
}

export default WelcomeStep 