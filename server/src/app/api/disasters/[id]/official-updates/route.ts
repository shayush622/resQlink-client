import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabaseServer";
import { getOrSetCache } from "@/lib/cache";
import { liveKitEmitter } from "@/lib/livekitEmitter";
import { getAuthenticatedUser } from "@/lib/authMiddlware";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const disaster_id = params.id;
    const cacheKey = `official-updates:${disaster_id}`;

    const { data, fromCache } = await getOrSetCache(cacheKey, async () => {
      const { data, error } = await supabase
        .from("official_updates")
        .select("*")
        .eq("disaster_id", disaster_id)
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);
      return data;
    });

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "X-Cache": fromCache ? "HIT" : "MISS",
      },
    });

  } 
  catch (err) {
    console.error("GET /official-updates error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}


export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const body = await req.json();
  const { title, description } = body;

  const { data, error } = await supabase.from("official_updates").insert([{
    disaster_id: params.id,
    title,
    description,
    posted_by: user.id
  }]).select("*");

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  await liveKitEmitter("disaster-" + params.id, {
      type: "official_update_added",
      data: {
        disaster_id: params.id,
        update_id: data[0].id,
        title: data[0].title,
        description: data[0].description,
        posted_by: data[0].posted_by,
        created_at: data[0].created_at,
      },
    });


  await supabase.from("cache").delete().eq("key", `official-updates:${params.id}`);

  return new Response(JSON.stringify(data), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
}

