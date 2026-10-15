import { NextResponse } from "next/server";
import { listModels, DEFAULT_MODEL } from "@/lib/ollama";

export async function GET() {
  const models = await listModels();
  return NextResponse.json({ models, default: DEFAULT_MODEL });
}
