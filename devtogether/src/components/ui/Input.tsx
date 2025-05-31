import React, { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '../../utils/cn'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    helperText?: string
    required?: boolean
    icon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({
        className,
        type = 'text',
        label,
        error,
        helperText,
        required,
        icon,
        id,
        ...props
    }, ref) => {
        const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`

        const baseStyles = `
      w-full px-3 py-2 border rounded-md text-sm
      placeholder:text-gray-400
      focus:outline-none focus:ring-2 focus:ring-offset-0
      disabled:opacity-50 disabled:bg-gray-50 disabled:cursor-not-allowed
      transition-colors
    `

        const variants = {
            default: `
        border-gray-300 focus:ring-primary-500 focus:border-primary-500
      `,
            error: `
        border-red-300 focus:ring-red-500 focus:border-red-500
        text-red-900 placeholder:text-red-400
      `
        }

        const variant = error ? 'error' : 'default'

        return (
            <div className="space-y-1">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-gray-700"
                    >
                        {label}
                        {required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}

                <div className="relative">
                    {icon && (
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-400 text-sm">{icon}</span>
                        </div>
                    )}

                    <input
                        type={type}
                        id={inputId}
                        className={cn(
                            baseStyles,
                            variants[variant],
                            icon ? 'pl-10' : '',
                            className
                        )}
                        ref={ref}
                        {...props}
                    />
                </div>

                {error && (
                    <p className="text-sm text-red-600">{error}</p>
                )}

                {helperText && !error && (
                    <p className="text-sm text-gray-500">{helperText}</p>
                )}
            </div>
        )
    }
)

Input.displayName = 'Input'

export { Input }
export default Input 