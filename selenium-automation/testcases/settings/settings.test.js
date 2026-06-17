const LoginPage = require('../../pages/LoginPage');
const DashboardPage = require('../../pages/DashboardPage');
const SettingsPage = require('../../pages/SettingsPage');
const { buildDriver, saveResult } = require('../testHelper');
const testData = require('../../testdata/testdata.json');
const logger = require('../../utilities/logger');

describe('Settings Module Tests', function() {
  this.retries(1);
  let driver;
  let dashboardPage;
  let settingsPage;
  const settingsTests = testData.filter(tc => tc.module === 'Settings');

  beforeEach(async function() {
    driver = await buildDriver();
    dashboardPage = new DashboardPage(driver);
    settingsPage = new SettingsPage(driver);
    
    // Log in and navigate to Settings
    const loginPage = new LoginPage(driver);
    await loginPage.navigate('/login');
    await loginPage.login('admin@fitwave.com', 'AdminPassword123!');
    await dashboardPage.navigateToSettings();
  });

  afterEach(async function() {
    if (driver) {
      await driver.quit();
    }
  });

  settingsTests.forEach(tc => {
    it(`${tc.id}: ${tc.scenario}`, async function() {
      const startTime = Date.now();
      let status = 'PASS';
      let actual = 'Settings configurations updated and verified successfully.';
      let screenshotPath = null;

      try {
        logger.info(`Starting execution for settings test: ${tc.id}`);
        const currentUrl = await driver.getCurrentUrl();
        if (!currentUrl.includes('/settings')) {
          throw new Error('Failed to navigate to Settings page');
        }

        const isCancelTest = tc.scenario.toLowerCase().includes('cancel') || tc.id === 'TC-050';
        if (isCancelTest) {
          await settingsPage.cancelSettings();
          const targetUrl = await driver.getCurrentUrl();
          if (!targetUrl.includes('/dashboard')) {
            throw new Error(`Expected redirection to dashboard on cancel, but got: ${targetUrl}`);
          }
          actual = 'Settings cancellation triggered correctly; redirected back to dashboard.';
        } else {
          // Save configurations
          await settingsPage.saveSettings(tc.data.theme, tc.data.emailAlerts, tc.data.weeklySummary);
          
          // Redirect check (mock app redirects back to settings with saved state)
          const targetUrl = await driver.getCurrentUrl();
          if (!targetUrl.includes('/settings')) {
            throw new Error(`Expected settings save redirect to settings, but got: ${targetUrl}`);
          }

          // Verify options
          const selectedTheme = await settingsPage.getValue(settingsPage.themeDropdown);
          if (selectedTheme !== tc.data.theme) {
            throw new Error(`Theme dropdown value did not save correctly. Expected: ${tc.data.theme}, Got: ${selectedTheme}`);
          }
          actual = `Configuration Saved: Theme=${tc.data.theme}, Alerts=${tc.data.emailAlerts}, WeeklySummary=${tc.data.weeklySummary}.`;
        }
      } catch (err) {
        status = 'FAIL';
        actual = err.message;
        if (driver) {
          screenshotPath = await settingsPage.takeScreenshot(tc.id);
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
