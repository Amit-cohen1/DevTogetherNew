import React from 'react';
import { Mail, Hourglass } from 'lucide-react';

const SUPPORT_EMAIL = 'support@devtogether.com'; // Update if needed

const PendingApprovalPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full flex flex-col items-center">
        <Hourglass className="h-12 w-12 text-yellow-500 mb-4 animate-pulse" />
        <h1 className="text-2xl font-bold mb-2 text-center">Organization Pending Approval</h1>
        <p className="text-gray-700 text-center mb-4">
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
    </div>
  );
};

export default PendingApprovalPage; 