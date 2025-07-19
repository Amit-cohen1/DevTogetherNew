import React, { useState, useEffect } from 'react';
import {
    Share2,
    Copy,
    QrCode,
    Globe,
    Lock,
    Eye,
    EyeOff,
    Twitter,
    Linkedin,
    AlertTriangle,
    RefreshCw,
    Check,
    Shield,
    Star,
    Users
} from 'lucide-react';
import { profileService, ShareableProfile } from '../../services/profileService';
import { useAuth } from '../../contexts/AuthContext';
import { toastService } from '../../services/toastService';
import { supabase } from '../../utils/supabase';

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
    const [spotlightEnabled, setSpotlightEnabled] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [copiedUrl, setCopiedUrl] = useState(false);
    const [showQRCode, setShowQRCode] = useState(false);
    const [migrationNeeded, setMigrationNeeded] = useState(false);
    const [regeneratingSecurityString, setRegeneratingSecurityString] = useState(false);
    const { user: currentUser, updateProfile, profile: currentProfile } = useAuth();

    useEffect(() => {
        generateShareLink();
        loadSpotlightSetting();
    }, [userId, currentProfile]);

    const loadSpotlightSetting = async () => {
        try {
            // Use current profile if viewing own profile, otherwise make query
            if (currentUser?.id === userId && currentProfile) {
                setSpotlightEnabled((currentProfile as any).spotlight_enabled ?? true);
            } else {
                // For other users, query directly
                const { data, error } = await supabase
                    .from('profiles')
                    .select('spotlight_enabled')
                    .eq('id', userId)
                    .single();
                
                if (!error && data) {
                    setSpotlightEnabled(data.spotlight_enabled ?? true);
                }
            }
        } catch (error) {
            console.error('Error loading spotlight setting:', error);
        }
    };

    const toggleSpotlight = async () => {
        try {
            setIsLoading(true);
            const newSpotlightStatus = !spotlightEnabled;
            await profileService.updateSpotlightSettings(userId, newSpotlightStatus);
            setSpotlightEnabled(newSpotlightStatus);
            
            toastService.success(
                newSpotlightStatus 
                    ? '⭐ Spotlight enabled! You may appear in homepage rotation.'
                    : '⭐ Spotlight disabled. You will not appear in homepage rotation.'
            );
        } catch (error) {
            console.error('Error updating spotlight settings:', error);
            toastService.error('Failed to update spotlight setting');
        } finally {
            setIsLoading(false);
        }
    };

    const generateShareLink = async () => {
        try {
            setIsLoading(true);
            const data = await profileService.generateShareableProfile(userId);
            setShareData(data);
            setIsPublic(data.isPublic);

            // Check if this is a fallback response (indicates migration needed)
            if (data.shareToken.startsWith('fallback-') || data.securityString.startsWith('fallback-')) {
                setMigrationNeeded(true);
            } else {
                setMigrationNeeded(false);
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

    const regenerateSecurityString = async () => {
        if (migrationNeeded) return;

        // Confirmation dialog with strong warning
        const confirmed = window.confirm(
            '🔒 SECURITY WARNING\n\n' +
            'Regenerating your security string will:\n' +
            '• Immediately invalidate ALL existing profile links\n' +
            '• Break any bookmarks or shared URLs\n' +
            '• Require you to share new links\n\n' +
            'This action cannot be undone. Your profile will be completely locked from previous links.\n\n' +
            'Are you sure you want to regenerate your security string?'
        );

        if (!confirmed) return;

        try {
            setRegeneratingSecurityString(true);
            await profileService.regenerateSecurityString(userId);
            
            // Regenerate share link to get the new security string
            await generateShareLink();
            
            // Show success message
            alert('✅ Security string regenerated successfully!\n\nYour profile is now secured with a new unique URL. Previous links are no longer valid.');
        } catch (error) {
            console.error('Error regenerating security string:', error);
            alert('❌ Failed to regenerate security string. Please try again.');
        } finally {
            setRegeneratingSecurityString(false);
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
            <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Share2 className="w-5 h-5 text-blue-600" />
                    Share Profile
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                    Share your profile with organizations and other developers
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

                {/* Enhanced Privacy Toggle */}
                <div className={`border-2 rounded-xl p-4 transition-all ${migrationNeeded
                    ? 'border-gray-200 bg-gray-50'
                    : isPublic
                        ? 'border-green-200 bg-green-50'
                        : 'border-blue-200 bg-blue-50'
                    }`}>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${migrationNeeded
                                ? 'bg-gray-100'
                                : isPublic
                                    ? 'bg-green-100'
                                    : 'bg-blue-100'
                                }`}>
                                {migrationNeeded ? (
                                    <AlertTriangle className="w-5 h-5 text-gray-600" />
                                ) : isPublic ? (
                                    <Globe className="w-5 h-5 text-green-600" />
                                ) : (
                                    <Lock className="w-5 h-5 text-blue-600" />
                                )}
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">
                                    Profile Visibility
                                </h3>
                                <p className={`text-sm font-medium ${migrationNeeded
                                    ? 'text-gray-600'
                                    : isPublic
                                        ? 'text-green-700'
                                        : 'text-blue-700'
                                    }`}>
                                    {migrationNeeded
                                        ? 'Database update required'
                                        : isPublic
                                            ? '🌍 Public Profile'
                                            : '🔒 Private Profile'
                                    }
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={togglePrivacy}
                            disabled={isLoading || migrationNeeded}
                            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${migrationNeeded
                                ? 'bg-gray-300 cursor-not-allowed'
                                : isPublic ? 'bg-green-600' : 'bg-blue-600'
                                }`}
                        >
                            <span
                                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform ${isPublic && !migrationNeeded ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>
                    
                    {/* Detailed Privacy Explanation */}
                    {!migrationNeeded && (
                        <div className="space-y-2">
                            {isPublic ? (
                                <div className="text-sm text-green-800">
                                    <p className="font-medium mb-1">✅ Public Benefits:</p>
                                    <ul className="space-y-1 text-green-700">
                                        <li>• Discoverable in project searches</li>
                                        <li>• Can be shared on social media</li>
                                        <li>• Showcases your skills publicly</li>
                                        <li>• Increases collaboration opportunities</li>
                                    </ul>
                                </div>
                            ) : (
                                <div className="text-sm text-blue-800">
                                    <p className="font-medium mb-1">🔒 Private Benefits:</p>
                                    <ul className="space-y-1 text-blue-700">
                                        <li>• Not visible in public discovery</li>
                                        <li>• Still visible to project teams</li>
                                        <li>• Can only be accessed via secure URL</li>
                                        <li>• Maximum privacy protection</li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Enhanced Security String Section */}
                {!migrationNeeded && shareData && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-4 sm:p-5">
                        <div className="space-y-4 mb-4">
                            {/* Header section with icon and title */}
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                                    <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-semibold text-blue-900 text-sm sm:text-lg">Secure Profile URL</h3>
                                    <p className="text-xs sm:text-sm text-blue-700">Enhanced privacy protection</p>
                                </div>
                            </div>
                            
                            {/* Button positioned below the header */}
                            <div className="flex justify-start">
                                <button
                                    onClick={regenerateSecurityString}
                                    disabled={regeneratingSecurityString}
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                                    title="Regenerate security string (will invalidate current links)"
                                >
                                    <RefreshCw className={`w-4 h-4 ${regeneratingSecurityString ? 'animate-spin' : ''} flex-shrink-0`} />
                                    <span>
                                        {regeneratingSecurityString ? 'Regenerating...' : 'Regenerate'}
                                    </span>
                                </button>
                            </div>
                        </div>
                        
                        <div className="space-y-3 sm:space-y-4">
                            <div className="bg-white/50 rounded-lg p-3 sm:p-4 border border-blue-200">
                                <p className="text-sm text-blue-800 mb-2">
                                    <strong>Security ID:</strong> 
                                    <code className="bg-blue-100 px-2 py-1 rounded font-mono text-xs ml-2 break-all">{shareData.securityString}</code>
                                </p>
                                <p className="text-xs sm:text-sm text-blue-700">
                                    This unique identifier ensures only people with the exact link can access your profile.
                                </p>
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                                <div className="bg-white/50 rounded-lg p-3 sm:p-4 border border-blue-200">
                                    <p className="text-xs sm:text-sm font-medium text-blue-800 mb-2 flex items-center gap-1">
                                        🔒 Privacy Features:
                                    </p>
                                    <ul className="text-xs sm:text-sm text-blue-700 space-y-1.5">
                                        <li>• Unguessable URL structure</li>
                                        <li>• No profile discovery without link</li>
                                        <li>• Regenerate anytime for full reset</li>
                                    </ul>
                                </div>
                                
                                <div className="bg-white/50 rounded-lg p-3 sm:p-4 border border-blue-200">
                                    <p className="text-xs sm:text-sm font-medium text-blue-800 mb-2 flex items-center gap-1">
                                        ⚠️ Important Notes:
                                    </p>
                                    <ul className="text-xs sm:text-sm text-blue-700 space-y-1.5">
                                        <li>• Regenerating breaks existing links</li>
                                        <li>• Share new links after regeneration</li>
                                        <li>• Use for maximum privacy control</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Spotlight Toggle - Copy of Profile Visibility */}
                {(currentUser?.id === userId && (currentProfile?.role === 'developer' || currentProfile?.role === 'admin')) && (
                    <div className={`border-2 rounded-xl p-4 transition-all ${
                        spotlightEnabled
                            ? 'border-yellow-200 bg-yellow-50'
                            : 'border-gray-200 bg-gray-50'
                    }`}>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${
                                    spotlightEnabled
                                        ? 'bg-yellow-100'
                                        : 'bg-gray-100'
                                }`}>
                                    <Star className={`w-5 h-5 ${
                                        spotlightEnabled ? 'text-yellow-600' : 'text-gray-600'
                                    }`} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">
                                        Developer Spotlight
                                    </h3>
                                    <p className={`text-sm font-medium ${
                                        spotlightEnabled
                                            ? 'text-yellow-700'
                                            : 'text-gray-700'
                                    }`}>
                                        {spotlightEnabled
                                            ? '⭐ Spotlight Enabled'
                                            : '💡 Spotlight Disabled'
                                        }
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={toggleSpotlight}
                                disabled={isLoading}
                                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 ${
                                    spotlightEnabled ? 'bg-yellow-600' : 'bg-gray-300'
                                }`}
                            >
                                <span
                                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform ${
                                        spotlightEnabled ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </div>
                        
                        {/* Benefits List */}
                        <div className="space-y-2">
                            {spotlightEnabled ? (
                                <div className="text-sm text-yellow-800">
                                    <p className="font-medium mb-1">✅ Spotlight Benefits:</p>
                                    <ul className="space-y-1 text-yellow-700">
                                        <li>• Featured in homepage rotation</li>
                                        <li>• Increased profile visibility</li>
                                        <li>• More project opportunities</li>
                                        <li>• Community recognition</li>
                                    </ul>
                                </div>
                            ) : (
                                <div className="text-sm text-gray-800">
                                    <p className="font-medium mb-1">💡 Enable Spotlight to:</p>
                                    <ul className="space-y-1 text-gray-700">
                                        <li>• Get featured on homepage</li>
                                        <li>• Attract more project invites</li>
                                        <li>• Showcase your achievements</li>
                                        <li>• Build your reputation</li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Share Options - Always show QR code, social sharing only for public */}
                {shareData && (
                    <>
                        {/* Share URL - Always available */}
                        <div className="space-y-3">
                            <h3 className="font-medium text-gray-900">
                                {isPublic ? 'Share URL' : 'Private Share URL'}
                            </h3>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                    type="text"
                                    value={shareData.shareUrl}
                                    readOnly
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                                />
                                <button
                                    onClick={copyToClipboard}
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                                >
                                    {copiedUrl ? (
                                        <>
                                            <Check className="w-4 h-4" />
                                            <span className="hidden sm:inline">Copied!</span>
                                            <span className="sm:hidden">✓</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4" />
                                            <span className="hidden sm:inline">Copy</span>
                                            <span className="sm:hidden">Copy</span>
                                        </>
                                    )}
                                </button>
                            </div>
                            {!isPublic && (
                                <p className="text-xs text-blue-600">
                                    🔒 This secure URL can be shared privately with anyone, even though your profile is set to private.
                                </p>
                            )}
                        </div>

                        {/* Social Sharing - Only for public profiles - Fixed Overflow */}
                        {isPublic && (
                            <div className="space-y-3">
                                <h3 className="font-medium text-gray-900">Share on Social Media</h3>
                                <div className="flex flex-wrap gap-2 sm:gap-3">
                                    <button
                                        onClick={() => shareToSocial('twitter')}
                                        className="flex items-center gap-2 px-3 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors text-sm flex-shrink-0"
                                    >
                                        <Twitter className="w-4 h-4" />
                                        <span className="hidden sm:inline">Twitter</span>
                                        <span className="sm:hidden">X</span>
                                    </button>
                                    <button
                                        onClick={() => shareToSocial('linkedin')}
                                        className="flex items-center gap-2 px-3 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors text-sm flex-shrink-0"
                                    >
                                        <Linkedin className="w-4 h-4" />
                                        <span className="hidden sm:inline">LinkedIn</span>
                                        <span className="sm:hidden">In</span>
                                    </button>
                                    <button
                                        onClick={handleNativeShare}
                                        className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm flex-shrink-0"
                                    >
                                        <Share2 className="w-4 h-4" />
                                        <span className="hidden sm:inline">More</span>
                                        <span className="sm:hidden">+</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Enhanced QR Code */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                                    <QrCode className="w-5 h-5" />
                                    Secure QR Code
                                </h3>
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
                                <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                                    <div className="flex justify-center mb-3">
                                        <img
                                            src={shareData.qrCodeUrl}
                                            alt="Profile QR Code"
                                            className="w-32 h-32"
                                        />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-gray-900 mb-1">
                                            🔒 Secure QR Code
                                        </p>
                                        <p className="text-xs text-gray-600">
                                            Uses your unique security string for maximum privacy
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="bg-blue-50 rounded-lg p-3">
                                <p className="text-xs text-blue-800 font-medium mb-1">
                                    ✨ Enhanced QR Features:
                                </p>
                                <ul className="text-xs text-blue-700 space-y-1">
                                    <li>• Uses secure URL with your unique ID</li>
                                    <li>• Updates automatically when you regenerate security string</li>
                                    <li>• Works for both public and private profiles</li>
                                </ul>
                            </div>
                        </div>
                    </>
                )}

                {/* Private Profile Message */}
                {shareData && !isPublic && (
                    <div className="text-center py-8">
                        <Lock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Profile is Private
                        </h3>
                        <p className="text-gray-600 max-w-md mx-auto">
                            Your profile is currently private. You're still visible to your project teams,
                            but won't appear in public discovery. Enable public visibility to share
                            your profile with others and showcase your skills.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}; 