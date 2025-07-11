import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import type { Profile } from '../types/database';
import { Button } from '../components/ui/Button';

const BlockedPage: React.FC = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const userProfile = profile as Profile | null;

  // Determine if user is blocked (developer or org)
  const isBlocked = userProfile && (
    (userProfile.role === 'developer' && userProfile.blocked) ||
    (userProfile.role === 'organization' && (userProfile.organization_status === 'blocked' || userProfile.blocked))
  );

  if (!isBlocked) {
    navigate('/');
    return null;
  }

  // Prefer blocked_reason, fallback to org rejection reason
  const reason = userProfile.blocked_reason || userProfile.organization_rejection_reason || 'Your account has been permanently blocked by an administrator.';
  const title = userProfile.role === 'organization' ? 'Organization Blocked' : 'Account Blocked';
  const description = userProfile.role === 'organization'
    ? 'Your organization has been permanently blocked and cannot access the platform.'
    : 'Your account has been permanently blocked and cannot access the platform.';

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-lg w-full bg-white dark:bg-gray-800 rounded-lg shadow p-8 flex flex-col items-center">
        <svg className="w-16 h-16 text-red-600 mb-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
          <line x1="8" y1="8" x2="16" y2="16" stroke="currentColor" strokeWidth="2" />
          <line x1="16" y1="8" x2="8" y2="16" stroke="currentColor" strokeWidth="2" />
        </svg>
        <h1 className="text-2xl font-bold text-red-700 mb-2 text-center">{title}</h1>
        <p className="mb-4 text-gray-700 dark:text-gray-200 text-center">{description}</p>
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900 rounded border border-red-200 dark:border-red-700 w-full text-center">
          <span className="font-semibold">Reason:</span>
          <div className="mt-1 text-red-700 dark:text-red-200">{reason}</div>
        </div>
        <Button onClick={handleSignOut} className="w-full mb-4" variant="outline">
          Sign Out
        </Button>
        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400 w-full">
          Need help? Contact <a href="mailto:devtogether.help@gmail.com" className="underline">devtogether.help@gmail.com</a>
        </div>
      </div>
    </div>
  );
};

export default BlockedPage; 