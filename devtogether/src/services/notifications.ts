import { supabase } from '../utils/supabase'

export interface NotificationData {
    id?: string
    user_id: string
    type: 'application_status' | 'project_update' | 'message' | 'system'
    title: string
    message: string
    data?: Record<string, any>
    read: boolean
    created_at?: string
}

class NotificationService {
    /**
     * Send application status notification
     */
    async notifyApplicationStatus(
        developerId: string,
        projectTitle: string,
        organizationName: string,
        status: 'accepted' | 'rejected',
        additionalMessage?: string
    ): Promise<void> {
        try {
            const title = status === 'accepted'
                ? `Application Accepted - ${projectTitle}`
                : `Application Update - ${projectTitle}`

            const message = status === 'accepted'
                ? `Congratulations! Your application for "${projectTitle}" at ${organizationName} has been accepted. ${additionalMessage || 'You should hear from them soon with next steps.'}`
                : `Your application for "${projectTitle}" at ${organizationName} was not selected. ${additionalMessage || 'Keep applying to other projects - the right opportunity is out there!'}`

            await this.createNotification({
                user_id: developerId,
                type: 'application_status',
                title,
                message,
                data: {
                    project_title: projectTitle,
                    organization_name: organizationName,
                    status
                },
                read: false
            })

            // In a real application, you would also send an email here
            // This could integrate with services like SendGrid, AWS SES, etc.
            console.log('Email notification would be sent to developer:', {
                developerId,
                title,
                message
            })

        } catch (error) {
            console.error('Error sending application status notification:', error)
            // Don't throw error to prevent breaking the main application flow
        }
    }

    /**
     * Notify organization of new application
     */
    async notifyNewApplication(
        organizationId: string,
        projectTitle: string,
        developerName: string,
        projectId: string
    ): Promise<void> {
        try {
            const title = `New Application - ${projectTitle}`
            const message = `${developerName} has submitted an application for your project "${projectTitle}". Review their application in your dashboard.`

            await this.createNotification({
                user_id: organizationId,
                type: 'application_status',
                title,
                message,
                data: {
                    project_title: projectTitle,
                    developer_name: developerName,
                    project_id: projectId
                },
                read: false
            })

            // Email notification for organization
            console.log('Email notification would be sent to organization:', {
                organizationId,
                title,
                message
            })

        } catch (error) {
            console.error('Error sending new application notification:', error)
        }
    }

    /**
     * Create a notification record
     */
    async createNotification(notificationData: NotificationData): Promise<void> {
        try {
            const { error } = await supabase
                .from('notifications')
                .insert([{
                    user_id: notificationData.user_id,
                    type: notificationData.type,
                    title: notificationData.title,
                    message: notificationData.message,
                    data: notificationData.data,
                    read: false,
                    created_at: new Date().toISOString()
                }])

            if (error) throw error
        } catch (error) {
            console.error('Error creating notification:', error)
            throw error
        }
    }

    /**
     * Get notifications for a user
     */
    async getUserNotifications(userId: string, unreadOnly = false): Promise<NotificationData[]> {
        try {
            let query = supabase
                .from('notifications')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })

            if (unreadOnly) {
                query = query.eq('read', false)
            }

            const { data, error } = await query

            if (error) throw error
            return data || []
        } catch (error) {
            console.error('Error fetching notifications:', error)
            throw error
        }
    }

    /**
     * Mark notification as read
     */
    async markAsRead(notificationId: string): Promise<void> {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ read: true })
                .eq('id', notificationId)

            if (error) throw error
        } catch (error) {
            console.error('Error marking notification as read:', error)
            throw error
        }
    }

    /**
     * Mark all user notifications as read
     */
    async markAllAsRead(userId: string): Promise<void> {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ read: true })
                .eq('user_id', userId)
                .eq('read', false)

            if (error) throw error
        } catch (error) {
            console.error('Error marking all notifications as read:', error)
            throw error
        }
    }

    /**
     * Get unread notification count
     */
    async getUnreadCount(userId: string): Promise<number> {
        try {
            const { count, error } = await supabase
                .from('notifications')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('read', false)

            if (error) throw error
            return count || 0
        } catch (error) {
            console.error('Error fetching unread count:', error)
            return 0
        }
    }
}

export const notificationService = new NotificationService() 