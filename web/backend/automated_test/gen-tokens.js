/**
 * gen-tokens.js — Generate signed JWT tokens for DAST test input.json
 * Usage: node automated_test/gen-tokens.js
 */
const crypto = require('crypto');
const fs     = require('fs');
const path   = require('path');

const JWT_SECRET = process.env.JWT_SECRET || 'fitwave-super-secret-key-2024';

function base64url(str) {
  return Buffer.from(str).toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function signJwt(payload) {
  const header  = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body    = base64url(JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000) }));
  const sig     = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${body}`)
    .digest('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${header}.${body}.${sig}`;
}

const tokens = {
  admin: signJwt({ sub: '1', email: 'admin@fitwave.com', role: 'admin', name: 'Admin User', exp: Math.floor(Date.now() / 1000) + 86400 * 7 }),
  user:  signJwt({ sub: '2', email: 'user@fitwave.com',  role: 'user',  name: 'Regular User', exp: Math.floor(Date.now() / 1000) + 86400 * 7 }),
  guest: signJwt({ sub: '3', email: 'guest@fitwave.com', role: 'guest', name: 'Guest User', exp: Math.floor(Date.now() / 1000) + 86400 * 7 }),
};

const inputPath = path.join(__dirname, 'input.json');
const input = {
  baseUrl: 'http://localhost:5000',
  _comment: 'Auto-generated tokens — valid for 7 days. Regenerate with: node automated_test/gen-tokens.js',
  admin: tokens.admin,
  user:  tokens.user,
  guest: tokens.guest,
};

fs.writeFileSync(inputPath, JSON.stringify(input, null, 2));
console.log('✅  input.json updated with signed tokens:');
console.log(`   admin : ${tokens.admin.slice(0, 40)}...`);
console.log(`   user  : ${tokens.user.slice(0, 40)}...`);
console.log(`   guest : ${tokens.guest.slice(0, 40)}...`);
console.log('\nNow run: node automated_test/runner.js');
