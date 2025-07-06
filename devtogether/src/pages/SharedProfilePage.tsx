import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User } from '../types/database';
import { profileService } from '../services/profileService';
import {
    ProfileHeader,
    DeveloperProfile,
    OrganizationProfile
} from '../components/profile';
import { Layout } from '../components/layout';
import { Loader2, AlertCircle, Lock } from 'lucide-react';

const SharedProfilePage: React.FC = () => {
    const { shareToken } = useParams<{ shareToken: string }>();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!shareToken) {
            setError('Invalid share link');
            setLoading(false);
            return;
        }

        loadSharedProfile();
    }, [shareToken]);

    const loadSharedProfile = async () => {
        try {
            setLoading(true);
            setError(null);

            if (!shareToken) {
                throw new Error('Share token is required');
            }

            const profileData = await profileService.getProfileByShareToken(shareToken);

            if (!profileData) {
                setError('Profile not found or is private');
                return;
            }

            setProfile(profileData);
        } catch (error) {
            console.error('Error loading shared profile:', error);
            setError('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Layout className="bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        <span className="ml-2 text-gray-600">Loading profile...</span>
                    </div>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout className="bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                        <div className="text-center">
                            {error === 'Profile not found or is private' ? (
                                <>
                                    <Lock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                                        Profile Not Available
                                    </h2>
                                    <p className="text-gray-600 mb-6">
                                        This profile is either private or doesn't exist.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                                        Error Loading Profile
                                    </h2>
                                    <p className="text-gray-600 mb-6">
                                        We encountered an error while loading this profile.
                                    </p>
                                </>
                            )}

                            <button
                                onClick={() => navigate('/')}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                                Visit DevTogether
                            </button>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    if (!profile) {
        return null;
    }

    return (
        <Layout className="bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Profile Header */}
                <ProfileHeader
                    profile={profile}
                    isOwnProfile={false}
                    onEditClick={() => { }}
                />

                {/* Profile Content */}
                <div className="mt-8">
                    {(profile.role === 'developer' || profile.role === 'admin') ? (
                        <DeveloperProfile profile={profile} isOwnProfile={false} />
                    ) : (
                        <OrganizationProfile profile={profile} isOwnProfile={false} />
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default SharedProfilePage; 