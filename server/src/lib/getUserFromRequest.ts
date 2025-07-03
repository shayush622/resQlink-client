import { createSSRClient } from './supabase_ssr'

export async function getUserFromRequest() {
  const supabase = await createSSRClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) return null
  return user
}
