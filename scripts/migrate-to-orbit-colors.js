const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const siteSrc = path.join(root, 'site', 'src');

function getAllFiles(dir, exts = ['.jsx', '.js', '.css', '.svg', '.html'], files = []) {
  if (!fs.existsSync(dir)) return files;
  const list = fs.readdirSync(dir);
  for (const item of list) {
    if (item === 'node_modules' || item === '.git' || item === 'dist') continue;
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      getAllFiles(full, exts, files);
    } else if (exts.some(ext => item.endsWith(ext))) {
      files.push(full);
    }
  }
  return files;
}

const filesToProcess = [
  ...getAllFiles(siteSrc),
  path.join(root, 'site', 'public', 'favicon.svg'),
  path.join(root, 'assets', 'brand', 'favicon.svg'),
  path.join(root, 'scripts', 'generate-redirects.js'),
];

const replacements = [
  // Hex replacements
  [/#[0-9a-fA-F]{6}/g, (match) => {
    const lower = match.toLowerCase();
    if (lower === '#38bdf8') return '#FF5600';
    if (lower === '#22d3ee') return '#FF7A33';
    if (lower === '#06b6d4') return '#E04C00';
    if (lower === '#0891b2') return '#B83F00';
    if (lower === '#0e1726') return '#1f1610';
    if (lower === '#050911') return '#120c08';
    return match;
  }],

  // Tailwind classes
  [/\bcyan-50\b/g, 'orange-50'],
  [/\bcyan-100\b/g, 'orange-100'],
  [/\bcyan-200\b/g, 'orange-200'],
  [/\bcyan-300\b/g, 'orange-300'],
  [/\bcyan-400\b/g, 'orange-500'],
  [/\bcyan-500\b/g, 'orange-500'],
  [/\bcyan-600\b/g, 'orange-600'],
  [/\bcyan-700\b/g, 'orange-700'],
  [/\bcyan-800\b/g, 'orange-800'],
  [/\bcyan-900\b/g, 'orange-900'],
  [/\bcyan-950\b/g, 'orange-950'],

  // RGBA strings
  [/rgba\(\s*6\s*,\s*182\s*,\s*212\s*,/g, 'rgba(255, 86, 0,'],
  [/rgba\(\s*56\s*,\s*189\s*,\s*248\s*,/g, 'rgba(255, 86, 0,'],

  // OKLCH hue 240 to 40 (Orbit accent hue)
  [/oklch\(\s*0\.78\s+0\.17\s+240\s*\)/g, 'oklch(0.68 0.19 40)'],
  [/oklch\(\s*0\.72\s+0\.16\s+240\s*\)/g, 'oklch(0.68 0.19 40)'],

  // Shader vec3 uniforms
  [/warm\s*=\s*\[0\.0,\s*0\.85,\s*1\.0\]/g, 'warm = [1.0, 0.337, 0.0]'],
  [/cool\s*=\s*\[0\.0,\s*0\.65,\s*0\.80\]/g, 'cool = [0.72, 0.15, 0.0]'],
  [/warm=\{\[0\.0,\s*0\.85,\s*1\.0\]\}/g, 'warm={[1.0, 0.337, 0.0]}'],
  [/cool=\{\[0\.0,\s*0\.65,\s*0\.80\]\}/g, 'cool={[0.72, 0.15, 0.0]}'],
];

let changedCount = 0;

for (const file of filesToProcess) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  for (const [pattern, replacement] of replacements) {
    content = content.replace(pattern, replacement);
  }

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated to Orbit colors: ${path.relative(root, file)}`);
    changedCount++;
  }
}

console.log(`\nSuccessfully updated ${changedCount} file(s) to Orbit's #FF5600 color scheme.`);
