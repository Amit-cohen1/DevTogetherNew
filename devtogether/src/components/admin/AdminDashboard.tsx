import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
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
  Shield,
  Crown,
  Activity,
  BarChart3,
  AlertTriangle,
  Settings,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Star,
  Zap,
  Globe,
  Database,
  PieChart
} from 'lucide-react'

interface AdminDashboardProps {}

const AdminDashboard: React.FC<AdminDashboardProps> = () => {
  const { profile } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAnalytics, setShowAnalytics] = useState(false)
  
  // Get initial tab from URL params or default to overview
  const initialTab = searchParams.get('tab') as 'overview' | 'organizations' | 'partners' | 'projects' | 'developers' || 'overview'
  const [activeTab, setActiveTab] = useState<'overview' | 'organizations' | 'partners' | 'projects' | 'developers'>(initialTab);

  useEffect(() => {
    loadAdminStats()
  }, [])

  // Update tab when URL params change
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab') as 'overview' | 'organizations' | 'partners' | 'projects' | 'developers'
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl)
    }
  }, [searchParams, activeTab])

  // Update URL when tab changes
  const handleTabChange = (tab: 'overview' | 'organizations' | 'partners' | 'projects' | 'developers') => {
    setActiveTab(tab)
    if (tab === 'overview') {
      // Remove tab param for overview (default)
      searchParams.delete('tab')
    } else {
      searchParams.set('tab', tab)
    }
    setSearchParams(searchParams)
  }

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

  // Enhanced stats calculations
  const enhancedStats = stats ? {
    totalUsers: stats.totalDevelopers + stats.totalOrganizations,
    verificationRate: stats.totalOrganizations > 0 ? Math.round((stats.verifiedOrganizations / stats.totalOrganizations) * 100) : 0,
    pendingItems: stats.pendingOrganizations + stats.pendingProjects + stats.pendingPartnerApplications,
    approvalRate: stats.totalProjects > 0 ? Math.round(((stats.totalProjects - stats.pendingProjects) / stats.totalProjects) * 100) : 0,
    platformHealth: stats.pendingOrganizations < 5 && stats.pendingProjects < 10 ? 'Excellent' : stats.pendingOrganizations < 10 ? 'Good' : 'Needs Attention',
    ...stats
  } : null

  const TAB_CONFIG = [
    { 
      id: 'overview', 
      label: 'Dashboard', 
      icon: BarChart3, 
      color: 'text-purple-600',
      description: 'Platform overview'
    },
    { 
      id: 'organizations', 
      label: 'Organizations', 
      icon: Building, 
      color: 'text-blue-600',
      description: 'Manage organizations'
    },
    { 
      id: 'partners', 
      label: 'Partners', 
      icon: UserCheck, 
      color: 'text-green-600',
      description: 'Partner applications'
    },
    { 
      id: 'projects', 
      label: 'Projects', 
      icon: FileText, 
      color: 'text-orange-600',
      description: 'Project approval'
    },
    { 
      id: 'developers', 
      label: 'Developers', 
      icon: Users, 
      color: 'text-indigo-600',
      description: 'User management'
    }
  ]

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-40 bg-gradient-to-r from-purple-200 to-pink-200 rounded-3xl" />
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl" />
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-8 shadow-xl">
          <div className="flex items-center justify-center mb-6">
            <div className="p-3 bg-red-100 rounded-2xl">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
              </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-red-900 mb-3">Error Loading Admin Dashboard</h3>
            <p className="text-red-700 mb-6">{error}</p>
                <Button
                  onClick={loadAdminStats}
              className="bg-red-600 hover:bg-red-700 text-white shadow-lg"
              icon={<RefreshCw className="w-4 h-4" />}
                >
                  Try Again
                </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Enhanced Admin Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 rounded-3xl shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative p-8 md:p-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-semibold">
                  Administrator Portal
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                Admin Dashboard
              </h1>
              <p className="text-white/90 text-lg leading-relaxed max-w-2xl">
                Welcome back, {profile?.first_name || 'Admin'}. Monitor and manage the DevTogether platform with comprehensive administrative tools.
              </p>
              {enhancedStats && enhancedStats.pendingItems > 0 && (
                <div className="flex items-center gap-3 mt-4 p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                  <div className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                  </div>
                  <span className="text-white font-semibold">
                    {enhancedStats.pendingItems} item{enhancedStats.pendingItems !== 1 ? 's' : ''} pending review
                  </span>
                </div>
              )}
      </div>

            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm"
                icon={<BarChart3 className="w-4 h-4" />}
              >
                Analytics
              </Button>
              <Button 
                variant="outline" 
                onClick={loadAdminStats} 
                className="bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm"
                icon={<RefreshCw className="w-4 h-4" />}
              >
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Metrics Dashboard */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <AdminMetricCard 
            label="Total Users" 
            value={enhancedStats!.totalUsers} 
            icon={Users} 
            color="text-blue-700"
            bgColor="bg-gradient-to-br from-blue-50 to-blue-100"
            borderColor="border-blue-200"
          />
          <AdminMetricCard 
            label="Organizations" 
            value={stats.totalOrganizations} 
            icon={Building} 
            color="text-purple-700"
            bgColor="bg-gradient-to-br from-purple-50 to-purple-100"
            borderColor="border-purple-200"
          />
          <AdminMetricCard 
            label="Projects" 
            value={stats.totalProjects} 
            icon={FileText} 
            color="text-green-700"
            bgColor="bg-gradient-to-br from-green-50 to-green-100"
            borderColor="border-green-200"
          />
          <AdminMetricCard 
            label="Developers" 
            value={stats.totalDevelopers} 
            icon={Users} 
            color="text-indigo-700"
            bgColor="bg-gradient-to-br from-indigo-50 to-indigo-100"
            borderColor="border-indigo-200"
          />
          <AdminMetricCard 
            label="Pending Items" 
            value={enhancedStats!.pendingItems} 
            icon={Clock} 
            color="text-yellow-700"
            bgColor="bg-gradient-to-br from-yellow-50 to-yellow-100"
            borderColor="border-yellow-200"
            highlight={enhancedStats!.pendingItems > 5}
          />
          <AdminMetricCard 
            label="Verification Rate" 
            value={`${enhancedStats!.verificationRate}%`} 
            icon={CheckCircle} 
            color="text-emerald-700"
            bgColor="bg-gradient-to-br from-emerald-50 to-emerald-100"
            borderColor="border-emerald-200"
          />
        </div>
      )}

      {/* Analytics Panel */}
      {showAnalytics && enhancedStats && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-purple-600" />
              Platform Analytics
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Platform Health</h4>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-xl">
                    <div className="text-2xl font-bold text-green-700">{enhancedStats.platformHealth}</div>
                    <div className="text-sm text-green-600">System Status</div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <div className="text-2xl font-bold text-blue-700">{enhancedStats.approvalRate}%</div>
                    <div className="text-sm text-blue-600">Approval Rate</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Pending Reviews</h4>
                                 <div className="space-y-2">
                   {stats && [
                     { label: 'Organizations', count: stats.pendingOrganizations, color: 'purple' },
                     { label: 'Projects', count: stats.pendingProjects, color: 'green' },
                     { label: 'Partners', count: stats.pendingPartnerApplications, color: 'blue' }
                   ].map(item => {
                     const percentage = enhancedStats.pendingItems > 0 ? Math.round((item.count / enhancedStats.pendingItems) * 100) : 0
                     return (
                       <div key={item.label} className="flex items-center justify-between">
                         <span className="text-sm text-gray-600">{item.label}</span>
                         <div className="flex items-center gap-2">
                           <div className="w-16 bg-gray-200 rounded-full h-1.5">
                             <div 
                               className={`bg-${item.color}-600 h-1.5 rounded-full`} 
                               style={{ width: `${percentage}%` }}
                             ></div>
                           </div>
                           <span className="text-sm font-medium text-gray-900 w-8">{item.count}</span>
                         </div>
                       </div>
                     )
                   })}
                 </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Quick Actions</h4>
                <div className="space-y-2">
                                     <Button
                     variant="outline"
                     className="w-full justify-start"
                     onClick={() => handleTabChange('organizations')}
                   >
                     <Building className="w-4 h-4 mr-2" />
                     Review Organizations ({stats?.pendingOrganizations || 0})
                   </Button>
                   <Button
                     variant="outline"
                     className="w-full justify-start"
                     onClick={() => handleTabChange('projects')}
                   >
                     <FileText className="w-4 h-4 mr-2" />
                     Approve Projects ({stats?.pendingProjects || 0})
                   </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

             {/* Enhanced Tab Navigation */}
       <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
         <div className="border-b border-gray-200">
           {/* Mobile tabs - Enhanced grid */}
           <div className="grid grid-cols-2 sm:hidden gap-2 p-4">
             {TAB_CONFIG.slice(0, 4).map((tab) => {
               const IconComponent = tab.icon
               return (
              <button
                   key={tab.id}
                   onClick={() => handleTabChange(tab.id as any)}
                   className={`py-4 px-3 border-2 font-medium text-xs text-center transition-all duration-200 bg-white rounded-xl shadow-sm ${
                     activeTab === tab.id
                       ? 'border-purple-500 text-purple-600 bg-purple-50'
                       : 'border-gray-200 text-gray-500 hover:text-gray-700 hover:border-purple-300 hover:bg-gray-50'
                   }`}
                 >
                   <IconComponent className="w-5 h-5 mx-auto mb-2" />
                   <span className="block font-semibold">{tab.label.split(' ')[0]}</span>
              </button>
               )
             })}
           </div>
           {/* Fifth tab (Developers) - Full width on mobile */}
           <div className="sm:hidden px-4 pb-4">
              <button
                onClick={() => handleTabChange('developers')}
               className={`w-full py-4 px-3 border-2 font-medium text-xs text-center transition-all duration-200 bg-white rounded-xl shadow-sm ${
                  activeTab === 'developers'
                   ? 'border-purple-500 text-purple-600 bg-purple-50'
                   : 'border-gray-200 text-gray-500 hover:text-gray-700 hover:border-purple-300 hover:bg-gray-50'
                }`}
              >
               <Users className="w-5 h-5 mx-auto mb-2" />
               <span className="block font-semibold">Developers</span>
              </button>
            </div>

                     {/* Desktop tabs - Fixed width approach */}
           <div className="hidden sm:block px-8">
             <div className="flex justify-center space-x-4">
               {TAB_CONFIG.map((tab) => {
                 const IconComponent = tab.icon
                 return (
              <button
                     key={tab.id}
                     onClick={() => handleTabChange(tab.id as any)}
                     className={`py-4 px-8 border-b-2 font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                       activeTab === tab.id
                         ? 'border-purple-500 text-purple-600 bg-purple-50'
                         : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                     }`}
                   >
                     <div className="flex items-center gap-2">
                       <IconComponent className="w-4 h-4" />
                       <span>{tab.label}</span>
                     </div>
              </button>
                 )
               })}
             </div>
        </div>
      </div>

        {/* Enhanced Overview Tab */}
      {activeTab === 'overview' && stats && (
          <div className="p-6 space-y-6">
            {/* Critical Alerts Section */}
            {enhancedStats!.pendingItems > 10 && (
              <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
                  <div>
                    <h3 className="text-lg font-semibold text-red-900">High Priority Alert</h3>
                    <p className="text-sm text-red-700">Multiple items require immediate admin attention</p>
            </div>
            </div>
                <div className="text-red-800 font-medium">
                  {enhancedStats!.pendingItems} pending items need review - this may impact platform experience
            </div>
          </div>
            )}

          {/* Quick Review Panel - Enhanced */}
            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-yellow-100 rounded-xl">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-yellow-900">Pending Reviews</h3>
                    <p className="text-sm text-yellow-700">Items requiring administrative attention</p>
                  </div>
                </div>
                <div className="text-3xl font-bold text-yellow-800">
                  {enhancedStats!.pendingItems}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Enhanced Quick Access Cards */}
                <ReviewCard
                  title="Organizations"
                  count={stats.pendingOrganizations}
                  description="Pending verification"
                  icon={Building}
                  onClick={() => handleTabChange('organizations')}
                  color="blue"
                />
                <ReviewCard
                  title="Projects"
                  count={stats.pendingProjects}
                  description="Awaiting approval"
                  icon={FileText}
                  onClick={() => handleTabChange('projects')}
                  color="green"
                />
                <ReviewCard
                  title="Partner Apps"
                  count={stats.pendingPartnerApplications}
                  description="Pending review"
                  icon={UserCheck}
                  onClick={() => handleTabChange('partners')}
                  color="purple"
                />
              </div>
            </div>
            
            {/* Enhanced Dashboard Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* System Overview - Enhanced */}
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-600" />
                  System Overview
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="text-gray-600">Platform Health</span>
                    <span className={`font-semibold ${
                      enhancedStats!.platformHealth === 'Excellent' ? 'text-green-600' :
                      enhancedStats!.platformHealth === 'Good' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {enhancedStats!.platformHealth}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="text-gray-600">Verification Rate</span>
                    <span className="font-semibold text-green-600">{enhancedStats!.verificationRate}%</span>
                </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="text-gray-600">Total Users</span>
                    <span className="font-semibold text-blue-600">{enhancedStats!.totalUsers}</span>
                </div>
            </div>
          </div>

              {/* Quick Actions - Enhanced */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-600" />
                  Quick Actions
                </h3>
            <div className="space-y-3">
              <Button
                onClick={() => handleTabChange('organizations')}
                    className="w-full justify-start text-left bg-white hover:bg-purple-50 text-gray-900 border border-purple-200"
                    variant="outline"
                  >
                    <Building className="w-4 h-4 mr-3" />
                    <div>
                      <div className="font-medium">Manage Organizations</div>
                      <div className="text-xs text-gray-500">{stats.pendingOrganizations} pending verification</div>
                    </div>
              </Button>
              <Button
                    onClick={() => handleTabChange('projects')}
                    className="w-full justify-start text-left bg-white hover:bg-green-50 text-gray-900 border border-green-200"
                    variant="outline"
                  >
                    <FileText className="w-4 h-4 mr-3" />
                    <div>
                      <div className="font-medium">Review Projects</div>
                      <div className="text-xs text-gray-500">{stats.pendingProjects} awaiting approval</div>
                    </div>
              </Button>
              <Button
                    onClick={() => handleTabChange('developers')}
                    className="w-full justify-start text-left bg-white hover:bg-indigo-50 text-gray-900 border border-indigo-200"
                    variant="outline"
                  >
                    <Users className="w-4 h-4 mr-3" />
                    <div>
                      <div className="font-medium">Manage Developers</div>
                      <div className="text-xs text-gray-500">{stats.totalDevelopers} registered users</div>
                    </div>
              </Button>
              </div>
            </div>
          </div>
        </div>
      )}

                 {/* Tab Content */}
         <div className="p-6 lg:p-8 min-h-96">
      {activeTab === 'organizations' && <OrganizationManagement />}
      {activeTab === 'partners' && <PartnerApplicationManagement />}
           {activeTab === 'projects' && <ProjectsManagement />}
      {activeTab === 'developers' && <DeveloperManagement />}
         </div>
      </div>
    </div>
  )
}

// Enhanced Helper Components
interface AdminMetricCardProps {
  label: string
  value: string | number
  icon: React.ComponentType<any>
  color: string
  bgColor: string
  borderColor: string
  highlight?: boolean
}

const AdminMetricCard: React.FC<AdminMetricCardProps> = ({ 
  label, 
  value, 
  icon: Icon, 
  color, 
  bgColor, 
  borderColor, 
  highlight 
}) => (
  <div className={`${bgColor} rounded-xl border ${borderColor} p-4 text-center transition-all duration-300 hover:shadow-lg ${highlight ? 'ring-2 ring-yellow-300 shadow-lg' : ''}`}>
    <div className="flex items-center justify-center mb-2">
      <div className={`p-2 rounded-lg ${highlight ? 'bg-white' : 'bg-white/50'} shadow-sm`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
    </div>
    <div className={`text-2xl font-bold ${color} mb-1`}>{value}</div>
    <div className="text-sm text-gray-600 font-medium">{label}</div>
    {highlight && (
      <div className="mt-2">
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
          <AlertTriangle className="w-2 h-2" />
          Needs Review
        </span>
      </div>
    )}
  </div>
)

interface ReviewCardProps {
  title: string
  count: number
  description: string
  icon: React.ComponentType<any>
  onClick: () => void
  color: 'blue' | 'green' | 'purple'
}

const ReviewCard: React.FC<ReviewCardProps> = ({ 
  title, 
  count, 
  description, 
  icon: Icon, 
  onClick, 
  color 
}) => {
  const colorClasses = {
    blue: 'hover:border-blue-300 hover:bg-blue-50 text-blue-600',
    green: 'hover:border-green-300 hover:bg-green-50 text-green-600',
    purple: 'hover:border-purple-300 hover:bg-purple-50 text-purple-600'
  }

  return (
    <button
      onClick={onClick}
      className={`group bg-white border border-yellow-200 rounded-xl p-4 hover:shadow-md transition-all duration-200 ${colorClasses[color]} text-left w-full`}
    >
      <div className="flex items-center justify-between mb-3">
        <Icon className="h-6 w-6 text-yellow-600 group-hover:scale-110 transition-transform" />
        <span className="text-2xl font-bold text-yellow-800">{count}</span>
      </div>
      <div className="text-sm font-semibold text-gray-900">{title}</div>
      <div className="text-xs text-gray-600">{description}</div>
    </button>
  )
}

export default AdminDashboard 