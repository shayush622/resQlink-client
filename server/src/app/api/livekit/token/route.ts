import { createLiveKitToken } from '@/lib/livekit';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { identity, room } = body;

  const token = createLiveKitToken(identity, room);

  return new Response(JSON.stringify({ token }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
