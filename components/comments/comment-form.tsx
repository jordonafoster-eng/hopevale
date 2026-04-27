'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

type MentionUser = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
};

type CommentFormProps = {
  targetType: 'prayer' | 'reflection' | 'event' | 'recipe';
  targetId: string;
  onCommentAdded?: () => void;
};

function getApiUrl(targetType: CommentFormProps['targetType'], targetId: string) {
  switch (targetType) {
    case 'prayer': return `/api/prayer/${targetId}/comments`;
    case 'reflection': return `/api/reflections/${targetId}/comments`;
    case 'event': return `/api/events/${targetId}/comments`;
    case 'recipe': return `/api/recipes/${targetId}/comments`;
  }
}

export function CommentForm({ targetType, targetId, onCommentAdded }: CommentFormProps) {
  const router = useRouter();
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mention autocomplete state
  const [mentionSearch, setMentionSearch] = useState('');
  const [mentionAnchorPos, setMentionAnchorPos] = useState(-1);
  const [mentionUsers, setMentionUsers] = useState<MentionUser[]>([]);
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionHighlight, setMentionHighlight] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchMentionUsers = useCallback(async (q: string) => {
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) return;
      const data = await res.json();
      setMentionUsers(data.users ?? []);
      setMentionHighlight(0);
    } catch {
      // ignore
    }
  }, []);

  const handleBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart ?? value.length;
    setBody(value);

    const textBeforeCursor = value.slice(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

    if (mentionMatch) {
      const search = mentionMatch[1];
      setMentionSearch(search);
      setMentionAnchorPos(cursorPos - mentionMatch[0].length);
      setShowMentionDropdown(true);

      if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
      fetchTimeoutRef.current = setTimeout(() => fetchMentionUsers(search), 150);
    } else {
      setShowMentionDropdown(false);
    }
  };

  const insertMention = (user: MentionUser) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursorPos = textarea.selectionStart ?? body.length;
    const displayName = user.name || user.email;
    const mentionToken = `@[${displayName}](${user.id}) `;

    const newBody =
      body.slice(0, mentionAnchorPos) +
      mentionToken +
      body.slice(cursorPos);

    setBody(newBody);
    setShowMentionDropdown(false);
    setMentionUsers([]);

    const newCursor = mentionAnchorPos + mentionToken.length;
    setTimeout(() => {
      textarea.setSelectionRange(newCursor, newCursor);
      textarea.focus();
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showMentionDropdown || mentionUsers.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setMentionHighlight((h) => (h + 1) % mentionUsers.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setMentionHighlight((h) => (h - 1 + mentionUsers.length) % mentionUsers.length);
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      insertMention(mentionUsers[mentionHighlight]);
    } else if (e.key === 'Escape') {
      setShowMentionDropdown(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !textareaRef.current?.contains(e.target as Node)
      ) {
        setShowMentionDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!body.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    if (body.length > 1000) {
      toast.error('Comment must be less than 1000 characters');
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(getApiUrl(targetType, targetId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body }),
      });

      if (!response.ok) {
        const result = await response.json();
        toast.error(result.error || 'Failed to post comment');
        return;
      }

      toast.success('Comment posted!');
      setBody('');

      if (onCommentAdded) {
        onCommentAdded();
      }

      router.refresh();
    } catch (_error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <div className="relative">
        <label htmlFor="comment" className="sr-only">
          Add a comment
        </label>
        <textarea
          ref={textareaRef}
          id="comment"
          rows={3}
          className="input"
          placeholder="Add a comment... Type @ to mention someone"
          value={body}
          onChange={handleBodyChange}
          onKeyDown={handleKeyDown}
          disabled={isSubmitting}
        />

        {/* Mention autocomplete dropdown */}
        {showMentionDropdown && mentionUsers.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute left-0 z-50 mt-1 w-64 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
          >
            {mentionUsers.map((user, i) => {
              const displayName = user.name || user.email;
              const initials = displayName.slice(0, 2).toUpperCase();
              return (
                <button
                  key={user.id}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    insertMention(user);
                  }}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors first:rounded-t-lg last:rounded-b-lg ${
                    i === mentionHighlight
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300'
                      : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={displayName}
                      className="h-6 w-6 flex-shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-medium text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
                      {initials}
                    </div>
                  )}
                  <span className="truncate font-medium">{displayName}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-3 flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || !body.trim()}
          className="btn-primary"
        >
          {isSubmitting ? (
            <>
              <span className="spinner mr-2"></span>
              Posting...
            </>
          ) : (
            'Post Comment'
          )}
        </button>
      </div>
    </form>
  );
}
