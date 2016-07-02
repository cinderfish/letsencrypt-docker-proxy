'use strict';

const logger = require('./lib/logger')();
const Proxy = require('./lib/proxy');

const email = process.env.EMAIL || '';
const port = process.env.TCP_PORT || 443; // default ssl port
const redirectPort = process.env.REDIRECT_PORT || 80; // default http port
const redirect = /true/i.test(process.env.HTTP_REDIRECT);

logger.info('Using config:', {
  email,
  port,
  redirect,
  redirectPort
});

if (!email) {
  logger.error('No Email specified!');
  process.exit(1);
}

const p = new Proxy(email, redirect);
p.listen(port, redirectPort);
