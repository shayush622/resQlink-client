import { getOrSetCache } from "@/lib/cache";
import { supabase } from "@/lib/supabaseServer";

export async function GET() {
  try {
    const { data, fromCache } = await getOrSetCache("browse-page", async () => {
      const { data, error } = await supabase
        .from("disaster_overview")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);
      return data!;
    });

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "X-Cache": fromCache ? "HIT" : "MISS",
      },
    });
  } catch (err) {
    console.error("GET /browse error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}
