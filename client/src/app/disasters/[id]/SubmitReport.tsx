'use client';

import { useState, FormEvent } from 'react';
import { toast } from 'react-hot-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

type Props = {
  disasterId: string;
  onSuccess?: () => void; 
};

export default function SubmitReportForm({ disasterId, onSuccess }: Props) {
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!content.trim()) {
      toast.error('Please enter report content.');
      return;
    }

    const formData = new FormData();
    formData.append('content', content);
    formData.append('user_id', 'netrunnerX'); 
    if (image) formData.append('image', image);

    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/disasters/${disasterId}/reports?refresh=true`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to submit report');

      toast.success('Report submitted!');
      setContent('');
      setImage(null);
      onSuccess?.(); 
    } catch (err) {
      console.error(err);
      toast.error('Submission failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">Report Details</label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Describe what you witnessed..."
          rows={4}
        />
      </div>

      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">Attach an Image (optional)</label>
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files?.[0] || null)}
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Submitting...' : 'Submit'}
      </Button>
    </form>
  );
}
