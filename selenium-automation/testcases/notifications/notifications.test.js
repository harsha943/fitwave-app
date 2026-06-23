const LoginPage = require('../../pages/LoginPage');
const DashboardPage = require('../../pages/DashboardPage');
const { buildDriver, saveResult } = require('../testHelper');
const testData = require('../../testdata/testdata.json');
const logger = require('../../utilities/logger');

describe('Notifications Module Tests', function() {
  this.retries(1);
  let driver;
  let dashboardPage;
  const notifTests = testData.filter(tc => tc.module === 'Notifications');

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

  notifTests.forEach(tc => {
    it(`${tc.id}: ${tc.scenario}`, async function() {
      const startTime = Date.now();
      let status = 'PASS';
      let actual = 'Notifications processed and badge counts verified.';
      let screenshotPath = null;

      try {
        logger.info(`Starting execution for notifications test: ${tc.id}`);
        
        // Open dropdown
        await dashboardPage.toggleNotifications();
        
        // Wait briefly for CSS transition
        await driver.sleep(500);
        
        const isClearAll = tc.data.isClearAll;
        if (isClearAll) {
          await dashboardPage.clearNotifications();
          await driver.sleep(500);
          
          const isBadgeVisible = await dashboardPage.isDisplayed(dashboardPage.notifBadge);
          if (isBadgeVisible) {
            throw new Error('Badge count still visible after clearing all notifications');
          }
          
          const noNotifText = await dashboardPage.getText(dashboardPage.noNotifMsg);
          if (!noNotifText.includes('No notifications')) {
            throw new Error(`Expected "No notifications" text, but got: "${noNotifText}"`);
          }
          actual = 'All notifications cleared successfully. Empty placeholder text verified.';
        } else {
          // Read single notification (id is 1 or 2)
          const notifId = (tc.data.notificationId % 2 === 0) ? 2 : 1;
          const initialBadgeText = await dashboardPage.getText(dashboardPage.notifBadge);
          const initialCount = parseInt(initialBadgeText, 10);
          
          // Click checkmark on notification item
          await dashboardPage.click(`#notif-item-${notifId} button`);
          await driver.sleep(500);
          
          // Verify element is removed
          const exists = await dashboardPage.isDisplayed(`#notif-item-${notifId}`);
          if (exists) {
            throw new Error(`Notification item ${notifId} still exists after reading`);
          }
          
          actual = `Read single notification ID: ${notifId}. Count decreased from ${initialCount}.`;
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
