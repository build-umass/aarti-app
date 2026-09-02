import { execSync } from 'node:child_process';
import { performance } from 'node:perf_hooks';
import { resolve } from 'node:path';

const [cwdArg, runsArg = '5'] = process.argv.slice(2);
if (!cwdArg) {
  console.error('usage: node scripts/benchmark-lint.mjs <app-dir> [runs]');
  process.exit(2);
}
const cwd = resolve(cwdArg);
const runs = Math.max(1, parseInt(runsArg, 10) || 5);

function timeOnce() {
  const t0 = performance.now();
  execSync('npm run lint', { cwd, stdio: 'ignore', shell: true });
  return performance.now() - t0;
}

timeOnce();

const samples = [];
for (let i = 0; i < runs; i++) {
  const ms = timeOnce();
  samples.push(ms);
  console.log(`run ${i + 1}: ${ms.toFixed(0)} ms`);
}
samples.sort((a, b) => a - b);
const median = samples[Math.floor(samples.length / 2)];
const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
console.log(`median: ${median.toFixed(0)} ms`);
console.log(`mean:   ${mean.toFixed(0)} ms`);
