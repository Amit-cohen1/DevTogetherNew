import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Layout } from '../components/layout'
import { useNotifications } from '../contexts/NotificationContext'
import { Button } from '../components/ui/Button'
import { FormField } from '../components/ui/FormField'
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
  Activity
} from 'lucide-react'
import type { Notification as NotificationType } from '../services/notificationService'
import { useAuth } from '../contexts/AuthContext'

interface FilterOptions {
  type: string
  status: string
  searchQuery: string
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
}

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

  const { profile } = useAuth()

  const [filteredNotifications, setFilteredNotifications] = useState<NotificationType[]>([])
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    unread: 0,
    application: 0,
    project: 0,
    team: 0,
    achievement: 0,
    system: 0,
    moderation: 0,
    chat: 0,
    status_change: 0
  })

  const [filters, setFilters] = useState<FilterOptions>({
    type: 'all',
    status: 'all',
    searchQuery: ''
  })

  // Update stats whenever notifications change
  useEffect(() => {
    const newStats: NotificationStats = {
      total: notifications.length,
      unread: notifications.filter(n => !n.read).length,
      application: notifications.filter(n => n.type === 'application').length,
      project: notifications.filter(n => n.type === 'project').length,
      team: notifications.filter(n => n.type === 'team').length,
      achievement: notifications.filter(n => n.type === 'achievement').length,
      system: notifications.filter(n => n.type === 'system').length,
      moderation: notifications.filter(n => n.type === 'moderation').length,
      chat: notifications.filter(n => n.type === 'chat').length,
      status_change: notifications.filter(n => n.type === 'status_change').length
    }
    setStats(newStats)
  }, [notifications])

  // Apply filters whenever notifications or filter state change
  useEffect(() => {
    let filtered = [...notifications]

    // Hide moderation notifications for non-admins
    if (!profile?.is_admin && profile?.role !== 'admin') {
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

    // Newest first
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    setFilteredNotifications(filtered)
  }, [notifications, filters, profile])

  /* Utility Helpers */
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'application':
        return <Briefcase className="w-5 h-5 text-blue-600" />
      case 'project':
        return <AlertCircle className="w-5 h-5 text-green-600" />
      case 'team':
        return <Users className="w-5 h-5 text-purple-600" />
      case 'achievement':
        return <Trophy className="w-5 h-5 text-yellow-600" />
      case 'system':
        return <AlertCircle className="w-5 h-5 text-gray-600" />
      case 'moderation':
        return <Shield className="w-5 h-5 text-red-600" />
      case 'chat':
        return <MessageCircle className="w-5 h-5 text-indigo-600" />
      case 'status_change':
        return <Activity className="w-5 h-5 text-orange-600" />
      default:
        return <Bell className="w-5 h-5 text-gray-600" />
    }
  }

  const getNotificationLink = (n: NotificationType) => {
    const data = n.data || {}
    switch (n.type) {
      case 'moderation':
        return data.actionUrl || '/admin'
      case 'application':
        return data.projectId ? `/projects/${data.projectId}` : '/my-applications'
      case 'project':
      case 'team':
        return data.projectId ? `/workspace/${data.projectId}` : '/dashboard'
      case 'achievement':
        return '/profile'
      default:
        return '/dashboard'
    }
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8" />
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600 mt-2">Stay updated with your projects and applications</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={handleRefresh} icon={<RefreshCw className="w-4 h-4" />}>
                Refresh
              </Button>
              {unreadCount > 0 && (
                <Button size="sm" onClick={markAllAsRead} icon={<CheckCircle className="w-4 h-4" />}>
                  Mark all read
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-10 gap-4 mb-8">
          <StatCard label="Total" value={stats.total} color="text-gray-900" />
          <StatCard label="Unread" value={stats.unread} color="text-blue-600" bg="bg-blue-50" border="border-blue-200" />
          <StatCard label="Applications" value={stats.application} color="text-blue-600" />
          <StatCard label="Projects" value={stats.project} color="text-green-600" />
          <StatCard label="Team" value={stats.team} color="text-purple-600" />
          <StatCard label="Achievements" value={stats.achievement} color="text-yellow-600" />
          <StatCard label="System" value={stats.system} color="text-gray-600" />
          <StatCard label="Admin" value={stats.moderation} color="text-red-600" border="border-red-200" />
          <StatCard label="Chat" value={stats.chat} color="text-indigo-600" border="border-indigo-200" />
          <StatCard label="Status Change" value={stats.status_change} color="text-orange-600" border="border-orange-200" />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <FormField label="">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={filters.searchQuery}
                  onChange={e => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </FormField>

            {/* Type filter */}
            <Select value={filters.type} onChange={e => setFilters(prev => ({ ...prev, type: e.target.value }))}>
              <option value="all">All Types</option>
              <option value="application">Applications</option>
              <option value="project">Projects</option>
              <option value="team">Team</option>
              <option value="achievement">Achievements</option>
              <option value="system">System</option>
              <option value="moderation">Admin</option>
              <option value="chat">Chat</option>
              <option value="status_change">Status Change</option>
            </Select>

            {/* Status filter */}
            <Select value={filters.status} onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))}>
              <option value="all">All Status</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </Select>
          </div>
        </div>

        {/* Notifications list */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden min-h-[600px] flex flex-col">
          {filteredNotifications.length === 0 ? (
            <EmptyState
              hasFilters={Boolean(filters.searchQuery) || filters.type !== 'all' || filters.status !== 'all'}
              clearFilters={() => setFilters({ type: 'all', status: 'all', searchQuery: '' })}
            />
          ) : (
            <div className="flex-1 space-y-4 p-4">
              {filteredNotifications.map(n => (
                <NotificationCard
                  key={n.id}
                  notification={n}
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

        {filteredNotifications.length >= 20 && (
          <div className="mt-6 text-center">
            <Button variant="outline" size="lg">
              Load More Notifications
            </Button>
          </div>
        )}
      </div>
    </Layout>
  )
}

/* Helper components */
interface StatCardProps {
  label: string
  value: number
  color: string
  bg?: string
  border?: string
}
const StatCard: React.FC<StatCardProps> = ({ label, value, color, bg = 'bg-white', border = 'border-gray-200' }) => (
  <div className={`${bg} rounded-lg border ${border} p-4 text-center`}>
    <div className={`text-2xl font-bold ${color}`}>{value}</div>
    <div className="text-sm text-gray-600">{label}</div>
  </div>
)

interface EmptyStateProps {
  hasFilters: boolean
  clearFilters: () => void
}
const EmptyState: React.FC<EmptyStateProps> = ({ hasFilters, clearFilters }) => (
  <div className="flex-1 flex items-center justify-center p-12">
    <div className="text-center">
      <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {hasFilters ? 'No notifications match your filters' : 'No notifications yet'}
      </h3>
      <p className="text-gray-500 mb-6">
        {hasFilters ? 'Try adjusting your search criteria or filters.' : "You're all caught up! We'll notify you when something new happens."}
      </p>
      {hasFilters && (
        <Button variant="outline" onClick={clearFilters}>
          Clear filters
        </Button>
      )}
    </div>
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
}) => (
  <div
    className={`relative group p-6 rounded-lg border-2 shadow-sm hover:shadow-md transition-all duration-200 ${
      !notification.read ? 'bg-blue-50 border-blue-200 hover:border-blue-300' : 'bg-white border-gray-200 hover:border-gray-300'
    }`}
  >
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 mt-1">{getIcon(notification.type)}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className={`text-sm font-medium text-gray-900 ${!notification.read ? 'font-semibold' : ''}`}>{
              notification.title
            }</h3>
            <p className="text-sm text-gray-600 mt-1 pr-8">{notification.message}</p>
            <div className="flex items-center gap-4 mt-3">
              <span className="text-xs text-gray-500">{formatDate(notification.created_at)}</span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 capitalize">
                {notification.type}
              </span>
              {!notification.read && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-1" />
                  Unread
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <Link
            to={getLink(notification)}
            onClick={() => !notification.read && onMarkAsRead(notification.id)}
            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            <ExternalLink className="w-3 h-3" />
            View Details
          </Link>
          {!notification.read && (
            <button
              onClick={() => onMarkAsRead(notification.id)}
              className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-700"
            >
              <Eye className="w-3 h-3" />
              Mark as read
            </button>
          )}
          <button
            onClick={() => onDelete(notification.id)}
            className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-3 h-3" />
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
) 