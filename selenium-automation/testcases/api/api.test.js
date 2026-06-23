const { assert } = require('console');
const { saveResult } = require('../testHelper');
const testData = require('../../testdata/testdata.json');
const logger = require('../../utilities/logger');
const config = require('../../config/config');

describe('API Testing Module', function() {
  const apiTests = testData.filter(tc => tc.module === 'API Testing');

  apiTests.forEach(tc => {
    it(`${tc.id}: ${tc.scenario}`, async function() {
      const startTime = Date.now();
      let status = 'PASS';
      let actual = tc.expected;
      
      try {
        logger.info(`Starting API Test: ${tc.id} - ${tc.scenario}`);
        
        // Extract parameters from test case data
        const data = tc.data || {};
        const method = data.method || 'GET';
        const apiPath = data.path;
        const body = data.body;
        const expectStatus = data.expectStatus;
        const expectBodyContains = data.expectBodyContains;
        const expectContentType = data.expectContentType;
        const expectMaxLatencyMs = data.expectMaxLatencyMs;
        const expectRedirect = data.expectRedirect;
        const expectRedirectTo = data.expectRedirectTo;
        
        // 1. Handle Reset sequence/state
        if (apiPath === '/api/reset' || data.checkWorkoutsAfter !== undefined || data.doubleCall || data.verifyNoSessionCrash) {
          const url = `${config.baseUrl}/api/reset`;
          const res = await fetch(url);
          const text = await res.text();
          
          if (data.doubleCall) {
            const res2 = await fetch(url);
            if (res2.status !== 200) {
              throw new Error(`Second reset call failed with status: ${res2.status}`);
            }
          }
          if (data.checkWorkoutsAfter !== undefined) {
            // Check dashboard workouts count
            const dashRes = await fetch(`${config.baseUrl}/dashboard`);
            const dashText = await dashRes.text();
            // Count occurrences of class="workout-row" or "WK-"
            const count = (dashText.match(/class="workout-row"/g) || []).length;
            if (count !== data.checkWorkoutsAfter) {
              throw new Error(`Expected ${data.checkWorkoutsAfter} workouts but found ${count}`);
            }
          }
          if (expectStatus && res.status !== expectStatus) {
            throw new Error(`Expected status ${expectStatus} but got ${res.status}`);
          }
          if (expectBodyContains && !text.includes(expectBodyContains)) {
            throw new Error(`Expected reset body to contain "${expectBodyContains}"`);
          }
          if (expectContentType && !res.headers.get('content-type').includes(expectContentType)) {
            throw new Error(`Expected content-type to contain "${expectContentType}"`);
          }
          actual = `State reset executed successfully: ${text}`;
          
        }
        // 2. Handle login endpoints
        else if (apiPath === '/login' && method === 'POST') {
          const url = `${config.baseUrl}/login`;
          const options = {
            method: 'POST',
            redirect: 'manual' // Do not follow redirect so we check 302
          };
          
          if (body) {
            options.headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
            const formBody = [];
            for (const property in body) {
              const encodedKey = encodeURIComponent(property);
              const encodedValue = encodeURIComponent(body[property]);
              formBody.push(encodedKey + "=" + encodedValue);
            }
            options.body = formBody.join("&");
          }
          
          if (data.contentType === 'application/json') {
            options.headers = { 'Content-Type': 'application/json' };
            options.body = JSON.stringify(body);
          }
          
          if (data.noContentType) {
            options.headers = {};
            options.body = body; // Raw string
          }
          
          const res = await fetch(url, options);
          const text = await res.text();
          
          if (expectStatus) {
            const expectedArray = Array.isArray(expectStatus) ? expectStatus : [expectStatus];
            if (!expectedArray.includes(res.status)) {
              throw new Error(`Expected HTTP status ${expectStatus} but got ${res.status}`);
            }
          }
          if (expectRedirect && res.headers.get('location') !== expectRedirect) {
            throw new Error(`Expected redirect location "${expectRedirect}" but got "${res.headers.get('location')}"`);
          }
          if (expectBodyContains && !text.includes(expectBodyContains)) {
            throw new Error(`Expected response body to contain "${expectBodyContains}"`);
          }
          actual = `POST /login completed with status ${res.status}`;
        }
        // 3. Handle registration endpoints
        else if (apiPath === '/register' && method === 'POST') {
          const url = `${config.baseUrl}/register`;
          const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
          };
          if (body) {
            const formBody = [];
            for (const property in body) {
              const encodedKey = encodeURIComponent(property);
              const encodedValue = encodeURIComponent(body[property]);
              formBody.push(encodedKey + "=" + encodedValue);
            }
            options.body = formBody.join("&");
          }
          const res = await fetch(url, options);
          const text = await res.text();
          
          if (expectStatus) {
            const expectedArray = Array.isArray(expectStatus) ? expectStatus : [expectStatus];
            if (!expectedArray.includes(res.status)) {
              throw new Error(`Expected HTTP status ${expectStatus} but got ${res.status}`);
            }
          }
          if (expectBodyContains && !text.includes(expectBodyContains)) {
            throw new Error(`Expected registration response body to contain "${expectBodyContains}"`);
          }
          actual = `POST /register completed with status ${res.status}`;
        }
        // 4. Handle notification actions
        else if (apiPath && apiPath.includes('/api/notifications')) {
          const url = `${config.baseUrl}${apiPath}`;
          const options = { method: 'POST' };
          const res = await fetch(url, options);
          const json = await res.json();
          
          if (expectStatus && res.status !== expectStatus) {
            throw new Error(`Expected status ${expectStatus} but got ${res.status}`);
          }
          if (data.expectJson && !json.success) {
            throw new Error(`Expected JSON success field but got: ${JSON.stringify(json)}`);
          }
          if (data.verifyZeroBadge) {
            const dashRes = await fetch(`${config.baseUrl}/dashboard`);
            const dashText = await dashRes.text();
            if (dashText.includes('id="notifBadge" style="background:var(--danger); color:white; border-radius:50%; padding: 2px 6px; font-size:11px; margin-left:4px; display:inline;"')) {
              throw new Error('Notification badge was expected to be hidden but was visible');
            }
          }
          actual = `Notifications API processed successfully: ${JSON.stringify(json)}`;
        }
        // 5. Handle workout CRUD actions
        else if (apiPath && apiPath.startsWith('/workout')) {
          const url = `${config.baseUrl}${apiPath}`;
          const options = {
            method,
            redirect: 'manual'
          };
          if (body) {
            options.headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
            const formBody = [];
            for (const property in body) {
              const encodedKey = encodeURIComponent(property);
              const encodedValue = encodeURIComponent(body[property]);
              formBody.push(encodedKey + "=" + encodedValue);
            }
            options.body = formBody.join("&");
          }
          const res = await fetch(url, options);
          const text = await res.text();
          
          if (expectStatus) {
            const expectedArray = Array.isArray(expectStatus) ? expectStatus : [expectStatus];
            if (!expectedArray.includes(res.status)) {
              throw new Error(`Expected HTTP status ${expectStatus} but got ${res.status}`);
            }
          }
          if (expectBodyContains && !text.includes(expectBodyContains)) {
            throw new Error(`Expected response to contain "${expectBodyContains}"`);
          }
          if (data.verifyInDashboard && body && body.name) {
            const dashRes = await fetch(`${config.baseUrl}/dashboard`);
            const dashText = await dashRes.text();
            if (!dashText.includes(body.name)) {
              throw new Error(`Workout name "${body.name}" not found in dashboard`);
            }
          }
          actual = `Workout action ${method} ${apiPath} completed with status ${res.status}`;
        }
        // 6. Handle profile & settings
        else if (apiPath && (apiPath.startsWith('/profile') || apiPath.startsWith('/settings'))) {
          const url = `${config.baseUrl}${apiPath}`;
          const options = {
            method,
            redirect: 'manual'
          };
          if (body) {
            options.headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
            const formBody = [];
            for (const property in body) {
              const encodedKey = encodeURIComponent(property);
              const encodedValue = encodeURIComponent(body[property]);
              formBody.push(encodedKey + "=" + encodedValue);
            }
            options.body = formBody.join("&");
          }
          const res = await fetch(url, options);
          const text = await res.text();
          
          if (expectStatus && res.status !== expectStatus) {
            throw new Error(`Expected status ${expectStatus} but got ${res.status}`);
          }
          if (expectBodyContains && !text.includes(expectBodyContains)) {
            throw new Error(`Expected response body to contain "${expectBodyContains}"`);
          }
          actual = `Profile/Settings action ${method} ${apiPath} completed with status ${res.status}`;
        }
        // 7. Handle file management
        else if (apiPath && (apiPath.startsWith('/download') || apiPath.startsWith('/upload'))) {
          const url = `${config.baseUrl}${apiPath}`;
          
          if (apiPath.startsWith('/download')) {
            const res = await fetch(url);
            
            if (expectStatus && res.status !== expectStatus) {
              throw new Error(`Expected status ${expectStatus} but got ${res.status}`);
            }
            if (data.expectHeader && !res.headers.has(data.expectHeader)) {
              throw new Error(`Expected header "${data.expectHeader}" was missing`);
            }
            if (expectContentType && !res.headers.get('content-type').includes(expectContentType)) {
              throw new Error(`Expected content-type "${expectContentType}" but got "${res.headers.get('content-type')}"`);
            }
            if (data.expectValidJson) {
              const json = await res.json();
              if (!Array.isArray(json)) {
                throw new Error('Expected JSON backup body to be an array');
              }
              if (data.afterReset && json.length !== 3) {
                throw new Error(`Expected backup to contain 3 workouts but got ${json.length}`);
              }
            }
          } else {
            // POST /upload
            const options = {
              method: 'POST'
            };
            if (data.noFile) {
              options.body = new URLSearchParams();
            } else if (body) {
              options.body = new URLSearchParams(body);
            }
            const res = await fetch(url, options);
            if (expectStatus) {
              const expectedArray = Array.isArray(expectStatus) ? expectStatus : [expectStatus];
              if (!expectedArray.includes(res.status)) {
                throw new Error(`Expected status ${expectStatus} but got ${res.status}`);
              }
            }
          }
          actual = `File management action completed successfully.`;
        }
        // 8. Handle general sequences
        else if (data.sequence) {
          // Perform sequential API requests
          for (const seqItem of data.sequence) {
            if (seqItem === 'GET /api/reset') {
              await fetch(`${config.baseUrl}/api/reset`);
            } else if (seqItem === 'GET /dashboard') {
              const dashRes = await fetch(`${config.baseUrl}/dashboard`);
              const dashText = await dashRes.text();
              
              if (data.verifyWorkoutCount !== undefined) {
                const count = (dashText.match(/class="workout-row"/g) || []).length;
                if (count !== data.verifyWorkoutCount) {
                  throw new Error(`Sequence verification failed: expected ${data.verifyWorkoutCount} workouts but found ${count}`);
                }
              }
              if (data.verifyBadgeHidden) {
                if (dashText.includes('id="notifBadge" style="background:var(--danger); color:white; border-radius:50%; padding: 2px 6px; font-size:11px; margin-left:4px; display:inline;"')) {
                  throw new Error('Sequence verification failed: notification badge is visible');
                }
              }
              if (data.verifyProfileName) {
                if (!dashText.includes(data.verifyProfileName)) {
                  throw new Error(`Sequence verification failed: profile name "${data.verifyProfileName}" not found in sidebar`);
                }
              }
            } else if (seqItem === 'POST /workout/create') {
              await fetch(`${config.baseUrl}/workout/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: 'name=Sequence+Workout&category=Cardio&duration=30'
              });
            } else if (seqItem === 'POST /workout/create x3') {
              for (let i = 0; i < 3; i++) {
                await fetch(`${config.baseUrl}/workout/create`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                  body: `name=Seq+Workout+${i}&category=Cardio&duration=30`
                });
              }
            } else if (seqItem === 'POST /workout/delete/1') {
              await fetch(`${config.baseUrl}/workout/delete/1`, { method: 'POST' });
            } else if (seqItem === 'POST /profile/update') {
              await fetch(`${config.baseUrl}/profile/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: 'name=API+Updated+Name&email=api_updated%40fitwave.com&phone=%2B15550100'
              });
            } else if (seqItem === 'POST /api/notifications/clear') {
              await fetch(`${config.baseUrl}/api/notifications/clear`, { method: 'POST' });
            } else if (seqItem === 'POST /api/notifications/read/1') {
              await fetch(`${config.baseUrl}/api/notifications/read/1`, { method: 'POST' });
            } else if (seqItem === 'POST /api/notifications/read/2') {
              await fetch(`${config.baseUrl}/api/notifications/read/2`, { method: 'POST' });
            } else if (seqItem === 'GET /download/backup') {
              const res = await fetch(`${config.baseUrl}/download/backup`);
              const json = await res.json();
              if (data.verifyJsonLength !== undefined && json.length !== data.verifyJsonLength) {
                throw new Error(`Sequence verification failed: expected backup list length ${data.verifyJsonLength} but got ${json.length}`);
              }
            } else if (seqItem === 'POST /login') {
              await fetch(`${config.baseUrl}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: 'username=admin%40fitwave.com&password=AdminPassword123!'
              });
            } else if (seqItem === 'GET /logout') {
              await fetch(`${config.baseUrl}/logout`);
            } else if (seqItem === 'POST /register') {
              await fetch(`${config.baseUrl}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: 'name=Seq+User&email=seq%40test.com&password=SeqPassword123!'
              });
            } else if (seqItem === 'POST /settings/save') {
              await fetch(`${config.baseUrl}/settings/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: 'theme=dark&emailAlerts=enabled&weeklySummary=yes'
              });
            } else if (seqItem === 'GET /settings') {
              const settingsRes = await fetch(`${config.baseUrl}/settings`);
              const settingsText = await settingsRes.text();
              if (data.verifySettingsSaved) {
                if (!settingsText.includes('value="dark" selected')) {
                  throw new Error('Sequence verification failed: saved settings theme is not dark');
                }
              }
            } else if (seqItem === 'POST /workout/edit/4') {
              await fetch(`${config.baseUrl}/workout/edit/4`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: 'name=Updated+Name+Seq&category=Cardio&duration=35'
              });
            }
          }
          actual = `Sequence [${data.sequence.join(' -> ')}] completed successfully.`;
        }
        // 9. Handle general GET requests (Fallback)
        else if (apiPath) {
          const url = `${config.baseUrl}${apiPath}`;
          const res = await fetch(url);
          const text = await res.text();
          
          if (expectStatus) {
            const expectedArray = Array.isArray(expectStatus) ? expectStatus : [expectStatus];
            if (!expectedArray.includes(res.status)) {
              throw new Error(`Expected HTTP status ${expectStatus} but got ${res.status}`);
            }
          }
          if (expectBodyContains && !text.includes(expectBodyContains)) {
            throw new Error(`Expected response body to contain "${expectBodyContains}"`);
          }
          actual = `GET ${apiPath} completed with status ${res.status}`;
        }
        
        // Check latency if requested
        if (expectMaxLatencyMs) {
          const latency = Date.now() - startTime;
          if (latency > expectMaxLatencyMs) {
            throw new Error(`Latency of ${latency}ms exceeded maximum threshold of ${expectMaxLatencyMs}ms`);
          }
        }
      } catch (err) {
        status = 'FAIL';
        actual = err.message;
        throw err;
      } finally {
        const duration = Date.now() - startTime;
        saveResult({
          id: tc.id,
          module: tc.module,
          scenario: tc.scenario,
          expected: tc.expected,
          actual,
          status,
          duration,
          severity: tc.severity,
          screenshotPath: null
        });
      }
    });
  });
});
