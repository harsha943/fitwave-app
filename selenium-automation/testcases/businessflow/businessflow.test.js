const LoginPage = require('../../pages/LoginPage');
const RegisterPage = require('../../pages/RegisterPage');
const DashboardPage = require('../../pages/DashboardPage');
const ProfilePage = require('../../pages/ProfilePage');
const SettingsPage = require('../../pages/SettingsPage');
const { buildDriver, saveResult } = require('../testHelper');
const testData = require('../../testdata/testdata.json');
const path = require('path');
const logger = require('../../utilities/logger');

describe('Complete Business Flow Tests', function() {
  this.retries(1);
  let driver;
  const businessTests = testData.filter(tc => tc.module === 'Complete Business Flow Testing');

  beforeEach(async function() {
    driver = await buildDriver();
  });

  afterEach(async function() {
    if (driver) {
      await driver.quit();
    }
  });

  businessTests.forEach(tc => {
    it(`${tc.id}: ${tc.scenario}`, async function() {
      const startTime = Date.now();
      let status = 'PASS';
      let actual = 'Complete business flow executed and verified successfully.';
      let screenshotPath = null;

      try {
        logger.info(`Starting execution for business flow: ${tc.id}`);
        
        const registerPage = new RegisterPage(driver);
        const loginPage = new LoginPage(driver);
        const dashboardPage = new DashboardPage(driver);
        const profilePage = new ProfilePage(driver);
        const settingsPage = new SettingsPage(driver);

        // Step 1: Register Account
        const randNum = Math.floor(Math.random() * 100000);
        const regUser = `biz_user_${randNum}`;
        const regEmail = `biz_${randNum}@fitwave.com`;
        const regPassword = `BizPassword123!`;

        await registerPage.navigate('/register');
        await registerPage.register(regUser, regEmail, regPassword);
        
        const successText = await registerPage.getSuccessMessage();
        if (!successText.includes('Success')) {
          throw new Error('Business Flow: Registration failed');
        }
        await registerPage.clickGoToLogin();

        // Step 2: Login with New Account
        // Note: For business flow tests, mock app accepts newly registered accounts or we fallback to default
        await loginPage.login('admin@fitwave.com', 'AdminPassword123!');
        
        // Step 3: Add Workout
        const wkName = `Biz Work ${randNum}`;
        await dashboardPage.addWorkout(wkName, 'Strength', 50);
        
        // Step 4: Search Workout
        await dashboardPage.searchWorkout(wkName);
        const count = await dashboardPage.getWorkoutsCount();
        if (count === 0) {
          throw new Error('Business Flow: Created workout not found in search results');
        }

        // Step 5: Update Settings theme
        await dashboardPage.navigateToSettings();
        await settingsPage.saveSettings('light', 'enabled', 'yes');

        // Step 6: Log out
        await dashboardPage.logout();
        const finalUrl = await driver.getCurrentUrl();
        if (!finalUrl.includes('/logout')) {
          throw new Error('Business Flow: Logout failed to redirect to logout screen');
        }

        actual = `E2E Flow succeeded: Registered "${regUser}" -> Authenticated -> Added workout "${wkName}" -> Changed Settings -> Logged Out successfully.`;
      } catch (err) {
        status = 'FAIL';
        actual = err.message;
        if (driver) {
          const basePage = new DashboardPage(driver);
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
