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
    return (
        <div className="min-h-screen flex flex-col">
            {/* Navigation - Now handles both authenticated and public states */}
            {showNavbar && <Navbar />}

            {/* Main Content */}
            <main className={`flex-1 ${className}`}>
                {children}
            </main>

            {/* Footer */}
            {showFooter && <Footer />}
        </div>
    )
} 