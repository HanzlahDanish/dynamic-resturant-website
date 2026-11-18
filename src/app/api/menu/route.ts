
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// GET: Fetch all menu items
export async function GET() {
  try {
    const items = await sql`
      SELECT * FROM menu_items
      ORDER BY id DESC
    `;

    return Response.json(items);
  } catch (error) {
    console.error("GET menu error:", error);
    return Response.json(
      { error: "Failed to fetch menu items" },
      { status: 500 }
    );
  }
}

// POST: Add a new menu item
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = String(body.name ?? "").trim();
    const price = Number(body.price);
    const description = String(body.description ?? "").trim();

    if (!name || !Number.isFinite(price) || price <= 0) {
      return Response.json(
        { error: "Valid name and positive price are required" },
        { status: 400 }
      );
    }

    const [newItem] = await sql`
      INSERT INTO menu_items (name, price, description)
      VALUES (${name}, ${price}, ${description})
      RETURNING *
    `;

    return Response.json(newItem, { status: 201 });
  } catch (error) {
    console.error("POST menu error:", error);
    return Response.json(
      { error: "Failed to add menu item" },
      { status: 500 }
    );
  }
}

// DELETE: Remove a menu item
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const id = Number(body.id);

    if (!Number.isInteger(id) || id <= 0) {
      return Response.json(
        { error: "Valid menu item ID is required" },
        { status: 400 }
      );
    }

    const deleted = await sql`
      DELETE FROM menu_items
      WHERE id = ${id}
      RETURNING id
    `;

    if (deleted.length === 0) {
      return Response.json(
        { error: "Menu item not found" },
        { status: 404 }
      );
    }

    return Response.json({ message: "Menu item deleted successfully" });
  } catch (error) {
    console.error("DELETE menu error:", error);
    return Response.json(
      { error: "Failed to delete menu item" },
      { status: 500 }
    );
  }
}
