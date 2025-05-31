import React from 'react';
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';

interface OrganizationStatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    change?: {
        value: number;
        type: 'increase' | 'decrease' | 'neutral';
        period: string;
    };
    subtitle?: string;
    color?: 'blue' | 'green' | 'yellow' | 'purple' | 'red' | 'gray';
    loading?: boolean;
}

const OrganizationStatsCard: React.FC<OrganizationStatsCardProps> = ({
    title,
    value,
    icon: Icon,
    change,
    subtitle,
    color = 'blue',
    loading = false
}) => {
    const colorClasses = {
        blue: {
            bg: 'bg-blue-50',
            icon: 'text-blue-600',
            text: 'text-blue-600'
        },
        green: {
            bg: 'bg-green-50',
            icon: 'text-green-600',
            text: 'text-green-600'
        },
        yellow: {
            bg: 'bg-yellow-50',
            icon: 'text-yellow-600',
            text: 'text-yellow-600'
        },
        purple: {
            bg: 'bg-purple-50',
            icon: 'text-purple-600',
            text: 'text-purple-600'
        },
        red: {
            bg: 'bg-red-50',
            icon: 'text-red-600',
            text: 'text-red-600'
        },
        gray: {
            bg: 'bg-gray-50',
            icon: 'text-gray-600',
            text: 'text-gray-600'
        }
    };

    const getChangeIcon = () => {
        switch (change?.type) {
            case 'increase':
                return <TrendingUp className="w-4 h-4 text-green-500" />;
            case 'decrease':
                return <TrendingDown className="w-4 h-4 text-red-500" />;
            case 'neutral':
                return <Minus className="w-4 h-4 text-gray-400" />;
            default:
                return null;
        }
    };

    const getChangeTextColor = () => {
        switch (change?.type) {
            case 'increase':
                return 'text-green-600';
            case 'decrease':
                return 'text-red-600';
            case 'neutral':
                return 'text-gray-500';
            default:
                return 'text-gray-500';
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="animate-pulse">
                    <div className="flex items-center">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                        <div className="ml-4 flex-1">
                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
                <div className={`w-12 h-12 ${colorClasses[color].bg} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${colorClasses[color].icon}`} />
                </div>
                <div className="ml-4 flex-1">
                    <p className="text-sm text-gray-600 font-medium">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                </div>
            </div>

            {(change || subtitle) && (
                <div className="mt-4 flex items-center justify-between">
                    {change && (
                        <div className="flex items-center space-x-1">
                            {getChangeIcon()}
                            <span className={`text-sm font-medium ${getChangeTextColor()}`}>
                                {Math.abs(change.value)}%
                            </span>
                            <span className="text-sm text-gray-500">
                                from {change.period}
                            </span>
                        </div>
                    )}

                    {subtitle && !change && (
                        <p className="text-sm text-gray-500">{subtitle}</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default OrganizationStatsCard; 