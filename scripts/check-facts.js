const fs = require('fs');
const path = require('path');

// Simple YAML value extractor (handles nested dot-notation keys in flat YAML)
function loadFacts(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const facts = {};
  const lines = content.split('\n');
  const keyStack = [];

  for (const line of lines) {
    if (line.trim().startsWith('#') || line.trim() === '' || line.trim() === '---') continue;
    const indent = line.search(/\S/);
    const depth = Math.floor(indent / 2);

    // Trim stack to current depth
    while (keyStack.length > depth) keyStack.pop();

    const kvMatch = line.match(/^\s*([\w-]+):\s*"?([^"#]*)"?\s*$/);
    if (kvMatch) {
      const key = kvMatch[1];
      const value = kvMatch[2].trim();
      if (value === '' || value.endsWith(':')) {
        // Parent key
        keyStack[depth] = key;
      } else {
        keyStack[depth] = key;
        const fullKey = keyStack.slice(0, depth + 1).join('.');
        facts[fullKey] = value;
      }
    }
  }
  return facts;
}

// Scan markdown files for <!-- fact:key -->value<!-- /fact --> tags
function scanForFactTags(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  const stat = fs.statSync(dir);
  if (stat.isFile() && dir.endsWith('.md')) {
    files.push(dir);
  } else if (stat.isDirectory()) {
    for (const entry of fs.readdirSync(dir)) {
      scanForFactTags(path.join(dir, entry), files);
    }
  }
  return files;
}

const root = path.resolve(__dirname, '..');
const factsPath = path.join(root, 'data', 'facts.yml');

if (!fs.existsSync(factsPath)) {
  console.error('data/facts.yml not found');
  process.exit(1);
}

const facts = loadFacts(factsPath);
const FACT_TAG_RE = /<!--\s*fact:([\w.]+)\s*-->([^<]+)<!--\s*\/fact\s*-->/g;

let errors = 0;
let checked = 0;

const mdFiles = [
  ...scanForFactTags(path.join(root, 'docs')),
  ...scanForFactTags(path.join(root, 'README.md')),
  ...scanForFactTags(path.join(root, 'research')),
];

for (const file of mdFiles) {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = FACT_TAG_RE.exec(content)) !== null) {
    checked++;
    const key = match[1];
    const proseValue = match[2].trim();
    const factValue = facts[key];

    if (factValue === undefined) {
      console.error(`ERROR: Unknown fact key "${key}" in ${path.relative(root, file)}`);
      errors++;
    } else if (factValue === 'pending') {
      // Skip pending values — they haven't been filled yet
      console.log(`SKIP: "${key}" is pending in facts.yml`);
    } else if (proseValue !== factValue) {
      console.error(`MISMATCH: "${key}" in ${path.relative(root, file)}`);
      console.error(`  prose:  "${proseValue}"`);
      console.error(`  facts:  "${factValue}"`);
      errors++;
    }
  }
}

console.log(`\nChecked ${checked} fact tag(s) across ${mdFiles.length} file(s).`);

if (errors > 0) {
  console.error(`${errors} fact validation error(s) found.`);
  process.exit(1);
} else {
  console.log('Facts check passed.');
}
