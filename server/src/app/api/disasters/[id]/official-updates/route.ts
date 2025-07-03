import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabaseServer";
import { getUserFromRequest } from '@/lib/getUserFromRequest';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const disaster_id = params.id;

    const { data, error } = await supabase
      .from("official_updates")
      .select("*")
      .eq("disaster_id", disaster_id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching official updates:", error);
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("GET /official-updates error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
const user = await getUserFromRequest();
if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
}

// then parse form or json
const body = await req.json();
const { title, description } = body;

const { data, error } = await supabase.from('official_updates').insert([
    {
    disaster_id: params.id,
    title,
    description,
    posted_by: user.id
    }
]).select("*");

if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
}

return new Response(JSON.stringify(data), {
    status: 201,
    headers: { "Content-Type": "application/json" },
});
}

