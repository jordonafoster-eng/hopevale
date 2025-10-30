import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { isAdmin } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { ArrowLeftIcon, PlusIcon } from '@heroicons/react/24/outline';
import { MusicPlaylistForm } from '@/components/admin/music-playlist-form';
import { MusicPlaylistList } from '@/components/admin/music-playlist-list';

export const metadata: Metadata = {
  title: 'Music Management - Admin',
  description: 'Manage music playlists',
};

async function getPlaylists() {
  return prisma.playlist.findMany({
    orderBy: {
      sortOrder: 'asc',
    },
  });
}

export default async function AdminMusicPage() {
  const adminUser = await isAdmin();

  if (!adminUser) {
    redirect('/');
  }

  const playlists = await getPlaylists();

  return (
    <div className="section">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/admin"
          className="inline-flex items-center text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to Admin Dashboard
        </Link>

        <div className="mt-6">
          <h1 className="heading-2">Music Playlist Management</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Add and manage YouTube playlists and Spotify links
          </p>
        </div>

        {/* Add Playlist Form */}
        <div className="card mt-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            <PlusIcon className="mr-2 inline-block h-5 w-5" />
            Add New Playlist
          </h2>
          <MusicPlaylistForm />
        </div>

        {/* Playlists List */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Existing Playlists ({playlists.length})
          </h2>
          <MusicPlaylistList playlists={playlists} />
        </div>
      </div>
    </div>
  );
}
