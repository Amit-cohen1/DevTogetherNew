import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, Paperclip } from 'lucide-react';

interface MessageInputProps {
    onSendMessage: (content: string) => void;
    onTyping: (isTyping: boolean) => void;
    disabled?: boolean;
    placeholder?: string;
}

export default function MessageInput({
    onSendMessage,
    onTyping,
    disabled = false,
    placeholder = "Type a message..."
}: MessageInputProps) {
    const [message, setMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'inherit';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    }, [message]);

    // Handle typing indicators
    useEffect(() => {
        if (message.trim() && !isTyping) {
            setIsTyping(true);
            onTyping(true);
        } else if (!message.trim() && isTyping) {
            setIsTyping(false);
            onTyping(false);
        }

        // Clear previous timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout to stop typing indicator
        if (message.trim()) {
            typingTimeoutRef.current = setTimeout(() => {
                setIsTyping(false);
                onTyping(false);
            }, 2000);
        }

        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, [message, isTyping, onTyping]);

    const handleSend = () => {
        if (message.trim() && !disabled) {
            onSendMessage(message.trim());
            setMessage('');
            setIsTyping(false);
            onTyping(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const canSend = message.trim().length > 0 && !disabled;

    return (
        <div className="border-t border-gray-200 bg-white p-4">
            <div className="flex items-end gap-3">
                {/* Attachment button (future feature) */}
                <button
                    disabled
                    className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-gray-100 transition-colors"
                    title="File attachments (coming soon)"
                >
                    <Paperclip className="w-5 h-5" />
                </button>

                {/* Message input container */}
                <div className="flex-1 relative">
                    <div className="relative border border-gray-300 rounded-lg bg-white focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                        <textarea
                            ref={textareaRef}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={placeholder}
                            disabled={disabled}
                            rows={1}
                            className="w-full p-3 pr-12 border-0 rounded-lg resize-none focus:outline-none disabled:bg-gray-50 disabled:text-gray-500"
                            style={{ minHeight: '44px', maxHeight: '120px' }}
                        />

                        {/* Emoji button (future feature) */}
                        <button
                            disabled
                            className="absolute right-3 bottom-3 p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
                            title="Emoji (coming soon)"
                        >
                            <Smile className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Character counter for long messages */}
                    {message.length > 500 && (
                        <div className="absolute -top-6 right-0 text-xs text-gray-500">
                            {message.length}/2000
                        </div>
                    )}
                </div>

                {/* Send button */}
                <button
                    onClick={handleSend}
                    disabled={!canSend}
                    className={`p-2 rounded-lg transition-colors ${canSend
                            ? 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                    title={canSend ? 'Send message' : 'Type a message to send'}
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>

            {/* Formatting hints */}
            <div className="mt-2 text-xs text-gray-500">
                <span>Press Enter to send, Shift + Enter for new line</span>
            </div>
        </div>
    );
} 