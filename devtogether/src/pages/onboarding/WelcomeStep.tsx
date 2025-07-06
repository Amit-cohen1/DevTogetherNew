import React from 'react'
import { CheckCircle, Code, Building } from 'lucide-react'
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
            <div className="text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        You're all set!
                    </h2>
                    <p className="text-gray-600">
                        {(userRole === 'developer' || userRole === 'admin')
                            ? 'Your developer profile is complete. Start exploring projects and connecting with organizations.'
                            : 'Your organization profile is complete. You can now start posting projects and finding talented developers.'
                        }
                    </p>
                </div>

                <Button
                    onClick={onNext}
                    size="lg"
                    className="w-full sm:w-auto"
                >
                    {(userRole === 'developer' || userRole === 'admin') ? 'Explore Projects' : 'Go to Dashboard'}
                </Button>
            </div>
        )
    }

    return (
        <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                {(userRole === 'developer' || userRole === 'admin') ? (
                    <Code className="w-8 h-8 text-primary-600" />
                ) : (
                    <Building className="w-8 h-8 text-primary-600" />
                )}
            </div>

            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Welcome to DevTogether!
                </h2>
                <p className="text-gray-600">
                    {(userRole === 'developer' || userRole === 'admin')
                        ? 'Connect with nonprofit organizations and gain real-world experience while making a positive impact.'
                        : 'Find talented developers to help bring your nonprofit\'s mission to life through technology.'
                    }
                </p>
            </div>

            <Button
                onClick={onNext}
                size="lg"
                className="w-full sm:w-auto"
            >
                Get Started
            </Button>
        </div>
    )
}

export default WelcomeStep 