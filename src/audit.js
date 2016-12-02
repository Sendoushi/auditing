#!/usr/bin/env node

/* eslint-disable strict */
'use strict';
/* eslint-enable strict */
/* global describe, it, Promise */

//-------------------------------------
// Vars / Imports

var argv = require('yargs').argv;
var scraper = require('./scraper.js');
var bedrockPath = require('bedrock-utils/src/node/path.js');
var logger = require('bedrock-utils/src/logger.js');

// Import modules
var modules = {
    w3: require('./modules/w3.js'),
    SEO: require('./modules/seo.js'),
    lighthouse: require('./modules/lighthouse.js'),
    stylelint: require('./modules/stylelint.js'),
    eslint: require('./modules/eslint.js')
};

//-------------------------------------
// Functions

/**
 * Takes care of rule result
 *
 * @param {object} rule
 * @param {object} data
 * @param {function} done
 */
function ruleResult(rule, data, done) {
    if (!data || typeof data !== 'object' || !data.hasOwnProperty.length) {
        return done();
    }

    // Iterate array...
    describe(rule.name + ': Nested...', function () {
        data.forEach(function (res) {
            it(res.msg, function () {
                if (res.type === 'error') {
                    throw res;
                } else if (res.type === 'warning') {
                    logger.warn(rule.name, res);
                }
            });
        });

        done();
    });
}

/**
 * Run single rule
 *
 * @param {object} req
 * @param {object} audit
 */
function runRule(req, audit) {
    if (!audit || typeof audit !== 'object') {
        throw new Error('You need a valid audit object');
    }

    audit.rules = audit.rules || [];

    // Now lets go through rules
    audit.rules.forEach(function (rule) {
        it(rule.name, function (done) {
            this.timeout(20000);

            rule.fn(req)
            .then(data => ruleResult(rule, data, done))
            .catch(err => ruleResult(rule, err, done));
        });
    });
}

/**
 * Audit request
 *
 * @param {array} audits
 * @param {object} req
 */
function auditReq(audits, req) {
    if (!audits || typeof audits !== 'object') {
        throw new Error('You need a valid audits list');
    }

    if (!req || typeof req !== 'object') {
        throw new Error('You need a valid req');
    }

    describe('Auditing: ' + req.originalUrl, function () {
        // Go through each audit
        audits.forEach(function (audit) {
            describe('Audit: ' + audit.name, runRule.bind(null, req, audit));
        });
    });
}

/**
 * Build audits array
 *
 * @param {array} audits
 * @returns {array}
 */
function buildAudits(audits) {
    audits = (typeof audits === 'string') ? [audits] : audits;
    return audits.map(mod => modules[mod] || require(bedrockPath.getPwd(mod)))
    .filter(val => !!val);
}

/**
 * Gather data
 *
 * @param {array} data
 * @returns {promise}
 */
function gatherData(data) {
    var promises = [];

    // Go through each request
    data.forEach(function (req) {
        var promise = new Promise(function (resolve, reject) {
            describe('Requesting urls', function () {
                it('Gathering data...', function (done) {
                    this.timeout(10000);

                    // Get the DOM
                    scraper.run(req).then(function (scrapData) {
                        req.auditsData = buildAudits(req.audits);
                        req.urlsData = scrapData;

                        // Ready
                        resolve(req);
                        done();
                        return req;
                    })
                    .catch((err) => { reject(err); done(err); });
                });
            });
        });

        // Cache it...
        promises.push(promise);
    });

    return Promise.all(promises);
}

/**
 * Initialize audits
 *
 * @param {object|string} config
 * @returns {promise}
 */
function run(config) {
    config = require('./config.js').get(config);

    // Lets gather data from the urls
    return gatherData(config.data)
    .then(function (data) {
        var promises = [];

        // Go through each element in data
        data.forEach(function (req) {
            req.urlsData.forEach(function (url) {
                // Lets run audits per request
                promises.push(auditReq(req.auditsData, url));
            });
        });

        return Promise.all(promises);
    })
    .catch(function (err) {
        throw err;
    });
}

//-------------------------------------
// Runtime

argv && argv.config && run(argv.config);
module.exports = {
    run: run,

    // Essentially for testing purposes
    'test.get': function (req) {
        var methods = {
            gatherData: gatherData,
            buildAudits: buildAudits,
            auditReq: auditReq,
            runRule: runRule,
            ruleResult: ruleResult
        };

        return methods[req];
    },
    'test.stubs': function (stubs) {
        /* eslint-disable no-native-reassign */
        describe = stubs.describe || describe;
        it = stubs.it || it;
        /* eslint-enable no-native-reassign */
        logger = stubs.logger || logger;
    }
};
