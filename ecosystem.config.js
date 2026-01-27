require('dotenv').config({ path: '.env.production' });

module.exports = {
  apps: [{
    name: 'regform',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/mnt/HC_Volume_103871510/host/regform',
    env: {
      NODE_ENV: 'production',
      DMZ_API_URL: process.env.DMZ_API_URL,
      DMZ_API_KEY: process.env.DMZ_API_KEY,
      // Add other critical env vars
    }
  }]
};