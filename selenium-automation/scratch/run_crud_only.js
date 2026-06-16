const Mocha = require('mocha');
const path = require('path');
const server = require('../server');

const mocha = new Mocha({
  timeout: 30000
});
mocha.addFile(path.resolve(__dirname, '..', 'testcases', 'crud', 'crud.test.js'));

console.log('Starting isolation run for CRUD Operations...');
mocha.run((failures) => {
  console.log(`Mocha isolation run finished with failures: ${failures}`);
  server.close(() => {
    console.log('Web server closed.');
    process.exit(failures ? 1 : 0);
  });
});
