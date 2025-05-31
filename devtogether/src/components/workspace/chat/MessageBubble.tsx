import React, { useState } from 'react';
import { MoreHorizontal, Edit3, Trash2, User } from 'lucide-react';
import { MessageWithUser } from '../../../services/messageService';

interface MessageBubbleProps {
    message: MessageWithUser;
    isCurrentUser: boolean;
    showAvatar: boolean;
    onEdit?: (messageId: string, newContent: string) => void;
    onDelete?: (messageId: string) => void;
}

export default function MessageBubble({
    message,
    isCurrentUser,
    showAvatar,
    onEdit,
    onDelete
}: MessageBubbleProps) {
    const [showActions, setShowActions] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(message.content);

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const handleEdit = () => {
        if (editContent.trim() && editContent !== message.content) {
            onEdit?.(message.id, editContent.trim());
        }
        setIsEditing(false);
    };

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this message?')) {
            onDelete?.(message.id);
        }
        setShowActions(false);
    };

    const displayName = message.sender.role === 'organization'
        ? message.sender.organization_name || 'Organization'
        : `${message.sender.first_name || ''} ${message.sender.last_name || ''}`.trim() || 'User';

    return (
        <div
            className={`flex gap-3 group hover:bg-gray-50 px-4 py-2 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'
                }`}
        >
            {/* Avatar */}
            {showAvatar && (
                <div className="flex-shrink-0">
                    {message.sender.avatar_url ? (
                        <img
                            src={message.sender.avatar_url}
                            alt={displayName}
                            className="w-8 h-8 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-500" />
                        </div>
                    )}
                </div>
            )}

            {/* Message Content */}
            <div className={`flex-1 min-w-0 ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                {/* Header with name and timestamp */}
                {showAvatar && (
                    <div className={`flex items-center gap-2 mb-1 ${isCurrentUser ? 'justify-end' : 'justify-start'
                        }`}>
                        <span className="text-sm font-medium text-gray-900">
                            {displayName}
                        </span>
                        <span className="text-xs text-gray-500">
                            {formatTime(message.created_at)}
                        </span>
                        {message.updated_at !== message.created_at && (
                            <span className="text-xs text-gray-400 italic">
                                (edited)
                            </span>
                        )}
                    </div>
                )}

                {/* Message bubble */}
                <div className={`inline-block max-w-sm lg:max-w-md xl:max-w-lg ${isCurrentUser
                    ? 'bg-blue-600 text-white rounded-l-2xl rounded-tr-2xl rounded-br-md'
                    : 'bg-white border border-gray-200 text-gray-900 rounded-r-2xl rounded-tl-2xl rounded-bl-md'
                    }`}>
                    {isEditing ? (
                        <div className="p-3">
                            <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg text-gray-900 text-sm resize-none"
                                rows={3}
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleEdit();
                                    } else if (e.key === 'Escape') {
                                        setIsEditing(false);
                                        setEditContent(message.content);
                                    }
                                }}
                            />
                            <div className="flex gap-2 mt-2">
                                <button
                                    onClick={handleEdit}
                                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setEditContent(message.content);
                                    }}
                                    className="px-3 py-1 text-xs bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-3">
                            <p className="text-sm whitespace-pre-wrap break-words">
                                {message.content}
                            </p>
                        </div>
                    )}
                </div>

                {/* Timestamp for non-avatar messages */}
                {!showAvatar && (
                    <div className={`text-xs text-gray-400 mt-1 ${isCurrentUser ? 'text-right' : 'text-left'
                        }`}>
                        {formatTime(message.created_at)}
                        {message.updated_at !== message.created_at && (
                            <span className="ml-1 italic">(edited)</span>
                        )}
                    </div>
                )}
            </div>

            {/* Actions Menu - Simple hover approach */}
            {isCurrentUser && !isEditing && (
                <div
                    className="flex-shrink-0 relative"
                    onMouseEnter={() => setShowActions(true)}
                    onMouseLeave={() => setShowActions(false)}
                >
                    {/* Menu Button - Always visible on group hover */}
                    <button
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <MoreHorizontal className="w-4 h-4" />
                    </button>

                    {/* Dropdown Menu */}
                    {showActions && (
                        <div className="absolute top-8 left-0 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 min-w-[120px]">
                            <button
                                onClick={() => {
                                    setIsEditing(true);
                                    setShowActions(false);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                                <Edit3 className="w-3 h-3" />
                                Edit
                            </button>
                            <button
                                onClick={handleDelete}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                                <Trash2 className="w-3 h-3" />
                                Delete
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
} 