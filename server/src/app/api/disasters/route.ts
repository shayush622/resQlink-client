// server/src/app/api/disasters/route.ts
import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabaseServer';
import { liveKitEmitter } from '@/lib/livekitEmitter';

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function POST(req: NextRequest) {
  const headers = new Headers();
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Content-Type", "application/json");

  try {
    const body = await req.json();

    const {
      title,
      location_name,
      latitude,
      longitude,
      description,
      tags,
      owner_id,
    } = body;

    const auditTrail = [
      {
        action: 'create',
        user_id: owner_id,
        timestamp: new Date().toISOString(),
      },
    ];

    const { data, error } = await supabase.rpc('insert_disaster', {
      title,
      location_name,
      latitude,
      longitude,
      description,
      tags,
      owner_id,
      audit: JSON.stringify(auditTrail),
    });

    if (error) {
      console.error('Supabase Error:', error.message);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers,
      });
    }

    await liveKitEmitter("disasters", {
      type: "disaster_updated",
      data: {
        disaster_id: data[0].id,
        action: "created",
        title: data[0].title,
        description: data[0].description,
        location: data[0].location,
        created_at: data[0].created_at,
      },
    });

    return new Response(JSON.stringify(data), {
      status: 200,
      headers,
    });
  } catch (err) {
    console.error('Internal Server Error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers,
    });
  }
}

export async function GET(req: NextRequest) {
  const headers = new Headers();
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Content-Type", "application/json");

  try {
    const { searchParams } = new URL(req.url);
    const tag = searchParams.get('tag');

    let query = supabase.from('disasters').select('*');

    if (tag) {
      query = query.contains('tags', [tag]);
    }

    const { data, error } = await query;

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers,
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers,
    });
  }
   catch (err) {
    console.error('GET /api/disasters error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers,
    });
  }
}
