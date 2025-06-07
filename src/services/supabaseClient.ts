import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mdirhtaubbluttfmxuzy.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kaXJodGF1YmJsdXR0Zm14dXp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNjA4NjksImV4cCI6MjA2NDgzNjg2OX0.fZrroIkfD0iKQHBVsCfgFwx3khPghbxyFZsYZGxN6Ps'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
