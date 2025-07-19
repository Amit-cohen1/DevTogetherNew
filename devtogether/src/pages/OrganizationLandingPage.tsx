import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
    Building, Users, CheckCircle, Star, Shield, Clock, Zap, Award, 
    MessageSquare, Bell, Monitor, Database, Code, Briefcase, 
    ArrowRight, Play, Target, Heart, Globe, Settings, 
    BarChart3, Lock, UserCheck, Rocket, Sparkles
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Layout } from '../components/layout/Layout';

const OrganizationLandingPage: React.FC = () => {
    const [platformStats] = useState({
        developers: '750+',
        organizations: '85+',
        projects: '120+',
        successRate: '96%',
        avgProjectTime: '6 weeks',
        avgCostSavings: '75%'
    });

    const [activeFeature, setActiveFeature] = useState('workspace');

    const testimonials = [
        {
            name: 'Jennifer Adams',
            role: 'Program Director',
            organization: 'Green Future Initiative',
            quote: 'DevTogether transformed our operations! The project workspace and feedback system helped us work seamlessly with developers. Our website increased donor engagement by 300% and volunteer sign-ups by 150%.',
            avatar_url: null,
            projectsCompleted: 4,
            developerRating: 4.9
        },
        {
            name: 'Michael Thompson',
            role: 'Executive Director',
            organization: 'Community Food Network',
            quote: 'The workspace collaboration tools are incredible! Real-time notifications, team chat, and admin oversight features gave us complete control while our developers built an amazing volunteer management system.',
            avatar_url: null,
            projectsCompleted: 2,
            developerRating: 5.0
        },
        {
            name: 'Lisa Rodriguez',
            role: 'Technology Manager',
            organization: 'Youth Education Alliance',
            quote: 'The developer rating and feedback system helped us find the perfect team. Our mobile app reached 5,000+ students and parents. The professional workspace made collaboration effortless.',
            avatar_url: null,
            projectsCompleted: 3,
            developerRating: 4.8
        }
    ];

    const features = [
        {
            icon: Monitor,
            title: "Professional Project Workspace",
            description: "Manage your projects with dedicated workspaces featuring team chat, file sharing, progress tracking, and real-time collaboration tools.",
            gradient: "from-blue-400 to-cyan-500",
            bgColor: "bg-blue-50",
            borderColor: "border-blue-200"
        },
        {
            icon: Star,
            title: "Developer Rating & Feedback System",
            description: "Rate developers and provide detailed feedback. Help build their professional reputation while ensuring quality standards for future organizations.",
            gradient: "from-yellow-400 to-orange-500",
            bgColor: "bg-yellow-50",
            borderColor: "border-yellow-200"
        },
        {
            icon: Bell,
            title: "Smart Notification System",
            description: "Stay updated with real-time notifications for project milestones, team messages, developer applications, and admin approvals.",
            gradient: "from-green-400 to-emerald-500",
            bgColor: "bg-green-50",
            borderColor: "border-green-200"
        },
        {
            icon: UserCheck,
            title: "Admin Review & Approval Process",
            description: "All projects undergo professional review by our admin team before publication, ensuring quality standards and platform integrity.",
            gradient: "from-purple-400 to-pink-500",
            bgColor: "bg-purple-50",
            borderColor: "border-purple-200"
        },
        {
            icon: Settings,
            title: "Workspace Access Control",
            description: "Maintain full control over your project workspace. Approve or deny admin access requests while retaining complete authority over your team.",
            gradient: "from-indigo-400 to-purple-500",
            bgColor: "bg-indigo-50",
            borderColor: "border-indigo-200"
        },
        {
            icon: BarChart3,
            title: "Project Analytics & Insights",
            description: "Track project progress, team performance, and impact metrics with comprehensive analytics dashboards and detailed reporting.",
            gradient: "from-rose-400 to-red-500",
            bgColor: "bg-rose-50",
            borderColor: "border-rose-200"
        }
    ];

    const workspaceFeatures = {
        workspace: {
            icon: Monitor,
            title: "Project Workspace",
            description: "Centralized hub for all project activities",
            features: [
                "Real-time team chat and messaging",
                "File sharing and document management", 
                "Task assignment and progress tracking",
                "Video call integration",
                "Project timeline and milestones",
                "Team member management"
            ]
        },
        feedback: {
            icon: MessageSquare,
            title: "Feedback System",
            description: "Professional developer evaluation tools",
            features: [
                "Detailed performance ratings (1-5 stars)",
                "Written feedback and testimonials",
                "Skill assessment and recommendations",
                "Public profile contributions",
                "Project completion certificates",
                "Reference letter generation"
            ]
        },
        notifications: {
            icon: Bell,
            title: "Notification Center",
            description: "Stay updated on all project activities",
            features: [
                "Real-time project status updates",
                "Developer application notifications",
                "Team milestone achievements",
                "Admin approval confirmations",
                "Workspace access requests",
                "Deadline and schedule reminders"
            ]
        },
        security: {
            icon: Shield,
            title: "Security & Control",
            description: "Enterprise-grade security and access management",
            features: [
                "Role-based access permissions",
                "Secure workspace environments",
                "Admin oversight capabilities",
                "Data privacy protection",
                "Audit trails and logging",
                "Compliance monitoring"
            ]
        }
    };

    const projectTypes = [
        {
            icon: Globe,
            title: "Website & Web Applications",
            description: "Professional websites, donation platforms, and member portals",
            examples: ["Nonprofit Websites", "Donor Management Systems", "Event Registration Platforms", "Volunteer Portals"]
        },
        {
            icon: Code,
            title: "Custom Software Solutions",
            description: "Tailored applications for unique organizational needs",
            examples: ["Case Management Systems", "Inventory Tracking", "Custom CRM Solutions", "Reporting Dashboards"]
        },
        {
            icon: Database,
            title: "Data & Analytics Platforms",
            description: "Data visualization, reporting, and business intelligence",
            examples: ["Impact Measurement Tools", "Grant Tracking Systems", "Performance Analytics", "Outcome Reporting"]
        },
        {
            icon: Users,
            title: "Community & Engagement Tools",
            description: "Tools to connect with and engage your community",
            examples: ["Mobile Apps", "Community Forums", "Social Media Integration", "Communication Platforms"]
        }
    ];

    const howItWorks = [
        {
            step: "1",
            title: "Create Organization Profile",
            description: "Sign up and complete your organization profile with mission, goals, and verification documents for admin review.",
            icon: Building,
            color: "blue"
        },
        {
            step: "2",
            title: "Submit Project for Review",
            description: "Create detailed project proposals with requirements, timeline, and tech stack. Our admin team reviews for quality assurance.",
            icon: Briefcase,
            color: "purple"
        },
        {
            step: "3", 
            title: "Get Matched with Developers",
            description: "Once approved, your project becomes visible to our network of skilled developers who can apply to join your team.",
            icon: Users,
            color: "green"
        },
        {
            step: "4",
            title: "Manage in Professional Workspace",
            description: "Work with your development team in dedicated workspaces with chat, file sharing, and project management tools.",
            icon: Monitor,
            color: "orange"
        },
        {
            step: "5",
            title: "Launch & Provide Feedback",
            description: "Successfully launch your solution and rate your developers to help them build their professional reputation.",
            icon: Rocket,
            color: "yellow"
        }
    ];

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50">
                {/* Hero Section */}
                <section className="relative bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 text-white overflow-hidden">
                    <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                    <div className="absolute inset-0">
                        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
                        <div className="absolute top-40 right-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
                        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
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
                                    <span className="text-blue-100 font-medium">{platformStats.successRate} success rate • Trusted by {platformStats.organizations} organizations</span>
                                </div>
                                
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
                                    Build Amazing <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">Software Solutions</span><br />
                                    With <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">Expert Developers</span>
                                </h1>
                                
                                <p className="text-xl text-blue-100 mb-8 leading-relaxed max-w-xl">
                                    Partner with {platformStats.developers} skilled developers to build professional applications that amplify your nonprofit's impact. Professional workspace, feedback system, and admin oversight included.
                                </p>

                                <div className="grid grid-cols-2 gap-6 mb-8">
                                    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4 border border-white border-opacity-20">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-green-400 rounded-lg flex items-center justify-center">
                                                <Clock className="w-5 h-5 text-green-900" />
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold text-white">{platformStats.avgProjectTime}</div>
                                                <div className="text-blue-200 text-sm">Avg. Completion</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4 border border-white border-opacity-20">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-purple-400 rounded-lg flex items-center justify-center">
                                                <BarChart3 className="w-5 h-5 text-purple-900" />
                            </div>
                            <div>
                                                <div className="text-2xl font-bold text-white">{platformStats.avgCostSavings}</div>
                                                <div className="text-blue-200 text-sm">Cost Savings</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Link to="/auth/register?role=organization">
                                        <Button
                                            size="lg"
                                            className="!bg-gradient-to-r !from-yellow-400 !to-orange-500 !text-black hover:!from-yellow-500 hover:!to-orange-600 font-bold px-8 py-4 rounded-xl shadow-xl transform transition-all duration-300 hover:scale-105 text-lg"
                                        >
                                            <Play className="w-5 h-5 mr-2" />
                                            Start Your Project Today
                                        </Button>
                                    </Link>
                                    <Link to="/projects">
                                        <Button
                                            size="lg"
                                            variant="outline"
                                            className="!bg-transparent !text-white !border-2 !border-white hover:!bg-white hover:!text-blue-700 font-semibold px-6 py-4 rounded-xl transition-all duration-300 text-lg"
                                        >
                                            <Globe className="w-5 h-5 mr-2" />
                                            View Success Stories
                                        </Button>
                                    </Link>
                                </div>

                                <div className="flex items-center gap-6 mt-6 text-blue-200 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Shield className="w-4 h-4" />
                                        <span>Vetted Developers</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <UserCheck className="w-4 h-4" />
                                        <span>Admin Oversight</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Award className="w-4 h-4" />
                                        <span>Quality Guaranteed</span>
                            </div>
                                </div>
                            </div>

                            {/* Organization Dashboard Mockup */}
                            <div className="relative">
                                <div className="bg-white rounded-2xl shadow-2xl p-6 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <span className="ml-3 text-gray-600 font-medium">Organization Dashboard</span>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        {/* Organization Header */}
                                        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                                            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                                GF
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-semibold text-gray-900">Green Future Initiative</div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                                    <span>Verified Organization • 4.9 Rating</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Active Project */}
                                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-semibold text-gray-900 text-sm">Community Impact Dashboard</span>
                                                <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">In Progress</span>
                                            </div>
                                            <div className="text-gray-600 text-xs mb-2">React + Node.js • 4 developers</div>
                                            <div className="flex items-center gap-2">
                                                <div className="flex -space-x-1">
                                                    <div className="w-5 h-5 bg-purple-400 rounded-full border-2 border-white"></div>
                                                    <div className="w-5 h-5 bg-green-400 rounded-full border-2 border-white"></div>
                                                    <div className="w-5 h-5 bg-blue-400 rounded-full border-2 border-white"></div>
                                                    <div className="w-5 h-5 bg-orange-400 rounded-full border-2 border-white"></div>
                                                </div>
                                                <span className="text-xs text-gray-500">85% complete</span>
                                            </div>
                                        </div>

                                        {/* Project Stats */}
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="p-2 bg-green-50 rounded text-center">
                                                <div className="text-lg font-bold text-green-600">3</div>
                                                <div className="text-xs text-gray-600">Projects Complete</div>
                                            </div>
                                            <div className="p-2 bg-yellow-50 rounded text-center">
                                                <div className="text-lg font-bold text-yellow-600">4.9</div>
                                                <div className="text-xs text-gray-600">Developer Rating</div>
                                            </div>
                                        </div>

                                        {/* Recent Activity */}
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 p-2 bg-purple-50 rounded text-xs">
                                                <Star className="w-3 h-3 text-purple-500" />
                                                <span className="text-gray-700">Rated developer: Sarah K. ⭐⭐⭐⭐⭐</span>
                                            </div>
                                            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded text-xs">
                                                <Bell className="w-3 h-3 text-blue-500" />
                                                <span className="text-gray-700">New milestone reached: Beta Testing</span>
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
                                Everything Your Organization Needs to <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Succeed</span>
                            </h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                Professional tools and processes designed specifically for nonprofit organizations working with development teams.
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

                {/* Workspace Features Section */}
                <section className="py-16 lg:py-24 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                                Professional <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Workspace Features</span>
                            </h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                Comprehensive tools for managing your development projects from start to finish
                            </p>
                        </div>

                        <div className="flex flex-wrap justify-center gap-2 mb-8">
                            {Object.entries(workspaceFeatures).map(([key, feature]) => (
                                <button
                                    key={key}
                                    onClick={() => setActiveFeature(key)}
                                    className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                                        activeFeature === key
                                            ? 'bg-purple-600 text-white shadow-lg'
                                            : 'bg-white text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    {feature.title}
                                </button>
                            ))}
                        </div>

                        <div className="bg-white rounded-2xl shadow-xl p-8">
                            {Object.entries(workspaceFeatures).map(([key, feature]) => {
                                if (key !== activeFeature) return null;
                                const IconComponent = feature.icon;
                                
                                return (
                                    <div key={key} className="space-y-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                                                <IconComponent className="w-8 h-8 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-bold text-gray-900">{feature.title}</h3>
                                                <p className="text-gray-600">{feature.description}</p>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            {feature.features.map((item, index) => (
                                                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                                    <span className="text-gray-700">{item}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Project Types Section */}
                <section className="py-16 lg:py-24 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                                What Can We <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">Build Together?</span>
                            </h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                From simple websites to complex systems, our developers can bring your vision to life
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            {projectTypes.map((type, index) => {
                                const IconComponent = type.icon;
                                return (
                                    <div key={index} className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                                                <IconComponent className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900">{type.title}</h3>
                                                <p className="text-gray-600">{type.description}</p>
                                            </div>
                                        </div>
                                    <div className="space-y-2">
                                        {type.examples.map((example, exampleIndex) => (
                                            <div key={exampleIndex} className="flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                    <span className="text-gray-700 text-sm">{example}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section className="py-16 lg:py-24 bg-gray-50">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center mb-16">
                            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                                Your Organization's Journey in <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">5 Simple Steps</span>
                                </h2>
                                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                From idea to launch - here's how we'll help you build amazing software solutions
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
                                Success Stories from <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">Real Organizations</span>
                            </h2>
                            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                                Hear from nonprofit leaders who transformed their impact through technology
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {testimonials.map((testimonial, index) => (
                                <div key={index} className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 border border-white border-opacity-20 hover:bg-opacity-20 transition-all duration-300">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                            {testimonial.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-white">{testimonial.name}</div>
                                            <div className="text-gray-300 text-sm">{testimonial.role}</div>
                                            <div className="text-gray-400 text-xs">{testimonial.organization}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="flex items-center gap-1">
                                            <CheckCircle className="w-4 h-4 text-green-400" />
                                            <span className="text-green-400 font-semibold">{testimonial.projectsCompleted} Projects</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Star className="w-4 h-4 text-yellow-400" />
                                            <span className="text-yellow-400 font-semibold">{testimonial.developerRating}/5 Rating</span>
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
                <section className="py-16 lg:py-24 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                            Ready to Transform Your Organization with Technology?
                        </h2>
                        <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
                            Join hundreds of nonprofits who are amplifying their impact through professional software solutions built by passionate developers.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/auth/register?role=organization">
                                <Button
                                    size="lg"
                                    className="!bg-white !text-purple-700 hover:!bg-gray-100 font-bold px-8 py-4 rounded-xl shadow-xl transform transition-all duration-300 hover:scale-105 text-lg"
                                >
                                    <Sparkles className="w-5 h-5 mr-2" />
                                    Start Your Project - Free
                                </Button>
                            </Link>
                            <Link to="/projects">
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="!bg-transparent !text-white !border-2 !border-white hover:!bg-white hover:!text-purple-700 font-semibold px-6 py-4 rounded-xl transition-all duration-300 text-lg"
                                >
                                    <ArrowRight className="w-5 h-5 mr-2" />
                                    View Success Stories
                                </Button>
                            </Link>
                        </div>

                        <div className="flex items-center justify-center gap-8 mt-8 text-purple-200 text-sm">
                            <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4" />
                                <span>No Upfront Costs</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <UserCheck className="w-4 h-4" />
                                <span>Admin Quality Review</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Heart className="w-4 h-4" />
                                <span>Amplify Your Impact</span>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </Layout>
    );
};

export default OrganizationLandingPage; 