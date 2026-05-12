import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://jfthlhkzcyyhdubepfor.supabase.co";
const supabaseKey = "sb_publishable_LFOJICuU1f6lQORjGe-LfQ_PE_sAbKR";

export const supabase = createClient(supabaseUrl, supabaseKey);