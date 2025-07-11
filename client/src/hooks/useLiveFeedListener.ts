// client/hooks/useLiveFeedListener.ts
'use client';

import { useEffect } from 'react';
import { Room } from 'livekit-client';
import type { LiveKitPayload } from '@/lib/liveKitEmitter';

export function useLiveFeedListener(onData: (data: LiveKitPayload) => void) {
  useEffect(() => {
    let room: Room;

    const connect = async () => {
      try {
        const res = await fetch('/api/livekit/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            identity: 'live-feed-viewer',
            room: 'global',
          }),
        });

        const { token } = await res.json();
        const { Room } = await import('livekit-client');

        room = new Room();
        await room.connect(process.env.NEXT_PUBLIC_LIVEKIT_URL!, token);

        room.on('dataReceived', (payload) => {
          try {
            const str = new TextDecoder().decode(payload);
            const parsed: LiveKitPayload = JSON.parse(str);
            onData(parsed);
          } catch (err) {
            console.error('Failed to parse LiveKit payload:', err);
          }
        });
      } catch (err) {
        console.error('LiveKit connection failed:', err);
      }
    };

    connect();

    return () => {
      room?.disconnect();
    };
  }, [onData]);
}
