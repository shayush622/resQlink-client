import { NextRequest } from "next/server";
import { getOrSetCache } from "@/lib/cache";
import { liveKitEmitter } from "@/lib/livekitEmitter";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const { id: disaster_id } = params;
  const cacheKey = `social:${disaster_id}`;
  try {
    const fakePosts = await getOrSetCache(cacheKey, async () => {

      const now = new Date().toISOString();
      const newPosts = [
        {
          id: "post1",
          platform: "Twitter",
          content: `Emergency update for disaster ${disaster_id} – rescue teams deployed.`,
          author: "@rescueTeam",
          created_at: now,
        },
        {
          id: "post2",
          platform: "Bluesky",
          content: `Water levels rising again near region affected by disaster ${disaster_id}.`,
          author: "@weatherWatch",
          created_at: now,
        },
      ];

      await liveKitEmitter("resqlink-global", {
        type: "social_media_updated",
        data: {
          disaster_id,
          source: "Gemini",
          summary: "New social media insights added",
          fetched_at: now,
        },
      });

      return newPosts;
    });

    return new Response(JSON.stringify(fakePosts), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("GET /social-media error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}

