import { RoomServiceClient, DataPacket_Kind } from "livekit-server-sdk";

const LIVEKIT_URL = process.env.LIVEKIT_URL!;
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY!;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET!;

const roomClient = new RoomServiceClient(
  LIVEKIT_URL,
  LIVEKIT_API_KEY,
  LIVEKIT_API_SECRET
);
type DisasterUpdate = { id: string; title: string };
type SocialMediaUpdate = { posts: string[] };
type ResourcesUpdate = { lat: number; lng: number; name: string };

export type LiveKitPayload =
  | { type: 'disaster_updated'; data?: DisasterUpdate }
  | { type: 'social_media_updated'; data?: SocialMediaUpdate }
  | { type: 'report_added'; data?: SocialMediaUpdate }
  | { type: 'resources_updated'; data?: ResourcesUpdate };

export async function liveKitEmitter(room: string, payload: LiveKitPayload): Promise<void>
{
  try {
    const json = JSON.stringify(payload);
    await roomClient.sendData(room, Buffer.from(json), DataPacket_Kind.RELIABLE);
    console.log(`Sent update to room "${room}":`, payload);
  } catch (err) {
    console.error("Failed to send LiveKit update:", err);
  }
}
