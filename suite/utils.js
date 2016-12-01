/* eslint-disable strict */
'use strict';
/* eslint-enable strict */

//-------------------------------------
// Vars / Imports

var fs = require('fs');
var path = require('path');

//-------------------------------------
// Functions

/**
 * Check if url is valid
 *
 * @param {string} url
 * @returns
 */
function isUrl(url) {
    var pattern = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;

    return pattern.test(url);
}

/**
 * Gets path
 * @param  {string||array} src
 * @return {string}
 */
function getPath(src) {
    var newSrc = src;

    if (src && typeof src === 'string') {
        if (isUrl(src)) {
            return src;
        }

        newSrc = (src[0] !== '/') ? path.join(process.env.PWD, src) : src;
    } else if (src && typeof src === 'object' && src.hasOwnProperty('length')) {
        newSrc = src.map(function (val) { return getPath(val); });
    }

    return newSrc;
}

/**
 * Returns file in raw mode
 * @param  {string} pathSrc
 * @return {string}
 */
function readFile(pathSrc) {
    var filename = path.resolve(pathSrc);

    if (!fs.existsSync(filename)) {
        return false;
    }

    return fs.readFileSync(filename, 'utf8');
}

//-------------------------------------
// Export

module.exports = {
    isUrl: isUrl,
    getPath: getPath,
    readFile: readFile
};
