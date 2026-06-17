const { generateExcelReport } = require('./utilities/reportGenerator');
const fs = require('fs');
const path = require('path');
const testData = require('./testdata/testdata.json');

async function compilePreview() {
  const resultsDir = path.join(__dirname, 'reports', 'results');
  const results = [];
  
  // Read finished test results
  if (fs.existsSync(resultsDir)) {
    const files = fs.readdirSync(resultsDir);
    for (const file of files) {
      if (file.endsWith('.json')) {
        const raw = fs.readFileSync(path.join(resultsDir, file), 'utf8');
        results.push(JSON.parse(raw));
      }
    }
  }

  // Get finished IDs
  const finishedIds = new Set(results.map(r => r.id));

  // Merge remaining ones
  for (const tc of testData) {
    if (!finishedIds.has(tc.id)) {
      results.push({
        id: tc.id,
        module: tc.module,
        scenario: tc.scenario,
        expected: tc.expected,
        actual: 'Test execution is currently pending/running...',
        status: 'PENDING',
        duration: 0,
        severity: tc.severity,
        screenshotPath: null
      });
    }
  }

  // Sort them
  results.sort((a, b) => a.id.localeCompare(b.id));

  // Generate Report
  const tempPath = path.join(__dirname, 'reports', 'TestExecutionReport_Final.xlsx');
  
  // Create a copy of the generator that takes an explicit path
  const generatorCode = fs.readFileSync(path.join(__dirname, 'utilities', 'reportGenerator.js'), 'utf8')
      .replace(/const reportPath = .*/, `const reportPath = "${tempPath.replace(/\\/g, '\\\\')}";`);
  fs.writeFileSync(path.join(__dirname, 'utilities', 'reportGeneratorLive.js'), generatorCode);
  
  const { generateExcelReport } = require('./utilities/reportGeneratorLive');
  await generateExcelReport(results);
  console.log('Preview report successfully generated at reports/TestExecutionReport_Final.xlsx!');
}

compilePreview();
