"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-5">
      <form onSubmit={submit} className="w-full max-w-xs space-y-4">
        <h1 className="text-sm font-semibold tracking-tight">
          <span className="text-amber-600 dark:text-amber-500">Uttar</span>
        </h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="password"
          autoFocus
          className="w-full text-sm bg-transparent border border-stone-300 dark:border-stone-700 rounded-md px-3 py-2 placeholder:text-stone-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40"
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading || !password}
          className="text-xs font-medium bg-amber-600 dark:bg-amber-500 text-white rounded-md px-4 py-1.5 hover:bg-amber-700 dark:hover:bg-amber-600 disabled:opacity-30"
        >
          {loading ? "checking…" : "enter"}
        </button>
      </form>
    </div>
  );
}
