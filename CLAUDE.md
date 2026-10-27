# Invoice

Minimal invoice generator: a form on the left, a live A4 preview, "Save PDF" via the browser's print-to-PDF. No accounts, no backend, **nothing saved**: state is in memory only (no localStorage, cookies or saved clients — a product promise, keep it). Reuse is via Export/Import JSON or an agent link. Deployed to `invoice.alexvoid.com`. Sibling of `reel` (same stack, palette and controls); the invoice layout follows `invoice_local` (Deel-style).

## Stack

- **Vite + React 19 + TypeScript** (`pnpm`)
- **Tailwind CSS 4** via `@tailwindcss/vite`; palette copied verbatim from alexvoid (`src/palette.css`, OKLCH, `.dark` class)
- **Base UI** (`@base-ui/react`) primitives, **motion** for UI animation — `src/ui/controls.tsx` is copied from reel (plus `TextArea`, `NumberField`)
- **lucide-react** icons (not reel's nucleo: the repo is public and must install without a licence key); `src/ui/icons.tsx` has the GitHub mark
- **Cloudflare Workers Static Assets** (`wrangler.jsonc`, SPA mode, custom domain route)

Keep dependencies minimal; prefer a few lines of code over a new package. Public repo (github.com/alexjedi/invoice): no comments in code, nothing licensed or personal committed — Söhne/Lava fonts are gitignored (fallback to system fonts). No PDF library: print CSS + `window.print()` gives vector text and exact A4.

## Commands

- `pnpm dev` — dev server
- `pnpm build` — typecheck + build to `dist/`
- `pnpm deploy` — build + `wrangler deploy` (`set -a; source .env; set +a` first)
- `pnpm install` needs no secrets

## Architecture

```
src/
├── state/
│   ├── types.ts     — Invoice, Party, Item
│   ├── defaults.ts  — DEFAULT_INVOICE (empty; Paper shows grey hints in the preview only), currencies, locales, normalize() (also maps invoice_local's config.json)
│   ├── store.ts     — in-memory useSyncExternalStore store; actions
│   ├── format.ts    — invoice id, dates, money (Intl), totals
│   └── link.ts      — prefill from the URL hash (`#to.name=…&item=desc|qty|unit|rate`, or `#json=`), applied once in main.tsx; the hash stays so a reload restores it
└── ui/
    ├── Paper.tsx    — the A4 sheet in mm/pt; used for both preview and print
    ├── Stage.tsx    — scales the sheet to fit
    ├── Panel.tsx    — the form
    ├── ExportBar.tsx — Save PDF (sets document.title = invoice id for the file name), "Start next invoice" after print
    ├── AgentDialog.tsx — toolbar robot button's modal: a copyable prompt pointing agents at /llms.txt
    └── controls.tsx — shared controls from reel
```

- `#print` holds a second `<Paper />`; the print stylesheet hides `#app` and shows only it.
- `date: ""` means today, so an imported setup opens on a fresh date. `nextInvoice()` bumps the number and resets date/status.
- The sheet is always light (hard-coded greys), independent of the UI theme.
- Never commit personal invoice data; defaults are placeholders.

## Agents

Agents fill an invoice by building a hash link for the user; no server, no API. The format is documented in three places that must stay in sync with `link.ts` / `types.ts`: `public/llms.txt` (full reference), `public/schema.json` (JSON Schema for `#json=`), and the visually hidden `#agents` section in `index.html` (for agents that read the HTML without running JS).

## UI conventions

Same as reel: tonal surfaces (`bg-field*` on `bg-panel`), 11px uppercase section headers in `text-tx-3`.
