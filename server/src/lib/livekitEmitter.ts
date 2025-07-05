import { RoomServiceClient, DataPacket_Kind } from "livekit-server-sdk";

const LIVEKIT_URL = process.env.LIVEKIT_URL!;
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY!;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET!;

const roomClient = new RoomServiceClient(
  LIVEKIT_URL,
  LIVEKIT_API_KEY,
  LIVEKIT_API_SECRET
);

export type LiveKitPayload =
  | {
      type: "resources_updated";
      data: {
        disaster_id: string;
        resource_id: string;
        resource_type: string;
        summary: string;
        updated_at: string;
      };
    }
  | {
      type: "social_media_updated";
      data: {
        disaster_id: string;
        source: string;
        summary: string;
        fetched_at: string;
      };
    }
  | {
      type: "disaster_updated";
      data: {
        disaster_id: string;
        action: "created" | "updated" | "deleted";
        title: string;
        description: string;
        location: {
          type: "Point";
          coordinates: [number, number];
        };
        created_at: string;
      };
    }
  | {
      type: "report_added";
      data: {
        disaster_id: string;
        report_id: string;
        content: string;
        user_id: string;
        image_url?: string;
        verification_status: string;
        created_at: string;
      };
    }
  | {
      type: "official_update_added";
      data: {
        disaster_id: string;
        update_id: string;
        title: string;
        description: string;
        posted_by: string;
        created_at: string;
      };
    };

export async function liveKitEmitter(room: string, payload: LiveKitPayload): Promise<void> {
  try {
    await roomClient
      .createRoom({
        name: room,
        emptyTimeout: 300, 
        maxParticipants: 50,
      });

    const json = JSON.stringify(payload);
    await roomClient.sendData(room, Buffer.from(json), DataPacket_Kind.RELIABLE);
    console.log(`Sent update to room "${room}":`, payload);
  }
   catch (err)
  {
    console.error("Failed to send LiveKit update:", err);
  }
}
