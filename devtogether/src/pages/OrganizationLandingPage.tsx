import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building, CheckCircle, Star, Users, Clock, Shield, Zap, Award, Target, Code } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Layout } from '../components/layout/Layout';
// import platformStatsService, { getLandingPageTestimonials } from '../services/platformStatsService';

const OrganizationLandingPage: React.FC = () => {
    // Mock data for marketing purposes - replace with real data when ready
    const [platformStats] = useState({
        developers: '750+',
        organizations: '85+',
        projects: '120+',
        successRate: '94%'
    });
    const [loading] = useState(false);
    const [testimonials] = useState([
        {
            name: 'Jennifer Adams',
            role: 'Program Director',
            organization: 'Green Future Initiative',
            quote: 'The developers we worked with through DevTogether exceeded our expectations. They delivered a beautiful website that increased our donor engagement by 300%.',
            avatar_url: null
        },
        {
            name: 'Michael Thompson',
            role: 'Executive Director',
            organization: 'Community Food Network',
            quote: 'DevTogether connected us with talented developers who built a volunteer management system that streamlined our operations and saved us countless hours.',
            avatar_url: null
        },
        {
            name: 'Lisa Rodriguez',
            role: 'Technology Manager',
            organization: 'Youth Education Alliance',
            quote: 'Working with DevTogether was transformative. The mobile app they helped us create has reached over 5,000 students and parents in our community.',
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
        organization: string;
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
            setTestimonials(testimonialsData.organizationTestimonials);
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
            title: "Expert Development Teams",
            description: "Access skilled developers who are passionate about your cause and committed to delivering quality solutions."
        },
        {
            icon: Clock,
            title: "Cost-Effective Solutions",
            description: "Get professional-grade applications at a fraction of traditional development costs while supporting developer education."
        },
        {
            icon: Users,
            title: "Collaborative Process",
            description: "Work closely with development teams throughout the project lifecycle, ensuring your vision is realized perfectly."
        },
        {
            icon: Shield,
            title: "Quality Assurance", 
            description: "All projects go through rigorous review processes and are supported by experienced project managers."
        },
        {
            icon: Zap,
            title: "Modern Technology",
            description: "Leverage cutting-edge technologies and frameworks to build scalable, secure, and performant applications."
        },
        {
            icon: Award,
            title: "Social Impact",
            description: "Contribute to developer education and career growth while advancing your organization's mission and goals."
        }
    ];

    const howItWorks = [
        {
            step: "1",
            title: "Post Your Project", 
            description: "Define your project requirements, technology preferences, timeline, and team structure to attract the right developers."
        },
        {
            step: "2",
            title: "Review Applications",
            description: "Receive applications from qualified developers and review their portfolios, skills, and motivation statements."
        },
        {
            step: "3", 
            title: "Build Your Team",
            description: "Select team members and start collaborating using our integrated project workspace and communication tools."
        },
        {
            step: "4",
            title: "Launch & Impact",
            description: "Deploy your finished application and measure its impact on your organization's mission and community reach."
        }
    ];

    // Remove the hardcoded testimonials array

    const projectTypes = [
        {
            title: "Websites & Portals",
            description: "Professional websites, member portals, and content management systems",
            examples: ["Organizational websites", "Donor portals", "Volunteer platforms", "Event management systems"]
        },
        {
            title: "Mobile Applications",
            description: "Native and cross-platform mobile apps for your community",
            examples: ["Community engagement apps", "Event check-in systems", "Resource directories", "Donation platforms"]
        },
        {
            title: "Management Systems",
            description: "Custom software to streamline your operations",
            examples: ["CRM systems", "Inventory management", "Volunteer tracking", "Program management tools"]
        },
        {
            title: "Data & Analytics",
            description: "Tools to help you understand and optimize your impact",
            examples: ["Impact dashboards", "Reporting systems", "Data visualization", "Performance tracking"]
        }
    ];

    return (
        <Layout>
            <div className="min-h-screen bg-white">
                {/* Hero Section */}
                <section className="relative bg-gradient-to-br from-green-600 via-green-700 to-green-800 text-white overflow-hidden">
                    <div className="absolute inset-0 bg-black opacity-10"></div>
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                        <div className="text-center">
                            <div className="inline-flex items-center px-4 py-2 bg-yellow-400 text-green-900 rounded-full font-semibold text-sm mb-8">
                                <Building className="w-4 h-4 mr-2" />
                                For Organizations
                            </div>
                            <h1 className="text-4xl md:text-6xl font-bold mb-6">
                                Amplify Your Impact with
                                <span className="block text-yellow-400">Custom Technology</span>
                            </h1>
                            <p className="text-xl md:text-2xl text-green-100 mb-8 max-w-3xl mx-auto leading-relaxed">
                                Partner with skilled developers to build custom applications that advance your mission
                                while providing them with real-world experience.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link to="/auth/register?role=organization">
                                    <Button size="lg" className="!bg-yellow-400 !text-green-900 hover:!bg-yellow-300 !border-0 font-semibold px-8 py-4">
                                        Start Your Project
                                    </Button>
                                </Link>
                                <Link to="/projects">
                                    <Button size="lg" variant="ghost" className="!border-2 !border-white !text-white hover:!bg-white hover:!text-green-600 font-semibold px-8 py-4">
                                        See Examples
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
                                <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">
                                    {loading ? '...' : platformStats.organizations}
                                </div>
                                <div className="text-gray-600">Partner Organizations</div>
                            </div>
                            <div>
                                <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">
                                    {loading ? '...' : platformStats.projects}
                                </div>
                                <div className="text-gray-600">Projects Delivered</div>
                            </div>
                            <div>
                                <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">
                                    {loading ? '...' : platformStats.developers}
                                </div>
                                <div className="text-gray-600">Developers Engaged</div>
                            </div>
                            <div>
                                <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">
                                    {loading ? '...' : platformStats.successRate}
                                </div>
                                <div className="text-gray-600">Satisfaction Rate</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Benefits Section */}
                <section className="py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                Why Organizations Choose DevTogether
                            </h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                Get professional-quality technology solutions while supporting the next generation
                                of developers. It's a win-win for your organization and the tech community.
                            </p>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {benefits.map((benefit, index) => {
                                const IconComponent = benefit.icon;
                                return (
                                    <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                                            <IconComponent className="w-6 h-6 text-green-600" />
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
                                How DevTogether Works for Organizations
                            </h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                From project conception to deployment, we make it easy to work with talented developers.
                            </p>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {howItWorks.map((step, index) => (
                                <div key={index} className="text-center">
                                    <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4 mx-auto">
                                        {step.step}
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                                    <p className="text-gray-600 leading-relaxed">{step.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Project Types Section */}
                <section className="py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                Types of Projects We Build
                            </h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                From simple websites to complex management systems, our developers can build
                                the technology solutions your organization needs.
                            </p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-8">
                            {projectTypes.map((type, index) => (
                                <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{type.title}</h3>
                                    <p className="text-gray-600 mb-4">{type.description}</p>
                                    <div className="space-y-2">
                                        {type.examples.map((example, exampleIndex) => (
                                            <div key={exampleIndex} className="flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                                                <span className="text-sm text-gray-700">{example}</span>
                                            </div>
                                        ))}
                                    </div>
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
                                    Success Stories from Our Partners
                                </h2>
                                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                    Hear from organizations that have successfully built impactful technology solutions through DevTogether.
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
                                                    <div className="w-full h-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                                                        {testimonial.name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                                                <p className="text-sm text-gray-600">{testimonial.role}</p>
                                                <p className="text-xs text-gray-500">{testimonial.organization}</p>
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
                <section className="py-20 bg-green-600 text-white">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">
                            Ready to Amplify Your Impact?
                        </h2>
                        <p className="text-xl text-green-100 mb-8">
                            Join forward-thinking organizations that are leveraging technology to create meaningful change in their communities.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/auth/register?role=organization">
                                <Button size="lg" className="!bg-yellow-400 !text-green-900 hover:!bg-yellow-300 !border-0 font-semibold px-8 py-4">
                                    Start Your Project
                                </Button>
                            </Link>
                            <Link to="/projects">
                                <Button size="lg" variant="ghost" className="!border-2 !border-white !text-white hover:!bg-white hover:!text-green-600 font-semibold px-8 py-4">
                                    View Examples
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </Layout>
    );
};

export default OrganizationLandingPage; 