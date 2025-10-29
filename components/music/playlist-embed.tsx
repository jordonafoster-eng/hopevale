'use client';

export function PlaylistEmbed({
  playlistId,
  title,
}: {
  playlistId: string;
  title: string;
}) {
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
