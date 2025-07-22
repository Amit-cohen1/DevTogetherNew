import { supabase } from '../utils/supabase';
import { toastService } from './toastService';

export interface ProjectFile {
    id: string;
    project_id: string;
    uploader_id: string;
    file_name: string;
    file_size: number;
    file_type: string;
    file_url: string;
    category: 'attachment' | 'document' | 'image' | 'other';
    created_at: string;
    uploader: {
        first_name?: string;
        last_name?: string;
        organization_name?: string;
        avatar_url?: string;
    };
}

export interface FileUploadResult {
    success: boolean;
    file?: ProjectFile;
    error?: string;
}

export type FileCategory = 'attachment' | 'document' | 'image' | 'other';

class FileService {
    private readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB limit
    private readonly ALLOWED_TYPES = [
        // Images
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
        // Documents
        'application/pdf', 'text/plain', 'text/markdown',
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        // Code files
        'text/javascript', 'text/typescript', 'text/css', 'text/html', 'application/json',
        'text/x-python', 'text/x-java', 'text/x-c', 'text/x-php',
        // Archives
        'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'
    ];

    /**
     * Upload a file to project workspace
     */
    async uploadFile(
        projectId: string,
        uploaderId: string,
        file: File,
        category: FileCategory = 'other'
    ): Promise<FileUploadResult> {
        try {
            // Validate file
            const validation = this.validateFile(file);
            if (!validation.valid) {
                return { success: false, error: validation.error };
            }

            // Generate unique filename
            const fileExt = file.name.split('.').pop()?.toLowerCase() || 'bin';
            const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const fileName = `projects/${projectId}/files/${Date.now()}-${sanitizedName}`;

            // Upload to Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('project-files')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) {
                console.error('Upload error:', uploadError);
                return { success: false, error: `Upload failed: ${uploadError.message}` };
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('project-files')
                .getPublicUrl(uploadData.path);

            // Save file metadata to database
            const { data: fileData, error: dbError } = await supabase
                .from('project_files')
                .insert({
                    project_id: projectId,
                    uploader_id: uploaderId,
                    file_name: file.name,
                    file_size: file.size,
                    file_type: file.type,
                    file_url: publicUrl,
                    category
                })
                .select(`
                    *,
                    uploader:profiles!project_files_uploader_id_fkey(
                        first_name,
                        last_name,
                        organization_name,
                        avatar_url
                    )
                `)
                .single();

            if (dbError) {
                console.error('Database error:', dbError);
                // Clean up uploaded file
                await supabase.storage.from('project-files').remove([uploadData.path]);
                return { success: false, error: 'Failed to save file information' };
            }

            toastService.success(`File "${file.name}" uploaded successfully!`);
            return { success: true, file: fileData };
        } catch (error) {
            console.error('Error uploading file:', error);
            return { success: false, error: 'Upload failed. Please try again.' };
        }
    }

    /**
     * Get all files for a project
     */
    async getProjectFiles(projectId: string): Promise<ProjectFile[]> {
        try {
            const { data, error } = await supabase
                .from('project_files')
                .select(`
                    *,
                    uploader:profiles!project_files_uploader_id_fkey(
                        first_name,
                        last_name,
                        organization_name,
                        avatar_url
                    )
                `)
                .eq('project_id', projectId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching project files:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Error fetching project files:', error);
            return [];
        }
    }

    /**
     * Delete a file
     */
    async deleteFile(fileId: string, userId: string): Promise<{ success: boolean; error?: string }> {
        try {
            // Get file data first to check permissions and get file path
            const { data: file, error: fetchError } = await supabase
                .from('project_files')
                .select('file_url, uploader_id, project_id, projects(organization_id)')
                .eq('id', fileId)
                .single();

            if (fetchError || !file) {
                return { success: false, error: 'File not found' };
            }

            // Check permissions - only uploader or project owner can delete
            const canDelete = file.uploader_id === userId || file.projects?.organization_id === userId;
            if (!canDelete) {
                return { success: false, error: 'Permission denied' };
            }

            // Extract file path from URL
            const urlParts = file.file_url.split('/project-files/');
            const filePath = urlParts[1];

            // Delete from database first
            const { error: dbError } = await supabase
                .from('project_files')
                .delete()
                .eq('id', fileId);

            if (dbError) {
                console.error('Database delete error:', dbError);
                return { success: false, error: 'Failed to delete file' };
            }

            // Delete from storage
            if (filePath) {
                await supabase.storage
                    .from('project-files')
                    .remove([filePath]);
            }

            toastService.success('File deleted successfully');
            return { success: true };
        } catch (error) {
            console.error('Error deleting file:', error);
            return { success: false, error: 'Delete failed. Please try again.' };
        }
    }

    /**
     * Validate file before upload
     */
    private validateFile(file: File): { valid: boolean; error?: string } {
        // Check file size
        if (file.size > this.MAX_FILE_SIZE) {
            return { valid: false, error: 'File size must be less than 50MB' };
        }

        // Check file type
        if (!this.ALLOWED_TYPES.includes(file.type)) {
            return { valid: false, error: 'File type not supported' };
        }

        // Check filename
        if (!file.name || file.name.length > 255) {
            return { valid: false, error: 'Invalid filename' };
        }

        return { valid: true };
    }

    /**
     * Get file category from MIME type
     */
    getFileCategory(mimeType: string): FileCategory {
        if (mimeType.startsWith('image/')) return 'image';
        if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text/')) return 'document';
        return 'other';
    }

    /**
     * Format file size for display
     */
    formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Get file icon based on type
     */
    getFileIcon(mimeType: string): string {
        if (mimeType.startsWith('image/')) return '🖼️';
        if (mimeType.includes('pdf')) return '📄';
        if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
        if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
        if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📋';
        if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return '📦';
        if (mimeType.includes('javascript') || mimeType.includes('typescript') || mimeType.includes('json')) return '⚡';
        if (mimeType.includes('python')) return '🐍';
        if (mimeType.includes('java')) return '☕';
        return '📁';
    }
}

export const fileService = new FileService(); 