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
        // Request DOM of each
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zY3JhcGVyLmpzIl0sIm5hbWVzIjpbImdldFJlcVVybHMiLCJ1cmxzIiwiYmFzZSIsImJhc2VFbnYiLCJwcm9jZXNzIiwiZW52IiwibWFwIiwidXJsIiwicmVxVXJsIiwibGVuZ3RoIiwic3Vic3RyaW5nIiwicmVxdWVzdFVybCIsIm9yaWdpbmFsVXJsIiwiZ2V0RG9tIiwicHJvbWlzZSIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwiRXJyb3IiLCJlcnIiLCJ3aW5kb3ciLCJydW4iLCJkYXRhIiwicmVxVXJscyIsInVybHNQcm9taXNlcyIsInJlcSIsInRoZW4iLCJjYXRjaCIsImFsbCJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTs7Ozs7OztBQUVBOzs7O0FBQ0E7Ozs7QUFFQTtBQUNBOztBQUVBOzs7Ozs7OztBQVFBLElBQU1BLGFBQWEsU0FBYkEsVUFBYSxDQUFDQyxJQUFELEVBQU9DLElBQVAsRUFBYUMsT0FBYixFQUF5QjtBQUN4Q0EsY0FBVUEsV0FBV0MsUUFBUUMsR0FBUixDQUFZRixPQUFaLENBQXJCO0FBQ0FELFdBQU9DLFdBQVdELElBQWxCOztBQUVBRCxXQUFPLE9BQU9BLElBQVAsS0FBZ0IsUUFBaEIsR0FBMkIsQ0FBQ0EsSUFBRCxDQUEzQixHQUFvQ0EsSUFBM0M7QUFDQUEsV0FBT0EsS0FBS0ssR0FBTCxDQUFTLFVBQUNDLEdBQUQsRUFBUztBQUNyQixZQUFJQyxTQUFTRCxHQUFiOztBQUVBO0FBQ0EsWUFBSUwsSUFBSixFQUFVO0FBQ04sZ0JBQUlBLEtBQUtBLEtBQUtPLE1BQUwsR0FBYyxDQUFuQixNQUEwQixHQUExQixJQUFpQ0YsSUFBSSxDQUFKLE1BQVcsR0FBaEQsRUFBcUQ7QUFDakRMLHdCQUFRLEdBQVI7QUFDSCxhQUZELE1BRU8sSUFBSUEsS0FBS0EsS0FBS08sTUFBTCxHQUFjLENBQW5CLE1BQTBCLEdBQTFCLElBQWlDRixJQUFJLENBQUosTUFBVyxHQUFoRCxFQUFxRDtBQUN4REwsdUJBQU9BLEtBQUtRLFNBQUwsQ0FBZSxDQUFmLEVBQWtCUixLQUFLTyxNQUFMLEdBQWMsQ0FBaEMsQ0FBUDtBQUNIOztBQUVERCxxQkFBU04sT0FBT00sTUFBaEI7QUFDSDs7QUFFRDtBQUNBLGVBQU8sRUFBRUcsWUFBWUgsTUFBZCxFQUFzQkksYUFBYUwsR0FBbkMsRUFBUDtBQUNILEtBaEJNLENBQVA7O0FBa0JBLFdBQU9OLElBQVA7QUFDSCxDQXhCRDs7QUEwQkE7Ozs7OztBQU1BLElBQU1ZLFNBQVMsU0FBVEEsTUFBUyxDQUFDTixHQUFELEVBQVM7QUFDcEIsUUFBTU8sVUFBVSxJQUFJQyxPQUFKLENBQVksVUFBQ0MsT0FBRCxFQUFVQyxNQUFWLEVBQXFCO0FBQzdDO0FBQ0EsWUFBSSxDQUFDLGtCQUFNVixHQUFOLENBQUwsRUFBaUI7QUFDYixtQkFBT1UsT0FBTyxJQUFJQyxLQUFKLENBQVUsZUFBVixDQUFQLENBQVA7QUFDSDs7QUFFRDtBQUNBLHdCQUFNYixHQUFOLENBQVVFLEdBQVYsRUFBZSxDQUFDLGtDQUFELENBQWYsRUFBcUQsVUFBQ1ksR0FBRCxFQUFNQyxNQUFOLEVBQWlCO0FBQ2xFLGdCQUFJRCxHQUFKLEVBQVM7QUFDTCx1QkFBT0YsT0FBT0UsR0FBUCxDQUFQO0FBQ0g7O0FBRUQ7QUFDQUgsb0JBQVFJLE1BQVI7QUFDSCxTQVBEO0FBUUgsS0FmZSxDQUFoQjs7QUFpQkEsV0FBT04sT0FBUDtBQUNILENBbkJEOztBQXFCQTs7Ozs7O0FBTUEsSUFBTU8sTUFBTSxTQUFOQSxHQUFNLENBQUNDLElBQUQsRUFBVTtBQUNsQixRQUFNckIsT0FBTyxPQUFPcUIsS0FBS3JCLElBQVosS0FBcUIsUUFBckIsR0FBZ0MsQ0FBQ3FCLEtBQUtyQixJQUFOLENBQWhDLEdBQThDcUIsS0FBS3JCLElBQWhFO0FBQ0EsUUFBTXNCLFVBQVV2QixXQUFXQyxJQUFYLEVBQWlCcUIsS0FBS3BCLElBQXRCLEVBQTRCb0IsS0FBS25CLE9BQWpDLENBQWhCO0FBQ0EsUUFBTXFCLGVBQWVELFFBQVFqQixHQUFSLENBQVksVUFBQ21CLEdBQUQsRUFBUztBQUN0QztBQUNBLGVBQU9aLE9BQU9ZLElBQUlkLFVBQVgsRUFDTmUsSUFETSxDQUNELFVBQUNOLE1BQUQsRUFBWTtBQUNkSyxnQkFBSUwsTUFBSixHQUFhQSxNQUFiO0FBQ0EsbUJBQU9LLEdBQVA7QUFDSCxTQUpNLEVBS05FLEtBTE0sQ0FLQSxVQUFDUixHQUFELEVBQVM7QUFDWk0sZ0JBQUlOLEdBQUosR0FBVUEsR0FBVjtBQUNBLGtCQUFNTSxHQUFOO0FBQ0gsU0FSTSxDQUFQO0FBU0gsS0FYb0IsQ0FBckI7O0FBYUEsV0FBT1YsUUFBUWEsR0FBUixDQUFZSixZQUFaLENBQVA7QUFDSCxDQWpCRDs7QUFtQkE7QUFDQTs7UUFFU0gsRyxHQUFBQSxHO1FBQ0FSLE0sR0FBQUEsTTs7QUFFVCIsImZpbGUiOiJzY3JhcGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuLyogZ2xvYmFsIFByb21pc2UgKi9cblxuaW1wb3J0IGpzZG9tIGZyb20gJ2pzZG9tJztcbmltcG9ydCB7IGlzVXJsIH0gZnJvbSAnLi91dGlscy5qcyc7XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gRnVuY3Rpb25zXG5cbi8qKlxuICogR2V0IHJlcXVlc3QgdXJsc1xuICpcbiAqIEBwYXJhbSB7YXJyYXl8c3RyaW5nfSB1cmxzXG4gKiBAcGFyYW0ge3N0cmluZ30gYmFzZVxuICogQHBhcmFtIHtzdHJpbmd9IGJhc2VFbnZcbiAqIEByZXR1cm5zIHthcnJheX1cbiAqL1xuY29uc3QgZ2V0UmVxVXJscyA9ICh1cmxzLCBiYXNlLCBiYXNlRW52KSA9PiB7XG4gICAgYmFzZUVudiA9IGJhc2VFbnYgJiYgcHJvY2Vzcy5lbnZbYmFzZUVudl07XG4gICAgYmFzZSA9IGJhc2VFbnYgfHwgYmFzZTtcblxuICAgIHVybHMgPSB0eXBlb2YgdXJscyA9PT0gJ3N0cmluZycgPyBbdXJsc10gOiB1cmxzO1xuICAgIHVybHMgPSB1cmxzLm1hcCgodXJsKSA9PiB7XG4gICAgICAgIGxldCByZXFVcmwgPSB1cmw7XG5cbiAgICAgICAgLy8gTGV0cyBzZXQgdGhlIGJhc2VzXG4gICAgICAgIGlmIChiYXNlKSB7XG4gICAgICAgICAgICBpZiAoYmFzZVtiYXNlLmxlbmd0aCAtIDFdICE9PSAnLycgJiYgdXJsWzBdICE9PSAnLycpIHtcbiAgICAgICAgICAgICAgICBiYXNlICs9ICcvJztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYmFzZVtiYXNlLmxlbmd0aCAtIDFdID09PSAnLycgJiYgdXJsWzBdID09PSAnLycpIHtcbiAgICAgICAgICAgICAgICBiYXNlID0gYmFzZS5zdWJzdHJpbmcoMCwgYmFzZS5sZW5ndGggLSAxKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmVxVXJsID0gYmFzZSArIHJlcVVybDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENvbnN0cnVjdCBvYmplY3RcbiAgICAgICAgcmV0dXJuIHsgcmVxdWVzdFVybDogcmVxVXJsLCBvcmlnaW5hbFVybDogdXJsIH07XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdXJscztcbn07XG5cbi8qKlxuICogR2V0cyBET00gZnJvbSB1cmxcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsXG4gKiBAcmV0dXJucyB7cHJvbWlzZX1cbiAqL1xuY29uc3QgZ2V0RG9tID0gKHVybCkgPT4ge1xuICAgIGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIC8vIE5lZWQgdG8gY2hlY2sgaWYgdXJsIGlzIG9rXG4gICAgICAgIGlmICghaXNVcmwodXJsKSkge1xuICAgICAgICAgICAgcmV0dXJuIHJlamVjdChuZXcgRXJyb3IoJ1VybCBub3QgdmFsaWQnKSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTZXQganNkb20uLi5cbiAgICAgICAganNkb20uZW52KHVybCwgWydodHRwOi8vY29kZS5qcXVlcnkuY29tL2pxdWVyeS5qcyddLCAoZXJyLCB3aW5kb3cpID0+IHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVqZWN0KGVycik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIENhY2hlIHRoZSB3aW5kb3dcbiAgICAgICAgICAgIHJlc29sdmUod2luZG93KTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gcHJvbWlzZTtcbn07XG5cbi8qKlxuICogU2NyYXBlc1xuICpcbiAqIEBwYXJhbSAge29iamVjdH0gZGF0YVxuICogQHJldHVybnMge3Byb21pc2V9XG4gKi9cbmNvbnN0IHJ1biA9IChkYXRhKSA9PiB7XG4gICAgY29uc3QgdXJscyA9IHR5cGVvZiBkYXRhLnVybHMgPT09ICdzdHJpbmcnID8gW2RhdGEudXJsc10gOiBkYXRhLnVybHM7XG4gICAgY29uc3QgcmVxVXJscyA9IGdldFJlcVVybHModXJscywgZGF0YS5iYXNlLCBkYXRhLmJhc2VFbnYpO1xuICAgIGNvbnN0IHVybHNQcm9taXNlcyA9IHJlcVVybHMubWFwKChyZXEpID0+IHtcbiAgICAgICAgLy8gUmVxdWVzdCBET00gb2YgZWFjaFxuICAgICAgICByZXR1cm4gZ2V0RG9tKHJlcS5yZXF1ZXN0VXJsKVxuICAgICAgICAudGhlbigod2luZG93KSA9PiB7XG4gICAgICAgICAgICByZXEud2luZG93ID0gd2luZG93O1xuICAgICAgICAgICAgcmV0dXJuIHJlcTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgIHJlcS5lcnIgPSBlcnI7XG4gICAgICAgICAgICB0aHJvdyByZXE7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIFByb21pc2UuYWxsKHVybHNQcm9taXNlcyk7XG59O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gRXhwb3J0XG5cbmV4cG9ydCB7IHJ1biB9O1xuZXhwb3J0IHsgZ2V0RG9tIH07XG5cbi8vIEVzc2VudGlhbGx5IGZvciB0ZXN0aW5nIHB1cnBvc2VzXG5leHBvcnQgY29uc3QgX190ZXN0TWV0aG9kc19fID0geyBydW4sIGdldERvbSwgZ2V0UmVxVXJscyB9O1xuIl19