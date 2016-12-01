/* global Promise */
var w3cjs = require('w3cjs');

//-------------------------------------
// Functions

/**
 * Checks if is compliant
 *
 * @param {object} req
 * @returns
 */
function isCompliant(req) {
    var documentHtml = req.window.document.documentElement.outerHTML;
    var promise;

    // Now lets validate
    promise = new Promise(function (resolve, reject) {
        w3cjs.validate({
            input: documentHtml,
            callback: res => resolve(res && res.messages) || reject(res)
        });
    })
    .then(function (data) {
        // Parse it as we expect it
        data = data.map(function (val) {
            return {
                type: val.type,
                msg: val.message,
                original: val
            };
        });

        // Lets see if there is any error
        data.forEach(val => {
            if (val.type === 'error') { throw data; }
        });

        return data;
    });

    return promise;
}

//-------------------------------------
// Export

module.exports = {
    name: 'w3',
    rules: [
        { name: 'isCompliant', fn: isCompliant }
    ]
};
