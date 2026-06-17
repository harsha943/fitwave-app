const LoginPage = require('../../pages/LoginPage');
const DashboardPage = require('../../pages/DashboardPage');
const { buildDriver, saveResult } = require('../testHelper');
const testData = require('../../testdata/testdata.json');
const logger = require('../../utilities/logger');

describe('Logout Module Tests', function() {
  this.retries(1);
  let driver;
  let dashboardPage;
  const logoutTests = testData.filter(tc => tc.module === 'Logout');

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

  logoutTests.forEach(tc => {
    it(`${tc.id}: ${tc.scenario}`, async function() {
      const startTime = Date.now();
      let status = 'PASS';
      let actual = 'User logged out and returned to clean session.';
      let screenshotPath = null;

      try {
        logger.info(`Starting execution for logout test: ${tc.id}`);
        
        // Trigger logout action
        await dashboardPage.logout();
        
        // Verify current URL and text
        const currentUrl = await driver.getCurrentUrl();
        if (!currentUrl.includes('/logout')) {
          throw new Error(`Expected redirection to /logout, but got URL: ${currentUrl}`);
        }
        
        const logoutMsg = await dashboardPage.getText('#logoutMsg');
        if (!logoutMsg.includes('Signed Out') && !logoutMsg.includes('Out')) {
          throw new Error(`Logout message missing or incorrect: "${logoutMsg}"`);
        }

        // Click Sign In Again
        await dashboardPage.click('#btnLogoutBackBtn');
        const loginUrl = await driver.getCurrentUrl();
        if (!loginUrl.includes('/login')) {
          throw new Error(`Expected redirect to /login, but got URL: ${loginUrl}`);
        }

        actual = 'Logout redirected to /logout card and back to /login safely.';
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
