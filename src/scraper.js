/* eslint-disable strict */
'use strict';
/* eslint-enable strict */
/* global Promise */

// Import packages
var jsdom = require('jsdom');
var bedrockPath = require('bedrock-utils/src/node/path.js');

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
function getReqUrls(urls, base, baseEnv) {
    baseEnv = baseEnv && process.env[baseEnv];
    base = baseEnv || base;

    urls = typeof urls === 'string' ? [urls] : urls;
    urls = urls.map(function (url) {
        var reqUrl = url;

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
}

/**
 * Gets DOM from url
 *
 * @param {string} url
 * @returns {promise}
 */
function getDom(url) {
    var promise = new Promise(function (resolve, reject) {
        // Need to check if url is ok
        if (!bedrockPath.isUrl(url)) {
            return reject(new Error('Url not valid'));
        }

        // Set jsdom...
        jsdom.env(url, ['http://code.jquery.com/jquery.js'], function (err, window) {
            if (err) {
                return reject(err);
            }

            // Cache the window
            resolve(window);
        });
    });

    return promise;
}

/**
 * Scrapes
 *
 * @param  {object} data
 * @returns {promise}
 */
function run(data) {
    var urls = typeof data.urls === 'string' ? [data.urls] : data.urls;
    var reqUrls = getReqUrls(urls, data.base, data.baseEnv);
    var urlsPromises = reqUrls.map(function (req) {
        // Request DOM of each
        return getDom(req.requestUrl)
        .then(function (window) {
            req.window = window;
            return req;
        })
        .catch(function (err) {
            req.err = err;
            throw req;
        });
    });

    return Promise.all(urlsPromises);
}

// --------------------------------
// Export

module.exports = {
    run: run,
    getDom: getDom,

    // Essentially for testing purposes
    'test.get': function (req) {
        var methods = {
            getReqUrls: getReqUrls
        };

        return methods[req];
    }
};
