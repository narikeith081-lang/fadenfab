import { sign } from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { email, password } = body;

    if (
      email !== process.env.ADMIN_EMAIL ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return new Response(
        JSON.stringify({
          error: "Invalid credentials",
        }),
        {
          status: 401,
        }
      );
    }

    const token = sign(
      {
        email,
        role: "admin",
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "7d",
      }
    );
    console.log("ADMIN USER:", process.env.NEXT_PUBLIC_ADMIN_USERNAME);
    console.log("ADMIN PASS:", process.env.NEXT_PUBLIC_ADMIN_PASSWORD);
    return new Response(
      JSON.stringify({
        success: true,
        token,
      }),
      {
        status: 200,
      }
    );
  } catch (err) {
    console.error(err);

    return new Response(
      JSON.stringify({
        error: "Server error",
      }),
      {
        status: 500,
      }
    );
  }
}