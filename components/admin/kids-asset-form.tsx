'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export function KidsAssetForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    type: 'COLORING' as 'VERSE' | 'ACTIVITY' | 'COLORING',
    description: '',
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast.error('Please select a file');
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('file', file);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('description', formData.description);

      const response = await fetch('/api/admin/kids', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload');
      }

      toast.success('Asset uploaded successfully!');
      setFile(null);
      setFormData({ title: '', type: 'COLORING', description: '' });
      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload asset');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Title *
        </label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="input mt-1"
          placeholder="e.g., John 3:16 Coloring Page"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Type *
        </label>
        <select
          required
          value={formData.type}
          onChange={(e) =>
            setFormData({ ...formData, type: e.target.value as 'VERSE' | 'ACTIVITY' | 'COLORING' })
          }
          className="input mt-1"
        >
          <option value="COLORING">Coloring Page</option>
          <option value="VERSE">Memory Verse</option>
          <option value="ACTIVITY">Activity Sheet</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="input mt-1"
          rows={3}
          placeholder="Optional description..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          File (PDF or Image) *
        </label>
        <div className="mt-1 flex justify-center rounded-lg border-2 border-dashed border-gray-300 px-6 py-10 dark:border-gray-700">
          <div className="text-center">
            <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4 flex text-sm leading-6 text-gray-600 dark:text-gray-400">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer rounded-md bg-white font-semibold text-brand-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-brand-600 focus-within:ring-offset-2 hover:text-brand-500 dark:bg-gray-900"
              >
                <span>Upload a file</span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="sr-only"
                  onChange={handleFileChange}
                  required
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs leading-5 text-gray-600 dark:text-gray-400">
              PDF, PNG, JPG up to 10MB
            </p>
            {file && (
              <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                Selected: {file.name}
              </p>
            )}
          </div>
        </div>
      </div>

      <button type="submit" disabled={isSubmitting} className="btn-primary">
        {isSubmitting ? 'Uploading...' : 'Upload Asset'}
      </button>
    </form>
  );
}
