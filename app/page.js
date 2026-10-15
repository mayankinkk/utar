"use client";

import { useState, useEffect } from "react";
import DraftTab from "@/components/DraftTab";
import SetupTab from "@/components/SetupTab";
import HistoryTab from "@/components/HistoryTab";

function ModelStatus() {
  const [status, setStatus] = useState(null);
  useEffect(() => {
    fetch("/api/models")
      .then((r) => r.json())
      .then((d) => setStatus(d.models?.length ? "ollama ready" : "ollama offline"))
      .catch(() => setStatus("ollama offline"));
  }, []);
  if (!status) return null;
  return <span className="text-[11px] text-stone-400">{status}</span>;
}

export default function Home() {
  const [tab, setTab] = useState("draft");

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-xl mx-auto px-5 py-5 flex items-baseline justify-between gap-4">
          <div className="flex items-baseline gap-4">
            <h1 className="text-sm font-semibold tracking-tight">
              <span className="text-amber-600 dark:text-amber-500"> Uttar</span>
            </h1>
            <nav className="flex gap-3 text-sm">
              {[
                ["draft", "draft"],
                ["history", "history"],
                ["setup", "setup"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`${
                    tab === id
                      ? "text-amber-700 dark:text-amber-400 underline underline-offset-4 decoration-amber-300 dark:decoration-amber-700"
                      : "text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </nav>
          </div>
          <ModelStatus />
        </div>
      </header>

      <main className="max-w-xl mx-auto px-5 py-8">
        {tab === "draft" && <DraftTab />}
        {tab === "history" && <HistoryTab />}
        {tab === "setup" && <SetupTab />}
      </main>

      <footer className="max-w-xl mx-auto px-5 pb-10">
        <p className="text-[11px] text-stone-400 border-t border-stone-200 dark:border-stone-800 pt-4">
          local open-weight model · catalog stays on this machine ·{" "}
          <span className="text-amber-600/70 dark:text-amber-500/70">you send every reply</span>
        </p>
      </footer>
    </div>
  );
}
