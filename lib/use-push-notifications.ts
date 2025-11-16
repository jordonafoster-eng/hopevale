'use client';

import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { FirebaseMessaging } from '@capacitor-firebase/messaging';

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Check if push notifications are supported
    const checkSupport = async () => {
      const platform = Capacitor.getPlatform();
      setIsSupported(platform === 'ios' || platform === 'android' || platform === 'web');
    };

    checkSupport();
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    try {
      if (!isSupported) {
        console.log('Push notifications not supported on this platform');
        return false;
      }

      const platform = Capacitor.getPlatform();

      if (platform === 'ios' || platform === 'android') {
        // Native platform - use FirebaseMessaging directly
        console.log('🔔 Requesting notification permissions...');
        const permResult = await FirebaseMessaging.requestPermissions();
        console.log('🔔 Permission result:', permResult);

        if (permResult.receive === 'granted') {
          console.log('✅ Permission granted, getting FCM token...');
          // Get FCM token directly
          const { token: fcmToken } = await FirebaseMessaging.getToken();
          console.log('🔥 FCM Token received:', fcmToken);

          if (fcmToken) {
            await registerToken(fcmToken);
            return true;
          } else {
            console.error('❌ No FCM token returned');
            return false;
          }
        } else {
          console.log('❌ Push notification permission denied');
          return false;
        }
      } else if (platform === 'web') {
        // Web platform
        if (!('Notification' in window)) {
          console.log('This browser does not support notifications');
          return false;
        }

        const permission = await Notification.requestPermission();
        return permission === 'granted';
      }

      return false;
    } catch (error) {
      console.error('❌ Error requesting push notification permission:', error);
      return false;
    }
  };

  const registerToken = async (fcmToken: string) => {
    try {
      const platform = Capacitor.getPlatform();

      const response = await fetch('/api/device-tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: fcmToken,
          platform,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to register device token');
      }

      setToken(fcmToken);
      setIsRegistered(true);
      console.log('Device token registered successfully');
    } catch (error) {
      console.error('Error registering device token:', error);
      throw error;
    }
  };

  const unregisterToken = async () => {
    try {
      if (!token) return;

      const response = await fetch('/api/device-tokens', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to unregister device token');
      }

      setToken(null);
      setIsRegistered(false);
      console.log('Device token unregistered successfully');
    } catch (error) {
      console.error('Error unregistering device token:', error);
      throw error;
    }
  };

  const initializePushNotifications = async () => {
    try {
      const platform = Capacitor.getPlatform();

      if (platform === 'ios' || platform === 'android') {
        console.log('🔔 Initializing Firebase Messaging listeners...');

        // Listen for token refresh
        await FirebaseMessaging.addListener('tokenReceived', async (event: { token: string }) => {
          console.log('🔥 FCM token received:', event.token);
          try {
            await registerToken(event.token);
          } catch (error) {
            console.error('❌ Error registering FCM token:', error);
          }
        });

        // Listen for incoming notifications (foreground)
        await FirebaseMessaging.addListener('notificationReceived', (event: any) => {
          console.log('🔔 Push notification received:', event.notification);
        });

        // Listen for notification taps
        await FirebaseMessaging.addListener('notificationActionPerformed', (event: any) => {
          console.log('🔔 Push notification action performed:', event);
          // Handle navigation based on notification data
          if (event.notification?.data?.link) {
            window.location.href = event.notification.data.link;
          }
        });

        console.log('✅ Firebase Messaging listeners initialized');
      }
    } catch (error) {
      console.error('❌ Error initializing push notifications:', error);
    }
  };

  return {
    isSupported,
    isRegistered,
    token,
    requestPermission,
    registerToken,
    unregisterToken,
    initializePushNotifications,
  };
}
