'use strict';
/* global Promise */

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getDom = exports.run = undefined;

var _jsdom = require('jsdom');

var _jsdom2 = _interopRequireDefault(_jsdom);

var _utils = require('./utils.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//-------------------------------------
// Functions

/**
 * Get request urls
 *
 * @param {array|string} urls
 * @param {string} base
 * @param {string} baseEnv
 * @returns {array}
 */
var getReqUrls = function getReqUrls(urls, base, baseEnv) {
    baseEnv = baseEnv && process.env[baseEnv];
    base = baseEnv || base;

    urls = typeof urls === 'string' ? [urls] : urls;
    urls = urls.map(function (url) {
        var reqUrl = url;

        // Lets set the bases
        if (base) {
            if (base[base.length - 1] !== '/' && url[0] !== '/') {
                base += '/';
            } else if (base[base.length - 1] === '/' && url[0] === '/') {
                base = base.substring(0, base.length - 1);
            }

            reqUrl = base + reqUrl;
        }

        // Construct object
        return { requestUrl: reqUrl, originalUrl: url };
    });

    return urls;
};

/**
 * Gets DOM from url
 *
 * @param {string} url
 * @returns {promise}
 */
var getDom = function getDom(url) {
    var promise = new Promise(function (resolve, reject) {
        // Need to check if url is ok
        if (!(0, _utils.isUrl)(url)) {
            return reject(new Error('Url not valid'));
        }

        // Set jsdom...
        _jsdom2.default.env(url, ['http://code.jquery.com/jquery.js'], function (err, window) {
            if (err) {
                return reject(err);
            }

            // Cache the window
            resolve(window);
        });
    });

    return promise;
};

/**
 * Scrapes
 *
 * @param  {object} data
 * @returns {promise}
 */
var run = function run(data) {
    var urls = typeof data.urls === 'string' ? [data.urls] : data.urls;
    var reqUrls = getReqUrls(urls, data.base, data.baseEnv);
    var urlsPromises = reqUrls.map(function (req) {
        return getDom(req.requestUrl).then(function (window) {
            req.window = window;
            return req;
        }).catch(function (err) {
            req.err = err;
            throw req;
        });
    });

    return Promise.all(urlsPromises);
};

// --------------------------------
// Export

exports.run = run;
exports.getDom = getDom;

// Essentially for testing purposes
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zY3JhcGVyLmpzIl0sIm5hbWVzIjpbImdldFJlcVVybHMiLCJ1cmxzIiwiYmFzZSIsImJhc2VFbnYiLCJwcm9jZXNzIiwiZW52IiwibWFwIiwidXJsIiwicmVxVXJsIiwibGVuZ3RoIiwic3Vic3RyaW5nIiwicmVxdWVzdFVybCIsIm9yaWdpbmFsVXJsIiwiZ2V0RG9tIiwicHJvbWlzZSIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwiRXJyb3IiLCJlcnIiLCJ3aW5kb3ciLCJydW4iLCJkYXRhIiwicmVxVXJscyIsInVybHNQcm9taXNlcyIsInJlcSIsInRoZW4iLCJjYXRjaCIsImFsbCJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTs7Ozs7OztBQUVBOzs7O0FBQ0E7Ozs7QUFFQTtBQUNBOztBQUVBOzs7Ozs7OztBQVFBLElBQU1BLGFBQWEsU0FBYkEsVUFBYSxDQUFDQyxJQUFELEVBQU9DLElBQVAsRUFBYUMsT0FBYixFQUF5QjtBQUN4Q0EsY0FBVUEsV0FBV0MsUUFBUUMsR0FBUixDQUFZRixPQUFaLENBQXJCO0FBQ0FELFdBQU9DLFdBQVdELElBQWxCOztBQUVBRCxXQUFPLE9BQU9BLElBQVAsS0FBZ0IsUUFBaEIsR0FBMkIsQ0FBQ0EsSUFBRCxDQUEzQixHQUFvQ0EsSUFBM0M7QUFDQUEsV0FBT0EsS0FBS0ssR0FBTCxDQUFTLFVBQUNDLEdBQUQsRUFBUztBQUNyQixZQUFJQyxTQUFTRCxHQUFiOztBQUVBO0FBQ0EsWUFBSUwsSUFBSixFQUFVO0FBQ04sZ0JBQUlBLEtBQUtBLEtBQUtPLE1BQUwsR0FBYyxDQUFuQixNQUEwQixHQUExQixJQUFpQ0YsSUFBSSxDQUFKLE1BQVcsR0FBaEQsRUFBcUQ7QUFDakRMLHdCQUFRLEdBQVI7QUFDSCxhQUZELE1BRU8sSUFBSUEsS0FBS0EsS0FBS08sTUFBTCxHQUFjLENBQW5CLE1BQTBCLEdBQTFCLElBQWlDRixJQUFJLENBQUosTUFBVyxHQUFoRCxFQUFxRDtBQUN4REwsdUJBQU9BLEtBQUtRLFNBQUwsQ0FBZSxDQUFmLEVBQWtCUixLQUFLTyxNQUFMLEdBQWMsQ0FBaEMsQ0FBUDtBQUNIOztBQUVERCxxQkFBU04sT0FBT00sTUFBaEI7QUFDSDs7QUFFRDtBQUNBLGVBQU8sRUFBRUcsWUFBWUgsTUFBZCxFQUFzQkksYUFBYUwsR0FBbkMsRUFBUDtBQUNILEtBaEJNLENBQVA7O0FBa0JBLFdBQU9OLElBQVA7QUFDSCxDQXhCRDs7QUEwQkE7Ozs7OztBQU1BLElBQU1ZLFNBQVMsU0FBVEEsTUFBUyxDQUFDTixHQUFELEVBQVM7QUFDcEIsUUFBTU8sVUFBVSxJQUFJQyxPQUFKLENBQVksVUFBQ0MsT0FBRCxFQUFVQyxNQUFWLEVBQXFCO0FBQzdDO0FBQ0EsWUFBSSxDQUFDLGtCQUFNVixHQUFOLENBQUwsRUFBaUI7QUFDYixtQkFBT1UsT0FBTyxJQUFJQyxLQUFKLENBQVUsZUFBVixDQUFQLENBQVA7QUFDSDs7QUFFRDtBQUNBLHdCQUFNYixHQUFOLENBQVVFLEdBQVYsRUFBZSxDQUFDLGtDQUFELENBQWYsRUFBcUQsVUFBQ1ksR0FBRCxFQUFNQyxNQUFOLEVBQWlCO0FBQ2xFLGdCQUFJRCxHQUFKLEVBQVM7QUFDTCx1QkFBT0YsT0FBT0UsR0FBUCxDQUFQO0FBQ0g7O0FBRUQ7QUFDQUgsb0JBQVFJLE1BQVI7QUFDSCxTQVBEO0FBUUgsS0FmZSxDQUFoQjs7QUFpQkEsV0FBT04sT0FBUDtBQUNILENBbkJEOztBQXFCQTs7Ozs7O0FBTUEsSUFBTU8sTUFBTSxTQUFOQSxHQUFNLENBQUNDLElBQUQsRUFBVTtBQUNsQixRQUFNckIsT0FBTyxPQUFPcUIsS0FBS3JCLElBQVosS0FBcUIsUUFBckIsR0FBZ0MsQ0FBQ3FCLEtBQUtyQixJQUFOLENBQWhDLEdBQThDcUIsS0FBS3JCLElBQWhFO0FBQ0EsUUFBTXNCLFVBQVV2QixXQUFXQyxJQUFYLEVBQWlCcUIsS0FBS3BCLElBQXRCLEVBQTRCb0IsS0FBS25CLE9BQWpDLENBQWhCO0FBQ0EsUUFBTXFCLGVBQWVELFFBQVFqQixHQUFSLENBQVksVUFBQ21CLEdBQUQ7QUFBQSxlQUFTWixPQUFPWSxJQUFJZCxVQUFYLEVBQ3pDZSxJQUR5QyxDQUNwQyxVQUFDTixNQUFELEVBQVk7QUFDZEssZ0JBQUlMLE1BQUosR0FBYUEsTUFBYjtBQUNBLG1CQUFPSyxHQUFQO0FBQ0gsU0FKeUMsRUFLekNFLEtBTHlDLENBS25DLFVBQUNSLEdBQUQsRUFBUztBQUNaTSxnQkFBSU4sR0FBSixHQUFVQSxHQUFWO0FBQ0Esa0JBQU1NLEdBQU47QUFDSCxTQVJ5QyxDQUFUO0FBQUEsS0FBWixDQUFyQjs7QUFVQSxXQUFPVixRQUFRYSxHQUFSLENBQVlKLFlBQVosQ0FBUDtBQUNILENBZEQ7O0FBZ0JBO0FBQ0E7O1FBRVNILEcsR0FBQUEsRztRQUNBUixNLEdBQUFBLE07O0FBRVQiLCJmaWxlIjoic2NyYXBlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0Jztcbi8qIGdsb2JhbCBQcm9taXNlICovXG5cbmltcG9ydCBqc2RvbSBmcm9tICdqc2RvbSc7XG5pbXBvcnQgeyBpc1VybCB9IGZyb20gJy4vdXRpbHMuanMnO1xuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEZ1bmN0aW9uc1xuXG4vKipcbiAqIEdldCByZXF1ZXN0IHVybHNcbiAqXG4gKiBAcGFyYW0ge2FycmF5fHN0cmluZ30gdXJsc1xuICogQHBhcmFtIHtzdHJpbmd9IGJhc2VcbiAqIEBwYXJhbSB7c3RyaW5nfSBiYXNlRW52XG4gKiBAcmV0dXJucyB7YXJyYXl9XG4gKi9cbmNvbnN0IGdldFJlcVVybHMgPSAodXJscywgYmFzZSwgYmFzZUVudikgPT4ge1xuICAgIGJhc2VFbnYgPSBiYXNlRW52ICYmIHByb2Nlc3MuZW52W2Jhc2VFbnZdO1xuICAgIGJhc2UgPSBiYXNlRW52IHx8IGJhc2U7XG5cbiAgICB1cmxzID0gdHlwZW9mIHVybHMgPT09ICdzdHJpbmcnID8gW3VybHNdIDogdXJscztcbiAgICB1cmxzID0gdXJscy5tYXAoKHVybCkgPT4ge1xuICAgICAgICBsZXQgcmVxVXJsID0gdXJsO1xuXG4gICAgICAgIC8vIExldHMgc2V0IHRoZSBiYXNlc1xuICAgICAgICBpZiAoYmFzZSkge1xuICAgICAgICAgICAgaWYgKGJhc2VbYmFzZS5sZW5ndGggLSAxXSAhPT0gJy8nICYmIHVybFswXSAhPT0gJy8nKSB7XG4gICAgICAgICAgICAgICAgYmFzZSArPSAnLyc7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGJhc2VbYmFzZS5sZW5ndGggLSAxXSA9PT0gJy8nICYmIHVybFswXSA9PT0gJy8nKSB7XG4gICAgICAgICAgICAgICAgYmFzZSA9IGJhc2Uuc3Vic3RyaW5nKDAsIGJhc2UubGVuZ3RoIC0gMSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJlcVVybCA9IGJhc2UgKyByZXFVcmw7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDb25zdHJ1Y3Qgb2JqZWN0XG4gICAgICAgIHJldHVybiB7IHJlcXVlc3RVcmw6IHJlcVVybCwgb3JpZ2luYWxVcmw6IHVybCB9O1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHVybHM7XG59O1xuXG4vKipcbiAqIEdldHMgRE9NIGZyb20gdXJsXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHVybFxuICogQHJldHVybnMge3Byb21pc2V9XG4gKi9cbmNvbnN0IGdldERvbSA9ICh1cmwpID0+IHtcbiAgICBjb25zdCBwcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAvLyBOZWVkIHRvIGNoZWNrIGlmIHVybCBpcyBva1xuICAgICAgICBpZiAoIWlzVXJsKHVybCkpIHtcbiAgICAgICAgICAgIHJldHVybiByZWplY3QobmV3IEVycm9yKCdVcmwgbm90IHZhbGlkJykpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU2V0IGpzZG9tLi4uXG4gICAgICAgIGpzZG9tLmVudih1cmwsIFsnaHR0cDovL2NvZGUuanF1ZXJ5LmNvbS9qcXVlcnkuanMnXSwgKGVyciwgd2luZG93KSA9PiB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBDYWNoZSB0aGUgd2luZG93XG4gICAgICAgICAgICByZXNvbHZlKHdpbmRvdyk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHByb21pc2U7XG59O1xuXG4vKipcbiAqIFNjcmFwZXNcbiAqXG4gKiBAcGFyYW0gIHtvYmplY3R9IGRhdGFcbiAqIEByZXR1cm5zIHtwcm9taXNlfVxuICovXG5jb25zdCBydW4gPSAoZGF0YSkgPT4ge1xuICAgIGNvbnN0IHVybHMgPSB0eXBlb2YgZGF0YS51cmxzID09PSAnc3RyaW5nJyA/IFtkYXRhLnVybHNdIDogZGF0YS51cmxzO1xuICAgIGNvbnN0IHJlcVVybHMgPSBnZXRSZXFVcmxzKHVybHMsIGRhdGEuYmFzZSwgZGF0YS5iYXNlRW52KTtcbiAgICBjb25zdCB1cmxzUHJvbWlzZXMgPSByZXFVcmxzLm1hcCgocmVxKSA9PiBnZXREb20ocmVxLnJlcXVlc3RVcmwpXG4gICAgLnRoZW4oKHdpbmRvdykgPT4ge1xuICAgICAgICByZXEud2luZG93ID0gd2luZG93O1xuICAgICAgICByZXR1cm4gcmVxO1xuICAgIH0pXG4gICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgcmVxLmVyciA9IGVycjtcbiAgICAgICAgdGhyb3cgcmVxO1xuICAgIH0pKTtcblxuICAgIHJldHVybiBQcm9taXNlLmFsbCh1cmxzUHJvbWlzZXMpO1xufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEV4cG9ydFxuXG5leHBvcnQgeyBydW4gfTtcbmV4cG9ydCB7IGdldERvbSB9O1xuXG4vLyBFc3NlbnRpYWxseSBmb3IgdGVzdGluZyBwdXJwb3Nlc1xuZXhwb3J0IGNvbnN0IF9fdGVzdE1ldGhvZHNfXyA9IHsgcnVuLCBnZXREb20sIGdldFJlcVVybHMgfTtcbiJdfQ==