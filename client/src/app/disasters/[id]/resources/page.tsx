'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Resource } from '@/types/disaster.types';
import ClientOnlyMap from '@/components/ClientOnlyMap';

export default function DisasterResourcesPage() {
  const { id } = useParams();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function fetchResources() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/disasters/${id}/resources`);
        const data = await res.json();
        setResources(data);
      } catch (err) {
        console.error('Failed to fetch resources:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchResources();
  }, [id]);

  return (
    <div className="pt-20 px-4 max-w-5xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Nearby Resources</h1>
      {loading ? (
        <p>Loading...</p>
      ) : resources.length === 0 ? (
        <p className="text-muted-foreground">No resources found nearby.</p>
      ) : (
        <ClientOnlyMap resources={resources} />
      )}
    </div>
  );
}
