'use client';

import { useState } from 'react';
import { MealTrain } from '@/types';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import {
  FaFacebook,
  FaTwitter,
  FaEnvelope,
  FaWhatsapp,
  FaLink,
} from 'react-icons/fa';

interface ShareButtonsProps {
  train: MealTrain;
}

export default function ShareButtons({ train }: ShareButtonsProps) {
  const [isCopied, setIsCopied] = useState(false);

  // Get the current URL (works in browser)
  const getShareUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.href;
    }
    return '';
  };

  const shareUrl = getShareUrl();
  const shareTitle = `${train.recipientName}'s Meal Train`;
  const shareDescription = (train.description || '').substring(0, 200);

  // Copy link to clipboard
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setIsCopied(false), 3000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  // Share on Facebook
  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      shareUrl
    )}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
  };

  // Share on Twitter
  const handleTwitterShare = () => {
    const text = `Support ${shareTitle}! ${shareDescription}`;
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
      shareUrl
    )}&text=${encodeURIComponent(text)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
  };

  // Share via Email
  const handleEmailShare = () => {
    const subject = encodeURIComponent(shareTitle);
    const body = encodeURIComponent(
      `Hi,\n\nI wanted to share this meal train with you:\n\n${shareTitle}\n\n${shareDescription}\n\nYou can view and sign up here: ${shareUrl}\n\nThank you!`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  // Share on WhatsApp
  const handleWhatsAppShare = () => {
    const text = `Check out ${shareTitle}!\n\n${shareDescription}\n\n${shareUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Use Web Share API if available (for mobile)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareDescription,
          url: shareUrl,
        });
        toast.success('Shared successfully!');
      } catch (error) {
        // User cancelled or share failed
        console.error('Error sharing:', error);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            Share this Meal Train
          </h3>
          <p className="text-sm text-gray-600">
            Help spread the word and get more support
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Copy Link Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            leftIcon={<FaLink />}
            className="whitespace-nowrap"
          >
            {isCopied ? 'Copied!' : 'Copy Link'}
          </Button>

          {/* Facebook Share */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleFacebookShare}
            leftIcon={<FaFacebook className="text-blue-600" />}
            className="whitespace-nowrap"
            aria-label="Share on Facebook"
          >
            <span className="hidden sm:inline">Facebook</span>
          </Button>

          {/* Twitter Share */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleTwitterShare}
            leftIcon={<FaTwitter className="text-sky-500" />}
            className="whitespace-nowrap"
            aria-label="Share on Twitter"
          >
            <span className="hidden sm:inline">Twitter</span>
          </Button>

          {/* WhatsApp Share */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleWhatsAppShare}
            leftIcon={<FaWhatsapp className="text-green-600" />}
            className="whitespace-nowrap"
            aria-label="Share on WhatsApp"
          >
            <span className="hidden sm:inline">WhatsApp</span>
          </Button>

          {/* Email Share */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleEmailShare}
            leftIcon={<FaEnvelope className="text-gray-600" />}
            className="whitespace-nowrap"
            aria-label="Share via Email"
          >
            <span className="hidden sm:inline">Email</span>
          </Button>

          {/* Native Share (mobile) */}
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleNativeShare}
              className="sm:hidden"
            >
              Share
            </Button>
          )}
        </div>
      </div>

      {/* Share URL Display (for easy copy on desktop) */}
      <div className="mt-4 hidden md:block">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={shareUrl}
            readOnly
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50 text-gray-700"
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <Button variant="outline" size="sm" onClick={handleCopyLink}>
            {isCopied ? 'Copied!' : 'Copy'}
          </Button>
        </div>
      </div>
    </div>
  );
}
