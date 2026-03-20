import { NextRequest, NextResponse } from "next/server";

/**
 * Validates the Origin header on mutating requests as CSRF defense-in-depth.
 * Returns a 403 response if the origin is invalid, or null if the request is allowed.
 */
export function validateCsrf(req: NextRequest): NextResponse | null {
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");

  // Allow requests with no origin (e.g., same-origin navigations, server-side)
  if (!origin && !referer) return null;

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
