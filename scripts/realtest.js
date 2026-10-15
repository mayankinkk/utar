/* Seller acceptance test: runs N customer messages through /api/draft and
 * prints each draft for rating (send-as-is / edit / useless).
 *
 * Usage: node scripts/realtest.js [baseUrl] [model]
 * Output: markdown table + raw drafts. Swap SAMPLES with real seller
 * messages (names removed) for the real number.
 */
const BASE = process.argv[2] || "http://localhost:3000";
const MODEL = process.argv[3] || undefined;

const SAMPLES = [
  // answerable: products
  { msg: "bhaiya muga dupatta ka price batao", expect: "draft", check: "2,400" },
  { msg: "cotton mekhela chador hai? kitne ka", expect: "draft", check: "3,200" },
  { msg: "gamusa set dekhao gift ke liye price?", expect: "draft", check: "350" },
  { msg: "japi kitne ka hai", expect: "draft", check: "1,200" },
  { msg: "bihu dhol ka price aur stock batao", expect: "draft", check: "2,200" },
  { msg: "dokona jewellery set me kya hai? price?", expect: "draft", check: "1,800" },
  { msg: "muga scarf chahiye, available hai na?", expect: "draft", check: "1,500" },
  { msg: "mekhela chador cotton me kya kya colors hai?", expect: "draft" },
  { msg: "size M me mekhela milega?", expect: "draft" },
  // answerable: rules
  { msg: "COD ho jayega?", expect: "draft" },
  { msg: "Jorhat tak delivery kitne din ka?", expect: "draft", check: "3-4" },
  { msg: "free delivery kitne se upar hai?", expect: "draft", check: "3,000" },
  { msg: "return policy kya hai damaged aaya toh?", expect: "draft" },
  { msg: "discount milega ₹5000 wale order pe?", expect: "draft" },
  { msg: "America bhej sakte ho?", expect: "draft" },
  // unanswerable → must refuse
  { msg: "border pe custom design bana sakte ho kya?", expect: "human" },
  { msg: "purana mekhela repair kar denge?", expect: "human" },
  { msg: "wholesale rate milega 50 piece pe?", expect: "human" },
  { msg: "iPhone 16 case hai aapke paas?", expect: "human" },
  { msg: "dam koto muga orutia?", expect: "human" },
];

(async () => {
  const results = [];
  for (let i = 0; i < SAMPLES.length; i++) {
    const s = SAMPLES[i];
    const t0 = Date.now();
    const res = await fetch(`${BASE}/api/draft`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: s.msg, model: MODEL }),
    });
    const d = await res.json();
    const ms = Date.now() - t0;
    const refused = !!d.needsHuman;
    const correct = s.expect === "human" ? refused : !refused && d.drafts?.length > 0;
    const factOk = s.check
      ? refused
        ? null
        : d.drafts.join(" ").includes(s.check)
      : null;
    results.push({ ...s, refused, correct, factOk, ms, drafts: d.drafts || [], reason: d.reason });
    console.error(`[${i + 1}/20] ${correct ? "ok" : "MISS"} ${s.msg.slice(0, 50)} (${ms}ms)`);
  }

  const verdicts = { "send-as-is": 0, edit: 0, wrong: 0 };
  let out = "\n# Seller acceptance test — 20 messages\n\n";
  out += `Model: ${MODEL || "default"} | ${BASE}\n\n`;
  out += "| # | Customer message | Expected | Result | Fact check | Latency | Draft / flag |\n";
  out += "|---|---|---|---|---|---|---|\n";
  results.forEach((r, i) => {
    const result = r.correct ? (r.refused ? "refused ✓" : "drafted ✓") : r.refused ? "wrong refuse ✗" : "wrong draft ✗";
    const fact = r.factOk == null ? "—" : r.factOk ? "✓" : "✗";
    const draft = r.refused ? `**NEEDS_HUMAN** (${r.reason})` : r.drafts[0].replace(/\|/g, "\\|");
    out += `| ${i + 1} | ${r.msg} | ${r.expect === "human" ? "refuse" : "draft"} | ${result} | ${fact} | ${r.ms}ms | ${draft.slice(0, 160)} |\n`;
  });
  const passed = results.filter((r) => r.correct).length;
  const factsChecked = results.filter((r) => r.factOk != null);
  const factsPassed = factsChecked.filter((r) => r.factOk).length;
  out += `\n**Total: ${passed}/20 correct behavior** | Price/fact checks: ${factsPassed}/${factsChecked.length}\n`;
  out += `Correct refusals: ${results.filter((r) => r.expect === "human" && r.refused).length}/5 | In-catalog drafts: ${results.filter((r) => r.expect === "draft" && !r.refused).length}/15\n`;
  console.log(out);
})();
