/**
 * discover.js — STEP 1: Enumerate all API endpoints from source + live Swagger
 * Usage: node discover.js
 * Writes: endpoints.json  (used by runner.js)
 */
const fs   = require('fs');
const path = require('path');
const http  = require('http');
const https = require('https');

// ─── Load config ──────────────────────────────────────────────────────────────
const config   = JSON.parse(fs.readFileSync(path.join(__dirname, 'input.json'), 'utf8'));
const BASE_URL = config.baseUrl;

// ─── Utility ──────────────────────────────────────────────────────────────────
function get(urlStr) {
  return new Promise((resolve) => {
    const url = new URL(urlStr);
    const lib = url.protocol === 'https:' ? https : http;
    const req = lib.get(urlStr, { timeout: 8000 }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', e => resolve({ status: 0, body: e.message }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 0, body: 'TIMEOUT' }); });
  });
}

// ─── Known SKIP patterns ──────────────────────────────────────────────────────
const SKIP = [/\/health/i, /\/actuator/i, /\/metrics/i];
function shouldSkip(p) { return SKIP.some(rx => rx.test(p)); }

// ─── 1. Source-code enumeration ───────────────────────────────────────────────
function scanSource(root) {
  const routes = [];
  const METHOD_RX = /app\.(get|post|put|patch|delete|head)\(['"`]([^'"`]+)['"`]/gi;
  const ROUTER_RX = /router\.(get|post|put|patch|delete|head)\(['"`]([^'"`]+)['"`]/gi;
  const PREFIX_RX = /app\.use\(['"`]([^'"`]+)['"`]/gi;

  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (['node_modules','.git','automated_test'].includes(entry.name)) continue;
        walk(full);
      } else if (entry.isFile() && /\.(js|ts|mjs|cjs)$/.test(entry.name)) {
        const src = fs.readFileSync(full, 'utf8');
        for (const rx of [METHOD_RX, ROUTER_RX]) {
          let m;
          while ((m = rx.exec(src)) !== null) {
            const method = m[1].toUpperCase();
            const route  = m[2];
            if (!shouldSkip(route)) routes.push({ method, path: route, source: entry.name });
          }
        }
      }
    }
  }

  walk(root);
  return routes;
}

// ─── 2. Live Swagger/OpenAPI probing ─────────────────────────────────────────
async function probeSwagger() {
  const candidates = [
    '/v3/api-docs', '/swagger.json', '/api-docs',
    '/openapi.json', '/api/swagger.json', '/docs/openapi.json',
  ];
  for (const p of candidates) {
    const r = await get(BASE_URL + p);
    if (r.status === 200) {
      try {
        const spec = JSON.parse(r.body);
        const routes = [];
        const paths  = spec.paths || {};
        for (const [route, methods] of Object.entries(paths)) {
          for (const method of Object.keys(methods)) {
            if (['get','post','put','patch','delete','head','options'].includes(method)) {
              if (!shouldSkip(route)) {
                routes.push({ method: method.toUpperCase(), path: route, source: 'swagger' });
              }
            }
          }
        }
        console.log(`✓  Swagger found at ${p} → ${routes.length} routes`);
        return routes;
      } catch { /* not valid JSON */ }
    }
  }
  console.log('⚠  No Swagger/OpenAPI spec found live — using source scan only');
  return [];
}

// ─── 3. Auth annotation inference ─────────────────────────────────────────────
// Heuristics: paths with /admin → role-restricted(admin)
//             paths with /auth, /login, /register → public
//             everything else → requires-auth (assume protected)
function inferAccess(method, p) {
  if (/\/admin/i.test(p))                    return 'role-restricted(admin)';
  if (/\/(auth|login|register|signup)/i.test(p)) return 'public';
  if (/\/(public|docs|swagger)/i.test(p))    return 'public';
  return 'requires-auth';
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🔍  Discovering endpoints for ${BASE_URL}\n`);

  // Source scan
  const backendRoot = path.join(__dirname, '..');
  const fromSource  = scanSource(backendRoot);
  console.log(`📁  Source scan → ${fromSource.length} routes`);

  // Swagger
  const fromSwagger = await probeSwagger();

  // Merge & dedupe
  const seen = new Set();
  const all  = [...fromSource, ...fromSwagger].filter(r => {
    const key = `${r.method}:${r.path}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).map(r => ({
    method       : r.method,
    path         : r.path,
    full_url     : BASE_URL + r.path,
    access       : inferAccess(r.method, r.path),
    source       : r.source,
    has_id_param : /:[a-zA-Z]*[Ii]d|\/\{[^}]+\}|\?.*[Ii]d=/.test(r.path),
  }));

  console.log(`\n${'─'.repeat(70)}`);
  console.log(`  DISCOVERED ENDPOINTS (${all.length} total, /health excluded)`);
  console.log(`${'─'.repeat(70)}`);
  if (all.length === 0) {
    console.log('  (none — backend has no non-health routes yet)');
  } else {
    all.forEach((e, i) =>
      console.log(`  ${String(i+1).padStart(3)}.  ${e.method.padEnd(7)} ${e.path.padEnd(40)} [${e.access}]`)
    );
  }
  console.log(`${'─'.repeat(70)}\n`);

  // Write savepoint
  const out = path.join(__dirname, 'endpoints.json');
  fs.writeFileSync(out, JSON.stringify(all, null, 2));
  console.log(`💾  Saved to ${out}`);

  if (all.length === 0) {
    console.log('\n⚠  No testable endpoints found. Add routes to your backend first,');
    console.log('   then re-run: node automated_test/discover.js\n');
  } else {
    console.log('\n✅  Review the list above, then run: node automated_test/runner.js\n');
  }
}

main().catch(console.error);
