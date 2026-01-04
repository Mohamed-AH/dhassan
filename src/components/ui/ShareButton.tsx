'use client';

import { useState } from 'react';
import Button from './Button';

interface ShareButtonProps {
  title: string;
  text: string;
  url?: string;
}

export default function ShareButton({ title, text, url }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

    // Try native share first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled or error occurred
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        alert('Failed to copy link. Please copy manually: ' + shareUrl);
      }
    }
  };

  return (
    <Button variant="primary" onClick={handleShare}>
      {copied ? '✓ Link Copied!' : '📤 Share Lecture'}
    </Button>
  );
}
