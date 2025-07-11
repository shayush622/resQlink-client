'use client';

import { useState } from 'react';
import { useLiveFeedListener } from '@/hooks/useLiveFeedListener';
import LiveFeedItem from '@/components/LiveFeedItem';
import { LiveKitPayload } from '@/lib/liveKitEmitter';

export default function LiveFeedPage() {
  const [feed, setFeed] = useState<LiveKitPayload[]>([]);

  useLiveFeedListener((payload) => {
    setFeed((prev) => [payload, ...prev.slice(0, 99)]); 
  });

  return (
    <div className="pt-24 px-4 max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold mb-6">Live Feed</h1>
      {feed.map((item, idx) => (
        <LiveFeedItem key={idx} payload={item} />
      ))}
    </div>
  );
}
