import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { adminService } from '../services/adminService'
import { Layout } from '../components/layout/Layout'
import AdminDashboard from '../components/admin/AdminDashboard'
import { Navigate } from 'react-router-dom'
import { Shield, AlertTriangle } from 'lucide-react'

const AdminPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth()
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [checkingAdmin, setCheckingAdmin] = useState(true)

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user?.id || authLoading) return

      try {
        const adminStatus = await adminService.isUserAdmin(user.id)
        setIsAdmin(adminStatus)
      } catch (error) {
        console.error('Error checking admin status:', error)
        setIsAdmin(false)
      } finally {
        setCheckingAdmin(false)
      }
    }

    checkAdminStatus()
  }, [user?.id, authLoading])

  // Show loading while checking authentication and admin status
  if (authLoading || checkingAdmin) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Verifying admin access...</p>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  // Redirect if not authenticated
  if (!user) {
    return <Navigate to="/auth/login" replace />
  }

  // Show access denied if not admin
  if (isAdmin === false) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center max-w-md">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                <Shield className="h-8 w-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
              <p className="text-gray-600 mb-6">
                You don't have administrator privileges to access this page. Only authorized administrators can access the admin dashboard.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5 mr-3" />
                  <div className="text-sm text-yellow-700">
                    <p className="font-medium">Need admin access?</p>
                    <p>Contact your system administrator to request admin privileges.</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => window.history.back()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  // Show admin dashboard
  return (
    <Layout>
      <AdminDashboard />
    </Layout>
  )
}

export default AdminPage 