'use client';

import { useEffect } from 'react';
import { useRoomContext } from '@livekit/components-react';
import type { LiveKitPayload } from '@/types/livekit.types';

export default function useLiveKitSocialUpdates(
  disasterId: string,
  onUpdate: () => void
) {
  const room = useRoomContext(); 

  useEffect(() => {
    if (!room) return;

    const handleData = (payload: Uint8Array) => {
      try {
        const json = JSON.parse(new TextDecoder().decode(payload)) as LiveKitPayload;

        if (
          json.type === 'social_media_updated' &&
          json.data.disaster_id === disasterId
        ) {
          onUpdate();
        }
      } catch (err) {
        console.error('Invalid social update payload:', err);
      }
    };

    room.on('dataReceived', handleData);
    return () => {
      room.off('dataReceived', handleData);
    };
  }, [room, disasterId, onUpdate]);
}
