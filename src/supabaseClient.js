import { createClient } from '@supabase/supabase-js';

// Ganti teks di bawah ini dengan URL dan Key asli yang kamu salin dari Supabase tadi
const supabaseUrl = 'https://ruhcfiiefiqvrluxsnhk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1aGNmaWllZmlxdnJsdXhzbmhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM4NTYwNDQsImV4cCI6MjA5OTQzMjA0NH0.z9E4AYOFsN-ssI3SiJJSPWPuJ9SBRaz5hRQBhQgNYOQ';

export const supabase = createClient(supabaseUrl, supabaseKey);