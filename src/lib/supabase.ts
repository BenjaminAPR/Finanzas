import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Para el Bot (Webhook API), necesitaremos el Service Role Key para hacer operaciones
// que salten el RLS si es necesario, o autenticar con el token de un usuario.
// En este caso, usaremos el Service Role Key internamente en el backend.
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'

export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey)
