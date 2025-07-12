import toast from 'react-hot-toast';
import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export type UserRole = 'organization' | 'developer' | 'admin';

interface ToastOptions {
  duration?: number;
  icon?: string;
}

// Custom Toast Component with Close Button and Modern Design
interface CustomToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onDismiss: () => void;
  visible: boolean;
}

const CustomToast: React.FC<CustomToastProps> = ({ message, type, onDismiss, visible }) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-white',
          border: 'border-l-4 border-l-green-500',
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          icon: CheckCircle,
        };
      case 'error':
        return {
          bg: 'bg-white',
          border: 'border-l-4 border-l-red-500',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          icon: XCircle,
        };
      case 'warning':
        return {
          bg: 'bg-white',
          border: 'border-l-4 border-l-amber-500',
          iconBg: 'bg-amber-100',
          iconColor: 'text-amber-600',
          icon: AlertCircle,
        };
      case 'info':
        return {
          bg: 'bg-white',
          border: 'border-l-4 border-l-blue-500',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          icon: Info,
        };
      default:
        return {
          bg: 'bg-white',
          border: 'border-l-4 border-l-gray-500',
          iconBg: 'bg-gray-100',
          iconColor: 'text-gray-600',
          icon: Info,
        };
    }
  };

  const styles = getTypeStyles();
  const IconComponent = styles.icon;

  return (
    <div
      className={`
        ${visible ? 'animate-in slide-in-from-top-2 md:slide-in-from-right-2' : 'animate-out slide-out-to-top-2 md:slide-out-to-right-2'}
        ${styles.bg} ${styles.border}
        rounded-lg shadow-lg
        pl-8 pr-4 py-3
        min-w-0 w-auto max-w-sm
        pointer-events-auto
        relative
        border border-gray-200
        transition-all duration-300 ease-in-out
      `}
    >
      {/* Close Button - Top Left */}
      <button
        onClick={onDismiss}
        className="absolute top-1 left-1 p-1 rounded-full hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
        aria-label="Dismiss notification"
      >
        <X className="w-3 h-3 text-gray-400 hover:text-gray-600" />
      </button>

      <div className="flex items-center">
        {/* Icon */}
        <div className={`${styles.iconBg} rounded-full p-1.5 mr-3 flex-shrink-0`}>
          <IconComponent className={`w-4 h-4 ${styles.iconColor}`} />
        </div>
        
        {/* Message */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 leading-5">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};

// Achievement Toast Component (Enhanced with close button)
interface AchievementToastProps {
  message: string;
  icon: string;
  onDismiss: () => void;
  visible: boolean;
}

const AchievementToast: React.FC<AchievementToastProps> = ({ message, icon, onDismiss, visible }) => {
  return (
    <div
      className={`
        ${visible ? 'animate-in slide-in-from-top-2 md:slide-in-from-right-2' : 'animate-out slide-out-to-top-2 md:slide-out-to-right-2'}
        min-w-0 w-auto max-w-sm bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg rounded-lg pointer-events-auto
        relative overflow-hidden
        transition-all duration-300 ease-in-out
      `}
    >
      {/* Close Button - Top Left */}
      <button
        onClick={onDismiss}
        className="absolute top-1 left-1 p-1 rounded-full hover:bg-white/20 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
        aria-label="Dismiss notification"
      >
        <X className="w-3 h-3 text-white/80 hover:text-white" />
      </button>

      <div className="pl-8 pr-4 py-3">
        <div className="flex items-center">
          <span className="text-2xl mr-3 flex-shrink-0">{icon}</span>
          <p className="text-white font-medium leading-5">{message}</p>
        </div>
      </div>
    </div>
  );
};

const messagesByRole = {
  organization: {
    projectCreated: 'Project created successfully! 🎉',
    requestSent: 'Request sent to developer',
    profileUpdated: 'Organization profile updated',
    developerJoined: 'New developer joined your project!',
    projectDeleted: 'Project deleted successfully',
    invitationSent: 'Invitation sent successfully',
    teamUpdated: 'Team settings updated',
  },
  developer: {
    joinedProject: 'Welcome to the project! 🚀',
    taskAssigned: 'New task assigned to you',
    profileUpdated: 'Developer profile updated',
    requestReceived: 'New project request received!',
    requestAccepted: 'Request accepted successfully',
    requestDeclined: 'Request declined',
    skillsUpdated: 'Skills updated successfully',
  },
  admin: {
    userApproved: 'User approved successfully',
    userRejected: 'User rejected',
    systemUpdated: 'System settings updated',
    reportGenerated: 'Report generated successfully',
    userBanned: 'User banned successfully',
    userUnbanned: 'User unbanned successfully',
    maintenanceScheduled: 'Maintenance scheduled',
  },
};

type RoleKey = keyof typeof messagesByRole[UserRole];

class ToastService {
  success(message: string, options?: ToastOptions) {
    return toast.custom((t) => (
      <CustomToast
        message={message}
        type="success"
        onDismiss={() => toast.remove(t.id)}
        visible={t.visible}
      />
    ), {
      duration: options?.duration || 4000,
    });
  }

  error(message: string, options?: ToastOptions) {
    return toast.custom((t) => (
      <CustomToast
        message={message}
        type="error"
        onDismiss={() => toast.remove(t.id)}
        visible={t.visible}
      />
    ), {
      duration: options?.duration || 5000,
    });
  }

  info(message: string, options?: ToastOptions) {
    return toast.custom((t) => (
      <CustomToast
        message={message}
        type="info"
        onDismiss={() => toast.remove(t.id)}
        visible={t.visible}
      />
    ), {
      duration: options?.duration || 4000,
    });
  }

  warning(message: string, options?: ToastOptions) {
    return toast.custom((t) => (
      <CustomToast
        message={message}
        type="warning"
        onDismiss={() => toast.remove(t.id)}
        visible={t.visible}
      />
    ), {
      duration: options?.duration || 4000,
    });
  }

  loading(message: string = 'Loading...') {
    return toast.loading(message, {
      style: {
        background: '#f3f4f6',
        color: '#374151',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
        padding: '12px 16px',
      },
    });
  }

  dismiss(toastId: string) {
    toast.remove(toastId);
  }

  roleBasedSuccess(role: UserRole, action: RoleKey) {
    const messages = messagesByRole[role];
    const message = messages[action] || 'Action completed successfully.';
    return this.success(message);
  }

  auth = {
    loginSuccess: () => this.success('Welcome back! Login successful.'),
    loginError: () => this.error('Invalid credentials. Please try again.'),
    logoutSuccess: () => this.info('You have been signed out safely.'),
    registerSuccess: () => this.success('Account created successfully! Welcome to DevTogether.'),
    registerError: (error?: string) => this.error(error || 'Registration failed. Please try again.'),
    passwordReset: () => this.success('Password reset email sent. Check your inbox.'),
    passwordUpdated: () => this.success('Password updated successfully.'),
    emailVerified: () => this.success('Email verified successfully.'),
  };

  project = {
    created: () => this.success('Project created successfully! 🎉'),
    updated: () => this.success('Project updated successfully.'),
    deleted: () => this.info('Project deleted successfully.'),
    joined: () => this.success('You have joined the project.'),
    left: () => this.info('You have left the project.'),
    requestSent: () => this.success('Request sent successfully.'),
    memberAdded: () => this.success('Member added to project.'),
    memberRemoved: () => this.info('Member removed from project.'),
    published: () => this.success('Project published and visible to developers!'),
    applicationSubmitted: () => this.success('Application submitted successfully! 🚀'),
    applicationError: () => this.error('Failed to submit application. Please try again.'),
  };

  profile = {
    updated: () => this.success('Profile updated successfully!'),
    imageUploaded: () => this.success('Profile image uploaded successfully!'),
    imageRemoved: () => this.info('Profile image removed.'),
    error: () => this.error('Failed to update profile. Please try again.'),
    skillsUpdated: () => this.success('Skills updated successfully.'),
    bioUpdated: () => this.success('Bio updated successfully.'),
    avatarUpdated: () => this.success('Profile picture updated successfully!'),
  };

  database = {
    saved: () => this.success('Saved successfully.'),
    deleted: () => this.info('Deleted successfully.'),
    error: (action: string = 'perform action') => this.error(`Failed to ${action}.`),
    connectionError: () => this.error('Database connection error.'),
  };

  admin = {
    projectApproved: () => this.success('Project approved successfully!'),
    projectRejected: () => this.success('Project rejected successfully.'),
    organizationApproved: () => this.success('Organization approved successfully!'),
    organizationRejected: () => this.success('Organization rejected successfully.'),
    userBlocked: () => this.success('User blocked successfully.'),
    userUnblocked: () => this.success('User unblocked successfully.'),
    actionError: () => this.error('Action failed. Please try again.'),
    userApproved: () => this.success('User approved successfully'),
    userRejected: () => this.success('User rejected'),
    systemUpdated: () => this.success('System settings updated'),
    reportGenerated: () => this.success('Report generated successfully'),
    userBanned: () => this.success('User banned successfully'),
    userUnbanned: () => this.success('User unbanned successfully'),
    maintenanceScheduled: () => this.success('Maintenance scheduled'),
  };

  network = {
    offline: () => this.error('You are offline.'),
    online: () => this.success('You are back online.'),
    slow: () => this.warning('Slow network detected.'),
  };

  async promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ): Promise<T> {
    const toastId = this.loading(messages.loading);
    try {
      const result = await promise;
      this.dismiss(toastId);
      this.success(messages.success);
      return result;
    } catch (error) {
      this.dismiss(toastId);
      this.error(messages.error);
      throw error;
    }
  }

  achievement(message: string, icon: string = '🏆') {
    return toast.custom((t) => (
      <AchievementToast
        message={message}
        icon={icon}
        onDismiss={() => toast.remove(t.id)}
        visible={t.visible}
      />
    ), {
      duration: 6000,
    });
  }
}

export const toastService = new ToastService();