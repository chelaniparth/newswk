
import { createClient } from '@supabase/supabase-js';

// These environment variables should be set in your .env file
// VITE_SUPABASE_URL=your-project-url
// VITE_SUPABASE_KEY=your-anon-key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase credentials missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_KEY.');
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '');
