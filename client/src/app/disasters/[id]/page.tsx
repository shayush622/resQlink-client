'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Disaster } from '@/types/disaster.types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function DisasterDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [disaster, setDisaster] = useState<Disaster | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function fetchDisaster() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/disasters/${id}`);
        if (!res.ok) throw new Error('Failed to fetch disaster');
        const data = await res.json();
        setDisaster(data);
      } catch (err) {
        console.error('Error fetching disaster:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDisaster();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin w-6 h-6 text-gray-500" />
      </div>
    );
  }

  if (!disaster) {
    return (
      <div className="text-center py-10 text-red-500">
        Disaster not found.
      </div>
    );
  }

  return (
    <div className="pt-20 px-4 max-w-5xl mx-auto space-y-6">
      {/* ✅ Card: Disaster Summary */}
      <Card className="shadow-lg">
        <CardContent className="p-6 space-y-3">
          <h1 className="text-3xl font-bold">{disaster.title}</h1>
          <p className="text-muted-foreground">{disaster.description}</p>
          <p className="text-sm font-medium">📍 {disaster.location_name}</p>

          <div className="flex flex-wrap gap-2 mt-2">
            {disaster.tags?.map((tag) => (
              <Badge key={tag} variant="secondary">#{tag}</Badge>
            ))}
          </div>

          <p className="text-xs text-muted-foreground mt-2">
            Created at: {new Date(disaster.created_at).toLocaleString()}
          </p>
        </CardContent>
      </Card>

      {/* ✅ Navigation Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button variant="default" onClick={() => router.push(`/disasters/${id}/reports`)}>
          View Reports
        </Button>
        <Button variant="outline" onClick={() => router.push(`/disasters/${id}/official-updates`)}>
          View Official Updates
        </Button>
        <Button variant="ghost" onClick={() => router.push(`/disasters/${id}/submit-report`)}>
          Submit a Report
        </Button>
        <Button onClick={() => router.push(`/disasters/${id}/resources`)}>
        View Resources
        </Button>
        <Button onClick={() => router.push(`/disasters/${id}/social-media`)}>
          View Social Media
        </Button>

      </div>
    </div>
  );
}
