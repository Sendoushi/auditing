'use strict';
/* global Promise */

import { getDom } from 'mrcrowley';
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
 * Scrapes
 *
 * @param  {object} data
 * @returns {promise}
 */
const run = (data) => {
    const src = typeof data.src === 'string' ? [data.src] : data.src;
    const type = typeof data.type === 'string' ? { of: data.type } : data.type;
    let reqSrc = src;

    // Lets parse sources into what we're expecting
    if (type.of === 'url') {
        reqSrc = getReqUrls(reqSrc, type.base, type.baseEnv);
    } else if (type.of === 'file') {
        reqSrc = reqSrc.map(val => ({ requestSrc: require(getPwd(val)), originalSrc: val }));
    } else {
        reqSrc = reqSrc.map(val => ({ requestSrc: val, originalSrc: val }));
    }

    // Finally lets set the promises
    const urlsPromises = reqSrc.map((req) => getDom(req.requestSrc, type.of)
    .then((domReq) => {
        req.domReq = domReq;
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

// Essentially for testing purposes
export const __testMethods__ = { run, getReqUrls };
