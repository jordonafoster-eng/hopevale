'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { usePushNotifications } from '@/lib/use-push-notifications';

export function PushNotificationProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const { isSupported, initializePushNotifications } = usePushNotifications();

  useEffect(() => {
    // Only initialize if user is logged in and push is supported
    if (status === 'authenticated' && isSupported) {
      initializePushNotifications();
    }
  }, [status, isSupported, initializePushNotifications]);

  return <>{children}</>;
}
