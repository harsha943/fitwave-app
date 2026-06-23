const RegisterPage = require('../../pages/RegisterPage');
const { buildDriver, saveResult } = require('../testHelper');
const testData = require('../../testdata/testdata.json');
const logger = require('../../utilities/logger');

describe('Registration Module Tests', function() {
  this.retries(1);
  let driver;
  let registerPage;
  const regTests = testData.filter(tc => tc.module === 'Registration');

  beforeEach(async function() {
    driver = await buildDriver();
    registerPage = new RegisterPage(driver);
  });

  afterEach(async function() {
    if (driver) {
      await driver.quit();
    }
  });

  regTests.forEach(tc => {
    it(`${tc.id}: ${tc.scenario}`, async function() {
      const startTime = Date.now();
      let status = 'PASS';
      let actual = 'User registered successfully and success message validated.';
      let screenshotPath = null;

      try {
        logger.info(`Starting execution for registration test: ${tc.id}`);
        await registerPage.navigate('/register');

        if (tc.data.checkRedirect) {
          // Check link to login redirection
          await registerPage.navigateToLogin();
          const currentUrl = await driver.getCurrentUrl();
          if (!currentUrl.includes('/login')) {
            throw new Error('Clicking link to sign in did not redirect to login page');
          }
          actual = 'Redirected successfully to login page.';
        } else if (tc.data.name === '' || tc.data.email === '' || (tc.data.email && !tc.data.email.includes('@'))) {
          // Empty or malformed input checks
          await registerPage.register(tc.data.name, tc.data.email, tc.data.password);
          const currentUrl = await driver.getCurrentUrl();
          if (currentUrl.includes('/login') || currentUrl.includes('success')) {
            throw new Error('Registration form was submitted with invalid empty or malformed inputs');
          }
          actual = 'Form inputs validated; browser blocked form submission.';
        } else {
          // Normal registration attempt
          await registerPage.register(tc.data.name, tc.data.email, tc.data.password);
          
          if (tc.data.expectSuccess) {
            const successText = await registerPage.getSuccessMessage();
            if (!successText.includes('Success')) {
              throw new Error(`Expected success message, but got: "${successText}"`);
            }
            actual = `Successfully verified registration text: "${successText}"`;
          } else {
            const errorText = await registerPage.getErrorMessage();
            if (!errorText) {
              throw new Error('Expected validation error but none was found');
            }
            actual = `Registration rejected correctly. Error displays: "${errorText}"`;
          }
        }
      } catch (err) {
        status = 'FAIL';
        actual = err.message;
        if (driver) {
          screenshotPath = await registerPage.takeScreenshot(tc.id);
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
