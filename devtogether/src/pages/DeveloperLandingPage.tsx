import React from 'react';
import { Link } from 'react-router-dom';
import {
    Code,
    Users,
    Trophy,
    BookOpen,
    Zap,
    CheckCircle,
    ArrowRight,
    Star,
    Github,
    Linkedin,
    Globe,
    Calendar,
    Award,
    Target
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Layout } from '../components/layout';

const DeveloperLandingPage: React.FC = () => {
    const benefits = [
        {
            icon: Code,
            title: "Real-World Experience",
            description: "Work on actual projects for nonprofit organizations, not just tutorials or side projects."
        },
        {
            icon: Users,
            title: "Team Collaboration",
            description: "Learn to work in diverse teams, communicate effectively, and manage project workflows."
        },
        {
            icon: Trophy,
            title: "Portfolio Building",
            description: "Build a portfolio of meaningful projects that make a real impact in communities."
        },
        {
            icon: BookOpen,
            title: "Skill Development",
            description: "Learn new technologies, frameworks, and best practices through hands-on application."
        },
        {
            icon: Zap,
            title: "Networking",
            description: "Connect with other developers, organizations, and potential employers in your field."
        },
        {
            icon: Award,
            title: "Recognition",
            description: "Earn achievements, build reputation, and get recognized for your contributions."
        }
    ];

    const howItWorks = [
        {
            step: 1,
            title: "Browse Projects",
            description: "Explore projects posted by nonprofit organizations across various technologies and causes."
        },
        {
            step: 2,
            title: "Apply & Connect",
            description: "Submit applications with your skills and motivation. Organizations review and select team members."
        },
        {
            step: 3,
            title: "Collaborate & Build",
            description: "Work with your team using our project workspace, real-time chat, and collaboration tools."
        },
        {
            step: 4,
            title: "Deploy & Impact",
            description: "Launch your project, see real-world impact, and showcase your work in your professional portfolio."
        }
    ];

    const testimonials = [
        {
            name: "Sarah Chen",
            role: "Frontend Developer",
            image: "/images/testimonials/developer-1.jpg",
            quote: "DevTogether helped me transition from tutorials to real projects. I built three nonprofit websites and got my first job through connections I made here."
        },
        {
            name: "Marcus Johnson",
            role: "Full-Stack Developer",
            image: "/images/testimonials/developer-2.jpg",
            quote: "The projects here taught me more about teamwork and real-world development than my entire bootcamp. Plus, I'm making a real difference!"
        },
        {
            name: "Elena Rodriguez",
            role: "Backend Developer",
            image: "/images/testimonials/developer-3.jpg",
            quote: "I learned Docker, AWS, and project management while building a donation platform. The skills I gained landed me a senior developer role."
        }
    ];

    return (
        <Layout>
            <div className="min-h-screen bg-white">
                {/* Hero Section */}
                <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white overflow-hidden">
                    <div className="absolute inset-0 bg-black opacity-10"></div>
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                        <div className="text-center">
                            <div className="inline-flex items-center px-4 py-2 bg-yellow-400 text-blue-900 rounded-full font-semibold text-sm mb-8">
                                <Code className="w-4 h-4 mr-2" />
                                For Developers
                            </div>
                            <h1 className="text-4xl md:text-6xl font-bold mb-6">
                                Build Your Career While
                                <span className="block text-yellow-400">Making a Difference</span>
                            </h1>
                            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
                                Join DevTogether to work on real projects for nonprofit organizations,
                                gain hands-on experience, and build a portfolio that stands out to employers.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link to="/auth/register?role=developer">
                                    <Button size="lg" className="!bg-yellow-400 !text-blue-900 hover:!bg-yellow-300 !border-0 font-semibold px-8 py-4">
                                        Start Building Today
                                    </Button>
                                </Link>
                                <Link to="/projects">
                                    <Button size="lg" variant="ghost" className="!border-2 !border-white !text-white hover:!bg-white hover:!text-blue-600 font-semibold px-8 py-4">
                                        Browse Projects
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Statistics Section */}
                <section className="py-16 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                            <div>
                                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">750+</div>
                                <div className="text-gray-600">Active Developers</div>
                            </div>
                            <div>
                                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">120+</div>
                                <div className="text-gray-600">Projects Completed</div>
                            </div>
                            <div>
                                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">85+</div>
                                <div className="text-gray-600">Partner Organizations</div>
                            </div>
                            <div>
                                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">92%</div>
                                <div className="text-gray-600">Success Rate</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Benefits Section */}
                <section className="py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                Why Developers Choose DevTogether
                            </h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                Move beyond tutorials and side projects. Build real applications that solve actual problems
                                while developing the skills employers are looking for.
                            </p>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {benefits.map((benefit, index) => {
                                const IconComponent = benefit.icon;
                                return (
                                    <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                            <IconComponent className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                                        <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section className="py-20 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                How DevTogether Works for Developers
                            </h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                From finding projects to building your portfolio, here's your journey on DevTogether.
                            </p>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {howItWorks.map((step, index) => (
                                <div key={index} className="text-center">
                                    <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4 mx-auto">
                                        {step.step}
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                                    <p className="text-gray-600 leading-relaxed">{step.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Skills & Technologies Section */}
                <section className="py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                Technologies You'll Work With
                            </h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                Projects on DevTogether use modern technologies and industry-standard tools.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                            {['React', 'Node.js', 'Python', 'JavaScript', 'TypeScript', 'Vue.js', 'Angular', 'Django', 'Express', 'MongoDB', 'PostgreSQL', 'AWS'].map((tech, index) => (
                                <div key={index} className="bg-white rounded-lg p-4 text-center shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                                    <div className="text-sm font-medium text-gray-900">{tech}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Testimonials Section */}
                <section className="py-20 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                Success Stories from Our Developers
                            </h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                Hear from developers who advanced their careers through DevTogether.
                            </p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8">
                            {testimonials.map((testimonial, index) => (
                                <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                    <div className="flex items-center mb-4">
                                        <div className="w-12 h-12 bg-gray-200 rounded-full mr-3"></div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                                            <p className="text-sm text-gray-600">{testimonial.role}</p>
                                        </div>
                                    </div>
                                    <div className="flex text-yellow-400 mb-3">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="w-4 h-4 fill-current" />
                                        ))}
                                    </div>
                                    <p className="text-gray-700 italic leading-relaxed">"{testimonial.quote}"</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Ready to Start Building Your Future?
                        </h2>
                        <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
                            Join thousands of developers who are building real projects, gaining valuable experience,
                            and making a positive impact on communities worldwide.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/auth/register?role=developer">
                                <Button size="lg" className="!bg-yellow-400 !text-blue-900 hover:!bg-yellow-300 !border-0 font-semibold px-8 py-4 flex items-center gap-2">
                                    Join as a Developer <ArrowRight className="w-5 h-5" />
                                </Button>
                            </Link>
                            <Link to="/projects">
                                <Button size="lg" variant="ghost" className="!border-2 !border-white !text-white hover:!bg-white hover:!text-blue-600 font-semibold px-8 py-4">
                                    Browse Projects First
                                </Button>
                            </Link>
                        </div>
                        <p className="text-sm text-blue-200 mt-6">
                            Free to join • No commitments • Start immediately
                        </p>
                    </div>
                </section>
            </div>
        </Layout>
    );
};

export default DeveloperLandingPage; 