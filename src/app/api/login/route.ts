
import { createAdminSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const username = String(body.username ?? "");
    const password = String(body.password ?? "");

    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminUsername || !adminPassword) {
      console.error("Admin credentials are missing.");
      return Response.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    if (
      username !== adminUsername ||
      password !== adminPassword
    ) {
      return Response.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    await createAdminSession();

    return Response.json({
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login error:", error);

    return Response.json(
      { error: "Unable to process login" },
      { status: 500 }
    );
  }
}
