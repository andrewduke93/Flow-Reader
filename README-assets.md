Icon & splash generation

Run the asset generator to produce PNG icons and iOS splash images from the SVG sources:

  npm install --save-dev sharp   # only if not installed already
  npm run generate:assets

What it produces (public/icons):
- icon-<size>x<size>.png (48..1024)
- icon-maskable.png (adaptive/maskable)
- apple-splash-<w>-<h>.png (iOS startup images)

Notes:
- The repo contains high-quality SVG sources (`public/icons/flowy-icon.svg`, `flowy-splash.svg`).
- The generator uses `sharp` to rasterize SVG → PNG. CI builders should install `sharp` or run generation during the build step.
- iOS requires static PNG startup images for a perfect native splash; we include a CSS fallback splash for browsers that support the Web App Manifest splash screen.
