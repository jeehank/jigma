import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nlvunhotvqawgpemkjvf.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sdnVuaG90dnFhd2dwZW1ranZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5NTA5ODQsImV4cCI6MjEwMTUyNjk4NH0.RtVR7Ok3rKlG188lfZ_YFO7kn_CIwdRKko6kLnP64jc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
