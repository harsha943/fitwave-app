const LoginPage = require('../../pages/LoginPage');
const DashboardPage = require('../../pages/DashboardPage');
const { buildDriver, saveResult } = require('../testHelper');
const testData = require('../../testdata/testdata.json');
const logger = require('../../utilities/logger');

describe('Filters Module Tests', function() {
  this.retries(1);
  let driver;
  let dashboardPage;
  const filterTests = testData.filter(tc => tc.module === 'Filters');

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

  filterTests.forEach(tc => {
    it(`${tc.id}: ${tc.scenario}`, async function() {
      const startTime = Date.now();
      let status = 'PASS';
      let actual = 'Dropdown category filter selected and workouts narrowed successfully.';
      let screenshotPath = null;

      try {
        logger.info(`Starting execution for filter test: ${tc.id}`);
        
        // Select category dropdown option
        await dashboardPage.filterByCategory(tc.data.category);
        
        // Read table contents
        const rows = await dashboardPage.findElements(dashboardPage.workoutRows);
        
        if (rows.length === 0) {
          const noMatchMsg = await dashboardPage.getText(dashboardPage.noWorkoutsMsg);
          if (!noMatchMsg.includes('match') && !noMatchMsg.includes('No workouts')) {
            throw new Error('Table is empty but no empty matching message displays.');
          }
          actual = `Filter for category "${tc.data.category}" yielded 0 rows; correct empty message verified.`;
        } else {
          // Check that all rows display the selected category
          for (let row of rows) {
            const rowText = await row.getText();
            if (!rowText.includes(tc.data.category)) {
              throw new Error(`Row contains category mismatch. Row context: "${rowText}" does not contain category: "${tc.data.category}"`);
            }
          }
          actual = `Filter for category "${tc.data.category}" returned ${rows.length} rows, all matching category.`;
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
