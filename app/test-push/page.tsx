'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

export default function TestPushPage() {
  const [title, setTitle] = useState('🔔 Test Notification');
  const [message, setMessage] = useState('This is a test push notification!');
  const [badge, setBadge] = useState(1);
  const [sending, setSending] = useState(false);

  const sendTestPush = async () => {
    setSending(true);
    try {
      const response = await fetch('/api/test-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, message, badge }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Notification sent to ${data.sent || 0} device(s)!`);
      } else {
        toast.error(data.error || 'Failed to send notification');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to send test notification');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Test Push Notifications
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Send yourself a test push notification with a custom badge count
      </p>

      <div className="card space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="Notification title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="Notification message"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Badge Count
          </label>
          <input
            type="number"
            value={badge}
            onChange={(e) => setBadge(parseInt(e.target.value) || 0)}
            min="0"
            max="99"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="Badge number"
          />
          <p className="mt-1 text-sm text-gray-500">
            The red badge that appears on the app icon
          </p>
        </div>

        <button
          onClick={sendTestPush}
          disabled={sending}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? 'Sending...' : '📤 Send Test Notification'}
        </button>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            💡 Testing Tips:
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Make sure notifications are enabled in Settings</li>
            <li>• Close the app or put it in background to see the notification</li>
            <li>• The badge will appear on the app icon</li>
            <li>• Tap the notification to open the app</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
