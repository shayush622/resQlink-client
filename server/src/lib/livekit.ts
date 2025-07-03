import { AccessToken } from 'livekit-server-sdk';

export function createLiveKitToken(identity: string, room: string) {
  const apiKey = process.env.LIVEKIT_API_KEY!;
  const apiSecret = process.env.LIVEKIT_API_SECRET!;

  const token = new AccessToken(apiKey, apiSecret, {
    identity, 
    ttl: '1h',
  });

  token.addGrant({ room, roomJoin: true, canPublishData: true });

  return token.toJwt();
}
