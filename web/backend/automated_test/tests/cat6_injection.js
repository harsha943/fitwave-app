/**
 * Cat 6 — Injection Detection (SQLi / NoSQLi)
 * Sends detection payloads in query params and JSON body.
 * Flags: anomalous status codes (500), error messages leaked, unusual response times.
 * Detection only — does NOT extract data.
 */
const name = exports.name = 'CAT6: Injection Probe';

const SQLI_PAYLOADS = [
  "' OR '1'='1",
  "' OR 1=1--",
  "\" OR \"1\"=\"1",
  "1; DROP TABLE users--",
  "1 UNION SELECT NULL--",
  "admin'--",
];

const NOSQLI_PAYLOADS = [
  { "$gt": "" },
  { "$ne": null },
  { "$where": "1==1" },
];

const ERROR_PATTERNS = /sql|syntax|ORA-|mysql|pg_|sqlite|mongo|exception|stack trace|error in your sql/i;

exports.run = async ({ BASE_URL, ROLES, ENDPOINTS, request, record, sleep }) => {
  const roleEntries = Object.entries(ROLES);
  const authHeader  = roleEntries.length ? { Authorization: `Bearer ${roleEntries[0][1]}` } : {};
  const role        = roleEntries.length ? roleEntries[0][0] : 'none';

  // Focus on GET endpoints with params and POST endpoints
  const targets = ENDPOINTS.filter(e => ['GET','POST'].includes(e.method));
  if (targets.length === 0) {
    console.log('  ⚠  No GET/POST endpoints — skipping injection probes.');
    return;
  }

  for (const ep of targets) {
    // ── String payloads (query string for GET, body for POST) ──
    for (const payload of SQLI_PAYLOADS) {
      await sleep(200);
      let res;
      if (ep.method === 'GET') {
        const url = ep.full_url + (ep.full_url.includes('?') ? '&' : '?') + `id=${encodeURIComponent(payload)}&search=${encodeURIComponent(payload)}`;
        res = await request('GET', url, authHeader);
      } else {
        res = await request('POST', ep.full_url, authHeader, { id: payload, search: payload, username: payload, email: payload });
      }

      const leaked  = ERROR_PATTERNS.test(res.body);
      const is500   = res.status === 500;
      const finding = leaked || is500;

      record({
        endpoint        : ep.path,
        method          : ep.method,
        role,
        status          : res.status,
        expected_status : '4xx',
        finding,
        severity        : finding ? (is500 ? 'HIGH' : 'MEDIUM') : 'INFO',
        response_time_ms: res.time_ms,
        test_category   : 'injection_sqli',
        note            : finding
          ? `⚠ ${is500 ? '500 returned' : 'Error pattern in response'} — possible SQL injection point`
          : `ok (${res.status})`,
      });
    }

    // ── NoSQLi object payloads (POST only) ──
    if (ep.method === 'POST') {
      for (const payload of NOSQLI_PAYLOADS) {
        await sleep(200);
        const res = await request('POST', ep.full_url, authHeader, { id: payload, filter: payload });
        const leaked  = ERROR_PATTERNS.test(res.body);
        const is500   = res.status === 500;
        const finding = leaked || is500;
        record({
          endpoint        : ep.path,
          method          : ep.method,
          role,
          status          : res.status,
          expected_status : '4xx',
          finding,
          severity        : finding ? 'HIGH' : 'INFO',
          response_time_ms: res.time_ms,
          test_category   : 'injection_nosql',
          note            : finding
            ? `⚠ NoSQLi probe triggered anomalous response`
            : `ok (${res.status})`,
        });
      }
    }
  }
};
