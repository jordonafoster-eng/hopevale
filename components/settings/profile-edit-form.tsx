'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface ProfileEditFormProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  isAdmin: boolean;
}

export function ProfileEditForm({ user, isAdmin }: ProfileEditFormProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    image: user.image || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update profile');
      }

      toast.success('Profile updated successfully');
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name || '',
      email: user.email || '',
      image: user.image || '',
    });
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div className="space-y-4">
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Name</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {user.name || 'Not set'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Email</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {user.email}
            </span>
          </div>
          {user.image && (
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Profile Image</span>
              <span className="font-medium text-gray-900 dark:text-white">Set</span>
            </div>
          )}
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="btn-secondary w-full"
        >
          Edit Profile
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="label">
          Name
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="input"
          placeholder="Enter your name"
        />
      </div>

      <div>
        <label htmlFor="email" className="label">
          Email {!isAdmin && <span className="text-xs text-gray-500">(Admin only)</span>}
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="input"
          placeholder="Enter your email"
          disabled={!isAdmin}
        />
        {!isAdmin && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Only administrators can change email addresses
          </p>
        )}
      </div>

      <div>
        <label htmlFor="image" className="label">
          Profile Image URL
        </label>
        <input
          type="url"
          id="image"
          value={formData.image}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          className="input"
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary flex-1"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={isLoading}
          className="btn-secondary flex-1"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
