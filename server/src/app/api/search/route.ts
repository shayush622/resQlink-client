import { supabase } from "@/lib/supabaseServer";
import { NextRequest } from "next/server";
import { Disaster } from "@/types/disaster.type";

type DisasterWithMeta = Disaster & {
  score: number;
  distance?: number;
};

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; 
  const toRad = (x: number) => (x * Math.PI) / 180;

  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim().toLowerCase();
  const tag = searchParams.get("tag");
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const radius = searchParams.get("radius") ?? "10000";

  if (!q) {
    return new Response(JSON.stringify({ error: "Missing search query `q`" }), {
      status: 400,
    });
  }

  try {
    const { data, error } = await supabase.rpc("fuzzy_search_disasters", {
      keyword: q,
    });

    if (error || !data) {
      console.error("Supabase fuzzy search error:", error);
      return new Response(JSON.stringify({ error: "Search failed" }), {
        status: 500,
      });
    }

    let results = data as DisasterWithMeta[];

    if (tag) {
      results = results.filter((d) => d.tags?.includes(tag));
    }

    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      const maxRadius = Number(radius);

      results = results
        .map((d) => {
          const [lng2, lat2] = d.location.coordinates;
          const dist = haversine(userLat, userLng, lat2, lng2);
          return { ...d, distance: dist };
        })
        .filter((d) => d.distance! <= maxRadius)
        .sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          if (a.distance !== undefined && b.distance !== undefined) {
            return a.distance - b.distance;
          }
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
    }

    const cleaned = results.map(({  ...rest }) => rest);

    return new Response(JSON.stringify(cleaned), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("GET /search error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}
