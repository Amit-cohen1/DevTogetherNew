# Notification Trigger: Organization Notified on Application Submission

## Overview
A new database trigger was added to automatically notify an organization whenever a developer submits an application to one of its projects.

## Details
- **Trigger Name:** `trg_notify_organization_application_submitted`
- **Table:** `applications`
- **Event:** AFTER INSERT
- **Function:** `notify_organization_application_submitted()`

### What does it do?
Whenever a new row is inserted into the `applications` table (i.e., a developer applies to a project), the trigger:
1. Looks up the `organization_id` and project title from the `projects` table using the `project_id` from the new application.
2. Inserts a new notification into the `notifications` table for the relevant organization, with a message like:
   > "A new developer has applied to your project: [Project Title]"
   and includes relevant IDs in the `data` JSONB field.

### Example Notification Record
| user_id (organization) | title           | message                                         | data (JSONB)                                                      | type        |
|-----------------------|-----------------|-------------------------------------------------|-------------------------------------------------------------------|-------------|
| [organization_id]     | New Application | A new developer has applied to your project: ... | {"application_id": ..., "project_id": ..., "developer_id": ...} | application |

## Purpose
This ensures organizations are immediately notified in-app when a developer applies to their project, improving responsiveness and engagement.

---
*Created: 2024-07-10* 