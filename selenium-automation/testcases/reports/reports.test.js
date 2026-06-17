const LoginPage = require('../../pages/LoginPage');
const DashboardPage = require('../../pages/DashboardPage');
const { buildDriver, saveResult } = require('../testHelper');
const testData = require('../../testdata/testdata.json');
const logger = require('../../utilities/logger');

describe('Reports Module Tests', function() {
  this.retries(1);
  let driver;
  let dashboardPage;
  const reportsTests = testData.filter(tc => tc.module === 'Reports');

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

  reportsTests.forEach(tc => {
    it(`${tc.id}: ${tc.scenario}`, async function() {
      const startTime = Date.now();
      let status = 'PASS';
      let actual = 'Reports buttons and downloads validated successfully.';
      let screenshotPath = null;

      try {
        logger.info(`Starting execution for reports test: ${tc.id}`);
        
        // Confirm download button presence
        const downloadReportExists = await dashboardPage.isDisplayed(dashboardPage.btnDownloadReport);
        if (!downloadReportExists) {
          throw new Error('Export Health Reports download button is not visible on screen');
        }
        
        actual = 'Verified dashboard reports section has active export download triggers.';
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
