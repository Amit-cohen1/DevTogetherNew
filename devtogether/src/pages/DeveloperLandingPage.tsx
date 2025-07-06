import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Code, CheckCircle, Star, Award, Users, Lightbulb, Zap, Building } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Layout } from '../components/layout/Layout';
// import platformStatsService, { getLandingPageTestimonials } from '../services/platformStatsService';

const DeveloperLandingPage: React.FC = () => {
    // Mock data for marketing purposes - replace with real data when ready
    const [platformStats] = useState({
        developers: '750+',
        organizations: '85+',
        projects: '120+',
        successRate: '92%'
    });
    const [loading] = useState(false);
    const [testimonials] = useState([
        {
            name: 'Nissim Cohen',
            role: 'Software Engineer',
            quote: 'DevTogether helped me land my dream job at a tech startup. The real-world experience I gained working on nonprofit projects was invaluable during interviews.',
            avatar_url: null
        },
        {
            name: 'Yaniv Ankri',
            role: 'Ai Algorithm Engineer',
            quote: 'I built my entire portfolio through DevTogether projects. Not only did I help amazing causes, but I also learned React, TypeScript, and modern development practices.',
            avatar_url: null
        },
        {
            name: 'Ram Amedi',
            role: 'Entrepreneur & Software Engineer',
            quote: 'The mentorship and collaboration I experienced here shaped my career. Working with real organizations taught me skills no bootcamp could.',
            avatar_url: null
        }
    ]);

    // Real data loading - commented out for now, uncomment when ready to use real data
    /*
    const [platformStats, setPlatformStats] = useState({
        developers: '0',
        organizations: '0',
        projects: '0',
        successRate: '0%'
    });
    const [loading, setLoading] = useState(true);
    const [testimonials, setTestimonials] = useState<Array<{
        name: string;
        role: string;
        quote: string;
        avatar_url?: string;
    }>>([]);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const [stats, testimonialsData] = await Promise.all([
                platformStatsService.getFormattedPlatformStats(),
                getLandingPageTestimonials()
            ]);
            
            setPlatformStats(stats);
            setTestimonials(testimonialsData.developerTestimonials);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };
    */

    const benefits = [
        {
            icon: Code,
            title: "Real-World Experience",
            description: "Work on actual production projects that solve real problems for nonprofit organizations and social enterprises."
        },
        {
            icon: Users,
            title: "Collaborative Teams",
            description: "Join cross-functional teams with other developers, designers, and project managers to deliver complete solutions."
        },
        {
            icon: Award,
            title: "Portfolio Building",
            description: "Build an impressive portfolio with projects that demonstrate your technical skills and social impact."
        },
        {
            icon: Star,
            title: "Skill Development",
            description: "Learn new technologies, frameworks, and best practices while working on diverse, challenging projects."
        },
        {
            icon: Building,
            title: "Professional Network",
            description: "Connect with nonprofit organizations, fellow developers, and potential employers in the social impact space."
        },
        {
            icon: Zap,
            title: "Career Acceleration",
            description: "Gain experience that employers value while making a positive difference in your community and beyond."
        }
    ];

    const howItWorks = [
        {
            step: "1",
            title: "Create Your Profile",
            description: "Showcase your skills, experience, and the causes you care about to attract the right opportunities."
        },
        {
            step: "2", 
            title: "Discover Projects",
            description: "Browse projects that match your interests and skill level, from beginner-friendly to advanced challenges."
        },
        {
            step: "3",
            title: "Apply & Connect",
            description: "Submit applications with your cover letter and portfolio to join teams building meaningful solutions."
        },
        {
            step: "4",
            title: "Build & Deploy",
            description: "Collaborate with your team to develop, test, and deploy applications that create real social impact."
        }
    ];

    // Remove the hardcoded testimonials array

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
                                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                                    {loading ? '...' : platformStats.developers}
                                </div>
                                <div className="text-gray-600">Active Developers</div>
                            </div>
                            <div>
                                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                                    {loading ? '...' : platformStats.projects}
                                </div>
                                <div className="text-gray-600">Projects Completed</div>
                            </div>
                            <div>
                                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                                    {loading ? '...' : platformStats.organizations}
                                </div>
                                <div className="text-gray-600">Partner Organizations</div>
                            </div>
                            <div>
                                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                                    {loading ? '...' : platformStats.successRate}
                                </div>
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

                {/* Testimonials Section - Only show if we have real testimonials */}
                {testimonials.length > 0 && (
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
                                            <div className="w-12 h-12 rounded-full overflow-hidden mr-3 bg-gray-200">
                                                {testimonial.avatar_url ? (
                                                    <img
                                                        src={testimonial.avatar_url}
                                                        alt={testimonial.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                                                        {testimonial.name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
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
                )}

                {/* Call to Action */}
                <section className="py-20 bg-blue-600 text-white">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">
                            Ready to Build Your Future?
                        </h2>
                        <p className="text-xl text-blue-100 mb-8">
                            Join thousands of developers who are building meaningful projects and advancing their careers through DevTogether.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/auth/register?role=developer">
                                <Button size="lg" className="!bg-yellow-400 !text-blue-900 hover:!bg-yellow-300 !border-0 font-semibold px-8 py-4">
                                    Get Started Today
                                </Button>
                            </Link>
                            <Link to="/projects">
                                <Button size="lg" variant="ghost" className="!border-2 !border-white !text-white hover:!bg-white hover:!text-blue-600 font-semibold px-8 py-4">
                                    Explore Projects
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </Layout>
    );
};

export default DeveloperLandingPage; 