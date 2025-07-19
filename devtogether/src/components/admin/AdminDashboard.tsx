import React, { useState, useEffect } from 'react'
import { adminService, AdminStats } from '../../services/adminService'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../ui/Button'
import OrganizationManagement from './OrganizationManagement'
import PartnerApplicationManagement from './PartnerApplicationManagement'
import ProjectsManagement from './ProjectsManagement';
import DeveloperManagement from './DeveloperManagement';
import { 
  Users, 
  Building, 
  CheckCircle, 
  Clock, 
  XCircle, 
  TrendingUp,
  FileText,
  UserCheck,
  TestTube,
  FileText as FileTextIcon
} from 'lucide-react'

interface AdminDashboardProps {}

const AdminDashboard: React.FC<AdminDashboardProps> = () => {
  const { profile } = useAuth()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'organizations' | 'partners' | 'projects' | 'developers'>('overview');

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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2 text-sm sm:text-base">
          Welcome back, {profile?.first_name || 'Admin'}. Manage the DevTogether platform.
        </p>
      </div>

      {/* Mobile-Responsive Tab Navigation */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <div className="overflow-x-auto overflow-y-hidden scrollbar-hide">
            <nav className="-mb-px flex space-x-2 sm:space-x-8 min-w-max px-2 sm:px-0 whitespace-nowrap">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-3 px-3 sm:px-1 border-b-2 font-medium text-xs sm:text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('organizations')}
                className={`py-3 px-3 sm:px-1 border-b-2 font-medium text-xs sm:text-sm ${
                  activeTab === 'organizations'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Organizations
              </button>
              <button
                onClick={() => setActiveTab('partners')}
                className={`py-3 px-3 sm:px-1 border-b-2 font-medium text-xs sm:text-sm ${
                  activeTab === 'partners'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Partner Applications
              </button>
              <button
                onClick={() => setActiveTab('projects')}
                className={`py-3 px-3 sm:px-1 border-b-2 font-medium text-xs sm:text-sm ${
                  activeTab === 'projects'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Projects
              </button>
              <button
                onClick={() => setActiveTab('developers')}
                className={`py-3 px-3 sm:px-1 border-b-2 font-medium text-xs sm:text-sm ${
                  activeTab === 'developers'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Developers
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Modern Overview Tab */}
      {activeTab === 'overview' && stats && (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
            <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center justify-center min-h-[90px]">
              <Users className="h-5 w-5 text-blue-600 mb-1" />
              <div className="text-xs font-medium text-gray-500">Total Developers</div>
              <div className="text-lg font-bold text-gray-900">{stats.totalDevelopers}</div>
            </div>
            <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center justify-center min-h-[90px]">
              <FileText className="h-5 w-5 text-green-600 mb-1" />
              <div className="text-xs font-medium text-gray-500">Total Projects</div>
              <div className="text-lg font-bold text-gray-900">{stats.totalProjects}</div>
            </div>
            <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center justify-center min-h-[90px]">
              <Building className="h-5 w-5 text-purple-600 mb-1" />
              <div className="text-xs font-medium text-gray-500">Total Organizations</div>
              <div className="text-lg font-bold text-gray-900">{stats.totalOrganizations}</div>
            </div>
            <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center justify-center min-h-[90px]">
              <UserCheck className="h-5 w-5 text-pink-600 mb-1" />
              <div className="text-xs font-medium text-gray-500">Partner Applications</div>
              <div className="text-lg font-bold text-gray-900">{stats.totalPartnerApplications}</div>
            </div>
          </div>

          {/* Quick Review Panel - Enhanced */}
          <div className="col-span-full bg-gradient-to-r from-amber-50 to-yellow-50 border border-yellow-200 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-yellow-900">Pending Reviews</h3>
                  <p className="text-sm text-yellow-700">Quick access to items requiring attention</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-yellow-800">
                {(stats.pendingOrganizations + stats.pendingProjects + stats.pendingPartnerApplications)}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Pending Organizations Quick Access */}
              <button
                onClick={() => setActiveTab('organizations')}
                className="group bg-white border border-yellow-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:border-yellow-300 text-left"
              >
                <div className="flex items-center justify-between mb-2">
                  <Building className="h-5 w-5 text-yellow-600 group-hover:text-yellow-700" />
                  <span className="text-lg font-bold text-yellow-800">{stats.pendingOrganizations}</span>
                </div>
                <div className="text-sm font-medium text-gray-900">Organizations</div>
                <div className="text-xs text-gray-600">Pending verification</div>
              </button>

              {/* Pending Projects Quick Access */}
              <button
                onClick={() => setActiveTab('projects')}
                className="group bg-white border border-yellow-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:border-yellow-300 text-left"
              >
                <div className="flex items-center justify-between mb-2">
                  <FileText className="h-5 w-5 text-yellow-600 group-hover:text-yellow-700" />
                  <span className="text-lg font-bold text-yellow-800">{stats.pendingProjects}</span>
                </div>
                <div className="text-sm font-medium text-gray-900">Projects</div>
                <div className="text-xs text-gray-600">Awaiting approval</div>
              </button>

              {/* Pending Partner Applications Quick Access */}
              <button
                onClick={() => setActiveTab('partners')}
                className="group bg-white border border-yellow-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:border-yellow-300 text-left"
              >
                <div className="flex items-center justify-between mb-2">
                  <UserCheck className="h-5 w-5 text-yellow-600 group-hover:text-yellow-700" />
                  <span className="text-lg font-bold text-yellow-800">{stats.pendingPartnerApplications}</span>
                </div>
                                 <div className="text-sm font-medium text-gray-900">Partner Apps</div>
                 <div className="text-xs text-gray-600">Pending review</div>
               </button>
            </div>
          </div>
        </>
      )}

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button
                onClick={() => setActiveTab('organizations')}
                className="w-full justify-start text-sm"
                variant="secondary"
              >
                <Building className="w-4 h-4 mr-2" />
                Manage Organizations ({stats?.pendingOrganizations || 0} pending)
              </Button>
              <Button
                onClick={() => setActiveTab('partners')}
                className="w-full justify-start text-sm"
                variant="secondary"
              >
                <UserCheck className="w-4 h-4 mr-2" />
                Review Partner Applications ({stats?.pendingPartnerApplications || 0} pending)
              </Button>
              <Button
                onClick={() => setActiveTab('projects')}
                className="w-full justify-start text-sm"
                variant="secondary"
              >
                <FileTextIcon className="w-4 h-4 mr-2" />
                Approve Projects ({stats?.pendingProjects || 0} pending)
              </Button>
            </div>
          </div>

          {/* System Overview */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">System Overview</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Verification Rate</span>
                <span className="font-medium text-sm">
                  {stats?.totalOrganizations ? 
                    `${Math.round((stats.verifiedOrganizations / stats.totalOrganizations) * 100)}%`
                    : '0%'
                  }
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Pending Reviews</span>
                <span className="font-medium text-yellow-600 text-sm">
                  {(stats?.pendingOrganizations || 0) + (stats?.pendingPartnerApplications || 0) + (stats?.pendingProjects || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Platform Growth</span>
                <span className="font-medium text-green-600 text-sm">Active</span>
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
      {activeTab === 'projects' && (
        <ProjectsManagement />
      )}
      {activeTab === 'developers' && <DeveloperManagement />}
    </div>
  )
}

export default AdminDashboard 