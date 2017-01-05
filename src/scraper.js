'use strict';
/* global Promise */

import jsdom from 'jsdom';
import resourceLoader from 'jsdom/lib/jsdom/browser/resource-loader';
import toughCookie from 'tough-cookie';
import { isUrl } from './utils.js';
import { getPwd } from './utils.js';

//-------------------------------------
// Functions

/**
 * Gets url markup
 *
 * @param {string} url
 * @returns {promise}
 */
const getUrlMarkup = (url) => new Promise((resolve, reject) => {
    if (typeof url !== 'string') {
        throw new Error('Url needs to be a string');
    }

    const options = {
        defaultEncoding: 'windows-1252',
        detectMetaCharset: true,
        // headers: config.headers,
        pool: {
            maxSockets: 6
        },
        strictSSL: true,
        // proxy: config.proxy,
        cookieJar: new toughCookie.CookieJar(null, { looseMode: true }),
        userAgent: `Node.js (${process.platform}; U; rv:${process.version}) AppleWebKit/537.36 (KHTML, like Gecko)`,
        // agent: config.agent,
        // agentClass: config.agentClass,
        agentOptions: {
            keepAlive: true,
            keepAliveMsecs: 115 * 1000
        }
    };

    // Finally download it!
    resourceLoader.download(url, options, (err, responseText) => {
        if (err) {
            return reject(err);
        }

        resolve(responseText);
    });
});

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
 * @param {string|object} type
 * @returns {promise}
 */
const getDom = (src, type) => {
    type = typeof type === 'string' ? { of: type } : type;

    const promise = new Promise((resolve, reject) => {
        // Need to check if url is ok
        if (type.of === 'url' && !isUrl(src)) {
            return reject(new Error('Url not valid'));
        }

        resolve();
    })
    .then(() => {
        // It is already markup
        if (type.of === 'content' || type.of === 'file') {
            return src;
        }

        // Lets get the markup
        return getUrlMarkup(src);
    })
    .then(markup => new Promise((resolve, reject) => {
        // Lets force markup to have jquery
        // This is accepted by jsdom.jsdom and jsdom.env
        const jqueryScript = '<script type="text/javascript" src="http://code.jquery.com/jquery.js"></script>';
        if (markup.indexOf('<head>') !== -1) {
            markup = markup.replace('<head>', `<head>${jqueryScript}`);
        } else if (markup.indexOf('<body>') !== -1) {
            markup = markup.replace('<body>', `<body>${jqueryScript}`);
        }

        // Prepare for possible errors
        const virtualConsole = jsdom.createVirtualConsole();
        const errors = [];
        const logs = [];
        const warns = [];

        virtualConsole.on('jsdomError', error => { errors.push(error); });
        virtualConsole.on('error', error => { errors.push(error); });
        virtualConsole.on('log', log => { logs.push(log); });
        virtualConsole.on('warn', warn => { warns.push(warn); });

        // Config
        const config = {
            html: markup,
            virtualConsole,
            features: {
                FetchExternalResources: ['script', 'link'],
                ProcessExternalResources: ['script'],
                SkipExternalResources: false
            },
            done: (err, window) => {
                if (err) { return reject(err); }
                resolve({ window, errors, logs, warns, preMarkup: markup });
            }
        };

        // Now for the actual getting
        jsdom.env(config);
    }));

    return promise;
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
    const urlsPromises = reqSrc.map((req) => getDom(req.requestSrc, type)
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
export { getDom };
export { getUrlMarkup };

// Essentially for testing purposes
export const __testMethods__ = { run, getDom, getReqUrls, getUrlMarkup };
