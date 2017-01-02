#!/usr/bin/env node

'use strict';
/* global describe, it, Promise */

import { argv } from 'yargs';
import scraper from './scraper.js';
import { get as configGet } from './config.js';
import { getPwd } from './utils.js';

// Import modules
const modules = {
    w3: require('./modules/w3.js'),
    wcag: require('./modules/wcag.js'),
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
const ruleResult = (rule, data, done) => {
    if (!data || typeof data !== 'object' || !data.hasOwnProperty.length) {
        return done();
    }

    // Iterate array...
    describe(`${rule.name}: Nested...`, () => {
        data.forEach((res) => {
            it(res.msg, () => {
                if (res.type === 'error') {
                    throw res;
                } else if (res.type === 'warning') {
                    /* eslint-disable no-console */
                    console.warn(rule.name, res);
                    /* eslint-enable no-console */
                }
            });
        });

        done();
    });
};

/**
 * Run single rule
 *
 * @param {object} req
 * @param {object} audit
 */
const runRule = (req, audit) => {
    if (!audit || typeof audit !== 'object') {
        throw new Error('You need a valid audit object');
    }

    audit.rules = audit.rules || [];

    // Now lets go through rules
    audit.rules.forEach((rule) => {
        it(rule.name, function (done) {
            this.timeout(20000);

            rule.fn(req)
            .then(data => ruleResult(rule, data, done))
            .catch(err => ruleResult(rule, err, done));
        });
    });
};

/**
 * Audit request
 *
 * @param {array} audits
 * @param {object} req
 */
const auditReq = (audits, req) => {
    if (!audits || typeof audits !== 'object') {
        throw new Error('You need a valid audits list');
    }

    if (!req || typeof req !== 'object') {
        throw new Error('You need a valid req');
    }

    describe(`Auditing: ${req.originalUrl}`, () => {
        // Go through each audit
        audits.forEach((audit) => {
            describe(`Audit: ${audit.name}`, runRule.bind(null, req, audit));
        });
    });
};

/**
 * Build audits array
 *
 * @param {array} audits
 * @returns {array}
 */
const buildAudits = (audits) => {
    audits = (typeof audits === 'string') ? [audits] : audits;
    return audits.map(mod => modules[mod] || require(getPwd(mod)))
    .filter(val => !!val);
};

/**
 * Gather data
 *
 * @param {array} data
 * @returns {promise}
 */
const gatherData = (data) => {
    const promises = [];

    // Go through each request
    data.forEach((req) => {
        const promise = new Promise((resolve, reject) => {
            describe('Requesting urls', () => {
                it('Gathering data...', function (done) {
                    this.timeout(10000);

                    // Get the DOM
                    scraper.run(req).then((scrapData) => {
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
};

/**
 * Initialize audits
 *
 * @param {object|string} config
 * @returns {promise}
 */
const run = (config) => {
    config = configGet(config);

    // Lets gather data from the urls
    return gatherData(config.data)
    .then((data) => {
        const promises = [];

        // Go through each element in data
        // Lets run audits per request
        data.forEach((req) => req.urlsData.forEach((url) => promises.push(auditReq(req.auditsData, url))));

        return Promise.all(promises);
    })
    .catch((err) => { throw err; });
};

//-------------------------------------
// Runtime

argv && argv.config && run(argv.config);
export { run };

// Essentially for testing purposes
export const __testMethods__ = { run, gatherData, buildAudits, auditReq, runRule, ruleResult };
export const __testStubs__ = (stubs) => {
    /* eslint-disable no-native-reassign */
    describe = stubs.describe || describe;
    it = stubs.it || it;
    /* eslint-enable no-native-reassign */
};
