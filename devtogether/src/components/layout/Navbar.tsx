import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useNotifications } from '../../contexts/NotificationContext'
import { Button } from '../ui/Button'
import { NotificationDropdown } from '../notifications/NotificationDropdown'
import {
    Menu,
    X,
    User,
    Settings,
    LogOut,
    Building,
    Users,
    Search,
    Bell,
    ChevronDown,
    Home,
    Plus,
    Shield,
    Star,
    Activity,
    Zap,
    Crown
} from 'lucide-react'
import type { Profile } from '../../types/database';

export const Navbar: React.FC = () => {
    const { user, profile, signOut, isDeveloper, isOrganization, isAdmin } = useAuth()
    const { unreadCount } = useNotifications()
    const navigate = useNavigate()
    const location = useLocation()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [userMenuOpen, setUserMenuOpen] = useState(false)
    const [notificationMenuOpen, setNotificationMenuOpen] = useState(false)
    const userMenuRef = useRef<HTMLDivElement>(null)
    const notificationMenuRef = useRef<HTMLDivElement>(null)

    // Close user menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setUserMenuOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Close mobile menu when route changes
    useEffect(() => {
        setMobileMenuOpen(false)
    }, [location.pathname])

    const handleSignOut = async () => {
        setUserMenuOpen(false)
        await signOut()
        navigate('/')
    }

    const displayName = profile && ['developer', 'admin'].includes(profile.role as unknown as string)
        ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
        : profile?.organization_name

    const isActive = (path: string) => {
        return location.pathname === path || location.pathname.startsWith(path + '/')
    }

    // Enhanced navigation structure for developers
    const developerNavItems = [
        {
            label: 'Discover',
            path: '/projects',
            icon: Search,
            description: 'Find projects'
        },
        {
            label: 'Applications',
            path: '/my-applications',
            icon: User,
            description: 'Track submissions'
        },
        {
            label: 'My Projects',
            path: '/my-projects',
            icon: Building,
            description: 'View portfolio'
        }
    ]

    // Enhanced navigation structure for organizations  
    const organizationNavItems = [
        {
            label: 'Discover',
            path: '/projects',
            icon: Search,
            description: 'Browse platform'
        },
        {
            label: 'My Projects',
            path: '/dashboard/projects',
            icon: Building,
            description: 'Manage projects'
        },
        {
            label: 'Applications',
            path: '/applications',
            icon: Users,
            description: 'Review candidates'
        }
    ]

    const navItems = isDeveloper ? developerNavItems : organizationNavItems

    // Hide org-only features for rejected/blocked orgs
    const orgProfile = profile as Profile | null;
    const isOrgRejectedOrBlocked = orgProfile?.role === 'organization' && (orgProfile.organization_status === 'rejected' || orgProfile.organization_status === 'blocked');

    // Get role-based gradient classes
    const getRoleGradient = () => {
        if (isAdmin) return 'from-purple-600 via-pink-600 to-indigo-600'
        if (isOrganization) return 'from-purple-600 via-blue-600 to-indigo-600'
        if (isDeveloper) return 'from-blue-600 via-indigo-600 to-purple-600'
        return 'from-gray-600 via-gray-700 to-gray-800'
    }

    const getRoleBadge = () => {
        if (isAdmin) return { icon: Crown, label: 'Admin', color: 'text-yellow-400' }
        if (isOrganization) return { icon: Building, label: 'Organization', color: 'text-purple-400' }
        if (isDeveloper) return { icon: Star, label: 'Developer', color: 'text-blue-400' }
        return { icon: User, label: 'Guest', color: 'text-gray-400' }
    }

    // Public navbar for non-authenticated users
    if (!user || !profile) {
        return (
            <nav className="bg-white border-b border-gray-200 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        {/* Enhanced Logo */}
                        <div className="flex items-center">
                            <Link to="/" className="flex items-center space-x-3 group">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
                                    <img
                                        src="/images/devtogether-icon.svg"
                                        alt="DevTogether"
                                        className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl"
                                    />
                                </div>
                                <div>
                                    <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                        DevTogether
                                    </span>
                                    <div className="hidden sm:block text-xs text-gray-500 font-medium">
                                        Build. Connect. Grow.
                                    </div>
                                </div>
                            </Link>
                        </div>

                        {/* Center - Enhanced Navigation Links */}
                        <div className="hidden lg:flex items-center space-x-6">
                            <Link 
                                to="/projects" 
                                className="relative px-4 py-2 rounded-xl text-gray-700 hover:text-blue-600 font-medium transition-all duration-300 group"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    <Search className="w-4 h-4" />
                                    Projects
                                </span>
                                <div className="absolute inset-0 bg-blue-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </Link>
                            <Link 
                                to="/organizations" 
                                className="relative px-4 py-2 rounded-xl text-gray-700 hover:text-purple-600 font-medium transition-all duration-300 group"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    <Building className="w-4 h-4" />
                                    Organizations
                                </span>
                                <div className="absolute inset-0 bg-purple-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </Link>
                        </div>

                        {/* Enhanced Auth buttons */}
                        <div className="flex items-center space-x-3">
                            <Link to="/auth/login" className="hidden sm:block">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="px-6 py-3 text-sm h-12 border-gray-300 hover:border-blue-400 hover:text-blue-600 transition-all duration-300"
                                >
                                    Sign In
                                </Button>
                            </Link>
                            <Link to="/auth/register">
                                <Button 
                                    size="sm" 
                                    className="px-6 py-3 text-sm h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                    Join Now
                                </Button>
                            </Link>
                            
                            {/* Enhanced Mobile menu button */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="lg:hidden p-3 h-12 w-12 text-gray-600 hover:text-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-300"
                            >
                                {mobileMenuOpen ? (
                                    <X className="w-6 h-6" />
                                ) : (
                                    <Menu className="w-6 h-6" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Enhanced Mobile Navigation Menu */}
                {mobileMenuOpen && (
                                         <div className="lg:hidden border-t border-gray-200 bg-white shadow-xl">
                        <div className="px-4 py-6 space-y-4">
                            {/* Navigation Links with enhanced design */}
                            <div className="space-y-3">
                                <Link
                                    to="/projects"
                                    className="flex items-center gap-4 px-4 py-4 rounded-xl text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300 border border-gray-200 hover:border-blue-200"
                                >
                                    <div className="p-2 bg-blue-50 rounded-lg">
                                        <Search className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <div>Projects</div>
                                        <div className="text-xs text-gray-500">Discover opportunities</div>
                                    </div>
                                </Link>
                                <Link
                                    to="/organizations"
                                    className="flex items-center gap-4 px-4 py-4 rounded-xl text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50 transition-all duration-300 border border-gray-200 hover:border-purple-200"
                                >
                                    <div className="p-2 bg-purple-50 rounded-lg">
                                        <Building className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <div>Organizations</div>
                                        <div className="text-xs text-gray-500">Explore companies</div>
                                    </div>
                                </Link>
                            </div>

                            {/* Mobile Auth Actions */}
                            <div className="pt-4 border-t border-gray-200">
                                <div className="grid grid-cols-1 gap-3">
                                    <Link to="/auth/login">
                                        <Button 
                                            variant="outline" 
                                            className="w-full h-12 justify-center text-base font-medium border-gray-300 hover:border-blue-400 hover:text-blue-600"
                                        >
                                            Sign In
                                        </Button>
                                    </Link>
                                    <Link to="/auth/register">
                                        <Button 
                                            className="w-full h-12 justify-center text-base font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                                        >
                                            Join Now
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </nav>
        )
    }

    const roleBadge = getRoleBadge()

    return (
        <nav className="bg-white border-b border-gray-200 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Enhanced Logo and Navigation */}
                    <div className="flex items-center space-x-8">
                        {/* Enhanced Logo */}
                        <Link to="/" className="flex items-center space-x-3 group">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
                                <img
                                    src="/images/devtogether-icon.svg"
                                    alt="DevTogether"
                                    className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl"
                                />
                            </div>
                            <div>
                                <span className="text-xl sm:text-2xl font-bold text-gray-900">
                                    DevTogether
                                </span>
                                <div className="hidden sm:block text-xs text-gray-500 font-medium">
                                    Build. Connect. Grow.
                                </div>
                            </div>
                        </Link>

                        {/* Enhanced Desktop Navigation */}
                        <div className="hidden lg:flex items-center space-x-2">
                            {/* Dashboard Link */}
                            <Link
                                to="/dashboard"
                                className={`relative px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 group ${
                                    isActive('/dashboard')
                                        ? 'text-blue-600 bg-blue-50 shadow-sm border border-blue-200'
                                        : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200'
                                }`}
                            >
                                <Home className="w-4 h-4" />
                                <span>Dashboard</span>
                            </Link>

                            {/* Navigation Items */}
                            {navItems.map((item) => {
                                const IconComponent = item.icon
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`relative px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 group ${
                                            isActive(item.path)
                                                ? 'text-blue-600 bg-blue-50 shadow-sm border border-blue-200'
                                                : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200'
                                        }`}
                                    >
                                        <IconComponent className="w-4 h-4" />
                                        <span>{item.label}</span>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>

                    {/* Enhanced Right side - Actions and Menus */}
                    <div className="flex items-center space-x-3">
                        {/* Enhanced Create Project Button for Organizations */}
                        {isOrganization && orgProfile?.organization_status === 'approved' && (
                            <Link to="/projects/create" className="hidden sm:block">
                                <Button 
                                    size="sm" 
                                    className="flex items-center gap-2 px-4 py-3 h-12 bg-blue-600 text-white hover:bg-blue-700 border border-blue-600 hover:border-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Create Project</span>
                                </Button>
                            </Link>
                        )}

                        {/* Mobile Create Project Button - Enhanced */}
                        {isOrganization && orgProfile?.organization_status === 'approved' && (
                            <Link to="/projects/create" className="sm:hidden">
                                <Button 
                                    size="sm" 
                                    className="p-3 h-12 w-12 flex items-center justify-center bg-blue-600 text-white hover:bg-blue-700 border border-blue-600 hover:border-blue-700 transition-all duration-300 shadow-lg rounded-xl"
                                >
                                    <Plus className="w-5 h-5" />
                                </Button>
                            </Link>
                        )}

                        {/* Enhanced Notifications */}
                        <div className="relative" ref={notificationMenuRef}>
                            <button
                                onClick={() => setNotificationMenuOpen(!notificationMenuOpen)}
                                className="relative p-3 h-12 w-12 text-gray-600 hover:text-blue-600 rounded-xl flex items-center justify-center transition-all duration-300 hover:bg-blue-50 border border-gray-200 hover:border-blue-200"
                            >
                                <Bell className="w-5 h-5" />
                                {/* Enhanced Notification badge */}
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg border-2 border-white">
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            <NotificationDropdown
                                isOpen={notificationMenuOpen}
                                onClose={() => setNotificationMenuOpen(false)}
                            />
                        </div>

                        {/* Enhanced User Menu */}
                        <div className="relative" ref={userMenuRef}>
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="flex items-center space-x-3 p-3 h-12 rounded-xl hover:bg-gray-50 transition-all duration-300 border border-gray-200 hover:border-gray-300 group"
                            >
                                {/* Enhanced Avatar */}
                                <div className="relative">
                                    <div className="w-8 h-8 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 ring-2 ring-gray-200 group-hover:ring-gray-300 transition-all duration-300">
                                        {profile.avatar_url ? (
                                            <img
                                                src={profile.avatar_url}
                                                alt={displayName || 'Profile'}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-100 flex items-center justify-center">
                                                {['developer','admin'].includes(profile.role as unknown as string) ? (
                                                    <User className="w-4 h-4 text-gray-500" />
                                                ) : (
                                                    <Building className="w-4 h-4 text-gray-500" />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    {/* Role indicator */}
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center ring-2 ring-gray-200">
                                        <roleBadge.icon className={`w-2.5 h-2.5 ${roleBadge.color.replace('text-', 'text-gray-')}`} />
                                    </div>
                                </div>

                                {/* Enhanced User Info */}
                                <div className="hidden sm:block text-left min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-semibold text-gray-900 truncate">
                                            {displayName || 'User'}
                                        </p>
                                        <span className={`text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 font-medium`}>
                                            {roleBadge.label}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 capitalize truncate">{profile.email}</p>
                                </div>

                                <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0 group-hover:text-gray-700 transition-colors" />
                            </button>

                            {/* Enhanced User Dropdown Menu */}
                            {userMenuOpen && (
                                <div className="absolute right-0 mt-3 w-72 bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200/50 py-2 z-50">
                                    {/* User Info Header */}
                                    <div className="px-5 py-4 border-b border-gray-200/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 ring-2 ring-gray-200">
                                                {profile.avatar_url ? (
                                                    <img
                                                        src={profile.avatar_url}
                                                        alt={displayName || 'Profile'}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-100 flex items-center justify-center">
                                                        {['developer','admin'].includes(profile.role as unknown as string) ? (
                                                            <User className="w-5 h-5 text-gray-500" />
                                                        ) : (
                                                            <Building className="w-5 h-5 text-gray-500" />
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 truncate">
                                                    {displayName || 'User'}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-xs text-gray-500 truncate">{profile.email}</p>
                                                    <span className={`text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 font-medium flex items-center gap-1`}>
                                                        <roleBadge.icon className="w-3 h-3" />
                                                        {roleBadge.label}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Menu Items */}
                                    <div className="p-2">
                                        <Link
                                            to="/profile"
                                            className="flex items-center gap-3 px-3 py-3 text-sm text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200 group"
                                            onClick={() => setUserMenuOpen(false)}
                                        >
                                            <div className="p-2 bg-blue-50 group-hover:bg-blue-100 rounded-lg transition-colors">
                                                <User className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <div className="font-medium">View Profile</div>
                                                <div className="text-xs text-gray-500">Manage your account</div>
                                            </div>
                                        </Link>

                                        {/* Admin link - Enhanced */}
                                        {isAdmin && (
                                            <Link
                                                to="/admin"
                                                className="flex items-center gap-3 px-3 py-3 text-sm text-purple-700 hover:bg-purple-50 rounded-xl transition-all duration-200 group border-t border-gray-100 mt-2 pt-4"
                                                onClick={() => setUserMenuOpen(false)}
                                            >
                                                <div className="p-2 bg-purple-50 group-hover:bg-purple-100 rounded-lg transition-colors">
                                                    <Shield className="w-4 h-4 text-purple-600" />
                                                </div>
                                                <div>
                                                    <div className="font-semibold">Admin Dashboard</div>
                                                    <div className="text-xs text-purple-500">Platform management</div>
                                                </div>
                                            </Link>
                                        )}

                                        <button
                                            onClick={handleSignOut}
                                            className="flex items-center gap-3 px-3 py-3 text-sm text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200 w-full text-left group border-t border-gray-100 mt-2 pt-4"
                                        >
                                            <div className="p-2 bg-red-50 group-hover:bg-red-100 rounded-lg transition-colors">
                                                <LogOut className="w-4 h-4 text-red-600" />
                                            </div>
                                            <div>
                                                <div className="font-medium">Sign Out</div>
                                                <div className="text-xs text-red-500">End your session</div>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Enhanced Mobile menu button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden p-3 h-12 w-12 text-gray-600 hover:text-blue-600 rounded-xl flex items-center justify-center transition-all duration-300 hover:bg-blue-50 border border-gray-200 hover:border-blue-200"
                        >
                            {mobileMenuOpen ? (
                                <X className="w-6 h-6" />
                            ) : (
                                <Menu className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Enhanced Mobile Navigation Menu */}
            {mobileMenuOpen && (
                <div className="lg:hidden border-t border-gray-200 bg-white shadow-2xl">
                    <div className="px-4 py-6 space-y-6">
                        {/* User Info Section */}
                        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-200/50">
                            <div className="relative">
                                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 ring-2 ring-gray-200">
                                    {profile.avatar_url ? (
                                        <img
                                            src={profile.avatar_url}
                                            alt={displayName || 'Profile'}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-100 flex items-center justify-center">
                                            {['developer','admin'].includes(profile.role as unknown as string) ? (
                                                <User className="w-6 h-6 text-gray-500" />
                                            ) : (
                                                <Building className="w-6 h-6 text-gray-500" />
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center ring-2 ring-gray-200">
                                    <roleBadge.icon className={`w-3 h-3 ${roleBadge.color.replace('text-', 'text-gray-')}`} />
                                </div>
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-gray-900">{displayName || 'User'}</p>
                                <div className="flex items-center gap-2">
                                    <p className="text-sm text-gray-500">{profile.email}</p>
                                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">
                                        {roleBadge.label}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Main Navigation Grid - Enhanced */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-gray-900 px-2">Navigation</h3>
                            
                            <Link
                                to="/dashboard"
                                className={`flex items-center gap-4 px-4 py-4 rounded-xl text-base font-medium transition-all duration-300 border ${
                                    isActive('/dashboard')
                                        ? 'text-blue-700 bg-blue-50 border-blue-200 shadow-sm'
                                        : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50 border-gray-200 hover:border-blue-200'
                                }`}
                            >
                                <div className={`p-3 rounded-xl ${isActive('/dashboard') ? 'bg-blue-100' : 'bg-gray-100'}`}>
                                    <Home className={`w-5 h-5 ${isActive('/dashboard') ? 'text-blue-600' : 'text-gray-600'}`} />
                                </div>
                                <div>
                                    <div>Dashboard</div>
                                    <div className="text-xs text-gray-500">Your overview</div>
                                </div>
                            </Link>

                            {navItems.map((item) => {
                                const IconComponent = item.icon
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`flex items-center gap-4 px-4 py-4 rounded-xl text-base font-medium transition-all duration-300 border ${
                                            isActive(item.path)
                                                ? 'text-blue-700 bg-blue-50 border-blue-200 shadow-sm'
                                                : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50 border-gray-200 hover:border-blue-200'
                                        }`}
                                    >
                                        <div className={`p-3 rounded-xl ${isActive(item.path) ? 'bg-blue-100' : 'bg-gray-100'}`}>
                                            <IconComponent className={`w-5 h-5 ${isActive(item.path) ? 'text-blue-600' : 'text-gray-600'}`} />
                                        </div>
                                        <div>
                                            <div>{item.label}</div>
                                            <div className="text-xs text-gray-500">{item.description}</div>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>

                        {/* Create Project Button for Organizations - Enhanced */}
                        {isOrganization && orgProfile?.organization_status === 'approved' && (
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-gray-900 px-2">Quick Actions</h3>
                                <Link to="/projects/create" className="block">
                                    <Button className="w-full h-14 flex items-center justify-center gap-3 text-base font-medium bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg rounded-xl">
                                        <Plus className="w-5 h-5" />
                                        Create Project
                                    </Button>
                                </Link>
                            </div>
                        )}

                        {/* Account Actions - Enhanced */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-gray-900 px-2">Account</h3>
                            <div className="grid grid-cols-1 gap-3">
                                <Link
                                    to="/profile"
                                    className="flex items-center justify-center gap-3 px-4 py-4 bg-gray-50 hover:bg-gray-100 rounded-xl text-sm font-medium text-gray-700 transition-all duration-300 border border-gray-200 hover:border-gray-300"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <User className="w-5 h-5" />
                                    <span>View Profile</span>
                                </Link>
                                
                                <button
                                    onClick={() => {
                                        setMobileMenuOpen(false)
                                        handleSignOut()
                                    }}
                                    className="flex items-center justify-center gap-3 px-4 py-4 bg-red-50 hover:bg-red-100 rounded-xl text-sm font-medium text-red-700 transition-all duration-300 border border-red-200 hover:border-red-300"
                                >
                                    <LogOut className="w-5 h-5" />
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        </div>

                        {/* Admin Link for Mobile - Enhanced */}
                        {isAdmin && (
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-gray-900 px-2">Administration</h3>
                                <Link
                                    to="/admin"
                                    className="flex items-center gap-4 px-4 py-4 rounded-xl text-base font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 transition-all duration-300 border border-purple-200 hover:border-purple-300"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <div className="p-3 bg-purple-100 rounded-xl">
                                        <Shield className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <div>Admin Dashboard</div>
                                        <div className="text-xs text-purple-500">Platform management</div>
                                    </div>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    )
} 