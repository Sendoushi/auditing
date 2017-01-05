'use strict';
/* global Promise */

//-------------------------------------
// Functions

/**
 * Checks if has google analytics
 *
 * @param {object} req
 * @returns promise
 */
const hasGoogleAnalytics = (req) => new Promise((resolve, reject) => {
    const markup = req.domReq.window.document.documentElement.innerHTML;
    const firstVersion = /[<script>][^_]+(https:\/\/www\.google-analytics\.com\/analytics\.js+)[^_]+<\/script>/g.exec(markup);
    const secondVersion = /[<script>][^_]+(https:\/\/www\.googletagmanager\.com\/gtm\.js\?id=+)[^_]+<\/script>/g.exec(markup);
    const rejected = !firstVersion && !secondVersion;

    // Everything must've went fine
    !rejected ? resolve(true) : reject(false);
});

//-------------------------------------
// Export

export default {
    name: 'analytics',
    rules: [
        { name: 'hasGoogleAnalytics', fn: hasGoogleAnalytics }
    ]
};
