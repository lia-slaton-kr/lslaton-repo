# CLAUDE.md — So About This AI Stuff

A friendly, interactive site that explains AI to **designers who feel behind**. Tone: a smart colleague explaining it without making anyone feel dumb. Static HTML/CSS/JS, no build step, no backend.

## Hard rules (do not violate)

1. **Approved copy is verbatim.** Concept text, analogies, glossary definitions, prompt examples, and checklist items are provided by the user and must be reproduced exactly. Never rewrite, paraphrase, or "improve" them. You may only generate structural/UI microcopy (nav labels, button text, section eyebrows) — and flag it as generated for review.
2. **Propose before building.** For any non-trivial change, propose layout + interactions (2–3 options for signature interactions) and get approval before writing code. Don't build until the user approves.
3. **Stay self-contained.** KDS is vendored at `kds/` (trimmed to only what's used at runtime, ~680 KB). Reference `kds/…` — never reintroduce `../../node_modules/...` paths. If you add a KDS component, re-capture runtime `/kds/` requests (enable CDP Network logging *before* navigating) and re-trim.
4. **No "Layer N" in user-facing text.** The canonical order is The Landscape · Under the Hood · Using It Well · For Designers, shown as "SECTION N OF 4" eyebrows. Never surface "Layer 1/2/3/4" in copy, headings, nav, aria labels, or visible JS strings. (Internal CSS class names like `.layer-head` are fine — not user-facing.)
5. **Verify end-to-end before claiming done.** Drive the affected flow in headless Chrome over the DevTools Protocol (Node has a global `WebSocket`; serve with `python3 -m http.server`). Report pass counts. Don't rely on tests alone for UI.

## Architecture

- **Design system:** KDS (`kds/`) provides tokens (via `light.css`) + Nunito font + `kds-button` (the only KDS web component used). A warm layer sits on top: paper background `#faf6f0`, rounded cards, generous spacing. Colors come from KDS tokens as `rgb(var(--<token>-rgb))`.
- **Per-page assets:** each page has its own `<page>.css` and `<page>.js`. Shared pieces: `site-nav.css`/`site-nav.js` (global nav), `glossary-data.js` + `glossary-popover.{css,js}` (inline term popovers), `homepage.css`/`quiz.js` (homepage + quiz drawer).
- **Global nav** (`site-nav.js`) is the single source for nav links — adding a future layer is one array entry. It injects the bar on every page and replaces the old per-page header. Static (not sticky) so it never collides with sticky steppers.
- **Glossary** is one destination page (`glossary.html`) plus inline popovers driven by the shared `glossary-data.js`. The hallucination entry is canonical as written — do not change it, even if a later brief restates it slightly differently.

## Structure conventions

- **Steppers vs tabs:** Under the Hood keeps **stepped** navigation (sequence aids comprehension — Next/Back enforced). The Landscape and For Designers use **standard tabs** (jump freely, no Next/Back, `role="tablist/tab/tabpanel"`) — reference material.
- **Going Deeper** content lives on its **own flat page** per layer (`landscape-going-deeper.html`, `for-designers-going-deeper.html`), reached only via a "Keep going →" CTA on the parent (not in the global nav). Each has a breadcrumb ("Parent → Going Deeper") and a "← Back to [Parent]" link, and keeps the stepper pattern.
- **Files are flat** — all pages live directly in this folder. Don't create subfolders or rename existing pages.
- **Copyable prompt blocks** copy clean text only (no interaction-state artifacts). The prompt-anatomy copy button copies a JS-built clean string, independent of highlight/annotation DOM.

## Status

Live: homepage + quiz drawer, The Landscape, Under the Hood, For Designers, glossary. Not built: **Using It Well** (Section 3). Planned separately: **Tools We Actually Use**.

## Deploy

Self-contained static folder. Served over http(s) (ES module loader). Deployed via GitHub Actions (`.github/workflows/deploy-pages.yml` at repo root) → GitHub Pages at `https://krogertechnology.github.io/lslaton-repo/`. Any change under this folder on `main` auto-redeploys. Root `.gitignore` excludes `node_modules/` and `.DS_Store`.
