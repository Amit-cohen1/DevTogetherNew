import { supabase } from '../utils/supabase';

export interface Notification {
    id: string;
    user_id: string;
    title: string;
    message: string;
    type: 'application' | 'project' | 'team' | 'system' | 'achievement';
    data?: Record<string, any>;
    read: boolean;
    created_at: string;
}

export interface NotificationCreateData {
    user_id: string;
    title: string;
    message: string;
    type: 'application' | 'project' | 'team' | 'system' | 'achievement';
    data?: Record<string, any>;
}

class NotificationService {
    // Create a new notification
    async createNotification(data: NotificationCreateData): Promise<Notification | null> {
        try {
            console.log('🔔 Creating notification:', {
                user_id: data.user_id,
                title: data.title,
                type: data.type,
                message: data.message.substring(0, 50) + '...'
            });

            // Validate input data
            if (!data.user_id) {
                console.error('❌ Notification creation failed: Missing user_id');
                return null;
            }
            if (!data.title) {
                console.error('❌ Notification creation failed: Missing title');
                return null;
            }
            if (!data.message) {
                console.error('❌ Notification creation failed: Missing message');
                return null;
            }
            if (!data.type) {
                console.error('❌ Notification creation failed: Missing type');
                return null;
            }

            // Check current auth session
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError) {
                console.error('❌ Session error during notification creation:', sessionError);
                return null;
            }
            if (!session) {
                console.error('❌ No active session during notification creation');
                return null;
            }

            console.log('✅ Session check passed for user:', session.user.id);

            const { data: notification, error } = await supabase
                .from('notifications')
                .insert([{
                    user_id: data.user_id,
                    title: data.title,
                    message: data.message,
                    type: data.type,
                    data: data.data || {},
                    read: false
                }])
                .select()
                .single();

            if (error) {
                console.error('❌ Database error creating notification:', {
                    error: error,
                    code: error.code,
                    message: error.message,
                    details: error.details,
                    hint: error.hint
                });
                return null;
            }

            if (!notification) {
                console.error('❌ No notification returned from database');
                return null;
            }

            console.log('✅ Notification created successfully:', {
                id: notification.id,
                user_id: notification.user_id,
                title: notification.title,
                type: notification.type
            });

            return notification;
        } catch (error) {
            console.error('❌ Unexpected error creating notification:', error);
            return null;
        }
    }

    // Get notifications for a user
    async getNotifications(userId: string, limit: number = 20, offset: number = 0): Promise<Notification[]> {
        try {
            const { data: notifications, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);

            if (error) {
                console.error('Error fetching notifications:', error);
                return [];
            }

            return notifications || [];
        } catch (error) {
            console.error('Error fetching notifications:', error);
            return [];
        }
    }

    // Get unread notification count
    async getUnreadCount(userId: string): Promise<number> {
        try {
            const { count, error } = await supabase
                .from('notifications')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('read', false);

            if (error) {
                console.error('Error fetching unread count:', error);
                return 0;
            }

            return count || 0;
        } catch (error) {
            console.error('Error fetching unread count:', error);
            return 0;
        }
    }

    // Mark notification as read
    async markAsRead(notificationId: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ read: true })
                .eq('id', notificationId);

            if (error) {
                console.error('Error marking notification as read:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            return false;
        }
    }

    // Mark all notifications as read for a user
    async markAllAsRead(userId: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ read: true })
                .eq('user_id', userId)
                .eq('read', false);

            if (error) {
                console.error('Error marking all notifications as read:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            return false;
        }
    }

    // Delete a notification
    async deleteNotification(notificationId: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('notifications')
                .delete()
                .eq('id', notificationId);

            if (error) {
                console.error('Error deleting notification:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error deleting notification:', error);
            return false;
        }
    }

    // Subscribe to real-time notifications
    subscribeToNotifications(
        userId: string,
        onNotification: (notification: Notification) => void
    ) {
        const channel = supabase
            .channel(`notifications:${userId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`
                },
                (payload: { new: Notification }) => {
                    console.log('New notification received:', payload);
                    onNotification(payload.new);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }

    // Helper methods for creating specific notification types

    // Application status notifications
    async notifyApplicationStatusChange(
        developerId: string,
        organizationName: string,
        projectTitle: string,
        status: 'accepted' | 'rejected',
        projectId: string
    ): Promise<void> {
        console.log('📤 Attempting to notify developer of application status change:', {
            developerId,
            organizationName,
            projectTitle,
            status,
            projectId
        });

        const title = status === 'accepted'
            ? '🎉 Application Accepted!'
            : 'Application Update';

        const message = status === 'accepted'
            ? `Congratulations! ${organizationName} has accepted your application for ${projectTitle}.`
            : `Your application for ${projectTitle} has been reviewed by ${organizationName}.`;

        const result = await this.createNotification({
            user_id: developerId,
            title,
            message,
            type: 'application',
            data: {
                projectId,
                projectTitle,
                organizationName,
                status
            }
        });

        if (!result) {
            console.error('❌ Failed to create application status notification for developer:', developerId);
            throw new Error('Failed to create application status notification');
        }

        console.log('✅ Application status notification sent successfully to developer:', developerId);
    }

    // New application notifications for organizations
    async notifyNewApplication(
        organizationUserId: string,
        developerName: string,
        projectTitle: string,
        applicationId: string,
        projectId: string
    ): Promise<void> {
        console.log('📤 Attempting to notify organization of new application:', {
            organizationUserId,
            developerName,
            projectTitle,
            applicationId,
            projectId
        });

        const result = await this.createNotification({
            user_id: organizationUserId,
            title: '📝 New Application Received',
            message: `${developerName} has applied to your project: ${projectTitle}`,
            type: 'application',
            data: {
                applicationId,
                projectId,
                projectTitle,
                developerName
            }
        });

        if (!result) {
            console.error('❌ Failed to create new application notification for organization:', organizationUserId);
            throw new Error('Failed to create new application notification');
        }

        console.log('✅ New application notification sent successfully to organization:', organizationUserId);
    }

    // Project update notifications
    async notifyProjectUpdate(
        userIds: string[],
        projectTitle: string,
        updateMessage: string,
        projectId: string
    ): Promise<void> {
        const promises = userIds.map(userId =>
            this.createNotification({
                user_id: userId,
                title: '📊 Project Update',
                message: `${projectTitle}: ${updateMessage}`,
                type: 'project',
                data: {
                    projectId,
                    projectTitle
                }
            })
        );

        await Promise.all(promises);
    }

    // Team notifications
    async notifyTeamInvite(
        developerId: string,
        organizationName: string,
        projectTitle: string,
        projectId: string
    ): Promise<void> {
        await this.createNotification({
            user_id: developerId,
            title: '👥 Team Invitation',
            message: `You've been invited to join the team for ${projectTitle} by ${organizationName}`,
            type: 'team',
            data: {
                projectId,
                projectTitle,
                organizationName
            }
        });
    }

    // Achievement notifications
    async notifyAchievement(
        userId: string,
        achievementTitle: string,
        achievementDescription: string
    ): Promise<void> {
        await this.createNotification({
            user_id: userId,
            title: '🏆 Achievement Unlocked!',
            message: `${achievementTitle}: ${achievementDescription}`,
            type: 'achievement',
            data: {
                achievementTitle
            }
        });
    }

    // System notifications
    async notifySystemMessage(
        userId: string,
        title: string,
        message: string,
        data?: Record<string, any>
    ): Promise<void> {
        await this.createNotification({
            user_id: userId,
            title,
            message,
            type: 'system',
            data: data || {}
        });
    }
}

export const notificationService = new NotificationService(); 