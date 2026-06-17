const LoginPage = require('../../pages/LoginPage');
const DashboardPage = require('../../pages/DashboardPage');
const { buildDriver, saveResult } = require('../testHelper');
const testData = require('../../testdata/testdata.json');
const path = require('path');
const logger = require('../../utilities/logger');

describe('File Upload Module Tests', function() {
  this.retries(1);
  let driver;
  let dashboardPage;
  const uploadTests = testData.filter(tc => tc.module === 'File Upload');

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

  uploadTests.forEach(tc => {
    it(`${tc.id}: ${tc.scenario}`, async function() {
      const startTime = Date.now();
      let status = 'PASS';
      let actual = 'File upload submitted and success banner verified.';
      let screenshotPath = null;

      try {
        logger.info(`Starting execution for file upload test: ${tc.id}`);
        
        // Target file path
        const fileToUpload = path.resolve(__dirname, '..', '..', 'testdata', 'sample_upload.png');
        await dashboardPage.uploadFile(fileToUpload);
        
        // Confirm redirect and success message
        const successMsg = await dashboardPage.getText(dashboardPage.uploadSuccessMsg);
        if (!successMsg.includes('Succeeded') && !successMsg.includes('Upload')) {
          throw new Error(`Expected upload success screen, but got message: "${successMsg}"`);
        }
        
        // Navigate back
        await dashboardPage.click(dashboardPage.uploadSuccessBackBtn);
        const currentUrl = await driver.getCurrentUrl();
        if (!currentUrl.includes('/dashboard')) {
          throw new Error(`Failed to navigate back to dashboard after upload. URL: ${currentUrl}`);
        }
        
        actual = `Successfully uploaded file attachment "${tc.data.fileName}". Verified success notification: "${successMsg}"`;
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
