"use client";

import { useState, useEffect, useCallback } from "react";
import { useI18n } from "@/components/I18n";

export default function SetupTab() {
  const { t } = useI18n();
  const [data, setData] = useState(null);
  const [shop, setShop] = useState({ name: "", tone_notes: "" });
  const [product, setProduct] = useState({ name: "", price: "", variants: "", stock: "", tags: "" });
  const [rule, setRule] = useState({ category: "delivery", content: "" });
  const [reply, setReply] = useState({ customerMsg: "", sellerReply: "" });
  const [bulkText, setBulkText] = useState("");
  const [bulkMode, setBulkMode] = useState("products");

  const load = useCallback(() => {
    fetch("/api/catalog")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setShop({ name: d.shop.name, tone_notes: d.shop.tone_notes });
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function post(body) {
    const res = await fetch("/api/catalog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const d = await res.json();
    if (!res.ok) throw new Error(d.error || "Failed");
    return d;
  }

  const input =
    "w-full text-sm bg-transparent border border-stone-300 dark:border-stone-700 rounded-md px-3 py-2 placeholder:text-stone-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40";
  const btn =
    "text-xs font-medium bg-amber-600 dark:bg-amber-500 text-white rounded-md px-3.5 py-1.5 hover:bg-amber-700 dark:hover:bg-amber-600";
  const h2 = "text-sm font-semibold tracking-tight";
  const count = "text-[11px] text-amber-600/70 dark:text-amber-500/70 font-medium ml-1.5 tabular-nums";

  if (!data) return <p className="text-sm text-stone-400">{t.loading}</p>;

  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <h2 className={h2}>
          {t.shop}<span className={count}>1</span>
        </h2>
        <div className="space-y-2">
          <input
            className={input}
            placeholder={t.shopName}
            value={shop.name}
            onChange={(e) => setShop({ ...shop, name: e.target.value })}
          />
          <textarea
            className={input}
            rows={2}
            placeholder={t.tone}
            value={shop.tone_notes}
            onChange={(e) => setShop({ ...shop, tone_notes: e.target.value })}
          />
          <button
            className={btn}
            onClick={async () => {
              await fetch("/api/shop", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(shop),
              });
              load();
            }}
          >
            {t.save}
          </button>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className={h2}>
          {t.products}<span className={count}>{data.products.length}</span>
        </h2>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await post({ action: "addProduct", ...product });
            setProduct({ name: "", price: "", variants: "", stock: "", tags: "" });
            load();
          }}
          className="space-y-2"
        >
          <div className="grid grid-cols-2 gap-2">
            <input className={input} placeholder={t.name} required value={product.name} onChange={(e) => setProduct({ ...product, name: e.target.value })} />
            <input className={input} placeholder={t.price} type="number" value={product.price} onChange={(e) => setProduct({ ...product, price: e.target.value })} />
            <input className={input} placeholder={t.variants} value={product.variants} onChange={(e) => setProduct({ ...product, variants: e.target.value })} />
            <input className={input} placeholder={t.stock} value={product.stock} onChange={(e) => setProduct({ ...product, stock: e.target.value })} />
          </div>
          <input className={input} placeholder={t.tags} value={product.tags} onChange={(e) => setProduct({ ...product, tags: e.target.value })} />
          <button className={btn} type="submit">{t.addProduct}</button>
        </form>
        <div className="text-sm divide-y divide-stone-100 dark:divide-stone-900 border-t border-stone-200 dark:border-stone-800">
          {data.products.map((p) => (
            <div key={p.id} className="py-2 flex justify-between gap-3 items-baseline">
              <p className="min-w-0 truncate">
                {p.name}
                {p.price != null && <span className="text-amber-700 dark:text-amber-400 font-medium"> ₹{p.price}</span>}
                {(p.variants || p.stock) && (
                  <span className="text-stone-400 text-xs"> — {[p.variants, p.stock].filter(Boolean).join(", ")}</span>
                )}
              </p>
              <button onClick={() => post({ action: "delete", table: "product", id: p.id }).then(load)} className="text-[11px] text-stone-400 hover:text-red-600 shrink-0">
                {t.del}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className={h2}>
          {t.rules}<span className={count}>{data.rules.length}</span>
        </h2>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await post({ action: "addRule", ...rule });
            setRule({ category: "delivery", content: "" });
            load();
          }}
          className="space-y-2"
        >
          <select className={input} value={rule.category} onChange={(e) => setRule({ ...rule, category: e.target.value })}>
            <option value="delivery">delivery</option>
            <option value="payment">payment</option>
            <option value="returns">returns</option>
            <option value="discount">discount</option>
            <option value="shipping_international">international</option>
            <option value="other">other</option>
          </select>
          <textarea className={input} rows={2} placeholder={t.rulePlaceholder} required value={rule.content} onChange={(e) => setRule({ ...rule, content: e.target.value })} />
          <button className={btn} type="submit">{t.addRule}</button>
        </form>
        <div className="text-sm divide-y divide-stone-100 dark:divide-stone-900 border-t border-stone-200 dark:border-stone-800">
          {data.rules.map((r) => (
            <div key={r.id} className="py-2 flex justify-between gap-3 items-baseline">
              <p className="min-w-0">
                <span className="text-[10px] text-amber-600/70 dark:text-amber-500/70 uppercase tracking-wide">{r.category}</span>{" "}
                <span className="text-stone-700 dark:text-stone-300">{r.content}</span>
              </p>
              <button onClick={() => post({ action: "delete", table: "rule", id: r.id }).then(load)} className="text-[11px] text-stone-400 hover:text-red-600 shrink-0">
                {t.del}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className={h2}>
          {t.pastReplies}<span className={count}>{data.pastReplies.length}</span>
        </h2>
        <p className="text-[11px] text-stone-400">
          {t.voiceHint}
        </p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await post({ action: "addReply", ...reply });
            setReply({ customerMsg: "", sellerReply: "" });
            load();
          }}
          className="space-y-2"
        >
          <textarea className={input} rows={2} placeholder={t.customerMsg} required value={reply.customerMsg} onChange={(e) => setReply({ ...reply, customerMsg: e.target.value })} />
          <textarea className={input} rows={2} placeholder={t.yourReply} required value={reply.sellerReply} onChange={(e) => setReply({ ...reply, sellerReply: e.target.value })} />
          <button className={btn} type="submit">{t.addExample}</button>
        </form>
        <div className="text-sm divide-y divide-stone-100 dark:divide-stone-900 border-t border-stone-200 dark:border-stone-800">
          {data.pastReplies.map((r) => (
            <div key={r.id} className="py-2 flex justify-between gap-3 items-baseline">
              <p className="min-w-0 truncate text-stone-600 dark:text-stone-400">
                <span className="text-stone-400">{t.cLabel}</span> {r.customer_msg}{" "}
                <span className="text-stone-400">{t.sLabel}</span> {r.seller_reply}
              </p>
              <button onClick={() => post({ action: "delete", table: "reply", id: r.id }).then(load)} className="text-[11px] text-stone-400 hover:text-red-600 shrink-0">
                {t.del}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className={h2}>{t.bulkPaste}</h2>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const d = await post({
              action: bulkMode === "products" ? "bulkProducts" : "bulkReplies",
              text: bulkText,
            });
            if (d.inserted) setBulkText("");
            load();
          }}
          className="space-y-2"
        >
          <select className={input} value={bulkMode} onChange={(e) => setBulkMode(e.target.value)}>
            <option value="products">{t.bulkProducts}</option>
            <option value="replies">{t.bulkReplies}</option>
          </select>
          <textarea
            className={`${input} font-mono text-xs`}
            rows={6}
            placeholder={bulkMode === "products" ? "Muga Dupatta, 2400, Single size, 12, muga golden" : "price kya hai?\n₹2,400 ka hai 😊"}
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
          />
          <button className={btn} type="submit">{t.insert}</button>
        </form>
      </section>
    </div>
  );
}
