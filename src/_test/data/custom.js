'use strict';
/* global Promise */

//-------------------------------------
// Functions

/**
 * Checks if exists a body
 *
 * @param {object} req
 * @returns
 */
const hasBody = (req) => {
    const promise = new Promise((resolve, reject) => {
        const bodyHtml = req.window.$('body').html();

        if (bodyHtml.length) {
            resolve(true);
        } else {
            reject(false);
        }
    });

    return promise;
};

//-------------------------------------
// Export

export default {
    name: 'custom',
    rules: [
        { name: 'hasBody', fn: hasBody }
    ]
};
