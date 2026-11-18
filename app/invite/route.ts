import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const token = process.env.DMV_ATTACK_GENERAL_INVITE_TOKEN?.trim();
  if (!token || !/^[A-Za-z0-9_-]{40,60}$/.test(token)) {
    return new NextResponse("Player invitation is temporarily unavailable. Please contact DMV Attack staff.", {
      status: 503,
      headers: { "Cache-Control": "no-store", "Content-Type": "text/plain; charset=utf-8" },
    });
  }
  const target = new URL("/invite/" + encodeURIComponent(token), request.url);
  const response = NextResponse.redirect(target, 307);
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}
