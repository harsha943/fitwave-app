const Mocha = require('mocha');
const path = require('path');
const fs = require('fs');
const minimist = require('minimist');
const logger = require('./utilities/logger');
const { generateExcelReport } = require('./utilities/reportGenerator');

// Parse CLI options
const argv = minimist(process.argv.slice(2));
const runParallel = argv.parallel || false;

// Paths setup
const reportsDir = path.join(__dirname, 'reports');
const resultsDir = path.join(reportsDir, 'results');
const screenshotsDir = path.join(__dirname, 'screenshots');
const allureResultsDir = path.join(reportsDir, 'allure-results');

function cleanDirectory(directory) {
  if (fs.existsSync(directory)) {
    const files = fs.readdirSync(directory);
    for (const file of files) {
      const filePath = path.join(directory, file);
      if (fs.statSync(filePath).isDirectory()) {
        cleanDirectory(filePath);
        fs.rmdirSync(filePath);
      } else {
        fs.unlinkSync(filePath);
      }
    }
  } else {
    fs.mkdirSync(directory, { recursive: true });
  }
}

async function run() {
  logger.info('Initializing Programmatic E2E Selenium Test Suite...');
  
  // Clean past run files
  logger.info('Cleaning up historical reports and assets...');
  cleanDirectory(resultsDir);
  cleanDirectory(screenshotsDir);
  cleanDirectory(allureResultsDir);

  // 1. Start Mock Express Server
  logger.info('Booting local mockup Express web application...');
  const server = require('./server');

  // 2. Instantiate Mocha programmatically
  const mochaOptions = {
    timeout: 90000,
    reporter: 'allure-mocha',
    reporterOptions: {
      resultsDir: allureResultsDir
    }
  };

  if (runParallel) {
    logger.info('Programmatic Parallel execution enabled...');
    mochaOptions.parallel = true;
  } else {
    logger.info('Programmatic Sequential execution active.');
  }

  const mocha = new Mocha(mochaOptions);

  // 3. Add all test files
  const testcasesDir = path.join(__dirname, 'testcases');
  function addFilesRecursively(dir) {
    const list = fs.readdirSync(dir);
    for (const file of list) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        addFilesRecursively(filePath);
      } else if (file.endsWith('.test.js') && !file.includes('testHelper.js')) {
        mocha.addFile(filePath);
      }
    }
  }
  addFilesRecursively(testcasesDir);

  logger.info(`Loaded ${mocha.files.length} test files into Mocha.`);

  // 4. Run tests
  mocha.run(async (failures) => {
    logger.info(`Mocha tests finished. Total failures: ${failures}`);

    // 5. Collect results and compile reports
    try {
      const results = [];
      if (fs.existsSync(resultsDir)) {
        const files = fs.readdirSync(resultsDir);
        for (const file of files) {
          if (file.endsWith('.json')) {
            const raw = fs.readFileSync(path.join(resultsDir, file), 'utf8');
            results.push(JSON.parse(raw));
          }
        }
      }

      logger.info(`Collected results for ${results.length} executed test scenarios.`);
      
      if (results.length > 0) {
        // Sort results by ID for clean sheet ordering
        results.sort((a, b) => a.id.localeCompare(b.id));

        // Generate Excel report
        await generateExcelReport(results);
        
        // Console summary
        const total = results.length;
        const passed = results.filter(r => r.status === 'PASS').length;
        const failed = total - passed;
        const rate = total > 0 ? ((passed / total) * 100).toFixed(1) : '0.0';

        console.log('\n======================================================');
        console.log('            FITWAVE TEST EXECUTION SUMMARY            ');
        console.log('======================================================');
        console.log(` TOTAL TEST SCENARIOS : ${total}`);
        console.log(` PASSED TESTS         : ${passed}  [✓]`);
        console.log(` FAILED TESTS         : ${failed}  [✗]`);
        console.log(` SUCCESS RATE         : ${rate}%`);
        console.log('======================================================');
        console.log(' Excel Report: reports/TestExecutionReport.xlsx');
        console.log(' Allure results saved in reports/allure-results/');
        console.log('======================================================\n');
      } else {
        logger.warn('No test results collected. Verify test execution logs.');
      }
    } catch (err) {
      logger.error(`Error processing execution reports: ${err.message}`);
    } finally {
      // 6. Close local server instance
      logger.info('Shutting down mockup Web Server...');
      server.close(() => {
        logger.info('Mockup Web Server stopped. Execution complete.');
        process.exit(failures ? 1 : 0);
      });
    }
  });
}

run();
