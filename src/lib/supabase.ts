import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://fcsnguehlrxfsblzxtxz.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_KEY || '';

if (!supabaseAnonKey) {
  console.error('SUPABASE KEY MISSING!');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
