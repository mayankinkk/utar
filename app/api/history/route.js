import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM messages ORDER BY id DESC LIMIT 50")
    .all()
    .map((r) => ({
      id: r.id,
      createdAt: r.created_at,
      message: r.message,
      needsHuman: !!r.needs_human,
      reason: r.reason,
      matched: JSON.parse(r.matched_json || "[]"),
      drafts: JSON.parse(r.drafts_json || "[]"),
      model: r.model,
      latencyMs: r.latency_ms,
    }));
  return NextResponse.json({ messages: rows });
}

export async function DELETE() {
  const db = getDb();
  db.prepare("DELETE FROM messages").run();
  return NextResponse.json({ ok: true });
}
