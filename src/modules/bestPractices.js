'use strict';
/* global Promise */

import path from 'path';
import { getUrl } from 'mrcrowley';

//-------------------------------------
// Functions

/**
 * Checks if there were logs in the console
 *
 * @param {object} req
 * @returns promise
 */
const hasntLogs = (req) => new Promise((resolve, reject) => {
    req.domReq.logs.length ? reject(req.domReq.logs) : resolve(true);
});

/**
 * Checks if there were warnings in the console
 *
 * @param {object} req
 * @returns promise
 */
const hasntWarns = (req) => new Promise((resolve, reject) => {
    req.domReq.warns.length ? reject(req.domReq.warns) : resolve(true);
});

/**
 * Checks if there were errors
 *
 * @param {object} req
 * @returns promise
 */
const hasntErrors = (req) => new Promise((resolve, reject) => {
    req.domReq.errors.length ? reject(req.domReq.errors) : resolve(true);
});

/**
 * Checks if js is versioned
 *
 * @param {object} req
 * @returns promise
 */
const hasJsVersion = (req) => new Promise((resolve, reject) => {
    const links = req.domReq.window.$('script');
    const safeIgnore = ['jquery', 'cdn', 'bootstrap'];
    let rejected = false;

    // Lets see if one of these doesn't have versioning
    links.each((i, val) => {
        if (rejected) { return; }

        let href = val.getAttribute('src');

        // Just ignore
        if (typeof href !== 'string' || href === '') {
            return;
        }

        // Lets ignore common things we don't want to version out
        const ignored = safeIgnore.map(ign => (new RegExp(ign, 'g')).exec(href)).filter(ign => !!ign)[0];
        if (ignored) { return; }

        href = path.basename(href);
        const firstVersion = /.+\.(.+)\.js/g.exec(href);
        const secondVersion = /.+\.js\?.+/g.exec(href);
        const thirdVersion = href.length > 20;

        rejected = rejected || !firstVersion && !secondVersion && !thirdVersion && href;
    });

    // Everything must've went fine
    !rejected ? resolve(true) : reject(rejected);
});

/**
 * Checks if css is versioned
 *
 * @param {object} req
 * @returns promise
 */
const hasCssVersion = (req) => new Promise((resolve, reject) => {
    const links = req.domReq.window.$('link[rel="stylesheet"]');
    const safeIgnore = ['jquery', 'cdn', 'bootstrap'];
    let rejected = false;

    // Lets see if one of these doesn't have versioning
    links.each((i, val) => {
        if (rejected) { return; }

        let href = val.getAttribute('href');

        // Just ignore
        if (typeof href !== 'string' || href === '') {
            return;
        }

        // Lets ignore common things we don't want to version out
        const ignored = safeIgnore.map(ign => (new RegExp(ign, 'g')).exec(href)).filter(ign => !!ign)[0];
        if (ignored) { return; }

        href = path.basename(href);
        const firstVersion = /.+\.(.+)\.css/g.exec(href);
        const secondVersion = /.+\.css\?.+/g.exec(href);
        const thirdVersion = href.length > 20;

        rejected = rejected || !firstVersion && !secondVersion && !thirdVersion && href;
    });

    // Everything must've went fine
    !rejected ? resolve(true) : reject(rejected);
});

/**
 * Check if all css is minified
 *
 * @param {object} req
 * @returns promise
 */
const isCssMinified = (req) => new Promise((resolve, reject) => {
    const cssPattern = /<link.*?stylesheet.*?=['|"](.+?\.css)['|"].*?>/g;
    const markup = req.domReq.window.document.documentElement.innerHTML;
    let links = markup.match(cssPattern);

    // Lets get just the actual links
    links = links && links.map(val => {
        val = val.match(/href=['|"](.+)['|"]/g);
        val = val[0].replace(/href=['|"]/g, '').replace(/['|"]/g, '');

        if (!val.match(/(http[^|\s])/g)) {
            // TODO: This won't work without a protocol... We could actually check the requestSrc
            /* eslint-disable no-console */
            console.warn(`${val} isn\'t being tested with rule "isCssMinified" because it has no full route with protocol. Eventually I'll get to this issue.`);
            /* eslint-enable no-console */
            return false;
        } else if (val.match(/\.min\./g)) {
            // No need to go further if the file actually states so
            return false;
        }

        return val;
    }).filter(val => !!val);

    if (!links || !links.length) {
        return resolve(true);
    }

    // Lets run all promises
    // We need to request it now
    const promises = links.map(val => getUrl(val).then(content => {
        const firstParam = /} \./g.exec(content) || /.* }/g.exec(content);
        const secondParam = /; .*/g.exec(content) || /: .*/g.exec(content);

        // TODO: Improve...

        if (firstParam || secondParam) {
            throw new Error(val);
        }

        // Everything must've went fine
        return true;
    }));

    // Run it all
    Promise.all(promises).then(data => {
        const dataResults = data.filter(val => val !== true);

        if (dataResults.length) {
            throw new Error(dataResults[0]);
        }

        resolve(true);
    }).catch(reject);
});

/**
 * Check if all js is minified
 *
 * @param {object} req
 * @returns promise
 */
const isJsMinified = (req) => new Promise((resolve, reject) => {
    const scriptPattern = /<script.*?src=['|"](.+?\.js)['|"].*?\/script>/g;
    const markup = req.domReq.window.document.documentElement.innerHTML;
    let links = markup.match(scriptPattern);

    // Lets get just the actual links
    links = links && links.map(val => {
        val = val.match(/src=['|"](.+)['|"]/g);
        val = val[0].replace(/src=['|"]/g, '').replace(/['|"]/g, '');

        if (!val.match(/(http[^|\s])/g)) {
            // TODO: This won't work without a protocol... We could actually check the requestSrc
            /* eslint-disable no-console */
            console.warn(`${val} isn\'t being tested with rule "isJsMinified" because it has no full route with protocol. Eventually I'll get to this issue.`);
            /* eslint-enable no-console */
        } else if (val.match(/\.min\./g)) {
            // No need to go further if the file actually states so
            return false;
        }

        return val;
    }).filter(val => !!val);

    if (!links || !links.length) {
        return resolve(true);
    }

    // Lets run all promises
    // We need to request it now
    const promises = links.map(val => getUrl(val).then(content => {
        const firstParam = /} \./g.exec(content) || /.* }/g.exec(content);
        // These don't work with some minifiers (like for example jquery)
        // const secondParam = /; .*/g.exec(content) || /: .*/g.exec(content);

        // TODO: Improve...

        if (firstParam) {
            throw new Error(val);
        }

        // Everything must've went fine
        return true;
    }));

    // Run it all
    Promise.all(promises).then(data => {
        const dataResults = data.filter(val => val !== true);

        if (dataResults.length) {
            throw new Error(dataResults[0]);
        }

        resolve(true);
    }).catch(reject);
});

/**
 * Check if has css prefixes
 *
 * @param {object} req
 * @returns promise
 */
const hasCssPrefixes = () => new Promise((resolve) => {
    // TODO: ...
    resolve();
});

//-------------------------------------
// Export

export default {
    name: 'bestPractices',
    rules: [
        { name: 'hasntLogs', fn: hasntLogs },
        { name: 'hasntWarns', fn: hasntWarns },
        { name: 'hasntErrors', fn: hasntErrors },
        { name: 'hasCssVersion', fn: hasCssVersion },
        { name: 'hasJsVersion', fn: hasJsVersion },
        { name: 'isCssMinified', fn: isCssMinified },
        { name: 'isJsMinified', fn: isJsMinified },
        { name: 'hasCssPrefixes', fn: hasCssPrefixes }
    ]
};
