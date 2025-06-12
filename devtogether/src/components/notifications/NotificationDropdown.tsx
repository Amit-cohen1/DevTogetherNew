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
    Trash2
} from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { Button } from '../ui/Button';
import type { Notification } from '../../services/notificationService';

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
                return <AlertCircle className="w-5 h-5 text-gray-600" />;
            default:
                return <Bell className="w-5 h-5 text-gray-600" />;
        }
    };

    const getNotificationLink = (notification: Notification): string => {
        const data = notification.data || {};

        switch (notification.type) {
            case 'application':
                if (data.projectId) {
                    return `/projects/${data.projectId}`;
                }
                return '/my-applications';
            case 'project':
                if (data.projectId) {
                    return `/workspace/${data.projectId}`;
                }
                return '/dashboard';
            case 'team':
                if (data.projectId) {
                    return `/workspace/${data.projectId}`;
                }
                return '/dashboard';
            case 'achievement':
                return '/profile';
            default:
                return '/dashboard';
        }
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

    return (
        <div className={`relative group p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-blue-50' : ''
            }`}>
            <Link to={getNotificationLink(notification)} onClick={handleClick} className="block">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h4 className={`text-sm font-medium text-gray-900 ${!notification.read ? 'font-semibold' : ''
                                    }`}>
                                    {notification.title}
                                </h4>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                    {notification.message}
                                </p>
                                <p className="text-xs text-gray-500 mt-2">
                                    {formatDate(notification.created_at)}
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
            className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden flex flex-col"
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
            <div className="flex-1 overflow-y-auto">
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