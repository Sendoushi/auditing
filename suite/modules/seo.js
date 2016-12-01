/* global Promise */

//-------------------------------------
// Functions

function gmetrix() {
    // TODO: ...
}

/**
 * Checks if is compliant
 *
 * @param {object} req
 * @returns
 */
function hasCanonical(req) {
    var promise;

    // Now lets validate
    promise = new Promise(function (resolve, reject) {
        var links = req.window.$('link');
        var hasIt;

        // Lets see if one of these is a canonical one
        links.each(function (i, val) {
            hasIt = hasIt || val.getAttribute('rel') === 'canonical';
        });

        if (!!hasIt) { resolve(true); } else { reject(false); }
    });

    return promise;
}

//-------------------------------------
// Export

module.exports = {
    name: 'seo',
    rules: [
        { name: 'hasCanonical', fn: hasCanonical }
    ]
};
