"use client";

import { useState, useEffect } from "react";

export default function HistoryTab() {
  const [messages, setMessages] = useState(null);
  const [openId, setOpenId] = useState(null);
  const [copiedIdx, setCopiedIdx] = useState(null);

  const load = () =>
    fetch("/api/history")
      .then((r) => r.json())
      .then((d) => setMessages(d.messages || []));

  useEffect(() => {
    load();
  }, []);

  async function copy(text, key) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(key);
      setTimeout(() => setCopiedIdx(null), 1500);
    } catch {
      /* ignore */
    }
  }

  if (!messages) return <p className="text-sm text-stone-400">loading…</p>;

  if (messages.length === 0) {
    return (
      <p className="text-sm text-stone-400">
        no messages yet — drafts you generate will appear here.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <p className="text-[11px] text-stone-400">last {messages.length} messages</p>
        <button
          onClick={async () => {
            await fetch("/api/history", { method: "DELETE" });
            load();
          }}
          className="text-[11px] text-stone-400 hover:text-red-600"
        >
          clear all
        </button>
      </div>

      <div className="divide-y divide-stone-200 dark:divide-stone-800 border-y border-stone-200 dark:border-stone-800">
        {messages.map((m) => (
          <div key={m.id} className="py-3">
            <button
              onClick={() => setOpenId(openId === m.id ? null : m.id)}
              className="w-full text-left flex items-baseline justify-between gap-3"
            >
              <p className="text-sm min-w-0 truncate">{m.message}</p>
              <span className="text-[11px] shrink-0 text-stone-400">
                {m.needsHuman ? (
                  <span className="text-amber-600 dark:text-amber-400">flagged</span>
                ) : (
                  "drafted"
                )}
                {" · "}
                {m.createdAt.slice(5, 16)}
              </span>
            </button>

            {openId === m.id && (
              <div className="mt-2 space-y-2">
                {m.needsHuman ? (
                  <p className="text-xs text-stone-500">
                    {m.reason === "no_product_match"
                      ? "no catalog match — answered by hand"
                      : "flagged as outside catalog facts"}
                  </p>
                ) : (
                  <>
                    {m.matched.length > 0 && (
                      <p className="text-[11px] text-amber-700 dark:text-amber-400">
                        {m.matched.map((p) => `${p.name} ₹${p.price}`).join(" · ")}
                      </p>
                    )}
                    {m.drafts.map((text, i) => (
                      <div key={i} className="border-l border-stone-200 dark:border-stone-700 pl-3">
                        <p className="text-sm leading-relaxed">{text}</p>
                        <button
                          onClick={() => copy(text, `${m.id}-${i}`)}
                          className="mt-1 text-[11px] text-stone-500 hover:text-amber-700 dark:hover:text-amber-400"
                        >
                          {copiedIdx === `${m.id}-${i}` ? "copied" : "copy"}
                        </button>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
