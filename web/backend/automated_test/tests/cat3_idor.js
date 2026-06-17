/**
 * Cat 3 — IDOR (Insecure Direct Object Reference)
 * For endpoints with ID parameters, swap IDs to cross-user access.
 * Finding: 2xx when accessing another user's resource.
 */
const name = exports.name = 'CAT3: IDOR';

exports.run = async ({ BASE_URL, ROLES, ENDPOINTS, request, record, sleep }) => {
  const idEndpoints = ENDPOINTS.filter(e => e.has_id_param);
  if (idEndpoints.length === 0) {
    console.log('  ⚠  No ID-parameterised endpoints found — skipping IDOR tests.');
    return;
  }

  // Try a range of IDs including 0, 1, 2, 9999 — production IDs will be different from test users'
  const PROBE_IDS = ['0', '1', '2', '100', '9999', '-1', 'null', 'undefined', '00000000-0000-0000-0000-000000000001'];

  const roleEntries = Object.entries(ROLES);
  if (roleEntries.length === 0) {
    console.log('  ⚠  No role tokens — skipping IDOR tests.');
    return;
  }

  for (const ep of idEndpoints) {
    for (const probeId of PROBE_IDS) {
      // Replace :id / :userId / {id} patterns with probe value
      const probePath = ep.path
        .replace(/:([a-zA-Z]*[Ii]d)/g, probeId)
        .replace(/\{[^}]+\}/g, probeId);
      const probeUrl = BASE_URL + probePath;

      for (const [role, token] of roleEntries) {
        await sleep(150);
        const res = await request(ep.method, probeUrl, { Authorization: `Bearer ${token}` });
        // 200 with a different user's data is the finding — we flag 200s on probe IDs ≥2
        const suspicious = res.status === 200 && !['0','-1','null','undefined'].includes(probeId);
        record({
          endpoint        : ep.path,
          method          : ep.method,
          role,
          status          : res.status,
          expected_status : 403,
          finding         : suspicious,
          severity        : suspicious ? 'HIGH' : 'INFO',
          response_time_ms: res.time_ms,
          test_category   : 'idor',
          note            : suspicious
            ? `⚠ Role '${role}' received 200 for id=${probeId} — possible IDOR (verify data ownership)`
            : `ok (${res.status}) id=${probeId}`,
        });
      }
    }
  }
};
