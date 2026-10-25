#!/usr/bin/env node
/**
 * Verifies that React Compiler can optimize every component/hook in the project (the compiler is on via
 * `experiments.reactCompiler`). A function it cannot compile ("bail-out") silently loses automatic memoization,
 * which includes the caching of inline `style` objects. Run: `npm run check:compiler`.
 * Starter-template files that predate the project rules are skipped (same list as `LEGACY` in eslint.config.js).
 */
const babel = require('@babel/core');
const fs = require('node:fs');
const path = require('node:path');

const LEGACY = [
  'src/components/',
  'src/constants/',
  'src/hooks/',
  'src/app/(tabs)/index.tsx',
  'src/app/(tabs)/explore.tsx',
];

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]
  );

const files = walk('src').filter(
  (file) => /\.tsx?$/.test(file) && !file.endsWith('.d.ts') && !LEGACY.some((legacy) => file.startsWith(legacy))
);

let compiled = 0;
const problems = [];

for (const file of files) {
  const events = [];
  try {
    babel.transformSync(fs.readFileSync(file, 'utf8'), {
      filename: file,
      babelrc: false,
      configFile: false,
      presets: [['@babel/preset-typescript', { isTSX: file.endsWith('x'), allExtensions: true }]],
      plugins: [['babel-plugin-react-compiler', { logger: { logEvent: (_name, event) => events.push(event) } }], '@babel/plugin-syntax-jsx'],
    });
  } catch (error) {
    problems.push(`${file}: transform failed: ${String(error.message).split('\n')[0]}`);
    continue;
  }
  compiled += events.filter((event) => event.kind === 'CompileSuccess').length;
  for (const event of events) {
    if (event.kind === 'CompileError' || event.kind === 'CompileSkip' || event.kind === 'PipelineError') {
      problems.push(`${file}: ${event.kind} ${event.detail?.reason ?? event.reason ?? ''}`.trim());
    }
  }
}

console.log(`React Compiler: ${compiled} functions compiled, ${problems.length} problem(s).`);
for (const problem of problems) console.log(`  - ${problem}`);
process.exit(problems.length === 0 ? 0 : 1);
