'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Tweet } from '@/types/disaster.types'; // adjust path if needed

export default function DisasterSocialMediaPage() {
  const { id } = useParams();
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function fetchTweets() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/disasters/${id}/social-media`);
        if (!res.ok) throw new Error('Failed to fetch social posts');
        const data = await res.json();
        setTweets(data);
      } catch (err) {
        console.error('Error fetching tweets:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchTweets();
  }, [id]);

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
