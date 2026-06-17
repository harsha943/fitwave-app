/**
 * Cat 8 — Hardcoded Credentials / Secrets Scanner
 * Static scan of the codebase for committed secrets.
 * Does NOT require a live server — run independently:  node automated_test/cat8_creds_scan.js
 * Writes: automated_test/cat8_findings.json
 */
const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT  = path.join(__dirname, 'cat8_findings.json');

// ─── Patterns to flag ─────────────────────────────────────────────────────────
const PATTERNS = [
  { name: 'JWT_SECRET',      rx: /jwt[_\-\s]*secret\s*[:=]\s*['"`]([^'"`\s]{6,})['"`]/i },
  { name: 'PASSWORD_LITERAL',rx: /password\s*[:=]\s*['"`]([^'"`\s]{4,})['"`]/i },
  { name: 'DB_URL',          rx: /mongodb(\+srv)?:\/\/[^'"`\s]+/i },
  { name: 'POSTGRES_URL',    rx: /postgresql?:\/\/[^'"`\s]+/i },
  { name: 'API_KEY',         rx: /api[_\-]?key\s*[:=]\s*['"`]([^'"`\s]{8,})['"`]/i },
  { name: 'SECRET_KEY',      rx: /secret[_\-]?key\s*[:=]\s*['"`]([^'"`\s]{6,})['"`]/i },
  { name: 'AWS_KEY',         rx: /AKIA[0-9A-Z]{16}/  },
  { name: 'AWS_SECRET',      rx: /aws[_\-]?secret[_\-]?access[_\-]?key\s*[:=]\s*['"`]([^'"`\s]{20,})['"`]/i },
  { name: 'PRIVATE_KEY_HDR', rx: /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
  { name: 'BEARER_TOKEN',    rx: /bearer\s+eyJ[a-zA-Z0-9_\-]{20,}\.[a-zA-Z0-9_\-]{20,}/i },
  { name: 'GITHUB_TOKEN',    rx: /ghp_[a-zA-Z0-9]{36}/ },
  { name: 'HARDCODED_ADMIN', rx: /admin\s*[:=]\s*['"`](true|yes|1)['"`]/i },
  { name: 'PROCESS_ENV_SKIP',rx: /process\.env\.\w+/,  skip: true }, // informational — these are fine
];

// ─── Skip paths ───────────────────────────────────────────────────────────────
const SKIP_DIRS  = new Set(['node_modules', '.git', 'automated_test', 'dist', 'build', '.next']);
const SKIP_FILES = new Set(['.env', '.env.example', 'package-lock.json', 'yarn.lock']);
const SKIP_EXTS  = new Set(['.png','.jpg','.jpeg','.gif','.svg','.ico','.woff','.woff2','.ttf','.eot','.map','.min.js']);

// ─── Walk & scan ──────────────────────────────────────────────────────────────
const findings = [];
let filesScanned = 0;

function scan(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      scan(full);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (SKIP_EXTS.has(ext)) continue;
      if (SKIP_FILES.has(entry.name)) continue;
      filesScanned++;
      const src = fs.readFileSync(full, 'utf8');
      const lines = src.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        for (const { name, rx, skip } of PATTERNS) {
          if (skip) continue;
          if (rx.test(line)) {
            findings.push({
              file    : path.relative(ROOT, full),
              line    : i + 1,
              rule    : name,
              snippet : line.trim().slice(0, 120),
              severity: ['JWT_SECRET','PASSWORD_LITERAL','DB_URL','POSTGRES_URL','AWS_KEY','AWS_SECRET','PRIVATE_KEY_HDR'].includes(name) ? 'HIGH' : 'MEDIUM',
            });
          }
        }
      }
    }
  }
}

console.log('\n🔍  Scanning codebase for hardcoded secrets...\n');
scan(ROOT);
fs.writeFileSync(OUT, JSON.stringify(findings, null, 2));

console.log(`📁  Files scanned : ${filesScanned}`);
console.log(`⚠   Findings      : ${findings.length}`);
if (findings.length === 0) {
  console.log('✓  No hardcoded secrets detected.\n');
} else {
  console.log('\n' + '─'.repeat(70));
  for (const f of findings) {
    console.log(`  [${f.severity}] ${f.rule}`);
    console.log(`         File   : ${f.file}:${f.line}`);
    console.log(`         Snippet: ${f.snippet}`);
    console.log();
  }
}
console.log(`\n💾  Results saved to ${OUT}\n`);
