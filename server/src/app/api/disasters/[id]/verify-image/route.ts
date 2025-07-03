import { NextRequest, NextResponse } from "next/server";
import { verifyImageWithGemini } from "@/lib/verifyImageWithGemini";

export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json();
    if (!imageUrl) {
      return NextResponse.json({ error: "Missing imageUrl" }, { status: 400 });
    }

    const analysis = await verifyImageWithGemini(imageUrl);

    return NextResponse.json({ analysis });
  } catch (err) {
    console.error("Error verifying image:", err);
    return NextResponse.json({ err: "Internal error" }, { status: 500 });
  }
}
