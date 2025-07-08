# Toast Notification System Implementation (react-hot-toast)

## Overview
This document describes the implementation and usage of the toast notification system in DevTogether, using [react-hot-toast](https://react-hot-toast.com/). The system provides user feedback for critical actions (login, logout, project creation, etc.) in a professional, non-intrusive way.

---

## 1. Installation & Setup

- **Library:** `react-hot-toast`
- **Provider:** `ToastProvider` (in `src/components/providers/ToastProvider.tsx`)
- **Service:** `toastService` (in `src/services/toastService.tsx`)

### Steps:
1. Install with `npm install react-hot-toast`.
2. Add `<ToastProvider />` to the root of your app (see `App.tsx`).
3. Use `toastService` for all toast notifications (do not call `toast` directly).

---

## 2. Usage Patterns

### Login/Logout
- **Location:** `AuthContext.tsx`
- **Behavior:**
  - On successful login: shows a success toast.
  - On login error: shows an error toast.
  - On logout: shows an info toast.
  - On logout error: shows an error toast.

### Project Creation
- **Location:** `CreateProjectForm.tsx`
- **Behavior:**
  - On successful project creation: shows a success toast.
  - On error: shows an error toast.

### How to Use in New Features
- Import the service: `import { toastService } from '../../services/toastService'`
- Use the appropriate method:
  - `toastService.success('Message')`
  - `toastService.error('Message')`
  - `toastService.project.created()` (for common actions)
  - `toastService.auth.loginSuccess()` (for auth actions)

---

## 3. Best Practices
- **Always use `toastService`** for consistency and maintainability.
- **Use concise, action-oriented messages.**
- **Show toasts for critical user actions only.**
- **Keep existing error UI for accessibility.**
- **Dismiss loading toasts before showing success/error.**
- **Test error scenarios to ensure error toasts work.**

---

## 4. Customization
- **Global styling** is set in `ToastProvider.tsx`.
- **Role-based and action-based messages** are available in `toastService.tsx`.
- **Custom toasts** (e.g., achievements) can be shown with `toastService.achievement(message, icon)`.

---

## 5. Extending the System
- For new async flows, use `toastService.promise(promise, { loading, success, error })` for automatic loading/success/error toasts.
- For new roles or actions, add messages to the `messagesByRole` object in `toastService.tsx`.
- For network status, use `toastService.network.online()` and `toastService.network.offline()`.

---

## 6. Troubleshooting
- **Toasts not showing?** Ensure `<ToastProvider />` is in your layout and you are using the service.
- **Multiple toasts stacking?** Use `toast.dismiss()` to clear previous toasts.
- **Custom styling not working?** Check Tailwind config and use inline styles if needed.

---

## 7. References
- [react-hot-toast documentation](https://react-hot-toast.com/)
- [Supabase documentation](https://supabase.com/docs)

---

## 8. Example
```tsx
// Show a success toast after saving
import { toastService } from '../../services/toastService';

toastService.success('Saved successfully!');
```

---

**For questions or improvements, see the code in `src/services/toastService.tsx` and `src/components/providers/ToastProvider.tsx`.** 