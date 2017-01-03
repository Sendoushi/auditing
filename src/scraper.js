'use strict';
/* global Promise */

import jsdom from 'jsdom';
import { isUrl } from './utils.js';

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
        return { requestUrl: reqUrl, originalUrl: url };
    });

    return urls;
};

/**
 * Gets DOM from url
 *
 * @param {string} url
 * @returns {promise}
 */
const getDom = (url) => {
    const promise = new Promise((resolve, reject) => {
        // Need to check if url is ok
        if (!isUrl(url)) {
            return reject(new Error('Url not valid'));
        }

        // Set jsdom...
        jsdom.env(url, ['http://code.jquery.com/jquery.js'], (err, window) => {
            if (err) {
                return reject(err);
            }

            // Cache the window
            resolve(window);
        });
    });

    return promise;
};

/**
 * Scrapes
 *
 * @param  {object} data
 * @returns {promise}
 */
const run = (data) => {
    const urls = typeof data.urls === 'string' ? [data.urls] : data.urls;
    const reqUrls = getReqUrls(urls, data.base, data.baseEnv);
    const urlsPromises = reqUrls.map((req) => getDom(req.requestUrl)
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
