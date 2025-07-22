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
    Settings
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
        switch (type) {
            case 'application':
                return <Briefcase className="w-5 h-5 text-blue-600" />;
            case 'project':
                return <AlertCircle className="w-5 h-5 text-green-600" />;
            case 'team':
                return <Users className="w-5 h-5 text-purple-600" />;
            case 'achievement':
                return <Trophy className="w-5 h-5 text-yellow-600" />;
            case 'system':
                return <Settings className="w-5 h-5 text-gray-600" />;
            case 'moderation':
                return <Shield className="w-5 h-5 text-red-600" />;
            case 'chat':
                return <MessageCircle className="w-5 h-5 text-indigo-600" />;
            case 'status_change':
                return <Activity className="w-5 h-5 text-orange-600" />;
            default:
                return <Bell className="w-5 h-5 text-gray-600" />;
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

    const getNotificationBorderColor = (type: string) => {
        switch (type) {
            case 'moderation':
                return 'border-l-red-500';
            case 'application':
                return 'border-l-blue-500';
            case 'project':
                return 'border-l-green-500';
            case 'team':
                return 'border-l-purple-500';
            case 'achievement':
                return 'border-l-yellow-500';
            case 'chat':
                return 'border-l-indigo-500';
            case 'status_change':
                return 'border-l-orange-500';
            default:
                return 'border-l-gray-500';
        }
    };

    const getNotificationBgColor = (type: string, isUnread: boolean) => {
        if (!isUnread) return '';
        
        switch (type) {
            case 'moderation':
                return 'bg-red-50';
            case 'application':
                return 'bg-blue-50';
            case 'project':
                return 'bg-green-50';
            case 'team':
                return 'bg-purple-50';
            case 'achievement':
                return 'bg-yellow-50';
            case 'chat':
                return 'bg-indigo-50';
            case 'status_change':
                return 'bg-orange-50';
            default:
                return 'bg-gray-50';
        }
    };

    const getTypeLabel = (type: string) => {
        if (!profile?.role) return 'Notification'
        
        const context = NotificationNavigator.getNotificationContext(notification)
        return context.category
    };

    return (
        <div className={`relative group border-l-4 ${getNotificationBorderColor(notification.type)} p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${getNotificationBgColor(notification.type, !notification.read)}`}>
            <Link to={getNotificationLink(notification)} onClick={handleClick} className="block">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        {getTypeLabel(notification.type)}
                                    </span>
                                    {!notification.read && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-600 text-white">
                                            New
                                        </span>
                                    )}
                                </div>
                                <h4 className={`text-sm font-medium text-gray-900 ${!notification.read ? 'font-semibold' : ''}`}>
                                    {notification.title}
                                </h4>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                    {notification.message}
                                </p>
                                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                    <span>{formatDate(notification.created_at)}</span>
                                    {notification.data?.projectId && (
                                        <>
                                            <span>•</span>
                                            <span>Project notification</span>
                                        </>
                                    )}
                                </p>
                            </div>
                            {!notification.read && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></div>
                            )}
                        </div>
                    </div>
                </div>
            </Link>

            {/* Actions Menu */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="relative">
                    <button
                        onClick={() => setShowActions(!showActions)}
                        className="p-1 rounded hover:bg-gray-200 transition-colors"
                    >
                        <MoreHorizontal className="w-4 h-4 text-gray-500" />
                    </button>

                    {showActions && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                            {!notification.read && (
                                <button
                                    onClick={() => {
                                        onMarkAsRead(notification.id);
                                        setShowActions(false);
                                    }}
                                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    Mark as read
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    onDelete(notification.id);
                                    setShowActions(false);
                                }}
                                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete
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
            className={`absolute left-1/2 top-12 transform -translate-x-1/2 w-full max-w-xs sm:max-w-sm md:w-96 md:max-w-none bg-white rounded-xl shadow-xl z-50 border border-gray-200 ${isOpen ? '' : 'hidden'}`}
            style={{ minWidth: '18rem', maxHeight: '90vh' }}
        >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                    <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={markAllAsRead}
                                className="text-xs"
                            >
                                Mark all read
                            </Button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-1 rounded hover:bg-gray-200 transition-colors"
                        >
                            <X className="w-4 h-4 text-gray-500" />
                        </button>
                    </div>
                </div>
                {unreadCount > 0 && (
                    <p className="text-sm text-gray-600 mt-1">
                        You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                    </p>
                )}
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto max-h-96 flex-1 w-full">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <p className="text-gray-500 mt-2">Loading notifications...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="p-8 text-center">
                        <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 mb-2">No notifications</h4>
                        <p className="text-gray-500">You're all caught up! We'll notify you when something new happens.</p>
                    </div>
                ) : (
                    <div>
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

            {/* Footer - Always show if notifications exist */}
            {notifications.length > 0 && (
                <div className="p-3 border-t border-gray-200 bg-gray-50 flex-shrink-0">
                    <Link
                        to="/notifications"
                        onClick={onClose}
                        className="block text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                        View all notifications
                    </Link>
                </div>
            )}
        </div>
    );
}; 