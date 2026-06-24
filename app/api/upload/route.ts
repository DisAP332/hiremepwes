import { put } from "@vercel/blob";

const MAX_SIZE_MB = 8;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return Response.json({ error: "No file provided." }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return Response.json({ error: "Only image uploads are allowed." }, { status: 400 });
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return Response.json({ error: `Images must be under ${MAX_SIZE_MB}MB.` }, { status: 400 });
    }

    const blob = await put(`booking-photos/${Date.now()}-${file.name}`, file, {
      access: "public",
      addRandomSuffix: true,
    });

    return Response.json({ url: blob.url });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Could not upload file." }, { status: 500 });
  }
}
