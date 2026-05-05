import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

function validateCsrfInMiddleware(req: NextRequest): NextResponse | null {
  const method = req.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") return null;

  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");

  if (!origin && !referer) {
    return NextResponse.json(
      { error: "Forbidden: missing origin header" },
      { status: 403 }
    );
  }

  const allowedHost = req.nextUrl.host;

  const headerToCheck = origin || referer;
  if (headerToCheck) {
    try {
      const parsedHost = new URL(headerToCheck).host;
      if (parsedHost !== allowedHost) {
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
  }

  return null;
}

export async function middleware(req: NextRequest) {
  const csrfError = validateCsrfInMiddleware(req);
  if (csrfError) return csrfError;

  const method = req.method.toUpperCase();
  if (method !== "OPTIONS") {
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }
    const token = await getToken({ req, secret });
    if (!token?.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

// Exclude /api/auth/* (NextAuth handles its own flow, including CSRF) and
// /api/health (must be reachable without auth) from middleware execution.
// Doing this in the matcher — not at runtime — guarantees the Edge function
// is never invoked for these paths, so NextAuth's OAuth callback can complete
// even if the middleware bundle has issues in the Edge runtime.
export const config = {
  matcher: ["/api/((?!auth/|auth$|health/|health$).*)"],
};
