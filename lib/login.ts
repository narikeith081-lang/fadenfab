import { supabase } from "./supabase";

export async function loginUser(
  email: string,
  password: string
) {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
}

export async function logoutUser() {
  await supabase.auth.signOut();
}