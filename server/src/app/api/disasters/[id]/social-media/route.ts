import { NextRequest } from "next/server";
import { getOrSetCache } from "@/lib/cache";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const cacheKey = `social:${id}`;

  try {
    const fakePosts = await getOrSetCache(cacheKey, async () => {
      const now = new Date().toISOString();
      return [
        {
          id: "post1",
          platform: "Twitter",
          content: `Emergency update for disaster ${id} – rescue teams deployed.`,
          author: "@rescueTeam",
          created_at: now,
        },
        {
          id: "post2",
          platform: "Bluesky",
          content: `Water levels rising again near region affected by disaster ${id}.`,
          author: "@weatherWatch",
          created_at: now,
        },
      ];
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
