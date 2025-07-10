'use client';

import { LiveKitRoom, useRoomContext } from '@livekit/components-react';
import { useEffect, useState } from 'react';
import { Tweet } from '@/types/disaster.types';
import { useParams } from 'next/navigation';

const LIVEKIT_URL = process.env.NEXT_PUBLIC_LIVEKIT_URL!;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!;

function useLiveKitSocialUpdates(disasterId: string, onUpdate: () => void) {
  const room = useRoomContext(); // ✅ FIXED

  useEffect(() => {
    if (!room) return;

    const handleData = (payload: Uint8Array) => {
      try {
        const json = JSON.parse(new TextDecoder().decode(payload));
        if (
          json.type === 'social_media_updated' &&
          json.data.disaster_id === disasterId
        ) {
          console.log('📡 LiveKit social media update received');
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

function SocialMediaInner({ disasterId }: { disasterId: string }) {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchTweets() {
    try {
      const res = await fetch(`${BASE_URL}/disasters/${disasterId}/social-media`);
      if (!res.ok) throw new Error('Failed to fetch tweets');
      const data = await res.json();
      setTweets(data);
    } catch (err) {
      console.error('Tweet fetch error:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTweets();
  }, [disasterId]);

  useLiveKitSocialUpdates(disasterId, fetchTweets);

  return (
    <div className="pt-20 px-4 max-w-5xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Social Media Posts</h1>

      {loading ? (
        <p>Loading...</p>
      ) : tweets.length === 0 ? (
        <p className="text-muted-foreground">No social posts found.</p>
      ) : (
        tweets.map((tweet) => (
          <div key={tweet.id} className="border rounded-xl p-4 shadow-sm flex gap-4">
            {tweet.profile_image_url && (
              <img
                src={tweet.profile_image_url}
                alt="avatar"
                className="w-10 h-10 rounded-full object-cover"
              />
            )}
            <div>
              <p className="font-semibold">@{tweet.username}</p>
              <p className="text-sm">{tweet.text}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(tweet.created_at).toLocaleString()}
              </p>
              {tweet.url && (
                <a
                  href={tweet.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline text-sm mt-1 inline-block"
                >
                  View Post ↗
                </a>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default function DisasterSocialMediaPage() {
  const { id } = useParams();

  if (!id || typeof id !== 'string') {
    return <p className="text-center pt-20">Invalid disaster ID</p>;
  }

  return (
    <LiveKitRoom
      serverUrl={LIVEKIT_URL}
      token="" // anonymous, data-only access
      connect={true}
    >
      <SocialMediaInner disasterId={id} />
    </LiveKitRoom>
  );
}
