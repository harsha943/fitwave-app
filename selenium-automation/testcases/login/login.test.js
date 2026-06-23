const { assert } = require('console');
const LoginPage = require('../../pages/LoginPage');
const { buildDriver, saveResult } = require('../testHelper');
const testData = require('../../testdata/testdata.json');
const logger = require('../../utilities/logger');

describe('Login Module Tests', function() {
  this.retries(1); // Retry failed test cases once
  let driver;
  let loginPage;
  const loginTests = testData.filter(tc => tc.module === 'Login');

  beforeEach(async function() {
    driver = await buildDriver();
    loginPage = new LoginPage(driver);
  });

  afterEach(async function() {
    if (driver) {
      await driver.quit();
    }
  });

  loginTests.forEach(tc => {
    it(`${tc.id}: ${tc.scenario}`, async function() {
      const startTime = Date.now();
      let status = 'PASS';
      let actual = 'Successfully logged in and reached dashboard page.';
      let screenshotPath = null;

      try {
        logger.info(`Starting execution for test: ${tc.id}`);
        await loginPage.navigate('/login');

        if (tc.data.isSqlInjection) {
          // Bypass HTML5 email validation to send SQL injection strings
          await driver.executeScript("document.getElementById('loginEmail').type = 'text';");
          await driver.executeScript("document.getElementById('loginForm').setAttribute('novalidate', 'novalidate');");
          // SQL injection attempt
          await loginPage.login(tc.data.username, tc.data.password);
          const errorMsg = await loginPage.getErrorMessage();
          if (!errorMsg.includes('SQL') && !errorMsg.includes('Security')) {
            throw new Error(`Expected SQL injection block warning, but got: ${errorMsg}`);
          }
          actual = `Security warning correctly blocks username injection. Error message: ${errorMsg}`;
        } else if (tc.data.username === '' || tc.data.password === '' || (tc.data.username && !tc.data.username.includes('@'))) {
          // Empty or malformed inputs validation
          await loginPage.login(tc.data.username, tc.data.password);
          // Standard HTML5 validation prevents dashboard redirection
          const currentUrl = await driver.getCurrentUrl();
          if (currentUrl.includes('/dashboard')) {
            throw new Error('User should not reach dashboard with invalid email or empty inputs');
          }
          actual = 'Form submission blocked or user remained on the login screen.';
        } else {
          // Normal credentials login
          await loginPage.login(tc.data.username, tc.data.password);
          const currentUrl = await driver.getCurrentUrl();
          
          if (tc.data.expectSuccess) {
            if (!currentUrl.includes('/dashboard')) {
              // Read error message if login failed unexpectedly
              const errorText = await loginPage.getErrorMessage();
              throw new Error(`Expected login success, but failed. Message: ${errorText}`);
            }
            actual = 'Login success verified, redirected to dashboard.';
          } else {
            if (currentUrl.includes('/dashboard')) {
              throw new Error('User logged in successfully with invalid credentials');
            }
            const errorMsg = await loginPage.getErrorMessage();
            if (!errorMsg) {
              throw new Error('Expected validation error, but none was displayed.');
            }
            actual = `Login correctly rejected with error message: "${errorMsg}"`;
          }
        }
      } catch (err) {
        status = 'FAIL';
        actual = err.message;
        if (driver) {
          screenshotPath = await loginPage.takeScreenshot(tc.id);
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
