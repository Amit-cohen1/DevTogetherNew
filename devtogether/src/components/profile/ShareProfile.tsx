import React, { useState, useEffect } from 'react';
import { Share2, Copy, QrCode, Globe, Lock, Twitter, Linkedin, CheckCircle, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { profileService, ShareableProfile } from '../../services/profileService';
import { Button } from '../ui/Button';

interface ShareProfileProps {
    userId: string;
    className?: string;
}

export const ShareProfile: React.FC<ShareProfileProps> = ({
    userId,
    className = ''
}) => {
    const [shareData, setShareData] = useState<ShareableProfile | null>(null);
    const [isPublic, setIsPublic] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [copiedUrl, setCopiedUrl] = useState(false);
    const [showQRCode, setShowQRCode] = useState(false);
    const [migrationNeeded, setMigrationNeeded] = useState(false);

    useEffect(() => {
        generateShareLink();
    }, [userId]);

    const generateShareLink = async () => {
        try {
            setIsLoading(true);
            const data = await profileService.generateShareableProfile(userId);
            setShareData(data);
            setIsPublic(data.isPublic);

            // Check if this is a fallback response (indicates migration needed)
            if (data.shareToken.startsWith('fallback-')) {
                setMigrationNeeded(true);
            }
        } catch (error) {
            console.error('Error generating share link:', error);
            setMigrationNeeded(true);
        } finally {
            setIsLoading(false);
        }
    };

    const togglePrivacy = async () => {
        if (migrationNeeded) return;

        try {
            setIsLoading(true);
            const newPublicStatus = !isPublic;
            await profileService.updatePrivacySettings(userId, newPublicStatus);
            setIsPublic(newPublicStatus);

            // Regenerate share link to reflect new privacy setting
            await generateShareLink();
        } catch (error) {
            console.error('Error updating privacy settings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = async () => {
        if (!shareData) return;

        try {
            await navigator.clipboard.writeText(shareData.shareUrl);
            setCopiedUrl(true);
            setTimeout(() => setCopiedUrl(false), 2000);
        } catch (error) {
            console.error('Error copying to clipboard:', error);
        }
    };

    const shareToSocial = (platform: 'twitter' | 'linkedin') => {
        if (!shareData) return;

        const text = "Check out my DevTogether profile!";
        const url = shareData.shareUrl;

        let shareUrl = '';

        if (platform === 'twitter') {
            shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        } else if (platform === 'linkedin') {
            shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        }

        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=400');
        }
    };

    const handleNativeShare = async () => {
        if (!shareData) return;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'My DevTogether Profile',
                    text: 'Check out my developer profile on DevTogether!',
                    url: shareData.shareUrl
                });
            } catch (error) {
                console.error('Error sharing:', error);
            }
        } else {
            // Fallback to copy
            copyToClipboard();
        }
    };

    if (isLoading && !shareData) {
        return (
            <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
                <div className="p-6">
                    <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                        <div className="h-3 bg-gray-200 rounded w-2/3" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Share2 className="w-5 h-5 text-blue-600" />
                    Share Profile
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                    Share your professional profile with others
                </p>
            </div>

            <div className="p-6 space-y-6">
                {/* Migration Warning */}
                {migrationNeeded && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                            <div>
                                <h3 className="font-medium text-amber-800 mb-1">
                                    Enhanced Sharing Features Pending
                                </h3>
                                <p className="text-sm text-amber-700 mb-2">
                                    Advanced sharing features require a database update. Basic profile sharing is available below.
                                </p>
                                <p className="text-xs text-amber-600">
                                    Contact your administrator to apply the profile enhancement migration.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Privacy Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                        {isPublic ? (
                            <Globe className="w-5 h-5 text-green-600" />
                        ) : (
                            <Lock className="w-5 h-5 text-red-600" />
                        )}
                        <div>
                            <h3 className="font-medium text-gray-900">
                                Profile Visibility
                            </h3>
                            <p className="text-sm text-gray-600">
                                {migrationNeeded
                                    ? 'Profile sharing uses basic functionality until database is updated'
                                    : isPublic
                                        ? 'Your profile is public and can be shared'
                                        : 'Your profile is private and cannot be shared'
                                }
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={togglePrivacy}
                        disabled={isLoading || migrationNeeded}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${migrationNeeded
                            ? 'bg-gray-300 cursor-not-allowed'
                            : isPublic ? 'bg-green-600' : 'bg-gray-300'
                            }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isPublic && !migrationNeeded ? 'translate-x-6' : 'translate-x-1'
                                }`}
                        />
                    </button>
                </div>

                {/* Share Options */}
                {shareData && (
                    <>
                        {/* Share URL */}
                        <div className="space-y-3">
                            <h3 className="font-medium text-gray-900">Share Link</h3>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 p-3 bg-gray-50 rounded-lg border text-sm text-gray-700 font-mono break-all">
                                    {shareData.shareUrl}
                                </div>
                                <Button
                                    onClick={copyToClipboard}
                                    variant="outline"
                                    size="sm"
                                    className="flex-shrink-0"
                                >
                                    {copiedUrl ? (
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                    ) : (
                                        <Copy className="w-4 h-4" />
                                    )}
                                </Button>
                            </div>
                            {copiedUrl && (
                                <p className="text-sm text-green-600 flex items-center gap-1">
                                    <CheckCircle className="w-4 h-4" />
                                    Link copied to clipboard!
                                </p>
                            )}
                            {migrationNeeded && (
                                <p className="text-xs text-amber-600">
                                    ⚠️ This link redirects to your regular profile page until the database migration is applied.
                                </p>
                            )}
                        </div>

                        {/* Social Media Sharing */}
                        <div className="space-y-3">
                            <h3 className="font-medium text-gray-900">Share on Social Media</h3>
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={() => shareToSocial('twitter')}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    <Twitter className="w-4 h-4" />
                                    Twitter
                                </button>
                                <button
                                    onClick={() => shareToSocial('linkedin')}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
                                >
                                    <Linkedin className="w-4 h-4" />
                                    LinkedIn
                                </button>
                                {typeof navigator !== 'undefined' && 'share' in navigator && (
                                    <button
                                        onClick={handleNativeShare}
                                        className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                    >
                                        <Share2 className="w-4 h-4" />
                                        Share
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* QR Code */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="font-medium text-gray-900">QR Code</h3>
                                <button
                                    onClick={() => setShowQRCode(!showQRCode)}
                                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                                >
                                    {showQRCode ? (
                                        <>
                                            <EyeOff className="w-4 h-4" />
                                            Hide
                                        </>
                                    ) : (
                                        <>
                                            <Eye className="w-4 h-4" />
                                            Show
                                        </>
                                    )}
                                </button>
                            </div>

                            {showQRCode && (
                                <div className="flex justify-center p-4 bg-white border rounded-lg">
                                    <img
                                        src={shareData.qrCodeUrl}
                                        alt="Profile QR Code"
                                        className="w-32 h-32"
                                    />
                                </div>
                            )}

                            <p className="text-xs text-gray-600 text-center">
                                Scan with any QR code reader to visit profile
                            </p>
                        </div>
                    </>
                )}

                {/* Private Profile Message */}
                {!isPublic && !migrationNeeded && (
                    <div className="text-center py-8">
                        <Lock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Profile is Private
                        </h3>
                        <p className="text-gray-600 max-w-md mx-auto">
                            Your profile is currently private. Enable public visibility to share
                            your profile with others and showcase your skills.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}; 