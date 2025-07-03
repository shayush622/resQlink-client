import { supabase } from "@/lib/supabaseServer";

export async function getCache<T>(key: string): Promise<T | null> {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("cache")
    .select("value")
    .eq("key", key)
    .gt("expires_at", now)
    .single();

  if (error) return null;
  return data?.value as T;
}

export async function setCache(key: string, value: any, ttlSeconds: number) {
  const expires_at = new Date(Date.now() + ttlSeconds * 1000).toISOString();

  const { error } = await supabase
    .from("cache")
    .upsert({ key, value, expires_at });

  if (error) console.error("Cache set error:", error.message);
}
