"use client";

import { useState, useEffect, useCallback } from "react";

const SAMPLES = [
  "bhaiya ye muga wala dupatta kitne ka hai? delivery Jorhat tak hoga?",
  "dam koto japi'r?",
  "COD hai kya?",
  "border customize kar sakte hain dupatta me?",
];

export default function DraftTab() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [drafts, setDrafts] = useState([]);
  const [editingIdx, setEditingIdx] = useState(null);
  const [latency, setLatency] = useState(null);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [model, setModel] = useState("");
  const [models, setModels] = useState([]);

  useEffect(() => {
    fetch("/api/models")
      .then((r) => r.json())
      .then((d) => {
        setModels(d.models || []);
        setModel(d.default);
      })
      .catch(() => {});
  }, []);

  const draft = useCallback(async () => {
    if (!message.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setDrafts([]);
    setEditingIdx(null);
    const t0 = Date.now();
    try {
      const res = await fetch("/api/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, model: model || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setLatency(((Date.now() - t0) / 1000).toFixed(1));
      setResult(data);
      setDrafts(data.drafts || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [message, loading, model]);

  async function copyDraft(text, idx) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1500);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
              e.preventDefault();
              draft();
            }
          }}
          rows={3}
          maxLength={2000}
          placeholder="paste a customer message…"
          className="w-full text-sm leading-relaxed bg-transparent border border-stone-300 dark:border-stone-700 rounded-md px-3 py-2.5 placeholder:text-stone-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40 resize-y"
        />
        <div className="flex items-center justify-between">
          <button
            onClick={draft}
            disabled={loading || !message.trim()}
            className="text-xs font-medium bg-amber-600 dark:bg-amber-500 text-white rounded-md px-4 py-1.5 hover:bg-amber-700 dark:hover:bg-amber-600 disabled:opacity-30 disabled:hover:bg-amber-600"
          >
            {loading ? "drafting…" : "draft"}
          </button>
          {models.length > 1 && (
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="text-[11px] text-stone-500 bg-transparent border border-stone-200 dark:border-stone-800 rounded px-1.5 py-1"
            >
              {models.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          )}
        </div>
        <p className="text-[11px] text-stone-400">
          try:{" "}
          {SAMPLES.map((s, i) => (
            <span key={i}>
              {i > 0 && " · "}
              <button
                onClick={() => setMessage(s)}
                className="underline underline-offset-2 decoration-amber-300 dark:decoration-amber-800 text-amber-700/80 dark:text-amber-400/80 hover:text-amber-800 dark:hover:text-amber-300"
              >
                {s.length > 28 ? s.slice(0, 28) + "…" : s}
              </button>
            </span>
          ))}
        </p>
      </div>

      {error && <p className="text-sm text-red-700 dark:text-red-400">{error}</p>}

      {result?.needsHuman && !loading && (
        <div className="border-l-2 border-amber-500 pl-4 py-1 space-y-1">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Answer this yourself</p>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            {result.reason === "no_product_match"
              ? "Nothing in your catalog matches this message."
              : result.reason === "unknown_intent"
                ? "Outside your catalog facts — customization, repairs, wholesale."
                : "The model refused — it can't ground this in your catalog."}
          </p>
        </div>
      )}

      {result && !result.needsHuman && !loading && (
        <div className="space-y-0">
          <p className="text-[11px] pb-3">
            {result.matchedProducts?.length > 0 && (
              <span className="text-amber-700 dark:text-amber-400 font-medium">
                {result.matchedProducts.map((p) => `${p.name} ₹${p.price}`).join(" · ")}
              </span>
            )}
            {latency && <span className="text-stone-400"> — {result.model}, {latency}s</span>}
          </p>
          {drafts.map((text, i) => (
            <div
              key={i}
              className="border-t border-stone-200 dark:border-stone-800 py-4"
            >
              {editingIdx === i ? (
                <textarea
                  value={text}
                  onChange={(e) =>
                    setDrafts((d) => d.map((x, j) => (j === i ? e.target.value : x)))
                  }
                  rows={4}
                  autoFocus
                  className="w-full text-sm leading-relaxed bg-transparent border border-stone-300 dark:border-stone-700 rounded-md px-3 py-2 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40"
                />
              ) : (
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {text}
                </p>
              )}
              <div className="mt-2.5 flex gap-3 text-[11px]">
                <button
                  onClick={() => copyDraft(text, i)}
                  className={`font-medium ${
                    copiedIdx === i
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-stone-500 hover:text-amber-700 dark:hover:text-amber-400"
                  }`}
                >
                  {copiedIdx === i ? "copied" : "copy"}
                </button>
                <button
                  onClick={() => setEditingIdx(editingIdx === i ? null : i)}
                  className="text-stone-500 hover:text-amber-700 dark:hover:text-amber-400"
                >
                  {editingIdx === i ? "done" : "edit"}
                </button>
              </div>
            </div>
          ))}
          <p className="text-[11px] text-stone-400 pt-3 border-t border-stone-200 dark:border-stone-800">
            you send it yourself.
          </p>
        </div>
      )}
    </div>
  );
}
