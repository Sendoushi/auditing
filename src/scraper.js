'use strict';
/* global Promise */

import jsdom from 'jsdom';
import { isUrl } from './utils.js';
import { getPwd } from './utils.js';

//-------------------------------------
// Functions

/**
 * Get request urls
 *
 * @param {array|string} urls
 * @param {string} base
 * @param {string} baseEnv
 * @returns {array}
 */
const getReqUrls = (urls, base, baseEnv) => {
    baseEnv = baseEnv && process.env[baseEnv];
    base = baseEnv || base;

    urls = typeof urls === 'string' ? [urls] : urls;
    urls = urls.map((url) => {
        let reqUrl = url;

        // Lets set the bases
        if (base) {
            if (base[base.length - 1] !== '/' && url[0] !== '/') {
                base += '/';
            } else if (base[base.length - 1] === '/' && url[0] === '/') {
                base = base.substring(0, base.length - 1);
            }

            reqUrl = base + reqUrl;
        }

        // Construct object
        return { requestSrc: reqUrl, originalSrc: url };
    });

    return urls;
};

/**
 * Gets DOM from url
 *
 * @param {string} src
 * @param {string} type
 * @returns {promise}
 */
const getDom = (src, type) => new Promise((resolve, reject) => {
    // Need to check if url is ok
    if (type === 'url' && !isUrl(src)) {
        return reject(new Error('Url not valid'));
    }

    // Set jsdom...
    jsdom.env(src, ['http://code.jquery.com/jquery.js'], (err, window) => {
        if (err) {
            return reject(err);
        }

        // Cache the window
        resolve(window);
    });
});

/**
 * Scrapes
 *
 * @param  {object} data
 * @returns {promise}
 */
const run = (data) => {
    const src = typeof data.src === 'string' ? [data.src] : data.src;
    let reqSrc = src;

    // Lets parse sources into what we're expecting
    if (data.type === 'url') {
        reqSrc = getReqUrls(reqSrc, data.base, data.baseEnv);
    } else if (data.type === 'file') {
        reqSrc = reqSrc.map(val => ({ requestSrc: require(getPwd(val)), originalSrc: val }));
    } else {
        reqSrc = reqSrc.map(val => ({ requestSrc: val, originalSrc: val }));
    }

    // Finally lets set the promises
    const urlsPromises = reqSrc.map((req) => getDom(req.requestSrc, data.type)
    .then((window) => {
        req.window = window;
        return req;
    })
    .catch((err) => {
        req.err = err;
        throw req;
    }));

    return Promise.all(urlsPromises);
};

// --------------------------------
// Export

export { run };
export { getDom };

// Essentially for testing purposes
export const __testMethods__ = { run, getDom, getReqUrls };
