const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const linksPath = path.join(root, 'data', 'links.yml');

// Simple YAML parser for our flat structure (no external deps)
function parseLinksYml(content) {
  const slugs = {};
  let currentSlug = null;
  for (const line of content.split('\n')) {
    const slugMatch = line.match(/^\s{2}(\w[\w-]*):\s*$/);
    if (slugMatch) {
      currentSlug = slugMatch[1];
      slugs[currentSlug] = {};
      continue;
    }
    if (currentSlug) {
      const kvMatch = line.match(/^\s{4}(\w+):\s*"?([^"]*)"?\s*$/);
      if (kvMatch) {
        slugs[currentSlug][kvMatch[1]] = kvMatch[2].trim();
      }
    }
  }
  return slugs;
}

const BASE_URL = 'https://nishchaydev.github.io/Void-Vault';

function generateRedirectHTML(slug, dest, description) {
  const fullDest = dest.startsWith('http') ? dest : `${BASE_URL}${dest.startsWith('/') ? '' : '/'}${dest}`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta http-equiv="refresh" content="0; url=${fullDest}">
  <link rel="canonical" href="${fullDest}">
  <title>Void Vault — ${description}</title>
  <style>body{font-family:system-ui,sans-serif;background:#050505;color:#e5e5e5;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}a{color:#38bdf8}</style>
</head>
<body>
  <p>Redirecting to <a href="${fullDest}">${description}</a>…</p>
</body>
</html>`;
}

// Read and parse
if (!fs.existsSync(linksPath)) {
  console.error('data/links.yml not found');
  process.exit(1);
}

const content = fs.readFileSync(linksPath, 'utf8');
const slugs = parseLinksYml(content);
let count = 0;

for (const [slug, data] of Object.entries(slugs)) {
  const dest = data.destination || '#';
  const desc = data.description || slug;
  const dir = path.join(root, 'go', slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), generateRedirectHTML(slug, dest, desc));
  count++;
  console.log(`  /go/${slug}/ → ${dest}`);
}

console.log(`\nGenerated ${count} redirect(s).`);
