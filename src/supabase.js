import { createClient } from '@supabase/supabase-js'

// Forzamos a que solo use las variables de Vercel
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  console.error("CRÍTICO: La URL de Supabase no llega a la web. Revisa Vercel.")
}

export const supabase = createClient(
  supabaseUrl || 'https://vacio.supabase.co', 
  supabaseAnonKey || 'vacio'
)