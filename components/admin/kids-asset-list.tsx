'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TrashIcon, PencilIcon, SparklesIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

type KidsAsset = {
  id: string;
  title: string;
  type: string;
  description: string | null;
  fileUrl: string;
  createdAt: Date;
  downloadCount: number;
};

export function KidsAssetList({ assets }: { assets: KidsAsset[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingAsset, setEditingAsset] = useState<KidsAsset | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    type: '',
    description: '',
  });

  const handleEdit = (asset: KidsAsset) => {
    setEditingAsset(asset);
    setEditForm({
      title: asset.title,
      type: asset.type,
      description: asset.description || '',
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAsset) return;

    setIsUpdating(true);

    try {
      const response = await fetch(`/api/admin/kids/${editingAsset.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        throw new Error('Failed to update');
      }

      toast.success('Asset updated');
      setEditingAsset(null);
      router.refresh();
    } catch (error) {
      toast.error('Failed to update asset');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    setDeletingId(id);

    try {
      const response = await fetch(`/api/admin/kids/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete');
      }

      toast.success('Asset deleted');
      router.refresh();
    } catch (error) {
      toast.error('Failed to delete asset');
    } finally {
      setDeletingId(null);
    }
  };

  if (assets.length === 0) {
    return (
      <div className="card mt-4 text-center">
        <SparklesIcon className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          No assets yet. Add your first one above!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {assets.map((asset) => (
          <div key={asset.id} className="card">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {asset.title}
                </h3>
                {asset.description && (
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {asset.description}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                  Type: {asset.type}
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                  Downloads: {asset.downloadCount}
                </p>
              </div>
              <div className="ml-2 flex gap-2">
                <button
                  onClick={() => handleEdit(asset)}
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(asset.id, asset.title)}
                  disabled={deletingId === asset.id}
                  className="text-red-600 hover:text-red-700 disabled:opacity-50 dark:text-red-400"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            <a
              href={asset.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 block text-xs text-brand-600 hover:text-brand-700 dark:text-brand-400"
            >
              View File →
            </a>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 dark:bg-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Edit Asset
            </h3>
            <form onSubmit={handleUpdate} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="input mt-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Type *
                </label>
                <select
                  required
                  value={editForm.type}
                  onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
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
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="input mt-1"
                  rows={3}
                />
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-500">
                Note: To change the file, delete this asset and upload a new one.
              </p>

              <div className="flex gap-3">
                <button type="submit" disabled={isUpdating} className="btn-primary">
                  {isUpdating ? 'Updating...' : 'Update Asset'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingAsset(null)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
