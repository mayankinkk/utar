const STOPWORDS = new Set([
  "hai", "ka", "ke", "ki", "ko", "me", "mein", "kya", "kitna", "kitne", "kitni",
  "bhaiya", "bhai", "didi", "please", "pls", "plz", "the", "a", "an", "is",
  "are", "and", "or", "for", "of", "to", "hoga", "hogi", "ho", "hai?", "kya?",
  "wala", "wali", "vala", "vali", "se", "tak", "pe", "par", "karo", "batao",
  "bataiye", "dikhao", "chahiye", "liye", "hua", "hui", "ho?", "na", "ni",
  "nhi", "nahi", "nahin", "kaise", "kaisa", "kaisi", "kab", "kidhar", "kahan",
]);

function tokenize(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\u0900-\u097F]+/g, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 2 && !STOPWORDS.has(t));
}

function levenshtein(a, b) {
  if (Math.abs(a.length - b.length) > 2) return 3;
  const m = a.length;
  const n = b.length;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(
        prev[j] + 1,
        cur[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
    prev = cur;
  }
  return prev[n];
}

function scoreTokenAgainstProduct(token, product) {
  const fields = [
    [product.name.toLowerCase(), 3],
    [(product.tags || "").toLowerCase(), 2],
    [(product.variants || "").toLowerCase(), 1],
  ];
  let best = 0;
  for (const [haystack, weight] of fields) {
    const words = haystack.split(/[^a-z0-9\u0900-\u097F]+/).filter(Boolean);
    for (const word of words) {
      if (word === token) best = Math.max(best, weight * 2);
      else if (word.startsWith(token) || token.startsWith(word)) best = Math.max(best, weight * 1.5);
      else if (levenshtein(token, word) <= 1) best = Math.max(best, weight);
      else if (levenshtein(token, word) <= 2 && token.length >= 5) best = Math.max(best, weight * 0.5);
    }
  }
  return best;
}

export function searchProducts(message, products, topN = 3) {
  const tokens = tokenize(message);
  if (tokens.length === 0 || products.length === 0) return [];
  const scored = products.map((product) => {
    let score = 0;
    for (const token of tokens) {
      score += scoreTokenAgainstProduct(token, product);
    }
    return { product, score };
  });
  const maxScore = Math.max(...scored.map((s) => s.score), 0);
  if (maxScore < 3) return [];
  return scored
    .filter((s) => s.score >= maxScore * 0.5 && s.score >= 3)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
    .map((s) => ({ ...s.product, matchScore: s.score }));
}

const RULE_KEYWORDS = {
  delivery: ["delivery", "deliver", "courier", "ship", "shipping", "din", "pahunch", "parcel", "charges", "free"],
  payment: ["cod", "cash", "prepaid", "gpay", "phonepe", "paytm", "payment", "upi", "card"],
  returns: ["return", "exchange", "refund", "replace", "wapas"],
  discount: ["discount", "coupon", "sasta", "kam"],
  shipping_international: ["international", "overseas", "abroad", "usa", "dubai", "foreign", "america", "bhej", "bhejenge", "bhejoge", "videsh"],
};

export function matchRuleCategories(message) {
  const tokens = tokenize(message);
  const matched = [];
  for (const [category, keywords] of Object.entries(RULE_KEYWORDS)) {
    if (tokens.some((t) => keywords.includes(t))) matched.push(category);
  }
  return matched;
}
