import { describe, it, expect, vi, beforeEach } from "vitest";
import { middleware, config } from "@/middleware";
import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

vi.unmock("@/middleware");

// Compiles a Next.js path-to-regexp matcher into a RegExp we can test against.
function matchesMiddleware(pathname: string): boolean {
  return config.matcher.some((pattern) => {
    const regex = new RegExp(`^${pattern.replace(/\((\?[!=].*?)\)/g, "($1)")}$`);
    return regex.test(pathname);
  });
}

function makeRequest(
  pathname: string,
  method = "GET",
  headers: Record<string, string> = {}
): NextRequest {
  return new NextRequest(new URL(pathname, "http://localhost:3000"), {
    method,
    headers,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.NEXTAUTH_SECRET = "test-secret-for-middleware";
});

describe("Middleware — Matcher excludes public routes", () => {
  // The matcher excludes /api/auth/* and /api/health from middleware execution
  // entirely, so the Edge function is never invoked for the OAuth flow or the
  // health endpoint. This is what keeps Google login working — the middleware
  // bundle (which pulls in next-auth/jwt → jose → hkdf) is never loaded for
  // /api/auth/callback/google, /api/auth/csrf, /api/auth/error, etc.
  it("does not match /api/health", () => {
    expect(matchesMiddleware("/api/health")).toBe(false);
  });

  it("does not match /api/auth/callback/google", () => {
    expect(matchesMiddleware("/api/auth/callback/google")).toBe(false);
  });

  it("does not match /api/auth/error", () => {
    expect(matchesMiddleware("/api/auth/error")).toBe(false);
  });

  it("does not match /api/auth/csrf", () => {
    expect(matchesMiddleware("/api/auth/csrf")).toBe(false);
  });

  it("does not match /api/auth/signin/google", () => {
    expect(matchesMiddleware("/api/auth/signin/google")).toBe(false);
  });

  it("matches /api/events", () => {
    expect(matchesMiddleware("/api/events")).toBe(true);
  });

  it("matches /api/google/photos (an /api/auth-prefixed lookalike)", () => {
    // Make sure we didn't accidentally exclude paths like /api/authors/* or /api/healthcheck
    expect(matchesMiddleware("/api/authentication")).toBe(true);
    expect(matchesMiddleware("/api/healthy")).toBe(true);
  });
});

describe("Middleware — Auth Enforcement", () => {
  it("rejects GET /api/events without auth token", async () => {
    vi.mocked(getToken).mockResolvedValue(null);

    const req = makeRequest("/api/events", "GET", {
      origin: "http://localhost:3000",
    });
    const res = await middleware(req);

    expect(res.status).toBe(401);
  });

  it("allows GET /api/events with valid auth token", async () => {
    vi.mocked(getToken).mockResolvedValue({ sub: "user-1" } as never);

    const req = makeRequest("/api/events", "GET", {
      origin: "http://localhost:3000",
    });
    const res = await middleware(req);

    expect(res.status).not.toBe(401);
  });

  it("rejects POST /api/events without auth token", async () => {
    vi.mocked(getToken).mockResolvedValue(null);

    const req = makeRequest("/api/events", "POST", {
      origin: "http://localhost:3000",
    });
    const res = await middleware(req);

    // Could be 401 (no auth) — CSRF passes since origin is valid
    expect(res.status).toBe(401);
  });
});

describe("Middleware — CSRF Enforcement", () => {
  it("rejects POST without origin or referer", async () => {
    vi.mocked(getToken).mockResolvedValue({ sub: "user-1" } as never);

    const req = makeRequest("/api/events", "POST");
    const res = await middleware(req);

    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toContain("origin");
  });

  it("rejects POST with cross-origin header", async () => {
    vi.mocked(getToken).mockResolvedValue({ sub: "user-1" } as never);

    const req = makeRequest("/api/events", "POST", {
      origin: "http://evil.com",
    });
    const res = await middleware(req);

    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toContain("cross-origin");
  });

  it("allows GET without origin (CSRF only applies to mutating methods)", async () => {
    vi.mocked(getToken).mockResolvedValue({ sub: "user-1" } as never);

    const req = makeRequest("/api/events", "GET");
    const res = await middleware(req);

    // GET should not be blocked by CSRF
    expect(res.status).not.toBe(403);
  });

  it("rejects DELETE without origin", async () => {
    vi.mocked(getToken).mockResolvedValue({ sub: "user-1" } as never);

    const req = makeRequest("/api/events/123", "DELETE");
    const res = await middleware(req);

    expect(res.status).toBe(403);
  });

  it("rejects PUT with cross-origin referer", async () => {
    vi.mocked(getToken).mockResolvedValue({ sub: "user-1" } as never);

    const req = makeRequest("/api/events/123", "PUT", {
      referer: "http://evil.com/page",
    });
    const res = await middleware(req);

    expect(res.status).toBe(403);
  });

  it("allows OPTIONS without CSRF check (preflight)", async () => {
    const req = makeRequest("/api/events", "OPTIONS");
    const res = await middleware(req);

    // OPTIONS should be allowed (CORS preflight)
    expect(res.status).not.toBe(403);
    expect(res.status).not.toBe(401);
  });
});
