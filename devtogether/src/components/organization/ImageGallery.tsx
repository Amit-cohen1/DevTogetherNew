import React, { useState, useRef } from 'react'
import { OrganizationImage, ImageCategory } from '../../types/database'
import {
    Camera,
    X,
    ChevronLeft,
    ChevronRight,
    Upload,
    Trash2,
    Plus,
    Image as ImageIcon,
    Grid3X3,
    Filter
} from 'lucide-react'

interface ImageGalleryProps {
    images: OrganizationImage[]
    isOwnProfile?: boolean
    onImageUpload?: (file: File, category: ImageCategory, title?: string, description?: string) => Promise<void>
    onImageDelete?: (imageId: string) => Promise<void>
    className?: string
}

// Create a non-null version of ImageCategory for Record types
type NonNullImageCategory = Exclude<ImageCategory, null>

const CATEGORY_LABELS: Record<NonNullImageCategory, string> = {
    team: 'Team',
    office: 'Office',
    events: 'Events',
    projects: 'Projects',
    impact: 'Impact'
}

const CATEGORY_COLORS: Record<NonNullImageCategory, string> = {
    team: 'bg-blue-100 text-blue-800',
    office: 'bg-green-100 text-green-800',
    events: 'bg-purple-100 text-purple-800',
    projects: 'bg-orange-100 text-orange-800',
    impact: 'bg-red-100 text-red-800'
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
    images,
    isOwnProfile = false,
    onImageUpload,
    onImageDelete,
    className = ''
}) => {
    const [selectedCategory, setSelectedCategory] = useState<ImageCategory | 'all'>('all')
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
    const [uploadingCategory, setUploadingCategory] = useState<ImageCategory | null>(null)
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Filter images by category
    const filteredImages = selectedCategory === 'all'
        ? images
        : images.filter(img => img.category === selectedCategory)

    // Category counts - only count images with non-null categories
    const categoryCounts = images.reduce((acc, img) => {
        if (img.category && img.category !== null) {
            acc[img.category as NonNullImageCategory] = (acc[img.category as NonNullImageCategory] || 0) + 1
        }
        return acc
    }, {} as Record<NonNullImageCategory, number>)

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file || !uploadingCategory || !onImageUpload) return

        try {
            setUploading(true)
            await onImageUpload(file, uploadingCategory)
            setUploadingCategory(null)
        } catch (error) {
            console.error('Upload failed:', error)
        } finally {
            setUploading(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    const handleUploadClick = (category: ImageCategory) => {
        setUploadingCategory(category)
        fileInputRef.current?.click()
    }

    const openLightbox = (index: number) => {
        setLightboxIndex(index)
    }

    const closeLightbox = () => {
        setLightboxIndex(null)
    }

    const navigateLightbox = (direction: 'prev' | 'next') => {
        if (lightboxIndex === null) return

        const newIndex = direction === 'prev'
            ? (lightboxIndex - 1 + filteredImages.length) % filteredImages.length
            : (lightboxIndex + 1) % filteredImages.length

        setLightboxIndex(newIndex)
    }

    const handleDeleteImage = async (imageId: string) => {
        if (!onImageDelete) return

        try {
            await onImageDelete(imageId)
            // Close lightbox if deleted image was displayed
            if (lightboxIndex !== null && filteredImages[lightboxIndex]?.id === imageId) {
                closeLightbox()
            }
        } catch (error) {
            console.error('Delete failed:', error)
        }
    }

    if (images.length === 0 && !isOwnProfile) {
        return null
    }

    return (
        <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-purple-600" />
                    Photo Gallery
                    {images.length > 0 && (
                        <span className="text-sm text-gray-500">({images.length})</span>
                    )}
                </h2>

                {isOwnProfile && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleUploadClick('team')}
                            disabled={uploading}
                            className="inline-flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Add Photos
                        </button>
                    </div>
                )}
            </div>

            {/* Category Filters */}
            {images.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                    <button
                        onClick={() => setSelectedCategory('all')}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedCategory === 'all'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        All ({images.length})
                    </button>

                    {Object.entries(CATEGORY_LABELS).map(([category, label]) => {
                        const categoryKey = category as NonNullImageCategory
                        const count = categoryCounts[categoryKey] || 0
                        if (count === 0) return null

                        return (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(categoryKey)}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedCategory === categoryKey
                                    ? CATEGORY_COLORS[categoryKey]
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {label} ({count})
                            </button>
                        )
                    })}
                </div>
            )}

            {/* Image Grid */}
            {filteredImages.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredImages.map((image, index) => (
                        <div
                            key={image.id}
                            className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
                            onClick={() => openLightbox(index)}
                        >
                            <img
                                src={image.image_url}
                                alt={image.title || 'Organization photo'}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="w-8 h-8 text-white" />
                                </div>
                            </div>

                            {/* Category Badge */}
                            {image.category && image.category !== null && (
                                <div className="absolute top-2 left-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${CATEGORY_COLORS[image.category as NonNullImageCategory]}`}>
                                        {CATEGORY_LABELS[image.category as NonNullImageCategory]}
                                    </span>
                                </div>
                            )}

                            {/* Delete Button */}
                            {isOwnProfile && onImageDelete && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleDeleteImage(image.id)
                                    }}
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 text-white p-1.5 rounded-full hover:bg-red-700"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    ))}

                    {/* Add Photo Placeholder */}
                    {isOwnProfile && (
                        <div className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-purple-400 hover:bg-purple-50 transition-colors cursor-pointer group">
                            <div className="dropdown-wrapper relative">
                                <div className="flex flex-col items-center gap-2 p-4">
                                    <Plus className="w-8 h-8 text-gray-400 group-hover:text-purple-600" />
                                    <span className="text-sm text-gray-500 group-hover:text-purple-600 text-center">
                                        Add Photo
                                    </span>
                                </div>

                                {/* Quick category buttons */}
                                <div className="absolute top-full left-0 right-0 mt-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10">
                                    {Object.entries(CATEGORY_LABELS).map(([category, label]) => (
                                        <button
                                            key={category}
                                            onClick={() => handleUploadClick(category as NonNullImageCategory)}
                                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                /* Empty State */
                <div className="text-center py-12">
                    <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {isOwnProfile ? 'No photos yet' : 'No photos available'}
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        {isOwnProfile
                            ? 'Showcase your organization with photos of your team, office, events, and project outcomes.'
                            : 'This organization hasn\'t shared any photos yet.'
                        }
                    </p>
                    {isOwnProfile && (
                        <button
                            onClick={() => handleUploadClick('team')}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                        >
                            <Upload className="w-4 h-4" />
                            Upload First Photo
                        </button>
                    )}
                </div>
            )}

            {/* Lightbox */}
            {lightboxIndex !== null && filteredImages[lightboxIndex] && (
                <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
                    <div className="relative max-w-4xl max-h-full">
                        {/* Close Button */}
                        <button
                            onClick={closeLightbox}
                            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
                        >
                            <X className="w-8 h-8" />
                        </button>

                        {/* Navigation */}
                        {filteredImages.length > 1 && (
                            <>
                                <button
                                    onClick={() => navigateLightbox('prev')}
                                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
                                >
                                    <ChevronLeft className="w-8 h-8" />
                                </button>
                                <button
                                    onClick={() => navigateLightbox('next')}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
                                >
                                    <ChevronRight className="w-8 h-8" />
                                </button>
                            </>
                        )}

                        {/* Image */}
                        <img
                            src={filteredImages[lightboxIndex].image_url}
                            alt={filteredImages[lightboxIndex].title || 'Organization photo'}
                            className="max-w-full max-h-full object-contain"
                        />

                        {/* Image Info */}
                        <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 text-white p-4 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    {filteredImages[lightboxIndex].title && (
                                        <h3 className="font-medium mb-1">{filteredImages[lightboxIndex].title}</h3>
                                    )}
                                    {filteredImages[lightboxIndex].description && (
                                        <p className="text-sm text-gray-200">{filteredImages[lightboxIndex].description}</p>
                                    )}
                                </div>
                                <div className="text-sm text-gray-300">
                                    {lightboxIndex + 1} of {filteredImages.length}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Hidden File Input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
            />
        </div>
    )
} 