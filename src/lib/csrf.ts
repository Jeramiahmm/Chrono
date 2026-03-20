import { NextRequest, NextResponse } from "next/server";

/**
 * Validates the Origin header on mutating requests as CSRF defense-in-depth.
 * Returns a 403 response if the origin is invalid, or null if the request is allowed.
 */
export function validateCsrf(req: NextRequest): NextResponse | null {
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");

  // Reject mutating requests that have neither origin nor referer.
  // Some HTTP clients/proxies strip both headers — we cannot verify the source.
  if (!origin && !referer) {
    return NextResponse.json(
      { error: "Forbidden: missing origin header" },
      { status: 403 }
    );
  }

  const allowedHost = req.nextUrl.host;

  if (origin) {
    try {
      const originHost = new URL(origin).host;
      if (originHost !== allowedHost) {
        return NextResponse.json(
          { error: "Forbidden: cross-origin request" },
          { status: 403 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: "Forbidden: invalid origin" },
        { status: 403 }
      );
    }
  } else if (referer) {
    try {
      const refererHost = new URL(referer).host;
      if (refererHost !== allowedHost) {
        return NextResponse.json(
          { error: "Forbidden: cross-origin request" },
          { status: 403 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: "Forbidden: invalid referer" },
        { status: 403 }
      );
    }
  }

  return null;
}
