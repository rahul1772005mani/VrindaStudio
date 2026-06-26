// supabase.js - Supabase Client Initialization
// Connects our React frontend to the Supabase PostgreSQL database

import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL || '';
// Clean the URL: strip trailing /rest/v1/ or trailing slashes that cause "Invalid path" error
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
