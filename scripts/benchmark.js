const fetch = require('node-fetch');
const { performance } = require('perf_hooks');

const BASE = process.env.BASE || 'http://localhost:3000';

async function timeRequest(url, opts) {
  const t0 = performance.now();
  const resp = await fetch(url, opts);
  const t1 = performance.now();
  const elapsed = t1 - t0;
  const text = await resp.text();
  return { elapsed, status: resp.status, headers: resp.headers.raw(), body: text };
}

async function avgTimings(iterations = 20) {
  console.log(`Benchmarking ${iterations} GET /books requests (no conditional)`);
  const raw = [];
  for (let i = 0; i < iterations; i++) {
    const r = await timeRequest(BASE + '/books');
    raw.push(r.elapsed);
  }
  const sum = raw.reduce((a, b) => a + b, 0);
  const avg = sum / raw.length;
  console.log(`avg = ${avg.toFixed(2)} ms (n=${iterations})`);
  return { avg, raw };
}

async function conditionalTest(iterations = 20) {
  // Get ETag first
  const first = await timeRequest(BASE + '/books');
  const etag = (first.headers['etag'] && first.headers['etag'][0]) || null;
  if (!etag) {
    console.warn('No ETag returned by server; conditional tests will use If-None-Match with a dummy value');
  }
  console.log('Using ETag:', etag);
  const raw = [];
  let statusCounts = {};
  for (let i = 0; i < iterations; i++) {
    const r = await timeRequest(BASE + '/books', { headers: { 'If-None-Match': etag || 'no-etag' } });
    raw.push(r.elapsed);
    statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
  }
  const sum = raw.reduce((a, b) => a + b, 0);
  const avg = sum / raw.length;
  console.log(`conditional avg = ${avg.toFixed(2)} ms (n=${iterations}), statuses:`, statusCounts);
  return { avg, raw, statusCounts };
}

async function run() {
  try {
    const cold = await avgTimings(20);
    const cond = await conditionalTest(40);

    const savings = ((cold.avg - cond.avg) / cold.avg) * 100;
    console.log('\nSummary:');
    console.log(`cold avg: ${cold.avg.toFixed(2)} ms`);
    console.log(`conditional avg: ${cond.avg.toFixed(2)} ms`);
    console.log(`approx response-time savings: ${savings.toFixed(2)}%`);
    // Basic caching effectiveness estimate: ratio of 304s
    const total = Object.values(cond.statusCounts).reduce((a, b) => a + b, 0);
    const notModified = cond.statusCounts[304] || 0;
    const hitRate = (notModified / total) * 100;
    console.log(`cache hit-rate (304 responses): ${hitRate.toFixed(2)}% (${notModified}/${total})`);
  } catch (err) {
    console.error('Benchmark error:', err.message);
  }
}

run();
