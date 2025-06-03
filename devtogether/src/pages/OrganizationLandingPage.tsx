import React from 'react';
import { Link } from 'react-router-dom';
import {
    Building,
    Users,
    Heart,
    DollarSign,
    Clock,
    Target,
    CheckCircle,
    ArrowRight,
    Star,
    Award,
    Globe,
    Calendar,
    Zap,
    Shield
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Layout } from '../components/layout';

const OrganizationLandingPage: React.FC = () => {
    const benefits = [
        {
            icon: DollarSign,
            title: "Cost-Effective Solutions",
            description: "Get professional-quality web applications and software without the high cost of agencies or full-time developers."
        },
        {
            icon: Users,
            title: "Skilled Developer Teams",
            description: "Access early-career developers who are motivated, skilled, and eager to make a meaningful impact."
        },
        {
            icon: Clock,
            title: "Faster Development",
            description: "Projects move quickly with dedicated teams focused on delivering results within defined timelines."
        },
        {
            icon: Heart,
            title: "Mission-Driven Work",
            description: "Developers are passionate about your cause, resulting in higher quality work and genuine commitment."
        },
        {
            icon: Target,
            title: "Custom Solutions",
            description: "Get exactly what you need with custom-built applications tailored to your organization's specific requirements."
        },
        {
            icon: Shield,
            title: "Ongoing Support",
            description: "Receive documentation, training, and ongoing support to ensure your project's long-term success."
        }
    ];

    const howItWorks = [
        {
            step: 1,
            title: "Post Your Project",
            description: "Create a detailed project listing with your requirements, technology preferences, and timeline."
        },
        {
            step: 2,
            title: "Review Applications",
            description: "Qualified developers apply to your project. Review applications and select your ideal team members."
        },
        {
            step: 3,
            title: "Collaborate & Monitor",
            description: "Work with your team using our project management tools. Track progress and provide feedback."
        },
        {
            step: 4,
            title: "Launch & Succeed",
            description: "Deploy your completed project and achieve your organization's goals with your new digital solution."
        }
    ];

    const testimonials = [
        {
            name: "Maria Gonzalez",
            role: "Executive Director, Community Care Network",
            image: "/images/testimonials/org-1.jpg",
            quote: "DevTogether helped us build a volunteer management system that streamlined our operations and doubled our volunteer engagement. The developers truly understood our mission."
        },
        {
            name: "David Kim",
            role: "Program Manager, Education First",
            image: "/images/testimonials/org-2.jpg",
            quote: "We needed a learning platform for underserved communities. The team delivered an amazing solution that has helped over 1,000 students access quality education resources."
        },
        {
            name: "Jennifer Adams",
            role: "Founder, Animal Rescue Alliance",
            image: "/images/testimonials/org-3.jpg",
            quote: "Our new adoption platform built through DevTogether increased our adoption rates by 300%. The developers went above and beyond to make sure it was perfect."
        }
    ];

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
                                <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">85+</div>
                                <div className="text-gray-600">Partner Organizations</div>
                            </div>
                            <div>
                                <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">120+</div>
                                <div className="text-gray-600">Projects Delivered</div>
                            </div>
                            <div>
                                <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">$2.5M+</div>
                                <div className="text-gray-600">Value Delivered</div>
                            </div>
                            <div>
                                <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">98%</div>
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

                {/* Testimonials Section */}
                <section className="py-20 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                Success Stories from Our Partners
                            </h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                See how organizations like yours have achieved their goals with DevTogether.
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

                {/* Pricing Section */}
                <section className="py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                Transparent, Affordable Pricing
                            </h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                Get professional development services at a fraction of traditional costs.
                            </p>
                        </div>
                        <div className="max-w-4xl mx-auto">
                            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center">
                                <div className="mb-6">
                                    <div className="text-4xl font-bold text-green-600 mb-2">100% Free</div>
                                    <div className="text-lg text-gray-600">To Post Projects & Find Developers</div>
                                </div>
                                <div className="grid md:grid-cols-3 gap-6 mb-8">
                                    <div className="flex items-center justify-center gap-2">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                        <span className="text-gray-700">No upfront costs</span>
                                    </div>
                                    <div className="flex items-center justify-center gap-2">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                        <span className="text-gray-700">No platform fees</span>
                                    </div>
                                    <div className="flex items-center justify-center gap-2">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                        <span className="text-gray-700">Pay what you feel is fair</span>
                                    </div>
                                </div>
                                <p className="text-gray-600 leading-relaxed">
                                    We believe in making technology accessible to all organizations. While our platform is free,
                                    we encourage organizations to provide fair compensation or donations to developers based on
                                    the value received and their budget capabilities.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 bg-gradient-to-r from-green-600 to-green-800 text-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Ready to Transform Your Organization?
                        </h2>
                        <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto">
                            Join hundreds of organizations that have successfully built custom technology solutions
                            while supporting the next generation of developers.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/auth/register?role=organization">
                                <Button size="lg" className="!bg-yellow-400 !text-green-900 hover:!bg-yellow-300 !border-0 font-semibold px-8 py-4 flex items-center gap-2">
                                    Post Your First Project <ArrowRight className="w-5 h-5" />
                                </Button>
                            </Link>
                            <Link to="/projects">
                                <Button size="lg" variant="ghost" className="!border-2 !border-white !text-white hover:!bg-white hover:!text-green-600 font-semibold px-8 py-4">
                                    View Success Stories
                                </Button>
                            </Link>
                        </div>
                        <p className="text-sm text-green-200 mt-6">
                            Free to join • No hidden fees • Start immediately
                        </p>
                    </div>
                </section>
            </div>
        </Layout>
    );
};

export default OrganizationLandingPage; 