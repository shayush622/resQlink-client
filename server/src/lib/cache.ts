import { supabase } from "@/lib/supabaseServer";

const DEFAULT_TTL = 60 * 60 * 1000; 

export async function getOrSetCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number = DEFAULT_TTL): Promise<{ data: T; fromCache: boolean }> {
  const now = new Date();

  const { data: cached } = await supabase
    .from("cache")
    .select("value")
    .eq("key", key)
    .gt("expires_at", now.toISOString())
    .single();

  if (cached?.value) {
    return { data: cached.value as T, fromCache: true };
  }

  const freshData = await fetcher();

  await supabase.from("cache").upsert({
    key,
    value: freshData,
    expires_at: new Date(now.getTime() + ttlMs).toISOString(),
  });

  return { data: freshData, fromCache: false };
}
