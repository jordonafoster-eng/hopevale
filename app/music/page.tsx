import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { PlaylistEmbed } from '@/components/music/playlist-embed';
import { MusicalNoteIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Music - Community Hub',
  description: 'Worship songs, playlists, and podcasts',
};

async function getPlaylists() {
  return prisma.playlist.findMany({
    where: {
      isPublic: true,
    },
    orderBy: {
      sortOrder: 'asc',
    },
  });
}

export default async function MusicPage() {
  const playlists = await getPlaylists();

  return (
    <div className="section">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
            <MusicalNoteIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <h1 className="mt-4 heading-2">Music & Worship</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Worship songs and playlists to inspire your faith
          </p>
        </div>

        {/* Playlists */}
        {playlists.length === 0 ? (
          <div className="card mt-8 text-center">
            <MusicalNoteIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
              No playlists yet
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Check back soon for worship playlists and music
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-8">
            {playlists.map((playlist) => (
              <div key={playlist.id} className="card">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {playlist.title}
                    </h2>
                    {playlist.description && (
                      <p className="mt-2 text-gray-600 dark:text-gray-400">
                        {playlist.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  {playlist.youtubePlaylistId && (
                    <PlaylistEmbed
                      playlistId={playlist.youtubePlaylistId}
                      title={playlist.title}
                    />
                  )}
                  {playlist.spotifyUrl && (
                    <div className="mt-4">
                      <a
                        href={playlist.spotifyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary inline-flex items-center"
                      >
                        <svg
                          className="mr-2 h-5 w-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                        </svg>
                        Listen on Spotify
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Section */}
        <div className="card mt-8 bg-brand-50 dark:bg-brand-950">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Worship Resources
          </h3>
          <div className="mt-3 space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <p>
              Explore our curated playlists featuring contemporary worship, hymns,
              and songs that inspire faith and devotion.
            </p>
            <p>
              Have a song suggestion? Share it with our worship team through the{' '}
              <a href="/feedback" className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
                feedback form
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
