import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string | undefined;
const demoModeFlag = import.meta.env.PUBLIC_DEMO_MODE as string | undefined;

export function isSupabaseConfigured(): boolean {
  return Boolean(
    supabaseUrl &&
      supabaseAnonKey &&
      !supabaseUrl.includes('your-project') &&
      supabaseAnonKey !== 'your-anon-key',
  );
}

export function isDemoMode(): boolean {
  if (demoModeFlag === 'false') return !isSupabaseConfigured();
  if (demoModeFlag === 'true') return true;
  return !isSupabaseConfigured();
}

let browserClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase が未設定です。.env に PUBLIC_SUPABASE_URL / PUBLIC_SUPABASE_ANON_KEY を設定してください。',
    );
  }

  if (!browserClient) {
    browserClient = createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }

  return browserClient;
}

export function createServerSupabase(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase が未設定です。');
  }

  return createClient(supabaseUrl!, supabaseAnonKey!, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
