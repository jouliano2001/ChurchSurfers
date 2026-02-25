import { createClient } from "@supabase/supabase-js";

// Client-side (public) Supabase instance — use the anon/public key
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);
