/* global Promise */

//-------------------------------------
// Functions

/**
 * Checks if exists a body
 *
 * @param {object} req
 * @returns
 */
function hasBody(req) {
    var promise = new Promise(function (resolve, reject) {
        var bodyHtml = req.window.$('body').html();

        if (bodyHtml.length) {
            resolve(true);
        } else {
            reject(false);
        }
    });

    return promise;
}

//-------------------------------------
// Export

module.exports = {
    name: 'custom',
    rules: [
        { name: 'hasBody', fn: hasBody }
    ]
};
