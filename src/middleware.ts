import { NextResponse, type NextRequest } from "next/server";
import { sessionSecret } from "@/lib/env";
import {
  SESSION_COOKIE,
  VISITOR_COOKIE,
  verifySession,
} from "@/lib/session-token";

const VISITOR_MAX_AGE = 60 * 60 * 24 * 30;
const PROTECTED = ["/dashboard", "/admin", "/lawyer"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const visitor = request.cookies.get(VISITOR_COOKIE)?.value;

  let response: NextResponse;

  if (PROTECTED.some((prefix) => pathname.startsWith(prefix))) {
    let userId: string | null = null;
    try {
      const payload = await verifySession(
        request.cookies.get(SESSION_COOKIE)?.value,
        sessionSecret(),
      );
      userId = payload?.userId ?? null;
    } catch {
      userId = null;
    }

    if (!userId) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.search = `?next=${encodeURIComponent(pathname)}`;
      response = NextResponse.redirect(url);
    } else {
      response = NextResponse.next();
    }
  } else {
    response = NextResponse.next();
  }

  if (!visitor) {
    response.cookies.set(VISITOR_COOKIE, crypto.randomUUID(), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: VISITOR_MAX_AGE,
    });
  }

  response.headers.set("X-Robots-Tag", pathname.startsWith("/thank-you") ? "noindex" : "all");
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|webp|ico|txt|xml)$).*)",
  ],
};
