import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, FileText, User, Building } from 'lucide-react';

const QuickActionsBar: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-white border border-gray-200 shadow-lg rounded-full px-6 py-3 flex gap-6 md:hidden z-50">
      <button
        aria-label="Browse Projects"
        onClick={() => navigate('/projects')}
        className="text-gray-600 hover:text-blue-600"
      >
        <Briefcase className="w-6 h-6" />
      </button>
      <button
        aria-label="My Projects"
        onClick={() => navigate('/my-projects')}
        className="text-gray-600 hover:text-blue-600"
      >
        <Building className="w-6 h-6" />
      </button>
      <button
        aria-label="My Applications"
        onClick={() => navigate('/my-applications')}
        className="text-gray-600 hover:text-blue-600"
      >
        <FileText className="w-6 h-6" />
      </button>
      <button
        aria-label="Profile"
        onClick={() => navigate('/profile')}
        className="text-gray-600 hover:text-blue-600"
      >
        <User className="w-6 h-6" />
      </button>
    </div>
  );
};

export default QuickActionsBar; 