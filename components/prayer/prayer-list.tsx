'use client';

import { PrayerCard } from './prayer-card';

type Comment = {
  id: string;
  body: string;
  createdAt: Date;
  author: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
};

type Prayer = {
  id: string;
  title: string;
  body: string;
  type: 'REQUEST' | 'PRAISE';
  isAnonymous: boolean;
  reactionsCount: number;
  createdAt: Date;
  author: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  } | null;
  comments: Comment[];
};

export function PrayerList({
  prayers,
  userReactions,
  currentUserId,
  isAdmin,
}: {
  prayers: Prayer[];
  userReactions: Map<string, string>;
  currentUserId?: string;
  isAdmin: boolean;
}) {
  return (
    <div className="space-y-4">
      {prayers.map((prayer) => (
        <PrayerCard
          key={prayer.id}
          prayer={prayer}
          userReaction={userReactions.get(prayer.id)}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
        />
      ))}
    </div>
  );
}
