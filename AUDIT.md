# Crohna — Full Codebase & Product Audit

**Date:** 2026-03-19
**Auditor:** Senior Engineering & Product Review
**Scope:** Full codebase, architecture, UX, security, product readiness

---

## A. Executive Summary

**Overall quality level:** Strong startup MVP — well above hobbyist, not yet launch-ready.

**Biggest strengths:**
- Clean, consistent visual design language with a cohesive dark/light theme system
- Thoughtful architecture: proper auth token refresh, cursor-based pagination, rate limiting, soft deletes, transaction-based imports
- Excellent demo mode — unauthenticated users see real product value with sample data
- Solid test coverage across API routes, components, hooks, and e2e
- Good security posture: CSP headers, input validation, URL protocol checks, HTML escaping in map popups
- AI story generation with graceful fallback is well-implemented

**Biggest risks:**
1. No CSRF protection on mutating API routes
2. Google Photos proxy is an open redirect
3. Map is hardcoded to dark tile layer regardless of theme
4. No way to create stories from the UI (no "Generate Story" button)
5. Privacy settings are client-side theater — server never enforces shareability
6. No account deletion (GDPR risk)
7. Upload endpoint has no user-scoped storage paths

**Verdict:** Solid MVP with real product potential. With 2-3 weeks of focused work on critical and high-priority items, this could be launch-ready.

---

## B. Full-System Findings

### Architecture
- Next.js 14 App Router with proper API routes, server sessions, JWT strategy
- Prisma + Neon for database with proper connection pooling
- Supabase for file storage
- Upstash Redis for distributed rate limiting with in-memory fallback
- SWR for client-side data fetching with proper deduplication
- NextAuth with Google OAuth, automatic token refresh, and PrismaAdapter

### Auth Flow
- Google OAuth with offline access + prompt consent — correct
- Token refresh logic is solid with proper error propagation
- Session error is exposed but never consumed by the client
- Middleware is intentionally empty (pages handle own auth states)

### Data Layer
- Soft deletes via deletedAt — good pattern
- Proper indexes on Event model for common query patterns
- Calendar/Photos import uses transactions with deduplication
- Google Photos uses gphotos:// placeholder scheme with on-demand proxy

### Frontend
- Consistent design system via CSS custom properties + Tailwind
- Framer Motion used tastefully
- Accessibility: focus traps, aria labels, role="switch", reduced motion hook
- Responsive: mobile hamburger nav, responsive grids, touch-friendly sizing

---

## C. Priority-Ranked Issues

### CRITICAL

#### 1. No CSRF protection on mutating API routes
- **Where:** All POST/PUT/DELETE routes in `src/app/api/`
- **Why:** Any site can forge requests on behalf of a logged-in user
- **Risk:** Account manipulation via malicious links
- **Fix:** Verify Origin/Referer header on mutation routes
- **Category:** Security

#### 2. Open redirect in Google Photos proxy
- **Where:** `src/app/api/google/photos/proxy/route.ts:56`
- **Why:** `NextResponse.redirect(imageUrl)` redirects to external URL
- **Risk:** Potential phishing vector; leaks session cookies via redirect
- **Fix:** Stream image bytes through the endpoint instead of redirecting
- **Category:** Security

#### 3. No way to generate stories from authenticated UI
- **Where:** `src/app/insights/page.tsx`
- **Why:** POST /api/stories exists but is never called from the UI
- **Risk:** Core AI feature is invisible and unreachable
- **Fix:** Add "Generate Story" button (by year, all time)
- **Category:** Product / UX

### HIGH PRIORITY

#### 4. Privacy settings are not enforced server-side
- **Where:** Settings page saves preferences, but sharing/display never checks them
- **Risk:** Users trust privacy controls that don't protect anything
- **Fix:** Enforce in API layer before exposing shared content
- **Category:** Privacy / Trust

#### 5. Session error (RefreshAccessTokenError) never surfaced to users
- **Where:** `src/lib/auth.ts:82` sets error; no component reads it
- **Risk:** Silent broken Google integrations with no recovery path
- **Fix:** Global session error banner with re-authentication prompt
- **Category:** UX / Auth

#### 6. No account deletion
- **Where:** Settings page — missing "Delete my account" option
- **Risk:** GDPR Article 17 violation; legal liability
- **Fix:** Add account deletion with cascade through all related data
- **Category:** Privacy / Legal

#### 7. Upload file paths are not user-scoped
- **Where:** `src/app/api/upload/route.ts:47`
- **Risk:** Can't manage per-user storage; no cleanup on account deletion
- **Fix:** Prefix uploads with user ID
- **Category:** Architecture

#### 8. Map always uses dark tile layer
- **Where:** `src/components/map/EventMap.tsx:64`
- **Risk:** Broken visual experience in light mode
- **Fix:** Use theme context to select tile layer
- **Category:** UI

#### 9. Calendar import deduplication is fragile
- **Where:** `src/app/api/google/calendar/route.ts`
- **Risk:** Legitimate events with same name+date silently dropped
- **Fix:** Use Google Calendar event ID as sourceId
- **Category:** Data Integrity

### MEDIUM PRIORITY

#### 10. GET /api/events returns empty array (not 401) for unauthenticated
- **Where:** `src/app/api/events/route.ts:22`
- **Risk:** Masks auth issues; inconsistent with mutation endpoints
- **Category:** API Design

#### 11. Image upload errors displayed as title errors
- **Where:** `src/components/events/EventModal.tsx:69`
- **Fix:** Add separate imageUrl error field
- **Category:** UX

#### 12. getEventsByYear defined in demo.ts but used everywhere
- **Where:** `src/data/demo.ts`
- **Fix:** Move to `src/lib/utils.ts`
- **Category:** Code Quality

#### 13. No loading indicator during Google import
- **Where:** GoogleConnectModal.tsx — import can take 10+ seconds
- **Fix:** Show progress indicator
- **Category:** UX

#### 14. Insights "longest streak" metric is misleading
- **Where:** `src/app/api/insights/route.ts:111`
- **Fix:** Rename or change algorithm
- **Category:** Product

#### 15. Hero uses hardcoded sign-in path
- **Where:** `src/app/page.tsx:71`
- **Fix:** Use signIn() onClick instead of <a> href
- **Category:** Code Quality

#### 16. Map legend shows category colors but markers are all white
- **Where:** `src/components/map/EventMap.tsx`
- **Fix:** Apply category color to markers
- **Category:** UI / UX

#### 17. No Suspense boundary around useSearchParams
- **Where:** Timeline, Map, Insights pages
- **Risk:** Entire pages opt into dynamic rendering
- **Fix:** Wrap in `<Suspense>` boundary
- **Category:** Performance

### LOW PRIORITY

#### 18. YearScrubber positioning uses magic number
- **Where:** `src/app/timeline/page.tsx:125`
- **Category:** UI

#### 19. PWA manifest is minimal
- **Where:** `public/manifest.json`
- **Fix:** Add proper icon set, start_url, display mode
- **Category:** Infrastructure

#### 20. Demo events use Unsplash without attribution
- **Where:** `src/data/demo.ts`
- **Category:** Legal

#### 21. eslint-disable for no-explicit-any in API routes
- **Where:** Calendar, Photos, Stories routes
- **Category:** Code Quality

#### 22. Duplicate navigation definitions
- **Where:** `src/components/ui/Navigation.tsx:13-27`
- **Fix:** Derive one from the other
- **Category:** Code Quality

---

## D. Launch / Scale / Acquisition Readiness

### Blocks serious launch:
1. No story generation UI — flagship AI feature unreachable
2. Privacy settings don't work — trust-breaking
3. No account deletion — blocks EU launch
4. No CSRF defense-in-depth

### Needs fixing before scale:
1. User-scoped file storage paths
2. Proper calendar deduplication via sourceId
3. Session error handling for expired tokens
4. Insights queries load all dates into memory (10K+ events = slow)

### Would concern a serious investor/acquirer/CTO:
- AI feature unreachable suggests incomplete product thinking
- Decorative privacy settings are a red flag
- Single OAuth provider dependency
- No analytics instrumentation beyond Vercel basics
- No error monitoring (Sentry, etc.)

### Already good enough:
- Auth flow (token refresh, JWT, proper scopes)
- Data model (clean, well-indexed)
- API design (validation, error handling, rate limiting)
- Frontend architecture (SWR, cursor pagination, loading/empty states)
- Visual design (cohesive, polished, distinctive)
- Test suite (unit, integration, e2e)
- Security headers (CSP, X-Frame-Options)
- Soft deletes

### What feels promising:
- Compelling product concept
- Excellent demo mode for conversion
- "Play Your Story" is unique and emotionally engaging
- Google integrations are a real moat
- Design quality notably above average

---

## E. Improvement Opportunities

1. Onboarding flow for first-time users
2. Story sharing via shareable URLs (requires server-enforced privacy)
3. Multiple OAuth providers (Apple, GitHub, email/password)
4. Geocoding — auto-resolve lat/lng from location text
5. Photo gallery per event (multiple images)
6. Timeline collaboration (shared timelines for couples/families)
7. Export as PDF
8. Full-text search in database
9. "On This Day" push notifications
10. SEO — server-render landing page above-fold content
11. Internationalization
12. Custom map styles
13. Flexible event tags (beyond fixed categories)
14. Year-in-review automated email

---

## F. Recommended Action Plan

### This Week (Critical + High)
1. Add "Generate Story" button to Insights page
2. Surface session refresh errors to users
3. Add CSRF/Origin header validation on mutation routes
4. Make Google Photos proxy stream bytes instead of redirecting
5. Add account deletion endpoint and UI
6. Enforce privacy settings server-side

### Before Launch
7. User-scope upload paths
8. Fix map to respect theme
9. Use sourceId for calendar dedup
10. Fix image upload error messaging
11. Add Suspense boundaries for useSearchParams
12. Fix map legend/marker color mismatch
13. Add error monitoring (Sentry)
14. Add basic analytics (funnel, feature usage)
15. Complete PWA manifest
16. Add geocoding for manual locations

### Can Wait
17. Move getEventsByYear out of demo.ts
18. Consolidate duplicate nav definitions
19. Additional OAuth providers
20. Collaboration features
21. PDF export
22. Internationalization
