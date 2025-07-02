import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabaseServer'

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

  if (error) {
    console.error('Supabase error:', error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  return new Response(JSON.stringify(resources), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}
