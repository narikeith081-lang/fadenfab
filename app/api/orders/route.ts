import { supabase } from "@/lib/supabase";

const ADMIN_SECRET = process.env.ADMIN_SECRET || "";

export async function GET(req: Request) {
  try {
    const secret = req.headers.get("x-admin-secret");
    if (secret !== ADMIN_SECRET) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Authenticate client as admin to bypass RLS restrictions
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_USERNAME || "admin@fadenfab.com";
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "fadenfab123";
    await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword
    });

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json(data || []);
  } catch (err: any) {
    return Response.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const secret = req.headers.get("x-admin-secret");
    if (secret !== ADMIN_SECRET) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, status } = await req.json();
    if (!id || !status) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Authenticate client as admin to bypass RLS restrictions
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_USERNAME || "admin@fadenfab.com";
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "fadenfab123";
    await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword
    });

    const { data, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id)
      .select();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json(data);
  } catch (err: any) {
    return Response.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const secret = req.headers.get("x-admin-secret");
    if (secret !== ADMIN_SECRET) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await req.json();
    if (!id) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Authenticate client as admin to bypass RLS restrictions
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_USERNAME || "admin@fadenfab.com";
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "fadenfab123";
    await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword
    });

    const { error } = await supabase
      .from("orders")
      .delete()
      .eq("id", id);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (err: any) {
    return Response.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
