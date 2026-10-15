import { NextResponse } from "next/server";
import { getDb, getCatalog } from "@/lib/db";

export async function GET() {
  return NextResponse.json(getCatalog());
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const db = getDb();

  if (body.action === "addProduct") {
    const { name, price, variants = "", stock = "", tags = "" } = body;
    if (!name || String(name).trim().length === 0) {
      return NextResponse.json({ error: "Product name required" }, { status: 400 });
    }
    const info = db
      .prepare("INSERT INTO products (name, price, variants, stock, tags) VALUES (?, ?, ?, ?, ?)")
      .run(String(name).trim(), price != null && price !== "" ? Number(price) : null, String(variants), String(stock), String(tags));
    return NextResponse.json({ id: info.lastInsertRowid });
  }

  if (body.action === "addRule") {
    const { category, content } = body;
    if (!category || !content) {
      return NextResponse.json({ error: "category and content required" }, { status: 400 });
    }
    const info = db
      .prepare("INSERT INTO rules (category, content) VALUES (?, ?)")
      .run(String(category).trim(), String(content).trim());
    return NextResponse.json({ id: info.lastInsertRowid });
  }

  if (body.action === "addReply") {
    const { customerMsg, sellerReply } = body;
    if (!customerMsg || !sellerReply) {
      return NextResponse.json({ error: "customerMsg and sellerReply required" }, { status: 400 });
    }
    const info = db
      .prepare("INSERT INTO past_replies (customer_msg, seller_reply) VALUES (?, ?)")
      .run(String(customerMsg).trim(), String(sellerReply).trim());
    return NextResponse.json({ id: info.lastInsertRowid });
  }

  if (body.action === "delete") {
    const { table, id } = body;
    const tables = { product: "products", rule: "rules", reply: "past_replies" };
    const tableName = tables[table];
    if (!tableName || !id) {
      return NextResponse.json({ error: "table and id required" }, { status: 400 });
    }
    db.prepare(`DELETE FROM ${tableName} WHERE id = ?`).run(Number(id));
    return NextResponse.json({ ok: true });
  }

  if (body.action === "bulkProducts") {
    const lines = String(body.text || "").split("\n").map((l) => l.trim()).filter(Boolean);
    const insert = db.prepare(
      "INSERT INTO products (name, price, variants, stock, tags) VALUES (?, ?, ?, ?, ?)"
    );
    let count = 0;
    const tx = db.transaction(() => {
      for (const line of lines) {
        const parts = line.split(",").map((p) => p.trim());
        if (parts.length < 2 || !parts[0]) continue;
        insert.run(parts[0], Number(parts[1]) || null, parts[2] || "", parts[3] || "", parts.slice(4).join(", "));
        count++;
      }
    });
    tx();
    return NextResponse.json({ inserted: count });
  }

  if (body.action === "bulkReplies") {
    const text = String(body.text || "").trim();
    const pairs = text.split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean);
    const insert = db.prepare("INSERT INTO past_replies (customer_msg, seller_reply) VALUES (?, ?)");
    let count = 0;
    const tx = db.transaction(() => {
      for (const block of pairs) {
        const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
        if (lines.length < 2) continue;
        insert.run(lines[0], lines.slice(1).join("\n"));
        count++;
      }
    });
    tx();
    return NextResponse.json({ inserted: count });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
