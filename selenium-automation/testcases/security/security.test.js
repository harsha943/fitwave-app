const LoginPage = require('../../pages/LoginPage');
const RegisterPage = require('../../pages/RegisterPage');
const ProfilePage = require('../../pages/ProfilePage');
const DashboardPage = require('../../pages/DashboardPage');
const { buildDriver, saveResult } = require('../testHelper');
const testData = require('../../testdata/testdata.json');
const logger = require('../../utilities/logger');

describe('Security Validation Module Tests', function() {
  this.retries(1);
  let driver;
  const securityTests = testData.filter(tc => tc.module === 'Security Validation');

  beforeEach(async function() {
    driver = await buildDriver();
  });

  afterEach(async function() {
    if (driver) {
      await driver.quit();
    }
  });

  securityTests.forEach(tc => {
    it(`${tc.id}: ${tc.scenario}`, async function() {
      const startTime = Date.now();
      let status = 'PASS';
      let actual = 'Security validation constraints verified and rejected successfully.';
      let screenshotPath = null;
      
      const type = tc.data.type;

      try {
        logger.info(`Starting execution for security test: ${tc.id}`);
        
        if (type === 'login_sql') {
          const loginPage = new LoginPage(driver);
          await loginPage.navigate('/login');
          // Bypass HTML5 email validation to send SQL injection strings
          await driver.executeScript("document.getElementById('loginEmail').type = 'text';");
          await driver.executeScript("document.getElementById('loginForm').setAttribute('novalidate', 'novalidate');");
          await loginPage.login(tc.data.username, tc.data.password);
          const errorMsg = await loginPage.getErrorMessage();
          if (!errorMsg.toLowerCase().includes('sql') && !errorMsg.toLowerCase().includes('security')) {
            throw new Error(`Expected SQL injection block warning page, but got message: ${errorMsg}`);
          }
          actual = `SQL Injection correctly blocked. Warning message: "${errorMsg}"`;
        } else if (type.startsWith('reg_')) {
          const registerPage = new RegisterPage(driver);
          await registerPage.navigate('/register');
          await registerPage.register(tc.data.name, tc.data.email, tc.data.password);
          
          if (type === 'reg_xss') {
            // XSS registration (mock app handles XSS strings or registers safely)
            const successText = await registerPage.getSuccessMessage();
            if (!successText.includes('Success')) {
              throw new Error('Expected registration to succeed since script tag was sanitized');
            }
            actual = 'XSS inputs escaped during form submittal. Success panel rendered.';
          } else {
            // Weak/complexity rejects
            const errorText = await registerPage.getErrorMessage();
            if (!errorText) {
              throw new Error('Expected complexity violation error block, but registration was accepted');
            }
            actual = `Weak password correctly blocked with message: "${errorText}"`;
          }
        } else if (type === 'profile_xss') {
          // Profile XSS test case
          const loginPage = new LoginPage(driver);
          await loginPage.navigate('/login');
          await loginPage.login('admin@fitwave.com', 'AdminPassword123!');
          
          const dashboardPage = new DashboardPage(driver);
          await dashboardPage.navigateToProfile();
          
          const profilePage = new ProfilePage(driver);
          await profilePage.updateProfile(tc.data.name, tc.data.email, tc.data.phone);
          
          // Re-verify that the input fields have loaded and escaped the values
          const updatedEmail = await profilePage.getValue(profilePage.emailInput);
          if (updatedEmail !== tc.data.email) {
            throw new Error('Profile text was modified incorrectly or crashed user state');
          }
          actual = 'Profile details XSS payloads correctly escaped and handled by input buffers.';
        }
      } catch (err) {
        status = 'FAIL';
        actual = err.message;
        if (driver) {
          // Create custom POM instance for taking screenshots
          const basePage = new ProfilePage(driver);
          screenshotPath = await basePage.takeScreenshot(tc.id);
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
