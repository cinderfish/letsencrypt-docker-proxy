'use strict';

const logger = require('./logger');
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
        return this.parseDomains(service);
      })
      .then((map) => {
        this.domains = map;
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
    this.server = spdy.createServer(LEX.createAcmeResponder(this.lex, (req, res) => {
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
      if (service && service.hasOwnProperty('linked_to_service')) {
        const map = new Map();
        Promise.all(
          service.linked_to_service.map(
            (link) => new Promise((resolve, reject) => {
              dcc.getService(link.to_service)
                .then((toService) => {
                  resolve(toService);
                })
                .catch((err) => {
                  reject(err);
                });
            })
          )
        ).then((hosts) => {
          logger.info(hosts);
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
  listen (port) {
    if (this.redirect) {
      this.redirect.listen(80);
    }

    this.server.listen(port || 443);
  }
}

module.exports = Proxy;
