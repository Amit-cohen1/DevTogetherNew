# Email Address Standardization

## Summary
All support/contact email addresses in the client codebase have been updated to use a single, correct address:

**devtogether.help@gmail.com**

## Updated Files
- src/pages/AccessibilityPage.tsx (English & Hebrew sections)
- src/components/layout/Footer.tsx
- src/pages/PendingApprovalPage.tsx (SUPPORT_EMAIL constant)
- src/pages/RejectedOrganizationPage.tsx (help contact link)
- src/pages/BlockedOrganizationPage.tsx (help contact link)
- src/pages/auth/VerifyEmailPage.tsx (mailto links & visible text)
- src/pages/auth/AuthCallbackPage.tsx (mailto links & visible text)
- src/components/onboarding/OnboardingLayout.tsx (mailto links & visible text)

## Details
All previous addresses (devtogther@gmail.com, devtogether@gmail.com, support@devtogether.org, support@devtogether.com) have been replaced. No other support or contact emails remain in the client codebase.

---
_This change ensures a single, consistent support contact for all user-facing features and documentation._ 