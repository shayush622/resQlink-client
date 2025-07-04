import { supabase } from "@/lib/supabaseServer";
import { getOrSetCache } from "@/lib/cache";
import { NextRequest } from "next/server";
import { Disaster, DisasterWithDistance } from "@/types/disaster.type";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const radius = searchParams.get("radius") ?? "10000";
  const tag = searchParams.get("tag");

  const isLocationFilter = lat && lng;
  const isTagFilter = !!tag;
  const shouldUseCache = !isLocationFilter && !isTagFilter;

  const cacheKey = "browse-page";

  try {
    if (shouldUseCache) {
      const { data, fromCache } = await getOrSetCache<Disaster[]>(cacheKey, async () => {
        const { data, error } = await supabase
          .from("disaster_overview")
          .select("*")
          .order("created_at", { ascending: false });

        if (error || !data) throw new Error(error?.message ?? "No data");
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

    let filteredData: Disaster[] | DisasterWithDistance[] = [];

    if (isLocationFilter) {
      const location = `POINT(${lng} ${lat})`;

      const { data, error } = await supabase.rpc("get_disasters_near_location", {
        user_location: location,
        radius_meters: Number(radius),
      });

      if (error || !data) throw new Error(error?.message ?? "Failed to fetch location-filtered disasters");
      filteredData = data as DisasterWithDistance[];
    } else {
      const { data, error } = await supabase
        .from("disaster_overview")
        .select("*")
        .order("created_at", { ascending: false });

      if (error || !data) throw new Error(error?.message ?? "Failed to fetch disasters");
      filteredData = data as Disaster[];
    }

    if (isTagFilter) {
      filteredData = filteredData.filter((d) => d.tags?.includes(tag));
    }

    return new Response(JSON.stringify(filteredData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "X-Cache": "BYPASS",
      },
    });
  } catch (err) {
    console.error("GET /browse error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}
