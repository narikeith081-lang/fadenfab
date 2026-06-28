import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    // ✅ Parse body safely
    const body = await req.json();

    const {
      name,
      phone,
      email,
      company,
      quantity,
      message,
    } = body;

    // ✅ Validation
    if (
      !name ||
      !phone ||
      !company ||
      !quantity ||
      !message
    ) {
      return Response.json(
        {
          error: "Missing required fields",
        },
        {
          status: 400,
        }
      );
    }

    // ✅ Phone validation
    if (!/^\d{10}$/.test(phone)) {
      return Response.json(
        {
          error:
            "Phone number must be 10 digits",
        },
        {
          status: 400,
        }
      );
    }

    // ✅ Insert into Supabase
    const { data, error } =
      await supabase
        .from("leads")
        .insert([
          {
            name,
            phone,
            email: email || null,
            company,
            quantity,
            message,
            status: "new",
          },
        ])
        .select();

    // ✅ DB Error
    if (error) {
      console.error(
        "Supabase Error:",
        error
      );

      return Response.json(
        {
          error: error.message,
        },
        {
          status: 500,
        }
      );
    }

    // ✅ Success
    return Response.json(
      {
        success: true,
        message:
          "Inquiry submitted successfully",
        data,
      },
      {
        status: 200,
      }
    );

  } catch (err) {
    console.error(
      "Server Error:",
      err
    );

    return Response.json(
      {
        error:
          "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}