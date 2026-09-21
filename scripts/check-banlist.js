const fs = require('fs');
const path = require('path');

const FORBIDDEN = [
  'military-grade',
  'immutable',
  'guarantee',
  'zero data survival',
  'battle-tested',
  'certified by',
  'Rev. 1',
  'TBD',
  'TODO',
  'NEEDS-INPUT',
  'lorem',
  'Smart Secure Wipe',
  'Quick Purge',
];

const SCAN_DIRS = ['docs', 'research', 'README.md', 'CHANGELOG.md'];
const EXTENSIONS = ['.md', '.yml', '.yaml'];

function getAllFiles(dirPath, files = []) {
  const stat = fs.statSync(dirPath);
  if (stat.isFile()) {
    if (EXTENSIONS.some(ext => dirPath.endsWith(ext))) files.push(dirPath);
    return files;
  }
  if (!stat.isDirectory()) return files;
  for (const entry of fs.readdirSync(dirPath)) {
    getAllFiles(path.join(dirPath, entry), files);
  }
  return files;
}

let violations = 0;
const root = path.resolve(__dirname, '..');

for (const target of SCAN_DIRS) {
  const fullPath = path.join(root, target);
  if (!fs.existsSync(fullPath)) continue;
  const files = getAllFiles(fullPath);
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      for (const term of FORBIDDEN) {
        // Skip frontmatter status fields for "TBD" etc if inside _inputs-needed.md
        if (file.includes('_inputs-needed') && ['TBD', 'TODO', 'NEEDS-INPUT'].includes(term)) continue;
        // Case-insensitive check except for Rev. 1
        const idx = term === 'Rev. 1'
          ? lines[i].indexOf(term)
          : lines[i].toLowerCase().indexOf(term.toLowerCase());
        if (idx !== -1) {
          const relPath = path.relative(root, file);
          console.error(`VIOLATION: "${term}" found in ${relPath}:${i + 1}`);
          console.error(`  ${lines[i].trim().substring(0, 120)}`);
          violations++;
        }
      }
    }
  }
}

if (violations > 0) {
  console.error(`\n${violations} ban-list violation(s) found.`);
  process.exit(1);
} else {
  console.log('Ban-list check passed. No forbidden terms found.');
}
