# DevTogether Notification System – Enhancement Plan

## Overview
This document lists all current and planned notification types for the DevTogether platform, organized by user role. Each entry includes the event, recipient, notification text (in English), and implementation status (existing/planned).

---

## 1. Admin Notifications

| Event                                 | Recipient | Notification Text                                                        | Status     |
|----------------------------------------|-----------|-------------------------------------------------------------------------|------------|
| New organization registration          | Admin     | "🆕 Organization Registration Pending: {organization_name} has requested to join the platform and awaits verification." | Existing   |
| New project created (pending approval) | Admin     | "🆕 Project Approval Needed: {project_title} was created and requires your review." | Existing   |

---

## 2. Organization Notifications

| Event                                 | Recipient      | Notification Text                                                                 | Status     |
|----------------------------------------|---------------|----------------------------------------------------------------------------------|------------|
| New application submitted to project   | Organization  | "A new developer has applied to your project: {project_title}."                  | Existing   |
| Application withdrawn by developer     | Organization  | "A developer has withdrawn their application from your project: {project_title}."| Planned    |
| Application status changed (accepted/rejected/removed) | Organization  | "The status of an application for your project {project_title} has changed to {status}." | Existing   |
| Project status changed (approved, in progress, completed, etc.) | Organization | "The status of your project {project_title} has changed to {status}."            | Existing   |
| New message in project chat (workspace) | All project team members except sender | "New message in {project_title} workspace chat." | Planned |

---

## 3. Developer Notifications

| Event                                 | Recipient | Notification Text                                                                 | Status     |
|----------------------------------------|-----------|----------------------------------------------------------------------------------|------------|
| Application status changed (accepted/rejected/removed) | Developer | "Your application for {project_title} has been {status}."                        | Existing   |
| Added to project team                  | Developer | "You have been added to the project team: {project_title}."                      | Existing   |
| Removed from project team              | Developer | "You have been removed from the project team: {project_title}."                  | Existing   |
| Project status changed (in progress, completed, etc.) | Developer | "The status of your project {project_title} has changed to {status}."            | Planned    |
| New message in project chat (workspace) | All project team members except sender | "New message in {project_title} workspace chat." | Planned |

---

## 4. Team Notifications (All Project Members)

| Event                                 | Recipient | Notification Text                                                                 | Status     |
|----------------------------------------|-----------|----------------------------------------------------------------------------------|------------|
| New message in project chat (workspace) | All project team members except sender | "New message in {project_title} workspace chat."                                 | Planned    |
| Project status changed                 | All project team members | "The status of your project {project_title} has changed to {status}."           | Planned    |

---

## Notes
- All notification texts are in English and should be implemented as shown.
- Only real, supported features are included (no complaint/report notifications).
- For each notification, ensure the text is clear, concise, and relevant to the recipient's role.
- The new notification for organization on application submission is already in English: "A new developer has applied to your project: {project_title}."

---

## Next Steps
- Review this plan and confirm all notification types and texts.
- Proceed to implementation of planned notifications, starting with workspace chat notifications for all project team members. 