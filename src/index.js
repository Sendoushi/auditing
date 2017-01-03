#!/usr/bin/env node

'use strict';
/* global Promise */

import { argv } from 'yargs';
import merge from 'lodash/merge.js';
import isArray from 'lodash/isArray.js';
import { run as runScraper } from './scraper.js';
import { get as configGet } from './config.js';
import { getPwd } from './utils.js';

// Import modules
const modules = {
    w3: require('./modules/w3.js')
    // TODO: Take care of these modules to be compliant...
    // wcag: require('./modules/wcag.js'),
    // SEO: require('./modules/seo.js'),
    // lighthouse: require('./modules/lighthouse.js')
};

let logWarn;
let desTest;
let itTest;

//-------------------------------------
// Functions

/**
 * Runs the rule
 *
 * @param {object} rule
 * @param {object} url
 * @returns
 */
const runRule = (rule = {}, url = {}) => {
    if (typeof rule !== 'object' || isArray(rule)) {
        throw new Error('A rule needs to be an object');
    }

    if (!rule.name || typeof rule.name !== 'string') {
        throw new Error('A rule needs a string name');
    }

    if (!rule.fn || typeof rule.fn !== 'function') {
        throw new Error('A rule needs a function fn');
    }

    return rule.fn(url).then(ruleData => {
        // Lets see if there is a warning...
        if (isArray(ruleData)) {
            ruleData.forEach(single => {
                if (!single || typeof single !== 'object') {
                    throw new Error('Rule array result item should be an object');
                }

                if (!single.type || typeof single.type !== 'string') {
                    throw new Error('Rule array result item should have a string type');
                }

                if (!single.msg || typeof single.msg !== 'string') {
                    throw new Error('Rule array result item should have a string msg');
                }

                if (single.type === 'warning') {
                    logWarn(rule.name, single.msg, single.raw);
                }
            });
        }

        const newRule = merge({
            name: rule.name,
            status: 'passed',
            result: ruleData
        });

        // Ready
        return newRule;
    })
    .catch(err => {
        const newRule = {
            name: rule.name,
            status: 'failed',
            result: err
        };

        // Ready
        throw newRule;
    });
};

/**
 * Runs audit
 *
 * @param {object} auditsData
 * @param {object} url
 * @param {function} resolve
 * @param {function} reject
 * @returns
 */
const runAudit = (auditsData = [], url = {}, resolve, reject) => {
    let allDone = 0;
    let promisesCount = 0;
    const audits = {};

    if (typeof resolve !== 'function' || typeof reject !== 'function') {
        throw new Error('Resolve and reject functions need to be provided');
    }

    // We need to know how many rules there are
    auditsData.forEach(audit => { promisesCount += (audit.rules || []).length; });

    if (!auditsData.length || promisesCount === 0) {
        resolve(audits);
    }

    // Lets go per audit...
    auditsData.forEach(audit => {
        audits[audit.name] = [];

        desTest(`Audit: ${audit.name}`, () => audit.rules.forEach(rule => itTest(`Rule: ${rule.name}`, function (done) {
            this.timeout(20000);

            // Lets run the rule
            runRule(rule, url)
            .then(newRule => {
                // Ready
                audits[audit.name].push(newRule);
                done();

                allDone += 1;
                if (allDone === promisesCount) { resolve(audits); }

                return newRule;
            })
            .catch(newRule => {
                const err = newRule.result;

                // Ready
                audits[audit.name].push(newRule);
                done(err instanceof Error ? err : new Error(JSON.stringify(err, null, 4)));

                allDone += 1;
                if (allDone === promisesCount) { reject(audits); }
            });
        })));
    });

    return audits;
};

/**
 * Build audits array
 *
 * @param {array} audits
 * @returns {array}
 */
const buildAudits = (audits) => {
    audits = (typeof audits === 'string') ? [audits] : audits;
    audits = audits.map(val => {
        val = (typeof val === 'object') ? val : { src: val };

        // Lets require
        let mod = modules[val.src] || require(getPwd(val.src));
        mod = (typeof mod === 'object' && mod.default) ? mod.default : mod;

        // Now set all as should
        val.name = mod.name;
        val.rules = mod.rules.map((rule) => {
            if (typeof rule !== 'object' || isArray(rule)) {
                throw new Error('A rule needs to be an object');
            }

            if (!rule.name) {
                throw new Error('A rule needs a name');
            }

            if (!rule.fn) {
                throw new Error('A rule needs a function');
            }

            return rule;
        });
        val.ignore = val.ignore || [];

        return val;
    });

    return audits;
};

/**
 * Gather data
 *
 * @param {array} data
 * @returns {promise}
 */
const gatherData = (data = []) => new Promise((resolve, reject) => {
    const reqData = [];
    const promisesCount = data.length;
    let allDone = 0;

    // No need to go further without data
    if (!data.length) { return resolve(); }

    // Go through each request
    data.forEach((req) => desTest('Requesting urls', () => itTest('Gathering data...', function (done) {
        this.timeout(10000);

        // Lets get the scraper data
        runScraper(req).then((scrapData) => {
            const newReq = merge(req, {
                auditsData: buildAudits(req.audits),
                urlsData: scrapData
            });

            // Ready
            reqData.push(newReq);
            done();

            allDone += 1;
            if (allDone === promisesCount) { resolve(reqData); }

            return newReq;
        })
        .catch((err) => {
            const newReq = merge(req, { err });

            // Ready
            reqData.push(newReq);
            done(err);

            allDone += 1;
            if (allDone === promisesCount) { reject(reqData); }
        });
    })));
});

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
    .then(data => new Promise((resolve, reject) => {
        // Go through each element in data
        // Lets run audits per request
        data.forEach(req => req.urlsData.forEach(url => {
            desTest(`Auditing: ${url.originalUrl}`, () => {
                runAudit(req.auditsData, url, resolve, reject);
            });
        }));
    }));
};

/**
 * Sets up the testing environment
 *
 * @param {function} newDes
 * @param {function} newIt
 * @param {function} newWarn
 * @param {boolean} reset
 */
const setup = (newDes, newIt, newWarn, reset) => {
    if (newDes && typeof newDes !== 'function') {
        throw new Error('Describe needs to be a function');
    }

    if (newIt && typeof newIt !== 'function') {
        throw new Error('It needs to be a function');
    }

    if (newWarn && typeof newWarn !== 'function') {
        throw new Error('Warn needs to be a function');
    }

    // Reset
    if (reset) {
        desTest = itTest = logWarn = null;
    }

    desTest = newDes || desTest || function (msg, cb) {
        cb();
    };

    itTest = newIt || itTest || function (msg, cb) {
        const module = {
            done: (err) => {
                if (err) {
                    throw err;
                }
            },
            timeout: () => {}
        };

        cb.bind(module)(module.done);
    };

    /* eslint-disable no-console */
    logWarn = newWarn || logWarn || function (module, ...msg) { console.warn(module, ...msg); };
    /* eslint-enable no-console */
};

//-------------------------------------
// Runtime

if (argv && argv.mocha) {
    /* eslint-disable no-undef */
    setup(describe, it);
    /* eslint-enable no-undef */
} else {
    setup();
}
argv && argv.config && run(argv.config);
export { setup };
export { run };

// Essentially for testing purposes
export const __testMethods__ = { run, setup, gatherData, buildAudits, runAudit, runRule };
