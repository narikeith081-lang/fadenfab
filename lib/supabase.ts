import { createClient } from "@supabase/supabase-js";

// ✅ Environment variables
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// ✅ Validation
if (!supabaseUrl) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL"
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );
}

// ✅ Create client
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);