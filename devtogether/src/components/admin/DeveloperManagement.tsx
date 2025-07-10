import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import type { Profile } from '../../types/database';
import AdminTabHeader from './AdminTabHeader';

const DeveloperManagement: React.FC = () => {
  const { profile } = useAuth();
  const [developers, setDevelopers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDeveloper, setSelectedDeveloper] = useState<Profile | null>(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadDevelopers();
  }, []);

  const loadDevelopers = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await adminService.getAllDevelopers();
      if (error) throw error;
      setDevelopers(data || []);
    } catch (err) {
      setError('Failed to load developers');
    } finally {
      setLoading(false);
    }
  };

  const handleBlock = async () => {
    if (!selectedDeveloper || !blockReason.trim()) return;
    try {
      setIsProcessing(true);
      await adminService.blockDeveloper(selectedDeveloper.id, blockReason);
      await loadDevelopers();
      setShowBlockModal(false);
      setSelectedDeveloper(null);
      setBlockReason('');
    } catch (err) {
      setError('Failed to block developer');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnblock = async (developerId: string) => {
    try {
      setIsProcessing(true);
      await adminService.unblockDeveloper(developerId);
      await loadDevelopers();
    } catch (err) {
      setError('Failed to unblock developer');
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredDevelopers = developers.filter(dev =>
    (dev.first_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (dev.last_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    dev.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: developers.length,
    active: developers.filter(d => !d.blocked).length,
    blocked: developers.filter(d => d.blocked).length,
  };

  const statArray = [
    { label: 'Total', value: stats.total, color: 'bg-blue-50' },
    { label: 'Active', value: stats.active, color: 'bg-green-50' },
    { label: 'Blocked', value: stats.blocked, color: 'bg-red-50' },
  ];

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  if (loading) {
    return <div className="p-6">Loading developers...</div>;
  }
  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <AdminTabHeader
        title="Developers"
        searchPlaceholder="Search developers..."
        onSearch={handleSearch}
        stats={statArray}
      />
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredDevelopers.map((dev) => (
              <tr key={dev.id} className={dev.blocked ? 'bg-red-50' : ''}>
                <td className="px-4 py-2 whitespace-nowrap">{(dev.first_name || '')} {(dev.last_name || '')}</td>
                <td className="px-4 py-2 whitespace-nowrap">{dev.email}</td>
                <td className="px-4 py-2 whitespace-nowrap">
                  {dev.blocked ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Blocked</span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>
                  )}
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  {dev.blocked ? (
                    <Button onClick={() => handleUnblock(dev.id)} size="sm" disabled={isProcessing}>Unblock</Button>
                  ) : (
                    <Button onClick={() => { setSelectedDeveloper(dev); setShowBlockModal(true); }} size="sm" disabled={isProcessing}>Block</Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showBlockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto mx-2 sm:mx-0">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Block Developer</h2>
              <p className="text-sm text-gray-700 mb-4">Enter the reason for blocking this developer.</p>
            </div>
            <div className="p-4 sm:p-6">
              <textarea
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                rows={4}
                placeholder="Enter reason for blocking..."
              />
            </div>
            <div className="px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end gap-3">
                <Button
                  onClick={handleBlock}
                  className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto"
                  disabled={!blockReason.trim() || isProcessing}
                >
                  Confirm Block
                </Button>
                <Button
                  onClick={() => setShowBlockModal(false)}
                  variant="secondary"
                  disabled={isProcessing}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeveloperManagement; 