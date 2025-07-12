import React from 'react';
import * as Icons from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: keyof typeof Icons;
    trend?: {
        value: number;
        label: string;
        direction: 'up' | 'down' | 'neutral';
    };
    progress?: {
        current: number;
        total: number;
    };
    className?: string;
    onClick?: () => void;
    color?: 'blue' | 'green' | 'yellow' | 'purple';
    /**
     * Visual size variant. `lg` is default desktop card, `sm` is compact version for mobile horizontal list.
     */
    size?: 'lg' | 'sm';
}

const StatsCard: React.FC<StatsCardProps> = ({
    title,
    value,
    subtitle,
    icon,
    trend,
    progress,
    className = '',
    onClick,
    color = 'blue',
    size = 'lg'
}) => {
    const IconComponent = Icons[icon] as React.ComponentType<any>;

    const getColorClasses = () => {
        switch (color) {
            case 'green':
                return {
                    iconBg: 'bg-green-100',
                    iconColor: 'text-green-600',
                    progressColor: 'bg-green-500'
                };
            case 'yellow':
                return {
                    iconBg: 'bg-yellow-100',
                    iconColor: 'text-yellow-600',
                    progressColor: 'bg-yellow-500'
                };
            case 'purple':
                return {
                    iconBg: 'bg-purple-100',
                    iconColor: 'text-purple-600',
                    progressColor: 'bg-purple-500'
                };
            default:
                return {
                    iconBg: 'bg-blue-100',
                    iconColor: 'text-blue-600',
                    progressColor: 'bg-blue-500'
                };
        }
    };

    const colorClasses = getColorClasses();

    const getTrendIcon = () => {
        switch (trend?.direction) {
            case 'up':
                return <Icons.TrendingUp className="w-3 h-3 text-green-600" />;
            case 'down':
                return <Icons.TrendingDown className="w-3 h-3 text-red-600" />;
            default:
                return <Icons.Minus className="w-3 h-3 text-gray-400" />;
        }
    };

    const getTrendColor = () => {
        switch (trend?.direction) {
            case 'up':
                return 'text-green-600';
            case 'down':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    return (
        <div
            className={`
        relative bg-white rounded-xl border border-gray-100 ${size === 'lg' ? 'p-6' : 'p-4'} 
        hover:shadow-lg transition-all duration-200 hover:border-gray-200
        ${onClick ? 'cursor-pointer hover:scale-[1.02]' : ''}
        ${className}
      `}
            onClick={onClick}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className={`${size === 'lg' ? 'p-2.5' : 'p-2'} ${colorClasses.iconBg} rounded-lg`}>
                            <IconComponent className={`${size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} ${colorClasses.iconColor}`} />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">{title}</h3>
                        </div>
                    </div>

                    <div className="mb-3">
                        <div className={`${size === 'lg' ? 'text-3xl' : 'text-xl'} font-bold text-gray-900 mb-1`}>{value}</div>
                        {subtitle && (
                            <p className={`${size === 'lg' ? 'text-sm' : 'text-xs'} text-gray-500`}>{subtitle}</p>
                        )}
                    </div>

                    {trend && (
                        <div className="flex items-center space-x-1">
                            {getTrendIcon()}
                            <span className={`${size === 'lg' ? 'text-xs' : 'text-[10px]'} font-medium ${getTrendColor()}`}>
                                {trend.value > 0 ? '+' : ''}{trend.value}
                            </span>
                            <span className={`${size === 'lg' ? 'text-xs' : 'text-[10px]'} text-gray-500`}>{trend.label}</span>
                        </div>
                    )}

                    {progress && (
                        <div className="mt-3">
                            <div className={`flex items-center justify-between ${size === 'lg' ? 'text-xs' : 'text-[10px]'} mb-2`}>
                                <span className="text-gray-600 font-medium">Progress</span>
                                <span className="font-semibold text-gray-900">
                                    {progress.current}/{progress.total}
                                </span>
                            </div>
                            <div className={`${size === 'lg' ? 'h-2' : 'h-1.5'} bg-gray-100 rounded-full`}>
                                <div
                                    className={`${colorClasses.progressColor} ${size === 'lg' ? 'h-2' : 'h-1.5'} rounded-full transition-all duration-500`}
                                    style={{ width: `${Math.min((progress.current / progress.total) * 100, 100)}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StatsCard; 