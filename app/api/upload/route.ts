import { put } from "@vercel/blob";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

function safeFileName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export async function POST(request: Request) {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return Response.json(
        {
          error:
            "Photo uploads need BLOB_READ_WRITE_TOKEN. Add a Vercel Blob token to .env.local and Vercel environment variables.",
        },
        { status: 500 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return Response.json(
        { error: "No photo file was uploaded." },
        { status: 400 },
      );
    }

    if (!file.type.startsWith("image/")) {
      return Response.json(
        { error: "Only image uploads are allowed." },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return Response.json(
        { error: "Photo is too large. Please upload an image under 5 MB." },
        { status: 400 },
      );
    }

    const extension = file.name.includes(".")
      ? file.name.split(".").pop()
      : "jpg";
    const filename = safeFileName(file.name || `photo.${extension}`);
    const pathname = `booking-photos/${Date.now()}-${crypto.randomUUID()}-${filename}`;

    const blob = await put(pathname, file, {
      access: "public",
      contentType: file.type,
    });

    return Response.json({ url: blob.url });
  } catch (error) {
    console.error("Photo upload failed:", error);

    return Response.json(
      {
        error: error instanceof Error ? error.message : "Photo upload failed.",
      },
      { status: 500 },
    );
  }
}
