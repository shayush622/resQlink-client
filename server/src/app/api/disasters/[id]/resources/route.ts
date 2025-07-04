import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabaseServer'
import { liveKitEmitter } from '@/lib/livekitEmitter'

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

  const { data: resources, error } = await supabase
    .rpc('get_resources_near_location', {
      disaster_location: disaster.location,
      radius_meters: 10000
    })

    await liveKitEmitter("resqlink-global", {
    type: "resources_updated",
    data: {
      disaster_id: resources.disaster_id,
      resource_id: resources.id,
      resource_type: resources.type,
      summary: `New ${resources.type} resource added`,
      updated_at: new Date().toISOString(),
    }
  });

  if (error) {
    console.error('Supabase error:', error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  return new Response(JSON.stringify(resources), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}
