import { createClient } from '@supabase/supabase-js';

// URL dan Key resmi Supabase milik finanmuflih2023-eng
const supabaseUrl = 'https://leehfokkzttxijxyuqkc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlZWhmb2trenR0eGlqeHl1cWtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0Mzc0NTEsImV4cCI6MjEwNDAxMzQ1MX0.cuWJ6qMvs6cctNJGvcIhowAPryULH-9EeCDxjweUpHQ';

export const supabase = createClient(supabaseUrl, supabaseKey);