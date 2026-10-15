import { NextResponse } from "next/server";
import { getDb, getShop } from "@/lib/db";

export async function GET() {
  return NextResponse.json(getShop());
}

export async function PUT(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const db = getDb();
  db.prepare("UPDATE shop SET name = ?, tone_notes = ? WHERE id = 1").run(
    String(body.name || ""),
    String(body.tone_notes || "")
  );
  return NextResponse.json(getShop());
}
