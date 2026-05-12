import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, email, company, quantity, message } = body;

    // ✅ Validation (phone required, email optional)
    if (!name || !phone || !company || !quantity || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 }
      );
    }

if (!/^\d{10}$/.test(phone)) {
  return new Response(
    JSON.stringify({ error: "Invalid phone number (must be 10 digits)" }),
    { status: 400 }
  );
}
    const { name, phone, email, company, quantity, message } = body;

    // ✅ Validation (phone required, email optional)
    if (!name || !phone || !company || !quantity || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("leads")
      .insert([
        {
          name,
          phone,
          email: email || null,
          company,
          quantity,
          message,
        },
      ])
      .select();

    if (error) {
      console.error("DB Error:", error);
      return new Response(JSON.stringify({ error: "Database error" }), {
        status: 500,
      });
    }

    return new Response(
      JSON.stringify({ message: "Saved successfully", data }),
      { status: 200 }
    );

  } catch (err) {
    console.error("Server Error:", err);
    return new Response(
      JSON.stringify({ error: "Server error" }),
      { status: 500 }
    );
  }
}