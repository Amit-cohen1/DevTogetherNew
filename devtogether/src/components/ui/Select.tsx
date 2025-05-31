import React, { forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    error?: boolean
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ className = '', error, children, ...props }, ref) => {
        const baseClasses = `
      block w-full px-3 py-2 border rounded-md shadow-sm bg-white
      text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
      disabled:opacity-50 disabled:cursor-not-allowed appearance-none
    `

        const errorClasses = error
            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
            : 'border-gray-300'

        return (
            <div className="relative">
                <select
                    ref={ref}
                    className={`${baseClasses} ${errorClasses} ${className}`}
                    {...props}
                >
                    {children}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
            </div>
        )
    }
)

Select.displayName = 'Select' 