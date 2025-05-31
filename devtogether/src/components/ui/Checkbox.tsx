import React, { forwardRef } from 'react'
import { Check } from 'lucide-react'

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label?: string
    description?: string
    error?: boolean
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
    ({ className = '', label, description, error, checked, ...props }, ref) => {
        const baseClasses = `
      h-4 w-4 text-primary-600 border-gray-300 rounded 
      focus:ring-primary-500 focus:ring-2 focus:ring-offset-0
      disabled:opacity-50 disabled:cursor-not-allowed
    `

        const errorClasses = error
            ? 'border-red-300 focus:ring-red-500'
            : ''

        if (label) {
            return (
                <label className="flex items-start cursor-pointer">
                    <input
                        ref={ref}
                        type="checkbox"
                        checked={checked}
                        className={`${baseClasses} ${errorClasses} ${className} mt-1`}
                        {...props}
                    />
                    <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                            {label}
                        </div>
                        {description && (
                            <div className="text-sm text-gray-500">
                                {description}
                            </div>
                        )}
                    </div>
                </label>
            )
        }

        return (
            <input
                ref={ref}
                type="checkbox"
                checked={checked}
                className={`${baseClasses} ${errorClasses} ${className}`}
                {...props}
            />
        )
    }
)

Checkbox.displayName = 'Checkbox' 