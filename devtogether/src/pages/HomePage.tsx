import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Code, Users, Target, ExternalLink, Github, Linkedin, Play } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Layout } from '../components/layout';
import { projectService } from '../services/projects';
import { supabase } from '../utils/supabase';
import { Project } from '../types/database';
import { User } from '../types/database';

interface ProjectCardProps {
    project: Project & { organization?: { organization_name?: string } };
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 relative">
                <div className="absolute top-4 left-4">
                    <span className="bg-white bg-opacity-20 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {project.status === 'open' ? 'Open' : project.status === 'in_progress' ? 'Active' : 'Completed'}
                    </span>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-white font-bold text-xl mb-2">{project.title}</h3>
                    <p className="text-white text-opacity-90 text-sm line-clamp-2">{project.description}</p>
                </div>
            </div>
            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-600">{project.organization?.organization_name || 'Organization'}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${project.difficulty_level === 'beginner' ? 'bg-green-100 text-green-800' :
                        project.difficulty_level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                        }`}>
                        {project.difficulty_level}
                    </span>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                    {project.technology_stack?.slice(0, 3).map((tech: string) => (
                        <span key={tech} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                            {tech}
                        </span>
                    ))}
                    {project.technology_stack && project.technology_stack.length > 3 && (
                        <span className="text-gray-500 text-xs">+{project.technology_stack.length - 3} more</span>
                    )}
                </div>
                <Button className="w-full !text-gray-700 !bg-white hover:!bg-gray-50 !border-gray-300" variant="outline">
                    View Project
                </Button>
            </div>
        </div>
    );
};

interface DeveloperSpotlightProps {
    developer: User | null;
}

const DeveloperSpotlight: React.FC<DeveloperSpotlightProps> = ({ developer }) => {
    if (!developer) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <p className="text-gray-500">No featured developer available</p>
            </div>
        );
    }

    const displayName = `${developer.first_name || ''} ${developer.last_name || ''}`.trim() || 'Developer';
    const skills = developer.skills || [];

    return (
        <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-6">
                <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 bg-gray-200">
                    {developer.avatar_url ? (
                        <img
                            src={developer.avatar_url}
                            alt={displayName}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                            {displayName.charAt(0)}
                        </div>
                    )}
                </div>
                <h3 className="text-xl font-bold text-gray-900">{displayName}</h3>
                <p className="text-blue-600 font-medium">Front-End Developer</p>
                <div className="flex justify-center gap-3 mt-3">
                    <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded text-xs font-medium">
                        ⭐⭐⭐⭐⭐
                    </span>
                </div>
            </div>

            <p className="text-gray-600 text-center mb-6 leading-relaxed">
                {developer.bio || "DevTogether helped me bridge my tech believes my projects but completed have given me real-world experience and a portfolio that impressed employers."}
            </p>

            <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Projects Completed</span>
                    <span className="font-semibold">12</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Success Rate</span>
                    <span className="font-semibold">96%</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Technologies</span>
                    <div className="flex gap-1">
                        {skills.slice(0, 3).map((skill) => (
                            <span key={skill} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex gap-3">
                {developer.github && (
                    <a href={developer.github} target="_blank" rel="noopener noreferrer"
                        className="text-gray-600 hover:text-gray-900">
                        <Github className="w-5 h-5" />
                    </a>
                )}
                {developer.linkedin && (
                    <a href={developer.linkedin} target="_blank" rel="noopener noreferrer"
                        className="text-gray-600 hover:text-gray-900">
                        <Linkedin className="w-5 h-5" />
                    </a>
                )}
                {developer.portfolio && (
                    <a href={developer.portfolio} target="_blank" rel="noopener noreferrer"
                        className="text-gray-600 hover:text-gray-900">
                        <ExternalLink className="w-5 h-5" />
                    </a>
                )}
            </div>

            <div className="mt-6 text-center">
                <Button variant="outline" size="sm" className="!text-gray-700 !bg-white hover:!bg-gray-50 !border-gray-300">
                    View Full Profile
                </Button>
            </div>
        </div>
    );
};

const HomePage: React.FC = () => {
    const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
    const [featuredDeveloper, setFeaturedDeveloper] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHomePageData();
    }, []);

    const loadHomePageData = async () => {
        try {
            // Load featured projects (open projects)
            const projects = await projectService.getProjects({
                status: 'open'
            });

            setFeaturedProjects(projects.slice(0, 3));

            // Try to load a featured developer (public profile with good stats)
            // This is a simplified approach - in production you'd have a featured developer system
            try {
                // Get recent developers - this is a placeholder approach
                const { data: profiles } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('role', 'developer')
                    .eq('is_public', true)
                    .not('avatar_url', 'is', null)
                    .not('bio', 'is', null)
                    .limit(5);

                if (profiles && profiles.length > 0) {
                    // Pick a random featured developer
                    const randomIndex = Math.floor(Math.random() * profiles.length);
                    setFeaturedDeveloper(profiles[randomIndex]);
                }
            } catch (error) {
                console.log('Could not load featured developer:', error);
            }

        } catch (error) {
            console.error('Error loading homepage data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout showFooter={false}>
            <div className="min-h-screen bg-white">
                {/* Hero Section */}
                <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white overflow-hidden">
                    <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                                    Real Projects.<br />
                                    Real Impact.<br />
                                    <span className="text-yellow-400">Real Experience.</span>
                                </h1>
                                <p className="text-xl lg:text-2xl text-blue-100 mb-8 leading-relaxed">
                                    Connect with mission-driven organizations, build your portfolio, and make a difference through code.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                                    <Link to="/for-developers">
                                        <Button size="lg" variant="primary" className="!bg-white !text-blue-700 hover:!bg-gray-100 !border-0 font-semibold px-8 py-4">
                                            I'm a Developer
                                        </Button>
                                    </Link>
                                    <Link to="/for-organizations">
                                        <Button size="lg" variant="ghost" className="!border-2 !border-white !text-white hover:!bg-white hover:!text-blue-600 font-semibold px-8 py-4">
                                            I'm an Organization
                                        </Button>
                                    </Link>
                                </div>
                            </div>

                            {/* Project Dashboard Mockup */}
                            <div className="relative">
                                <div className="bg-white rounded-lg shadow-2xl p-6 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                                        <span className="ml-4 text-gray-600 text-sm font-medium">Project Dashboard</span>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="bg-green-50 p-3 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-medium text-gray-900">EcoTracker App</h4>
                                                <span className="text-green-600 text-sm font-medium">Active</span>
                                            </div>
                                            <p className="text-gray-600 text-sm mt-1">Environmental Foundation</p>
                                        </div>
                                        <div className="bg-blue-50 p-3 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-700 text-sm">Your Role:</span>
                                                <span className="text-blue-600 font-medium text-sm">React</span>
                                            </div>
                                            <div className="flex items-center justify-between mt-1">
                                                <span className="text-gray-700 text-sm">Team:</span>
                                                <div className="flex -space-x-2">
                                                    <div className="w-6 h-6 bg-purple-400 rounded-full border-2 border-white"></div>
                                                    <div className="w-6 h-6 bg-green-400 rounded-full border-2 border-white"></div>
                                                    <div className="w-6 h-6 bg-blue-400 rounded-full border-2 border-white"></div>
                                                </div>
                                            </div>
                                        </div>
                                        <Button size="sm" className="w-full !bg-blue-600 !text-white hover:!bg-blue-700">
                                            Open Project
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Statistics Section */}
                <section className="py-16 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                            <div className="text-center">
                                <div className="text-4xl lg:text-5xl font-bold text-blue-600 mb-2">120+</div>
                                <div className="text-gray-600">Active Projects</div>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl lg:text-5xl font-bold text-blue-600 mb-2">750+</div>
                                <div className="text-gray-600">Developers</div>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl lg:text-5xl font-bold text-blue-600 mb-2">85+</div>
                                <div className="text-gray-600">Organizations</div>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl lg:text-5xl font-bold text-blue-600 mb-2">92%</div>
                                <div className="text-gray-600">Completion Rate</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How DevTogether Works */}
                <section className="py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                                How DevTogether Works
                            </h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                Our platform makes it easy to connect, collaborate, and create impact together
                            </p>
                        </div>

                        <div className="grid lg:grid-cols-3 gap-12">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Target className="w-8 h-8 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4">1. Find Projects</h3>
                                <p className="text-gray-600 mb-4">
                                    Browse projects that match your skills and interests. Filter by technology, cause, or time commitment.
                                </p>
                                <Link to="/projects" className="text-blue-600 font-medium flex items-center justify-center gap-1 hover:gap-2 transition-all">
                                    Browse Projects <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>

                            <div className="text-center">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Users className="w-8 h-8 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4">2. Apply & Contribute</h3>
                                <p className="text-gray-600 mb-4">
                                    Submit your application, get matched with a team, and start contributing to meaningful projects.
                                </p>
                                <Link to="/auth/register" className="text-blue-600 font-medium flex items-center justify-center gap-1 hover:gap-2 transition-all">
                                    Learn About Contributing <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>

                            <div className="text-center">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Code className="w-8 h-8 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4">3. Build Your Portfolio</h3>
                                <p className="text-gray-600 mb-4">
                                    Earn badges, get endorsements, and showcase your work to future employers and collaborators.
                                </p>
                                <Link to="/auth/register" className="text-blue-600 font-medium flex items-center justify-center gap-1 hover:gap-2 transition-all">
                                    See Developer Profiles <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Featured Projects */}
                <section className="py-20 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center mb-12">
                            <div>
                                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Featured Projects</h2>
                                <p className="text-xl text-gray-600">Real projects from organizations making a difference</p>
                            </div>
                            <Link to="/projects">
                                <Button variant="outline" className="flex items-center gap-2 !text-gray-700 !bg-white hover:!bg-gray-50 !border-gray-300">
                                    View All Projects <ArrowRight className="w-4 h-4" />
                                </Button>
                            </Link>
                        </div>

                        {loading ? (
                            <div className="grid lg:grid-cols-3 gap-8">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
                                        <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                                    </div>
                                ))}
                            </div>
                        ) : featuredProjects.length > 0 ? (
                            <div className="grid lg:grid-cols-3 gap-8">
                                {featuredProjects.map((project) => (
                                    <ProjectCard key={project.id} project={project} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-gray-500">No featured projects available at the moment.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Developer Spotlight */}
                <section className="py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                                    Developer Spotlight
                                </h2>
                                <p className="text-xl text-gray-600 mb-8">
                                    Meet the talented developers making an impact through their contributions
                                </p>
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Recent Projects</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            <span className="text-green-800 font-medium">EcoTracker Dashboard</span>
                                            <span className="text-green-600 text-sm">Complete</span>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                            <span className="text-purple-800 font-medium">Learning Resource Library</span>
                                            <span className="text-purple-600 text-sm">Complete</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <DeveloperSpotlight developer={featuredDeveloper} />
                        </div>
                    </div>
                </section>

                {/* Organizations We've Helped */}
                <section className="py-20 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                                Organizations We've Helped
                            </h2>
                            <p className="text-xl text-gray-600">
                                We partner with nonprofits and socially-minded organizations to bring their tech projects to life
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center justify-items-center opacity-60">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="w-24 h-24 bg-gray-300 rounded-lg flex items-center justify-center">
                                    <span className="text-gray-500 text-sm">Logo {i}</span>
                                </div>
                            ))}
                        </div>

                        <div className="text-center mt-12">
                            <Button variant="outline" className="!text-gray-700 !bg-white hover:!bg-gray-50 !border-gray-300">
                                Become a Partner Organization
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Ready to Start CTA */}
                <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                            Ready to Start Your Journey?
                        </h2>
                        <p className="text-xl text-blue-100 mb-8">
                            Join our community of developers and organizations making a difference through technology
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/for-developers">
                                <Button size="lg" variant="primary" className="!bg-white !text-blue-700 hover:!bg-gray-100 !border-0 font-semibold px-8 py-4">
                                    Join as a Developer
                                </Button>
                            </Link>
                            <Link to="/for-organizations">
                                <Button size="lg" variant="ghost" className="!border-2 !border-white !text-white hover:!bg-white hover:!text-blue-600 font-semibold px-8 py-4">
                                    Post a Project
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-gray-900 text-white py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid md:grid-cols-4 gap-8">
                            <div>
                                <div className="flex items-center space-x-3 mb-6">
                                    <img
                                        src="/images/devtogether-icon.svg"
                                        alt="DevTogether"
                                        className="w-8 h-8"
                                    />
                                    <span className="text-xl font-bold">DevTogether</span>
                                </div>
                                <p className="text-gray-400 mb-4">
                                    Connecting early-career developers with mission-driven organizations to create impact through technology.
                                </p>
                                <div className="flex space-x-4">
                                    <a href="#" className="text-gray-400 hover:text-white">
                                        <Github className="w-5 h-5" />
                                    </a>
                                    <a href="#" className="text-gray-400 hover:text-white">
                                        <Linkedin className="w-5 h-5" />
                                    </a>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-4">For Developers</h3>
                                <ul className="space-y-2 text-gray-400">
                                    <li><Link to="/projects" className="hover:text-white">Browse Projects</Link></li>
                                    <li><Link to="/auth/register" className="hover:text-white">Developer Resources</Link></li>
                                    <li><Link to="/auth/register" className="hover:text-white">Success Stories</Link></li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-4">For Organizations</h3>
                                <ul className="space-y-2 text-gray-400">
                                    <li><Link to="/auth/register" className="hover:text-white">Post a Project</Link></li>
                                    <li><Link to="/auth/register" className="hover:text-white">Pricing</Link></li>
                                    <li><Link to="/auth/register" className="hover:text-white">Success Stories</Link></li>
                                    <li><Link to="/auth/register" className="hover:text-white">Contact</Link></li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-4">Company</h3>
                                <ul className="space-y-2 text-gray-400">
                                    <li><Link to="/auth/register" className="hover:text-white">About Us</Link></li>
                                    <li><Link to="/auth/register" className="hover:text-white">Blog</Link></li>
                                    <li><Link to="/auth/register" className="hover:text-white">Contact</Link></li>
                                </ul>
                            </div>
                        </div>

                        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
                            <p>&copy; 2024 DevTogether. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </Layout>
    );
};

export default HomePage; 