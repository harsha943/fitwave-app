/**
 * Cat 1 — Authentication Bypass
 * Tests every protected endpoint with: (a) no token, (b) malformed token, (c) expired token
 * Finding: 2xx response when no valid auth is provided
 */
const name = exports.name = 'CAT1: AuthN Bypass';

exports.run = async ({ BASE_URL, ROLES, ENDPOINTS, request, record, sleep }) => {
  const EXPIRED_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
    'eyJzdWIiOiIxMjM0NTY3ODkwIiwicm9sZSI6InVzZXIiLCJpYXQiOjE1MTYyMzkwMjIsImV4cCI6MX0.' +
    'SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

  const testCases = [
    { label: 'no-token',       headers: {} },
    { label: 'malformed',      headers: { Authorization: 'Bearer INVALID.TOKEN.HERE' } },
    { label: 'expired',        headers: { Authorization: `Bearer ${EXPIRED_TOKEN}` } },
    { label: 'wrong-scheme',   headers: { Authorization: 'Basic dXNlcjpwYXNz' } },
  ];

  const protected_ = ENDPOINTS.filter(e => e.access !== 'public');
  if (protected_.length === 0) {
    console.log('  ⚠  No protected endpoints to test.');
    return;
  }

  for (const ep of protected_) {
    for (const tc of testCases) {
      await sleep(150);
      const res = await request(ep.method, ep.full_url, tc.headers);
      const is2xx = res.status >= 200 && res.status < 300;
      record({
        endpoint        : ep.path,
        method          : ep.method,
        role            : tc.label,
        status          : res.status,
        expected_status : 401,
        finding         : is2xx,
        severity        : is2xx ? 'CRITICAL' : 'INFO',
        response_time_ms: res.time_ms,
        test_category   : 'authn_bypass',
        note            : is2xx
          ? `⚠ Endpoint returned ${res.status} with ${tc.label} — AUTH NOT ENFORCED`
          : `ok (${res.status})`,
      });
    }
  }
};
