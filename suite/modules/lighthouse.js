/* global Promise */
var chromeLauncher = require('lighthouse/lighthouse-cli/chrome-launcher.js');
var lighthouse = require('lighthouse');
var logger = require('bedrock-utils/src/logger.js');

//-------------------------------------
// Functions


/**
 * Checks if is compliant
 *
 * @param {object} req
 * @returns
 */
function isCompliant(req) {
    // Lighthouse doesn't complies with strings and as suchs needs the url
    var url = typeof req.requestUrl === 'string' ? req.requestUrl : req.requestUrl[0];

    // Now lets validate
    var launcher = new chromeLauncher.ChromeLauncher({
        port: 9222,
        autoSelectChrome: true
    });
    var cacheData;

    // Perform...
    return launcher.isDebuggerReady().catch(() => {
        logger.log('Lighthouse', 'Launching Chrome...');
        return launcher.run();
    })
    .then(() => lighthouse(url, { output: 'json' }))
    .then(function (data) {
        cacheData = data.audits;
        return data;
    })
    .then(() => launcher.kill())
    .then(function () {
        var keys = Object.keys(cacheData);
        var hasError = false;
        var i;

        // Lets see if all is compliant
        for (i = 0; i < keys.length; i += 1) {
            if (cacheData[keys[i]].score === false) {
                hasError = true;
                break;
            }
        }

        if (hasError) { throw cacheData; }

        return cacheData;
    });
}

//-------------------------------------
// Export

module.exports = {
    name: 'lighthouse',
    rules: [
        { name: 'isCompliant', fn: isCompliant }
    ]
};
