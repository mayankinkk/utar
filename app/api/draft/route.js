import { NextResponse } from "next/server";
import { getCatalog, getDb } from "@/lib/db";
import { searchProducts, matchRuleCategories } from "@/lib/fuzzy";
import { buildPrompt, parseModelOutput } from "@/lib/prompt";
import { generate, DEFAULT_MODEL } from "@/lib/ollama";
import { detectUnknownIntent } from "@/lib/guard";

export const maxDuration = 120;

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const message = (body.message || "").trim().slice(0, 2000);
  const model = (body.model || DEFAULT_MODEL).slice(0, 60);
  if (!message) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  const t0 = Date.now();
  const { shop, products, rules, pastReplies } = getCatalog();
  const matchedProducts = searchProducts(message, products, 3);
  const ruleCategories = matchRuleCategories(message);

  const persist = (payload) => {
    try {
      getDb()
        .prepare(
          "INSERT INTO messages (message, needs_human, reason, matched_json, drafts_json, model, latency_ms) VALUES (?, ?, ?, ?, ?, ?, ?)"
        )
        .run(
          message,
          payload.needsHuman ? 1 : 0,
          payload.reason || null,
          JSON.stringify(payload.matchedProducts || []),
          JSON.stringify(payload.drafts || []),
          model,
          Date.now() - t0
        );
    } catch {
      /* history must never break drafting */
    }
  };

  if (matchedProducts.length === 0 && ruleCategories.length === 0) {
    const payload = {
      needsHuman: true,
      reason: "no_product_match",
      matchedProducts: [],
      drafts: [],
    };
    persist(payload);
    return NextResponse.json(payload);
  }

  const unknownIntent = detectUnknownIntent(message);
  if (unknownIntent) {
    const payload = {
      needsHuman: true,
      reason: "unknown_intent",
      guardPattern: unknownIntent,
      matchedProducts: matchedProducts.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        matchScore: p.matchScore,
      })),
      drafts: [],
    };
    persist(payload);
    return NextResponse.json(payload);
  }

  const prompt = buildPrompt({ shop, matchedProducts, rules, pastReplies, message });

  let raw;
  try {
    raw = await generate(prompt, model);
  } catch (err) {
    return NextResponse.json(
      { error: `Model call failed: ${err.message}` },
      { status: 502 }
    );
  }

  const { needsHuman, drafts } = parseModelOutput(raw);

  const result = {
    needsHuman,
    reason: needsHuman ? "model_flagged" : null,
    matchedProducts: matchedProducts.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      matchScore: p.matchScore,
    })),
    drafts,
    model,
  };
  persist(result);
  return NextResponse.json(result);
}
