export const NEEDS_HUMAN = "NEEDS_HUMAN";

export function buildPrompt({ shop, matchedProducts, rules, pastReplies, message }) {
  const catalogLines = matchedProducts.map((p) => {
    const parts = [`- ${p.name}: Rs.${p.price}`];
    if (p.variants) parts.push(`options: ${p.variants}`);
    if (p.stock) parts.push(`availability: ${String(p.stock).replace(/^in stock:\s*/i, "")}`);
    return parts.join("; ");
  });

  const rulesByCategory = {};
  for (const r of rules) {
    if (!rulesByCategory[r.category]) rulesByCategory[r.category] = [];
    rulesByCategory[r.category].push(r.content);
  }
  const rulesText = Object.entries(rulesByCategory)
    .map(([cat, contents]) => `${cat}: ${contents.join(" / ")}`)
    .join("\n");

  const examples = pastReplies
    .slice(0, 20)
    .map(
      (r, i) =>
        `Example ${i + 1}:\nCustomer: ${r.customer_msg}\nSeller: ${r.seller_reply}`
    )
    .join("\n\n");

  return `You are a reply assistant for a small Indian online seller. The seller will manually review and send your draft. Your job: draft 2-3 reply options to a customer message.

SELLER PROFILE:
Shop: ${shop.name || "unnamed"}
Tone: ${shop.tone_notes || "Friendly, natural, match the customer's language"}

PRODUCTS THE CUSTOMER MIGHT BE ASKING ABOUT (only these, from the seller's catalog):
${catalogLines.length ? catalogLines.join("\n") : "(no specific product matched — this may be a general policy question like delivery, payment, or returns; answer from SHOP RULES only)"}

SHOP RULES:
${rulesText}

HARD RULES:
1. Use ONLY facts from the products and rules above. Never invent prices, stock, delivery times, or policies.
2. If the customer asks anything NOT literally stated in the facts above — including customization, alterations, repairs, wholesale, bulk pricing, other products, or policies not listed — output exactly: ${NEEDS_HUMAN} and nothing else. IMPORTANT: answering "we don't do customization" when no customization policy is listed above is WRONG, because that "no" is also an invented fact. Both "yes" and "no" require a listed fact. Silence = ${NEEDS_HUMAN}.
3. If NO product above matches what the customer is asking about, output exactly: ${NEEDS_HUMAN} and nothing else.
4. Reply in the SAME language and script as the customer. If they write Hinglish in Roman script, reply in Hinglish Roman. If they use Assamese words in Roman script (koto, niki, pora, or, dikhim, etc.), reply with Assamese words in Roman script the same way — do NOT switch to Hindi. Match their formality and energy.
5. Match the seller's tone from the examples. Use emojis only if the seller's examples do.
6. Do not promise anything about availability unless stock is stated in the facts.

SELLER'S PAST REPLIES (use these to match voice, style, greeting, emoji habits):
${examples}

If answerable — Output: ["Namaste! ...", "..."]
If customization/unknown/not in catalog — Output: ${NEEDS_HUMAN}

DECISION EXAMPLES:
Customer asks price of Muga Dupatta → Output: ["drafts using Rs.2400 fact..."]
Customer: "border customize kar sakte hain?" → no customization fact exists → Output: ${NEEDS_HUMAN}
Customer: "repair kar do purana mekhela" → no repair fact exists → Output: ${NEEDS_HUMAN}
Customer: "wholesale rate milega?" → no wholesale fact exists → Output: ${NEEDS_HUMAN}
Customer: "iPhone kaisa hai?" → product not in catalog → Output: ${NEEDS_HUMAN}

CUSTOMER MESSAGE:
${message}

NOW, applying the HARD RULES above — especially rule 2 ("no" is also inventing a fact) — produce output for this message:
OUTPUT FORMAT — strict JSON array, no markdown fences, no commentary:
["draft 1", "draft 2", "draft 3"]
Or if not answerable from the facts: ${NEEDS_HUMAN}`;
}

export function parseModelOutput(text) {
  const trimmed = String(text).trim();
  if (trimmed.toUpperCase().replace(/[^A-Z_]/g, "") === "NEEDSHUMAN") {
    return { needsHuman: true, drafts: [] };
  }
  if (trimmed.includes(NEEDS_HUMAN) && !trimmed.includes("[")) {
    return { needsHuman: true, drafts: [] };
  }
  let candidate = trimmed;
  const jsonMatch = trimmed.match(/\[[\s\S]*\]/);
  if (jsonMatch) candidate = jsonMatch[0];
  try {
    const parsed = JSON.parse(candidate);
    if (Array.isArray(parsed)) {
      const drafts = parsed.map(String).filter(Boolean);
      if (drafts.some((d) => d.includes(NEEDS_HUMAN) && d.trim().length < 30)) {
        return { needsHuman: true, drafts: [] };
      }
      if (drafts.length > 0) return { needsHuman: false, drafts: drafts.slice(0, 3) };
    }
  } catch {
    // fall through
  }
  const lines = trimmed
    .split("\n")
    .map((l) => l.replace(/^\s*(\d+[.)]|[-*])\s*/, "").trim())
    .filter((l) => l.length > 10 && !l.startsWith("```"));
  if (lines.length > 0) return { needsHuman: false, drafts: lines.slice(0, 3) };
  return { needsHuman: true, drafts: [] };
}
