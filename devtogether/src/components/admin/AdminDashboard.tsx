import React, { useState, useEffect } from 'react'
import { adminService, AdminStats } from '../../services/adminService'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../ui/Button'
import OrganizationManagement from './OrganizationManagement'
import PartnerApplicationManagement from './PartnerApplicationManagement'
import NotificationMonitoring from './NotificationMonitoring'
import NotificationTesting from './NotificationTesting'
import ProjectApprovalManagement from './ProjectApprovalManagement'
import { 
  Users, 
  Building, 
  CheckCircle, 
  Clock, 
  XCircle, 
  TrendingUp,
  FileText,
  UserCheck,
  Activity,
  TestTube,
  FileText as FileTextIcon
} from 'lucide-react'

interface AdminDashboardProps {}

const AdminDashboard: React.FC<AdminDashboardProps> = () => {
  const { profile } = useAuth()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'organizations' | 'partners' | 'projects' | 'monitoring' | 'testing'>('overview')

  useEffect(() => {
    loadAdminStats()
  }, [])

  const loadAdminStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const adminStats = await adminService.getAdminStats()
      setStats(adminStats)
    } catch (err) {
      console.error('Error loading admin stats:', err)
      setError('Failed to load admin statistics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex">
            <XCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <Button
                  onClick={loadAdminStats}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back, {profile?.first_name || 'Admin'}. Manage the DevTogether platform.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('organizations')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'organizations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Organizations
            </button>
            <button
              onClick={() => setActiveTab('partners')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'partners'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Partner Applications
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'projects'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Project Approvals
            </button>
            <button
              onClick={() => setActiveTab('monitoring')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'monitoring'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              System Monitoring
            </button>
            <button
              onClick={() => setActiveTab('testing')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'testing'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              System Testing
            </button>
          </nav>
        </div>
      </div>

      {/* Statistics Cards - Only in Overview */}
      {activeTab === 'overview' && stats && (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {/* Total Developers */}
          <div className="bg-white rounded-lg shadow p-4 flex flex-col justify-between min-h-[110px]">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3 w-0 flex-1">
                <dl>
                  <dt className="text-xs font-medium text-gray-500 truncate">Total Developers</dt>
                  <dd className="text-lg font-bold text-gray-900">{stats.totalDevelopers.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>
          {/* Total Projects */}
          <div className="bg-white rounded-lg shadow p-4 flex flex-col justify-between min-h-[110px]">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3 w-0 flex-1">
                <dl>
                  <dt className="text-xs font-medium text-gray-500 truncate">Total Projects</dt>
                  <dd className="text-lg font-bold text-gray-900">{stats.totalProjects.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>
          {/* Total Organizations */}
          <div className="bg-white rounded-lg shadow p-4 flex flex-col justify-between min-h-[110px]">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Building className="h-5 w-5 text-purple-600" />
              </div>
              <div className="ml-3 w-0 flex-1">
                <dl>
                  <dt className="text-xs font-medium text-gray-500 truncate">Total Organizations</dt>
                  <dd className="text-lg font-bold text-gray-900">{stats.totalOrganizations.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>
          {/* Verified Organizations */}
          <div className="bg-white rounded-lg shadow p-4 flex flex-col justify-between min-h-[110px]">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-yellow-500" />
              </div>
              <div className="ml-3 w-0 flex-1">
                <dl>
                  <dt className="text-xs font-medium text-gray-500 truncate">Verified Organizations</dt>
                  <dd className="text-lg font-bold text-gray-900">{stats.verifiedOrganizations.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>
          {/* Pending Organizations */}
          <div className="bg-white rounded-lg shadow p-4 flex flex-col justify-between min-h-[110px]">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="ml-3 w-0 flex-1">
                <dl>
                  <dt className="text-xs font-medium text-gray-500 truncate">Pending Organizations</dt>
                  <dd className="text-lg font-bold text-gray-900">{stats.pendingOrganizations.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>
          {/* Rejected Organizations */}
          <div className="bg-white rounded-lg shadow p-4 flex flex-col justify-between min-h-[110px]">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div className="ml-3 w-0 flex-1">
                <dl>
                  <dt className="text-xs font-medium text-gray-500 truncate">Rejected Organizations</dt>
                  <dd className="text-lg font-bold text-gray-900">{stats.rejectedOrganizations.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>
          {/* Partner Applications */}
          <div className="bg-white rounded-lg shadow p-4 flex flex-col justify-between min-h-[110px]">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserCheck className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="ml-3 w-0 flex-1">
                <dl>
                  <dt className="text-xs font-medium text-gray-500 truncate">Partner Applications</dt>
                  <dd className="text-lg font-bold text-gray-900">{stats.totalPartnerApplications.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>
          {/* Pending Partner Applications */}
          <div className="bg-white rounded-lg shadow p-4 flex flex-col justify-between min-h-[110px]">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
              <div className="ml-3 w-0 flex-1">
                <dl>
                  <dt className="text-xs font-medium text-gray-500 truncate">Pending Partner Apps</dt>
                  <dd className="text-lg font-bold text-gray-900">{stats.pendingPartnerApplications.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>
          {/* Pending Projects */}
          <div className="bg-white rounded-lg shadow p-4 flex flex-col justify-between min-h-[110px]">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3 w-0 flex-1">
                <dl>
                  <dt className="text-xs font-medium text-gray-500 truncate">Pending Projects</dt>
                  <dd className="text-lg font-bold text-gray-900">{stats.pendingProjects.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button
                onClick={() => setActiveTab('organizations')}
                className="w-full justify-start"
                variant="secondary"
              >
                <Building className="w-4 h-4 mr-2" />
                Manage Organizations ({stats?.pendingOrganizations || 0} pending)
              </Button>
              <Button
                onClick={() => setActiveTab('partners')}
                className="w-full justify-start"
                variant="secondary"
              >
                <UserCheck className="w-4 h-4 mr-2" />
                Review Partner Applications ({stats?.pendingPartnerApplications || 0} pending)
              </Button>
              <Button
                onClick={() => setActiveTab('projects')}
                className="w-full justify-start"
                variant="secondary"
              >
                <FileTextIcon className="w-4 h-4 mr-2" />
                Approve Projects ({stats?.pendingProjects || 0} pending)
              </Button>
              <Button
                onClick={() => setActiveTab('monitoring')}
                className="w-full justify-start"
                variant="secondary"
              >
                <Activity className="w-4 h-4 mr-2" />
                System Monitoring & Health
              </Button>
              <Button
                onClick={() => setActiveTab('testing')}
                className="w-full justify-start"
                variant="secondary"
              >
                <TestTube className="w-4 h-4 mr-2" />
                System Testing & Validation
              </Button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">System Overview</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Verification Rate</span>
                <span className="font-medium">
                  {stats?.totalOrganizations ? 
                    `${Math.round((stats.verifiedOrganizations / stats.totalOrganizations) * 100)}%`
                    : '0%'
                  }
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Pending Reviews</span>
                <span className="font-medium text-yellow-600">
                  {(stats?.pendingOrganizations || 0) + (stats?.pendingPartnerApplications || 0) + (stats?.pendingProjects || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Platform Growth</span>
                <span className="font-medium text-green-600">Active</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Organization Management Tab */}
      {activeTab === 'organizations' && <OrganizationManagement />}

      {/* Partner Application Management Tab */}
      {activeTab === 'partners' && <PartnerApplicationManagement />}

      {/* Project Approval Management Tab */}
      {activeTab === 'projects' && <ProjectApprovalManagement />}

      {/* Notification System Monitoring Tab */}
      {activeTab === 'monitoring' && <NotificationMonitoring />}

      {/* Notification System Testing Tab */}
      {activeTab === 'testing' && <NotificationTesting />}
    </div>
  )
}

export default AdminDashboard 