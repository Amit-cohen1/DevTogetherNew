import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, Paperclip, X, Upload } from 'lucide-react';
import { fileService } from '../../../services/fileService';
import { useAuth } from '../../../contexts/AuthContext';

interface MessageInputProps {
    projectId: string;
    onSendMessage: (content: string, attachmentId?: string) => void;
    onTyping: (isTyping: boolean) => void;
    disabled?: boolean;
    placeholder?: string;
}

export default function MessageInput({
    projectId,
    onSendMessage,
    onTyping,
    disabled = false,
    placeholder = "Type a message..."
}: MessageInputProps) {
    const { user } = useAuth();
    const [message, setMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadingFile, setUploadingFile] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
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

    const handleSend = async () => {
        if (!user || disabled || uploadingFile) return;
        
        let attachmentId: string | undefined = undefined;
        
        // Upload file first if one is selected
        if (selectedFile) {
            setUploadingFile(true);
            const result = await fileService.uploadFile(
                projectId,
                user.id,
                selectedFile,
                fileService.getFileCategory(selectedFile.type)
            );
            
            if (result.success && result.file) {
                attachmentId = result.file.id;
            } else {
                setUploadingFile(false);
                return; // Don't send message if file upload failed
            }
            setUploadingFile(false);
        }
        
        // Send message (can be empty if it's just a file)
        if (message.trim() || attachmentId) {
            onSendMessage(message.trim(), attachmentId);
            setMessage('');
            setSelectedFile(null);
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

    const handleFileSelect = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const removeSelectedFile = () => {
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const canSend = (message.trim().length > 0 || selectedFile) && !disabled && !uploadingFile;

    return (
        <div className="border-t border-gray-200 bg-white p-4">
            {/* Hidden file input */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,application/pdf,text/*,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.7z"
            />
            
            {/* File preview */}
            {selectedFile && (
                <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="text-2xl">
                                {fileService.getFileIcon(selectedFile.type)}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-blue-900">{selectedFile.name}</p>
                                <p className="text-xs text-blue-600">
                                    {fileService.formatFileSize(selectedFile.size)}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={removeSelectedFile}
                            className="p-1 text-blue-600 hover:text-blue-800 rounded"
                            title="Remove file"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
            
            <div className="flex items-end gap-3">
                {/* Attachment button */}
                <button
                    onClick={handleFileSelect}
                    disabled={disabled || uploadingFile}
                    className="p-2 text-gray-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-gray-100 transition-colors"
                    title="Attach file"
                >
                    {uploadingFile ? (
                        <Upload className="w-5 h-5 animate-pulse" />
                    ) : (
                    <Paperclip className="w-5 h-5" />
                    )}
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
                    title={uploadingFile ? 'Uploading...' : canSend ? 'Send message' : 'Type a message or attach a file to send'}
                >
                    {uploadingFile ? (
                        <Upload className="w-5 h-5 animate-spin" />
                    ) : (
                    <Send className="w-5 h-5" />
                    )}
                </button>
            </div>

            {/* Formatting hints */}
            <div className="mt-2 text-xs text-gray-500">
                <span>Press Enter to send, Shift + Enter for new line</span>
            </div>
        </div>
    );
} 