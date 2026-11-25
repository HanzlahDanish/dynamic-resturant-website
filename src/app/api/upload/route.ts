
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    // Only logged-in admins can upload images
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json(
        { error: "Unauthorized. Admin login required." },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("image");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Please select an image." },
        { status: 400 }
      );
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPG, PNG, and WebP images are allowed." },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Image size must be 5MB or less." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<{ secure_url: string }>(
      (resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "food-house/menu",
            resource_type: "image",
          },
          (error, uploadedImage) => {
            if (error || !uploadedImage) {
              reject(error || new Error("Image upload failed."));
            } else {
              resolve(uploadedImage);
            }
          }
        );

        stream.end(buffer);
      }
    );

    return NextResponse.json({
      imageUrl: result.secure_url,
      message: "Image uploaded successfully.",
    });
  } catch (error) {
    console.error("Image upload error:", error);

    return NextResponse.json(
      { error: "Unable to upload image." },
      { status: 500 }
    );
  }
}
