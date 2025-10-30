'use client';

export function PlaylistEmbed({
  youtubeUrl,
  title,
}: {
  youtubeUrl: string;
  title: string;
}) {
  // Extract playlist ID from YouTube URL
  const getPlaylistId = (url: string): string | null => {
    try {
      const urlObj = new URL(url);
      return urlObj.searchParams.get('list');
    } catch {
      return null;
    }
  };

  const playlistId = getPlaylistId(youtubeUrl);

  if (!playlistId) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-lg bg-gray-900 flex items-center justify-center">
        <p className="text-gray-400">Invalid YouTube URL</p>
      </div>
    );
  }

  return (
    <div className="aspect-video w-full overflow-hidden rounded-lg bg-gray-900">
      <iframe
        src={`https://www.youtube.com/embed/videoseries?list=${playlistId}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="h-full w-full"
      />
    </div>
  );
}
