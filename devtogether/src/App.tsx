import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { NotificationProvider } from './contexts/NotificationContext'
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute'
import { AccessibilityProvider } from './contexts/AccessibilityContext'
import { ScrollToTop } from './components/layout/ScrollToTop'
import ToastProvider from './components/providers/ToastProvider';

// Auth Pages
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import VerifyEmailPage from './pages/auth/VerifyEmailPage'
import AuthCallbackPage from './pages/auth/AuthCallbackPage'
import RoleSelectionPage from './pages/auth/RoleSelectionPage'

// Onboarding
import OnboardingPage from './pages/onboarding/OnboardingPage'

// Profile
import ProfilePage from './pages/ProfilePage'
import SharedProfilePage from './pages/SharedProfilePage'

// Projects
import CreateProjectPage from './pages/projects/CreateProjectPage'
import ProjectsPage from './pages/projects/ProjectsPage'
import ProjectDetailsPage from './pages/projects/ProjectDetailsPage'

// Workspace
import ProjectWorkspace from './components/workspace/ProjectWorkspace'

// Applications
import ApplicationsDashboard from './pages/applications/ApplicationsDashboard'
import MyApplications from './pages/applications/MyApplications'

// Dashboard
import DashboardPage from './pages/DashboardPage'

// Homepage
import HomePage from './pages/HomePage'

// Landing Pages  
import DeveloperLandingPage from './pages/DeveloperLandingPage'
import OrganizationLandingPage from './pages/OrganizationLandingPage'
import OrganizationsPage from './pages/OrganizationsPage'

// Notifications
import NotificationsPage from './pages/NotificationsPage'

// Admin
import AdminPage from './pages/AdminPage'

// Organization Projects Page
import OrganizationProjectsPage from './pages/dashboard/OrganizationProjectsPage'

import AccessibilityPage from './pages/AccessibilityPage'
import PendingApprovalPage from './pages/PendingApprovalPage';
import RejectedOrganizationPage from './pages/RejectedOrganizationPage';
import BlockedPage from './pages/BlockedOrganizationPage';
import { useAuth } from './contexts/AuthContext';
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Profile } from './types/database';

// Custom wrapper to redirect unverified orgs
const OrgApprovalGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  // No need for useEffect redirect; handle via render
  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }
  const orgProfile = profile as Profile | null;
  if (orgProfile?.role === 'organization' && orgProfile.organization_status === 'pending' && location.pathname !== '/pending-approval') {
    return <Navigate to="/pending-approval" replace />;
  }
  return <>{children}</>;
};

// Move the redirect logic into a separate component
function AuthRedirector() {
  const { isAuthenticated, profile, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading || !isAuthenticated || !profile) return;
    const userProfile = profile as import('./types/database').Profile;
    const isHome = location.pathname === '/';
    if (isHome) {
      if (userProfile.role === 'organization') {
        if (userProfile.organization_status === 'pending') {
          navigate('/pending-approval', { replace: true });
        } else if (userProfile.organization_status === 'rejected') {
          navigate('/rejected-organization', { replace: true });
        } else if (userProfile.organization_status === 'blocked' || userProfile.blocked) {
          navigate('/blocked', { replace: true });
        }
      } else if (userProfile.role === 'developer' && userProfile.blocked) {
        navigate('/blocked', { replace: true });
      }
    }
  }, [isAuthenticated, profile, loading, location.pathname, navigate]);
  return null;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AuthRedirector />
        <NotificationProvider>
          <AccessibilityProvider>
            <ScrollToTop />
            <div className="App">
              <Routes>
                {/* Public Home Page */}
                <Route
                  path="/"
                  element={<HomePage />}
                />

                {/* Public Landing Pages */}
                <Route
                  path="/for-developers"
                  element={<DeveloperLandingPage />}
                />

                <Route
                  path="/for-organizations"
                  element={<OrganizationLandingPage />}
                />

                {/* Public Organizations Listing */}
                <Route
                  path="/organizations"
                  element={<OrganizationsPage />}
                />

                {/* Authentication Routes */}
                <Route
                  path="/auth/login"
                  element={
                    <PublicRoute>
                      <LoginPage />
                    </PublicRoute>
                  }
                />

                <Route
                  path="/auth/register"
                  element={
                    <PublicRoute>
                      <RegisterPage />
                    </PublicRoute>
                  }
                />

                <Route
                  path="/auth/forgot-password"
                  element={
                    <PublicRoute>
                      <ForgotPasswordPage />
                    </PublicRoute>
                  }
                />

                <Route
                  path="/auth/verify-email"
                  element={
                    <PublicRoute>
                      <VerifyEmailPage />
                    </PublicRoute>
                  }
                />

                <Route
                  path="/auth/callback"
                  element={<AuthCallbackPage />}
                />

                <Route
                  path="/auth/select-role"
                  element={
                    <ProtectedRoute>
                      <RoleSelectionPage />
                    </ProtectedRoute>
                  }
                />

                {/* Onboarding Route */}
                <Route
                  path="/onboarding"
                  element={
                    <ProtectedRoute>
                      <OnboardingPage />
                    </ProtectedRoute>
                  }
                />

                {/* Dashboard Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <OrgApprovalGuard>
                        <DashboardPage />
                      </OrgApprovalGuard>
                    </ProtectedRoute>
                  }
                />

                {/* Profile Routes */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/profile/:userId"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />

                {/* Shared Profile Route (Public) */}
                <Route
                  path="/profile/shared/:shareToken"
                  element={<SharedProfilePage />}
                />

                {/* Project Routes */}
                <Route
                  path="/projects"
                  element={
                    <ProtectedRoute>
                      <ProjectsPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/projects/create"
                  element={
                    <ProtectedRoute requiredRole="organization">
                      <OrgApprovalGuard>
                        <CreateProjectPage />
                      </OrgApprovalGuard>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/projects/:projectId"
                  element={
                    <ProtectedRoute>
                      <ProjectDetailsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Workspace Route */}
                <Route
                  path="/workspace/:projectId"
                  element={
                    <ProtectedRoute>
                      <OrgApprovalGuard>
                        <ProjectWorkspace />
                      </OrgApprovalGuard>
                    </ProtectedRoute>
                  }
                />

                {/* Applications Route */}
                <Route
                  path="/applications"
                  element={
                    <ProtectedRoute requiredRole="organization">
                      <OrgApprovalGuard>
                        <ApplicationsDashboard />
                      </OrgApprovalGuard>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/my-applications"
                  element={
                    <ProtectedRoute requiredRole="developer">
                      <MyApplications />
                    </ProtectedRoute>
                  }
                />

                {/* Notifications Route */}
                <Route
                  path="/notifications"
                  element={
<<<<<<< Updated upstream
                    <ProtectedRoute>
=======
                    <ProtectedRoute requiredRole={["organization", "admin", "developer"]}>
>>>>>>> Stashed changes
                      <OrgApprovalGuard>
                        <NotificationsPage />
                      </OrgApprovalGuard>
                    </ProtectedRoute>
                  }
                />

                {/* Organization Projects Route */}
                <Route
                  path="/organization/projects"
                  element={
                    <ProtectedRoute requiredRole="organization">
                      <OrgApprovalGuard>
                        <ProjectsPage />
                      </OrgApprovalGuard>
                    </ProtectedRoute>
                  }
                />

                {/* Organization Projects Management Page */}
                <Route
                  path="/dashboard/projects"
                  element={
                    <ProtectedRoute requiredRole="organization">
                      <OrgApprovalGuard>
                        <OrganizationProjectsPage />
                      </OrgApprovalGuard>
                    </ProtectedRoute>
                  }
                />

                {/* Pending Approval Route */}
                <Route
                  path="/pending-approval"
                  element={
                    <ProtectedRoute>
                      <PendingApprovalPage />
                    </ProtectedRoute>
                  }
                />

                {/* Rejected Organization Route */}
                <Route
                  path="/rejected-organization"
                  element={
                    <ProtectedRoute>
                      <RejectedOrganizationPage />
                    </ProtectedRoute>
                  }
                />

                {/* Blocked User/Org Route */}
                <Route
                  path="/blocked"
                  element={<BlockedPage />}
                />

                {/* Admin Route */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requiredRole={"admin" as any}>
                      <AdminPage />
                    </ProtectedRoute>
                  }
                />

                {/* Accessibility Statement */}
                <Route path="/accessibility" element={<AccessibilityPage />} />

                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </AccessibilityProvider>
        </NotificationProvider>
        <ToastProvider />
      </AuthProvider>
    </Router>
  )
}

export default App
