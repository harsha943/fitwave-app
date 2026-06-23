const autocannon = require('autocannon');

console.log('Starting Baseline/Load Test...');
console.log('• 100 virtual users');
console.log('• Running continuously for 1 minute');
console.log('Targeting: http://localhost:5000/api/health\n');

const instance = autocannon({
  url: 'http://localhost:5000/api/health',
  connections: 100, // 100 virtual users
  duration: 60,     // 1 minute
}, (err, result) => {
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
});

// Display progress in the console
autocannon.track(instance, { renderProgressBar: true });
