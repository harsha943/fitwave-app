const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const path = require('path');
const config = require('../config/config');
const logger = require('../utilities/logger');

// Ensure results directory exists
const resultsDir = path.join(__dirname, '..', 'reports', 'results');
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
}

/**
 * Build a Chrome driver instance with options
 */
async function buildDriver() {
  const options = new chrome.Options();
  
  // Setup Chrome Options for robust execution
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  options.addArguments('--disable-gpu');
  options.addArguments('--window-size=1280,800');
  
  if (config.headless) {
    options.addArguments('--headless=new');
  }

  const driver = await new Builder()
    .forBrowser(config.browser)
    .setChromeOptions(options)
    .build();

  // Set implicit timeout (use 3 seconds for rapid local execution)
  await driver.manage().setTimeouts({ implicit: 3000 });

  // Call the reset endpoint to ensure database state is fresh
  try {
    await driver.get(`${config.baseUrl}/api/reset`);
  } catch (err) {
    logger.error(`Error calling database reset endpoint: ${err.message}`);
  }

  return driver;
}

/**
 * Save result file to disk (supports parallel execution)
 */
function saveResult(result) {
  const filePath = path.join(resultsDir, `${result.id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(result, null, 2));
  logger.info(`Recorded test case: ${result.id} [${result.status}]`);
}

module.exports = {
  buildDriver,
  saveResult
};
