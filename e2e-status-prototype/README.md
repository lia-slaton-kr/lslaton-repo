# KIA E2E Status — Vision Prototype

A clickable, static HTML/CSS/JS prototype that visualizes what end-to-end item-status visibility could look like for KIA suppliers and internal support agents.

Built from `e2e-status-prototype.md`. Mock data only — no backend, no auth, no build step.

## How to view

Just open `index.html` in any browser:

```bash
open index.html
```

Or, if you prefer to serve it locally:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## What's in scope

The brief calls out a **foundational triad** of screens as highest-value. Those are the focus:

| Screen | File | Use cases |
|---|---|---|
| Landing / nav | `index.html` | (entry point) |
| Supplier item status detail | `supplier.html` | UC-A01, UC-A03, UC-A13 |
| Error detail modal | `supplier.html` (modal inside) | UC-A03 |
| Agent diagnostic detail | `agent.html` | UC-A06, UC-A07, UC-A08, UC-A13 |

## Demo scenarios

The supplier page supports three scenarios via the chip switcher at the top, or via deep links from the landing page:

- **Happy path** — `supplier.html?scenario=HAPPY` — Kraft Heinz item mid-pipeline, downstream stages NULL.
- **Validation error** — `supplier.html?scenario=ERROR` — Boston Beer image orientation invalid (supplier-fixable). Click the issue row to open the error detail modal.
- **Banner cache stale** — `supplier.html?scenario=BANNER` — Tillamook live on Kroger.com but Harris Teeter cache hasn't refreshed in 5 days.

The agent page is locked to the Tillamook / Harris Teeter scenario (Case `CASE-2026-05-0001`) since that's the case being diagnosed.

## Files

```
e2e-status-prototype/
├── index.html        Landing page with two entry points + scenario quick-jumps
├── supplier.html     Screen 2 + Screen 3 (modal embedded)
├── agent.html        Screen 6 (diagnostic detail)
├── styles.css        Shared Kroger-flavored design system (colors, badges, timeline)
├── mock-data.js      Mock items, errors, diagnostic logs, banner health
└── README.md         This file
```

## What's intentionally not built

Per the brief's guardrails — the goal is to show the experience, not the infrastructure:

- No real auth, RBAC, or API calls (everything is mocked client-side)
- No dashboard search results, case creation form, or notification preferences screens (stubbed with `alert()` placeholders)
- No real-time updates (status snapshots only)
- No mobile-specific layouts (responsive but not optimized)
- No persistence — clicking action buttons on the agent page logs to the audit trail in-memory only

## Design principles applied

The brief's six principles are visible throughout:

1. **Visibility over certainty** — every stage is shown with a status, including stages we don't know yet
2. **Progressive disclosure** — supplier sees timeline summary; agent gets expandable per-stage logs
3. **Explicit NULL states** — stages without data render as "❓ Status unknown" with explanation
4. **Banner awareness** — Kroger.com / Harris Teeter / Fred Meyer get separate cards with cache age
5. **Ownership clarity** — every error has a category badge ("You can fix this" / "Requires diagnosis")
6. **Trust through transparency** — agent actions are logged to a visible audit trail
