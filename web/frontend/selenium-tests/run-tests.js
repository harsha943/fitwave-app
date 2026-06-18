const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const ExcelReporter = require('./ExcelReporter');
const path = require('path');

// Test Suites
const runAuthTests = require('./tests/auth.test');
const runDashboardTests = require('./tests/dashboard.test');
const runDietTests = require('./tests/diet.test');
const runWorkoutTests = require('./tests/workout.test');

const PROJECT_ROOT = path.resolve(__dirname, '../fitwave');

async function main() {
  const reporter = new ExcelReporter();
  let driver;
  let exitCode = 0;

  try {
    console.log('Starting Chrome Driver...');
    const options = new chrome.Options();
    // Always add sandbox/shm flags for CI compatibility
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--disable-gpu');
    options.addArguments('--window-size=1280,800');
    if (process.env.HEADLESS === 'true') {
      options.addArguments('--headless=new');
    }
    driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

    console.log('Running Authentication Tests...');
    await runAuthTests(driver, reporter, PROJECT_ROOT);

    console.log('Running Dashboard Tests...');
    await runDashboardTests(driver, reporter, PROJECT_ROOT);

    console.log('Running Diet & Nutrition Tests...');
    await runDietTests(driver, reporter, PROJECT_ROOT);

    console.log('Running Workout Tests...');
    await runWorkoutTests(driver, reporter, PROJECT_ROOT);

    // Save report after all tests
    console.log('Saving Excel Report...');
    await reporter.saveReport('FitWave_Test_Report.xlsx');
    console.log('All testing completed successfully!');

  } catch (error) {
    console.error('An error occurred during test execution:', error.message);
    exitCode = 1;
  } finally {
    if (driver) {
      try { await driver.quit(); } catch (_) { /* ignore quit errors */ }
    }
    // Force exit — selenium-webdriver can keep the event loop alive
    process.exit(exitCode);
  }
}

main();
