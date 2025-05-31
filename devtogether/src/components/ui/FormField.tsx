import React from 'react'
import { AlertCircle } from 'lucide-react'

interface FormFieldProps {
    label: string
    children: React.ReactNode
    error?: string
    required?: boolean
    description?: string
    className?: string
}

export function FormField({
    label,
    children,
    error,
    required,
    description,
    className = ''
}: FormFieldProps) {
    return (
        <div className={`space-y-2 ${className}`}>
            <label className="block text-sm font-medium text-gray-700">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {description && (
                <p className="text-sm text-gray-500">{description}</p>
            )}

            {children}

            {error && (
                <div className="flex items-center text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    )
} 