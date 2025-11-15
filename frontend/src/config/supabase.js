import { createClient } from '@supabase/supabase-js';

// Use placeholder values if environment variables are not set
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);