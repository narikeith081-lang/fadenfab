import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return Response.json({ error: "Missing authorization header" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");

    // Create a temporary client with the user's token to verify identity
    const userClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        }
      }
    );

    const { data: { user }, error: userError } = await userClient.auth.getUser(token);
    if (userError || !user) {
      return Response.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await req.json();
    const { name, phone } = body;

    if (!name) {
      return Response.json({ error: "Name is required" }, { status: 400 });
    }

    // Now, create an admin client or sign in as admin to update the `leads` table
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        }
      }
    );

    await adminClient.auth.signInWithPassword({
      email: process.env.NEXT_PUBLIC_ADMIN_USERNAME || "admin@fadenfab.com",
      password: process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "fadenfab123"
    });

    // We do an upsert/update
    // First check if the user exists in the leads table
    const { data: existingUser, error: findError } = await adminClient
      .from("leads")
      .select("id")
      .eq("email", user.email)
      .eq("status", "user")
      .maybeSingle();

    if (findError) {
      return Response.json({ error: findError.message }, { status: 500 });
    }

    let result;
    if (existingUser) {
      // Update
      const { data, error } = await adminClient
        .from("leads")
        .update({ name, phone: phone || "N/A" })
        .eq("id", existingUser.id)
        .select();
      if (error) return Response.json({ error: error.message }, { status: 500 });
      result = data;
    } else {
      // Insert
      const { data, error } = await adminClient
        .from("leads")
        .insert({
          name,
          email: user.email,
          phone: phone || "N/A",
          company: "Unknown", // Placeholder or from metadata
          quantity: "0",
          message: "Usage: 180s",
          status: "user"
        })
        .select();
      if (error) return Response.json({ error: error.message }, { status: 500 });
      result = data;
    }

    return Response.json({ success: true, data: result });
  } catch (err: any) {
    return Response.json({ error: err.message || String(err) }, { status: 500 });
  }
}
