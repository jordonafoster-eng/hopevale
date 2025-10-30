'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TrashIcon, MusicalNoteIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

type Playlist = {
  id: string;
  title: string;
  youtubePlaylistId: string | null;
  spotifyUrl: string | null;
  description: string | null;
  sortOrder: number;
};

export function MusicPlaylistList({ playlists }: { playlists: Playlist[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this playlist?')) {
      return;
    }

    setDeletingId(id);

    try {
      const response = await fetch(`/api/admin/music/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete');
      }

      toast.success('Playlist deleted');
      router.refresh();
    } catch (error) {
      toast.error('Failed to delete playlist');
    } finally {
      setDeletingId(null);
    }
  };

  if (playlists.length === 0) {
    return (
      <div className="card mt-4 text-center">
        <MusicalNoteIcon className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          No playlists yet. Add your first one above!
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      {playlists.map((playlist) => (
        <div key={playlist.id} className="card">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {playlist.title}
              </h3>
              {playlist.description && (
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {playlist.description}
                </p>
              )}
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                {playlist.youtubePlaylistId && (
                  <span className="rounded-full bg-red-100 px-2 py-1 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                    YouTube: {playlist.youtubePlaylistId}
                  </span>
                )}
                {playlist.spotifyUrl && (
                  <a
                    href={playlist.spotifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-green-100 px-2 py-1 text-green-800 hover:underline dark:bg-green-900/20 dark:text-green-400"
                  >
                    Spotify →
                  </a>
                )}
              </div>
            </div>
            <button
              onClick={() => handleDelete(playlist.id)}
              disabled={deletingId === playlist.id}
              className="ml-4 text-red-600 hover:text-red-700 disabled:opacity-50 dark:text-red-400"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
