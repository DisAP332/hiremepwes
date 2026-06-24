import { timingSafeEqual } from "crypto";

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function requireAdmin(request: Request): Response | null {
  const expected = process.env.ADMIN_SECRET;
  if (!expected) {
    return Response.json({ error: "ADMIN_SECRET is not configured." }, { status: 500 });
  }

  const provided = request.headers.get("x-admin-secret") ?? "";
  if (!provided || !safeEqual(provided, expected)) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  return null;
}
