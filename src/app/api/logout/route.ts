
import { clearAdminSession } from "@/lib/auth";

export async function POST() {
  try {
    await clearAdminSession();

    return Response.json({
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);

    return Response.json(
      { error: "Unable to logout" },
      { status: 500 }
    );
  }
}
