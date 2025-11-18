'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TrashIcon, MusicalNoteIcon, PencilIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

type Playlist = {
  id: string;
  title: string;
  youtubeUrl: string | null;
  spotifyUrl: string | null;
  description: string | null;
  sortOrder: number;
};

export function MusicPlaylistList({ playlists }: { playlists: Playlist[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    youtubeUrl: '',
    spotifyUrl: '',
    description: '',
  });

  const handleEdit = (playlist: Playlist) => {
    setEditingPlaylist(playlist);
    setEditForm({
      title: playlist.title,
      youtubeUrl: playlist.youtubeUrl || '',
      spotifyUrl: playlist.spotifyUrl || '',
      description: playlist.description || '',
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlaylist) return;

    setIsUpdating(true);

    try {
      const response = await fetch(`/api/admin/music/${editingPlaylist.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        throw new Error('Failed to update');
      }

      toast.success('Playlist updated');
      setEditingPlaylist(null);
      router.refresh();
    } catch (_error) {
      toast.error('Failed to update playlist');
    } finally {
      setIsUpdating(false);
    }
  };

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
    } catch (_error) {
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
    <>
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
                  {playlist.youtubeUrl && (
                    <a
                      href={playlist.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full bg-red-100 px-2 py-1 text-red-800 hover:underline dark:bg-red-900/20 dark:text-red-400"
                    >
                      YouTube →
                    </a>
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
              <div className="ml-4 flex gap-2">
                <button
                  onClick={() => handleEdit(playlist)}
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(playlist.id)}
                  disabled={deletingId === playlist.id}
                  className="text-red-600 hover:text-red-700 disabled:opacity-50 dark:text-red-400"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingPlaylist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 dark:bg-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Edit Playlist
            </h3>
            <form onSubmit={handleUpdate} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Playlist Title *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="input mt-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  YouTube Playlist URL
                </label>
                <input
                  type="url"
                  value={editForm.youtubeUrl}
                  onChange={(e) => setEditForm({ ...editForm, youtubeUrl: e.target.value })}
                  className="input mt-1"
                  placeholder="https://www.youtube.com/playlist?list=..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Spotify URL
                </label>
                <input
                  type="url"
                  value={editForm.spotifyUrl}
                  onChange={(e) => setEditForm({ ...editForm, spotifyUrl: e.target.value })}
                  className="input mt-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="input mt-1"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <button type="submit" disabled={isUpdating} className="btn-primary">
                  {isUpdating ? 'Updating...' : 'Update Playlist'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingPlaylist(null)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
