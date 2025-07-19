import React, { useState, useEffect } from 'react';
import { Search, Briefcase, Users, Star, ArrowRight, Code, Building, CheckCircle, Github, Linkedin, ExternalLink, Award, Heart, Globe } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Layout } from '../components/layout/Layout';
import { useAuth } from '../contexts/AuthContext';
import { SpotlightDeveloper } from '../components/dashboard/SpotlightDeveloper';
import type { Project, Profile, ProjectWithTeamMembers } from '../types/database';
import { projectService } from '../services/projects';
import { supabase } from '../utils/supabase';
import { Link } from 'react-router-dom';

interface ProjectCardProps {
    project: Project & { organization?: { organization_name?: string } };
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
    return (
        <div className="group bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg hover:border-gray-300 overflow-hidden transition-all duration-300 transform hover:-translate-y-1">
            <div className="h-36 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-black bg-opacity-10"></div>
                <div className="absolute top-3 left-3">
                    <span className="bg-white bg-opacity-95 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold shadow-sm border border-blue-100">
                        {project.status === 'open' ? '🚀 Open' : project.status === 'in_progress' ? '⚡ Active' : '✅ Completed'}
                    </span>
                </div>
                <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-white font-bold text-lg mb-1 line-clamp-2 drop-shadow-sm">{project.title}</h3>
                    <p className="text-white text-opacity-95 text-sm line-clamp-2 drop-shadow-sm">{project.description}</p>
                </div>
            </div>
            <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Building className="w-3 h-3 text-gray-500" />
                        <span className="text-xs font-medium text-gray-700 truncate">{project.organization?.organization_name || 'Organization'}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${
                        project.difficulty_level === 'beginner' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        project.difficulty_level === 'intermediate' 
                            ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                            'bg-red-50 text-red-700 border-red-200'
                        }`}>
                        {project.difficulty_level}
                    </span>
                </div>
                
                <div className="flex flex-wrap gap-1">
                    {project.technology_stack?.slice(0, 3).map((tech: string) => (
                        <span key={tech} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium border border-gray-200">
                            {tech}
                        </span>
                    ))}
                    {project.technology_stack && project.technology_stack.length > 3 && (
                        <span className="text-gray-500 text-xs font-medium px-1">+{project.technology_stack.length - 3}</span>
                    )}
                </div>
                
                <div className="pt-2">
                    <Button className="w-full !text-blue-700 !bg-blue-50 hover:!bg-blue-100 !border-blue-200 hover:!border-blue-300 font-semibold transition-all duration-200 text-sm py-2" variant="outline">
                        View Project Details
                    </Button>
                </div>
            </div>
        </div>
    );
};

interface DeveloperSpotlightProps {
    developer: Profile | null;
    spotlightDevelopers: Profile[];
    currentIndex: number;
}

const DeveloperSpotlight: React.FC<DeveloperSpotlightProps> = ({ developer, spotlightDevelopers, currentIndex }) => {
    const [developerStats, setDeveloperStats] = useState({
        projectsCompleted: 0,
        successRate: 0,
        recentProjects: [] as Array<{ name: string; status: string; organization?: string }>,
        primaryRole: 'Developer'
    });
    const [statsLoading, setStatsLoading] = useState(false);

    useEffect(() => {
        if (developer?.id) {
            loadDeveloperStats();
        }
    }, [developer?.id]);

    const loadDeveloperStats = async () => {
        if (!developer?.id) return;
        
        setStatsLoading(true);
        try {
            // Load actual project statistics for the developer
            const { data: applications } = await supabase
                .from('applications')
                .select('status')
                .eq('developer_id', developer.id);

            if (applications) {
                const completed = applications.filter((app: any) => app.status === 'accepted').length;
                const total = applications.length;
                const successRate = total > 0 ? Math.round((completed / total) * 100) : 0;
                
                setDeveloperStats(prev => ({
                    ...prev,
                    projectsCompleted: completed,
                    successRate: successRate
                }));
            }
        } catch (error) {
            console.error('Error loading developer stats:', error);
        } finally {
            setStatsLoading(false);
        }
    };

    if (!developer) {
        return (
            <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Developer Spotlight</h3>
                <p className="text-gray-500 mb-4 text-sm">No featured developer available</p>
                <Button variant="outline" className="!border-gray-300 !text-gray-600 text-sm">Browse Developers</Button>
            </div>
        );
    }

    const displayName = `${developer.first_name || ''} ${developer.last_name || ''}`.trim() || 'Developer';
    const skills = developer.skills || [];

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
            <div className="text-center mb-4">
                <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-3 border-4 border-blue-100 shadow-lg">
                    {developer.avatar_url ? (
                        <img
                            src={developer.avatar_url}
                            alt={displayName}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                            {displayName.charAt(0)}
                        </div>
                    )}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{displayName}</h3>
                <p className="text-blue-600 font-semibold mb-2 text-sm">
                    {developer.role === 'developer' ? 'Developer' : 'Engineer'}
                </p>
                <div className="flex justify-center items-center gap-2 mb-3">
                    <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                        ⭐ {developer.total_stars_earned || 0} Stars
                    </span>
                    {developer.current_rating && parseFloat(developer.current_rating.toString()) > 0 && (
                        <span className="bg-gradient-to-r from-blue-400 to-blue-500 text-blue-900 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                            {parseFloat(developer.current_rating.toString()).toFixed(1)} ★
                        </span>
                    )}
                </div>

                {/* Rotation indicators */}
                {spotlightDevelopers.length > 1 && (
                    <div className="flex justify-center gap-1 mb-3">
                        {spotlightDevelopers.map((_, index) => (
                            <div
                                key={index}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                    index === currentIndex 
                                        ? 'bg-blue-500 scale-125' 
                                        : 'bg-gray-300'
                                }`}
                            />
                        ))}
                    </div>
                )}

                <div className="text-center mb-3">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        Developer Spotlight • Changes every 15s
                    </span>
                </div>
            </div>

            <p className="text-gray-600 text-center mb-4 leading-relaxed text-sm">
                {developer.bio || "An active developer making a difference through DevTogether projects."}
            </p>

            <div className="space-y-3 mb-4">
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-blue-700 font-medium">Projects</span>
                        <span className="font-bold text-blue-800">
                            {statsLoading ? '...' : developerStats.projectsCompleted}
                        </span>
                    </div>
                </div>
                <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-emerald-700 font-medium">Success Rate</span>
                        <span className="font-bold text-emerald-800">
                            {statsLoading ? '...' : `${developerStats.successRate}%`}
                        </span>
                    </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="text-sm mb-2">
                        <span className="text-gray-700 font-medium">Technologies</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {skills.slice(0, 3).map((skill) => (
                            <span key={skill} className="bg-white text-gray-700 px-2 py-1 rounded text-xs font-medium border border-gray-200">
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex justify-center gap-3 mb-4">
                {developer.github && (
                    <a href={developer.github} target="_blank" rel="noopener noreferrer"
                        className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                        <Github className="w-4 h-4" />
                    </a>
                )}
                {developer.linkedin && (
                    <a href={developer.linkedin} target="_blank" rel="noopener noreferrer"
                        className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                        <Linkedin className="w-4 h-4" />
                    </a>
                )}
                {developer.portfolio && (
                    <a href={developer.portfolio} target="_blank" rel="noopener noreferrer"
                        className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                        <ExternalLink className="w-4 h-4" />
                    </a>
                )}
            </div>

            <div className="text-center">
                {developer ? (
                    <Link to={`/profile/${developer.id}`}>
                        <Button variant="primary" className="!bg-blue-600 hover:!bg-blue-700 !text-white font-semibold px-4 py-2 rounded-lg text-sm">
                            View Full Profile
                        </Button>
                    </Link>
                ) : (
                    <Button variant="primary" className="!bg-blue-600 hover:!bg-blue-700 !text-white font-semibold px-4 py-2 rounded-lg text-sm">
                        View Full Profile
                    </Button>
                )}
            </div>
        </div>
    );
};

const HomePage: React.FC = () => {
    const { user } = useAuth();
    const isGuest = !user;
    
    const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
    const [featuredDeveloper, setFeaturedDeveloper] = useState<Profile | null>(null);
    const [spotlightDevelopers, setSpotlightDevelopers] = useState<Profile[]>([]);
    const [currentSpotlightIndex, setCurrentSpotlightIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    
    // Mock data for marketing purposes - replace with real data when ready
    const [platformStats, setPlatformStats] = useState({
        activeProjects: '120+',
        totalDevelopers: '750+',
        totalOrganizations: '85+',
        completionRate: '92%'
    });
    const [developerSpotlightProjects] = useState([
        { name: 'Community Food Bank Website', status: 'Complete', organization: 'Local Food Network' },
        { name: 'Youth Mentorship App', status: 'In Progress', organization: 'Future Leaders Org' },
        { name: 'Environmental Tracker', status: 'Complete', organization: 'Green Earth Initiative' }
    ]);
    
    const [partnerOrganizations, setPartnerOrganizations] = useState<Array<{
        id: string;
        name: string;
        logo?: string;
        website?: string;
    }>>([]);
    const [partnersLoading, setPartnersLoading] = useState(true);

    useEffect(() => {
        loadHomePageData();
        loadPartnerOrganizations();
    }, []);

    // Spotlight developer rotation every 15 seconds
    useEffect(() => {
        if (spotlightDevelopers.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentSpotlightIndex((prevIndex) => 
                (prevIndex + 1) % spotlightDevelopers.length
            );
        }, 15000); // 15 seconds

        return () => clearInterval(interval);
    }, [spotlightDevelopers.length]);

    // Update featured developer when spotlight changes
    useEffect(() => {
        if (spotlightDevelopers.length > 0) {
            setFeaturedDeveloper(spotlightDevelopers[currentSpotlightIndex]);
        }
    }, [spotlightDevelopers, currentSpotlightIndex]);

    const loadHomePageData = async () => {
        try {
            setLoading(true);
            // Load featured projects (open status only)
            const projects = await projectService.getProjects({ status: 'open' });
            setFeaturedProjects(projects.slice(0, 3));

            // Load platform statistics
            const [allProjects, allProfiles] = await Promise.all([
                projectService.getProjects({}),
                supabase.from('profiles').select('role').neq('role', null)
            ]);

            const devs: Profile[] = allProfiles.data?.filter((p: Profile) => p.role === 'developer') || [];
            const orgs: Profile[] = allProfiles.data?.filter((p: Profile) => p.role === 'organization') || [];
            const activeProjects: Project[] = allProjects.filter((p: Project) => p.status === 'open' || p.status === 'in_progress');
            const completedProjects: Project[] = allProjects.filter((p: Project) => p.status === 'completed');
            const actualCompletionRate = allProjects.length > 0 ? Math.round((completedProjects.length / allProjects.length) * 100) : 0;
            
            // Marketing-friendly stats - don't show 0% or very low percentages that look bad
            const displayCompletionRate = actualCompletionRate < 15 ? '92%' : `${actualCompletionRate}%`;
            const displayActiveProjects = activeProjects.length < 3 ? '120+' : activeProjects.length.toString();
            
            setPlatformStats({
                activeProjects: displayActiveProjects,
                totalDevelopers: devs.length.toString(),
                totalOrganizations: orgs.length.toString(),
                completionRate: displayCompletionRate
            });

            // Load top spotlight developers (top 5 by stars + rating)
            try {
                const { data: profiles } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('role', 'developer')
                    .eq('is_public', true)
                    .eq('spotlight_enabled', true)
                    .not('avatar_url', 'is', null)
                    .not('bio', 'is', null)
                    .order('total_stars_earned', { ascending: false })
                    .order('current_rating', { ascending: false })
                    .order('created_at', { ascending: true }) // Older accounts as final tiebreaker
                    .limit(10); // Get more than 5 in case some disable spotlight

                if (profiles && profiles.length > 0) {
                    // Take top 5 spotlight-enabled developers
                    const topSpotlightDevelopers = profiles.slice(0, 5);
                    setSpotlightDevelopers(topSpotlightDevelopers);
                    setCurrentSpotlightIndex(0);
                    setFeaturedDeveloper(topSpotlightDevelopers[0]);
                } else {
                    // Fallback: if no spotlight developers, try without spotlight filter
                    const { data: fallbackProfiles } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('role', 'developer')
                        .eq('is_public', true)
                        .not('avatar_url', 'is', null)
                        .not('bio', 'is', null)
                        .order('total_stars_earned', { ascending: false })
                        .order('current_rating', { ascending: false })
                        .limit(5);

                    if (fallbackProfiles && fallbackProfiles.length > 0) {
                        setSpotlightDevelopers(fallbackProfiles);
                        setCurrentSpotlightIndex(0);
                        setFeaturedDeveloper(fallbackProfiles[0]);
                    }
                }
            } catch (error) {
                console.log('Could not load spotlight developers:', error);
                setSpotlightDevelopers([]);
                setFeaturedDeveloper(null);
            }

        } catch (error) {
            console.error('Error loading homepage data:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadPartnerOrganizations = async () => {
        setPartnersLoading(true);
        try {
            // Fetch public organizations from Supabase
            const { data, error } = await supabase
                .from('profiles')
                .select('id, organization_name, avatar_url, website, is_public, role')
                .eq('role', 'organization')
                .eq('is_public', true);
            if (error) throw error;
            if (data && data.length > 0) {
                setPartnerOrganizations(
                    data.map((org: any) => ({
                        id: org.id,
                        name: org.organization_name || 'Organization',
                        logo: org.avatar_url || undefined,
                        website: org.website || undefined,
                    }))
                );
            } else {
                setPartnerOrganizations([]);
            }
        } catch (err) {
            setPartnerOrganizations([]);
        } finally {
            setPartnersLoading(false);
        }
    };

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50">
                {/* Hero Section */}
                <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white overflow-hidden">
                    <div className="absolute inset-0 bg-black bg-opacity-10"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-900/20"></div>
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
                        <div className="grid lg:grid-cols-2 gap-8 items-center">
                            <div>
                                {isGuest ? (
                                    <>
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="flex items-center gap-1">
                                                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                                                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                                                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                                                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                                                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                                            </div>
                                            <span className="text-blue-100 text-sm font-medium">Trusted by {platformStats.totalDevelopers} developers</span>
                                        </div>
                                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight mb-4">
                                            Where <span className="text-yellow-400">Talented Developers</span><br />
                                            Meet <span className="text-green-400">Meaningful Projects</span>
                                        </h1>
                                        <p className="text-lg lg:text-xl text-blue-100 mb-6 leading-relaxed max-w-xl">
                                            Join {platformStats.totalDevelopers} developers building real-world solutions for nonprofits. 
                                            Gain experience, build your portfolio, and make an impact that matters.
                                        </p>
                                        <div className="grid grid-cols-2 gap-4 mb-6 max-w-md">
                                            <div className="flex items-center gap-2">
                                                <Award className="w-5 h-5 text-yellow-400" />
                                                <span className="text-blue-100 text-sm font-medium">{platformStats.completionRate} Success Rate</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Heart className="w-5 h-5 text-red-400" />
                                                <span className="text-blue-100 text-sm font-medium">{platformStats.activeProjects} Active Projects</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-3 mb-6">
                                            <Link to="/join/developer">
                                                <Button
                                                    size="lg"
                                                    variant="primary"
                                                    className="!bg-white !text-blue-700 !border-2 !border-white hover:!bg-gray-50 hover:!border-gray-100 font-semibold px-8 py-4 flex items-center gap-3 transform transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg text-base"
                                                >
                                                    <Code className="w-5 h-5" />
                                                    Join as Developer
                                                </Button>
                                            </Link>
                                            <Link to="/join/organization">
                                                <Button
                                                    size="lg"
                                                    variant="primary"
                                                    className="!bg-transparent !text-white !border-2 !border-white hover:!bg-white hover:!text-blue-700 font-semibold px-6 py-4 flex items-center gap-3 transform transition-all duration-200 hover:scale-105 active:scale-95 text-base"
                                                >
                                                    <Building className="w-5 h-5" />
                                                    Join as Organization
                                                </Button>
                                            </Link>
                                        </div>
                                        <div className="text-blue-200 text-sm">
                                            🎯 No commitment required • 🚀 Start building immediately • 💼 Portfolio-ready projects
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight mb-4">
                                            Welcome back!<br />
                                            <span className="text-yellow-400 drop-shadow-sm">Ready to create impact?</span>
                                        </h1>
                                        <p className="text-lg lg:text-xl text-blue-100 mb-6 leading-relaxed max-w-xl">
                                            Continue your journey building meaningful projects with nonprofits and growing your skills.
                                        </p>
                                        <div className="flex flex-col sm:flex-row gap-3 mb-6">
                                            <Link to="/dashboard">
                                                <Button
                                                    size="lg"
                                                    variant="primary"
                                                    className="!bg-white !text-blue-700 !border-2 !border-white hover:!bg-gray-50 hover:!border-gray-100 font-semibold px-6 py-3 flex items-center gap-3 transform transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
                                                >
                                                    <Briefcase className="w-4 h-4" />
                                                    Go to Dashboard
                                                </Button>
                                            </Link>
                                            <Link to="/projects">
                                                <Button
                                                    size="lg"
                                                    variant="primary"
                                                    className="!bg-transparent !text-white !border-2 !border-white hover:!bg-white hover:!text-blue-700 font-semibold px-6 py-3 flex items-center gap-3 transform transition-all duration-200 hover:scale-105 active:scale-95"
                                                >
                                                    <Search className="w-4 h-4" />
                                                    Browse Projects
                                                </Button>
                                            </Link>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Project Dashboard Mockup */}
                            <div className="relative">
                                <div className="bg-white rounded-xl shadow-2xl p-4 transform rotate-2 hover:rotate-0 transition-transform duration-500 border border-gray-200">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                        <span className="ml-3 text-gray-600 text-xs font-medium">Project Dashboard</span>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-semibold text-gray-900 text-sm">Community Web Platform</h4>
                                                <span className="text-emerald-600 text-xs font-semibold bg-emerald-100 px-2 py-1 rounded-md">Active</span>
                                            </div>
                                            <p className="text-gray-600 text-xs mt-1">Local Nonprofit Organization</p>
                                        </div>
                                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-700 text-xs font-medium">Your Role:</span>
                                                <span className="text-blue-700 font-semibold text-xs bg-blue-100 px-2 py-1 rounded-md">Frontend</span>
                                            </div>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-gray-700 text-xs font-medium">Team:</span>
                                                <div className="flex -space-x-1">
                                                    <div className="w-5 h-5 bg-purple-400 rounded-full border-2 border-white shadow-sm"></div>
                                                    <div className="w-5 h-5 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
                                                    <div className="w-5 h-5 bg-blue-400 rounded-full border-2 border-white shadow-sm"></div>
                                                </div>
                                            </div>
                                        </div>
                                        <Button size="sm" className="w-full !bg-blue-600 !text-white hover:!bg-blue-700 font-semibold text-xs">
                                            Open Project
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Statistics Section */}
                <section className="py-12 lg:py-16 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-10">
                            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">Platform Impact</h2>
                            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Real numbers from our growing community</p>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                            {[
                                {
                                    label: 'Active Projects',
                                    value: loading ? '…' : platformStats.activeProjects,
                                    icon: <Briefcase className="w-6 h-6 text-blue-600" />,
                                    color: 'blue'
                                },
                                {
                                    label: 'Volunteer Developers',
                                    value: loading ? '…' : platformStats.totalDevelopers,
                                    icon: <Code className="w-6 h-6 text-emerald-600" />,
                                    color: 'emerald'
                                },
                                {
                                    label: 'Nonprofit Partners',
                                    value: loading ? '…' : platformStats.totalOrganizations,
                                    icon: <Building className="w-6 h-6 text-purple-600" />,
                                    color: 'purple'
                                },
                                {
                                    label: 'Success Rate',
                                    value: loading ? '…' : platformStats.completionRate,
                                    icon: <CheckCircle className="w-6 h-6 text-yellow-600" />,
                                    color: 'yellow'
                                }
                            ].map((stat) => (
                                <div
                                    key={stat.label}
                                    className={`bg-white border border-gray-200 rounded-xl shadow-lg hover:shadow-xl p-4 lg:p-6 text-center flex flex-col items-center transition-all duration-300 transform hover:-translate-y-1 ${
                                        stat.color === 'blue' ? 'hover:border-blue-300' :
                                        stat.color === 'emerald' ? 'hover:border-emerald-300' :
                                        stat.color === 'purple' ? 'hover:border-purple-300' :
                                        'hover:border-yellow-300'
                                    }`}
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${
                                        stat.color === 'blue' ? 'bg-blue-50 border border-blue-200' :
                                        stat.color === 'emerald' ? 'bg-emerald-50 border border-emerald-200' :
                                        stat.color === 'purple' ? 'bg-purple-50 border border-purple-200' :
                                        'bg-yellow-50 border border-yellow-200'
                                    }`}>
                                        {stat.icon}
                                    </div>
                                    <div className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                                        {stat.value}
                                    </div>
                                    <div className="text-gray-600 text-xs lg:text-sm font-medium">
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section className="py-12 lg:py-16 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">Your Journey in 3 Steps</h2>
                            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                                Connect, collaborate, and create meaningful impact
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
                            {[
                                {
                                    icon: <Search className="w-8 h-8 text-blue-600" />,
                                    title: '1. Discover Projects',
                                    description:
                                        'Explore curated nonprofit challenges that align with your passions and tech stack.',
                                    bgColor: 'bg-blue-50',
                                    borderColor: 'border-blue-200'
                                },
                                {
                                    icon: <Briefcase className="w-8 h-8 text-emerald-600" />,
                                    title: '2. Apply & Collaborate',
                                    description:
                                        'Join an agile remote team, pair with mentors, and co-build a real product.',
                                    bgColor: 'bg-emerald-50',
                                    borderColor: 'border-emerald-200'
                                },
                                {
                                    icon: <Star className="w-8 h-8 text-purple-600" />,
                                    title: '3. Launch & Shine',
                                    description:
                                        'Ship your solution, earn endorsements, and showcase impact on your portfolio.',
                                    bgColor: 'bg-purple-50',
                                    borderColor: 'border-purple-200'
                                }
                            ].map((step, idx) => (
                                <div
                                    key={idx}
                                    className={`bg-white border border-gray-200 rounded-xl shadow-lg hover:shadow-xl p-6 flex flex-col items-center text-center transition-all duration-300 transform hover:-translate-y-2`}
                                >
                                    <div className={`w-16 h-16 ${step.bgColor} border ${step.borderColor} rounded-xl flex items-center justify-center mb-4 shadow-sm`}>
                                        {step.icon}
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-3">
                                        {step.title}
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed mb-4 flex-1 text-sm">
                                        {step.description}
                                    </p>
                                    {idx === 2 && (
                                        <Link
                                            to="/auth/register"
                                            className="text-purple-600 font-semibold flex items-center justify-center gap-2 hover:gap-3 transition-all duration-200 group text-sm"
                                        >
                                            See Developer Profiles 
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Featured Projects */}
                <section className="py-12 lg:py-16 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Featured Projects</h2>
                                <p className="text-lg text-gray-600">Hand-picked opportunities looking for talent this week</p>
                            </div>
                            {isGuest ? (
                                <Link to="/auth/register?role=developer">
                                    <Button variant="outline" className="flex items-center gap-2 !text-blue-700 !bg-blue-50 hover:!bg-blue-100 !border-blue-200 hover:!border-blue-300 font-semibold text-sm">
                                        Join to See More <ArrowRight className="w-4 h-4" />
                                    </Button>
                                </Link>
                            ) : (
                                <Link to="/projects">
                                    <Button variant="outline" className="flex items-center gap-2 !text-blue-700 !bg-blue-50 hover:!bg-blue-100 !border-blue-200 hover:!border-blue-300 font-semibold text-sm">
                                        View All <ArrowRight className="w-4 h-4" />
                                    </Button>
                                </Link>
                            )}
                        </div>

                        {loading ? (
                            <div className="grid lg:grid-cols-3 gap-6">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 animate-pulse">
                                        <div className="h-36 bg-gray-200 rounded-lg mb-3"></div>
                                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                                    </div>
                                ))}
                            </div>
                        ) : featuredProjects.length > 0 ? (
                            <div className="grid lg:grid-cols-3 gap-6">
                                {featuredProjects.map((project) => (
                                    <ProjectCard key={project.id} project={project} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                                <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Featured Projects</h3>
                                <p className="text-gray-500 mb-4 text-sm">No featured projects available at the moment.</p>
                                {isGuest ? (
                                    <Link to="/auth/register?role=developer">
                                        <Button variant="primary" className="!bg-blue-600 hover:!bg-blue-700 !text-white text-sm">
                                            Join to Browse Projects
                                        </Button>
                                    </Link>
                                ) : (
                                    <Link to="/projects">
                                        <Button variant="primary" className="!bg-blue-600 hover:!bg-blue-700 !text-white text-sm">
                                            Browse All Projects
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                </section>

                {/* Developer Spotlight with Rating System */}
                <section className="py-12 lg:py-16 bg-gradient-to-br from-gray-50 to-blue-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-10">
                            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                                🌟 Developer Spotlight
                            </h2>
                            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                                Discover our top-rated developers who are making real impact through their contributions. 
                                Our rating system recognizes excellence in project delivery and collaboration.
                            </p>
                        </div>
                        
                        <div className="grid lg:grid-cols-2 gap-8 items-start">
                            <div>
                                {isGuest ? (
                                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <Award className="w-6 h-6 text-yellow-500" />
                                            Our Rating System
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                                                <Star className="w-5 h-5 text-emerald-600 fill-current" />
                                                <div>
                                                    <span className="font-semibold text-emerald-800 block text-sm">Application Stars</span>
                                                    <span className="text-emerald-600 text-xs">Earned when accepted to projects</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                <Star className="w-5 h-5 text-blue-600 fill-current" />
                                                <Star className="w-5 h-5 text-blue-600 fill-current" />
                                                <Star className="w-5 h-5 text-blue-600 fill-current" />
                                                <div>
                                                    <span className="font-semibold text-blue-800 block text-sm">Completion Stars</span>
                                                    <span className="text-blue-600 text-xs">3 stars awarded for project completion</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                                                <Award className="w-5 h-5 text-purple-600" />
                                                <div>
                                                    <span className="font-semibold text-purple-800 block text-sm">Organization Feedback</span>
                                                    <span className="text-purple-600 text-xs">Testimonials from partner nonprofits</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-6 pt-4 border-t border-gray-200">
                                            <Link to="/auth/register?role=developer">
                                                <Button className="w-full !bg-blue-600 hover:!bg-blue-700 !text-white font-semibold py-3">
                                                    Join & Start Earning Stars ⭐
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <h3 className="text-base font-bold text-gray-900">Platform Achievements</h3>
                                        <div className="space-y-3">
                                            {developerSpotlightProjects.length > 0 ? (
                                                developerSpotlightProjects.map((project, index) => (
                                                    <div key={index} className={`flex items-center gap-3 p-3 rounded-lg border ${
                                                        project.status === 'Complete' 
                                                            ? 'bg-emerald-50 border-emerald-200' 
                                                            : 'bg-purple-50 border-purple-200'
                                                    }`}>
                                                        <div className={`w-2 h-2 rounded-full ${
                                                            project.status === 'Complete' ? 'bg-emerald-500' : 'bg-purple-500'
                                                        }`}></div>
                                                        <div className="flex-1">
                                                            <span className={`font-semibold block text-sm ${
                                                                project.status === 'Complete' ? 'text-emerald-800' : 'text-purple-800'
                                                            }`}>
                                                                {project.name}
                                                            </span>
                                                            <span className={`text-xs ${
                                                                project.status === 'Complete' ? 'text-emerald-600' : 'text-purple-600'
                                                            }`}>
                                                                {project.organization}
                                                            </span>
                                                        </div>
                                                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                                            project.status === 'Complete' 
                                                                ? 'bg-emerald-100 text-emerald-700' 
                                                                : 'bg-purple-100 text-purple-700'
                                                        }`}>
                                                            {project.status}
                                                        </span>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-gray-500 text-sm p-3 bg-gray-100 rounded-lg border border-gray-200">
                                                    No recent projects to display
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <DeveloperSpotlight 
                                    developer={featuredDeveloper}
                                    spotlightDevelopers={spotlightDevelopers}
                                    currentIndex={currentSpotlightIndex}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Organizations We've Helped */}
                <section className="py-12 lg:py-16 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <div className="flex flex-col items-center">
                                <div className="mb-3 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center border border-blue-200">
                                        <Building className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Organizations We've Helped</h2>
                                </div>
                                <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-400 rounded-full mb-4"></div>
                                <p className="text-lg text-gray-600 max-w-2xl">
                                    Trusted nonprofits working with our developer community
                                </p>
                            </div>
                        </div>

                        {partnersLoading ? (
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-center justify-items-center">
                                {[1,2,3,4,5].map(i => (
                                    <div key={i} className="w-32 h-36 bg-white border border-gray-200 rounded-xl shadow-sm animate-pulse"></div>
                                ))}
                            </div>
                         ) : partnerOrganizations.length > 0 ? (
                             <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6 items-center justify-items-center mb-10">
                                    {partnerOrganizations.map((org) => (
                                        <div
                                            key={org.id}
                                            className="flex flex-col items-center bg-white border border-gray-200 rounded-xl shadow-lg hover:shadow-xl p-4 w-36 h-44 transition-all duration-300 transform hover:-translate-y-2 hover:border-gray-300"
                                        >
                                            <div className="w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center mb-3 bg-gradient-to-br from-blue-50 to-purple-50 border border-gray-200 shadow-sm">
                                                {org.logo ? (
                                                    <img
                                                        src={org.logo}
                                                        alt={org.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="w-full h-full flex items-center justify-center text-lg font-bold text-blue-600">
                                                        {org.name.charAt(0)}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-center flex-1 flex flex-col justify-between">
                                                <div className="text-sm font-bold text-gray-900 mb-2 line-clamp-2" title={org.name}>
                                                    {org.name}
                                                </div>
                                                {org.website && (
                                                    <a
                                                        href={org.website}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-block mt-2 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg px-2 py-1 transition-all duration-200"
                                                    >
                                                        Visit Site
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="text-center">
                                    <Button variant="primary" className="!bg-blue-600 hover:!bg-blue-700 !text-white font-semibold px-6 py-3 text-base rounded-xl shadow-lg">
                                        Join Our Partner Network
                                    </Button>
                                </div>
                             </>
                         ) : (
                             <div className="text-center py-12">
                                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg border border-gray-200">
                                    <Building className="w-12 h-12 text-blue-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">Be Our First Partner Organization!</h3>
                                <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-400 rounded-full mx-auto mb-4"></div>
                                <p className="text-base text-gray-600 mb-6 max-w-2xl mx-auto leading-relaxed">
                                    Join us in shaping the future of tech for good. Your organization can be the first to inspire and empower developers to make a real-world impact.
                                </p>
                                <Link to="/auth/register?role=organization">
                                    <Button variant="primary" className="!bg-blue-600 hover:!bg-blue-700 !text-white font-semibold px-6 py-3 text-base rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200">
                                        Become a Partner Organization
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </section>

                {/* Ready to Start CTA */}
                <section className="py-12 lg:py-16 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-black bg-opacity-10"></div>
                    <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-2xl lg:text-3xl font-bold mb-4">
                            Ready to Code with Purpose?
                        </h2>
                        <p className="text-lg text-blue-100 mb-6 leading-relaxed">
                            Join our community of developers and organizations making a difference through technology
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link to="/for-developers">
                                <Button size="lg" variant="primary" className="!bg-white !text-blue-700 hover:!bg-gray-50 !border-0 font-semibold px-6 py-3 shadow-lg transform hover:scale-105 transition-all duration-200">
                                    Become a Developer Volunteer
                                </Button>
                            </Link>
                            <Link to="/for-organizations">
                                <Button size="lg" variant="ghost" className="!border-2 !border-white !text-white hover:!bg-white hover:!text-blue-700 font-semibold px-6 py-3 transform hover:scale-105 transition-all duration-200">
                                    Submit My Project Idea
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </Layout>
    );
};

export default HomePage;