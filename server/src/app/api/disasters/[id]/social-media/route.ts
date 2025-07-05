import { NextRequest } from "next/server";
import { getOrSetCache } from "@/lib/cache";
import { liveKitEmitter } from "@/lib/livekitEmitter";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const { id: disaster_id } = params;
  const cacheKey = `social:${disaster_id}`;

  try {
    const { data: fakePosts, fromCache } = await getOrSetCache(cacheKey, async () => {
      const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";

      const res = await fetch(`${baseUrl}/api/mock-social-media`);
      if (!res.ok) throw new Error("Failed to fetch mock social media data");

      const posts = await res.json();
      const now = new Date().toISOString();

      await liveKitEmitter("resqlink-global", {
        type: "social_media_updated",
        data: {
          disaster_id,
          source: "MockFeed",
          summary: "New social media insights added",
          fetched_at: now,
        },
      });

      return posts;
    });

    return new Response(JSON.stringify(fakePosts), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "X-Cache": fromCache ? "HIT" : "MISS",
      },
    });
  } catch (err) {
    console.error("GET /social-media error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}
