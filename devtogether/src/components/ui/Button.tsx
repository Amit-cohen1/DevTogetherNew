import React, { ButtonHTMLAttributes, forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '../../utils/cn'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
    size?: 'sm' | 'md' | 'lg'
    loading?: boolean
    icon?: React.ReactNode
    iconPosition?: 'left' | 'right'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({
        className,
        variant = 'primary',
        size = 'md',
        loading = false,
        disabled,
        children,
        icon,
        iconPosition = 'left',
        ...props
    }, ref) => {
        const baseStyles = `
      inline-flex items-center justify-center font-medium transition-colors
      focus:outline-none focus:ring-2 focus:ring-offset-2 
      disabled:opacity-50 disabled:pointer-events-none
      relative
    `

        const variants = {
            primary: `
        bg-primary-600 text-white hover:bg-primary-700 
        focus:ring-primary-500 border border-transparent
      `,
            secondary: `
        bg-secondary-600 text-white hover:bg-secondary-700 
        focus:ring-secondary-500 border border-transparent
      `,
            outline: `
        border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 
        focus:ring-primary-500
      `,
            ghost: `
        text-gray-700 hover:bg-gray-100 focus:ring-primary-500
        border border-transparent
      `,
            danger: `
        bg-red-600 text-white hover:bg-red-700 
        focus:ring-red-500 border border-transparent
      `
        }

        const sizes = {
            sm: 'px-3 py-2 text-sm rounded-md gap-1.5',
            md: 'px-4 py-2 text-sm rounded-md gap-2',
            lg: 'px-6 py-3 text-base rounded-lg gap-2'
        }

        return (
            <button
                className={cn(
                    baseStyles,
                    variants[variant],
                    sizes[size],
                    className
                )}
                disabled={disabled || loading}
                ref={ref}
                {...props}
            >
                {loading && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                )}

                {!loading && icon && iconPosition === 'left' && (
                    <span className="shrink-0">{icon}</span>
                )}

                {children}

                {!loading && icon && iconPosition === 'right' && (
                    <span className="shrink-0">{icon}</span>
                )}
            </button>
        )
    }
)

Button.displayName = 'Button'

export { Button }
export default Button 