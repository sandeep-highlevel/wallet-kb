# Wallet Knowledge Base

How money moves through HighLevel wallets: who charges, who recharges, which worker settles,
where the data lands, and the line of code behind every step.

**Internal only.** The KB names internal repos, file paths, Pub/Sub topics and collections.
GitHub Pages for this repo must stay **private** (org members only). Never make the repo or the
Pages site public.

## Sections

Overview · Wallet flows · APIs & workers · Collections · Controls & gaps · Data pipeline ·
Wallet SDK · Diagrams & docs. Press <kbd>⌘K</kbd> or <kbd>/</kbd> to search everything.

Views are shareable: the tab and selected item live in the URL, for example
`#/?tab=flows&item=wallet_charge`.

## Develop

```bash
npm ci
npm run dev      # http://localhost:5174
npm test         # vitest: tab smoke tests, motion and reveal helpers
npm run build    # static site in dist/
```

Stack: Vue 3, vue-router (hash history, since Pages has no SPA fallback), Tailwind CSS 4,
GSAP (SplitText intro, ScrollTrigger parallax, magnetic buttons) and an IntersectionObserver
scroll reveal. All motion is skipped under `prefers-reduced-motion`.

## Update the data

The source of truth is `platform-devtools-frontend/src/pages/billing/wallet-kb`.

```bash
npm run sync     # copies data/ and the *.ts logic; set DEVTOOLS_DIR if the repo is elsewhere
```

Components in `src/kb/components` are restyled for this site and are not overwritten; compare
them by hand when the devtools versions change.

## Deploy

Every push to `main` runs `.github/workflows/pages.yml`: test, build, deploy to Pages.
