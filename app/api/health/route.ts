export async function GET() {
  const hasBlob =
    Boolean(process.env.BLOB_READ_WRITE_TOKEN) ||
    Boolean(process.env.BLOB_READ_WRITE_TOKEN_STORE_ID);

  return Response.json({
    ok: true,
    env: {
      database: Boolean(process.env.DATABASE_URL),
      adminSecret: Boolean(process.env.ADMIN_SECRET),
      resend: Boolean(process.env.RESEND_API_KEY),
      blob: hasBlob,
    },
  });
}
