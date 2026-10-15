import { NextResponse } from "next/server";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const password = process.env.UTAR_PASSWORD;
  if (!password) {
    return NextResponse.json({ ok: true, auth: false });
  }
  if (typeof body.password !== "string" || body.password !== password) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(password + ":utar-session")
  );
  const session = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const res = NextResponse.json({ ok: true });
  res.cookies.set("utar_session", session, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
