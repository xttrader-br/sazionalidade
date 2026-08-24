import { getSqliteClient } from "@/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sqlite = getSqliteClient();
    sqlite.prepare("SELECT 1").get();
    return Response.json({ ok: true, database: "SQLite" });
  } catch (err: any) {
    return Response.json({ ok: false, error: err.message }, { status: 500 });
  }
}
