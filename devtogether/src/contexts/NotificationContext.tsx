import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { notificationService, type Notification } from '../services/notificationService';

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    loadNotifications: () => Promise<void>;
    markAsRead: (notificationId: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (notificationId: string) => Promise<void>;
    refreshUnreadCount: () => Promise<void>;
    requestNotificationPermission: () => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

interface NotificationProviderProps {
    children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    // Load notifications
    const loadNotifications = useCallback(async () => {
        if (!user?.id) return;

        setLoading(true);
        try {
            const userNotifications = await notificationService.getNotifications(user.id);
            setNotifications(userNotifications);
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    // Refresh unread count
    const refreshUnreadCount = useCallback(async () => {
        if (!user?.id) return;

        try {
            const count = await notificationService.getUnreadCount(user.id);
            setUnreadCount(count);
        } catch (error) {
            console.error('Error refreshing unread count:', error);
        }
    }, [user?.id]);

    // Request notification permission (only when user interacts)
    const requestNotificationPermission = useCallback(async (): Promise<boolean> => {
        if (!('Notification' in window)) {
            return false;
        }

        if (Notification.permission === 'granted') {
            return true;
        }

        if (Notification.permission === 'denied') {
            return false;
        }

        try {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            return false;
        }
    }, []);

    // Mark notification as read
    const markAsRead = useCallback(async (notificationId: string) => {
        try {
            const success = await notificationService.markAsRead(notificationId);
            if (success) {
                setNotifications(prev =>
                    prev.map(notification =>
                        notification.id === notificationId
                            ? { ...notification, read: true }
                            : notification
                    )
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }, []);

    // Mark all notifications as read
    const markAllAsRead = useCallback(async () => {
        if (!user?.id) return;

        try {
            const success = await notificationService.markAllAsRead(user.id);
            if (success) {
                setNotifications(prev =>
                    prev.map(notification => ({ ...notification, read: true }))
                );
                setUnreadCount(0);
            }
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    }, [user?.id]);

    // Delete notification
    const deleteNotification = useCallback(async (notificationId: string) => {
        try {
            const success = await notificationService.deleteNotification(notificationId);
            if (success) {
                const notification = notifications.find(n => n.id === notificationId);
                setNotifications(prev => prev.filter(n => n.id !== notificationId));

                // Decrease unread count if the deleted notification was unread
                if (notification && !notification.read) {
                    setUnreadCount(prev => Math.max(0, prev - 1));
                }
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    }, [notifications]);

    // Handle new real-time notification
    const handleNewNotification = useCallback((notification: Notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);

        // Show browser notification if permitted (don't request permission automatically)
        if ('Notification' in window && Notification.permission === 'granted') {
            try {
                new Notification(notification.title, {
                    body: notification.message,
                    icon: '/images/devtogether-icon.svg'
                });
            } catch (error) {
                console.error('Error showing browser notification:', error);
            }
        }
    }, []);

    // Initialize notifications and real-time subscription
    useEffect(() => {
        if (!user?.id) {
            setNotifications([]);
            setUnreadCount(0);
            return;
        }

        // Load initial data
        loadNotifications();
        refreshUnreadCount();

        // Set up real-time subscription
        const unsubscribe = notificationService.subscribeToNotifications(
            user.id,
            handleNewNotification
        );

        return unsubscribe;
    }, [user?.id, loadNotifications, refreshUnreadCount, handleNewNotification]);

    const value: NotificationContextType = {
        notifications,
        unreadCount,
        loading,
        loadNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refreshUnreadCount,
        requestNotificationPermission
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
}; 