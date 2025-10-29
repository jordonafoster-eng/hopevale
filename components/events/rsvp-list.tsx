import { getInitials, getAvatarColor } from '@/lib/utils';

type RSVP = {
  id: string;
  adults: number;
  kids: number;
  note: string | null;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
};

export function RSVPList({ rsvps }: { rsvps: RSVP[] }) {
  return (
    <div className="mt-4 space-y-3">
      {rsvps.map((rsvp) => {
        const name = rsvp.user.name || rsvp.user.email;
        const initials = getInitials(name);
        const avatarColor = getAvatarColor(rsvp.user.email);

        return (
          <div
            key={rsvp.id}
            className="flex items-start gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700"
          >
            <div
              className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${avatarColor} text-sm font-medium text-white`}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-white">
                {rsvp.user.name || 'Anonymous'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {rsvp.adults} adult{rsvp.adults !== 1 ? 's' : ''}
                {rsvp.kids > 0 && (
                  <>, {rsvp.kids} kid{rsvp.kids !== 1 ? 's' : ''}</>
                )}
              </p>
              {rsvp.note && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {rsvp.note}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
