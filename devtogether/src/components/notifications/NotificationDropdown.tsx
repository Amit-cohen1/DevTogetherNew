import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Bell,
    X,
    CheckCircle,
    User,
    Briefcase,
    Users,
    Trophy,
    AlertCircle,
    MoreHorizontal,
    Trash2,
    Shield,
    MessageCircle,
    Activity,
    Settings,
    ExternalLink,
    Zap,
    Star,
    Circle
} from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { Button } from '../ui/Button';
import type { Notification } from '../../services/notificationService';
import { NotificationNavigator } from '../../utils/notificationNavigation';
import { useAuth } from '../../contexts/AuthContext';

interface NotificationDropdownProps {
    isOpen: boolean;
    onClose: () => void;
}

const NotificationItem: React.FC<{
    notification: Notification;
    onMarkAsRead: (id: string) => void;
    onDelete: (id: string) => void;
}> = ({ notification, onMarkAsRead, onDelete }) => {
    const [showActions, setShowActions] = useState(false);
    const { profile, user } = useAuth();

    const getNotificationIcon = (type: string) => {
        const iconClasses = "w-5 h-5";
        switch (type) {
            case 'application':
                return <Briefcase className={`${iconClasses} text-blue-600`} />;
            case 'project':
                return <AlertCircle className={`${iconClasses} text-green-600`} />;
            case 'team':
                return <Users className={`${iconClasses} text-purple-600`} />;
            case 'achievement':
                return <Trophy className={`${iconClasses} text-yellow-600`} />;
            case 'system':
                return <Settings className={`${iconClasses} text-gray-600`} />;
            case 'moderation':
                return <Shield className={`${iconClasses} text-red-600`} />;
            case 'chat':
                return <MessageCircle className={`${iconClasses} text-indigo-600`} />;
            case 'status_change':
                return <Activity className={`${iconClasses} text-orange-600`} />;
            case 'feedback':
                return <Star className={`${iconClasses} text-amber-600`} />;
            case 'promotion':
                return <Zap className={`${iconClasses} text-purple-600`} />;
            default:
                return <Bell className={`${iconClasses} text-gray-600`} />;
        }
    };

    const getNotificationLink = (notification: Notification): string => {
        if (!profile?.role || !user?.id) return '/dashboard'
        
        const navResult = NotificationNavigator.getNavigationPath(notification, profile.role as any, user.id)
        return NotificationNavigator.buildNavigationUrl(navResult)
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays}d ago`;

        return date.toLocaleDateString();
    };

    const handleClick = () => {
        if (!notification.read) {
            onMarkAsRead(notification.id);
        }
    };

    const getNotificationTheme = (type: string) => {
        switch (type) {
            case 'moderation':
                return {
                    bgColor: !notification.read ? 'bg-red-50' : 'bg-white',
                    borderColor: 'border-l-red-500',
                    accentColor: 'text-red-600',
                    hoverBg: 'hover:bg-red-50/50'
                };
            case 'application':
                return {
                    bgColor: !notification.read ? 'bg-blue-50' : 'bg-white',
                    borderColor: 'border-l-blue-500',
                    accentColor: 'text-blue-600',
                    hoverBg: 'hover:bg-blue-50/50'
                };
            case 'project':
                return {
                    bgColor: !notification.read ? 'bg-green-50' : 'bg-white',
                    borderColor: 'border-l-green-500',
                    accentColor: 'text-green-600',
                    hoverBg: 'hover:bg-green-50/50'
                };
            case 'team':
                return {
                    bgColor: !notification.read ? 'bg-purple-50' : 'bg-white',
                    borderColor: 'border-l-purple-500',
                    accentColor: 'text-purple-600',
                    hoverBg: 'hover:bg-purple-50/50'
                };
            case 'achievement':
                return {
                    bgColor: !notification.read ? 'bg-yellow-50' : 'bg-white',
                    borderColor: 'border-l-yellow-500',
                    accentColor: 'text-yellow-600',
                    hoverBg: 'hover:bg-yellow-50/50'
                };
            case 'chat':
                return {
                    bgColor: !notification.read ? 'bg-indigo-50' : 'bg-white',
                    borderColor: 'border-l-indigo-500',
                    accentColor: 'text-indigo-600',
                    hoverBg: 'hover:bg-indigo-50/50'
                };
            case 'status_change':
                return {
                    bgColor: !notification.read ? 'bg-orange-50' : 'bg-white',
                    borderColor: 'border-l-orange-500',
                    accentColor: 'text-orange-600',
                    hoverBg: 'hover:bg-orange-50/50'
                };
            default:
                return {
                    bgColor: !notification.read ? 'bg-gray-50' : 'bg-white',
                    borderColor: 'border-l-gray-400',
                    accentColor: 'text-gray-600',
                    hoverBg: 'hover:bg-gray-50/50'
                };
        }
    };

    const getTypeLabel = (type: string) => {
        if (!profile?.role) return 'Notification'
        
        const context = NotificationNavigator.getNotificationContext(notification)
        return context.category
    };

    const theme = getNotificationTheme(notification.type);

    return (
        <div className={`relative group ${theme.bgColor} ${theme.hoverBg} transition-all duration-300`}>
            <Link to={getNotificationLink(notification)} onClick={handleClick} className="block">
                <div className={`relative p-4 border-l-4 ${theme.borderColor} transition-all duration-300`}>
                    <div className="flex items-start gap-4">
                        {/* Enhanced Icon Container */}
                        <div className={`flex-shrink-0 p-2 rounded-xl ${theme.bgColor === 'bg-white' ? 'bg-gray-50' : 'bg-white/50'} shadow-sm`}>
                            {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            {/* Enhanced Header */}
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`text-xs font-semibold uppercase tracking-wider ${theme.accentColor}`}>
                                            {getTypeLabel(notification.type)}
                                        </span>
                                        {!notification.read && (
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                            </span>
                                        )}
                                    </div>
                                    
                                    {/* Enhanced Title */}
                                    <h4 className={`text-sm font-semibold text-gray-900 mb-2 ${!notification.read ? 'font-bold' : ''}`}>
                                        {notification.title}
                                    </h4>
                                    
                                    {/* Enhanced Message */}
                                    <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                                        {notification.message}
                                    </p>
                                    
                                    {/* Enhanced Footer */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <Circle className="w-3 h-3 fill-current" />
                                            <span>{formatDate(notification.created_at)}</span>
                                            {notification.data?.projectId && (
                                                <>
                                                    <span>•</span>
                                                    <span className="font-medium">Project notification</span>
                                                </>
                                            )}
                                        </div>
                                        
                                        {!notification.read && (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                                                <Zap className="w-3 h-3" />
                                                New
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Link>

            {/* Enhanced Actions Menu */}
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="relative">
                    <button
                        onClick={() => setShowActions(!showActions)}
                        className="p-2 rounded-lg hover:bg-white/80 backdrop-blur-sm transition-all duration-200 shadow-sm border border-gray-200/50"
                    >
                        <MoreHorizontal className="w-4 h-4 text-gray-600" />
                    </button>

                    {showActions && (
                        <div className="absolute right-0 top-full mt-2 w-52 bg-white/95 backdrop-blur-lg rounded-xl shadow-2xl border border-gray-200/50 py-2 z-50">
                            {!notification.read && (
                                <button
                                    onClick={() => {
                                        onMarkAsRead(notification.id);
                                        setShowActions(false);
                                    }}
                                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 flex items-center gap-3 transition-colors duration-200"
                                >
                                    <div className="p-1 bg-blue-100 rounded-lg">
                                        <CheckCircle className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <div className="font-medium">Mark as read</div>
                                        <div className="text-xs text-gray-500">Remove notification badge</div>
                                    </div>
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    onDelete(notification.id);
                                    setShowActions(false);
                                }}
                                className="w-full text-left px-4 py-3 text-sm text-red-700 hover:bg-red-50 flex items-center gap-3 transition-colors duration-200"
                            >
                                <div className="p-1 bg-red-100 rounded-lg">
                                    <Trash2 className="w-4 h-4 text-red-600" />
                                </div>
                                <div>
                                    <div className="font-medium">Delete notification</div>
                                    <div className="text-xs text-red-500">This action cannot be undone</div>
                                </div>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, onClose }) => {
    const { notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            ref={dropdownRef}
            className="absolute left-1/2 top-12 transform -translate-x-1/2 w-full max-w-sm md:w-96 md:max-w-none bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl z-50 border border-gray-200/50 overflow-hidden"
            style={{ minWidth: '20rem', maxHeight: '85vh' }}
        >
            {/* Enhanced Header */}
            <div className="p-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-200/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/80 rounded-xl shadow-sm">
                            <Bell className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
                            {unreadCount > 0 && (
                                <p className="text-sm text-gray-600 flex items-center gap-2">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                    </span>
                                    {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                                </p>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                            <Button
                                size="sm"
                                onClick={markAllAsRead}
                                className="bg-blue-600 text-white hover:bg-blue-700 shadow-lg text-xs px-3 py-2"
                            >
                                Mark all read
                            </Button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl hover:bg-white/80 transition-all duration-200 shadow-sm border border-gray-200/50"
                        >
                            <X className="w-4 h-4 text-gray-600" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Enhanced Notifications List */}
            <div className="overflow-y-auto max-h-96 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="relative">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Bell className="w-4 h-4 text-blue-600" />
                            </div>
                        </div>
                        <p className="text-gray-600 mt-4 font-medium">Loading notifications...</p>
                        <p className="text-gray-500 text-sm">Please wait while we fetch your updates</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="relative mb-6">
                            <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl mx-auto flex items-center justify-center">
                                <Bell className="w-8 h-8 text-gray-400" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                            </div>
                        </div>
                        <h4 className="text-lg font-bold text-gray-900 mb-2">All caught up!</h4>
                        <p className="text-gray-500 leading-relaxed">
                            You have no new notifications right now.<br />
                            We'll notify you when something important happens.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {notifications.map((notification) => (
                            <NotificationItem
                                key={notification.id}
                                notification={notification}
                                onMarkAsRead={markAsRead}
                                onDelete={deleteNotification}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Enhanced Footer */}
            {notifications.length > 0 && (
                <div className="p-4 bg-gradient-to-r from-gray-50 via-blue-50 to-indigo-50 border-t border-gray-200/50">
                    <Link
                        to="/notifications"
                        onClick={onClose}
                        className="flex items-center justify-center gap-2 w-full py-3 px-4 text-sm font-semibold text-blue-600 hover:text-blue-700 bg-white/80 hover:bg-white rounded-xl transition-all duration-300 shadow-sm hover:shadow-md border border-blue-200/50 hover:border-blue-300"
                    >
                        <ExternalLink className="w-4 h-4" />
                        View all notifications
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-bold">
                            {notifications.length}
                        </span>
                    </Link>
                </div>
            )}
        </div>
    );
}; 