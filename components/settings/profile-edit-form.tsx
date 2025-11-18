'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { PhotoIcon } from '@heroicons/react/24/outline';

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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(user.image || null);
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        body: formDataToSend,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update profile');
      }

      toast.success('Profile updated successfully');
      setIsEditing(false);
      router.refresh();
    } catch (_error) {
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
    });
    setImageFile(null);
    setImagePreview(user.image || null);
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
        <label className="label">
          Profile Image
        </label>
        <div className="mt-2 flex items-center gap-4">
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Profile preview"
              className="h-20 w-20 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
              <PhotoIcon className="h-10 w-10 text-gray-400" />
            </div>
          )}
          <div className="flex-1">
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <label
              htmlFor="image"
              className="btn-secondary inline-flex cursor-pointer items-center gap-2"
            >
              <PhotoIcon className="h-5 w-5" />
              Choose Image
            </label>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              PNG, JPG, GIF up to 5MB
            </p>
          </div>
        </div>
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
