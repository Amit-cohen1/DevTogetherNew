import type { Notification } from '../services/notificationService'

export interface NavigationResult {
  path: string
  tab?: string
  highlight?: string
  external?: boolean
}

/**
 * Smart notification navigation based on user role and notification type
 * Maps each notification trigger to the most relevant page for each role
 */
export class NotificationNavigator {
  
  /**
   * Get the best navigation path for a notification based on user role
   */
  static getNavigationPath(
    notification: Notification, 
    userRole: 'admin' | 'developer' | 'organization',
    userId: string
  ): NavigationResult {
    const data = notification.data || {}
    const type = notification.type

    switch (type) {
      // =======================================================
      // ADMIN NOTIFICATIONS - Always go to admin dashboard
      // =======================================================
      case 'moderation':
        return this.handleModerationNotification(data, userRole)

      // =======================================================
      // APPLICATION NOTIFICATIONS - Role-specific handling
      // =======================================================
      case 'application':
        return this.handleApplicationNotification(data, userRole, userId)

      // =======================================================
      // PROJECT NOTIFICATIONS - Context-aware navigation
      // =======================================================
      case 'project':
      case 'status_change':
        return this.handleProjectNotification(data, userRole, userId)

      // =======================================================
      // TEAM & WORKSPACE NOTIFICATIONS
      // =======================================================
      case 'team':
      case 'chat':
      case 'promotion':
        return this.handleTeamNotification(data, userRole)

      // =======================================================
      // FEEDBACK NOTIFICATIONS
      // =======================================================
      case 'feedback':
        return this.handleFeedbackNotification(data, userRole, userId)

      // =======================================================
      // ACHIEVEMENT & SYSTEM NOTIFICATIONS
      // =======================================================
      case 'achievement':
        return { path: '/profile', tab: 'achievements' }

      case 'system':
        return data.actionUrl ? { path: data.actionUrl } : { path: '/dashboard' }

      default:
        return { path: '/dashboard' }
    }
  }

  /**
   * Handle admin/moderation notifications
   * - New organization registrations
   * - New project submissions
   * - Workspace access requests
   */
  private static handleModerationNotification(data: any, userRole: string): NavigationResult {
    // All admin notifications go to admin dashboard with specific tab
    if (userRole !== 'admin') {
      return { path: '/dashboard' } // Non-admins shouldn't see these anyway
    }

    // Parse notification context to determine which admin tab to open
    if (data.organizationId || data.organizationName) {
      return { path: '/admin', tab: 'organizations' }
    }
    
    if (data.projectId || data.projectTitle) {
      return { path: '/admin', tab: 'projects' }
    }

    if (data.type === 'organizations') {
      return { path: '/admin', tab: 'organizations' }
    }

    if (data.type === 'projects') {
      return { path: '/admin', tab: 'projects' }
    }

    // Default to admin overview
    return { path: '/admin' }
  }

  /**
   * Handle application-related notifications
   * - Application status changes (for developers)
   * - New applications (for organizations)
   * - Application withdrawals
   */
  private static handleApplicationNotification(data: any, userRole: string, userId: string): NavigationResult {
    const { applicationId, projectId, projectTitle, organizationName, status } = data

    switch (userRole) {
      case 'developer':
        // Developer receiving notification about their application
        if (projectId) {
          return {
            path: `/projects/${projectId}`,
            highlight: applicationId ? `application-${applicationId}` : undefined
          }
        }
        return { path: '/my-applications' }

      case 'organization':
        // Organization receiving notification about applications to their projects
        return { path: '/applications' }

      case 'admin':
        // Admin might see application-related notifications in admin context
        if (projectId) {
          return { path: `/admin`, tab: 'projects' }
        }
        return { path: '/admin' }

      default:
        return { path: '/dashboard' }
    }
  }

  /**
   * Handle project-related notifications
   * - Project approval/rejection (for organizations)
   * - Project status changes (for team members)
   * - Project creation notifications (for admins)
   */
  private static handleProjectNotification(data: any, userRole: string, userId: string): NavigationResult {
    const { projectId, projectTitle, organizationId, status } = data

    switch (userRole) {
      case 'organization':
        // Organization notifications about their projects
        if (status === 'approved' || status === 'open') {
          // Project approved - go to project details
          return projectId ? { path: `/projects/${projectId}` } : { path: '/my-projects' }
        }
        if (status === 'rejected' || status === 'cancelled') {
          // Project rejected - go to my projects to see status
          return { path: '/my-projects' }
        }
        // Other project notifications
        return projectId ? { path: `/projects/${projectId}` } : { path: '/organization/dashboard' }

      case 'developer':
        // Developer notifications about projects they're involved in
        if (projectId) {
          // If they're a team member, go to workspace, otherwise project details
          return { path: `/workspace/${projectId}` }
        }
        return { path: '/dashboard' }

      case 'admin':
        // Admin project notifications
        if (projectId) {
          return { path: '/admin', tab: 'projects' }
        }
        return { path: '/admin' }

      default:
        return { path: '/dashboard' }
    }
  }

  /**
   * Handle team-related notifications
   * - New team messages
   * - Team member promotions
   * - Workspace activities
   */
  private static handleTeamNotification(data: any, userRole: string): NavigationResult {
    const { projectId, messageId } = data

    if (projectId) {
      // Go to workspace with specific tab based on notification type
      if (messageId) {
        return { path: `/workspace/${projectId}`, tab: 'chat' }
      }
      return { path: `/workspace/${projectId}` }
    }

    return { path: '/dashboard' }
  }

  /**
   * Handle feedback-related notifications
   * - New feedback for developers
   * - Feedback approval/rejection for organizations
   */
  private static handleFeedbackNotification(data: any, userRole: string, userId: string): NavigationResult {
    const { feedbackId, developerId, organizationId } = data

    switch (userRole) {
      case 'developer':
        // Developer receiving feedback
        return {
          path: '/profile',
          highlight: feedbackId ? `feedback-${feedbackId}` : undefined
        }

      case 'organization':
        // Organization notification about feedback decision
        if (developerId) {
          return { path: `/profile/${developerId}` }
        }
        return { path: '/organization/dashboard' }

      default:
        return { path: '/dashboard' }
    }
  }

  /**
   * Enhanced navigation with URL construction
   */
  static buildNavigationUrl(result: NavigationResult): string {
    let url = result.path

    const params = new URLSearchParams()
    
    if (result.tab) {
      params.append('tab', result.tab)
    }
    
    if (result.highlight) {
      params.append('highlight', result.highlight)
    }

    if (params.toString()) {
      url += `?${params.toString()}`
    }

    return url
  }

  /**
   * Get notification-specific context for UI display
   */
  static getNotificationContext(notification: Notification): {
    priority: 'high' | 'medium' | 'low'
    category: string
    actionText: string
  } {
    const data = notification.data || {}
    
    switch (notification.type) {
      case 'moderation':
        return {
          priority: data.priority || 'high',
          category: 'Admin Action Required',
          actionText: 'Review in Admin Dashboard'
        }
      
      case 'application':
        return {
          priority: 'medium',
          category: 'Application Update',
          actionText: 'View Application'
        }
      
      case 'project':
      case 'status_change':
        return {
          priority: 'medium',
          category: 'Project Update',
          actionText: 'View Project'
        }
      
      case 'team':
      case 'chat':
        return {
          priority: 'low',
          category: 'Team Activity',
          actionText: 'Join Workspace'
        }
      
      case 'promotion':
        return {
          priority: 'high',
          category: 'Role Promotion',
          actionText: 'View Workspace'
        }
      
      case 'feedback':
        return {
          priority: 'medium',
          category: 'Feedback',
          actionText: 'View Profile'
        }
      
      case 'achievement':
        return {
          priority: 'low',
          category: 'Achievement',
          actionText: 'View Achievements'
        }
      
      default:
        return {
          priority: 'low',
          category: 'Notification',
          actionText: 'View Details'
        }
    }
  }
} 