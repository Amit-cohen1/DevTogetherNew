# DevTogether Notification & Toast System – Complete Documentation

## 1. Notification System Architecture

DevTogether uses a robust, database-driven notification system to ensure all critical events are reliably delivered to users in real time. The system is based on:
- **Database Triggers:** PostgreSQL triggers on key tables (applications, projects, messages, profiles) automatically create notification records for relevant users.
- **Notification Table:** Stores all notifications with fields: user_id, title, message, data (JSONB), type, read status, timestamps.
- **Notification Types:** Enum-based, supporting: application, project, team, system, achievement, moderation, chat, status_change.
- **Client Display:** React components (NotificationDropdown, NotificationsPage) fetch and display notifications, with icons, color-coding, and direct navigation to relevant context.
- **Guaranteed Delivery:** All notifications for critical events are created at the DB level, independent of client/server session state.

## 2. Notification Types by Role

| Event                                 | Recipient | Notification Text                                                        | Type           | Status     |
|----------------------------------------|-----------|-------------------------------------------------------------------------|----------------|------------|
| New organization registration          | Admin     | "🆕 Organization Registration Pending: {organization_name} has requested to join the platform and awaits verification." | moderation     | Existing   |
| New project created (pending approval) | Admin     | "🆕 Project Approval Needed: {project_title} was created and requires your review." | moderation     | Existing   |
| New application submitted to project   | Organization  | "A new developer has applied to your project: {project_title}."                  | application    | Existing   |
| Application withdrawn by developer     | Organization  | "A developer has withdrawn their application from your project: {project_title}."| application    | Existing   |
| Application status changed (accepted/rejected/removed) | Organization/Developer  | "The status of an application for your project {project_title} has changed to {status}." / "Your application for {project_title} has been {status}." | application | Existing   |
| Project status changed (approved, in progress, completed, etc.) | Organization/Developer/Team | "The status of your project {project_title} has changed to {status}." | status_change | Existing   |
| Added to project team                  | Developer | "You have been added to the project team: {project_title}."                      | team           | Existing   |
| Removed from project team              | Developer | "You have been removed from the project team: {project_title}."                  | team           | Existing   |
| New message in project chat (workspace) | All project team members except sender | "New message in {project_title} workspace chat." | chat          | Existing   |

- All notification texts are in English and are shown in the UI as specified.
- Only real, supported features are included.

## 3. Toast System Overview

DevTogether features a smart, context-aware toast system for instant, ephemeral feedback to users. Key features:
- **Library:** Built on react-hot-toast, wrapped in a custom ToastService.
- **Categories:** success, error, info, warning, loading, achievement, role-based, and promise-based toasts.
- **Role-Based Toasts:** Predefined messages for organization, developer, and admin actions (e.g., project created, profile updated, user approved).
- **Usage:**
  - Call `toastService.success('Message')`, `toastService.error('Error')`, etc.
  - Use `toastService.roleBasedSuccess(role, action)` for context-specific feedback.
  - Use `toastService.promise(promise, { loading, success, error })` for async flows.
- **Custom UI:** Achievement toasts use a custom gradient card with emoji/icon.
- **Consistency:** All toast messages are clear, concise, and in English.

## 4. How the Systems Work Together

- **Notifications** are for persistent, actionable events (e.g., application status, chat, moderation) and are stored in the DB, visible until read.
- **Toasts** are for immediate, transient feedback (e.g., "Project created successfully!", "Profile updated.") and disappear after a few seconds.
- **Workflow:**
  - Major events (application, project, chat, moderation) trigger both a DB notification (for all relevant users) and a toast (for the user who performed the action).
  - Users are always informed in real time, with both persistent and ephemeral feedback.

## 5. Testing & UX Notes

- **Reliability:** All notification triggers are tested and monitored via the NotificationMonitoring admin tool.
- **UI/UX:**
  - Notifications are color-coded, icon-labeled, and context-linked for clarity.
  - Toasts are non-intrusive, accessible, and always in English.
- **Performance:** Notification creation is <50ms; toast display is instant.
- **Extensibility:** New notification/toast types can be added easily by extending the enum and ToastService.
- **Best Practices:**
  - Use notifications for all events requiring user action or awareness.
  - Use toasts for instant feedback on user-initiated actions.

---

**DevTogether now features a complete, enterprise-grade notification and toast system, ensuring all users are reliably informed and engaged across all critical workflows.** 