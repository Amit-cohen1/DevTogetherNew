import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { resubmitOrganization } from '../services/organizationProfileService';
import { useNavigate } from 'react-router-dom';
import type { Profile } from '../types/database';

const RejectedOrganizationPage: React.FC = () => {
  const { profile, updateProfile } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // Type assertion to Profile to access new fields
  const orgProfile = profile as Profile | null;

  // Move all useState hooks to the top, before any early return
  const [organizationName, setOrganizationName] = useState(orgProfile?.organization_name || '');
  const [bio, setBio] = useState(orgProfile?.bio || '');
  const [website, setWebsite] = useState(orgProfile?.website || '');
  const [location, setLocation] = useState(orgProfile?.location || '');

  if (!orgProfile || orgProfile.role !== 'organization' || orgProfile.organization_status !== 'rejected') {
    navigate('/');
    return null;
  }

  const canResubmit = orgProfile.can_resubmit !== false;
  const reason = orgProfile.organization_rejection_reason || 'No reason provided.';

  const handleResubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const updatedData = {
      organization_name: organizationName,
      bio,
      website,
      location,
    };
    const ok = await resubmitOrganization(orgProfile.id, updatedData);
    setSubmitting(false);
    if (ok) {
      setSuccess(true);
      updateProfile && updateProfile({ organization_status: 'pending', organization_rejection_reason: null, organization_name: organizationName, bio, website, location } as Partial<Profile>);
    } else {
      setError('Failed to resubmit. Please try again or contact support.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-lg w-full bg-white dark:bg-gray-800 rounded-lg shadow p-6 sm:p-8 flex flex-col items-center">
        <svg className="w-16 h-16 text-yellow-500 mb-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
          <line x1="8" y1="8" x2="16" y2="16" stroke="currentColor" strokeWidth="2" />
          <line x1="16" y1="8" x2="8" y2="16" stroke="currentColor" strokeWidth="2" />
        </svg>
        <h1 className="text-2xl font-bold text-yellow-700 mb-2 text-center">Organization Registration Rejected</h1>
        <p className="mb-4 text-gray-700 dark:text-gray-200 text-center">Your organization registration was rejected by an administrator.</p>
        <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900 rounded border border-yellow-200 dark:border-yellow-700 w-full text-center">
          <span className="font-semibold">Reason:</span>
          <div className="mt-1 text-yellow-700 dark:text-yellow-200">{reason}</div>
        </div>
        {canResubmit && !success && (
          <form className="w-full" onSubmit={handleResubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Organization Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
                value={organizationName}
                onChange={e => setOrganizationName(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Bio</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
                value={bio}
                onChange={e => setBio(e.target.value)}
                rows={3}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Location</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="City, State/Country"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Website</label>
              <input
                type="url"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
                value={website}
                onChange={e => setWebsite(e.target.value)}
                placeholder="https://yourorganization.org"
              />
            </div>
            <button
              className="mt-2 px-6 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 w-full sm:w-auto"
              type="submit"
              disabled={submitting}
            >
              {submitting ? 'Resubmitting...' : 'Resubmit for Review'}
            </button>
          </form>
        )}
        {success && (
          <div className="mt-4 text-green-600 text-center w-full">Resubmission sent! We will review your organization again soon.</div>
        )}
        {error && (
          <div className="mt-4 text-red-600 text-center w-full">{error}</div>
        )}
        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400 w-full">
          Need help? Contact <a href="mailto:devtogether.help@gmail.com" className="underline">devtogether.help@gmail.com</a>
        </div>
      </div>
    </div>
  );
};

export default RejectedOrganizationPage; 