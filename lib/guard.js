const UNKNOWN_INTENT_PATTERNS = [
  /\bcustomi[sz]e/i,
  /\bcustomi[sz](a|e|ed|ing)\b/i,
  /\bchangent?e?\b/i,
  /\balter(ation|s|ed|ing)?\b/i,
  /\brepair\b/i,
  /\bthik\s*kar/i,
  /\bfix\s*(kar|do|sakte)/i,
  /\bmodify\b/i,
  /\bredesign\b/i,
  /\bwholesale\b/i,
  /\bbulk\s*(rate|price|order|mein|me)\b/i,
  /\bengrave\b/i,
  /\bpersonaliz/i,
  /\bembroider/i,
  /\bunboxing\b/i,
];

export function detectUnknownIntent(message) {
  for (const re of UNKNOWN_INTENT_PATTERNS) {
    if (re.test(message)) return re.source;
  }
  return null;
}
