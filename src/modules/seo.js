'use strict';
/* global Promise */

//-------------------------------------
// Functions

// function gmetrix() {
// TODO: ...
// }

/**
 * Checks if is compliant
 *
 * @param {object} req
 * @returns
 */
const hasCanonical = (req) => {
    // Now lets validate
    const promise = new Promise((resolve, reject) => {
        const links = req.window.$('link');
        let hasIt;

        // Lets see if one of these is a canonical one
        links.each((i, val) => {
            hasIt = hasIt || val.getAttribute('rel') === 'canonical';
        });

        if (!!hasIt) { resolve(true); } else { reject(false); }
    });

    return promise;
};

//-------------------------------------
// Export

export default {
    name: 'seo',
    rules: [
        { name: 'hasCanonical', fn: hasCanonical }
    ]
};
