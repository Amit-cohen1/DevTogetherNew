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
import type { Notification } from '../services/notificationService'
import { useAuth } from '../contexts/AuthContext';

interface FilterOptions {
    type: string
    status: string
    searchQuery: string
}

interface NotificationStats {
<<<<<<< Updated upstream
    total: number;
    unread: number;
    application: number;
    project: number;
    team: number;
    achievement: number;
    system: number;
    moderation: number;
    chat: number;
    status_change: number;
=======
    total: number
    unread: number
    application: number
    project: number
    team: number
    achievement: number
    system: number
    moderation: number;
>>>>>>> Stashed changes
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

    const { profile } = useAuth();

    // State
    const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([])
    const [stats, setStats] = useState<NotificationStats>({
        total: 0,
        unread: 0,
        application: 0,
        project: 0,
        team: 0,
        achievement: 0,
        system: 0,
        moderation: 0,
<<<<<<< Updated upstream
        chat: 0,
        status_change: 0
=======
>>>>>>> Stashed changes
    })

    // Filter state
    const [filters, setFilters] = useState<FilterOptions>({
        type: 'all',
        status: 'all',
        searchQuery: ''
    })

    // Calculate stats
    useEffect(() => {
        const newStats = {
            total: notifications.length,
            unread: notifications.filter(n => !n.read).length,
            application: notifications.filter(n => n.type === 'application').length,
            project: notifications.filter(n => n.type === 'project').length,
            team: notifications.filter(n => n.type === 'team').length,
            achievement: notifications.filter(n => n.type === 'achievement').length,
            system: notifications.filter(n => n.type === 'system').length,
            moderation: notifications.filter(n => n.type === 'moderation').length,
<<<<<<< Updated upstream
            chat: notifications.filter(n => n.type === 'chat').length,
            status_change: notifications.filter(n => n.type === 'status_change').length
        };
        setStats(newStats);
    }, [notifications]);
=======
        }
        setStats(newStats)
    }, [notifications])
>>>>>>> Stashed changes

    // Apply filters
    useEffect(() => {
        applyFilters()
    }, [notifications, filters])

    // Filter out moderation notifications for non-admins
    useEffect(() => {
        let filtered = [...notifications];
        if (!profile?.is_admin && !profile?.role?.includes('admin')) {
            filtered = filtered.filter(n => n.type !== 'moderation');
        }
        setFilteredNotifications(filtered);
    }, [notifications, filters, profile]);

    const applyFilters = () => {
        let filtered = [...notifications]

        // Apply type filter
        if (filters.type !== 'all') {
            filtered = filtered.filter(notification => notification.type === filters.type)
        }

        // Apply status filter
        if (filters.status !== 'all') {
            if (filters.status === 'read') {
                filtered = filtered.filter(notification => notification.read)
            } else if (filters.status === 'unread') {
                filtered = filtered.filter(notification => !notification.read)
            }
        }

        // Apply search filter
        if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase()
            filtered = filtered.filter(notification =>
                notification.title.toLowerCase().includes(query) ||
                notification.message.toLowerCase().includes(query)
            )
        }

        // Sort by created date (newest first)
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

        setFilteredNotifications(filtered)
    }

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'application':
                return <Briefcase className="w-5 h-5 text-blue-600" />;
            case 'project':
                return <AlertCircle className="w-5 h-5 text-green-600" />;
            case 'team':
                return <Users className="w-5 h-5 text-purple-600" />;
            case 'achievement':
                return <Trophy className="w-5 h-5 text-yellow-600" />;
            case 'system':
<<<<<<< Updated upstream
                return <AlertCircle className="w-5 h-5 text-gray-600" />;
            case 'moderation':
                return <Shield className="w-5 h-5 text-red-600" />;
            case 'chat':
                return <MessageCircle className="w-5 h-5 text-indigo-600" />;
            case 'status_change':
                return <Activity className="w-5 h-5 text-orange-600" />;
=======
                return <AlertCircle className="w-5 h-5 text-gray-600" />
            case 'moderation':
                return <Bell className="w-5 h-5 text-pink-600" />
>>>>>>> Stashed changes
            default:
                return <Bell className="w-5 h-5 text-gray-600" />;
        }
    };

    const getNotificationLink = (notification: Notification): string => {
        const data = notification.data || {}

        switch (notification.type) {
            case 'moderation':
                return data.actionUrl || '/admin';
            case 'application':
                if (data.projectId) {
                    return `/projects/${data.projectId}`
                }
                return '/my-applications'
            case 'project':
                if (data.projectId) {
                    return `/workspace/${data.projectId}`
                }
                return '/dashboard'
            case 'team':
                if (data.projectId) {
                    return `/workspace/${data.projectId}`
                }
                return '/dashboard'
            case 'achievement':
                return '/profile'
            default:
                return '/dashboard'
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

        if (diffInMinutes < 1) return 'Just now'
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`

        const diffInHours = Math.floor(diffInMinutes / 60)
        if (diffInHours < 24) return `${diffInHours}h ago`

        const diffInDays = Math.floor(diffInHours / 24)
        if (diffInDays < 7) return `${diffInDays}d ago`

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    const handleMarkAsRead = async (notificationId: string) => {
        await markAsRead(notificationId)
    }

    const handleDelete = async (notificationId: string) => {
        await deleteNotification(notificationId)
    }

    const handleRefresh = () => {
        loadNotifications()
    }

    if (loading) {
        return (
            <Layout>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
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
                            <p className="text-gray-600 mt-2">
                                Stay updated with your projects and applications
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleRefresh}
                                icon={<RefreshCw className="w-4 h-4" />}
                            >
                                Refresh
                            </Button>
                            {unreadCount > 0 && (
                                <Button
                                    size="sm"
                                    onClick={markAllAsRead}
                                    icon={<CheckCircle className="w-4 h-4" />}
                                >
                                    Mark all read
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-10 gap-4 mb-8">
                    <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                        <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                        <div className="text-sm text-gray-600">Total</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">{stats.unread}</div>
                        <div className="text-sm text-blue-600">Unread</div>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">{stats.application}</div>
                        <div className="text-sm text-gray-600">Applications</div>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">{stats.project}</div>
                        <div className="text-sm text-gray-600">Projects</div>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600">{stats.team}</div>
                        <div className="text-sm text-gray-600">Team</div>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                        <div className="text-2xl font-bold text-yellow-600">{stats.achievement}</div>
                        <div className="text-sm text-gray-600">Achievements</div>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                        <div className="text-2xl font-bold text-gray-600">{stats.system}</div>
                        <div className="text-sm text-gray-600">System</div>
                    </div>
<<<<<<< Updated upstream
                    <div className="bg-white rounded-lg border border-red-200 p-4 text-center">
                        <div className="text-2xl font-bold text-red-600">{stats.moderation}</div>
                        <div className="text-sm text-red-600">Admin</div>
                    </div>
                    <div className="bg-white rounded-lg border border-indigo-200 p-4 text-center">
                        <div className="text-2xl font-bold text-indigo-600">{stats.chat}</div>
                        <div className="text-sm text-indigo-600">Chat</div>
                    </div>
                    <div className="bg-white rounded-lg border border-orange-200 p-4 text-center">
                        <div className="text-2xl font-bold text-orange-600">{stats.status_change}</div>
                        <div className="text-sm text-orange-600">Status Change</div>
=======
                    <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                        <div className="text-2xl font-bold text-pink-600">{stats.moderation}</div>
                        <div className="text-sm text-pink-600">Moderation</div>
>>>>>>> Stashed changes
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search */}
                        <FormField label="">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search notifications..."
                                    value={filters.searchQuery}
                                    onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </FormField>

                        {/* Type Filter */}
                        <Select
                            value={filters.type}
                            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                        >
                            <option value="all">All Types</option>
                            <option value="application">Applications</option>
                            <option value="project">Projects</option>
                            <option value="team">Team</option>
                            <option value="achievement">Achievements</option>
                            <option value="system">System</option>
<<<<<<< Updated upstream
                            <option value="moderation">Admin</option>
                            <option value="chat">Chat</option>
                            <option value="status_change">Status Change</option>
=======
                            <option value="moderation">Moderation</option>
>>>>>>> Stashed changes
                        </Select>

                        {/* Status Filter */}
                        <Select
                            value={filters.status}
                            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                        >
                            <option value="all">All Status</option>
                            <option value="unread">Unread</option>
                            <option value="read">Read</option>
                        </Select>
                    </div>
                </div>

                {/* Notifications List */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden min-h-[600px] flex flex-col">
                    {filteredNotifications.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center p-12">
                            <div className="text-center">
                                <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    {filters.searchQuery || filters.type !== 'all' || filters.status !== 'all'
                                        ? 'No notifications match your filters'
                                        : 'No notifications yet'
                                    }
                                </h3>
                                <p className="text-gray-500 mb-6">
                                    {filters.searchQuery || filters.type !== 'all' || filters.status !== 'all'
                                        ? 'Try adjusting your search criteria or filters.'
                                        : "You're all caught up! We'll notify you when something new happens."
                                    }
                                </p>
                                {(filters.searchQuery || filters.type !== 'all' || filters.status !== 'all') && (
                                    <Button
                                        variant="outline"
                                        onClick={() => setFilters({ type: 'all', status: 'all', searchQuery: '' })}
                                    >
                                        Clear filters
                                    </Button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 space-y-4 p-4">
                            {filteredNotifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`relative group p-6 rounded-lg border-2 shadow-sm hover:shadow-md transition-all duration-200 ${
                                        !notification.read 
                                            ? 'bg-blue-50 border-blue-200 hover:border-blue-300' 
                                            : 'bg-white border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Icon */}
                                        <div className="flex-shrink-0 mt-1">
                                            {getNotificationIcon(notification.type)}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h3 className={`text-sm font-medium text-gray-900 ${
                                                        !notification.read ? 'font-semibold' : ''
                                                    }`}>
                                                        {notification.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 mt-1 pr-8">
                                                        {notification.message}
                                                    </p>
                                                    <div className="flex items-center gap-4 mt-3">
                                                        <span className="text-xs text-gray-500">
                                                            {formatDate(notification.created_at)}
                                                        </span>
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 capitalize">
                                                            {notification.type}
                                                        </span>
                                                        {!notification.read && (
                                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                                                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-1"></div>
                                                                Unread
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2 mt-4">
                                                <Link
                                                    to={getNotificationLink(notification)}
                                                    onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                                                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                                                >
                                                    <ExternalLink className="w-3 h-3" />
                                                    View Details
                                                </Link>
                                                {!notification.read && (
                                                    <button
                                                        onClick={() => handleMarkAsRead(notification.id)}
                                                        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-700"
                                                    >
                                                        <Eye className="w-3 h-3" />
                                                        Mark as read
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(notification.id)}
                                                    className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Load More - Future Enhancement */}
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