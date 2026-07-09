import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

// Do not hardcode credentials. The runtime should provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
