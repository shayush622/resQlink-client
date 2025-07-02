import { supabase } from '@/lib/supabaseServer'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const { user_id, content, image_url } = body
    const disaster_id = params.id

    const { data, error } = await supabase.from('reports').insert([
      {
        disaster_id,
        user_id,
        content,
        image_url,
        verification_status: 'pending', 
      },
    ])
    .select('*')

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }

    return new Response(JSON.stringify(data), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  }
   catch (err) {
    console.error('POST /reports error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 })
  }
}
export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const disaster_id = params.id

    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('disaster_id', disaster_id)
      .order('created_at', { ascending: false }) 

    if (error) {
      console.error('Error fetching reports:', error)
      return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })

  }
   catch (err) {
    console.error('GET /reports error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 })
  }
}
