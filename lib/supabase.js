import { createClient } from '@supabase/supabase-js';

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseUrl = 'https://vkmqkrzfpfnjzicnftdt.supabase.co'
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrbXFrcnpmcGZuanppY25mdGR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQyODEzNTQsImV4cCI6MjA0OTg1NzM1NH0.51lM9seuB0S_zExJgj8d25_QpW_QleaW1XWcY2wX894';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);