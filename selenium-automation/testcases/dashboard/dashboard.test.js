const LoginPage = require('../../pages/LoginPage');
const DashboardPage = require('../../pages/DashboardPage');
const { buildDriver, saveResult } = require('../testHelper');
const testData = require('../../testdata/testdata.json');
const logger = require('../../utilities/logger');

describe('Dashboard Module Tests', function() {
  this.retries(1);
  let driver;
  let dashboardPage;
  const dashTests = testData.filter(tc => tc.module === 'Dashboard');

  beforeEach(async function() {
    driver = await buildDriver();
    dashboardPage = new DashboardPage(driver);
    
    // Log in first
    const loginPage = new LoginPage(driver);
    await loginPage.navigate('/login');
    await loginPage.login('admin@fitwave.com', 'AdminPassword123!');
  });

  afterEach(async function() {
    if (driver) {
      await driver.quit();
    }
  });

  dashTests.forEach(tc => {
    it(`${tc.id}: ${tc.scenario}`, async function() {
      const startTime = Date.now();
      let status = 'PASS';
      let actual = 'Dashboard components and values validated successfully.';
      let screenshotPath = null;

      try {
        logger.info(`Starting execution for dashboard test: ${tc.id}`);
        const currentUrl = await driver.getCurrentUrl();
        if (!currentUrl.includes('/dashboard')) {
          throw new Error('Authentication failed or failed to reach dashboard');
        }

        // Perform assertions based on test case variant
        const checkIdx = tc.data.checkIndex;
        if (checkIdx === 1) {
          const title = await dashboardPage.getTitle();
          if (!title.includes('Fitwave')) {
            throw new Error(`Incorrect page title: ${title}`);
          }
          actual = 'Verified page title contains Fitwave.';
        } else if (checkIdx === 2) {
          const welcomeName = await dashboardPage.getText(dashboardPage.welcomeUserName);
          if (!welcomeName.includes('Harsha')) {
            throw new Error(`Welcome user name mismatch: ${welcomeName}`);
          }
          actual = `Welcome banner user name matches: "${welcomeName}"`;
        } else if (checkIdx === 3) {
          const activeCount = await dashboardPage.getText(dashboardPage.activeWorkoutsCount);
          if (!activeCount || isNaN(parseInt(activeCount, 10))) {
            throw new Error(`Invalid active workouts metric: ${activeCount}`);
          }
          actual = `Workouts count metrics displayed: ${activeCount}`;
        } else if (checkIdx === 4) {
          const sidebarName = await dashboardPage.getText(dashboardPage.sidebarUserName);
          if (!sidebarName.includes('Harsha')) {
            throw new Error(`Sidebar name mismatch: ${sidebarName}`);
          }
          actual = `Sidebar member footer name verified: "${sidebarName}"`;
        } else if (checkIdx === 5) {
          const totalDuration = await dashboardPage.getText(dashboardPage.totalDurationCount);
          if (!totalDuration.includes('m')) {
            throw new Error(`Invalid total duration format: ${totalDuration}`);
          }
          actual = `Verified total duration KPI card metric: "${totalDuration}"`;
        } else {
          // General layout check
          const isGridVisible = await dashboardPage.isDisplayed('#dashboardGrid');
          if (!isGridVisible) {
            throw new Error('Main dashboard layouts section is not displayed');
          }
          actual = 'Main workspace panel grid structure validated successfully.';
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
