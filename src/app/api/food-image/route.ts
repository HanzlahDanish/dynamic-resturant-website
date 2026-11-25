
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query")?.trim();

    if (!query) {
      return NextResponse.json(
        { error: "Food name is required." },
        { status: 400 }
      );
    }

    const accessKey = process.env.UNSPLASH_ACCESS_KEY;

    if (!accessKey) {
      return NextResponse.json(
        { error: "Unsplash API key is missing." },
        { status: 500 }
      );
    }

    const searchUrl = new URL(
      "https://api.unsplash.com/search/photos"
    );

    searchUrl.searchParams.set("query", `${query} food dish`);
    searchUrl.searchParams.set("per_page", "1");
    searchUrl.searchParams.set("orientation", "landscape");

    const response = await fetch(searchUrl.toString(), {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
        "Accept-Version": "v1",
      },
      next: { revalidate: 86400 },
    });

    if (!response.ok) {
      console.error("Unsplash error:", response.status);

      return NextResponse.json(
        { error: "Unable to find a food image." },
        { status: 502 }
      );
    }

    const data = await response.json();
    const photo = data.results?.[0];

    if (!photo) {
      return NextResponse.json(
        { image: null, message: "No matching image found." }
      );
    }

    return NextResponse.json({
      image: photo.urls.regular,
      photographer: photo.user.name,
      photographerUrl: photo.user.links.html,
      photoUrl: photo.links.html,
    });
  } catch (error) {
    console.error("Food image API error:", error);

    return NextResponse.json(
      { error: "Food image search failed." },
      { status: 500 }
    );
  }
}
