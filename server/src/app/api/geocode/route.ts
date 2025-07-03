import { NextRequest } from "next/server";
import { extractLocationWithGemini } from "@/lib/geminiLocation";
import { geocodeLocation } from "@/lib/geocodingservice";
import { getOrSetCache } from "@/lib/cache";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { description } = body;

    if (!description) {
      return new Response(JSON.stringify({ error: "Missing location description." }), { status: 400 });
    }

    const cacheKey = `geocode:${description}`;

    const { data, fromCache } = await getOrSetCache(cacheKey, async () => {
      const extractedLocation = await extractLocationWithGemini(description);
      const coords = await geocodeLocation(extractedLocation);
      return { ...coords, location: extractedLocation };
    });

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "X-Cache": fromCache ? "HIT" : "MISS",
      },
    });

  } catch (err) {
    console.error("POST /geocode error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}

