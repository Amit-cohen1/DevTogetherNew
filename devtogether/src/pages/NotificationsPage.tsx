import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Layout } from '../components/layout'
import { useNotifications } from '../contexts/NotificationContext'
import { notificationService } from '../services/notificationService'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import {
  Bell,
  Search,
  CheckCircle,
  Users,
  Briefcase,
  Trophy,
  AlertCircle,
  Trash2,
  ExternalLink,
  RefreshCw,
  Eye,
  Shield,
  MessageCircle,
  Activity,
  Star,
  Filter,
  SortAsc,
  SortDesc,
  Settings,
  Zap,
  BarChart3,
  TrendingUp,
  Clock,
  Circle,
  Plus,
  Archive
} from 'lucide-react'
import type { Notification as NotificationType } from '../services/notificationService'
import { useAuth } from '../contexts/AuthContext'
import { NotificationNavigator } from '../utils/notificationNavigation'

interface FilterOptions {
  type: string
  status: string
  searchQuery: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

interface NotificationStats {
  total: number
  unread: number
  application: number
  project: number
  team: number
  achievement: number
  system: number
  moderation: number
  chat: number
  status_change: number
  feedback: number
  promotion: number
  todayCount: number
  weekCount: number
  readPercentage: number
}

const SORT_OPTIONS = [
  { value: 'created_at', label: 'Date Created', icon: Clock },
  { value: 'type', label: 'Type', icon: Filter },
  { value: 'read', label: 'Read Status', icon: Eye },
  { value: 'title', label: 'Title', icon: SortAsc }
]

const TYPE_OPTIONS = [
  { value: 'all', label: 'All Types', icon: Bell, color: 'text-gray-600' },
  { value: 'application', label: 'Applications', icon: Briefcase, color: 'text-blue-600' },
  { value: 'project', label: 'Projects', icon: AlertCircle, color: 'text-green-600' },
  { value: 'team', label: 'Team', icon: Users, color: 'text-purple-600' },
  { value: 'achievement', label: 'Achievements', icon: Trophy, color: 'text-yellow-600' },
  { value: 'system', label: 'System', icon: Settings, color: 'text-gray-600' },
  { value: 'moderation', label: 'Admin', icon: Shield, color: 'text-red-600' },
  { value: 'chat', label: 'Chat', icon: MessageCircle, color: 'text-indigo-600' },
  { value: 'status_change', label: 'Status Changes', icon: Activity, color: 'text-orange-600' },
  { value: 'feedback', label: 'Feedback', icon: Star, color: 'text-amber-600' },
  { value: 'promotion', label: 'Promotions', icon: Zap, color: 'text-purple-600' }
]

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loadNotifications
  } = useNotifications()

  const { profile, user } = useAuth()

  const [allNotifications, setAllNotifications] = useState<NotificationType[]>([])
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMoreNotifications, setHasMoreNotifications] = useState(true)
  const [currentOffset, setCurrentOffset] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)

  const [filters, setFilters] = useState<FilterOptions>({
    type: 'all',
    status: 'all',
    searchQuery: '',
    sortBy: 'created_at',
    sortOrder: 'desc'
  })

  // Load initial notifications on page load
  useEffect(() => {
    loadInitialNotifications()
  }, [user?.id])

  const loadInitialNotifications = async () => {
    if (!user?.id) return
    
    try {
      const initialNotifications = await notificationService.getNotifications(user.id, 20, 0)
      setAllNotifications(initialNotifications)
      setCurrentOffset(20)
      setHasMoreNotifications(initialNotifications.length === 20)
    } catch (error) {
      console.error('Error loading initial notifications:', error)
    }
  }

  const loadMoreNotifications = async () => {
    if (!user?.id || loadingMore || !hasMoreNotifications) return

    setLoadingMore(true)
    try {
      const moreNotifications = await notificationService.getNotifications(user.id, 20, currentOffset)
      setAllNotifications(prev => [...prev, ...moreNotifications])
      setCurrentOffset(prev => prev + 20)
      setHasMoreNotifications(moreNotifications.length === 20)
    } catch (error) {
      console.error('Error loading more notifications:', error)
    } finally {
      setLoadingMore(false)
    }
  }

  // Enhanced stats calculation
  const stats = useMemo((): NotificationStats => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const todayCount = allNotifications.filter(n => new Date(n.created_at) >= today).length
    const weekCount = allNotifications.filter(n => new Date(n.created_at) >= weekAgo).length
    const readCount = allNotifications.filter(n => n.read).length
    const readPercentage = allNotifications.length > 0 ? Math.round((readCount / allNotifications.length) * 100) : 0

    return {
      total: allNotifications.length,
      unread: allNotifications.filter(n => !n.read).length,
      application: allNotifications.filter(n => n.type === 'application').length,
      project: allNotifications.filter(n => n.type === 'project').length,
      team: allNotifications.filter(n => n.type === 'team').length,
      achievement: allNotifications.filter(n => n.type === 'achievement').length,
      system: allNotifications.filter(n => n.type === 'system').length,
      moderation: allNotifications.filter(n => n.type === 'moderation').length,
      chat: allNotifications.filter(n => n.type === 'chat').length,
      status_change: allNotifications.filter(n => n.type === 'status_change').length,
      feedback: allNotifications.filter(n => n.type === 'feedback').length,
      promotion: allNotifications.filter(n => n.type === 'promotion').length,
      todayCount,
      weekCount,
      readPercentage
    }
  }, [allNotifications])

  // Enhanced filtering with sorting
  const filteredNotifications = useMemo(() => {
    let filtered = [...allNotifications]

    // Hide moderation notifications for non-admins
    if (profile?.role !== 'admin') {
      filtered = filtered.filter(n => n.type !== 'moderation')
    }

    // Type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(n => n.type === filters.type)
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(n => (filters.status === 'read' ? n.read : !n.read))
    }

    // Search filter
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase()
      filtered = filtered.filter(
        n => n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q)
      )
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any = a[filters.sortBy as keyof NotificationType]
      let bValue: any = b[filters.sortBy as keyof NotificationType]

      if (filters.sortBy === 'created_at') {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      } else if (filters.sortBy === 'read') {
        aValue = a.read ? 1 : 0
        bValue = b.read ? 1 : 0
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [allNotifications, filters, profile])

  /* Utility Helpers */
  const getNotificationIcon = (type: string) => {
    const typeOption = TYPE_OPTIONS.find(opt => opt.value === type)
    if (typeOption) {
      const IconComponent = typeOption.icon
      return <IconComponent className={`w-5 h-5 ${typeOption.color}`} />
    }
    return <Bell className="w-5 h-5 text-gray-600" />
  }

  const getNotificationLink = (n: NotificationType) => {
    if (!profile?.role || !user?.id) return '/dashboard'
    
    const navResult = NotificationNavigator.getNavigationPath(n, profile.role as any, user.id)
    return NotificationNavigator.buildNavigationUrl(navResult)
  }

  const formatDate = (iso: string) => {
    const date = new Date(iso)
    const now = new Date()
    const diffMin = Math.floor((now.getTime() - date.getTime()) / 60000)
    if (diffMin < 1) return 'Just now'
    if (diffMin < 60) return `${diffMin}m ago`
    const diffHrs = Math.floor(diffMin / 60)
    if (diffHrs < 24) return `${diffHrs}h ago`
    const diffDays = Math.floor(diffHrs / 24)
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id)
  }
  
  const handleDelete = async (id: string) => {
    await deleteNotification(id)
  }

  const handleRefresh = () => loadNotifications()

  if (loading) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded-xl" />
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded-2xl" />
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl shadow-2xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative p-8 md:p-12">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                    <Bell className="w-8 h-8 text-white" />
                  </div>
                  <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-semibold">
                    Notification Center
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                  Stay Updated
                </h1>
                <p className="text-white/90 text-lg leading-relaxed max-w-2xl">
                  Keep track of your projects, applications, and team activities with real-time notifications and insights.
                </p>
                {unreadCount > 0 && (
                  <div className="flex items-center gap-3 mt-4 p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                    <div className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                    </div>
                    <span className="text-white font-semibold">
                      {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''} waiting for you
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
                  onClick={() => setShowFilters(!showFilters)}
                  className="bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm"
                  icon={<Filter className="w-4 h-4" />}
                >
                  Filters
              </Button>
                <Button 
                  variant="outline" 
                  onClick={handleRefresh} 
                  className="bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm"
                  icon={<RefreshCw className="w-4 h-4" />}
                >
                  Refresh
                </Button>
                {unreadCount > 0 && (
                  <Button 
                    onClick={markAllAsRead} 
                    className="bg-blue-600 text-white hover:bg-blue-700 shadow-lg font-semibold border border-blue-500"
                    icon={<CheckCircle className="w-4 h-4" />}
                  >
                    Mark All Read
                </Button>
              )}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Metrics Dashboard */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <MetricCard 
            label="Total" 
            value={stats.total} 
            icon={Bell} 
            color="text-gray-700"
            bgColor="bg-gradient-to-br from-gray-50 to-gray-100"
            borderColor="border-gray-200"
          />
          <MetricCard 
            label="Unread" 
            value={stats.unread} 
            icon={Circle} 
            color="text-blue-700"
            bgColor="bg-gradient-to-br from-blue-50 to-blue-100"
            borderColor="border-blue-200"
            highlight={stats.unread > 0}
          />
          <MetricCard 
            label="Today" 
            value={stats.todayCount} 
            icon={Clock} 
            color="text-green-700"
            bgColor="bg-gradient-to-br from-green-50 to-green-100"
            borderColor="border-green-200"
          />
          <MetricCard 
            label="This Week" 
            value={stats.weekCount} 
            icon={TrendingUp} 
            color="text-purple-700"
            bgColor="bg-gradient-to-br from-purple-50 to-purple-100"
            borderColor="border-purple-200"
          />
          <MetricCard 
            label="Read Rate" 
            value={`${stats.readPercentage}%`} 
            icon={Eye} 
            color="text-indigo-700"
            bgColor="bg-gradient-to-br from-indigo-50 to-indigo-100"
            borderColor="border-indigo-200"
          />
          <MetricCard 
            label="Applications" 
            value={stats.application} 
            icon={Briefcase} 
            color="text-blue-700"
            bgColor="bg-gradient-to-br from-blue-50 to-blue-100"
            borderColor="border-blue-200"
          />
        </div>

        {/* Analytics Panel */}
        {showAnalytics && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Notification Analytics
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Type Distribution</h4>
                  <div className="space-y-2">
                    {TYPE_OPTIONS.slice(1, 6).map(type => {
                      const count = stats[type.value as keyof NotificationStats] as number
                      const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0
                      return (
                        <div key={type.value} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <type.icon className={`w-4 h-4 ${type.color}`} />
                            <span className="text-sm text-gray-600">{type.label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-1.5">
                              <div 
                                className="bg-blue-600 h-1.5 rounded-full" 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900 w-8">{count}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Engagement Stats</h4>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-xl">
                      <div className="text-2xl font-bold text-green-700">{stats.readPercentage}%</div>
                      <div className="text-sm text-green-600">Read Rate</div>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-xl">
                      <div className="text-2xl font-bold text-blue-700">{stats.todayCount}</div>
                      <div className="text-sm text-blue-600">Today's Notifications</div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Quick Actions</h4>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setFilters(prev => ({ ...prev, status: 'unread' }))}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Unread ({stats.unread})
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setFilters(prev => ({ ...prev, type: 'application' }))}
                    >
                      <Briefcase className="w-4 h-4 mr-2" />
                      Application Updates ({stats.application})
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Filter className="w-5 h-5 text-blue-600" />
                Filter & Sort Notifications
              </h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                  type="text"
                  placeholder="Search notifications..."
                  value={filters.searchQuery}
                      onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                      className="pl-10"
                />
              </div>
                </div>

            {/* Type filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <Select 
              value={filters.type} 
                    onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                  >
                    {TYPE_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
            </Select>
                </div>

            {/* Status filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <Select 
              value={filters.status} 
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="all">All Status</option>
              <option value="unread">Unread Only</option>
              <option value="read">Read Only</option>
            </Select>
                </div>

                {/* Sort */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort</label>
                  <div className="flex gap-2">
                    <Select 
                      value={filters.sortBy} 
                      onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                      className="flex-1"
                    >
                      {SORT_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                    <Button
                      variant="outline"
                      onClick={() => setFilters(prev => ({ 
                        ...prev, 
                        sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' 
                      }))}
                      className="px-3"
                    >
                      {filters.sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
          </div>
          
          {/* Quick Filter Chips */}
              <div className="flex flex-wrap gap-2">
                <FilterChip
                  label={`Unread (${stats.unread})`}
                  active={filters.status === 'unread'}
              onClick={() => setFilters(prev => ({ ...prev, status: 'unread' }))}
                  color="blue"
                />
                <FilterChip
                  label={`Applications (${stats.application})`}
                  active={filters.type === 'application'}
              onClick={() => setFilters(prev => ({ ...prev, type: 'application' }))}
                  color="blue"
                />
                <FilterChip
                  label={`Projects (${stats.project})`}
                  active={filters.type === 'project'}
                  onClick={() => setFilters(prev => ({ ...prev, type: 'project' }))}
                  color="green"
                />
            {profile?.role === 'admin' && stats.moderation > 0 && (
                  <FilterChip
                    label={`Admin (${stats.moderation})`}
                    active={filters.type === 'moderation'}
                onClick={() => setFilters(prev => ({ ...prev, type: 'moderation' }))}
                    color="red"
                  />
            )}
            {(filters.searchQuery || filters.type !== 'all' || filters.status !== 'all') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilters({ type: 'all', status: 'all', searchQuery: '', sortBy: 'created_at', sortOrder: 'desc' })}
                    className="text-xs"
              >
                Clear All
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Notifications List */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-600" />
                Notifications
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm font-semibold">
                  {filteredNotifications.length}
                </span>
              </h3>
              <div className="text-sm text-gray-600">
                Showing {filteredNotifications.length} of {stats.total} notifications
              </div>
          </div>
        </div>

          {filteredNotifications.length === 0 ? (
            <EmptyState
              hasFilters={Boolean(filters.searchQuery) || filters.type !== 'all' || filters.status !== 'all'}
              clearFilters={() => setFilters({ type: 'all', status: 'all', searchQuery: '', sortBy: 'created_at', sortOrder: 'desc' })}
            />
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredNotifications.map(notification => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDelete}
                  getIcon={getNotificationIcon}
                  getLink={getNotificationLink}
                  formatDate={formatDate}
                />
              ))}
            </div>
          )}
        </div>

        {/* Load More Button */}
        {hasMoreNotifications && (
          <div className="text-center">
            <Button 
              variant="outline" 
              size="lg"
              onClick={loadMoreNotifications}
              disabled={loadingMore}
              className="px-8 py-4"
            >
              {loadingMore ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Load More Notifications
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </Layout>
  )
}

/* Enhanced Helper Components */
interface MetricCardProps {
  label: string
  value: string | number
  icon: React.ComponentType<any>
  color: string
  bgColor: string
  borderColor: string
  highlight?: boolean
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  label, 
  value, 
  icon: Icon, 
  color, 
  bgColor, 
  borderColor, 
  highlight 
}) => (
  <div className={`${bgColor} rounded-xl border ${borderColor} p-4 text-center transition-all duration-300 hover:shadow-lg ${highlight ? 'ring-2 ring-blue-200 shadow-lg' : ''}`}>
    <div className="flex items-center justify-center mb-2">
      <div className={`p-2 rounded-lg ${highlight ? 'bg-white' : 'bg-white/50'}`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
    </div>
    <div className={`text-2xl font-bold ${color} mb-1`}>{value}</div>
    <div className="text-sm text-gray-600 font-medium">{label}</div>
    {highlight && (
      <div className="mt-2">
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
          <Circle className="w-2 h-2 fill-current" />
          Needs Attention
        </span>
      </div>
    )}
  </div>
)

interface FilterChipProps {
  label: string
  active: boolean
  onClick: () => void
  color: 'blue' | 'green' | 'red' | 'purple'
}

const FilterChip: React.FC<FilterChipProps> = ({ label, active, onClick, color }) => {
  const colorClasses = {
    blue: active ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-gray-100 text-gray-600 hover:bg-blue-50',
    green: active ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-600 hover:bg-green-50',
    red: active ? 'bg-red-100 text-red-800 border-red-200' : 'bg-gray-100 text-gray-600 hover:bg-red-50',
    purple: active ? 'bg-purple-100 text-purple-800 border-purple-200' : 'bg-gray-100 text-gray-600 hover:bg-purple-50'
  }

  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${colorClasses[color]}`}
    >
      {label}
    </button>
  )
}

interface EmptyStateProps {
  hasFilters: boolean
  clearFilters: () => void
}

const EmptyState: React.FC<EmptyStateProps> = ({ hasFilters, clearFilters }) => (
  <div className="p-12 text-center">
    <div className="relative mb-8">
      <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-3xl mx-auto flex items-center justify-center">
        <Bell className="w-12 h-12 text-gray-400" />
      </div>
      {!hasFilters && (
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-5 h-5 text-green-600" />
        </div>
      )}
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-3">
      {hasFilters ? 'No notifications match your filters' : 'All caught up!'}
    </h3>
    <p className="text-gray-500 mb-6 leading-relaxed max-w-md mx-auto">
      {hasFilters 
        ? 'Try adjusting your search criteria or filters to find what you\'re looking for.' 
        : 'You have no notifications right now. We\'ll notify you when something important happens.'
      }
    </p>
    {hasFilters && (
      <Button variant="outline" onClick={clearFilters} className="px-6 py-3">
        <Archive className="w-4 h-4 mr-2" />
        Clear All Filters
      </Button>
    )}
  </div>
)

interface NotificationCardProps {
  notification: NotificationType
  onMarkAsRead: (id: string) => void
  onDelete: (id: string) => void
  getIcon: (type: string) => React.ReactNode
  getLink: (n: NotificationType) => string
  formatDate: (iso: string) => string
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
  getIcon,
  getLink,
  formatDate
}) => {
  const getNotificationTheme = () => {
    if (!notification.read) {
      switch (notification.type) {
        case 'moderation': return 'bg-red-50 border-red-200 hover:border-red-300'
        case 'application': return 'bg-blue-50 border-blue-200 hover:border-blue-300'
        case 'project': return 'bg-green-50 border-green-200 hover:border-green-300'
        case 'team': return 'bg-purple-50 border-purple-200 hover:border-purple-300'
        case 'achievement': return 'bg-yellow-50 border-yellow-200 hover:border-yellow-300'
        case 'chat': return 'bg-indigo-50 border-indigo-200 hover:border-indigo-300'
        default: return 'bg-gray-50 border-gray-200 hover:border-gray-300'
      }
    }
    return 'bg-white border-gray-200 hover:border-gray-300'
  }

  return (
    <div className={`relative group p-6 transition-all duration-300 hover:shadow-md ${getNotificationTheme()}`}>
    <div className="flex items-start gap-4">
        {/* Enhanced Icon */}
        <div className={`flex-shrink-0 p-3 rounded-xl shadow-sm ${!notification.read ? 'bg-white' : 'bg-gray-50'}`}>
          {getIcon(notification.type)}
        </div>
        
      <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className={`text-base font-semibold text-gray-900 ${!notification.read ? 'font-bold' : ''}`}>
                  {notification.title}
                </h3>
                {!notification.read && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                )}
              </div>
              <p className="text-gray-600 leading-relaxed mb-4">{notification.message}</p>
              
              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(notification.created_at)}
                  </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 capitalize">
                    {notification.type.replace('_', ' ')}
              </span>
              {!notification.read && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                      <Zap className="w-3 h-3" />
                  Unread
                </span>
              )}
            </div>
          </div>
        </div>
          </div>
          
          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3">
          <Link
            to={getLink(notification)}
            onClick={() => !notification.read && onMarkAsRead(notification.id)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors duration-200"
          >
              <ExternalLink className="w-4 h-4" />
              View Details
          </Link>
          {!notification.read && (
            <button
              onClick={() => onMarkAsRead(notification.id)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-800 rounded-lg transition-colors duration-200 border border-gray-200"
            >
                <Eye className="w-4 h-4" />
                Mark as read
            </button>
          )}
          <button
            onClick={() => onDelete(notification.id)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
          >
              <Trash2 className="w-4 h-4" />
              Delete
          </button>
        </div>
      </div>
    </div>
  </div>
) 
} 