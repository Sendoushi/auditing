'use strict';
/* global Promise */

import path from 'path';

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
    const safeIgnore = ['jquery', 'cdn'];
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
    const safeIgnore = ['jquery', 'cdn'];
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

//-------------------------------------
// Export

export default {
    name: 'bestPractices',
    rules: [
        { name: 'hasntLogs', fn: hasntLogs },
        { name: 'hasntWarns', fn: hasntWarns },
        { name: 'hasntErrors', fn: hasntErrors },
        { name: 'hasCssVersion', fn: hasCssVersion },
        { name: 'hasJsVersion', fn: hasJsVersion }
    ]
};
