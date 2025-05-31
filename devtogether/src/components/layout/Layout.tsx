import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Navbar } from './Navbar'
import { Footer } from './Footer'

interface LayoutProps {
    children: React.ReactNode
    showNavbar?: boolean
    showFooter?: boolean
    className?: string
}

export const Layout: React.FC<LayoutProps> = ({
    children,
    showNavbar = true,
    showFooter = true,
    className = ''
}) => {
    const { user, profile } = useAuth()

    return (
        <div className="min-h-screen flex flex-col">
            {/* Navigation */}
            {showNavbar && user && profile && <Navbar />}

            {/* Main Content */}
            <main className={`flex-1 ${className}`}>
                {children}
            </main>

            {/* Footer */}
            {showFooter && <Footer />}
        </div>
    )
} 