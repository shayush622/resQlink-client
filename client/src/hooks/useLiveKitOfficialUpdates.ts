'use client';

import { useEffect } from 'react';
import { useRoomContext } from '@livekit/components-react';

export function useLiveKitOfficialUpdates(
  disasterId: string,
  onUpdate: () => void
) {
  const room = useRoomContext();

  useEffect(() => {
    if (!room) return;

    const handleData = (payload: Uint8Array) => {
      try {
        const json = JSON.parse(new TextDecoder().decode(payload));
        if (
          json.type === 'official_update_added' &&
          json.data.disaster_id === disasterId
        ) {
          console.log('📡 New official update received via LiveKit');
          onUpdate();
        }
      } catch (err) {
        console.error('Invalid official update payload:', err);
      }
    };

    room.on('dataReceived', handleData);
    return () => {
      room.off('dataReceived', handleData);
    };
  }, [room, disasterId, onUpdate]);
}
