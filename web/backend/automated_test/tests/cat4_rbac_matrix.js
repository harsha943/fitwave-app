/**
 * Cat 4 — RBAC Matrix
 * Cross-product: every role × every endpoint.
 * Records actual vs expected HTTP status.
 */
const name = exports.name = 'CAT4: RBAC Matrix';

const EXPECTED = {
  'public'              : [200, 201, 204, 400, 404, 405],  // any non-auth error is ok
  'requires-auth'       : { valid: [200,201,204,400,404,405], invalid: [401,403] },
  'role-restricted(admin)': { admin: [200,201,204,400,404,405], other: [403] },
};

exports.run = async ({ BASE_URL, ROLES, ENDPOINTS, request, record, sleep }) => {
  const roleEntries = Object.entries(ROLES);

  // Also test unauthenticated
  const allActors = [['none', null], ...roleEntries];

  for (const ep of ENDPOINTS) {
    for (const [role, token] of allActors) {
      await sleep(150);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await request(ep.method, ep.full_url, headers);

      let expected_status, finding, severity;

      if (ep.access === 'public') {
        expected_status = '2xx/4xx';
        finding = false;
        severity = 'INFO';
      } else if (ep.access === 'requires-auth') {
        if (role === 'none') {
          expected_status = 401;
          finding = res.status >= 200 && res.status < 300;
          severity = finding ? 'CRITICAL' : 'INFO';
        } else {
          expected_status = '2xx';
          finding = false;
          severity = 'INFO';
        }
      } else if (ep.access === 'role-restricted(admin)') {
        if (role === 'admin') {
          expected_status = '2xx';
          finding = false;
          severity = 'INFO';
        } else {
          expected_status = 403;
          finding = res.status >= 200 && res.status < 300;
          severity = finding ? 'CRITICAL' : 'INFO';
        }
      }

      record({
        endpoint        : ep.path,
        method          : ep.method,
        role,
        status          : res.status,
        expected_status,
        finding,
        severity,
        response_time_ms: res.time_ms,
        test_category   : 'rbac_matrix',
        note            : finding
          ? `⚠ role='${role}' got ${res.status} on ${ep.access} endpoint`
          : `ok (${res.status})`,
      });
    }
  }
};
