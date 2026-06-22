/**
 * Cat 7 — Rate Limiting
 * Sends a bounded burst of ~30 requests to confirm a rate limit exists.
 * Finding: no 429 received after 30 rapid requests.
 */
const name = exports.name = 'CAT7: Rate Limiting';

const BURST_SIZE = 30;

exports.run = async ({ BASE_URL, ROLES, ENDPOINTS, request, record, sleep }) => {
  // Test both public (login endpoint most important) and one protected endpoint
  const candidates = [
    ...ENDPOINTS.filter(e => /login|register|auth|signup/i.test(e.path)),
    ...ENDPOINTS.filter(e => e.access !== 'public').slice(0, 2),
  ].slice(0, 3); // cap at 3 targets total

  if (candidates.length === 0 && ENDPOINTS.length > 0) candidates.push(ENDPOINTS[0]);
  if (candidates.length === 0) {
    console.log('  ⚠  No endpoints to rate-limit test.');
    return;
  }

  const roleEntries = Object.entries(ROLES);
  const authHeader  = roleEntries.length ? { Authorization: `Bearer ${roleEntries[0][1]}` } : {};
  const role        = roleEntries.length ? roleEntries[0][0] : 'none';

  for (const ep of candidates) {
    const statuses = [];
    let got429 = false;
    console.log(`  → Bursting ${BURST_SIZE} reqs to ${ep.method} ${ep.path} ...`);

    for (let i = 0; i < BURST_SIZE; i++) {
      // No sleep — intentional rapid burst
      const res = await request(ep.method, ep.full_url, authHeader);
      statuses.push(res.status);
      if (res.status === 429) { got429 = true; break; }
    }

    const finding = !got429;
    record({
      endpoint        : ep.path,
      method          : ep.method,
      role,
      status          : got429 ? 429 : statuses[statuses.length - 1],
      expected_status : 429,
      finding,
      severity        : finding ? 'MEDIUM' : 'INFO',
      response_time_ms: 0,
      test_category   : 'rate_limiting',
      note            : finding
        ? `⚠ No 429 after ${BURST_SIZE} rapid requests — rate limiting absent. Statuses: [${[...new Set(statuses)].join(',')}]`
        : `✓ Rate limit triggered at request #${statuses.length}`,
    });
  }
};
