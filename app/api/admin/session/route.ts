import { createAdminSessionCookie, isAdminRequest } from "@/lib/auth";

export async function GET(request: Request) {
  return Response.json({ authenticated: isAdminRequest(request) });
}

export async function POST(request: Request) {
  const expected = process.env.ADMIN_SECRET;
  if (!expected) {
    return Response.json(
      { error: "ADMIN_SECRET is not configured." },
      { status: 500 },
