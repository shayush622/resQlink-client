'use client';

import { useState } from 'react';

export default function OfficialUpdateForm({ disasterId }: { disasterId: string }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(false);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/disasters/${disasterId}/official-updates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });

      if (!res.ok) throw new Error('Failed to post update');
      setTitle('');
      setDescription('');
      setSuccess(true);
    } catch (err) {
      console.error('Submission failed:', err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-muted p-4 rounded-xl shadow mt-6 space-y-3">
      <h3 className="text-xl font-semibold">Post New Official Update</h3>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Update title"
        className="w-full p-2 border rounded"
        required
      />

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Update description"
        className="w-full p-2 border rounded"
        rows={4}
        required
      />

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        disabled={submitting}
      >
        {submitting ? 'Posting...' : 'Post Update'}
      </button>

      {success && <p className="text-green-600 text-sm mt-2">✅ Update posted successfully!</p>}
    </form>
  );
}
