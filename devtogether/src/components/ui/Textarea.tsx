import React, { forwardRef } from 'react'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    error?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className = '', error, ...props }, ref) => {
        const baseClasses = `
      block w-full px-3 py-2 border rounded-md shadow-sm 
      placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
      disabled:opacity-50 disabled:cursor-not-allowed resize-vertical
    `

        const errorClasses = error
            ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
            : 'border-gray-300 text-gray-900'

        return (
            <textarea
                ref={ref}
                className={`${baseClasses} ${errorClasses} ${className}`}
                {...props}
            />
        )
    }
)

Textarea.displayName = 'Textarea' 