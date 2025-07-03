import { RoomServiceClient, DataPacket_Kind } from "livekit-server-sdk";

const LIVEKIT_URL = process.env.LIVEKIT_URL!;
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY!;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET!;

const roomClient = new RoomServiceClient(
  LIVEKIT_URL,
  LIVEKIT_API_KEY,
  LIVEKIT_API_SECRET
);
type LiveKitPayload = {
  type: 'disaster_updated' | 'social_media_updated' | 'resources_updated';
};

export async function sendLiveKitUpdate(room: string, payload: LiveKitPayload): Promise<void>
{
  try {
    const json = JSON.stringify(payload);
    await roomClient.sendData(room, Buffer.from(json), DataPacket_Kind.RELIABLE);
    console.log(`Sent update to room "${room}":`, payload);
  } catch (err) {
    console.error("Failed to send LiveKit update:", err);
  }
}
