import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://whkujypnychjugclfoez.supabase.co'
const supabaseAnonKey = 'sb_publishable_TFPd8wrsVv5K2bojYLQjYQ_sGGNhAR8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)