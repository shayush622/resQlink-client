import { NextRequest, NextResponse } from "next/server";
import { verifyImageWithGemini } from "@/lib/verifyImageWithGemini";
import { getOrSetCache } from "@/lib/cache";

export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json();
    if (!imageUrl) {
      return NextResponse.json({ error: "Missing imageUrl" }, { status: 400 });
    }

    const cacheKey = `gemini:image:${imageUrl}`;

    const analysis = await getOrSetCache(cacheKey, async () => {
      return await verifyImageWithGemini(imageUrl);
    });

    return NextResponse.json({ analysis }, { status: 200 });

  } catch (err) {
    console.error("Error verifying image:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
