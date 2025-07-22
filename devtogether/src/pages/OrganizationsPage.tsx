import React, { useEffect, useState } from 'react'
import { Layout } from '../components/layout/Layout'
import { supabase } from '../utils/supabase'
import { ExternalLink, Building, Users, Globe, MapPin, Calendar, Heart, Sparkles, TrendingUp, Target, Award, Star, ChevronRight, Play, Code, Briefcase } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'

interface OrganizationProfile {
    id: string
    organization_name: string
    avatar_url?: string
    bio?: string
    website?: string
    location?: string
    created_at?: string
}

interface PlatformStats {
    totalOrganizations: number
    activeProjects: number
    developersConnected: number
    projectsCompleted: number
}

const MetricCard: React.FC<{ 
    icon: React.ElementType; 
    value: string; 
    label: string; 
    color: string;
}> = ({ icon: Icon, value, label, color }) => (
    <div className="group bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${color} group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
                <div className="text-2xl font-bold text-gray-900">{value}</div>
                <div className="text-sm text-gray-600">{label}</div>
            </div>
        </div>
    </div>
)

const PlaceholderCard: React.FC = () => (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 animate-pulse">
        <div className="flex flex-col items-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-gray-200"></div>
            <div className="space-y-2 text-center w-full">
                <div className="h-5 bg-gray-200 rounded w-3/4 mx-auto"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 mx-auto"></div>
            </div>
            <div className="w-full border-t border-gray-200 pt-4">
                <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto"></div>
            </div>
        </div>
    </div>
)

const OrgCard: React.FC<{ org: OrganizationProfile }> = ({ org }) => {
    const letter = org.organization_name?.charAt(0).toUpperCase() || 'O'
    const joinedDate = org.created_at ? new Date(org.created_at).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
    }) : null
    
    return (
        <div className="group bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-xl hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden">
            {/* Background gradient effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="relative z-10 flex flex-col items-center space-y-6 text-center">
                {/* Enhanced Avatar */}
                <div className="relative">
                    {org.avatar_url ? (
                        <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-gray-100 group-hover:ring-blue-200 transition-all duration-300">
                            <img
                                src={org.avatar_url}
                                alt={org.organization_name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                        </div>
                    ) : (
                        <div className="w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-600 text-white font-bold text-2xl ring-4 ring-gray-100 group-hover:ring-blue-200 group-hover:scale-110 transition-all duration-300 shadow-lg">
                            {letter}
                        </div>
                    )}
                    
                    {/* Verified badge */}
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center ring-3 ring-white">
                        <Award className="w-4 h-4 text-white" />
                    </div>
                </div>

                {/* Organization Info */}
                <div className="space-y-3 flex-1">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors duration-300">
                        {org.organization_name}
                    </h3>
                    
                    {org.bio && (
                        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 max-w-xs">
                            {org.bio}
                        </p>
                    )}

                    {/* Location and Join Date */}
                    <div className="flex flex-col items-center gap-2 text-xs text-gray-500">
                        {org.location && (
                            <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span>{org.location}</span>
                            </div>
                        )}
                        {joinedDate && (
                            <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>Joined {joinedDate}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="w-full pt-4 border-t border-gray-100 group-hover:border-blue-200 transition-colors duration-300">
                    <div className="flex flex-col gap-3">
                        {org.website && (
                            <a
                                href={org.website.startsWith('http') ? org.website : `https://${org.website}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all duration-200 group-hover:scale-105"
                            >
                                <Globe className="w-4 h-4" />
                                Visit Website
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        )}
                        
                        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                            <Heart className="w-3 h-3 text-red-400" />
                            <span>Making a difference</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const OrganizationsPage: React.FC = () => {
    const [orgs, setOrgs] = useState<OrganizationProfile[]>([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<PlatformStats>({
        totalOrganizations: 0,
        activeProjects: 0,
        developersConnected: 0,
        projectsCompleted: 0
    })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            // Fetch organizations
            const { data: orgsData, error: orgsError } = await supabase
                .from('profiles')
                .select('id, organization_name, avatar_url, bio, website, location, created_at')
                .eq('role', 'organization')
                .eq('is_public', true)
                .eq('organization_status', 'approved')
                .order('organization_name', { ascending: true })

            if (orgsError) throw orgsError

            // Fetch platform statistics
            const [projectsData, developersData] = await Promise.all([
                supabase
                    .from('projects')
                    .select('id, status')
                    .in('status', ['open', 'in_progress', 'completed']),
                supabase
                    .from('profiles')
                    .select('id')
                    .eq('role', 'developer')
            ])

            const organizations = (orgsData || []) as OrganizationProfile[]
            const projects = projectsData.data || []
            const developers = developersData.data || []

            setOrgs(organizations)
            setStats({
                totalOrganizations: organizations.length,
                activeProjects: projects.filter((p: any) => ['open', 'in_progress'].includes(p.status)).length,
                developersConnected: developers.length,
                projectsCompleted: projects.filter((p: any) => p.status === 'completed').length
            })
        } catch (err) {
            console.error('Error loading organizations:', err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
                {/* Enhanced Hero Section */}
                <section className="relative bg-gradient-to-br from-blue-600 via-purple-700 to-indigo-800 text-white overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.08%22%3E%3Ccircle%20cx%3D%227%22%20cy%3D%227%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
                    
                    {/* Floating Elements */}
                    <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                    <div className="absolute top-40 right-20 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                    <div className="absolute -bottom-8 left-40 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

                    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                        <div className="text-center space-y-8">
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                                <Building className="w-5 h-5" />
                                <span className="font-semibold">Partner Organizations</span>
                                <Sparkles className="w-4 h-4" />
                            </div>

                            {/* Main Heading */}
                            <div className="space-y-4">
                                <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                                    Mission-Driven
                                    <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                                        Organizations
                                    </span>
                                </h1>
                                <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                                    Discover amazing nonprofits and social impact organizations collaborating with developers to create positive change in the world.
                                </p>
                            </div>


                        </div>
                    </div>
                </section>

                {/* Platform Statistics */}
                <section className="relative -mt-16 z-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            <MetricCard
                                icon={Building}
                                value={stats.totalOrganizations.toString()}
                                label="Partner Organizations"
                                color="bg-gradient-to-br from-blue-500 to-blue-600"
                            />
                            <MetricCard
                                icon={Briefcase}
                                value={stats.activeProjects.toString()}
                                label="Active Projects"
                                color="bg-gradient-to-br from-green-500 to-green-600"
                            />
                            <MetricCard
                                icon={Users}
                                value={stats.developersConnected.toString()}
                                label="Connected Developers"
                                color="bg-gradient-to-br from-purple-500 to-purple-600"
                            />
                            <MetricCard
                                icon={Award}
                                value={stats.projectsCompleted.toString()}
                                label="Projects Completed"
                                color="bg-gradient-to-br from-orange-500 to-orange-600"
                            />
                        </div>
                    </div>
                </section>

                {/* Organizations Grid */}
                <section className="py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-semibold text-sm mb-6">
                                <Target className="w-4 h-4" />
                                Making Impact Together
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                Organizations You Can Support
                            </h2>
                            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                Browse through our verified partner organizations and discover how your skills can make a real difference in causes you care about.
                            </p>
                        </div>

                        {loading ? (
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                {Array.from({ length: 8 }).map((_, idx) => (
                                    <PlaceholderCard key={idx} />
                                ))}
                            </div>
                        ) : orgs.length === 0 ? (
                            <div className="text-center py-20">
                                <div className="max-w-md mx-auto space-y-6">
                                    <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto">
                                        <Building className="w-12 h-12 text-gray-500" />
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="text-xl font-semibold text-gray-900">
                                            Be the First Organization
                                        </h3>
                                        <p className="text-gray-600">
                                            Join our platform and connect with talented developers ready to support your mission.
                                        </p>
                                    </div>
                                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                                        <p className="text-blue-700 text-sm">
                                            Organizations will appear here once they join and make their profiles public.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                    {orgs.map((org) => (
                                        <OrgCard key={org.id} org={org} />
                                    ))}
                                </div>

                                {/* Results Summary */}
                                <div className="text-center mt-16 p-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100">
                                    <div className="flex items-center justify-center gap-2 mb-4">
                                        <TrendingUp className="w-5 h-5 text-blue-600" />
                                        <span className="font-semibold text-blue-700">Growing Community</span>
                                    </div>
                                    <p className="text-gray-700 text-lg">
                                        <strong>{orgs.length}</strong> verified organizations are actively seeking developer partnerships
                                    </p>
                                    <p className="text-sm text-gray-600 mt-2">
                                        Join the movement and help create meaningful impact through technology
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </section>


            </div>
        </Layout>
    )
}

export default OrganizationsPage 