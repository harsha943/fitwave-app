const LoginPage = require('../../pages/LoginPage');
const DashboardPage = require('../../pages/DashboardPage');
const { buildDriver, saveResult } = require('../testHelper');
const testData = require('../../testdata/testdata.json');
const logger = require('../../utilities/logger');

describe('Responsive UI Validation Module Tests', function() {
  this.retries(1);
  let driver;
  let dashboardPage;
  const responsiveTests = testData.filter(tc => tc.module === 'Responsive UI Validation');

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

  responsiveTests.forEach(tc => {
    it(`${tc.id}: ${tc.scenario}`, async function() {
      const startTime = Date.now();
      let status = 'PASS';
      let actual = 'Viewport resized and responsive menu elements verified successfully.';
      let screenshotPath = null;

      try {
        logger.info(`Starting execution for responsive UI test: ${tc.id}`);
        
        const width = tc.data.width;
        const height = tc.data.height;
        
        // Resize browser window
        await driver.manage().window().setSize(width, height);
        await driver.sleep(600); // Allow browser rendering reflows
        
        const isMobile = width <= 900;
        
        if (isMobile) {
          const menuToggleDisplay = await driver.executeScript("return window.getComputedStyle(document.querySelector('.mobile-header')).display;");
          if (menuToggleDisplay === 'none') {
            throw new Error(`Mobile resolution (${width}px width) active, but menu toggle button is hidden`);
          }
          
          const sidebarDisplay = await driver.executeScript("return window.getComputedStyle(document.getElementById('appSidebar')).display;");
          if (sidebarDisplay !== 'none') {
            throw new Error(`Mobile resolution active, but sidebar display property is: ${sidebarDisplay}`);
          }
          
          actual = `Mobile viewport size (${width}x${height}) verified: sidebar collapses and hamburger button menu is displayed.`;
        } else {
          const menuToggleDisplay = await driver.executeScript("return window.getComputedStyle(document.querySelector('.mobile-header')).display;");
          if (menuToggleDisplay !== 'none') {
            throw new Error(`Desktop resolution (${width}px width) active, but menu toggle is incorrectly visible`);
          }
          
          const sidebarDisplay = await driver.executeScript("return window.getComputedStyle(document.getElementById('appSidebar')).display;");
          if (sidebarDisplay === 'none') {
            throw new Error('Desktop resolution active, but sidebar is incorrectly hidden');
          }
          actual = `Desktop viewport size (${width}x${height}) verified: sidebar displays statically and hamburger toggle hidden.`;
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
