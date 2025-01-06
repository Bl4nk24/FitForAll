// src/supabase.js
import { createClient } from '@supabase/supabase-js'

// Hier kannst du deine URL & Keys entweder direkt eintragen
// oder aus Umgebungsvariablen (z. B. Vite) auslesen.
const supabaseUrl = process.env.VUE_APP_SUPABASE_URL
const supabaseAnonKey = process.env.VUE_APP_SUPABASE_URL

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
