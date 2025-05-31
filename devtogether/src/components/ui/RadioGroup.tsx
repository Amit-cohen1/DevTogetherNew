import React from 'react'

interface RadioOption {
    value: string
    label: string
    description?: string
}

interface RadioGroupProps {
    options: RadioOption[]
    value: string
    onChange: (value: string) => void
    name: string
    className?: string
}

export function RadioGroup({
    options,
    value,
    onChange,
    name,
    className = ''
}: RadioGroupProps) {
    return (
        <div className={`space-y-3 ${className}`}>
            {options.map((option) => (
                <label key={option.value} className="flex items-start cursor-pointer">
                    <input
                        type="radio"
                        name={name}
                        value={option.value}
                        checked={value === option.value}
                        onChange={(e) => onChange(e.target.value)}
                        className="mt-1 h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                    />
                    <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                            {option.label}
                        </div>
                        {option.description && (
                            <div className="text-sm text-gray-500">
                                {option.description}
                            </div>
                        )}
                    </div>
                </label>
            ))}
        </div>
    )
} 