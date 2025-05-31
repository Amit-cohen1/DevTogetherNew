import { supabase } from '../utils/supabase';
import { Message, User } from '../types/database';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface MessageWithUser extends Message {
    sender: User;
}

export interface TypingUser {
    userId: string;
    userName: string;
    timestamp: number;
}

export interface ChatState {
    messages: MessageWithUser[];
    typingUsers: TypingUser[];
    onlineUsers: string[];
    loading: boolean;
    error: string | null;
}

class MessageService {
    private channels: Map<string, RealtimeChannel> = new Map();
    private messageCallbacks: Map<string, (message: MessageWithUser) => void> = new Map();
    private typingCallbacks: Map<string, (typingUsers: TypingUser[]) => void> = new Map();
    private onlineCallbacks: Map<string, (onlineUsers: string[]) => void> = new Map();

    async sendMessage(projectId: string, content: string, senderId: string): Promise<MessageWithUser | null> {
        try {
            // Insert message into database
            const { data: message, error } = await supabase
                .from('messages')
                .insert({
                    project_id: projectId,
                    sender_id: senderId,
                    content: content.trim()
                })
                .select(`
          *,
          sender:users!sender_id(*)
        `)
                .single();

            if (error) {
                console.error('Error sending message:', error);
                return null;
            }

            return message as MessageWithUser;
        } catch (error) {
            console.error('Error sending message:', error);
            return null;
        }
    }

    async getMessages(projectId: string, limit: number = 50, before?: string): Promise<MessageWithUser[]> {
        try {
            let query = supabase
                .from('messages')
                .select(`
          *,
          sender:users!sender_id(*)
        `)
                .eq('project_id', projectId)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (before) {
                query = query.lt('created_at', before);
            }

            const { data: messages, error } = await query;

            if (error) {
                console.error('Error fetching messages:', error);
                return [];
            }

            // Reverse to show oldest first
            return (messages as MessageWithUser[]).reverse();
        } catch (error) {
            console.error('Error fetching messages:', error);
            return [];
        }
    }

    async subscribeToMessages(
        projectId: string,
        userId: string,
        onMessage: (message: MessageWithUser) => void,
        onTyping: (typingUsers: TypingUser[]) => void,
        onOnlineUsers: (onlineUsers: string[]) => void
    ): Promise<void> {
        try {
            const channelName = `project:${projectId}`;
            console.log('Setting up subscription for channel:', channelName);

            // Clean up existing subscription
            await this.unsubscribeFromMessages(projectId);

            // Create new channel with a unique name to avoid conflicts
            const channel = supabase.channel(`${channelName}-${Date.now()}`, {
                config: {
                    presence: {
                        key: userId,
                    },
                    broadcast: {
                        self: false, // Don't receive our own broadcasts
                    },
                },
            });

            // Store callbacks
            this.messageCallbacks.set(projectId, onMessage);
            this.typingCallbacks.set(projectId, onTyping);
            this.onlineCallbacks.set(projectId, onOnlineUsers);

            // Subscribe to new messages with error handling
            channel.on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `project_id=eq.${projectId}`,
                },
                async (payload: any) => {
                    try {
                        console.log('Received message change:', payload);

                        // Fetch full message with user data
                        const { data: fullMessage, error } = await supabase
                            .from('messages')
                            .select(`
                  *,
                  sender:users!sender_id(*)
                `)
                            .eq('id', payload.new.id)
                            .single();

                        if (!error && fullMessage) {
                            console.log('Broadcasting message to UI:', fullMessage);
                            onMessage(fullMessage as MessageWithUser);
                        } else {
                            console.error('Error fetching full message:', error);
                        }
                    } catch (error) {
                        console.error('Error processing postgres_changes payload:', error);
                    }
                }
            );

            // Subscribe to presence (online users)
            channel.on('presence', { event: 'sync' }, () => {
                const state = channel.presenceState();
                const onlineUserIds = Object.keys(state);
                console.log('Online users updated:', onlineUserIds);
                onOnlineUsers(onlineUserIds);
            });

            // Subscribe to typing indicators
            channel.on('broadcast', { event: 'typing' }, (payload: any) => {
                const typingUsers = payload.payload as TypingUser[];
                onTyping(typingUsers.filter(user => user.userId !== userId));
            });

            // Subscribe to the channel
            const subscriptionPromise = new Promise<void>((resolve, reject) => {
                channel.subscribe(async (status: any) => {
                    console.log('Channel subscription status:', status);
                    if (status === 'SUBSCRIBED') {
                        try {
                            await channel.track({
                                userId,
                                online_at: new Date().toISOString(),
                            });
                            console.log('User presence tracked');
                            resolve();
                        } catch (error) {
                            console.error('Error tracking presence:', error);
                            reject(error);
                        }
                    } else if (status === 'CHANNEL_ERROR') {
                        console.error('Channel subscription error');
                        reject(new Error('Channel subscription failed'));
                    } else if (status === 'TIMED_OUT') {
                        console.error('Channel subscription timed out');
                        reject(new Error('Channel subscription timed out'));
                    }
                });
            });

            // Wait for subscription to complete or timeout after 10 seconds
            await Promise.race([
                subscriptionPromise,
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Subscription timeout')), 10000)
                )
            ]);

            this.channels.set(projectId, channel);
            console.log('Subscription setup complete for project:', projectId);
        } catch (error) {
            console.error('Error subscribing to messages:', error);
            throw error; // Re-throw to handle in calling code
        }
    }

    async unsubscribeFromMessages(projectId: string): Promise<void> {
        const existingChannel = this.channels.get(projectId);
        if (existingChannel) {
            await existingChannel.unsubscribe();
            this.channels.delete(projectId);
            this.messageCallbacks.delete(projectId);
            this.typingCallbacks.delete(projectId);
            this.onlineCallbacks.delete(projectId);
        }
    }

    async sendTypingIndicator(projectId: string, userId: string, userName: string, isTyping: boolean): Promise<void> {
        const channel = this.channels.get(projectId);
        if (!channel) return;

        try {
            if (isTyping) {
                await channel.send({
                    type: 'broadcast',
                    event: 'typing',
                    payload: [{
                        userId,
                        userName,
                        timestamp: Date.now()
                    }]
                });
            } else {
                await channel.send({
                    type: 'broadcast',
                    event: 'typing',
                    payload: []
                });
            }
        } catch (error) {
            console.error('Error sending typing indicator:', error);
        }
    }

    async deleteMessage(messageId: string, userId: string): Promise<boolean> {
        try {
            // First check if user owns the message
            const { data: message, error: fetchError } = await supabase
                .from('messages')
                .select('sender_id')
                .eq('id', messageId)
                .single();

            if (fetchError || !message) {
                console.error('Message not found:', fetchError);
                return false;
            }

            if (message.sender_id !== userId) {
                console.error('User does not own this message');
                return false;
            }

            const { error } = await supabase
                .from('messages')
                .delete()
                .eq('id', messageId);

            if (error) {
                console.error('Error deleting message:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error deleting message:', error);
            return false;
        }
    }

    async editMessage(messageId: string, newContent: string, userId: string): Promise<boolean> {
        try {
            // First check if user owns the message
            const { data: message, error: fetchError } = await supabase
                .from('messages')
                .select('sender_id')
                .eq('id', messageId)
                .single();

            if (fetchError || !message) {
                console.error('Message not found:', fetchError);
                return false;
            }

            if (message.sender_id !== userId) {
                console.error('User does not own this message');
                return false;
            }

            const { error } = await supabase
                .from('messages')
                .update({
                    content: newContent.trim(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', messageId);

            if (error) {
                console.error('Error editing message:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error editing message:', error);
            return false;
        }
    }

    async checkMessageAccess(projectId: string, userId: string): Promise<boolean> {
        try {
            // Check if user is part of the project team
            const { data: project, error: projectError } = await supabase
                .from('projects')
                .select('organization_id')
                .eq('id', projectId)
                .single();

            if (projectError || !project) {
                return false;
            }

            // Check if user is organization owner
            if (project.organization_id === userId) {
                return true;
            }

            // Check if user has accepted application
            const { data: application, error: applicationError } = await supabase
                .from('applications')
                .select('id')
                .eq('project_id', projectId)
                .eq('developer_id', userId)
                .eq('status', 'accepted')
                .single();

            return !applicationError && !!application;
        } catch (error) {
            console.error('Error checking message access:', error);
            return false;
        }
    }

    // Cleanup all subscriptions
    async cleanup(): Promise<void> {
        const projectIds = Array.from(this.channels.keys());
        await Promise.all(projectIds.map(id => this.unsubscribeFromMessages(id)));
    }
}

export const messageService = new MessageService(); 