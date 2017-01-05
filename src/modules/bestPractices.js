'use strict';
/* global Promise */

import path from 'path';

//-------------------------------------
// Functions

/**
 * Checks if js is versioned
 *
 * @param {object} req
 * @returns
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
 * @returns
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
        { name: 'hasCssVersion', fn: hasCssVersion },
        { name: 'hasJsVersion', fn: hasJsVersion }
    ]
};
