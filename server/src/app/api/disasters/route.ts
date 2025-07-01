// server/src/app/api/disasters/route.ts
import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabaseServer'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      title,
      location_name,
      latitude,  
      longitude, 
      description,
      tags,
      owner_id
    } = body;

    const auditTrail = [
      {
        action: 'create',
        user_id: owner_id,
        timestamp: new Date().toISOString()
      }
    ];

    const { data, error } = await supabase.rpc('insert_disaster', {
      title,
      location_name,
      latitude,         
      longitude,
      description,
      tags,
      owner_id,
      audit: JSON.stringify(auditTrail)
    });

    if (error) {
      console.error('Supabase Error:', error.message);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } 
  catch (err) {
    console.error('Internal Server Error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}


export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const tag = searchParams.get('tag')

    let query = supabase.from('disasters').select('*')

    if (tag) {
      query = query.contains('tags', [tag])
    }

    const { data, error } = await query

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      })
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } 
  catch (err) {
    console.error('GET /api/disasters error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
    })
  }
}