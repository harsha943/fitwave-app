const autocannon = require('autocannon');
const ExcelJS = require('exceljs');
const path = require('path');

console.log('Starting Baseline/Load Test...');
console.log('• 100 virtual users');
console.log('• Running continuously for 1 minute');
console.log('Targeting: http://localhost:5000/api/health\n');

const instance = autocannon({
  url: 'http://localhost:5000/api/health',
  connections: 100, // 100 virtual users
  duration: 60,     // 1 minute
}, async (err, result) => {
  if (err) {
    console.error('Error during load test:', err);
    return;
  }
  
  console.log('\n________________________________________');
  console.log('What you will see');
  console.log('Requests per second (RPS)');
  console.log(`Example:`);
  console.log(`${Math.round(result.requests.average)} req/sec`);
  console.log('Meaning your API is handling about this many requests every second.');
  console.log('________________________________________');
  console.log('Response Time');
  console.log('Example:');
  console.log(`Average: ${result.latency.average}ms`);
  console.log(`Min: ${result.latency.min}ms`);
  console.log(`Max: ${result.latency.max}ms\n`);
  
  console.log('Meaning:');
  console.log(`• Fastest response = ${result.latency.min}ms`);
  console.log(`• Average = ${result.latency.average}ms`);
  console.log(`• Slowest = ${result.latency.max}ms`);
  console.log('________________________________________\n');

  // Generate Excel Report
  try {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Fitwave Load Test';
    workbook.created = new Date();
    
    const sheet = workbook.addWorksheet('Load Test Results');
    
    // Setup Columns
    sheet.columns = [
      { header: 'Metric Category', key: 'category', width: 25 },
      { header: 'Metric', key: 'metric', width: 20 },
      { header: 'Value', key: 'value', width: 20 },
      { header: 'Unit', key: 'unit', width: 15 }
    ];
    
    // Style Header Row
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF000000' } };
    
    // Add Data
    sheet.addRows([
      { category: 'Test Configuration', metric: 'Connections', value: result.connections, unit: 'users' },
      { category: 'Test Configuration', metric: 'Duration', value: result.duration, unit: 'seconds' },
      { category: 'Test Configuration', metric: 'Target URL', value: result.url, unit: '' },
      { category: '', metric: '', value: '', unit: '' },
      { category: 'Throughput (RPS)', metric: 'Average RPS', value: Math.round(result.requests.average), unit: 'req/sec' },
      { category: 'Throughput (RPS)', metric: 'Min RPS', value: result.requests.min, unit: 'req/sec' },
      { category: 'Throughput (RPS)', metric: 'Max RPS', value: result.requests.max, unit: 'req/sec' },
      { category: 'Throughput (RPS)', metric: 'Total Requests', value: result.requests.total, unit: 'reqs' },
      { category: '', metric: '', value: '', unit: '' },
      { category: 'Latency', metric: 'Average', value: result.latency.average, unit: 'ms' },
      { category: 'Latency', metric: 'Min (Fastest)', value: result.latency.min, unit: 'ms' },
      { category: 'Latency', metric: 'Max (Slowest)', value: result.latency.max, unit: 'ms' },
      { category: 'Latency', metric: 'p99', value: result.latency.p99, unit: 'ms' },
      { category: '', metric: '', value: '', unit: '' },
      { category: 'Errors & Timeouts', metric: 'Errors', value: result.errors, unit: 'count' },
      { category: 'Errors & Timeouts', metric: 'Timeouts', value: result.timeouts, unit: 'count' }
    ]);
    
    const reportPath = path.join(__dirname, 'Load-Test-Results.xlsx');
    await workbook.xlsx.writeFile(reportPath);
    console.log(`✅ Excel report generated successfully: ${reportPath}`);
  } catch (error) {
    console.error('Failed to generate Excel report:', error);
  }
});

// Display progress in the console
autocannon.track(instance, { renderProgressBar: true });
