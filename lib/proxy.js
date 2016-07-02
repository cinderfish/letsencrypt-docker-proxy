'use strict';

const logger = require('./logger')();
const dcc = require('./docker-cloud-client');
const http = require('http');
const spdy = require('spdy');
const httpProxy = require('http-proxy');
const LEX = require('letsencrypt-express');

/**
 * @module Proxy
 */
class Proxy {
  /**
   * @constructor
   *
   * @param {string}  email    The email to register with
   * @param {boolean} redirect If true, create http server to redirect traffic to https
   */
  constructor (email, redirect) {
    dcc.getService()
      .then((service) => {
        logger.info(service);
        return this.parseDomains(service);
      })
      .then((map) => {
        this.domains = map;
        logger.info('Found the following domains:', map);
      })
      .catch((err) => {
        logger.error(err);
        throw err;
      });

    this.lex = LEX.create({
      approveRegistration: (hostname, approve) => {
        if (this.domains.has(hostname)) {
          approve(null, {
            domains: [hostname],
            email,
            agreeTos: true
          });
        }
      }
    });

    const proxy = httpProxy.createProxyServer({});
    this.server = spdy.createServer(LEX.httpsOptions, LEX.createAcmeResponder(this.lex, (req, res) => {
      if (this.domains.has(req.headers.host)) {
        proxy.web(req, res, {
          target: this.domains.get(req.headers.host).port
        });
      } else {
        this.logger.error(`Unknown host: ${req.headers.host}`, req);
        res.statusCode = 404;
        res.end();
      }
    }));

    this.redirect = null;
    if (redirect) {
      this.redirect = http.createServer(LEX.createAcmeResponder(this.lex, (req, res) => {
        res.setHeader('Location', `https://${req.headers.host}${req.url}`);
        res.statusCode = 302;
        res.end();
      }));
    }
  }

  /**
   * Parse domains from service linked variables
   *
   * @param {object} service a server object
   * @return {Promise} resolves with map of hostname to object
   * {
   *   domain: string, domain
   *   port: string, uri to forward traffic to
   * }
   */
  parseDomains (service) {
    return new Promise((resolve, reject) => {
      if (service && service.hasOwnProperty('linked_from_service')) {
        const map = new Map();
        // Hit API for every linked service
        Promise.all(
          service.linked_from_service.map(
            (link) => new Promise((resolve, reject) => {
              // Get URL for linked server (it could be from either direction so check link != self)
              const linkedService = (link.to_service !== process.env.DOCKERCLOUD_SERVICE_API_URI)
                ? link.to_service : link.from_service;
              dcc.getService(linkedService)
                .then((linkService) => {
                  const linkConfig = {
                    path: null,
                    domain: null
                  };

                  // Loop through envvars
                  linkService.container_envvars.forEach((envObj) => {
                    if (envObj.key === 'VIRTUAL_HOST') {
                      linkConfig.domain = envObj.value;
                    } else if (envObj.key === 'TCP_PORT') {
                      // Check ports for match and store endpoint
                      let x;
                      for (x in linkService.container_ports) {
                        if (linkService.container_ports[x].inner_port === envObj.value) {
                          linkConfig.path = linkService.container_ports[x].endpoint_uri.replace(/\/$/, '');
                          break;
                        }
                      }
                    }
                  });

                  if (linkConfig.path && linkConfig.domain) {
                    resolve(linkConfig);
                  } else {
                    logger.error(`Missing ENV Variables: ${link.name}`);
                    resolve();
                  }
                })
                .catch((err) => {
                  reject(err);
                });
            })
          )
        ).then((hosts) => {
          logger.info('Hosts', hosts);
          hosts.forEach((host) => {
            if (host && host.path && host.domain) {
              map.set(host.domain, host);
            }
          });

          resolve(map);
        })
        .catch((err) => {
          reject(err);
        });
      } else {
        reject(new Error('Service missing linked_to_service', service));
      }
    });
  }

  /**
   * Start up server
   *
   * @param {integer} port the port to listen on
   * @return {null} Nada
   */
  listen (port, redirectPort) {
    if (this.redirect) {
      redirectPort = redirectPort || 80;
      this.redirect.listen(redirectPort);
      logger.info(`Redirect listening on ${redirectPort}`);
    }

    port = port || 443;
    this.server.listen(port);
    logger.info(`Proxy listening on ${port}`);
  }
}

module.exports = Proxy;
