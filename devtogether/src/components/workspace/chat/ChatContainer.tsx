import React, { useState, useEffect, useCallback } from 'react';
import { MessageCircle, Users as UsersIcon, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { messageService, MessageWithUser, TypingUser, ChatState } from '../../../services/messageService';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { toastService } from '../../../services/toastService';

interface ChatContainerProps {
    projectId: string;
    teamMembers: { id: string; user: { first_name?: string; last_name?: string; organization_name?: string } }[];
}

export default function ChatContainer({ projectId, teamMembers }: ChatContainerProps) {
    const { user } = useAuth();
    const [chatState, setChatState] = useState<ChatState>({
        messages: [],
        typingUsers: [],
        onlineUsers: [],
        loading: true,
        error: null
    });
    const [connected, setConnected] = useState(false);
    const [hasMoreMessages, setHasMoreMessages] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    // Get user display name
    const getUserDisplayName = useCallback((userId: string): string => {
        const member = teamMembers.find(m => m.id === userId);
        if (!member) return 'Unknown User';

        const { user: userData } = member;
        return userData.organization_name ||
            `${userData.first_name || ''} ${userData.last_name || ''}`.trim() ||
            'Unknown User';
    }, [teamMembers]);

    // Load initial messages
    const loadMessages = useCallback(async (before?: string) => {
        if (!user) return;

        try {
            if (!before) {
                setChatState(prev => ({ ...prev, loading: true, error: null }));
            } else {
                setLoadingMore(true);
            }

            const messages = await messageService.getMessages(projectId, 50, before);

            setChatState(prev => ({
                ...prev,
                messages: before ? [...messages, ...prev.messages] : messages,
                loading: false,
                error: null
            }));

            setHasMoreMessages(messages.length === 50);
        } catch (error) {
            console.error('Error loading messages:', error);
            setChatState(prev => ({
                ...prev,
                loading: false,
                error: 'Failed to load messages'
            }));
        } finally {
            setLoadingMore(false);
        }
    }, [projectId, user?.id]);

    // Handle new messages
    const handleNewMessage = useCallback((message: MessageWithUser) => {
        setChatState(prev => {
            // Check if message already exists to prevent duplicates
            const messageExists = prev.messages.some(m => m.id === message.id);
            if (messageExists) {
                return prev;
            }
            return {
                ...prev,
                messages: [...prev.messages, message]
            };
        });
    }, []);

    // Handle typing indicators
    const handleTypingUpdate = useCallback((typingUsers: TypingUser[]) => {
        setChatState(prev => ({
            ...prev,
            typingUsers: typingUsers.filter(tu => Date.now() - tu.timestamp < 3000) // Remove old typing indicators
        }));
    }, []);

    // Handle online users
    const handleOnlineUsers = useCallback((onlineUsers: string[]) => {
        setChatState(prev => ({
            ...prev,
            onlineUsers
        }));
        setConnected(true);
    }, []);

    // Send message
    const handleSendMessage = useCallback(async (content: string, attachmentId?: string) => {
        if (!user) return;

        try {
            const newMessage = await messageService.sendMessage(projectId, content, user.id, attachmentId);
            if (newMessage) {
                // Optimistically add the message for immediate feedback
                setChatState(prev => {
                    // Check if message already exists to prevent duplicates
                    const messageExists = prev.messages.some(m => m.id === newMessage.id);
                    if (messageExists) {
                        return prev;
                    }
                    return {
                        ...prev,
                        messages: [...prev.messages, newMessage]
                    };
                });
            }
        } catch (error) {
            console.error('Error sending message:', error);
            setChatState(prev => ({
                ...prev,
                error: 'Failed to send message'
            }));
            toastService.error('Failed to send message. Please try again.');
        }
    }, [projectId, user?.id]);

    // Handle typing
    const handleTyping = useCallback(async (isTyping: boolean) => {
        if (!user) return;

        const userName = getUserDisplayName(user.id);
        await messageService.sendTypingIndicator(projectId, user.id, userName, isTyping);
    }, [projectId, user?.id, getUserDisplayName]);

    // Edit message
    const handleEditMessage = useCallback(async (messageId: string, newContent: string) => {
        if (!user) return;

        const success = await messageService.editMessage(messageId, newContent, user.id);
        if (success) {
            // Reload messages to get updated content
            loadMessages();
        } else {
            setChatState(prev => ({
                ...prev,
                error: 'Failed to edit message'
            }));
            toastService.error('Failed to edit message. Please try again.');
        }
    }, [user?.id, loadMessages]);

    // Delete message
    const handleDeleteMessage = useCallback(async (messageId: string) => {
        if (!user) return;

        const success = await messageService.deleteMessage(messageId, user.id);
        if (success) {
            setChatState(prev => ({
                ...prev,
                messages: prev.messages.filter(m => m.id !== messageId)
            }));
        } else {
            setChatState(prev => ({
                ...prev,
                error: 'Failed to delete message'
            }));
        }
    }, [user?.id]);

    // Load more messages
    const handleLoadMore = useCallback(() => {
        if (chatState.messages.length > 0) {
            const oldestMessage = chatState.messages[0];
            loadMessages(oldestMessage.created_at);
        }
    }, [chatState.messages, loadMessages]);

    // Initialize chat
    useEffect(() => {
        if (!user) return;

        const initializeChat = async () => {
            console.log('Initializing chat for project:', projectId, 'user:', user.id);

            // Check access
            const hasAccess = await messageService.checkMessageAccess(projectId, user.id);
            if (!hasAccess) {
                console.error('User does not have access to this chat');
                setChatState(prev => ({
                    ...prev,
                    loading: false,
                    error: 'You do not have access to this chat'
                }));
                return;
            }

            // Load initial messages
            await loadMessages();

            // Set up real-time subscriptions with retry
            try {
                await messageService.subscribeToMessages(
                    projectId,
                    user.id,
                    handleNewMessage,
                    handleTypingUpdate,
                    handleOnlineUsers
                );
                console.log('Real-time subscription established');
                setConnected(true);
            } catch (error) {
                console.error('Failed to establish real-time subscription:', error);
                setConnected(false);

                // Retry after 3 seconds
                setTimeout(async () => {
                    try {
                        await messageService.subscribeToMessages(
                            projectId,
                            user.id,
                            handleNewMessage,
                            handleTypingUpdate,
                            handleOnlineUsers
                        );
                        console.log('Real-time subscription retry successful');
                        setConnected(true);
                    } catch (retryError) {
                        console.error('Retry failed:', retryError);
                    }
                }, 3000);
            }
        };

        initializeChat();

        // Cleanup on unmount
        return () => {
            console.log('Cleaning up chat subscriptions');
            messageService.unsubscribeFromMessages(projectId);
        };
    }, [projectId, user?.id]);

    // Clear error after 5 seconds
    useEffect(() => {
        if (chatState.error) {
            const timer = setTimeout(() => {
                setChatState(prev => ({ ...prev, error: null }));
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [chatState.error]);

    if (!user) {
        return (
            <div className="h-full flex items-center justify-center bg-gray-50">
                <p className="text-gray-500">Please log in to access chat</p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Chat Header */}
            <div className="flex-shrink-0 border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <MessageCircle className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Team Chat</h3>
                            <p className="text-sm text-gray-600">
                                {chatState.onlineUsers.length} online
                            </p>
                        </div>
                    </div>

                    {/* Connection status */}
                    <div className="flex items-center gap-2">
                        {connected ? (
                            <div className="flex items-center gap-1 text-green-600">
                                <Wifi className="w-4 h-4" />
                                <span className="text-xs font-medium">Connected</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1 text-red-600">
                                <WifiOff className="w-4 h-4" />
                                <span className="text-xs font-medium">Disconnected</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {chatState.error && (
                <div className="flex-shrink-0 bg-red-50 border-b border-red-200 p-3">
                    <p className="text-red-700 text-sm">{chatState.error}</p>
                </div>
            )}

            {/* Online Users Bar */}
            {chatState.onlineUsers.length > 0 && (
                <div className="flex-shrink-0 bg-gray-50 border-b border-gray-200 p-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <UsersIcon className="w-4 h-4" />
                        <span>Online:</span>
                        <div className="flex gap-2">
                            {chatState.onlineUsers.slice(0, 5).map(userId => (
                                <span key={userId} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                    {getUserDisplayName(userId)}
                                </span>
                            ))}
                            {chatState.onlineUsers.length > 5 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                                    +{chatState.onlineUsers.length - 5} more
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Messages */}
            <MessageList
                messages={chatState.messages}
                currentUserId={user.id}
                typingUsers={chatState.typingUsers}
                loading={chatState.loading || loadingMore}
                onLoadMore={handleLoadMore}
                hasMoreMessages={hasMoreMessages}
                onEditMessage={handleEditMessage}
                onDeleteMessage={handleDeleteMessage}
            />

            {/* Message Input */}
            <MessageInput
                projectId={projectId}
                onSendMessage={handleSendMessage}
                onTyping={handleTyping}
                disabled={!connected || !!chatState.error}
                placeholder={connected ? "Type a message..." : "Connecting..."}
            />
        </div>
    );
} 