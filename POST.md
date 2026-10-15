# Uttar: grounded reply drafts for small sellers, on an open-weight model

<!-- Submit at: https://dev.to/challenges/hacktoberfest-week2-2026-10-12 -->
<!-- BEFORE POSTING: replace the REPO_LINK placeholder, fill the "First user" section
     with your real seller test (or delete it), and embed your DevRelay session. -->

**Uttar** (उत्तर — "answer") drafts replies for small Instagram/WhatsApp sellers who answer the same ten questions all day: *price? COD? Jorhat kitne din? size M hai?* Paste the customer message, get 2–3 grounded drafts in the seller's own language and voice. The seller taps copy and sends it themselves.

The core loop:

1. Seller pastes a customer message: `"bhaiya ye muga wala dupatta kitne ka hai? delivery Jorhat tak hoga?"`
2. Uttar fuzzy-matches 1–3 products from the seller's own catalog (so the model never sees the whole price list — a small model stays accurate when you only show it what matters).
3. Ollama runs **gemma3:4b** with the matched facts, the shop's delivery/payment/return rules, and 20 of the seller's real past replies as few-shot examples.
4. Output: *"Namaste bhaiya! Muga wala dupatta ₹2,400 ka hai. Jorhat tak delivery hoti hai, 3-4 din lagte hain ₹80 charge se…"* — price from the catalog, delivery days from the rules, voice from the seller's own history.
5. **Never auto-sends.** The seller reviews, edits if needed, copies, sends from WhatsApp/Instagram themselves.

If the answer isn't in the catalog, it says **NEEDS_HUMAN** and flags the message instead of inventing. *"Border pe custom design bana sakte ho?"* → refused, because the seller never told Uttar anything about customization. That refusal is the trust feature: replies can only come from facts the seller entered.

## Why the open pieces are what make it work

**The cost math only closes with a self-hosted model.** The target price is ₹299–499/month per shop. Each draft request costs ~2,500–3,000 input tokens — not because the app is bloated, but because grounding is what makes a 4B model accurate: matched catalog slice + rules + 20 voice examples. At 3,000 messages/month (a busy shop, ~100/day):

- GPT-4o-class pricing: ~9M input + 0.9M output ≈ **$30+/month** — the model alone costs ~10× the plan price.
- Cheap mini-class pricing: ~$1.90/month — sounds fine until you add hosting for the app, and the margin on ₹299 evaporates while you still don't control Hinglish quality.
- **gemma3:4b on a small server: ₹0 marginal.** The few-shot grounding that makes replies accurate is *free* when tokens cost nothing. Per-token pricing punishes exactly the technique that keeps a small model honest.

**Customer data never leaves the machine.** These are screenshots of people's order conversations — names, phone numbers, addresses. In Uttar, the catalog, the past replies, and every customer message go to localhost Ollama and nowhere else. There's no third-party API in the loop at all.

**Swappable and tunable — which I needed within one day.** The contest's "pick whichever handles Hinglish best in your tests" is not a slogan here:

| Model | Accuracy (10 fixed Hinglish/Assamese msgs) | Warm latency | Verdict |
|---|---|---|---|
| **gemma3:4b** | 9/10 | ~11–12s | Default — same accuracy, ~3× faster |
| qwen2.5:7b | 9/10 | ~30–35s | Better Assamese voice ("Dikhim kya chahiye?"), too slow for paste-and-reply |

Two weeks after launch I could swap the model behind a dropdown, fine-tune few-shots per region, or change refusal behavior — without asking anyone's API team. Try telling a closed API to change its refusal style for your users.

## Where the open approach bit me — and what I changed

I'm keeping the failures in, because they're the interesting part.

**The model kept inventing policies.** First prompt: ask *"border customize kar sakte hain?"* and gemma would cheerfully reply *"sorry, hum customize nahi karte"* — except the seller never said that. A "no" not in your facts is just as fabricated as a fake price. Fixes, in order:

1. Hard rule: *"answering 'we don't do customization' when no policy is listed is WRONG, because that 'no' is also an invented fact. Silence = NEEDS_HUMAN"* — with negative examples in the prompt.
2. **Deterministic guard** (`lib/guard.js`): regex layer for known-unknown intents (customize, repair, wholesale…) that runs before the model. Small open models are inconsistent at refusal; a rules layer is not. Honest architecture: model for language, code for guarantees.
3. Rule-category matching so pure policy questions (*"COD hai kya?"* — no product tokens at all) reach the rules instead of dying at the fuzzy-match gate.

**Measured results** (20-message test set, gemma3:4b, `scripts/realtest.js`):

- **19/20 correct behavior** — 15/15 in-catalog questions drafted, 4/5 refusals correct
- **9/9 price/fact checks passed** — every number in every draft came from the catalog
- **Known failure**: *"dam koto muga orutia?"* — "orutia" isn't in the catalog, and the model offers alternatives (muga scarf, dupatta) instead of a clean refusal. Arguably friendly, but it's the model guessing at product knowledge it doesn't have. It's also where Assamese product names in Roman script are weakest.
- **One draft needed an edit**: a returns answer appended *"₹50 COD fee return ke time lagta hai"* — stitched from two unrelated facts. Great demo of why a human approves every reply.

## Honest caveat: it does not run on the seller's phone

Most sellers live on phones, and running a 4B model on a phone isn't realistic yet. The setup is **your server running Ollama** (a $5–10 VPS or your laptop for one shop). That still gives: zero marginal cost, no vendor lock-in, tuning freedom, and data staying off *somebody else's* server. What it does not give: fully offline-on-device. Saying so plainly seemed more useful than a demo nobody's hardware can run.

There's also no WhatsApp/Instagram API integration, deliberately. Official APIs are heavy, and scraping gets shops banned. Copy-paste is the MVP: the seller keeps their fingers on the send button, so nothing about this trips automation rules.

## Run it

```bash
git clone REPO_LINK && cd utar
brew install ollama && brew services start ollama
ollama pull gemma3:4b
npm install && npm run dev   # http://localhost:3000
```

First run seeds a demo shop (Muga Ghar, Guwahati): 8 products, delivery/payment/return rules, 12 voice examples. The Setup tab is where a real seller enters their own list. It's a PWA — install it on a phone and it opens like an app.

Stack: Next.js (JavaScript), Tailwind, better-sqlite3, Ollama. Fuzzy catalog matching is token scoring, no vector DB — for a 200-product shop, embeddings are a dependency you don't need.

## First user

<!-- REQUIRED HONESTY: do not fabricate this. Find one real seller (Instagram seller in
     Guwahati / campus network), get 20 real customer messages with permission (names
     removed), run them through Uttar, and paste their ratings below.
     If you can't land one before the deadline, delete this section entirely rather
     than inventing it — the rest of the post is strong enough. -->

_Pending — to be filled with a real seller's ratings: "X of 20 send-as-is / edit / useless"._

---

Built for Hacktoberfest Open-Source AI Challenge Week 2 (Side Hustle). Agent session replay: _[paste DevRelay link here]_
