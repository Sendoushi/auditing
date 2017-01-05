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
    const promise = new Promise((resolve) => {
        const bodyHtml = req.domReq.window.$('body').html();

        if (!bodyHtml.length) {
            throw new Error('No body found');
        }

        resolve(true);
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
