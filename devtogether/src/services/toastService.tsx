import toast from 'react-hot-toast';
import React from 'react';

export type UserRole = 'organization' | 'developer' | 'admin';

interface ToastOptions {
  duration?: number;
  icon?: string;
}

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
    return toast.success(message, {
      duration: options?.duration || 3000,
      icon: options?.icon,
    });
  }

  error(message: string, options?: ToastOptions) {
    return toast.error(message, {
      duration: options?.duration || 4000,
      icon: options?.icon,
    });
  }

  info(message: string, options?: ToastOptions) {
    return toast(message, {
      duration: options?.duration || 3000,
      icon: options?.icon,
    });
  }

  warning(message: string, options?: ToastOptions) {
    return toast(message, {
      duration: options?.duration || 3500,
      icon: options?.icon,
      style: {
        background: '#f59e0b',
        color: '#fff',
      },
    });
  }

  loading(message: string = 'Loading...') {
    return toast.loading(message);
  }

  dismiss(toastId: string) {
    toast.dismiss(toastId);
  }

  roleBasedSuccess(role: UserRole, action: RoleKey) {
    const messages = messagesByRole[role];
    const message = messages[action] || 'Action completed successfully.';
    return this.success(message);
  }

  auth = {
    loginSuccess: () => this.success('Login successful.'),
    loginError: () => this.error('Invalid credentials.'),
    logoutSuccess: () => this.info('You have been signed out.'),
    registerSuccess: () => this.success('Account created successfully.'),
    registerError: (error?: string) => this.error(error || 'Registration failed.'),
    passwordReset: () => this.success('Password reset email sent.'),
    passwordUpdated: () => this.success('Password updated successfully.'),
    emailVerified: () => this.success('Email verified successfully.'),
  };

  project = {
    created: () => this.success('Project created successfully.'),
    updated: () => this.success('Project updated successfully.'),
    deleted: () => this.info('Project deleted.'),
    joined: () => this.success('You have joined the project.'),
    left: () => this.info('You have left the project.'),
    requestSent: () => this.success('Request sent successfully.'),
    memberAdded: () => this.success('Member added to project.'),
    memberRemoved: () => this.info('Member removed from project.'),
  };

  profile = {
    updated: () => this.success('Profile updated successfully.'),
    imageUploaded: () => this.success('Profile image uploaded.'),
    imageRemoved: () => this.info('Profile image removed.'),
    error: () => this.error('Failed to update profile.'),
    skillsUpdated: () => this.success('Skills updated successfully.'),
    bioUpdated: () => this.success('Bio updated successfully.'),
  };

  database = {
    saved: () => this.success('Saved successfully.'),
    deleted: () => this.info('Deleted successfully.'),
    error: (action: string = 'perform action') => this.error(`Failed to ${action}.`),
    connectionError: () => this.error('Database connection error.'),
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
      <div
        className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
      >
        <div className='flex-1 p-4'>
          <div className='flex items-center'>
            <span className='text-2xl mr-3'>{icon}</span>
            <p className='text-white font-medium'>{message}</p>
          </div>
        </div>
      </div>
    ));
  }
}

export const toastService = new ToastService(); 