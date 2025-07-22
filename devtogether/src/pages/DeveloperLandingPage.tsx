import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
    Code, Star, Award, Users, Building, Zap, MessageSquare, Bell, 
    CheckCircle, Trophy, Target, Sparkles, ArrowRight, Play, 
    Smartphone, Monitor, Palette, Database, Cloud, Github,
    Briefcase, Heart, Shield, Globe, Mail, Phone
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Layout } from '../components/layout/Layout';

const DeveloperLandingPage: React.FC = () => {
    const [platformStats] = useState({
        developers: '9+',
        organizations: '3+',
        projects: '2+',
        successRate: 'Growing',
        avgRating: '4.8',
        completedProjects: 'Growing'
    });

    const [activeTab, setActiveTab] = useState('frontend');

    const testimonials = [
        {
            name: 'Nissim Cohen',
            role: 'Software Engineer at Google',
            quote: 'DevTogether helped me land my dream job! The rating system and feedback from real organizations made my portfolio stand out. I earned 47 stars building meaningful projects.',
            avatar_url: null,
            stars: 47,
            projectsCompleted: 8
        },
        {
            name: 'Yaniv Ankri',
            role: 'AI Algorithm Engineer',
            quote: 'The workspace collaboration tools are amazing! Real-time notifications, team chat, and project management helped me work seamlessly with nonprofits while learning cutting-edge tech.',
            avatar_url: null,
            stars: 31,
            projectsCompleted: 5
        },
        {
            name: 'Ram Amedi',
            role: 'Entrepreneur & Full-Stack Developer',
            quote: 'I built my entire startup team through DevTogether! The feedback system and achievement tracking motivated me to become a better developer and leader.',
            avatar_url: null,
            stars: 52,
            projectsCompleted: 12
        }
    ];

    const features = [
        {
            icon: Star,
            title: "Achievement & Rating System",
            description: "Earn stars for every project completed and application approved. Build your developer reputation with verified achievements from real organizations.",
            gradient: "from-yellow-400 to-orange-500",
            bgColor: "bg-yellow-50",
            borderColor: "border-yellow-200"
        },
        {
            icon: MessageSquare,
            title: "Professional Feedback System", 
            description: "Receive detailed feedback from organizations you work with. Control what appears on your public profile to showcase your best work and testimonials.",
            gradient: "from-purple-400 to-pink-500",
            bgColor: "bg-purple-50",
            borderColor: "border-purple-200"
        },
        {
            icon: Users,
            title: "Real-Time Workspace Collaboration",
            description: "Work in professional project workspaces with team chat, task management, and live collaboration tools. Experience real software development workflows.",
            gradient: "from-blue-400 to-cyan-500",
            bgColor: "bg-blue-50",
            borderColor: "border-blue-200"
        },
        {
            icon: Bell,
            title: "Smart Notification System",
            description: "Stay updated with real-time notifications for project updates, team messages, achievement unlocks, and feedback from organizations.",
            gradient: "from-green-400 to-emerald-500",
            bgColor: "bg-green-50",
            borderColor: "border-green-200"
        },
        {
            icon: Trophy,
            title: "Portfolio & Profile Showcase",
            description: "Build a stunning developer profile with verified projects, star ratings, testimonials, and achievement badges. Share your secure profile link anywhere.",
            gradient: "from-indigo-400 to-purple-500",
            bgColor: "bg-indigo-50",
            borderColor: "border-indigo-200"
        },
        {
            icon: Target,
            title: "Career Advancement Tools",
            description: "Get promoted to status manager roles, lead teams, and build leadership experience. Track your progression with detailed analytics.",
            gradient: "from-rose-400 to-red-500",
            bgColor: "bg-rose-50",
            borderColor: "border-rose-200"
        }
    ];

    const techStacks = {
        frontend: {
            icon: Monitor,
            title: "Frontend Development",
            description: "Build stunning user interfaces that nonprofits love",
            technologies: ["React", "Vue.js", "Angular", "TypeScript", "Next.js", "Tailwind CSS", "React Native", "Flutter"],
            projects: ["Nonprofit Websites", "Donor Management Dashboards", "Mobile Apps", "Admin Panels"]
        },
        backend: {
            icon: Database,
            title: "Backend Development", 
            description: "Create robust APIs and systems that scale",
            technologies: ["Node.js", "Python", "Django", "Express", "PostgreSQL", "MongoDB", "Redis", "Docker"],
            projects: ["API Development", "Database Design", "Authentication Systems", "Payment Processing"]
        },
        fullstack: {
            icon: Code,
            title: "Full-Stack Development",
            description: "End-to-end application development",
            technologies: ["MERN Stack", "MEAN Stack", "Django + React", "Next.js", "Supabase", "Firebase", "AWS", "Vercel"],
            projects: ["Complete Web Applications", "SaaS Platforms", "E-commerce Sites", "CRM Systems"]
        },
        mobile: {
            icon: Smartphone,
            title: "Mobile Development",
            description: "Native and cross-platform mobile applications", 
            technologies: ["React Native", "Flutter", "iOS", "Android", "Expo", "Ionic", "Xamarin", "PWA"],
            projects: ["Volunteer Apps", "Event Management", "Donation Platforms", "Community Apps"]
        }
    };

    const howItWorks = [
        {
            step: "1",
            title: "Create Your Profile",
            description: "Sign up and build your developer profile with skills, experience, and portfolio. Get matched with projects that fit your interests.",
            icon: Users,
            color: "blue"
        },
        {
            step: "2", 
            title: "Apply to Projects",
            description: "Browse meaningful projects from verified nonprofits. Submit applications with cover letters and portfolio links.",
            icon: Briefcase,
            color: "purple"
        },
        {
            step: "3",
            title: "Join Project Workspace",
            description: "Get accepted and join professional workspaces with team chat, project management, and collaboration tools.",
            icon: Zap,
            color: "green"
        },
        {
            step: "4",
            title: "Build & Collaborate",
            description: "Work with real teams, receive mentorship, and build production-quality applications using modern tech stacks.",
            icon: Code,
            color: "orange"
        },
        {
            step: "5",
            title: "Earn Recognition",
            description: "Complete projects to earn stars, receive professional feedback, and build your verified portfolio.",
            icon: Trophy,
            color: "yellow"
        }
    ];

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50">
                {/* Hero Section */}
                <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white overflow-hidden">
                    <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                    <div className="absolute inset-0">
                        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
                        <div className="absolute top-40 right-20 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
                        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
                    </div>
                    
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                                        ))}
                                    </div>
                                    <span className="text-blue-100 font-medium">{platformStats.avgRating}/5 • Trusted by {platformStats.developers} developers</span>
                                </div>
                                
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
                                    Build Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">Dream Career</span><br />
                                    While Making <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">Real Impact</span>
                                </h1>
                                
                                <p className="text-xl text-blue-100 mb-8 leading-relaxed max-w-xl">
                                    Join {platformStats.developers} developers earning stars, building portfolios, and gaining real-world experience through meaningful nonprofit projects.
                                </p>

                                <div className="grid grid-cols-2 gap-6 mb-8">
                                    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4 border border-white border-opacity-20">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center">
                                                <Star className="w-5 h-5 text-yellow-900" />
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold text-white">{platformStats.avgRating}/5</div>
                                                <div className="text-blue-200 text-sm">Avg. Rating</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4 border border-white border-opacity-20">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-green-400 rounded-lg flex items-center justify-center">
                                                <CheckCircle className="w-5 h-5 text-green-900" />
                            </div>
                            <div>
                                                <div className="text-2xl font-bold text-white">{platformStats.successRate}</div>
                                                <div className="text-blue-200 text-sm">Success Rate</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Link to="/auth/register?role=developer">
                                        <Button
                                            size="lg"
                                            className="!bg-gradient-to-r !from-yellow-400 !to-orange-500 !text-black hover:!from-yellow-500 hover:!to-orange-600 font-bold px-8 py-4 rounded-xl shadow-xl transform transition-all duration-300 hover:scale-105 text-lg"
                                        >
                                            <Play className="w-5 h-5 mr-2" />
                                            Start Building Today - Free
                                        </Button>
                                    </Link>
                                    <Link to="/projects">
                                        <Button
                                            size="lg"
                                            variant="outline"
                                            className="!bg-transparent !text-white !border-2 !border-white hover:!bg-white hover:!text-blue-700 font-semibold px-6 py-4 rounded-xl transition-all duration-300 text-lg"
                                        >
                                            <Globe className="w-5 h-5 mr-2" />
                                            Explore Projects
                                        </Button>
                                    </Link>
                                </div>

                                <div className="flex items-center gap-6 mt-6 text-blue-200 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Shield className="w-4 h-4" />
                                        <span>100% Free</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Zap className="w-4 h-4" />
                                        <span>Start Immediately</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Trophy className="w-4 h-4" />
                                        <span>Verified Achievements</span>
                            </div>
                                </div>
                            </div>

                            {/* Dashboard Mockup */}
                            <div className="relative">
                                <div className="bg-white rounded-2xl shadow-2xl p-6 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <span className="ml-3 text-gray-600 font-medium">Developer Dashboard</span>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        {/* Profile Header */}
                                        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                                JD
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-semibold text-gray-900">John Developer</div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Star className="w-4 h-4 text-yellow-500" />
                                                    <span>4.9 Rating • 23 Stars Earned</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Active Project */}
                                        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-semibold text-gray-900 text-sm">Community Food Bank App</span>
                                                <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">Active</span>
                                            </div>
                                            <div className="text-gray-600 text-xs mb-2">Local Food Network • React Native</div>
                                            <div className="flex items-center gap-2">
                                                <div className="flex -space-x-1">
                                                    <div className="w-5 h-5 bg-purple-400 rounded-full border-2 border-white"></div>
                                                    <div className="w-5 h-5 bg-blue-400 rounded-full border-2 border-white"></div>
                                                    <div className="w-5 h-5 bg-green-400 rounded-full border-2 border-white"></div>
                                                </div>
                                                <span className="text-xs text-gray-500">3 team members</span>
                                            </div>
                                        </div>

                                        {/* Notifications */}
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <Bell className="w-3 h-3" />
                                                <span>Recent Notifications</span>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 p-2 bg-blue-50 rounded text-xs">
                                                    <MessageSquare className="w-3 h-3 text-blue-500" />
                                                    <span className="text-gray-700">New feedback received ⭐⭐⭐⭐⭐</span>
                                                </div>
                                                <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded text-xs">
                                                    <Trophy className="w-3 h-3 text-yellow-500" />
                                                    <span className="text-gray-700">Achievement unlocked: Team Player</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-16 lg:py-24 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                                Everything You Need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Excel as a Developer</span>
                            </h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                Our platform provides comprehensive tools for career advancement, skill development, and professional recognition.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {features.map((feature, index) => {
                                const IconComponent = feature.icon;
                                return (
                                    <div key={index} className={`${feature.bgColor} border ${feature.borderColor} rounded-2xl p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}>
                                        <div className={`w-12 h-12 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                                            <IconComponent className="w-6 h-6 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                        <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Technology Stacks Section */}
                <section className="py-16 lg:py-24 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                                Master <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">Modern Technologies</span>
                            </h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                Work with cutting-edge tech stacks while building real solutions for nonprofits
                            </p>
                        </div>

                        <div className="flex flex-wrap justify-center gap-2 mb-8">
                            {Object.entries(techStacks).map(([key, stack]) => (
                                <button
                                    key={key}
                                    onClick={() => setActiveTab(key)}
                                    className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                                        activeTab === key
                                            ? 'bg-blue-600 text-white shadow-lg'
                                            : 'bg-white text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    {stack.title}
                                </button>
                            ))}
                        </div>

                        <div className="bg-white rounded-2xl shadow-xl p-8">
                            {Object.entries(techStacks).map(([key, stack]) => {
                                if (key !== activeTab) return null;
                                const IconComponent = stack.icon;
                                
                                return (
                                    <div key={key} className="space-y-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                                                <IconComponent className="w-8 h-8 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-bold text-gray-900">{stack.title}</h3>
                                                <p className="text-gray-600">{stack.description}</p>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-8">
                                            <div>
                                                <h4 className="font-semibold text-gray-900 mb-3">Technologies You'll Master</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {stack.technologies.map((tech) => (
                                                        <span key={tech} className="bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium border border-blue-200">
                                                            {tech}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="font-semibold text-gray-900 mb-3">Project Types</h4>
                                                <div className="space-y-2">
                                                    {stack.projects.map((project) => (
                                                        <div key={project} className="flex items-center gap-2">
                                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                                            <span className="text-gray-600">{project}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section className="py-16 lg:py-24 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                                Your Developer Journey in <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">5 Simple Steps</span>
                            </h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                From registration to recognition - here's how you'll build your career with DevTogether
                            </p>
                        </div>

                        <div className="space-y-8">
                            {howItWorks.map((step, index) => {
                                const IconComponent = step.icon;
                                const isEven = index % 2 === 0;
                                
                                return (
                                    <div key={index} className={`flex flex-col lg:flex-row items-center gap-8 ${!isEven ? 'lg:flex-row-reverse' : ''}`}>
                                        <div className="flex-1">
                                            <div className={`flex items-center gap-4 mb-4 ${!isEven ? 'lg:justify-end' : ''}`}>
                                                <div className={`w-12 h-12 bg-gradient-to-r ${
                                                    step.color === 'blue' ? 'from-blue-500 to-blue-600' :
                                                    step.color === 'purple' ? 'from-purple-500 to-purple-600' :
                                                    step.color === 'green' ? 'from-green-500 to-green-600' :
                                                    step.color === 'orange' ? 'from-orange-500 to-orange-600' :
                                                    'from-yellow-500 to-yellow-600'
                                                } rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                                                    {step.step}
                                                </div>
                                                <h3 className={`text-2xl font-bold text-gray-900 ${!isEven ? 'lg:text-right' : ''}`}>{step.title}</h3>
                                            </div>
                                            <p className={`text-gray-600 text-lg leading-relaxed ${!isEven ? 'lg:text-right' : ''}`}>
                                                {step.description}
                                            </p>
                                        </div>

                                        <div className="flex-shrink-0">
                                            <div className={`w-24 h-24 bg-gradient-to-r ${
                                                step.color === 'blue' ? 'from-blue-100 to-blue-50' :
                                                step.color === 'purple' ? 'from-purple-100 to-purple-50' :
                                                step.color === 'green' ? 'from-green-100 to-green-50' :
                                                step.color === 'orange' ? 'from-orange-100 to-orange-50' :
                                                'from-yellow-100 to-yellow-50'
                                            } rounded-2xl flex items-center justify-center border-2 ${
                                                step.color === 'blue' ? 'border-blue-200' :
                                                step.color === 'purple' ? 'border-purple-200' :
                                                step.color === 'green' ? 'border-green-200' :
                                                step.color === 'orange' ? 'border-orange-200' :
                                                'border-yellow-200'
                                            } shadow-lg`}>
                                                <IconComponent className={`w-12 h-12 ${
                                                    step.color === 'blue' ? 'text-blue-600' :
                                                    step.color === 'purple' ? 'text-purple-600' :
                                                    step.color === 'green' ? 'text-green-600' :
                                                    step.color === 'orange' ? 'text-orange-600' :
                                                    'text-yellow-600'
                                                }`} />
                                            </div>
                                        </div>
                                </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Testimonials Section */}
                <section className="py-16 lg:py-24 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center mb-16">
                            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                                Success Stories from <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">Real Developers</span>
                                </h2>
                            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                                Hear from developers who built their careers through meaningful projects
                                </p>
                            </div>

                            <div className="grid md:grid-cols-3 gap-8">
                                {testimonials.map((testimonial, index) => (
                                <div key={index} className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 border border-white border-opacity-20 hover:bg-opacity-20 transition-all duration-300">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                            {testimonial.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                            <div className="font-semibold text-white">{testimonial.name}</div>
                                            <div className="text-gray-300 text-sm">{testimonial.role}</div>
                                        </div>
                                            </div>

                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="flex items-center gap-1">
                                            <Star className="w-4 h-4 text-yellow-400" />
                                            <span className="text-yellow-400 font-semibold">{testimonial.stars} Stars</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <CheckCircle className="w-4 h-4 text-green-400" />
                                            <span className="text-green-400 font-semibold">{testimonial.projectsCompleted} Projects</span>
                                        </div>
                                    </div>

                                    <p className="text-gray-200 leading-relaxed italic">
                                        "{testimonial.quote}"
                                    </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                {/* CTA Section */}
                <section className="py-16 lg:py-24 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                            Ready to Start Your Developer Journey?
                        </h2>
                        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                            Join thousands of developers who are building their careers while making a real difference in the world.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/auth/register?role=developer">
                                <Button
                                    size="lg"
                                    className="!bg-white !text-blue-700 hover:!bg-gray-100 font-bold px-8 py-4 rounded-xl shadow-xl transform transition-all duration-300 hover:scale-105 text-lg"
                                >
                                    <Sparkles className="w-5 h-5 mr-2" />
                                    Get Started - It's Free
                                </Button>
                            </Link>
                            <Link to="/projects">
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="!bg-transparent !text-white !border-2 !border-white hover:!bg-white hover:!text-blue-700 font-semibold px-6 py-4 rounded-xl transition-all duration-300 text-lg"
                                >
                                    <ArrowRight className="w-5 h-5 mr-2" />
                                    Browse Projects
                                </Button>
                            </Link>
                        </div>

                        <div className="flex items-center justify-center gap-8 mt-8 text-blue-200 text-sm">
                            <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4" />
                                <span>No Credit Card Required</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4" />
                                <span>Join in Under 2 Minutes</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Heart className="w-4 h-4" />
                                <span>Make Real Impact</span>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </Layout>
    );
};

export default DeveloperLandingPage; 