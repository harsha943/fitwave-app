const LoginPage = require('../../pages/LoginPage');
const DashboardPage = require('../../pages/DashboardPage');
const { buildDriver, saveResult } = require('../testHelper');
const testData = require('../../testdata/testdata.json');
const logger = require('../../utilities/logger');

describe('CRUD Operations Module Tests', function() {
  this.retries(1);
  let driver;
  let dashboardPage;
  const crudTests = testData.filter(tc => tc.module === 'CRUD Operations');

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

  crudTests.forEach(tc => {
    it(`${tc.id}: ${tc.scenario}`, async function() {
      const startTime = Date.now();
      let status = 'PASS';
      let actual = 'CRUD action completed and verified successfully.';
      let screenshotPath = null;

      try {
        logger.info(`Starting execution for CRUD test: ${tc.id}`);
        const action = tc.data.action;

        if (action === 'Create') {
          const initialCount = await dashboardPage.getWorkoutsCount();
          await dashboardPage.addWorkout(tc.data.name, tc.data.category, tc.data.duration);
          await driver.sleep(1000); // Wait for redirect and reload
          
          // Re-read row count and confirm inclusion
          const currentCount = await dashboardPage.getWorkoutsCount();
          if (currentCount <= initialCount) {
            throw new Error(`Workout not added. Row count didn't increase from ${initialCount}`);
          }
          
          // Verify new routine name in page source
          const pageSource = await driver.getPageSource();
          if (!pageSource.includes(tc.data.name)) {
            throw new Error(`New workout name "${tc.data.name}" is missing in workouts table`);
          }
          
          actual = `Successfully added workout routine: "${tc.data.name}", workouts count is now ${currentCount}.`;
        } else if (action === 'Update') {
          // Perform edit on row 2 (which is statically present in mockup DB)
          const editId = 2;
          await dashboardPage.editWorkoutClick(editId);
          
          // Type details in edit form
          await dashboardPage.type('#editNameInput', tc.data.name);
          await dashboardPage.selectDropdownByValue('#editCategoryInput', tc.data.category);
          await dashboardPage.type('#editDurationInput', String(tc.data.duration));
          await dashboardPage.click('#btnUpdateWorkout');
          await driver.sleep(1000); // Wait for redirect
          
          // Verify updated row details on dashboard
          const currentUrl = await driver.getCurrentUrl();
          if (!currentUrl.includes('/dashboard')) {
            throw new Error('Update form submission failed to redirect back to dashboard');
          }
          
          const pageSource = await driver.getPageSource();
          if (!pageSource.includes(tc.data.name)) {
            throw new Error(`Updated workout name "${tc.data.name}" not displaying in table`);
          }
          actual = `Workout WK-002 updated to name: "${tc.data.name}" and Category: "${tc.data.category}".`;
        } else {
          // Action is Delete
          // Delete row 3 (statically present)
          const deleteId = 3;
          
          // Mock DB check and delete
          const initialCount = await dashboardPage.getWorkoutsCount();
          await dashboardPage.deleteWorkout(deleteId);
          await driver.sleep(1000); // Wait for reload
          
          // Wait for delete page load
          const currentCount = await dashboardPage.getWorkoutsCount();
          actual = `Deleted workout routine ID: ${deleteId}. Current workout count: ${currentCount}.`;
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
