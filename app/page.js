"use client";

import { useState, useEffect } from "react";
import DraftTab from "@/components/DraftTab";
import SetupTab from "@/components/SetupTab";
import HistoryTab from "@/components/HistoryTab";
import { I18nProvider, useI18n } from "@/components/I18n";

function ModelStatus() {
  const { t } = useI18n();
  const [status, setStatus] = useState(null);
  useEffect(() => {
    fetch("/api/models")
      .then((r) => r.json())
      .then((d) => setStatus(d.models?.length ? "ready" : "offline"))
      .catch(() => setStatus("offline"));
  }, []);
  if (!status) return null;
  return (
    <span className="text-[11px] text-stone-400">
      {status === "ready" ? t.ollamaReady : t.ollamaOffline}
    </span>
  );
}

function LangToggle() {
  const { lang, setLang } = useI18n();
  return (
    <span className="text-[11px] text-stone-400 flex items-center gap-1">
      <button
        onClick={() => setLang("en")}
        className={lang === "en" ? "text-amber-600 dark:text-amber-400 font-medium" : "hover:text-stone-600 dark:hover:text-stone-300"}
      >
        en
      </button>
      <span className="text-stone-300 dark:text-stone-700">|</span>
      <button
        onClick={() => setLang("hi")}
        className={lang === "hi" ? "text-amber-600 dark:text-amber-400 font-medium" : "hover:text-stone-600 dark:hover:text-stone-300"}
      >
        हिं
      </button>
    </span>
  );
}

function Shell() {
  const { t } = useI18n();
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
                ["draft", t.draft],
                ["history", t.history],
                ["setup", t.setup],
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
          <div className="flex items-baseline gap-3 shrink-0">
            <LangToggle />
            <ModelStatus />
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-5 py-8">
        {tab === "draft" && <DraftTab />}
        {tab === "history" && <HistoryTab />}
        {tab === "setup" && <SetupTab />}
      </main>

      <footer className="max-w-xl mx-auto px-5 pb-10">
        <p className="text-[11px] text-stone-400 border-t border-stone-200 dark:border-stone-800 pt-4">
          {t.footer}
        </p>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <I18nProvider>
      <Shell />
    </I18nProvider>
  );
}
