'use client';

import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token, PushNotificationSchema } from '@capacitor/push-notifications';
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
        // Native platform (Capacitor)
        const permResult = await PushNotifications.requestPermissions();

        if (permResult.receive === 'granted') {
          // Register with APNs/FCM
          await PushNotifications.register();
          return true;
        } else {
          console.log('Push notification permission denied');
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
      console.error('Error requesting push notification permission:', error);
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
        // Set up listeners for native platforms
        await PushNotifications.addListener('registration', async (token: Token) => {
          console.log('Push registration success, token:', token.value);

          // Get FCM token
          try {
            const { token: fcmToken } = await FirebaseMessaging.getToken();
            await registerToken(fcmToken);
          } catch (error) {
            console.error('Error getting FCM token:', error);
          }
        });

        await PushNotifications.addListener('registrationError', (error: any) => {
          console.error('Push registration error:', error);
        });

        await PushNotifications.addListener(
          'pushNotificationReceived',
          (notification: PushNotificationSchema) => {
            console.log('Push notification received:', notification);
          }
        );

        await PushNotifications.addListener(
          'pushNotificationActionPerformed',
          (notification: any) => {
            console.log('Push notification action performed:', notification);
            // Handle navigation based on notification data
            if (notification.notification?.data?.link) {
              window.location.href = notification.notification.data.link;
            }
          }
        );
      }
    } catch (error) {
      console.error('Error initializing push notifications:', error);
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
