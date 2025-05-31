import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import DeveloperDashboard from '../components/dashboard/DeveloperDashboard';
import OrganizationDashboard from '../components/dashboard/OrganizationDashboard';
import { Layout } from '../components/layout/Layout';

const DashboardPage: React.FC = () => {
    const { profile, loading } = useAuth();

    if (loading) {
        return (
            <Layout>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    // Developer Dashboard
    if (profile?.role === 'developer') {
        return (
            <Layout>
                <DeveloperDashboard />
            </Layout>
        );
    }

    // Organization Dashboard
    if (profile?.role === 'organization') {
        return (
            <Layout>
                <OrganizationDashboard />
            </Layout>
        );
    }

    // Fallback if no role is set
    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to DevTogether</h2>
                    <p className="text-gray-700 mb-4">
                        Please complete your profile setup to access your personalized dashboard.
                    </p>
                </div>
            </div>
        </Layout>
    );
};

export default DashboardPage; 