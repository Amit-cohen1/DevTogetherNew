import React, { useEffect, useState } from 'react'
import { Layout } from '../components/layout/Layout'
import { supabase } from '../utils/supabase'
import { ExternalLink, Building } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'

interface OrganizationProfile {
    id: string
    organization_name: string
    avatar_url?: string
    bio?: string
    website?: string
}

const PlaceholderCard: React.FC = () => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 animate-pulse">
        <div className="w-20 h-20 rounded-full bg-gray-200 mb-4 mx-auto"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
    </div>
)

const OrgCard: React.FC<{ org: OrganizationProfile }> = ({ org }) => {
    const letter = org.organization_name?.charAt(0).toUpperCase() || 'O'
    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex flex-col">
            {org.avatar_url ? (
                <img
                    src={org.avatar_url}
                    alt={org.organization_name}
                    className="w-20 h-20 rounded-full mx-auto object-cover mb-4"
                />
            ) : (
                <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-4 bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-3xl">
                    {letter}
                </div>
            )}
            <h3 className="text-lg font-semibold text-center text-gray-900 mb-2">
                {org.organization_name}
            </h3>
            {org.bio && (
                <p className="text-sm text-gray-600 text-center line-clamp-3 mb-4">
                    {org.bio}
                </p>
            )}
            <div className="mt-auto flex justify-center">
                {org.website && (
                    <a
                        href={org.website.startsWith('http') ? org.website : `https://${org.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                        <ExternalLink className="w-4 h-4" /> Website
                    </a>
                )}
            </div>
        </div>
    )
}

const OrganizationsPage: React.FC = () => {
    const [orgs, setOrgs] = useState<OrganizationProfile[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchOrgs = async () => {
            setLoading(true)
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('id, organization_name, avatar_url, bio, website')
                    .eq('role', 'organization')
                    .eq('is_public', true)
                    .order('organization_name', { ascending: true })

                if (error) throw error
                setOrgs((data || []) as OrganizationProfile[])
            } catch (err) {
                console.error('Error loading organizations', err)
            } finally {
                setLoading(false)
            }
        }

        fetchOrgs()
    }, [])

    return (
        <Layout>
            <section className="py-16 bg-white min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-600 rounded-full font-semibold text-sm mb-4">
                            <Building className="w-4 h-4 mr-2" />
                            Partner Organizations
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                            Our Mission-Driven Partners
                        </h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto mt-4">
                            Explore the nonprofits collaborating with developers to create real-world impact.
                        </p>
                    </div>

                    {loading ? (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {Array.from({ length: 6 }).map((_, idx) => (
                                <PlaceholderCard key={idx} />
                            ))}
                        </div>
                    ) : orgs.length === 0 ? (
                        <div className="text-center text-gray-600">
                            <p className="mb-4">No organizations are public yet.</p>
                            <Link to="/for-organizations">
                                <Button>Be the first Organization</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {orgs.map((org) => (
                                <OrgCard key={org.id} org={org} />
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </Layout>
    )
}

export default OrganizationsPage 