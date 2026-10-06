/** Read and sanitize public Supabase env (trims quotes/whitespace from Vercel values). */
export function getSupabaseEnv() {
  const url = clean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const anonKey = clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  return { url, anonKey };
}

function clean(value: string | undefined) {
  if (!value) return "";
  return value.trim().replace(/^["']|["']$/g, "");
}

export function isSupabaseEnvValid(url: string, anonKey: string) {
  const urlOk = /^https?:\/\/.+\.supabase\.co\/?$/i.test(url);
  // Legacy anon JWT starts with eyJ; newer publishable keys start with sb_publishable_
  const keyOk =
    anonKey.startsWith("eyJ") || anonKey.startsWith("sb_publishable_");
  return urlOk && keyOk;
}
