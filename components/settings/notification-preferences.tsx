'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { usePushNotifications } from '@/lib/use-push-notifications';

interface NotificationPreferences {
  id: string;
  userId: string;
  emailEnabled: boolean;
  emailNewEvent: boolean;
  emailEventReminder: boolean;
  emailRsvpConfirmation: boolean;
  emailPrayerReaction: boolean;
  emailNewReflection: boolean;
  emailWeeklyDigest: boolean;
  pushEnabled: boolean;
  pushNewEvent: boolean;
  pushEventReminder: boolean;
  pushPrayerReaction: boolean;
  inAppEnabled: boolean;
  inAppNewEvent: boolean;
  inAppEventReminder: boolean;
  inAppRsvpConfirmation: boolean;
  inAppPrayerReaction: boolean;
  inAppNewReflection: boolean;
}

export function NotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [_saving, _setSaving] = useState(false);
  const { isSupported, requestPermission } = usePushNotifications();

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/notifications/preferences');
      if (!response.ok) throw new Error('Failed to fetch preferences');
      const data = await response.json();
      setPreferences(data);
    } catch (error) {
      console.error('Error fetching preferences:', error);
      toast.error('Failed to load notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (field: keyof NotificationPreferences, value: boolean) => {
    if (!preferences) return;

    const previousValue = preferences[field];

    // Optimistic update
    setPreferences({ ...preferences, [field]: value });

    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });

      if (!response.ok) {
        throw new Error('Failed to update preference');
      }

      const updated = await response.json();
      setPreferences(updated);
      toast.success('Preferences updated');
    } catch (error) {
      console.error('Error updating preference:', error);
      // Revert on error
      setPreferences({ ...preferences, [field]: previousValue });
      toast.error('Failed to update preference');
    }
  };

  const handlePushToggle = async (enabled: boolean) => {
    if (!preferences) return;

    // If enabling, request permission first
    if (enabled) {
      const granted = await requestPermission();
      if (!granted) {
        toast.error('Push notification permission denied');
        return;
      }
    }

    // Update the preference
    await updatePreference('pushEnabled', enabled);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="text-center py-8 text-gray-600 dark:text-gray-400">
        Failed to load notification preferences
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Email Notifications
        </h3>

        <div className="space-y-4">
          {/* Master Email Toggle */}
          <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Enable Email Notifications
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Receive notifications via email
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={preferences.emailEnabled}
              onClick={() => updatePreference('emailEnabled', !preferences.emailEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.emailEnabled ? 'bg-brand-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.emailEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Individual Email Preferences */}
          {preferences.emailEnabled && (
            <>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">New Events</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    When a new event is created
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={preferences.emailNewEvent}
                  onClick={() => updatePreference('emailNewEvent', !preferences.emailNewEvent)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.emailNewEvent ? 'bg-brand-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.emailNewEvent ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Event Reminders</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Reminders for events you&apos;re attending
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={preferences.emailEventReminder}
                  onClick={() => updatePreference('emailEventReminder', !preferences.emailEventReminder)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.emailEventReminder ? 'bg-brand-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.emailEventReminder ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">RSVP Confirmations</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Confirmation when you RSVP to an event
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={preferences.emailRsvpConfirmation}
                  onClick={() => updatePreference('emailRsvpConfirmation', !preferences.emailRsvpConfirmation)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.emailRsvpConfirmation ? 'bg-brand-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.emailRsvpConfirmation ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Prayer Reactions</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    When someone prays for your prayer request
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={preferences.emailPrayerReaction}
                  onClick={() => updatePreference('emailPrayerReaction', !preferences.emailPrayerReaction)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.emailPrayerReaction ? 'bg-brand-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.emailPrayerReaction ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">New Reflections</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    When a new reflection is published
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={preferences.emailNewReflection}
                  onClick={() => updatePreference('emailNewReflection', !preferences.emailNewReflection)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.emailNewReflection ? 'bg-brand-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.emailNewReflection ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Weekly Digest</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Weekly summary of activities and updates
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={preferences.emailWeeklyDigest}
                  onClick={() => updatePreference('emailWeeklyDigest', !preferences.emailWeeklyDigest)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.emailWeeklyDigest ? 'bg-brand-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.emailWeeklyDigest ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Push Notifications */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Push Notifications
        </h3>

        <div className="space-y-4">
          {/* Master Push Toggle */}
          <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Enable Push Notifications
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Receive notifications on your device
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={preferences.pushEnabled}
              onClick={() => handlePushToggle(!preferences.pushEnabled)}
              disabled={!isSupported}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                !isSupported
                  ? 'opacity-50 cursor-not-allowed bg-gray-300 dark:bg-gray-600'
                  : preferences.pushEnabled
                  ? 'bg-brand-600'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.pushEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Individual Push Preferences */}
          {preferences.pushEnabled && (
            <>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">New Events</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    When a new event is created
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={preferences.pushNewEvent}
                  onClick={() => updatePreference('pushNewEvent', !preferences.pushNewEvent)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.pushNewEvent ? 'bg-brand-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.pushNewEvent ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Event Reminders</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Reminders for events you&apos;re attending
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={preferences.pushEventReminder}
                  onClick={() => updatePreference('pushEventReminder', !preferences.pushEventReminder)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.pushEventReminder ? 'bg-brand-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.pushEventReminder ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Prayer Reactions</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    When someone prays for your prayer request
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={preferences.pushPrayerReaction}
                  onClick={() => updatePreference('pushPrayerReaction', !preferences.pushPrayerReaction)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.pushPrayerReaction ? 'bg-brand-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.pushPrayerReaction ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* In-App Notifications */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          In-App Notifications
        </h3>

        <div className="space-y-4">
          {/* Master In-App Toggle */}
          <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Enable In-App Notifications
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                See notifications in the app notification center
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={preferences.inAppEnabled}
              onClick={() => updatePreference('inAppEnabled', !preferences.inAppEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.inAppEnabled ? 'bg-brand-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.inAppEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Individual In-App Preferences */}
          {preferences.inAppEnabled && (
            <>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">New Events</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    When a new event is created
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={preferences.inAppNewEvent}
                  onClick={() => updatePreference('inAppNewEvent', !preferences.inAppNewEvent)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.inAppNewEvent ? 'bg-brand-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.inAppNewEvent ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Event Reminders</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Reminders for events you&apos;re attending
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={preferences.inAppEventReminder}
                  onClick={() => updatePreference('inAppEventReminder', !preferences.inAppEventReminder)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.inAppEventReminder ? 'bg-brand-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.inAppEventReminder ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">RSVP Confirmations</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Confirmation when you RSVP to an event
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={preferences.inAppRsvpConfirmation}
                  onClick={() => updatePreference('inAppRsvpConfirmation', !preferences.inAppRsvpConfirmation)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.inAppRsvpConfirmation ? 'bg-brand-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.inAppRsvpConfirmation ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Prayer Reactions</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    When someone prays for your prayer request
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={preferences.inAppPrayerReaction}
                  onClick={() => updatePreference('inAppPrayerReaction', !preferences.inAppPrayerReaction)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.inAppPrayerReaction ? 'bg-brand-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.inAppPrayerReaction ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">New Reflections</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    When a new reflection is published
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={preferences.inAppNewReflection}
                  onClick={() => updatePreference('inAppNewReflection', !preferences.inAppNewReflection)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.inAppNewReflection ? 'bg-brand-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.inAppNewReflection ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
