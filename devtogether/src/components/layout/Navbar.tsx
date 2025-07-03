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

export const Navbar: React.FC = () => {
    const { user, profile, signOut, isDeveloper, isOrganization } = useAuth()
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

    const displayName = profile?.role === 'developer'
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
            path: '/organization/projects',
            icon: Building,
        },
        {
            label: 'Applications',
            path: '/applications',
            icon: Users,
        }
    ]

    const navItems = isDeveloper ? developerNavItems : organizationNavItems

    // Public navbar for non-authenticated users
    if (!user || !profile) {
        return (
            <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Left side - Logo */}
                        <div className="flex items-center">
                            <Link to="/" className="flex items-center space-x-3">
                                <img
                                    src="/images/devtogether-icon.svg"
                                    alt="DevTogether"
                                    className="w-10 h-10"
                                />
                                <span className="text-xl font-bold text-gray-900">DevTogether</span>
                            </Link>
                        </div>

                        {/* Center - Navigation Links */}
                        <div className="hidden md:flex space-x-8">
                            <Link to="/projects" className="text-gray-700 hover:text-gray-900 font-medium">
                                Projects
                            </Link>
                            <button className="text-gray-700 hover:text-gray-900 font-medium">
                                Organizations
                            </button>
                            <button className="text-gray-700 hover:text-gray-900 font-medium">
                                About Us
                            </button>
                        </div>

                        {/* Right side - Auth buttons */}
                        <div className="flex items-center space-x-4">
                            <Link to="/auth/login">
                                <Button variant="outline" size="sm">
                                    Sign In
                                </Button>
                            </Link>
                            <Link to="/auth/register">
                                <Button size="sm">
                                    Join Now
                                </Button>
                            </Link>

                            {/* Mobile menu button */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="md:hidden p-2 text-gray-400 hover:text-gray-600 rounded-lg"
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

                {/* Mobile Navigation Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-gray-200 bg-white">
                        <div className="px-4 py-3 space-y-1">
                            <Link
                                to="/projects"
                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                            >
                                Projects
                            </Link>
                            <button
                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 w-full text-left"
                            >
                                Organizations
                            </button>
                            <button
                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 w-full text-left"
                            >
                                About Us
                            </button>
                            <div className="pt-4 space-y-2">
                                <Link
                                    to="/auth/login"
                                    className="block w-full text-center px-3 py-2 border border-gray-300 rounded-md text-base font-medium text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/auth/register"
                                    className="block w-full text-center px-3 py-2 border border-transparent rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    Join Now
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
                        <Link to="/" className="flex items-center space-x-3">
                            <img
                                src="/images/devtogether-icon.svg"
                                alt="DevTogether"
                                className="w-10 h-10"
                            />
                            <span className="text-xl font-bold text-gray-900">DevTogether</span>
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

                    {/* Right side - Notifications and User Menu */}
                    <div className="flex items-center space-x-4">
                        {/* Create Project Button for Organizations */}
                        {isOrganization && (
                            profile.organization_verified ? (
                                <Link to="/projects/create">
                                    <Button size="sm" className="flex items-center gap-2">
                                        <Plus className="w-4 h-4" />
                                        <span className="hidden sm:inline">Create Project</span>
                                    </Button>
                                </Link>
                            ) : (
                                <div className="relative group">
                                    <Button 
                                        size="sm" 
                                        className="flex items-center gap-2 opacity-50 cursor-not-allowed" 
                                        disabled
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span className="hidden sm:inline">Create Project</span>
                                    </Button>
                                    <div className="absolute right-0 top-full mt-2 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 pointer-events-none">
                                        <div className="absolute -top-1 right-4 w-2 h-2 bg-gray-900 rotate-45"></div>
                                        {profile.organization_rejection_reason 
                                            ? "Organization verification was rejected. Please update your profile." 
                                            : "Organization verification pending. You'll be able to create projects once approved."
                                        }
                                    </div>
                                </div>
                            )
                        )}

                        {/* Notifications */}
                        <div className="relative" ref={notificationMenuRef}>
                            <button
                                onClick={() => setNotificationMenuOpen(!notificationMenuOpen)}
                                className="relative p-2 text-gray-400 hover:text-gray-600 rounded-lg flex items-center justify-center transition-colors"
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
                                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                                    {profile.avatar_url ? (
                                        <img
                                            src={profile.avatar_url}
                                            alt={displayName || 'Profile'}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                            {profile.role === 'developer' ? (
                                                <User className="w-4 h-4 text-gray-400" />
                                            ) : (
                                                <Building className="w-4 h-4 text-gray-400" />
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="hidden md:block text-left">
                                    <p className="text-sm font-medium text-gray-900">
                                        {displayName || 'User'}
                                    </p>
                                    <p className="text-xs text-gray-500 capitalize">
                                        {profile.role}
                                    </p>
                                </div>
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                            </button>

                            {/* User Dropdown Menu */}
                            {userMenuOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                                    <div className="px-4 py-2 border-b border-gray-100">
                                        <p className="text-sm font-medium text-gray-900">
                                            {displayName || 'User'}
                                        </p>
                                        <p className="text-xs text-gray-500">{profile.email}</p>
                                    </div>

                                    <Link
                                        to="/profile"
                                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                        onClick={() => setUserMenuOpen(false)}
                                    >
                                        <User className="w-4 h-4" />
                                        View Profile
                                    </Link>

                                    {/* Admin link - only show for admin users */}
                                    {profile.is_admin && (
                                        <Link
                                            to="/admin"
                                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 border-t border-gray-100"
                                            onClick={() => setUserMenuOpen(false)}
                                        >
                                            <Shield className="w-4 h-4 text-purple-600" />
                                            <span className="text-purple-600 font-medium">Admin Dashboard</span>
                                        </Link>
                                    )}

                                    <Link
                                        to="/settings"
                                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                        onClick={() => setUserMenuOpen(false)}
                                    >
                                        <Settings className="w-4 h-4" />
                                        Settings
                                    </Link>

                                    <button
                                        onClick={handleSignOut}
                                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
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
                            className="md:hidden p-2 text-gray-400 hover:text-gray-600 rounded-lg"
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

            {/* Mobile Navigation Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-gray-200 bg-white">
                    <div className="px-4 py-3 space-y-1">
                        <Link
                            to="/dashboard"
                            className={`flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium transition-colors ${isActive('/dashboard')
                                ? 'text-blue-600 bg-blue-50'
                                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
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
                                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium transition-colors ${isActive(item.path)
                                        ? 'text-blue-600 bg-blue-50'
                                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                >
                                    <IconComponent className="w-5 h-5" />
                                    {item.label}
                                </Link>
                            )
                        })}
                    </div>
                </div>
            )}
        </nav>
    )
} 