import { supabase } from "@/lib/supabase";

const ADMIN_SECRET =
  process.env.ADMIN_SECRET || "";

export async function GET(req: Request) {
  try {
    console.log("=================================");
    console.log("GET /api/leads called");
    console.log("=================================");

    console.log(
      "SUPABASE URL:",
      process.env.NEXT_PUBLIC_SUPABASE_URL
    );

    console.log(
      "ANON KEY EXISTS:",
      !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    console.log(
      "ADMIN SECRET EXISTS:",
      !!process.env.ADMIN_SECRET
    );

    const secret =
      req.headers.get("x-admin-secret");

    console.log(
      "HEADER SECRET EXISTS:",
      !!secret
    );

    if (secret !== ADMIN_SECRET) {
      console.error(
        "Unauthorized Request"
      );

      return Response.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    console.log(
      "Fetching leads from Supabase..."
    );

    const { data, error } =
      await supabase
        .from("leads")
        .select("*")
        .order(
          "created_at",
          {
            ascending: false,
          }
        );

    console.log(
      "Supabase query completed"
    );

    if (error) {
      console.error(
        "SUPABASE ERROR:",
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

    console.log(
      "Records Found:",
      data?.length || 0
    );

    return Response.json(
      data || []
    );

  } catch (err: any) {

    console.error(
      "FULL ERROR OBJECT:"
    );

    console.error(err);

    console.error(
      "ERROR MESSAGE:"
    );

    console.error(
      err?.message
    );

    console.error(
      "ERROR CAUSE:"
    );

    console.error(
      err?.cause
    );

    return Response.json(
      {
        error:
          err?.message ||
          String(err),
      },
      {
        status: 500,
      }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const secret = req.headers.get("x-admin-secret");
    if (secret !== ADMIN_SECRET) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id, status } = await req.json();
    if (!id || !status) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("leads")
      .update({ status })
      .eq("id", id)
      .select();

    if (error) {
      return Response.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return Response.json(data);
  } catch (err: any) {
    return Response.json(
      { error: err?.message || String(err) },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const secret = req.headers.get("x-admin-secret");
    if (secret !== ADMIN_SECRET) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await req.json();
    if (!id) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("leads")
      .delete()
      .eq("id", id);

    if (error) {
      return Response.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return Response.json({ success: true });
  } catch (err: any) {
    return Response.json(
      { error: err?.message || String(err) },
      { status: 500 }
    );
  }
}