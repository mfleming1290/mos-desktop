const path = require('node:path');
const { loadEnvFile } = require('node:process');
const root = path.resolve(__dirname, '../..');
loadEnvFile(path.join(root, '.env.test'));
// Opt-in owner verification; ordinary layout runs retain the non-owner account.
if (process.env.MOS_TEST_ACCOUNT === 'matt') {
  if (process.env.MOS_MATT_USERNAME !== 'matt' || !process.env.MOS_MATT_PASSWORD) {
    throw new Error('Missing dedicated MOS matt credentials in private .env.test');
  }
  process.env.MOS_TEST_USERNAME = process.env.MOS_MATT_USERNAME;
  process.env.MOS_TEST_PASSWORD = process.env.MOS_MATT_PASSWORD;
}
for (const name of ['MOS_TEST_URL', 'MOS_TEST_USERNAME', 'MOS_TEST_PASSWORD']) {
  if (!process.env[name]) throw new Error(`Missing ${name} in private .env.test`);
}
const url = new URL(process.env.MOS_TEST_URL);
if (url.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(url.hostname)) {
  throw new Error('Authenticated tests require HTTPS or localhost');
}
module.exports = { root, baseURL: url.origin, authFile: path.join(root, '.playwright/.auth', process.env.MOS_TEST_ACCOUNT === 'matt' ? 'mos-matt.json' : 'mos-test.json') };
