import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_URL = 'https://fhhgbuloutxwwwwfqbfm.supabase.co';
const DEFAULT_KEY = 'sb_publishable_vzJPojPM3p0RjYF50eRxgQ_2urWfTj0';

function isValidHttpUrl(str: string | undefined): boolean {
  if (!str || str === 'undefined' || str === 'null') return false;
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function getSupabaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  if (isValidHttpUrl(envUrl)) {
    return envUrl as string;
  }
  return DEFAULT_URL;
}

function getSupabaseKey(): string {
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (envKey && envKey !== 'undefined' && envKey !== 'null' && envKey.trim().length > 0) {
    return envKey;
  }
  return DEFAULT_KEY;
}

export const supabase: SupabaseClient = createClient(getSupabaseUrl(), getSupabaseKey());
