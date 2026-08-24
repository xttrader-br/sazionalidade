import { ensureSchema, getSqliteClient } from "@/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureSchema();
    const sqlite = getSqliteClient();
    await sqlite.execute("SELECT 1");
    return Response.json({ ok: true, database: "libsql/sqlite" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
