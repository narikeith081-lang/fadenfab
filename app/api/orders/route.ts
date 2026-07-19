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
      .from("leads")
      .select("*")
      .eq("status", "order")
      .order("created_at", { ascending: false });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    const mappedOrders = (data || []).map((lead: any) => {
      let companyObj: any = {};
      try {
        companyObj = JSON.parse(lead.company);
      } catch (e) {
        console.error("Parse error for lead company order:", e);
      }
      return {
        id: lead.id.toString(),
        user_id: lead.email,
        created_at: lead.created_at,
        total: parseFloat(lead.quantity) || 0,
        status: lead.message,
        items: companyObj.items || [],
        shipping_address: companyObj.shipping_address || {},
        payment_method: companyObj.payment_method || "N/A",
        transaction_id: companyObj.transaction_id || null
      };
    });

    return Response.json(mappedOrders);
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
      .from("leads")
      .update({ message: status })
      .eq("id", id)
      .eq("status", "order")
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
      .from("leads")
      .delete()
      .eq("id", id)
      .eq("status", "order");

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (err: any) {
    return Response.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
