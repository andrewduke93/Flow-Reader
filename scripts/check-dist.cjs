const fs = require('fs');
const path = require('path');
const dist = path.resolve(__dirname, '..', 'dist', 'index.html');
let ok = true;
try {
  const html = fs.readFileSync(dist, 'utf8');
  function expect(cond, msg) { if (!cond) { console.error('FAIL:', msg); ok = false } else { console.log('OK:', msg) } }
  expect(/src="\/Flow-Reader\/assets\/.+\.js"/.test(html), 'main JS references include base /Flow-Reader/');
  expect(html.includes("window.__FLOW_PRESERVE_SPLASH"), 'splash is preserved until app mount');
  expect(/href="\/Flow-Reader\/manifest.webmanifest"/.test(html), 'manifest uses base path');
  expect(!/window.addEventListener\('\s*load\s*'/.test(html), 'no premature splash removal on load');
} catch (err) {
  console.error('ERROR reading dist/index.html', err.message);
  process.exit(2);
}
process.exit(ok ? 0 : 1);
