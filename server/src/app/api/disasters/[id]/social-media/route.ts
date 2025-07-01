import { supabase } from '@/lib/supabaseServer'
import { NextRequest } from 'next/server'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params

  const cacheKey = `social:${id}`
  const now = new Date().toISOString()

  // 1. Check if cached
  const { data: cached, error: cacheErr } = await supabase
    .from('cache')
    .select('value, expires_at')
    .eq('key', cacheKey)
    .single()
    console.log('Cache check:', { cacheKey, cached, error: cacheErr })
  if (cached && cached.expires_at > now) {
    return new Response(JSON.stringify(cached.value), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // 2. Mock Social Media Data (fake tweets/posts)
  const fakePosts = [
    {
      id: 'post1',
      platform: 'Twitter',
      content: `🚨 Emergency update for disaster ${id} – rescue teams deployed.`,
      author: '@rescueTeam',
      created_at: new Date().toISOString()
    },
    {
      id: 'post2',
      platform: 'Bluesky',
      content: `⚠️ Water levels rising again near region affected by disaster ${id}.`,
      author: '@weatherWatch',
      created_at: new Date().toISOString()
    }
  ]

  // 3. Cache the data (TTL = 1 hour)
  await supabase
    .from('cache')
    .upsert({
      key: cacheKey,
      value: fakePosts,
      expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString() // +1 hour
    })

  return new Response(JSON.stringify(fakePosts), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}
