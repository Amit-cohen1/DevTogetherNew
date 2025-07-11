import React from 'react'
import { Github, Mail } from 'lucide-react'

export const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear()

    const contactLinks = [
        {
            label: 'Client Site',
            href: 'https://dev-together-new.vercel.app/'
        },
        {
            label: 'GitHub',
            href: 'https://github.com/Amit-cohen1/DevTogetherNew',
            icon: Github
        },
        {
            label: 'Support',
            href: 'mailto:devtogether.help@gmail.com',
            icon: Mail
        }
    ]

    return (
        <footer className="bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-8 md:space-y-0">
                    {/* Brand & Description */}
                    <div>
                        <div className="flex items-center space-x-3 mb-2">
                            <img
                                src="/images/devtogether-icon.svg"
                                alt="DevTogether"
                                className="w-8 h-8 brightness-0 invert"
                            />
                            <span className="text-lg font-bold">DevTogether</span>
                        </div>
                        <p className="text-gray-300 text-sm max-w-xs">
                            Connecting passionate developers with impactful nonprofit projects.
                        </p>
                    </div>

                    {/* Contact & Links */}
                    <div className="flex flex-col items-start md:items-end space-y-4">
                        <div className="flex space-x-6">
                            {contactLinks.map((contact) => {
                                const Icon = contact.icon
                                return (
                                    <a
                                        key={contact.label}
                                        href={contact.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center text-gray-300 hover:text-white transition-colors text-sm"
                                    >
                                        {Icon && <Icon className="w-4 h-4 mr-1" />}
                                        {contact.label}
                                    </a>
                                )
                            })}
                        </div>
                        <p className="text-gray-400 text-xs max-w-sm text-right">
                            DevTogether operates in accordance with all applicable laws and regulations of the State of Israel and international web standards.
                        </p>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-8 pt-6 border-t border-gray-800 text-center">
                    <p className="text-gray-400 text-sm">
                        © {currentYear} DevTogether. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    )
} 