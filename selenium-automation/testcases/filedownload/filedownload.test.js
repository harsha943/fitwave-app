const LoginPage = require('../../pages/LoginPage');
const DashboardPage = require('../../pages/DashboardPage');
const { buildDriver, saveResult } = require('../testHelper');
const testData = require('../../testdata/testdata.json');
const logger = require('../../utilities/logger');

describe('File Download Module Tests', function() {
  this.retries(1);
  let driver;
  let dashboardPage;
  const downloadTests = testData.filter(tc => tc.module === 'File Download');

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

  downloadTests.forEach(tc => {
    it(`${tc.id}: ${tc.scenario}`, async function() {
      const startTime = Date.now();
      let status = 'PASS';
      let actual = 'Download link validated and returned valid file attachment headers.';
      let screenshotPath = null;

      try {
        logger.info(`Starting execution for download test: ${tc.id}`);
        
        const isBackup = tc.data.isBackup;
        const selector = isBackup ? dashboardPage.btnDownloadBackup : dashboardPage.btnDownloadReport;
        
        // Find element and get its href attribute
        const element = await dashboardPage.findElement(selector);
        const href = await element.getAttribute('href');
        
        if (!href) {
          throw new Error('Download link is missing href attribute');
        }

        // Navigate to download URL to verify it executes without error page
        await driver.get(href);
        const pageSource = await driver.getPageSource();
        
        // Ensure no express errors or server crash displays
        if (pageSource.toLowerCase().includes('internal server error') || pageSource.toLowerCase().includes('cannot get')) {
          throw new Error(`Download request failed. Server error content: ${pageSource}`);
        }

        actual = `Successfully validated download link href: "${href}". Endpoint responded correctly without errors.`;
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
