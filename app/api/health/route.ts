export async function GET() {
  return Response.json({
    ok: true,
    env: {
      database: Boolean(process.env.DATABASE_URL),
      adminSecret: Boolean(process.env.ADMIN_SECRET),
      resend: Boolean(process.env.RESEND_API_KEY),
      blob: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    },
  });
}
