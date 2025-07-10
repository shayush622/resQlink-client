import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabaseServer'
import { liveKitEmitter } from '@/lib/livekitEmitter'
import { getAuthenticatedUser } from '@/lib/authMiddlware'
import type { Feature, Point } from 'geojson';

type RawResourceRow = {
  id: string;
  disaster_id: string;
  type: string;
  name: string;
  location_name: string | null;
  created_at: string;
  location_geojson: string;
};

type Resource = Omit<RawResourceRow, 'location_geojson'> & {
  location: Feature<Point>;
};

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params

  const { data: disaster, error: disasterErr } = await supabase
    .from('disasters')
    .select('location')
    .eq('id', id)
    .single()

  if (disasterErr || !disaster) {
    return new Response(JSON.stringify({ error: 'Disaster not found' }), { status: 404 })
  }

  const { data: rawResources, error } = await supabase
    .rpc('get_resources_near_location', {
      disaster_location: disaster.location,
      radius_meters: 10000.0
    })
    if (error) {
    console.error('Supabase error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  const resources: Resource[] = rawResources.map((res: RawResourceRow) => ({
    ...res,
    location: JSON.parse(res.location_geojson),
  }));

  return new Response(JSON.stringify(resources), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(req: NextRequest) {

  const user = await getAuthenticatedUser(req);
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  if (user.role !== "admin") {
    return new Response(JSON.stringify({ error: "Forbidden – admin only" }), { status: 403 });
  }

  const body = await req.json();
  const { disaster_id, type, lat, lng, name } = body;

  const { data, error } = await supabase
    .from("resources")
    .insert({
      disaster_id,
      type,
      name,
      location: `POINT(${lng} ${lat})`, 
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Insert failed" }), { status: 500 });
  }

  await liveKitEmitter("resqlink-global", {
    type: "resources_updated",
    data: {
      disaster_id,
      resource_id: data.id,
      resource_type: type,
      summary: `New ${type} resource added`,
      updated_at: new Date().toISOString(),
    },
  });

  return new Response(JSON.stringify(data), { status: 201 });
}
