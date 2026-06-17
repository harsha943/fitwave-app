const { Builder, By, until } = require('selenium-webdriver');
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

  try {
    console.log('Starting Chrome Driver...');
    driver = await new Builder().forBrowser('chrome').build();
    
    // Maximize window for consistent UI tests
    await driver.manage().window().maximize();

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
    console.error('An error occurred during test execution:', error);
  } finally {
    if (driver) {
      await driver.quit();
    }
  }
}

main();
