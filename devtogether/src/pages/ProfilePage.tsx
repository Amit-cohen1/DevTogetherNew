import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { AuthService } from '../services/auth'
import { Button } from '../components/ui/Button'
import { Layout } from '../components/layout'
import {
    ProfileHeader,
    DeveloperProfile,
    OrganizationProfile,
    EditProfileModal
} from '../components/profile'
import { User } from '../types/database'
import { Loader2, AlertCircle } from 'lucide-react'

const ProfilePage: React.FC = () => {
    const { userId } = useParams<{ userId: string }>()
    const navigate = useNavigate()
    const { user: currentUser, profile: currentProfile } = useAuth()

    const [profile, setProfile] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)

    // Determine if viewing own profile
    const isOwnProfile = !userId || userId === currentUser?.id

    useEffect(() => {
        const loadProfile = async () => {
            try {
                setLoading(true)
                setError(null)

                if (isOwnProfile) {
                    // Use current user's profile from context
                    if (currentProfile) {
                        setProfile(currentProfile)
                    } else {
                        setError('Profile not found')
                    }
                } else {
                    // Load external user profile
                    const { profile: userProfile, error: profileError } = await AuthService.getUserProfile(userId!)

                    if (profileError) {
                        setError(profileError.message)
                    } else {
                        setProfile(userProfile)
                    }
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load profile')
            } finally {
                setLoading(false)
            }
        }

        loadProfile()
    }, [userId, currentProfile, isOwnProfile])

    const handleProfileUpdate = (updatedProfile: User) => {
        setProfile(updatedProfile)
        setIsEditModalOpen(false)
    }

    if (loading) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="flex items-center gap-3 text-gray-600">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span>Loading profile...</span>
                    </div>
                </div>
            </Layout>
        )
    }

    if (error || !profile) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Not Found</h2>
                        <p className="text-gray-600 mb-6">
                            {error || 'The profile you\'re looking for doesn\'t exist.'}
                        </p>
                        <Button
                            onClick={() => navigate('/')}
                            variant="primary"
                        >
                            Go Home
                        </Button>
                    </div>
                </div>
            </Layout>
        )
    }

    return (
        <Layout className="bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Profile Header */}
                <ProfileHeader
                    profile={profile}
                    isOwnProfile={isOwnProfile}
                    onEditClick={() => setIsEditModalOpen(true)}
                />

                {/* Profile Content */}
                <div className="mt-8">
                    {(profile.role === 'developer' || profile.role === 'admin') ? (
                        <DeveloperProfile profile={profile} isOwnProfile={isOwnProfile} />
                    ) : (
                        <OrganizationProfile profile={profile} isOwnProfile={isOwnProfile} />
                    )}
                </div>
            </div>

            {/* Edit Profile Modal */}
            {isEditModalOpen && (
                <EditProfileModal
                    profile={profile}
                    onClose={() => setIsEditModalOpen(false)}
                    onSave={handleProfileUpdate}
                />
            )}
        </Layout>
    )
}

export default ProfilePage 