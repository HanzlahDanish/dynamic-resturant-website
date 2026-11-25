
import { isAdminAuthenticated } from "@/lib/auth";

export async function GET() {
  try {
    const authenticated = await isAdminAuthenticated();

    return Response.json({
      authenticated,
    });
  } catch (error) {
    console.error("Session check error:", error);

    return Response.json(
      { authenticated: false },
      { status: 500 }
    );
  }
}
