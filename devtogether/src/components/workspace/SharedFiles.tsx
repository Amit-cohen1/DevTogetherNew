import React, { useState, useEffect } from 'react';
import { FileText, Download, Trash2, Upload, Filter, Search, Calendar, User, FolderOpen } from 'lucide-react';
import { fileService, ProjectFile, FileCategory } from '../../services/fileService';
import { useAuth } from '../../contexts/AuthContext';

interface SharedFilesProps {
    projectId: string;
    isOwner: boolean;
    canDeleteAnyFile?: boolean;
    userRole?: 'organization' | 'developer' | 'admin' | null;
    userId?: string;
}

export default function SharedFiles({ projectId, isOwner, canDeleteAnyFile = false, userRole, userId }: SharedFilesProps) {
    const { user } = useAuth();
    const [files, setFiles] = useState<ProjectFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<FileCategory | 'all'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date');

    // Load files
    useEffect(() => {
        loadFiles();
    }, [projectId]);

    const loadFiles = async () => {
        setLoading(true);
        try {
            const projectFiles = await fileService.getProjectFiles(projectId);
            setFiles(projectFiles);
        } catch (error) {
            console.error('Error loading files:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (file: File) => {
        if (!user) return;

        setUploading(true);
        try {
            const result = await fileService.uploadFile(
                projectId,
                user.id,
                file,
                fileService.getFileCategory(file.type)
            );

            if (result.success && result.file) {
                setFiles(prev => [result.file!, ...prev]);
            }
        } catch (error) {
            console.error('Error uploading file:', error);
        } finally {
            setUploading(false);
        }
    };

    const handleFileDelete = async (fileId: string) => {
        if (!user || !window.confirm('Are you sure you want to delete this file?')) return;

        try {
            const result = await fileService.deleteFile(fileId, user.id);
            if (result.success) {
                setFiles(prev => prev.filter(f => f.id !== fileId));
            }
        } catch (error) {
            console.error('Error deleting file:', error);
        }
    };

    const handleFileDownload = (file: ProjectFile) => {
        window.open(file.file_url, '_blank');
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const droppedFiles = Array.from(e.dataTransfer.files);
        droppedFiles.forEach(handleFileUpload);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    // Filter and sort files
    const filteredFiles = files
        .filter(file => {
            const matchesCategory = selectedCategory === 'all' || file.category === selectedCategory;
            const matchesSearch = file.file_name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.file_name.localeCompare(b.file_name);
                case 'size':
                    return b.file_size - a.file_size;
                case 'date':
                default:
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            }
        });

    const getUserDisplayName = (file: ProjectFile) => {
        const uploader = file.uploader;
        if (uploader.organization_name) {
            return uploader.organization_name;
        }
        return `${uploader.first_name || ''} ${uploader.last_name || ''}`.trim() || 'Unknown User';
    };

    const canDeleteFile = (file: ProjectFile) => {
        if (!user) return false;
        
        // Admin, project owner, or status manager can delete any file
        if (canDeleteAnyFile) return true;
        
        // Regular developers can only delete their own files
        return file.uploader_id === user.id;
    };

    const categories: { value: FileCategory | 'all'; label: string; count: number }[] = [
        { value: 'all', label: 'All Files', count: files.length },
        { value: 'image', label: 'Images', count: files.filter(f => f.category === 'image').length },
        { value: 'document', label: 'Documents', count: files.filter(f => f.category === 'document').length },
        { value: 'other', label: 'Other', count: files.filter(f => f.category === 'other').length },
    ];

    if (loading) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <Upload className="w-8 h-8 text-gray-400 animate-pulse mx-auto mb-4" />
                        <p className="text-gray-600">Loading files...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <FolderOpen className="w-5 h-5" />
                        Shared Files
                    </h3>
                    <div className="flex items-center gap-2">
                        <input
                            type="file"
                            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                            className="hidden"
                            id="file-upload"
                            multiple
                        />
                        <label
                            htmlFor="file-upload"
                            className={`flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer ${
                                uploading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            <Upload className={`w-4 h-4 ${uploading ? 'animate-spin' : ''}`} />
                            {uploading ? 'Uploading...' : 'Upload File'}
                        </label>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search files..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    {/* Category Filter */}
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value as FileCategory | 'all')}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        {categories.map(category => (
                            <option key={category.value} value={category.value}>
                                {category.label} ({category.count})
                            </option>
                        ))}
                    </select>

                    {/* Sort */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'size')}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="date">Sort by Date</option>
                        <option value="name">Sort by Name</option>
                        <option value="size">Sort by Size</option>
                    </select>
                </div>
            </div>

            {/* Drop Zone */}
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="p-4 border-b border-gray-200 bg-gray-50"
            >
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                        Drag and drop files here, or{' '}
                        <label htmlFor="file-upload" className="text-blue-600 hover:text-blue-700 cursor-pointer">
                            click to browse
                        </label>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        Supports images, documents, code files, and archives (max 50MB)
                    </p>
                    {userRole === 'developer' && !canDeleteAnyFile && (
                        <p className="text-xs text-amber-600 mt-2 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                            📝 You can delete only your own files. Project owners and status managers can delete any file.
                        </p>
                    )}
                </div>
            </div>

            {/* Files List */}
            <div className="p-6">
                {filteredFiles.length === 0 ? (
                    <div className="text-center py-12">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 mb-2">No files yet</h4>
                        <p className="text-gray-600 mb-4">
                            {files.length === 0 
                                ? "Upload your first file to start sharing with your team."
                                : "No files match your current filters."
                            }
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredFiles.map(file => (
                            <div
                                key={file.id}
                                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="text-2xl">
                                        {fileService.getFileIcon(file.file_type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-gray-900 truncate">
                                            {file.file_name}
                                        </h4>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <User className="w-3 h-3" />
                                                {getUserDisplayName(file)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(file.created_at).toLocaleDateString()}
                                            </span>
                                            <span>{fileService.formatFileSize(file.file_size)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleFileDownload(file)}
                                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Download file"
                                    >
                                        <Download className="w-4 h-4" />
                                    </button>
                                    {canDeleteFile(file) && (
                                        <button
                                            onClick={() => handleFileDelete(file.id)}
                                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete file"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
} 