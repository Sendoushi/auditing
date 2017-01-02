'use strict';
/* global Promise */

import request from 'request';

//-------------------------------------
// Functions

/**
 * Checks if is compliant
 *
 * @param {object} req
 * @returns
 */
const isCompliant = (req) => {
    const apiUrl = 'http://achecker.ca/checkacc.php?uri=[[url]]&id=[[id]]&output=rest&guide=[[guide]]&offset=[[offset]]';
    const url = '';
    const offset = 10;
    const id = '';
    const guide = req.guide.join(',');
    const reqUrl = apiUrl.replace('[[url]]', url).replace('[[offset]]', offset).replace('[[id]]', id).replace('[[guide]]', guide);

    // Now lets validate
    const promise = new Promise((resolve, reject) => {
        if (!id) {
            return reject('An id is always required!');
        }

        request(reqUrl, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                resolve(body);
            }

            reject(error);
        });
    })
    .then((data) => {
        /* eslint-disable no-console */
        console.log(data);
        /* eslint-enable no-console */

        return data;
    });

    return promise;
};

//-------------------------------------
// Export

export default {
    name: 'wcag',
    rules: [
        { name: 'isCompliant', fn: isCompliant }
    ]
};
