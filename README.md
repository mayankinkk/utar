# Uttar

Reply-drafting tool for small Instagram/WhatsApp sellers in Assam. Paste a customer message, get 2–3 grounded drafts in the seller's own language and voice — from an **open-weight model running locally via Ollama**. Nothing leaves the machine.

## How it works

1. **Setup shop** — add products (name, price, variants, stock, search tags), shop rules (delivery areas/fees, COD, returns, discounts), and 10–30 of your real past replies as voice examples.
2. **Draft reply** — paste the customer message. Uttar fuzzy-matches 1–3 relevant products (so a small model stays accurate), builds a prompt with your facts + your past replies as few-shot examples, and asks the local model for drafts.
3. **Trust feature** — if the answer isn't in your catalog ("can you customize the border?"), it refuses with **NEEDS_HUMAN** instead of inventing. Same if no product matches at all.
4. **Never auto-sends** — you copy, edit if needed, send from WhatsApp/Instagram yourself. No automation, no ban risk.

## Run it

```bash
brew install ollama && brew services start ollama
ollama pull gemma3:4b        # default model
ollama pull qwen2.5:7b       # optional, for comparison
npm install
npm run dev                  # http://localhost:3000
```

### Docker (app + Ollama in one command)

```bash
docker compose up -d
docker compose exec ollama ollama pull gemma3:4b
```

### Auth (optional)

Set `UTAR_PASSWORD=yourpassword` before starting — every page and API route
then requires a login at `/login` (30-day session cookie). Leave it unset for
local single-user use.

### Other env

- `OLLAMA_URL` — default `http://127.0.0.1:11434` (compose sets it to the ollama service)
- `UTAR_MODEL` — default `gemma3:4b` (also switchable in the UI if multiple models are installed)

### What's in the box

- **Draft** — paste message → grounded drafts (fuzzy catalog match + few-shot voice + NEEDS_HUMAN guardrails)
- **History** — last 50 messages with outcomes and drafts, stored locally in SQLite
- **Setup** — products, shop rules, past-reply voice examples, bulk paste
- **PWA** — installable, service-worker shell cache
- Input capped at 2,000 chars; messages stored in local SQLite only

### Model bake-off (results, M-series laptop)

```bash
node scripts/bakeoff.js http://localhost:3000 gemma3:4b qwen2.5:7b
```

10 fixed Hinglish/Assamese test messages; scores factuality and refusal correctness per model. Measured 2026-10-14:

| Model | Accuracy | Warm latency | Notes |
|---|---|---|---|
| **gemma3:4b** (default) | 9/10 | ~11–12s | Fast, clean Hinglish |
| qwen2.5:7b | 9/10 | ~30–35s | Better Assamese voice mixing ("Dikhim kya chahiye?"), too slow for paste-and-reply |

Both failed the same case: Assamese product name not in catalog ("muga orutia") gets alternative suggestions instead of a flat refusal. Honest limitation of small open-weight models — and why the deterministic guard (`lib/guard.js`) exists as a second layer for known-unknown intents (customize, repair, wholesale).

## Stack

Next.js (JavaScript, App Router) · Tailwind · better-sqlite3 · Ollama · fuzzy token search (no vector DB) · installable PWA.

## Why open-weight

- **Cost:** self-hosted model → marginal cost per message ≈ 0. A ₹299/month plan works; a per-token closed API would eat the margin.
- **Data:** seller's catalog + customer messages never leave their server.
- **Control:** swap models, tune prompts/few-shots for Hinglish/Assamese without asking anyone's permission.
- **Honest caveat:** the model runs on *your* server, not the seller's phone — that's the realistic setup for now.
