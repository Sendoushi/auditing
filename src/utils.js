'use strict';
/* global Promise */

import fs from 'fs';
import path from 'path';
import isArray from 'lodash/isArray.js';

//-------------------------------------
// Functions

/**
 * Check if url is valid
 *
 * @param {string} url
 * @returns
 */
const isUrl = (url) => {
    const pattern = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
    return pattern.test(url);
};

/**
 * Gets pwd path
 * @param  {string} src
 * @return {string}
 */
const getPwd = (src) => {
    let newSrc = src;

    if (src && typeof src === 'string') {
        if (isUrl(src)) {
            return src;
        }

        newSrc = (src[0] !== '/') ? path.join(process.env.PWD, src) : src;
    } else if (src && isArray(src)) {
        newSrc = src.map(val => getPwd(val));
    }

    return newSrc;
};

/**
 * Returns file in raw mode
 * @param  {string} pathSrc
 * @param  {string} dirname
 * @return {string}
 */
const readFile = (pathSrc, dirname) => {
    const filename = !!dirname ? path.join(dirname, pathSrc) : path.resolve(pathSrc);

    if (!fs.existsSync(filename)) {
        return false;
    }

    return fs.readFileSync(filename, 'utf8');
};

/**
 * Is pattern in array
 *
 * @param {array} arr
 * @param {string} val
 * @returns
 */
const contains = (arr = [], val) => {
    let is = false;

    if (typeof arr === 'string') {
        arr = [arr];
    }

    if (typeof val !== 'string') {
        return is;
    }

    arr.forEach(pattern => {
        const reg = new RegExp(pattern.toLowerCase(), 'g');
        is = is || reg.test(val.toLowerCase());
    });

    return is;
};

// --------------------------------
// Export

export { isUrl };
export { getPwd };
export { readFile };
export { contains };

// Essentially for testing purposes
export const __testMethods__ = { isUrl, getPwd, readFile, contains };
