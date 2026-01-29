# Flow RSVP — Design Language System (DLS)

This workspace contains the initial Design Language System for Flow RSVP (Step 1).

What I implemented:
- 8px baseline grid + micro 4px spacing
- Squircle-first components with 2px ink stroke
- Palette: Paper White, Jet Ink, Safety Orange, Soft Mint
- Components: `FlowButton`, `BookCard`, `NavigationDock`
- `GlobalLayout`, `ThemeContext`, and a `DesignSystem` sandbox page
- Icons: `lucide-react` with strokeWidth = 1.5

Run locally:
- npm install
- npm run dev
- Open http://localhost:5173
## CI / GitHub Pages — PAT fallback
If GitHub Actions cannot push the `gh-pages` branch with the default `GITHUB_TOKEN` (org policies may restrict branch creation), the workflow will attempt a fallback using a repository secret named `PAGES_PAT`.

To enable automatic fallback deploys:

1. Create a Personal Access Token (classic) with the `repo` scope (or at least `public_repo` + `pages` if applicable).
2. In the repository Settings → Secrets → Actions add a new secret named `PAGES_PAT` and paste the token.
3. Push to `main` — the Pages workflow will attempt to publish using `GITHUB_TOKEN`, then fall back to `PAGES_PAT` if needed.

You can also publish manually (one-off):
- npm run build && npx gh-pages -d dist