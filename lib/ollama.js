const OLLAMA_URL = process.env.OLLAMA_URL || "http://127.0.0.1:11434";
export const DEFAULT_MODEL = process.env.UTAR_MODEL || "gemma3:4b";

export async function generate(prompt, model = DEFAULT_MODEL, options = {}) {
  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
      options: {
        temperature: options.temperature ?? 0.2,
        num_predict: options.numPredict ?? 600,
      },
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Ollama error ${res.status}: ${body}`);
  }
  const data = await res.json();
  return data.response || "";
}

export async function listModels() {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/tags`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.models || []).map((m) => m.name);
  } catch {
    return [];
  }
}
