import React from 'react';
import { Mail, Hourglass } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const SUPPORT_EMAIL = 'devtogether.help@gmail.com';

const PendingApprovalHeader: React.FC = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  return (
    <header className="w-full flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-50 to-yellow-50 border-b border-yellow-200 shadow-sm">
      <div className="flex items-center gap-2">
        <img src="/images/devtogether-icon.svg" alt="DevTogether" className="w-8 h-8" />
        <span className="font-bold text-lg text-blue-900 tracking-tight">DevTogether</span>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={signOut}
          className="text-gray-600 hover:text-red-600 font-medium px-3 py-1 rounded transition-colors hover:bg-red-50"
        >
          Sign Out
        </button>
      </div>
    </header>
  );
};

const PendingApprovalPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-yellow-50 via-white to-blue-100">
      <PendingApprovalHeader />
      <main className="flex flex-1 flex-col items-center justify-center px-4">
        <div className="bg-white/90 rounded-2xl shadow-2xl p-10 max-w-md w-full flex flex-col items-center border border-yellow-100">
          <Hourglass className="h-14 w-14 text-yellow-500 mb-5 animate-pulse drop-shadow-lg" />
          <h1 className="text-3xl font-extrabold mb-3 text-center text-blue-900 tracking-tight">Organization Pending Approval</h1>
          <p className="text-gray-700 text-center mb-5 text-lg leading-relaxed">
            Thank you for registering your organization!<br />
            Your account is <span className="font-semibold text-yellow-600">pending admin approval</span>.<br />
            Our team will review your registration soon.<br />
            You’ll receive an email and in-app notification once approved.
          </p>
          <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
            <Mail className="h-5 w-5" />
            <span>Need help? Contact us at <a href={`mailto:${SUPPORT_EMAIL}`} className="text-blue-600 underline">{SUPPORT_EMAIL}</a></span>
          </div>
          <div className="mt-4 text-xs text-gray-400 text-center">
            If you believe this is a mistake or need urgent access, please reach out.
          </div>
        </div>
      </main>
    </div>
  );
};

export default PendingApprovalPage; 