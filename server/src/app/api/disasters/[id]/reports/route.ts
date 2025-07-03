import { NextRequest } from "next/server";
import { parseForm } from "@/lib/parseForm";
import fs from "fs";
import { uploadImageToImageKit } from "@/lib/imageKit";
import { verifyImageWithGemini } from "@/lib/verifyImageWithGemini";
import { supabase } from "@/lib/supabaseServer";
import { Readable } from "stream";
import { IncomingMessage, IncomingHttpHeaders } from "http"; 
import { getOrSetCache } from "@/lib/cache";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const disaster_id = params.id;
    const cacheKey = `reports:${disaster_id}`;

    const { data, fromCache } = await getOrSetCache(cacheKey, async () => {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('disaster_id', disaster_id)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return data;
    });

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Cache': fromCache ? 'HIT' : 'MISS',
      },
    });

  } catch (err) {
    console.error('GET /reports error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}

export async function toNodeReadable(req: NextRequest): Promise<IncomingMessage> {
  const bodyStream = await webStreamToNodeReadable(req.body as ReadableStream<Uint8Array>);

  const stream = bodyStream as unknown as IncomingMessage;
  stream.headers = Object.fromEntries(req.headers.entries()) as IncomingHttpHeaders;
  stream.method = req.method ?? "POST";
  stream.url = req.url ?? "";

  return stream;
}


async function webStreamToNodeReadable(webStream: ReadableStream<Uint8Array>) {
  const reader = webStream.getReader();
  const stream = new Readable({
    async read() {
      const { done, value } = await reader.read();
      if (done) this.push(null);
      else this.push(value);
    },
  });
  return stream;
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const disaster_id = params.id;
    const nodeReq = await toNodeReadable(req);

    const [fields, files] = await parseForm(nodeReq);

    const user_id = Array.isArray(fields.user_id) ? fields.user_id[0] : fields.user_id;
    const content = Array.isArray(fields.content) ? fields.content[0] : fields.content;

    let image_url: string | null = null;
    let verification_summary: string | null = null;

    if (files.image) {
      const file = Array.isArray(files.image) ? files.image[0] : files.image;
       const buffer = await fs.promises.readFile(file.filepath);
      const uploaded = await uploadImageToImageKit(buffer, file.originalFilename || "upload.jpg");
      image_url = uploaded.url;

      verification_summary = await verifyImageWithGemini(image_url);
    }

    const { data, error } = await supabase.from("reports").insert([{
      disaster_id,
      user_id,
      content,
      image_url,
      verification_status: verification_summary ? "verified" : "pending",
    }]).select("*");

    if (error) {
      console.error("Insert error:", error.message);
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    await supabase.from("cache").delete().eq("key", `reports:${disaster_id}`);

    return new Response(JSON.stringify(data), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("POST /reports error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}
