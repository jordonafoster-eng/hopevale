'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export function MusicPlaylistForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    youtubePlaylistId: '',
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
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to add playlist');
      }

      toast.success('Playlist added successfully!');
      setFormData({ title: '', youtubePlaylistId: '', spotifyUrl: '', description: '' });
      router.refresh();
    } catch (error) {
      toast.error('Failed to add playlist');
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
          YouTube Playlist ID
        </label>
        <input
          type="text"
          value={formData.youtubePlaylistId}
          onChange={(e) => setFormData({ ...formData, youtubePlaylistId: e.target.value })}
          className="input mt-1"
          placeholder="e.g., PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
          Find this in the YouTube playlist URL after &quot;list=&quot;
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

      <button type="submit" disabled={isSubmitting} className="btn-primary">
        {isSubmitting ? 'Adding...' : 'Add Playlist'}
      </button>
    </form>
  );
}
