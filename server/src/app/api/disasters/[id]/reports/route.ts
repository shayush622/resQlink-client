import { NextRequest } from "next/server";
import { parseForm } from "@/lib/parseForm";
import fs from "fs";
import { uploadImageToImageKit } from "@/lib/imageKit";
import { verifyImageWithGemini } from "@/lib/verifyImageWithGemini";
import { supabase } from "@/lib/supabaseServer";
import { Readable } from "stream";
import { IncomingMessage, IncomingHttpHeaders } from "http"; 
import { getOrSetCache } from "@/lib/cache";
import { liveKitEmitter } from "@/lib/livekitEmitter";
import { withCorsHeaders } from "@/lib/withCors";
import { getAuthenticatedUser } from "@/lib/authMiddlware";

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const disaster_id = params.id;
    const { searchParams } = new URL(req.url);
    const refresh = searchParams.get('refresh') === 'true';

    const cacheKey = `reports:verified:${disaster_id}`;

    const fetchReports = async () => {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('disaster_id', disaster_id)
        .eq('verification_status', 'verified')
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return data;
    };

    const { data, fromCache } = refresh
      ? { data: await fetchReports(), fromCache: false }
      : await getOrSetCache(cacheKey, fetchReports);

    return withCorsHeaders(new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Cache': fromCache ? 'HIT' : 'MISS',
      },
    }));
  } catch (err) {
    console.error('GET /reports error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
    });
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
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    if (user.role !== "admin") {
      return new Response(JSON.stringify({ error: "Forbidden – admin only" }), { status: 403 });
    }

    const disaster_id = params.id;
    const nodeReq = await toNodeReadable(req);
    const [fields, files] = await parseForm(nodeReq);

    const content = Array.isArray(fields.content) ? fields.content[0] : fields.content;

    let image_url: string | null = null;
    let geminiResult: { isVerified: boolean; summary: string } | null = null;

    if (files.image) {
      const file = Array.isArray(files.image) ? files.image[0] : files.image;
      const buffer = await fs.promises.readFile(file.filepath);
      const uploaded = await uploadImageToImageKit(buffer, file.originalFilename || "upload.jpg");
      image_url = uploaded.url;

      geminiResult = await verifyImageWithGemini(image_url);
    }

    const { data, error } = await supabase.from("reports").insert([{
      disaster_id,
      user_id: user.id,
      content,
      image_url,
      verification_status: geminiResult
        ? geminiResult.isVerified
          ? "verified"
          : "rejected"
        : "pending",
    }]).select("*");

    if (error) {
      console.error("Insert error:", error.message);
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    await supabase.from("cache").delete().eq("key", `reports:${disaster_id}`);

    await liveKitEmitter("disaster-" + disaster_id, {
      type: "report_added",
      data: {
        disaster_id,
        report_id: data[0].id,
        content: data[0].content,
        user_id: data[0].user_id,
        image_url: data[0].image_url,
        verification_status: data[0].verification_status,
        created_at: data[0].created_at,
      },
    });

    return withCorsHeaders(new Response(JSON.stringify(data), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    }));

  } catch (err) {
    console.error("POST /reports error:", err);
    return withCorsHeaders(new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 }));
  }
}

