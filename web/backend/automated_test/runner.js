/**
 * DAST Runner — automated_test/runner.js
 * Orchestrates all test categories and writes report.json
 * Usage: node runner.js
 */
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

// ─── Load config ──────────────────────────────────────────────────────────────
const inputPath = path.join(__dirname, 'input.json');
if (!fs.existsSync(inputPath)) {
  console.error('❌  input.json not found. Copy the template and fill it in.');
  process.exit(1);
}
const config = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
const BASE_URL = config.baseUrl;
if (!BASE_URL) { console.error('❌  baseUrl missing in input.json'); process.exit(1); }

// Collect role → token map (skip empty strings and meta keys)
const ROLES = {};
for (const [k, v] of Object.entries(config)) {
  if (!k.startsWith('_') && k !== 'baseUrl' && v && v.trim()) ROLES[k] = v;
}
console.log(`\n🔧  BASE_URL : ${BASE_URL}`);
console.log(`🔧  Roles    : ${Object.keys(ROLES).join(', ') || '(none — unauthenticated tests only)'}\n`);

// ─── Utility ──────────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function request(method, urlStr, headers = {}, body = null) {
  return new Promise((resolve) => {
    const start = Date.now();
    const url = new URL(urlStr);
    const lib = url.protocol === 'https:' ? https : http;
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method,
      headers: { 'Content-Type': 'application/json', ...headers },
      timeout: 10000,
    };
    const bodyStr = body ? JSON.stringify(body) : null;
    if (bodyStr) options.headers['Content-Length'] = Buffer.byteLength(bodyStr);

    const req = lib.request(options, (res) => {
      let data = '';
      res.on('data', c => { if (data.length < 4096) data += c; });
      res.on('end', () => resolve({
        status: res.statusCode,
        time_ms: Date.now() - start,
        body: data.slice(0, 512),
      }));
    });
    req.on('error', (e) => resolve({ status: 0, time_ms: Date.now() - start, body: e.message }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 0, time_ms: 10000, body: 'TIMEOUT' }); });
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

// ─── Report accumulator ───────────────────────────────────────────────────────
const report = [];
function record(rec) {
  report.push({ ...rec, timestamp: new Date().toISOString() });
  const icon = rec.finding ? '✗' : '✓';
  const sev  = rec.finding ? `[${rec.severity}]` : '';
  console.log(`  ${icon} ${rec.test_category.padEnd(20)} ${rec.method.padEnd(7)} ${rec.endpoint.padEnd(35)} role=${rec.role.padEnd(8)} → ${rec.status} ${sev} ${rec.note}`);
}

// ─── Load discovered endpoints ────────────────────────────────────────────────
const endpointsFile = path.join(__dirname, 'endpoints.json');
if (!fs.existsSync(endpointsFile)) {
  console.error('❌  endpoints.json not found — run discover.js first.');
  process.exit(1);
}
const ENDPOINTS = JSON.parse(fs.readFileSync(endpointsFile, 'utf8'));
console.log(`📋  Loaded ${ENDPOINTS.length} endpoints from endpoints.json\n`);

// ─── Run all categories ───────────────────────────────────────────────────────
async function runAll() {
  const cats = [
    require('./tests/cat1_authn_bypass.js'),
    require('./tests/cat2_authz_privesc.js'),
    require('./tests/cat3_idor.js'),
    require('./tests/cat4_rbac_matrix.js'),
    require('./tests/cat5_token_tampering.js'),
    require('./tests/cat6_injection.js'),
    require('./tests/cat7_rate_limit.js'),
  ];

  for (const cat of cats) {
    console.log(`\n══ ${cat.name} ${'═'.repeat(Math.max(0,55-cat.name.length))}`);
    await cat.run({ BASE_URL, ROLES, ENDPOINTS, request, record, sleep });
  }

  // Write report
  const reportPath = path.join(__dirname, 'report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄  Report written → ${reportPath}`);
  printSummary();
}

function printSummary() {
  const findings = report.filter(r => r.finding);
  const bySev = {};
  for (const f of findings) bySev[f.severity] = (bySev[f.severity] || 0) + 1;

  console.log('\n' + '═'.repeat(60));
  console.log('  DAST SUMMARY');
  console.log('═'.repeat(60));
  console.log(`  Endpoints in scope : ${ENDPOINTS.length}`);
  console.log(`  Total tests run    : ${report.length}`);
  console.log(`  Findings           : ${findings.length}`);
  for (const [sev, cnt] of Object.entries(bySev)) {
    const icon = sev === 'CRITICAL' ? '🔴' : sev === 'HIGH' ? '🟠' : sev === 'MEDIUM' ? '🟡' : '🔵';
    console.log(`    ${icon} ${sev}: ${cnt}`);
  }
  if (findings.length) {
    console.log('\n  TOP ISSUES TO FIX:');
    const order = ['CRITICAL','HIGH','MEDIUM','LOW','INFO'];
    const sorted = findings.sort((a,b) => order.indexOf(a.severity) - order.indexOf(b.severity));
    sorted.slice(0,10).forEach((f, i) => {
      console.log(`    ${i+1}. [${f.severity}] ${f.test_category} | ${f.method} ${f.endpoint} | ${f.note}`);
    });
  } else {
    console.log('\n  ✓ No findings detected.');
  }
  console.log('═'.repeat(60));
}

runAll().catch(console.error);
