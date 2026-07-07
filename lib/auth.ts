import { supabase } from "./supabase";

export async function signupUser(
  fullName: string,
  email: string,
  mobile: string,
  password: string
) {
  // Create auth account
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { error };
  }

  // Save profile
  const { error: profileError } = await supabase
    .from("profiles")
    .insert({
      id: data.user?.id,
      full_name: fullName,
      email,
      mobile,
    });

  if (profileError) {
    return { error: profileError };
  }

  return { data };
}