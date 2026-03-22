import { createClient } from '@supabase/supabase-js'
const env = import.meta.env

// Unterstützt beide Naming-Konventionen, damit fehlerhafte .env-Namen
// nicht zu API-Fehlern (z. B. 400 bei Features) führen.
const supabaseUrl = (
  env.VITE_APP_SUPABASE_URL ||
  env.VITE_SUPABASE_URL ||
  ''
).trim()

const supabaseAnonKey = (
  env.VITE_APP_SUPABASE_ANON_KEY ||
  env.VITE_SUPABASE_ANON_KEY ||
  ''
).trim()

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase config. Set VITE_APP_SUPABASE_URL/VITE_APP_SUPABASE_ANON_KEY ' +
    'or VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY in your .env file.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
