import React, { useEffect, useRef } from 'react';
import { Loader, Users } from 'lucide-react';
import { MessageWithUser, TypingUser } from '../../../services/messageService';
import MessageBubble from './MessageBubble';

interface MessageListProps {
    messages: MessageWithUser[];
    currentUserId: string;
    typingUsers: TypingUser[];
    loading?: boolean;
    onLoadMore?: () => void;
    hasMoreMessages?: boolean;
    onEditMessage?: (messageId: string, newContent: string) => void;
    onDeleteMessage?: (messageId: string) => void;
}

export default function MessageList({
    messages,
    currentUserId,
    typingUsers,
    loading = false,
    onLoadMore,
    hasMoreMessages = false,
    onEditMessage,
    onDeleteMessage
}: MessageListProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    // Check if messages should be grouped (same sender within 5 minutes)
    const shouldGroupMessage = (currentMessage: MessageWithUser, previousMessage?: MessageWithUser): boolean => {
        if (!previousMessage) return false;

        const currentTime = new Date(currentMessage.created_at).getTime();
        const previousTime = new Date(previousMessage.created_at).getTime();
        const timeDiff = currentTime - previousTime;

        return (
            currentMessage.sender_id === previousMessage.sender_id &&
            timeDiff < 5 * 60 * 1000 // 5 minutes
        );
    };

    // Format date dividers
    const formatDateDivider = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    };

    // Check if we need a date divider
    const shouldShowDateDivider = (currentMessage: MessageWithUser, previousMessage?: MessageWithUser): boolean => {
        if (!previousMessage) return true;

        const currentDate = new Date(currentMessage.created_at).toDateString();
        const previousDate = new Date(previousMessage.created_at).toDateString();

        return currentDate !== previousDate;
    };

    const handleScroll = () => {
        if (!messagesContainerRef.current || !onLoadMore || !hasMoreMessages) return;

        const { scrollTop } = messagesContainerRef.current;

        // Load more messages when scrolled to top
        if (scrollTop === 0) {
            onLoadMore();
        }
    };

    if (loading && messages.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <Loader className="w-6 h-6 text-gray-400 animate-spin mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">Loading messages...</p>
                </div>
            </div>
        );
    }

    if (messages.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Start the conversation</h3>
                    <p className="text-gray-500 max-w-sm">
                        Send a message to begin collaborating with your team members.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto bg-gray-50"
        >
            {/* Load more indicator */}
            {hasMoreMessages && (
                <div className="text-center py-4">
                    <button
                        onClick={onLoadMore}
                        disabled={loading}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50"
                    >
                        {loading ? 'Loading...' : 'Load more messages'}
                    </button>
                </div>
            )}

            {/* Messages */}
            <div className="space-y-1">
                {messages.map((message, index) => {
                    const previousMessage = index > 0 ? messages[index - 1] : undefined;
                    const shouldGroup = shouldGroupMessage(message, previousMessage);
                    const showDateDivider = shouldShowDateDivider(message, previousMessage);
                    const isCurrentUser = message.sender_id === currentUserId;

                    return (
                        <div key={message.id}>
                            {/* Date divider */}
                            {showDateDivider && (
                                <div className="sticky top-0 z-10 flex items-center justify-center py-4">
                                    <div className="bg-white border border-gray-200 rounded-full px-4 py-2 shadow-sm">
                                        <span className="text-sm font-medium text-gray-600">
                                            {formatDateDivider(message.created_at)}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Message */}
                            <MessageBubble
                                message={message}
                                isCurrentUser={isCurrentUser}
                                showAvatar={!shouldGroup}
                                onEdit={onEditMessage}
                                onDelete={onDeleteMessage}
                            />
                        </div>
                    );
                })}
            </div>

            {/* Typing indicators */}
            {typingUsers.length > 0 && (
                <div className="px-4 py-2">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <div className="flex gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span>
                            {typingUsers.length === 1
                                ? `${typingUsers[0].userName} is typing...`
                                : typingUsers.length === 2
                                    ? `${typingUsers[0].userName} and ${typingUsers[1].userName} are typing...`
                                    : `${typingUsers[0].userName} and ${typingUsers.length - 1} others are typing...`
                            }
                        </span>
                    </div>
                </div>
            )}

            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
        </div>
    );
} 