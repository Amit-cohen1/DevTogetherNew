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
    Shield
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

    // Clean navigation structure for developers
    const developerNavItems = [
        {
            label: 'Discover Projects',
            path: '/projects',
            icon: Search,
        },
        {
            label: 'My Applications',
            path: '/my-applications',
            icon: User,
        }
    ]

    // Clean navigation structure for organizations  
    const organizationNavItems = [
        {
            label: 'Discover Projects',
            path: '/projects',
            icon: Search,
        },
        {
            label: 'My Projects',
            path: '/dashboard/projects',
            icon: Building,
        },
        {
            label: 'Applications',
            path: '/applications',
            icon: Users,
        }
    ]

    const navItems = isDeveloper ? developerNavItems : organizationNavItems

    // Hide org-only features for rejected/blocked orgs
    const orgProfile = profile as Profile | null;
    const isOrgRejectedOrBlocked = orgProfile?.role === 'organization' && (orgProfile.organization_status === 'rejected' || orgProfile.organization_status === 'blocked');

    // Public navbar for non-authenticated users
    if (!user || !profile) {
        return (
            <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Left side - Logo */}
                        <div className="flex items-center">
                            <Link to="/" className="flex items-center space-x-2 sm:space-x-3">
                                <img
                                    src="/images/devtogether-icon.svg"
                                    alt="DevTogether"
                                    className="w-8 h-8 sm:w-10 sm:h-10"
                                />
                                <span className="text-lg sm:text-xl font-bold text-gray-900">DevTogether</span>
                            </Link>
                        </div>

                        {/* Center - Navigation Links */}
                        <div className="hidden md:flex space-x-8">
                            <Link to="/projects" className="text-gray-700 hover:text-gray-900 font-medium">
                                Projects
                            </Link>
                            <Link to="/organizations" className="text-gray-700 hover:text-gray-900 font-medium">
                                Organizations
                            </Link>
                        </div>

                        {/* Right side - Auth buttons */}
                        <div className="flex items-center space-x-2 md:space-x-4">
                            <Link to="/auth/login">
                                <Button variant="outline" size="sm" className="px-4 py-2 text-sm h-10 min-w-[90px]">
                                    Sign In
                                </Button>
                            </Link>
                            <Link to="/auth/register">
                                <Button size="sm" className="px-4 py-2 text-sm h-10 min-w-[90px]">
                                    Join Now
                                </Button>
                            </Link>
                            {/* Mobile menu button */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="md:hidden p-2 h-10 w-10 text-gray-400 hover:text-gray-600 rounded-lg flex items-center justify-center border border-gray-300"
                            >
                                {mobileMenuOpen ? (
                                    <X className="w-5 h-5" />
                                ) : (
                                    <Menu className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-gray-200 bg-white shadow-lg">
                        <div className="px-4 py-4 space-y-3">
                            {/* Navigation Links Only - No duplicate auth buttons */}
                            <div className="space-y-2">
                                <Link
                                    to="/projects"
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors border border-gray-200"
                                >
                                    <Search className="w-5 h-5 text-gray-500" />
                                    Projects
                                </Link>
                                <Link
                                    to="/organizations"
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors border border-gray-200"
                                >
                                    <Building className="w-5 h-5 text-gray-500" />
                                    Organizations
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </nav>
        )
    }

    return (
        <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Left side - Logo and Navigation */}
                    <div className="flex items-center space-x-8">
                        {/* Logo */}
                        <Link to="/" className="flex items-center space-x-2 sm:space-x-3">
                            <img
                                src="/images/devtogether-icon.svg"
                                alt="DevTogether"
                                className="w-8 h-8 sm:w-10 sm:h-10"
                            />
                            <span className="text-lg sm:text-xl font-bold text-gray-900">DevTogether</span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex space-x-1">
                            <Link
                                to="/dashboard"
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${isActive('/dashboard')
                                    ? 'text-blue-600 bg-blue-50'
                                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                <Home className="w-4 h-4" />
                                Dashboard
                            </Link>

                            {navItems.map((item) => {
                                const IconComponent = item.icon
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${isActive(item.path)
                                            ? 'text-blue-600 bg-blue-50'
                                            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                                            }`}
                                    >
                                        <IconComponent className="w-4 h-4" />
                                        {item.label}
                                    </Link>
                                )
                            })}
                        </div>
                    </div>

                    {/* Right side - Actions and Menus */}
                    <div className="flex items-center space-x-2">
                        {/* Create Project Button for Organizations */}
                        {isOrganization && orgProfile?.organization_status === 'approved' && (
                            <Link to="/projects/create" className="hidden sm:block">
                                <Button size="sm" className="flex items-center gap-2 px-4 py-2 h-10">
                                    <Plus className="w-4 h-4" />
                                    <span>Create Project</span>
                                </Button>
                            </Link>
                        )}

                        {/* Mobile Create Project Button - Icon only */}
                        {isOrganization && orgProfile?.organization_status === 'approved' && (
                            <Link to="/projects/create" className="sm:hidden">
                                <Button size="sm" className="p-2 h-10 w-10 flex items-center justify-center">
                                    <Plus className="w-5 h-5" />
                                </Button>
                            </Link>
                        )}

                        {/* Notifications */}
                        <div className="relative" ref={notificationMenuRef}>
                            <button
                                onClick={() => setNotificationMenuOpen(!notificationMenuOpen)}
                                className="relative p-2 h-10 w-10 text-gray-400 hover:text-gray-600 rounded-lg flex items-center justify-center transition-colors border border-gray-300 hover:border-gray-400"
                            >
                                <Bell className="w-5 h-5" />
                                {/* Notification badge */}
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            <NotificationDropdown
                                isOpen={notificationMenuOpen}
                                onClose={() => setNotificationMenuOpen(false)}
                            />
                        </div>

                        {/* User Menu */}
                        <div className="relative" ref={userMenuRef}>
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="flex items-center space-x-2 p-2 h-10 rounded-lg hover:bg-gray-50 transition-colors border border-gray-300 hover:border-gray-400"
                            >
                                <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                                    {profile.avatar_url ? (
                                        <img
                                            src={profile.avatar_url}
                                            alt={displayName || 'Profile'}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                            {['developer','admin'].includes(profile.role as unknown as string) ? (
                                                <User className="w-3 h-3 text-gray-400" />
                                            ) : (
                                                <Building className="w-3 h-3 text-gray-400" />
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="hidden sm:block text-left min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {displayName || 'User'}
                                    </p>
                                    { (profile.role as unknown as string) === 'admin' ? (
                                        <span className="text-xs font-semibold text-yellow-600">Admin</span>
                                    ) : (
                                        <p className="text-xs text-gray-500 capitalize">{profile.role}</p>
                                    )}
                                </div>
                                <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            </button>

                            {/* User Dropdown Menu */}
                            {userMenuOpen && (
                                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                                    <div className="px-4 py-3 border-b border-gray-100">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {displayName || 'User'}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">{profile.email}</p>
                                    </div>

                                    <Link
                                        to="/profile"
                                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                        onClick={() => setUserMenuOpen(false)}
                                    >
                                        <User className="w-4 h-4" />
                                        View Profile
                                    </Link>

                                    {/* Admin link - only show for admin users */}
                                    {isAdmin && (
                                        <Link
                                            to="/admin"
                                            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-t border-gray-100 transition-colors"
                                            onClick={() => setUserMenuOpen(false)}
                                        >
                                            <Shield className="w-4 h-4 text-purple-600" />
                                            <span className="text-purple-600 font-medium">Admin Dashboard</span>
                                        </Link>
                                    )}

                                    <button
                                        onClick={handleSignOut}
                                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 w-full text-left transition-colors border-t border-gray-100"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 h-10 w-10 text-gray-400 hover:text-gray-600 rounded-lg flex items-center justify-center border border-gray-300 hover:border-gray-400"
                        >
                            {mobileMenuOpen ? (
                                <X className="w-5 h-5" />
                            ) : (
                                <Menu className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-gray-200 bg-white shadow-lg">
                    <div className="px-4 py-4 space-y-4">
                        {/* Main Navigation Grid */}
                        <div className="grid grid-cols-1 gap-2">
                            <Link
                                to="/dashboard"
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors border ${isActive('/dashboard')
                                    ? 'text-blue-600 bg-blue-50 border-blue-200'
                                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50 border-gray-200'
                                    }`}
                            >
                                <Home className="w-5 h-5" />
                                Dashboard
                            </Link>

                            {navItems.map((item) => {
                                const IconComponent = item.icon
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors border ${isActive(item.path)
                                            ? 'text-blue-600 bg-blue-50 border-blue-200'
                                            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50 border-gray-200'
                                            }`}
                                    >
                                        <IconComponent className="w-5 h-5" />
                                        {item.label}
                                    </Link>
                                )
                            })}
                        </div>

                        {/* Create Project Button for Organizations */}
                        {isOrganization && orgProfile?.organization_status === 'approved' && (
                            <div className="pt-2 border-t border-gray-200">
                                <Link to="/projects/create" className="block">
                                    <Button className="w-full h-12 flex items-center justify-center gap-3 text-base font-medium">
                                        <Plus className="w-5 h-5" />
                                        Create Project
                                    </Button>
                                </Link>
                            </div>
                        )}

                        {/* Quick Actions */}
                        <div className="pt-2 border-t border-gray-200">
                            <div className="grid grid-cols-2 gap-3">
                                <Link
                                    to="/profile"
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-700 transition-colors border border-gray-200"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <User className="w-4 h-4" />
                                    Profile
                                </Link>
                                
                                <button
                                    onClick={() => {
                                        setMobileMenuOpen(false)
                                        handleSignOut()
                                    }}
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-700 transition-colors border border-gray-200"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Sign Out
                                </button>
                            </div>
                        </div>

                        {/* Admin Link for Mobile */}
                        {isAdmin && (
                            <div className="pt-2 border-t border-gray-200">
                                <Link
                                    to="/admin"
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 transition-colors border border-purple-200"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <Shield className="w-5 h-5" />
                                    Admin Dashboard
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    )
} 