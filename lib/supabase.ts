import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_URL = 'https://fhhgbuloutxwwwwfqbfm.supabase.co';
const DEFAULT_KEY = 'sb_publishable_vzJPojPM3p0RjYF50eRxgQ_2urWfTj0';

function sanitize(val: string | undefined): string {
  if (!val) return '';
  return val.trim().replace(/^["']|["']$/g, '').trim();
}

function isValidHttpUrl(str: string): boolean {
  if (!str || str === 'undefined' || str === 'null') return false;
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function getSupabaseUrl(): string {
  const envUrl = sanitize(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL);
  if (isValidHttpUrl(envUrl)) {
    return envUrl;
  }
  return DEFAULT_URL;
}

function getSupabaseKey(): string {
  const envKey = sanitize(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY);
  if (envKey && envKey !== 'undefined' && envKey !== 'null' && envKey.length > 0) {
    return envKey;
  }
  return DEFAULT_KEY;
}

let clientInstance: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  // サーバーサイド（Vercelビルド時・プリレンダリング時）は、
  // 環境変数に関わらず安全な固定URLで初期化してビルドエラーを100%防止する
  if (typeof window === 'undefined') {
    return createClient(DEFAULT_URL, DEFAULT_KEY);
  }

  // クライアント（ブラウザ）では、環境変数が正しければそれを使い、無ければデフォルトを使う
  if (!clientInstance) {
    clientInstance = createClient(getSupabaseUrl(), getSupabaseKey());
  }
  return clientInstance;
}

// 遅延評価Proxy: モジュール評価・インポート時（ビルド時）には createClient を実行せず、
// クライアント側で実際に supabase.from(...) が呼び出された瞬間にのみ初期化する
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const client = getClient();
    const value = Reflect.get(client, prop, receiver);
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});
