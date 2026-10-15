"use client";

import { createContext, useContext, useState, useEffect } from "react";

const STRINGS = {
  en: {
    draft: "draft",
    history: "history",
    setup: "setup",
    ollamaReady: "ollama ready",
    ollamaOffline: "ollama offline",
    footer: "local open-weight model · catalog stays on this machine · you send every reply",
    placeholder: "paste a customer message…",
    draftBtn: "draft",
    drafting: "drafting…",
    tryLabel: "try:",
    answerYourself: "Answer this yourself",
    noMatch: "Nothing in your catalog matches this message.",
    outsideFacts: "Outside your catalog facts — customization, repairs, wholesale.",
    modelRefused: "The model refused — it can't ground this in your catalog.",
    copy: "copy",
    copied: "copied",
    edit: "edit",
    done: "done",
    youSend: "you send it yourself.",
    historyEmpty: "no messages yet — drafts you generate will appear here.",
    lastN: (n) => `last ${n} messages`,
    clearAll: "clear all",
    drafted: "drafted",
    flagged: "flagged",
    noCatalogMatch: "no catalog match — answered by hand",
    flaggedReason: "flagged as outside catalog facts",
    loading: "loading…",
    shop: "shop",
    products: "products",
    rules: "rules",
    pastReplies: "past replies",
    bulkPaste: "bulk paste",
    shopName: "shop name",
    tone: "tone — e.g. friendly Hinglish, namaste greeting, light emojis",
    save: "save",
    name: "name",
    price: "price ₹",
    variants: "variants",
    stock: "stock",
    tags: "tags for search — muga, dupatta, gift",
    addProduct: "add product",
    addRule: "add rule",
    rulePlaceholder: "e.g. Guwahati same-day ₹40; rest of Assam 3–4 days ₹80",
    voiceHint: "drafts learn your voice from these. add 10–20 real ones.",
    customerMsg: "customer message",
    yourReply: "your actual reply",
    addExample: "add example",
    cLabel: "c:",
    sLabel: "s:",
    bulkProducts: "products — name, price, variants, stock, tags (one per line)",
    bulkReplies: "past replies — blank-line separated blocks",
    insert: "insert",
    del: "del",
  },
  hi: {
    draft: "ड्राफ्ट",
    history: "इतिहास",
    setup: "सेटअप",
    ollamaReady: "ओलामा तैयार",
    ollamaOffline: "ओलामा ऑफलाइन",
    footer: "लोकल ओपन-वेट मॉडल · कैटलॉग इसी मशीन पर · हर जवाब आप खुद भेजें",
    placeholder: "ग्राहक का मैसेज यहाँपेस्ट करें…",
    draftBtn: "ड्राफ्ट बनाएं",
    drafting: "बन रहा है…",
    tryLabel: "आज़माएं:",
    answerYourself: "इसका जवाब खुद दें",
    noMatch: "आपके कैटलॉग में इससे मिलता-जुलता कुछ नहीं है।",
    outsideFacts: "यह आपके कैटलॉग के बाहर की बात है — कस्टमाइज़ेशन, रिपेयर, होलसेल।",
    modelRefused: "मॉडल ने मना कर दिया — कैटलॉग के हिसाब से जवाब नहीं बन सकता।",
    copy: "कॉपी",
    copied: "कॉपी हो गया",
    edit: "एडिट",
    done: "हो गया",
    youSend: "आप खुद भेजें।",
    historyEmpty: "अभी कोई मैसेज नहीं — बनाए गए ड्राफ्ट यहाँ दिखेंगे।",
    lastN: (n) => `पिछले ${n} मैसेज`,
    clearAll: "सब मिटाएं",
    drafted: "ड्राफ्ट बना",
    flagged: "फ्लैग",
    noCatalogMatch: "कैटलॉग से मैच नहीं — खुद जवाब दिया",
    flaggedReason: "कैटलॉग के बाहर की बात के रूप में फ्लैग",
    loading: "लोड हो रहा है…",
    shop: "दुकान",
    products: "उत्पाद",
    rules: "नियम",
    pastReplies: "आपके पुराने जवाब",
    bulkPaste: "बल्क पेस्ट",
    shopName: "दुकान का नाम",
    tone: "लहजा — जैसे हिंग्लिश में दोस्ताना, नमस्ते से शुरू, हल्के इमोजी",
    save: "सेव",
    name: "नाम",
    price: "कीमत ₹",
    variants: "वैरिएंट",
    stock: "स्टॉक",
    tags: "सर्च के लिए टैग — मुगा, दुपट्टा, गिफ्ट",
    addProduct: "उत्पाद जोड़ें",
    addRule: "नियम जोड़ें",
    rulePlaceholder: "जैसे गुवाहाटी सेम-डे ₹40; बाकी असम 3–4 दिन ₹80",
    voiceHint: "ड्राफ्ट इन्हीं से आपका लहजा सीखते हैं। 10–20 असली जवाब जोड़ें।",
    customerMsg: "ग्राहक का मैसेज",
    yourReply: "आपका असली जवाब",
    addExample: "उदाहरण जोड़ें",
    cLabel: "ग्राहक:",
    sLabel: "आप:",
    bulkProducts: "उत्पाद — नाम, कीमत, वैरिएंट, स्टॉक, टैग (एक लाइन में एक)",
    bulkReplies: "पुराने जवाब — खाली लाइन से अलग ब्लॉक",
    insert: "डालें",
    del: "हटाएं",
  },
};

const I18nContext = createContext({ lang: "en", t: STRINGS.en, setLang: () => {} });

export function I18nProvider({ children }) {
  const [lang, setLang] = useState("en");
  useEffect(() => {
    const saved = localStorage.getItem("utar-lang");
    if (saved === "hi" || saved === "en") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLang(saved);
    }
  }, []);
  const change = (l) => {
    setLang(l);
    localStorage.setItem("utar-lang", l);
  };
  return (
    <I18nContext.Provider value={{ lang, t: STRINGS[lang], setLang: change }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
