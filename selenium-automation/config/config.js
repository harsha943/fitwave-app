require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  username: process.env.DEFAULT_USERNAME || 'admin@fitwave.com',
  password: process.env.DEFAULT_PASSWORD || 'AdminPassword123!',
  browser: process.env.BROWSER || 'chrome',
  timeout: parseInt(process.env.TIMEOUT || '15000', 10),
  retries: parseInt(process.env.RETRIES || '1', 10),
  headless: process.env.HEADLESS === 'true'
};
