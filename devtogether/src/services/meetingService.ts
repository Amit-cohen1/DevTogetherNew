import { supabase } from '../utils/supabase';
import { toastService } from './toastService';

export interface ProjectMeeting {
    id: string;
    project_id: string;
    organizer_id: string;
    title: string;
    description?: string;
    meeting_date: string;
    duration_minutes: number;
    meeting_type: 'standup' | 'planning' | 'review' | 'retrospective' | 'demo' | 'other';
    meeting_url?: string;
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
    created_at: string;
    organizer: {
        first_name?: string;
        last_name?: string;
        organization_name?: string;
        avatar_url?: string;
    };
}

export interface MeetingCreateData {
    project_id: string;
    title: string;
    description?: string;
    meeting_date: string;
    duration_minutes?: number;
    meeting_type?: 'standup' | 'planning' | 'review' | 'retrospective' | 'demo' | 'other';
    meeting_url?: string;
}

class MeetingService {
    private autoUpdateInterval: NodeJS.Timeout | null = null;

    /**
     * Generate a Jitsi Meet URL for a meeting
     */
    generateJitsiMeetUrl(projectId: string, meetingId?: string): string {
        const roomSuffix = meetingId ? meetingId.slice(0, 8) : Date.now().toString();
        const roomName = `devtogether-${projectId.slice(0, 8)}-${roomSuffix}`;
        return `https://meet.jit.si/${roomName}`;
    }

    /**
     * Check if a meeting is currently happening
     */
    isMeetingActive(meeting: ProjectMeeting): boolean {
        const now = new Date();
        const startTime = new Date(meeting.meeting_date);
        const endTime = new Date(startTime.getTime() + (meeting.duration_minutes * 60 * 1000));
        
        return now >= startTime && now <= endTime;
    }

    /**
     * Check if a meeting has ended
     */
    isMeetingEnded(meeting: ProjectMeeting): boolean {
        const now = new Date();
        const endTime = new Date(new Date(meeting.meeting_date).getTime() + (meeting.duration_minutes * 60 * 1000));
        
        return now > endTime;
    }

    /**
     * Check if a meeting is starting soon (within 5 minutes)
     */
    isMeetingStartingSoon(meeting: ProjectMeeting): boolean {
        const now = new Date();
        const startTime = new Date(meeting.meeting_date);
        const timeDiff = startTime.getTime() - now.getTime();
        
        return timeDiff > 0 && timeDiff <= 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Get meeting status based on current time
     */
    getRealtimeMeetingStatus(meeting: ProjectMeeting): 'scheduled' | 'in_progress' | 'completed' | 'cancelled' {
        if (meeting.status === 'cancelled') return 'cancelled';
        
        if (this.isMeetingActive(meeting)) {
            return 'in_progress';
        } else if (this.isMeetingEnded(meeting)) {
            return 'completed';
        } else {
            return 'scheduled';
        }
    }

    /**
     * Automatically update meeting statuses based on current time
     */
    async autoUpdateMeetingStatuses(projectId?: string): Promise<void> {
        try {
            let query = supabase
                .from('project_meetings')
                .select('*')
                .in('status', ['scheduled', 'in_progress']);

            if (projectId) {
                query = query.eq('project_id', projectId);
            }

            const { data: meetings, error } = await query;

            if (error) {
                console.error('Error fetching meetings for auto-update:', error);
                return;
            }

            if (!meetings || meetings.length === 0) return;

            const updates: Array<{ id: string; status: string }> = [];

            meetings.forEach((meeting: any) => {
                const currentStatus = this.getRealtimeMeetingStatus(meeting);
                if (currentStatus !== meeting.status) {
                    updates.push({ id: meeting.id, status: currentStatus });
                }
            });

            // Batch update meeting statuses
            if (updates.length > 0) {
                for (const update of updates) {
                    await supabase
                        .from('project_meetings')
                        .update({ status: update.status })
                        .eq('id', update.id);
                }

                console.log(`Auto-updated ${updates.length} meeting statuses`);
            }
        } catch (error) {
            console.error('Error in auto-update meeting statuses:', error);
        }
    }

    /**
     * Start automatic meeting status monitoring
     */
    startAutoStatusUpdates(projectId?: string, intervalMinutes: number = 1): void {
        // Clear existing interval
        this.stopAutoStatusUpdates();

        // Set up new interval
        this.autoUpdateInterval = setInterval(() => {
            this.autoUpdateMeetingStatuses(projectId);
        }, intervalMinutes * 60 * 1000);

        // Run initial update
        this.autoUpdateMeetingStatuses(projectId);

        console.log(`Started auto-status updates every ${intervalMinutes} minute(s)`);
    }

    /**
     * Stop automatic meeting status monitoring
     */
    stopAutoStatusUpdates(): void {
        if (this.autoUpdateInterval) {
            clearInterval(this.autoUpdateInterval);
            this.autoUpdateInterval = null;
            console.log('Stopped auto-status updates');
        }
    }

    /**
     * Check if user can create meetings (organization owner or status manager)
     */
    async canUserCreateMeetings(userId: string, projectId: string): Promise<boolean> {
        try {
            // Check if user is organization owner
            const { data: project, error: projectError } = await supabase
                .from('projects')
                .select('organization_id')
                .eq('id', projectId)
                .single();

            if (!projectError && project?.organization_id === userId) {
                return true;
            }

            // Check if user is a status manager (accepted team member with status_manager = true)
            const { data: teamMember, error: teamError } = await supabase
                .from('applications')
                .select('status_manager')
                .eq('project_id', projectId)
                .eq('developer_id', userId)
                .eq('status', 'accepted')
                .single();

            if (!teamError && teamMember?.status_manager) {
                return true;
            }

            return false;
        } catch (error) {
            console.error('Error checking meeting creation permissions:', error);
            return false;
        }
    }

    /**
     * Get all meetings for a project with real-time status updates
     */
    async getProjectMeetings(projectId: string, autoUpdate: boolean = true): Promise<ProjectMeeting[]> {
        try {
            // Auto-update statuses before fetching if requested
            if (autoUpdate) {
                await this.autoUpdateMeetingStatuses(projectId);
            }

            const { data, error } = await supabase
                .from('project_meetings')
                .select(`
                    *,
                    organizer:profiles!project_meetings_organizer_id_fkey(
                        first_name,
                        last_name,
                        organization_name,
                        avatar_url
                    )
                `)
                .eq('project_id', projectId)
                .order('meeting_date', { ascending: true });

            if (error) {
                console.error('Error fetching project meetings:', error);
                return [];
            }

            // Apply real-time status calculation to each meeting
            const meetingsWithRealtimeStatus = (data || []).map((meeting: any) => ({
                ...meeting,
                status: this.getRealtimeMeetingStatus(meeting)
            }));

            return meetingsWithRealtimeStatus;
        } catch (error) {
            console.error('Error fetching project meetings:', error);
            return [];
        }
    }

    /**
     * Get upcoming meetings (next 24 hours)
     */
    async getUpcomingMeetings(projectId: string): Promise<ProjectMeeting[]> {
        const meetings = await this.getProjectMeetings(projectId);
        const now = new Date();
        const next24Hours = new Date(now.getTime() + (24 * 60 * 60 * 1000));

        return meetings.filter(meeting => {
            const meetingDate = new Date(meeting.meeting_date);
            return meetingDate >= now && meetingDate <= next24Hours && meeting.status !== 'cancelled';
        });
    }

    /**
     * Get active meetings (currently happening)
     */
    async getActiveMeetings(projectId: string): Promise<ProjectMeeting[]> {
        const meetings = await this.getProjectMeetings(projectId);
        return meetings.filter(meeting => this.isMeetingActive(meeting) && meeting.status !== 'cancelled');
    }

    /**
     * Create a new meeting
     */
    async createMeeting(meetingData: MeetingCreateData, organizerId: string): Promise<{ success: boolean; meeting?: ProjectMeeting; error?: string }> {
        try {
            // Check permissions first
            const canCreate = await this.canUserCreateMeetings(organizerId, meetingData.project_id);
            if (!canCreate) {
                return { success: false, error: 'You do not have permission to create meetings for this project' };
            }

            const { data, error } = await supabase
                .from('project_meetings')
                .insert({
                    ...meetingData,
                    organizer_id: organizerId,
                    duration_minutes: meetingData.duration_minutes || 60,
                    meeting_type: meetingData.meeting_type || 'other'
                })
                .select(`
                    *,
                    organizer:profiles!project_meetings_organizer_id_fkey(
                        first_name,
                        last_name,
                        organization_name,
                        avatar_url
                    )
                `)
                .single();

            if (error) {
                console.error('Error creating meeting:', error);
                return { success: false, error: error.message };
            }

            toastService.success('Meeting scheduled successfully!');
            return { success: true, meeting: data };
        } catch (error) {
            console.error('Error creating meeting:', error);
            return { success: false, error: 'Failed to create meeting' };
        }
    }

    /**
     * Update meeting
     */
    async updateMeeting(meetingId: string, updates: Partial<MeetingCreateData>, userId: string): Promise<{ success: boolean; error?: string }> {
        try {
            // Check if user can update this meeting
            const { data: meeting, error: fetchError } = await supabase
                .from('project_meetings')
                .select('organizer_id, project_id')
                .eq('id', meetingId)
                .single();

            if (fetchError || !meeting) {
                return { success: false, error: 'Meeting not found' };
            }

            const canUpdate = meeting.organizer_id === userId || 
                             await this.canUserCreateMeetings(userId, meeting.project_id);

            if (!canUpdate) {
                return { success: false, error: 'You do not have permission to update this meeting' };
            }

            const { error } = await supabase
                .from('project_meetings')
                .update(updates)
                .eq('id', meetingId);

            if (error) {
                console.error('Error updating meeting:', error);
                return { success: false, error: error.message };
            }

            toastService.success('Meeting updated successfully!');
            return { success: true };
        } catch (error) {
            console.error('Error updating meeting:', error);
            return { success: false, error: 'Failed to update meeting' };
        }
    }

    /**
     * Delete meeting
     */
    async deleteMeeting(meetingId: string, userId?: string): Promise<{ success: boolean; error?: string }> {
        try {
            if (userId) {
                // Check permissions if userId provided
                const { data: meeting, error: fetchError } = await supabase
                    .from('project_meetings')
                    .select('organizer_id, project_id')
                    .eq('id', meetingId)
                    .single();

                if (fetchError || !meeting) {
                    return { success: false, error: 'Meeting not found' };
                }

                const canDelete = meeting.organizer_id === userId || 
                                 await this.canUserCreateMeetings(userId, meeting.project_id);

                if (!canDelete) {
                    return { success: false, error: 'You do not have permission to delete this meeting' };
                }
            }

            const { error } = await supabase
                .from('project_meetings')
                .delete()
                .eq('id', meetingId);

            if (error) {
                console.error('Error deleting meeting:', error);
                return { success: false, error: error.message };
            }

            toastService.success('Meeting deleted successfully!');
            return { success: true };
        } catch (error) {
            console.error('Error deleting meeting:', error);
            return { success: false, error: 'Failed to delete meeting' };
        }
    }

    /**
     * Update meeting status
     */
    async updateMeetingStatus(meetingId: string, status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'): Promise<{ success: boolean; error?: string }> {
        try {
            const { error } = await supabase
                .from('project_meetings')
                .update({ status })
                .eq('id', meetingId);

            if (error) {
                console.error('Error updating meeting status:', error);
                return { success: false, error: error.message };
            }

            toastService.success(`Meeting marked as ${status}`);
            return { success: true };
        } catch (error) {
            console.error('Error updating meeting status:', error);
            return { success: false, error: 'Failed to update meeting status' };
        }
    }

    /**
     * Get meeting notifications (meetings starting soon, etc.)
     */
    async getMeetingNotifications(projectId: string): Promise<Array<{
        type: 'starting_soon' | 'in_progress' | 'ended';
        meeting: ProjectMeeting;
        message: string;
    }>> {
        const meetings = await this.getProjectMeetings(projectId);
        const notifications: Array<{
            type: 'starting_soon' | 'in_progress' | 'ended';
            meeting: ProjectMeeting;
            message: string;
        }> = [];

        meetings.forEach((meeting: ProjectMeeting) => {
            if (meeting.status === 'cancelled') return;

            if (this.isMeetingStartingSoon(meeting)) {
                notifications.push({
                    type: 'starting_soon',
                    meeting,
                    message: `"${meeting.title}" is starting in ${Math.ceil((new Date(meeting.meeting_date).getTime() - new Date().getTime()) / (60 * 1000))} minutes`
                });
            } else if (this.isMeetingActive(meeting)) {
                notifications.push({
                    type: 'in_progress',
                    meeting,
                    message: `"${meeting.title}" is happening now`
                });
            } else if (this.isMeetingEnded(meeting) && meeting.status === 'in_progress') {
                notifications.push({
                    type: 'ended',
                    meeting,
                    message: `"${meeting.title}" has ended`
                });
            }
        });

        return notifications;
    }
}

// Export singleton instance
export const meetingService = new MeetingService(); 