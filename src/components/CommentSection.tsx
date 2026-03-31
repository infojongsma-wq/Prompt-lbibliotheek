'use client';

import { useState, FormEvent } from 'react';
import { Comment } from '@/lib/types';

interface CommentSectionProps {
  promptId: number;
  initialComments: Comment[];
}

function CommentItem({ comment }: { comment: Comment }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = comment.content.length > 150;
  const displayText = isLong && !expanded
    ? comment.content.slice(0, 150) + '...'
    : comment.content;

  const date = new Date(comment.created_at + 'Z').toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="border-b border-gray-100 py-3 last:border-0">
      <div className="flex justify-between items-center mb-1">
        <span className="font-medium text-sm text-gray-800">{comment.author}</span>
        <span className="text-xs text-gray-400">{date}</span>
      </div>
      <p className="text-sm text-gray-600 whitespace-pre-wrap">{displayText}</p>
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-indigo-600 hover:text-indigo-800 mt-1"
        >
          {expanded ? 'Minder tonen' : 'Lees meer'}
        </button>
      )}
    </div>
  );
}

export default function CommentSection({ promptId, initialComments }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    const res = await fetch(`/api/prompts/${promptId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author: author.trim() || undefined, content: content.trim() }),
    });

    if (res.ok) {
      const newComment = await res.json();
      setComments([newComment, ...comments]);
      setContent('');
      setAuthor('');
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Opmerkingen</h3>

      <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-4 space-y-3">
        <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Je naam (optioneel)"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Schrijf een opmerking..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
        <button
          type="submit"
          disabled={submitting || !content.trim()}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? 'Plaatsen...' : 'Plaats opmerking'}
        </button>
      </form>

      <div className="space-y-0">
        {comments.length === 0 ? (
          <p className="text-sm text-gray-400 italic">Nog geen opmerkingen.</p>
        ) : (
          comments.map((c) => <CommentItem key={c.id} comment={c} />)
        )}
      </div>
    </div>
  );
}
