import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { NotificationProvider } from './contexts/NotificationContext'
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute'
import { AccessibilityProvider } from './contexts/AccessibilityContext'
import { ScrollToTop } from './components/layout/ScrollToTop'

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
import { useAuth } from './contexts/AuthContext';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Custom wrapper to redirect unverified orgs
const OrgApprovalGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    if (
      !loading &&
      user &&
      profile &&
      profile.role === 'organization' &&
      profile.organization_verified === false &&
      location.pathname !== '/pending-approval'
    ) {
      navigate('/pending-approval', { replace: true });
    }
  }, [user, profile, loading, location.pathname, navigate]);
  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }
  if (profile.role === 'organization' && profile.organization_verified === false) {
    // Block rendering if not yet redirected
    return null;
  }
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AccessibilityProvider>
          <Router>
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
                    <ProtectedRoute requiredRole="organization">
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
                      <ProjectWorkspace />
                    </ProtectedRoute>
                  }
                />

                {/* Applications Route */}
                <Route
                  path="/applications"
                  element={
                    <ProtectedRoute>
                      <ApplicationsDashboard />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/my-applications"
                  element={
                    <ProtectedRoute>
                      <MyApplications />
                    </ProtectedRoute>
                  }
                />

                {/* Notifications Route */}
                <Route
                  path="/notifications"
                  element={
                    <ProtectedRoute>
                      <NotificationsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Organization Projects Route */}
                <Route
                  path="/organization/projects"
                  element={
                    <ProtectedRoute requiredRole="organization">
                      <ProjectsPage />
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
          </Router>
        </AccessibilityProvider>
      </NotificationProvider>
    </AuthProvider>
  )
}

export default App
