import { NextRequest } from "next/server";
import { extractLocationWithGemini } from "@/lib/geminiLocation";
import { geocodeLocation } from "@/lib/geocodingservice";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { description } = body;

    if (!description) {
      return new Response(JSON.stringify({ error: "Missing location description." }), { status: 400 });
    }

    const extractedLocation = await extractLocationWithGemini(description);

    const coords = await geocodeLocation(extractedLocation);

    return new Response(JSON.stringify({ ...coords, location: extractedLocation }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("POST /geocode error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}
