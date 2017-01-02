'use strict';
/* global Promise */

import w3cjs from 'w3cjs';

//-------------------------------------
// Functions

/**
 * Checks if is compliant
 *
 * @param {object} req
 * @returns
 */
const isCompliant = (req) => {
    const documentHtml = req.window.document.documentElement.outerHTML;

    // Now lets validate
    const promise = new Promise((resolve, reject) => {
        w3cjs.validate({
            input: documentHtml,
            callback: res => resolve(res && res.messages) || reject(res)
        });
    })
    .then((data) => {
        // Parse it as we expect it
        data = data.map((val) => ({ type: val.type, msg: val.message, original: val }));

        // Lets see if there is any error
        data.forEach(val => {
            if (val.type === 'error') { throw data; }
        });

        return data;
    });

    return promise;
};

//-------------------------------------
// Export

export default {
    name: 'w3',
    rules: [
        { name: 'isCompliant', fn: isCompliant }
    ]
};
