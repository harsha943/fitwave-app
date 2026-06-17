/**
 * Cat 5 — JWT Token Tampering
 * Takes a valid JWT, modifies claims (role/sub) in the payload WITHOUT re-signing.
 * Server MUST reject with 401. 2xx = finding (server not verifying signature).
 */
const name = exports.name = 'CAT5: Token Tampering';

function tamperJwt(token, patchFn) {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    patchFn(payload);
    const newPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    // Keep original header + original signature — this is the tampered token
    return `${parts[0]}.${newPayload}.${parts[2]}`;
  } catch { return null; }
}

exports.run = async ({ BASE_URL, ROLES, ENDPOINTS, request, record, sleep }) => {
  const roleEntries = Object.entries(ROLES);
  if (roleEntries.length === 0) {
    console.log('  ⚠  No tokens provided — skipping token tampering tests.');
    return;
  }

  const protected_ = ENDPOINTS.filter(e => e.access !== 'public');
  if (protected_.length === 0) {
    console.log('  ⚠  No protected endpoints — skipping token tampering tests.');
    return;
  }

  const tamperCases = [
    { label: 'role→admin',  patch: p => { p.role = 'admin'; p.roles = ['admin']; } },
    { label: 'sub→1',       patch: p => { p.sub = '1'; p.userId = 1; p.id = 1; } },
    { label: 'exp→farFuture',patch: p => { p.exp = 9999999999; } },
    { label: 'alg:none',    patch: p => { /* header will still say HS256 */ p.admin = true; } },
  ];

  // Pick one representative endpoint per access level
  const sample = protected_.slice(0, 3);

  for (const [role, token] of roleEntries) {
    for (const tc of tamperCases) {
      const tampered = tamperJwt(token, tc.patch);
      if (!tampered) { console.log(`  ⚠  Could not tamper token for role=${role}`); continue; }

      for (const ep of sample) {
        await sleep(150);
        const res = await request(ep.method, ep.full_url, { Authorization: `Bearer ${tampered}` });
        const is2xx = res.status >= 200 && res.status < 300;
        record({
          endpoint        : ep.path,
          method          : ep.method,
          role            : `${role}+tamper:${tc.label}`,
          status          : res.status,
          expected_status : 401,
          finding         : is2xx,
          severity        : is2xx ? 'CRITICAL' : 'INFO',
          response_time_ms: res.time_ms,
          test_category   : 'token_tampering',
          note            : is2xx
            ? `⚠ Tampered token accepted (${tc.label}) — signature NOT verified`
            : `ok (${res.status})`,
        });
      }
    }
  }
};
