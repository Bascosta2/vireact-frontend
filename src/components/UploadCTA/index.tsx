import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaYoutube, FaInstagram, FaFacebook } from 'react-icons/fa';
import { SiTiktok } from 'react-icons/si';
import VideoURLInput from '@/components/UI/VideoURLInput'

interface UploadCTAInterface {
    uploadButtonText?: string;
    onUploadClick?: () => void;
}

type PlatformType = 'youtube' | 'instagram' | 'tiktok' | 'facebook' | null;

function detectPlatform(url: string): PlatformType {
    if (!url || !url.trim()) return null;
    
    const lowerUrl = url.toLowerCase();
    
    // YouTube Shorts detection
    if (lowerUrl.includes('youtube.com/shorts') || lowerUrl.includes('youtu.be') || lowerUrl.includes('youtube.com/watch')) {
        return 'youtube';
    }
    
    // Instagram Reel detection
    if (lowerUrl.includes('instagram.com/reel') || lowerUrl.includes('instagram.com/p/')) {
        return 'instagram';
    }
    
    // TikTok detection
    if (lowerUrl.includes('tiktok.com')) {
        return 'tiktok';
    }
    
    // Facebook Reel detection
    if (lowerUrl.includes('facebook.com/reel') || lowerUrl.includes('fb.com/reel')) {
        return 'facebook';
    }
    
    return null;
}

function UploadCTA({ uploadButtonText = "Upload Here", onUploadClick }: UploadCTAInterface) {
    const [urlValue, setUrlValue] = useState('');
    const navigate = useNavigate();
    
    const platform = detectPlatform(urlValue);
    const hasUrl = urlValue.trim().length > 0;
    
    const platformIcons: Record<NonNullable<PlatformType>, React.ReactElement> = {
        youtube: <FaYoutube className="w-6 h-6" />,
        instagram: <FaInstagram className="w-6 h-6" />,
        tiktok: <SiTiktok className="w-6 h-6" />,
        facebook: <FaFacebook className="w-6 h-6" />
    };
    
    const handleButtonClick = () => {
        if (onUploadClick) {
            onUploadClick();
        } else {
            navigate('/signup');
        }
    };

    return (
        <div className="flex justify-center w-full mb-6">
            <div className="flex items-center flex-col sm:flex-row gap-6">
                <VideoURLInput
                    value={urlValue}
                    onChange={setUrlValue}
                />
                {!hasUrl && (
                    <>
                        <p className="text-sm text-gray-400">or</p>
                        <button
                            className="btn-secondary px-8 py-4 text-lg border-none !rounded-full"
                            onClick={handleButtonClick}
                        >
                            {uploadButtonText}
                        </button>
                    </>
                )}
                {hasUrl && platform && (
                    <button
                        className="btn-secondary px-8 py-4 text-lg border-none !rounded-full flex items-center justify-center z-10"
                        onClick={handleButtonClick}
                        aria-label={`Upload from ${platform}`}
                    >
                        {platformIcons[platform]}
                    </button>
                )}
            </div>
        </div>
    )
}

export default UploadCTA