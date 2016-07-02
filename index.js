'use strict';

const logger = require('./lib/logger')();
const Proxy = require('./lib/proxy');

const email = process.env.EMAIL || '';
const port = process.env.TCP_PORT || 443; // default ssl port
const redirect = /true/i.test(process.env.HTTP_REDIRECT);

logger.info('Using config:', {
  email,
  port,
  redirect
});

if (!email) {
  logger.error('No Email specified!');
  process.exit(1);
}

const p = new Proxy(email, port);
logger.info('Found the following domains:', p.domains);

if (p.domain.size === 0) {
  logger.error('No domains found!');
  process.exit(2);
}

p.listen(port, redirect);
