'use strict';
/* global Promise */

import chromeLauncher from 'lighthouse/lighthouse-cli/chrome-launcher.js';
import lighthouse from 'lighthouse';

//-------------------------------------
// Functions

/**
 * Checks if is compliant
 *
 * @param {object} req
 * @returns
 */
const isCompliant = (req) => {
    // Lighthouse doesn't complies with strings and as suchs needs the url
    const url = typeof req.requestUrl === 'string' ? req.requestUrl : req.requestUrl[0];

    // Now lets validate
    const launcher = new chromeLauncher.ChromeLauncher({
        port: 9222,
        autoSelectChrome: true
    });
    let cacheData;

    // Perform...
    return launcher.isDebuggerReady().catch(() => {
        /* eslint-disable no-console */
        console.log('Lighthouse', 'Launching Chrome...');
        /* eslint-enable no-console */
        return launcher.run();
    })
    .then(() => lighthouse(url, { output: 'json' }))
    .then((data) => {
        cacheData = data.audits;
        return data;
    })
    .then(() => launcher.kill())
    .then(() => {
        const keys = Object.keys(cacheData);
        let hasError = false;

        // Lets see if all is compliant
        for (let i = 0; i < keys.length; i += 1) {
            if (cacheData[keys[i]].score === false) {
                hasError = true;
                break;
            }
        }

        if (hasError) { throw cacheData; }

        return cacheData;
    });
};

//-------------------------------------
// Export

export default {
    name: 'lighthouse',
    rules: [
        { name: 'isCompliant', fn: isCompliant }
    ]
};
