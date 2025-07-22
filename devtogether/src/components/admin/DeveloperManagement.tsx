import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import type { Profile } from '../../types/database';
import AdminTabHeader from './AdminTabHeader';
import { AdminDeletionButton } from './AdminDeletionButton';
import { Crown, Shield, User, CheckCircle } from 'lucide-react';

// User Management Component - Manages developers and admin role promotions
// Only hananel12345@gmail.com can promote developers to admin or demote admins
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
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');
  const [promotingUserId, setPromotingUserId] = useState<string | null>(null);

  useEffect(() => {
    loadDevelopers();
  }, []);

  const loadDevelopers = async () => {
    try {
      setLoading(true);
      setError(null);
      // Get both developers and admins for role management
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
      console.log('Attempting to block developer:', selectedDeveloper, 'Reason:', blockReason);
      await adminService.blockDeveloper(selectedDeveloper.id, blockReason);
      console.log('Block developer call succeeded');
      await loadDevelopers();
      setShowBlockModal(false);
      setSelectedDeveloper(null);
      setBlockReason('');
    } catch (err) {
      console.error('Error blocking developer:', err);
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

  // Role promotion handlers - only for hananel12345@gmail.com
  const canPromoteUsers = profile?.email === 'hananel12345@gmail.com';

  const handlePromoteToAdmin = async (userId: string) => {
    if (!canPromoteUsers) {
      setError('Only the main administrator can promote users to admin');
      return;
    }

    const developer = developers.find(d => d.id === userId);
    
    // Only allow promoting developers to admin, not organizations
    if (developer?.role !== 'developer') {
      setError('Only developers can be promoted to admin');
      return;
    }

    const userName = `${developer?.first_name || ''} ${developer?.last_name || ''}`.trim() || developer?.email;
    
    const confirmed = window.confirm(
      `Are you sure you want to promote "${userName}" to Admin?\n\n` +
      `This will give them full administrative access to the platform, including the ability to:\n` +
      `• Approve/reject organizations and projects\n` +
      `• Block/unblock users\n` +
      `• Access all platform data\n\n` +
      `This action should only be done for trusted users.`
    );
    
    if (!confirmed) return;
    
    try {
      setPromotingUserId(userId);
      await adminService.grantAdminAccess(userId);
      await loadDevelopers();
    } catch (err) {
      console.error('Error promoting to admin:', err);
      setError('Failed to promote user to admin');
    } finally {
      setPromotingUserId(null);
    }
  };

  const handleDemoteFromAdmin = async (userId: string) => {
    if (!canPromoteUsers) {
      setError('Only the main administrator can demote admin users');
      return;
    }

    // Prevent demoting yourself
    if (userId === profile?.id) {
      setError('You cannot demote yourself from admin');
      return;
    }

    const admin = developers.find(d => d.id === userId);
    const userName = `${admin?.first_name || ''} ${admin?.last_name || ''}`.trim() || admin?.email;
    
    const confirmed = window.confirm(
      `Are you sure you want to demote "${userName}" from Admin to Developer?\n\n` +
      `This will remove their administrative access and they will only have developer permissions.`
    );
    
    if (!confirmed) return;
    
    try {
      setPromotingUserId(userId);
      await adminService.revokeAdminAccess(userId);
      await loadDevelopers();
    } catch (err) {
      console.error('Error demoting from admin:', err);
      setError('Failed to demote user from admin');
    } finally {
      setPromotingUserId(null);
    }
  };

  const filteredDevelopers = developers.filter(dev => {
    const matchesSearch = (dev.first_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dev.last_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      dev.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter === 'active') {
      matchesStatus = !dev.blocked;
    } else if (statusFilter === 'blocked') {
      matchesStatus = !!dev.blocked;
    }
    // statusFilter === 'all' shows everything
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: developers.length,
    active: developers.filter(d => !d.blocked).length,
    blocked: developers.filter(d => d.blocked).length,
    developers: developers.filter(d => d.role === 'developer').length,
    admins: developers.filter(d => d.role === 'admin').length,
  };

  const statArray = [
    { label: 'Total', value: stats.total, color: 'bg-blue-50' },
    { label: 'Developers', value: stats.developers, color: 'bg-blue-50' },
    { label: 'Admins', value: stats.admins, color: 'bg-purple-50' },
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
      {!canPromoteUsers && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-start">
            <Crown className="h-5 w-5 text-blue-400 mt-0.5 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-blue-800">Admin Role Management</h3>
              <p className="mt-1 text-sm text-blue-700">
                Only the main administrator (hananel12345@gmail.com) can promote developers to admin or demote admins. 
                You can still block/unblock and delete users.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <AdminTabHeader
        title={`User Management ${canPromoteUsers ? '👑' : ''}`}
        searchPlaceholder="Search users..."
        onSearch={handleSearch}
        stats={statArray}
      >
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
          {[
            { value: 'all', label: 'All', color: 'bg-gray-100 text-gray-800' },
            { value: 'active', label: 'Active', color: 'bg-green-100 text-green-800' },
            { value: 'blocked', label: 'Blocked', color: 'bg-red-100 text-red-800' }
          ].map((status) => {
            const count = status.value === 'all' ? stats.total : 
                         status.value === 'active' ? stats.active : stats.blocked;
            const isActive = statusFilter === status.value;
            return (
              <button
                key={status.value}
                onClick={() => setStatusFilter(status.value as 'all' | 'active' | 'blocked')}
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  isActive 
                    ? status.color + ' ring-2 ring-blue-500 ring-opacity-30' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status.label} ({count})
              </button>
            );
          })}
        </div>
      </AdminTabHeader>
      {/* Mobile-First Card Layout */}
      <div className="space-y-4">
        {filteredDevelopers.map((dev) => (
          <div 
            key={dev.id} 
            className={`bg-white rounded-lg border p-4 shadow-sm hover:shadow-md transition-all duration-200 ${
              dev.blocked ? 'border-red-200 bg-red-50' : 'border-gray-200'
            }`}
          >
            {/* Header with Name and Role */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {(dev.first_name || '') + ' ' + (dev.last_name || '') || 'Unnamed User'}
                </h3>
                <p className="text-sm text-gray-600 truncate">{dev.email}</p>
              </div>
              
              {/* Status Badge */}
              <div className="ml-4 flex-shrink-0">
                {dev.blocked ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                    Blocked
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Active
                  </span>
                )}
              </div>
            </div>

            {/* Role Section */}
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {dev.role === 'admin' ? (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                      <Crown className="w-4 h-4 mr-2" />
                      Administrator
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      <User className="w-4 h-4 mr-2" />
                      Developer
                    </span>
                  )}
                </div>
                
                {/* Role Management Button */}
                {canPromoteUsers && dev.id !== profile?.id && (
                  <button
                    onClick={() => dev.role === 'admin' ? handleDemoteFromAdmin(dev.id) : handlePromoteToAdmin(dev.id)}
                    disabled={promotingUserId === dev.id}
                    className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border transition-colors ${
                      dev.role === 'admin' 
                        ? 'text-orange-700 border-orange-300 bg-orange-50 hover:bg-orange-100' 
                        : 'text-purple-700 border-purple-300 bg-purple-50 hover:bg-purple-100'
                    }`}
                  >
                    {promotingUserId === dev.id ? (
                      <>
                        <div className="w-4 h-4 mr-2 animate-spin border-2 border-current border-t-transparent rounded-full"></div>
                        Updating...
                      </>
                    ) : dev.role === 'admin' ? (
                      <>
                        <Shield className="w-4 h-4 mr-2" />
                        Demote to Developer
                      </>
                    ) : (
                      <>
                        <Crown className="w-4 h-4 mr-2" />
                        Promote to Admin
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              {dev.blocked ? (
                <Button 
                  onClick={() => handleUnblock(dev.id)} 
                  disabled={isProcessing}
                  className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white border-0 justify-center"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Unblock User
                </Button>
              ) : (
                <Button 
                  onClick={() => { setSelectedDeveloper(dev); setShowBlockModal(true); }} 
                  disabled={isProcessing}
                  className="flex-1 sm:flex-none bg-amber-500 hover:bg-amber-600 text-white border-0 justify-center"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Block User
                </Button>
              )}
              
              <AdminDeletionButton
                targetId={dev.id}
                targetType="developer"
                targetName={`${dev.first_name || ''} ${dev.last_name || ''}`.trim() || dev.email}
                onDeleteSuccess={loadDevelopers}
                className="flex-1 sm:flex-none justify-center"
              />
            </div>
          </div>
        ))}
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
              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                <Button
                  onClick={() => setShowBlockModal(false)}
                  variant="secondary"
                  disabled={isProcessing}
                  className="w-full sm:w-auto order-2 sm:order-1 border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBlock}
                  className="w-full sm:w-auto order-1 sm:order-2 bg-amber-500 hover:bg-amber-600 text-white border-0"
                  disabled={!blockReason.trim() || isProcessing}
                >
                  Confirm Block
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