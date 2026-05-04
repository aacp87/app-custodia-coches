import { createClient } from '@supabase/supabase-js'

// Quitamos el "|| placeholder" para que si falla, nos diga por qué
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("ERROR: No se han encontrado las variables de Supabase en Vercel")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)