/* Model bake-off: runs fixed test messages through /api/draft against each model.
 * Usage: node scripts/bakeoff.js [baseUrl]
 * Prints a per-message table and a summary. Run after `ollama pull` both models.
 */
const BASE = process.argv[2] || "http://localhost:3000";

const TESTS = [
  { msg: "bhaiya ye muga wala dupatta kitne ka hai? delivery Jorhat tak hoga?", expect: "draft", note: "price + delivery, Hinglish" },
  { msg: "mekhela chador cotton wala available hai? size M chahiye", expect: "draft", note: "stock + size" },
  { msg: "COD hai kya?", expect: "draft", note: "short Hinglish, policy" },
  { msg: "gamusa set gift ke liye accha rahega?", expect: "draft", note: "recommendation" },
  { msg: "border customize kar sakte hain dupatta me?", expect: "human", note: "not in catalog → must refuse" },
  { msg: "dam koto japi'r?", expect: "draft", note: "Assamese Roman" },
  { msg: "dam koto muga orutia?", expect: "human", note: "orutia not in catalog → must refuse (Assamese)" },
  { msg: "iPhone 17 kab aayega?", expect: "human", note: "no product match" },
  { msg: "repair ho jayega purana mekhela?", expect: "human", note: "policy not in rules" },
  { msg: "bihu dhol hai kya? price batao", expect: "draft", note: "product + price" },
];

async function runModel(model) {
  const rows = [];
  for (const t of TESTS) {
    const start = Date.now();
    const res = await fetch(`${BASE}/api/draft`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: t.msg, model }),
    });
    const data = await res.json();
    const ms = Date.now() - start;
    const gotHuman = !!data.needsHuman;
    const correct = t.expect === "human" ? gotHuman : !gotHuman && data.drafts?.length > 0;
    rows.push({ ...t, correct, ms, draft: data.drafts?.[0] || (gotHuman ? "[NEEDS_HUMAN]" : "[empty]") });
    console.error(`  ${correct ? "✓" : "✗"} ${model} :: ${t.note} (${ms}ms)`);
  }
  return rows;
}

(async () => {
  const models = process.argv.slice(3);
  if (models.length === 0) {
    const r = await fetch(`${BASE}/api/models`);
    const d = await r.json();
    models.push(...(d.models.length ? d.models : [d.default]));
  }
  for (const model of models) {
    console.error(`\n=== ${model} ===`);
    const rows = await runModel(model);
    const passed = rows.filter((r) => r.correct).length;
    const avgMs = Math.round(rows.reduce((a, r) => a + r.ms, 0) / rows.length);
    console.log(`\n## ${model}: ${passed}/${rows.length} correct, avg ${avgMs}ms\n`);
    for (const r of rows) {
      console.log(`### ${r.correct ? "PASS" : "FAIL"} — ${r.note}`);
      console.log(`Customer: ${r.msg}`);
      console.log(`Draft: ${r.draft}\n`);
    }
  }
})();
