'use client';

import {
  LiveKitRoom,
  RoomAudioRenderer,
} from '@livekit/components-react';
import { useEffect, useState } from 'react';
import { OfficialUpdate } from '@/types/disaster.types';
import { useLiveKitOfficialUpdates } from '@/hooks/useLiveKitOfficialUpdates';

const LIVEKIT_URL = process.env.NEXT_PUBLIC_LIVEKIT_URL!;

function InnerOfficialUpdateList({ disasterId }: { disasterId: string }) {
  const [updates, setUpdates] = useState<OfficialUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUpdates = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/disasters/${disasterId}/official-updates`
      );
      if (!res.ok) throw new Error('Failed to fetch updates');
      const data = await res.json();
      setUpdates(data);
    } catch (err) {
      console.error('Error fetching updates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpdates();
  }, [disasterId]);

  useLiveKitOfficialUpdates(disasterId, fetchUpdates);

  if (loading) return <p>Loading official updates...</p>;

  return (
    <div className="space-y-4 mt-10">
      <h2 className="text-2xl font-bold">Official Updates</h2>
      {updates.length === 0 ? (
        <p className="text-muted-foreground">No updates yet.</p>
      ) : (
        updates.map((update) => (
          <div
            key={update.id}
            className="border p-4 rounded-xl shadow-sm bg-muted"
          >
            <h3 className="text-lg font-semibold">{update.title}</h3>
            <p className="text-sm mt-1">{update.description}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Posted by: {update.posted_by} •{' '}
              {new Date(update.created_at).toLocaleString()}
            </p>
          </div>
        ))
      )}
    </div>
  );
}

export default function OfficialUpdateList({ disasterId }: { disasterId: string }) {
  return (
    <LiveKitRoom
      connect={true}
      token=""
      serverUrl={LIVEKIT_URL}
      room={undefined}
    >
      <RoomAudioRenderer />
      <InnerOfficialUpdateList disasterId={disasterId} />
    </LiveKitRoom>
  );
}
