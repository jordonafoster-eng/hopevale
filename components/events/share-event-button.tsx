'use client';

import { ShareIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export function ShareEventButton() {
  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  return (
    <button onClick={handleShare} className="btn-secondary mt-4 w-full">
      <ShareIcon className="mr-2 h-5 w-5" />
      Copy Link
    </button>
  );
}
