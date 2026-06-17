const LoginPage = require('../../pages/LoginPage');
const DashboardPage = require('../../pages/DashboardPage');
const { buildDriver, saveResult } = require('../testHelper');
const testData = require('../../testdata/testdata.json');
const logger = require('../../utilities/logger');

describe('Search Module Tests', function() {
  this.retries(1);
  let driver;
  let dashboardPage;
  const searchTests = testData.filter(tc => tc.module === 'Search');

  beforeEach(async function() {
    driver = await buildDriver();
    dashboardPage = new DashboardPage(driver);
    
    // Log in and go to dashboard
    const loginPage = new LoginPage(driver);
    await loginPage.navigate('/login');
    await loginPage.login('admin@fitwave.com', 'AdminPassword123!');
  });

  afterEach(async function() {
    if (driver) {
      await driver.quit();
    }
  });

  searchTests.forEach(tc => {
    it(`${tc.id}: ${tc.scenario}`, async function() {
      const startTime = Date.now();
      let status = 'PASS';
      let actual = 'Search query executed and results filtered properly.';
      let screenshotPath = null;

      try {
        logger.info(`Starting execution for search test: ${tc.id}`);
        
        // Run search query
        await dashboardPage.searchWorkout(tc.data.query);
        
        // Count records and verify
        const rows = await dashboardPage.findElements(dashboardPage.workoutRows);
        
        if (rows.length === 0) {
          const noMatchMsg = await dashboardPage.getText(dashboardPage.noWorkoutsMsg);
          if (!noMatchMsg.includes('match') && !noMatchMsg.includes('No workouts')) {
            throw new Error('Table is empty but no empty matching message displays.');
          }
          actual = `Search for "${tc.data.query}" yielded 0 results, displaying correct empty state text.`;
        } else {
          // Check that all row items contain the search term
          for (let row of rows) {
            const rowText = await row.getText();
            const lowerQuery = tc.data.query.toLowerCase();
            if (!rowText.toLowerCase().includes(lowerQuery)) {
              throw new Error(`Row contains text mismatch. Text: "${rowText}" does not contain query: "${tc.data.query}"`);
            }
          }
          actual = `Search for "${tc.data.query}" returned ${rows.length} rows, all matching the keyword criteria.`;
        }
      } catch (err) {
        status = 'FAIL';
        actual = err.message;
        if (driver) {
          screenshotPath = await dashboardPage.takeScreenshot(tc.id);
        }
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
          screenshotPath
        });
      }
    });
  });
});
