'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { LockClosedIcon } from '@heroicons/react/24/outline';

export function MusicPlaylistForm({ isSuperAdmin = false }: { isSuperAdmin?: boolean }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGlobal, setIsGlobal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    youtubeUrl: '',
    spotifyUrl: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, isGlobal }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add playlist');
      }

      toast.success('Playlist added successfully!');
      setFormData({ title: '', youtubeUrl: '', spotifyUrl: '', description: '' });
      setIsGlobal(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add playlist');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Playlist Title *
        </label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="input mt-1"
          placeholder="e.g., Sunday Worship"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          YouTube Playlist URL
        </label>
        <input
          type="url"
          value={formData.youtubeUrl}
          onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
          className="input mt-1"
          placeholder="https://www.youtube.com/playlist?list=..."
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
          Paste the full YouTube playlist URL
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Spotify URL
        </label>
        <input
          type="url"
          value={formData.spotifyUrl}
          onChange={(e) => setFormData({ ...formData, spotifyUrl: e.target.value })}
          className="input mt-1"
          placeholder="https://open.spotify.com/playlist/..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="input mt-1"
          rows={3}
          placeholder="Optional description..."
        />
      </div>

      {isSuperAdmin && (
        <label className="flex items-start gap-3 rounded-lg border border-accent-200 bg-accent-50 p-3 dark:border-accent-800 dark:bg-accent-950/40">
          <input
            type="checkbox"
            checked={isGlobal}
            onChange={(e) => setIsGlobal(e.target.checked)}
            className="mt-0.5 rounded border-gray-300 text-accent-600 focus:ring-accent-500"
          />
          <span className="text-sm">
            <span className="flex items-center gap-1 font-medium text-gray-900 dark:text-white">
              <LockClosedIcon className="h-4 w-4" />
              Share with all groups
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              Every group will see this playlist. Only super admins can edit or remove it.
            </span>
          </span>
        </label>
      )}

      <button type="submit" disabled={isSubmitting} className="btn-primary">
        {isSubmitting ? 'Adding...' : 'Add Playlist'}
      </button>
    </form>
  );
}
