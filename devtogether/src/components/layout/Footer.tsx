import React from 'react'
import { Link } from 'react-router-dom'
import { Heart, Github, Twitter, Linkedin, Mail } from 'lucide-react'

export const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear()

    const footerLinks = {
        product: [
            { label: 'How it Works', href: '/how-it-works' },
            { label: 'For Developers', href: '/for-developers' },
            { label: 'For Organizations', href: '/for-organizations' },
            { label: 'Success Stories', href: '/success-stories' }
        ],
        company: [
            { label: 'About Us', href: '/about' },
            { label: 'Blog', href: '/blog' },
            { label: 'Careers', href: '/careers' },
            { label: 'Contact', href: '/contact' }
        ],
        resources: [
            { label: 'Help Center', href: '/help' },
            { label: 'Community Guidelines', href: '/guidelines' },
            { label: 'Developer Resources', href: '/resources' },
            { label: 'API Documentation', href: '/api-docs' }
        ],
        legal: [
            { label: 'Privacy Policy', href: '/privacy' },
            { label: 'Terms of Service', href: '/terms' },
            { label: 'Cookie Policy', href: '/cookies' },
            { label: 'Security', href: '/security' }
        ]
    }

    const socialLinks = [
        {
            label: 'GitHub',
            href: 'https://github.com/devtogether',
            icon: Github
        },
        {
            label: 'Twitter',
            href: 'https://twitter.com/devtogether',
            icon: Twitter
        },
        {
            label: 'LinkedIn',
            href: 'https://linkedin.com/company/devtogether',
            icon: Linkedin
        },
        {
            label: 'Email',
            href: 'mailto:hello@devtogether.org',
            icon: Mail
        }
    ]

    return (
        <footer className="bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                    {/* Brand Section */}
                    <div className="lg:col-span-1">
                        <div className="flex items-center space-x-3 mb-4">
                            <img
                                src="/images/devtogether-icon.svg"
                                alt="DevTogether"
                                className="w-10 h-10 brightness-0 invert"
                            />
                            <span className="text-xl font-bold">DevTogether</span>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed mb-6">
                            Connecting passionate developers with meaningful nonprofit projects.
                            Build your skills while making a positive impact on the world.
                        </p>

                        {/* Social Links */}
                        <div className="flex space-x-4">
                            {socialLinks.map((social) => {
                                const IconComponent = social.icon
                                return (
                                    <a
                                        key={social.label}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-400 hover:text-white transition-colors"
                                        aria-label={social.label}
                                    >
                                        <IconComponent className="w-5 h-5" />
                                    </a>
                                )
                            })}
                        </div>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                            Product
                        </h3>
                        <ul className="space-y-3">
                            {footerLinks.product.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        to={link.href}
                                        className="text-gray-300 hover:text-white text-sm transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                            Company
                        </h3>
                        <ul className="space-y-3">
                            {footerLinks.company.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        to={link.href}
                                        className="text-gray-300 hover:text-white text-sm transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources Links */}
                    <div>
                        <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                            Resources
                        </h3>
                        <ul className="space-y-3">
                            {footerLinks.resources.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        to={link.href}
                                        className="text-gray-300 hover:text-white text-sm transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div>
                        <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                            Legal
                        </h3>
                        <ul className="space-y-3">
                            {footerLinks.legal.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        to={link.href}
                                        className="text-gray-300 hover:text-white text-sm transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Newsletter Signup */}
                <div className="mt-12 pt-8 border-t border-gray-800">
                    <div className="md:flex md:items-center md:justify-between">
                        <div className="max-w-md">
                            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-2">
                                Stay Updated
                            </h3>
                            <p className="text-gray-300 text-sm">
                                Get the latest updates on new projects and opportunities.
                            </p>
                        </div>
                        <div className="mt-4 md:mt-0">
                            <div className="flex max-w-md">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-r-lg text-white font-medium transition-colors">
                                    Subscribe
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-8 pt-8 border-t border-gray-800">
                    <div className="md:flex md:items-center md:justify-between">
                        <div className="flex items-center space-x-2 text-gray-400 text-sm">
                            <span>Made with</span>
                            <Heart className="w-4 h-4 text-red-500" />
                            <span>for developers and nonprofits</span>
                        </div>
                        <div className="mt-4 md:mt-0">
                            <p className="text-gray-400 text-sm">
                                © {currentYear} DevTogether. All rights reserved.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
} 