// Lints only the lines a pull request adds or changes.
// Usage: node .github/scripts/lint-changed-lines.mjs <base-branch>
// Exits 1 only if an ESLint error (severity 2) sits on an added/changed line.
// Warnings on those lines are printed but never fail the run.
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const base = process.argv[2] || process.env.BASE_REF || 'main';
const range = `origin/${base}...HEAD`;

const diff = execFileSync(
  'git',
  ['diff', '-U0', '--no-color', '--diff-filter=ACMR', range, '--', '*.ts', '*.tsx'],
  { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 }
);

// Map of absolute file path -> array of [start, end] added line ranges.
const ranges = new Map();
let current = null;
for (const line of diff.split('\n')) {
  if (line.startsWith('+++ ')) {
    const target = line.slice(4);
    current = target === '/dev/null' ? null : path.resolve(target.replace(/^b\//, ''));
    if (current && !ranges.has(current)) ranges.set(current, []);
    continue;
  }
  const hunk = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/.exec(line);
  if (hunk && current) {
    const start = Number(hunk[1]);
    const count = hunk[2] === undefined ? 1 : Number(hunk[2]);
    if (count > 0) ranges.get(current).push([start, start + count - 1]);
  }
}

const files = [...ranges.keys()].filter((f) => ranges.get(f).length > 0);
if (files.length === 0) {
  console.log('No added or changed lines in .ts or .tsx files to lint.');
  process.exit(0);
}

let raw;
try {
  raw = execFileSync('npx', ['eslint', '--format', 'json', ...files], {
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
  });
} catch (err) {
  // eslint exits 1 when it finds problems; the JSON is still on stdout.
  if (!err.stdout) throw err;
  raw = err.stdout;
}

const rel = (f) => path.relative(process.cwd(), f);
const inRanges = (n, list) => list.some(([a, b]) => n >= a && n <= b);
let errors = 0;
let warnings = 0;
const out = [];

for (const result of JSON.parse(raw)) {
  const list = ranges.get(path.resolve(result.filePath)) || [];
  for (const m of result.messages) {
    if (!inRanges(m.line, list)) continue;
    const level = m.severity === 2 ? 'error' : 'warning';
    if (m.severity === 2) errors += 1;
    else warnings += 1;
    out.push(`${rel(result.filePath)}:${m.line} ${level} ${m.ruleId ?? 'parse'} ${m.message}`);
  }
}

if (out.length) console.log(out.join('\n'));
console.log(`\nProblems on changed lines: ${errors} error(s), ${warnings} warning(s).`);
process.exit(errors > 0 ? 1 : 0);
