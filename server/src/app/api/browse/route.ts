import { supabase } from "@/lib/supabaseServer";

export async function GET() {
  try {
    const { data, error } = await supabase.from('disaster_overview').select('*');

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error("GET / error:", err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}
