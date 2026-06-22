/**
 * Cat 2 — Authorization / Privilege Escalation
 * Calls admin/higher-priv endpoints using lower-privilege role tokens.
 * Finding: 2xx when a lower-priv role accesses a higher-priv endpoint.
 */
const name = exports.name = 'CAT2: AuthZ / Privesc';

exports.run = async ({ BASE_URL, ROLES, ENDPOINTS, request, record, sleep }) => {
  const adminEndpoints = ENDPOINTS.filter(e => e.access === 'role-restricted(admin)');
  if (adminEndpoints.length === 0) {
    console.log('  ⚠  No admin-only endpoints found — skipping privesc tests.');
    return;
  }

  const lowerRoles = Object.entries(ROLES).filter(([role]) => role !== 'admin');
  if (lowerRoles.length === 0) {
    console.log('  ⚠  No non-admin role tokens provided — skipping privesc tests.');
    return;
  }

  for (const ep of adminEndpoints) {
    for (const [role, token] of lowerRoles) {
      await sleep(150);
      const res = await request(ep.method, ep.full_url, { Authorization: `Bearer ${token}` });
      const is2xx = res.status >= 200 && res.status < 300;
      record({
        endpoint        : ep.path,
        method          : ep.method,
        role,
        status          : res.status,
        expected_status : 403,
        finding         : is2xx,
        severity        : is2xx ? 'CRITICAL' : 'INFO',
        response_time_ms: res.time_ms,
        test_category   : 'authz_privesc',
        note            : is2xx
          ? `⚠ Lower-priv role '${role}' accessed admin endpoint → PRIVILEGE ESCALATION`
          : `ok (${res.status})`,
      });
    }
  }
};
