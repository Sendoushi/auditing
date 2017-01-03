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
        return { requestSrc: reqUrl, originalSrc: url };
    });

    return urls;
};

/**
 * Gets DOM from url
 *
 * @param {string} src
 * @param {string} type
 * @returns {promise}
 */
var getDom = function getDom(src, type) {
    return new Promise(function (resolve, reject) {
        // Need to check if url is ok
        if (type === 'url' && !(0, _utils.isUrl)(src)) {
            return reject(new Error('Url not valid'));
        }

        // Set jsdom...
        _jsdom2.default.env(src, ['http://code.jquery.com/jquery.js'], function (err, window) {
            if (err) {
                return reject(err);
            }

            // Cache the window
            resolve(window);
        });
    });
};

/**
 * Scrapes
 *
 * @param  {object} data
 * @returns {promise}
 */
var run = function run(data) {
    var src = typeof data.src === 'string' ? [data.src] : data.src;
    var reqSrc = src;

    // Lets parse sources into what we're expecting
    if (data.type === 'url') {
        reqSrc = getReqUrls(reqSrc, data.base, data.baseEnv);
    } else if (data.type === 'file') {
        reqSrc = reqSrc.map(function (val) {
            return { requestSrc: require((0, _utils.getPwd)(val)), originalSrc: val };
        });
    } else {
        reqSrc = reqSrc.map(function (val) {
            return { requestSrc: val, originalSrc: val };
        });
    }

    // Finally lets set the promises
    var urlsPromises = reqSrc.map(function (req) {
        return getDom(req.requestSrc, data.type).then(function (window) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zY3JhcGVyLmpzIl0sIm5hbWVzIjpbImdldFJlcVVybHMiLCJ1cmxzIiwiYmFzZSIsImJhc2VFbnYiLCJwcm9jZXNzIiwiZW52IiwibWFwIiwidXJsIiwicmVxVXJsIiwibGVuZ3RoIiwic3Vic3RyaW5nIiwicmVxdWVzdFNyYyIsIm9yaWdpbmFsU3JjIiwiZ2V0RG9tIiwic3JjIiwidHlwZSIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwiRXJyb3IiLCJlcnIiLCJ3aW5kb3ciLCJydW4iLCJkYXRhIiwicmVxU3JjIiwicmVxdWlyZSIsInZhbCIsInVybHNQcm9taXNlcyIsInJlcSIsInRoZW4iLCJjYXRjaCIsImFsbCJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTs7Ozs7OztBQUVBOzs7O0FBQ0E7Ozs7QUFHQTtBQUNBOztBQUVBOzs7Ozs7OztBQVFBLElBQU1BLGFBQWEsU0FBYkEsVUFBYSxDQUFDQyxJQUFELEVBQU9DLElBQVAsRUFBYUMsT0FBYixFQUF5QjtBQUN4Q0EsY0FBVUEsV0FBV0MsUUFBUUMsR0FBUixDQUFZRixPQUFaLENBQXJCO0FBQ0FELFdBQU9DLFdBQVdELElBQWxCOztBQUVBRCxXQUFPLE9BQU9BLElBQVAsS0FBZ0IsUUFBaEIsR0FBMkIsQ0FBQ0EsSUFBRCxDQUEzQixHQUFvQ0EsSUFBM0M7QUFDQUEsV0FBT0EsS0FBS0ssR0FBTCxDQUFTLFVBQUNDLEdBQUQsRUFBUztBQUNyQixZQUFJQyxTQUFTRCxHQUFiOztBQUVBO0FBQ0EsWUFBSUwsSUFBSixFQUFVO0FBQ04sZ0JBQUlBLEtBQUtBLEtBQUtPLE1BQUwsR0FBYyxDQUFuQixNQUEwQixHQUExQixJQUFpQ0YsSUFBSSxDQUFKLE1BQVcsR0FBaEQsRUFBcUQ7QUFDakRMLHdCQUFRLEdBQVI7QUFDSCxhQUZELE1BRU8sSUFBSUEsS0FBS0EsS0FBS08sTUFBTCxHQUFjLENBQW5CLE1BQTBCLEdBQTFCLElBQWlDRixJQUFJLENBQUosTUFBVyxHQUFoRCxFQUFxRDtBQUN4REwsdUJBQU9BLEtBQUtRLFNBQUwsQ0FBZSxDQUFmLEVBQWtCUixLQUFLTyxNQUFMLEdBQWMsQ0FBaEMsQ0FBUDtBQUNIOztBQUVERCxxQkFBU04sT0FBT00sTUFBaEI7QUFDSDs7QUFFRDtBQUNBLGVBQU8sRUFBRUcsWUFBWUgsTUFBZCxFQUFzQkksYUFBYUwsR0FBbkMsRUFBUDtBQUNILEtBaEJNLENBQVA7O0FBa0JBLFdBQU9OLElBQVA7QUFDSCxDQXhCRDs7QUEwQkE7Ozs7Ozs7QUFPQSxJQUFNWSxTQUFTLFNBQVRBLE1BQVMsQ0FBQ0MsR0FBRCxFQUFNQyxJQUFOO0FBQUEsV0FBZSxJQUFJQyxPQUFKLENBQVksVUFBQ0MsT0FBRCxFQUFVQyxNQUFWLEVBQXFCO0FBQzNEO0FBQ0EsWUFBSUgsU0FBUyxLQUFULElBQWtCLENBQUMsa0JBQU1ELEdBQU4sQ0FBdkIsRUFBbUM7QUFDL0IsbUJBQU9JLE9BQU8sSUFBSUMsS0FBSixDQUFVLGVBQVYsQ0FBUCxDQUFQO0FBQ0g7O0FBRUQ7QUFDQSx3QkFBTWQsR0FBTixDQUFVUyxHQUFWLEVBQWUsQ0FBQyxrQ0FBRCxDQUFmLEVBQXFELFVBQUNNLEdBQUQsRUFBTUMsTUFBTixFQUFpQjtBQUNsRSxnQkFBSUQsR0FBSixFQUFTO0FBQ0wsdUJBQU9GLE9BQU9FLEdBQVAsQ0FBUDtBQUNIOztBQUVEO0FBQ0FILG9CQUFRSSxNQUFSO0FBQ0gsU0FQRDtBQVFILEtBZjZCLENBQWY7QUFBQSxDQUFmOztBQWlCQTs7Ozs7O0FBTUEsSUFBTUMsTUFBTSxTQUFOQSxHQUFNLENBQUNDLElBQUQsRUFBVTtBQUNsQixRQUFNVCxNQUFNLE9BQU9TLEtBQUtULEdBQVosS0FBb0IsUUFBcEIsR0FBK0IsQ0FBQ1MsS0FBS1QsR0FBTixDQUEvQixHQUE0Q1MsS0FBS1QsR0FBN0Q7QUFDQSxRQUFJVSxTQUFTVixHQUFiOztBQUVBO0FBQ0EsUUFBSVMsS0FBS1IsSUFBTCxLQUFjLEtBQWxCLEVBQXlCO0FBQ3JCUyxpQkFBU3hCLFdBQVd3QixNQUFYLEVBQW1CRCxLQUFLckIsSUFBeEIsRUFBOEJxQixLQUFLcEIsT0FBbkMsQ0FBVDtBQUNILEtBRkQsTUFFTyxJQUFJb0IsS0FBS1IsSUFBTCxLQUFjLE1BQWxCLEVBQTBCO0FBQzdCUyxpQkFBU0EsT0FBT2xCLEdBQVAsQ0FBVztBQUFBLG1CQUFRLEVBQUVLLFlBQVljLFFBQVEsbUJBQU9DLEdBQVAsQ0FBUixDQUFkLEVBQW9DZCxhQUFhYyxHQUFqRCxFQUFSO0FBQUEsU0FBWCxDQUFUO0FBQ0gsS0FGTSxNQUVBO0FBQ0hGLGlCQUFTQSxPQUFPbEIsR0FBUCxDQUFXO0FBQUEsbUJBQVEsRUFBRUssWUFBWWUsR0FBZCxFQUFtQmQsYUFBYWMsR0FBaEMsRUFBUjtBQUFBLFNBQVgsQ0FBVDtBQUNIOztBQUVEO0FBQ0EsUUFBTUMsZUFBZUgsT0FBT2xCLEdBQVAsQ0FBVyxVQUFDc0IsR0FBRDtBQUFBLGVBQVNmLE9BQU9lLElBQUlqQixVQUFYLEVBQXVCWSxLQUFLUixJQUE1QixFQUN4Q2MsSUFEd0MsQ0FDbkMsVUFBQ1IsTUFBRCxFQUFZO0FBQ2RPLGdCQUFJUCxNQUFKLEdBQWFBLE1BQWI7QUFDQSxtQkFBT08sR0FBUDtBQUNILFNBSndDLEVBS3hDRSxLQUx3QyxDQUtsQyxVQUFDVixHQUFELEVBQVM7QUFDWlEsZ0JBQUlSLEdBQUosR0FBVUEsR0FBVjtBQUNBLGtCQUFNUSxHQUFOO0FBQ0gsU0FSd0MsQ0FBVDtBQUFBLEtBQVgsQ0FBckI7O0FBVUEsV0FBT1osUUFBUWUsR0FBUixDQUFZSixZQUFaLENBQVA7QUFDSCxDQXpCRDs7QUEyQkE7QUFDQTs7UUFFU0wsRyxHQUFBQSxHO1FBQ0FULE0sR0FBQUEsTTs7QUFFVCIsImZpbGUiOiJzY3JhcGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuLyogZ2xvYmFsIFByb21pc2UgKi9cblxuaW1wb3J0IGpzZG9tIGZyb20gJ2pzZG9tJztcbmltcG9ydCB7IGlzVXJsIH0gZnJvbSAnLi91dGlscy5qcyc7XG5pbXBvcnQgeyBnZXRQd2QgfSBmcm9tICcuL3V0aWxzLmpzJztcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBGdW5jdGlvbnNcblxuLyoqXG4gKiBHZXQgcmVxdWVzdCB1cmxzXG4gKlxuICogQHBhcmFtIHthcnJheXxzdHJpbmd9IHVybHNcbiAqIEBwYXJhbSB7c3RyaW5nfSBiYXNlXG4gKiBAcGFyYW0ge3N0cmluZ30gYmFzZUVudlxuICogQHJldHVybnMge2FycmF5fVxuICovXG5jb25zdCBnZXRSZXFVcmxzID0gKHVybHMsIGJhc2UsIGJhc2VFbnYpID0+IHtcbiAgICBiYXNlRW52ID0gYmFzZUVudiAmJiBwcm9jZXNzLmVudltiYXNlRW52XTtcbiAgICBiYXNlID0gYmFzZUVudiB8fCBiYXNlO1xuXG4gICAgdXJscyA9IHR5cGVvZiB1cmxzID09PSAnc3RyaW5nJyA/IFt1cmxzXSA6IHVybHM7XG4gICAgdXJscyA9IHVybHMubWFwKCh1cmwpID0+IHtcbiAgICAgICAgbGV0IHJlcVVybCA9IHVybDtcblxuICAgICAgICAvLyBMZXRzIHNldCB0aGUgYmFzZXNcbiAgICAgICAgaWYgKGJhc2UpIHtcbiAgICAgICAgICAgIGlmIChiYXNlW2Jhc2UubGVuZ3RoIC0gMV0gIT09ICcvJyAmJiB1cmxbMF0gIT09ICcvJykge1xuICAgICAgICAgICAgICAgIGJhc2UgKz0gJy8nO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChiYXNlW2Jhc2UubGVuZ3RoIC0gMV0gPT09ICcvJyAmJiB1cmxbMF0gPT09ICcvJykge1xuICAgICAgICAgICAgICAgIGJhc2UgPSBiYXNlLnN1YnN0cmluZygwLCBiYXNlLmxlbmd0aCAtIDEpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXFVcmwgPSBiYXNlICsgcmVxVXJsO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ29uc3RydWN0IG9iamVjdFxuICAgICAgICByZXR1cm4geyByZXF1ZXN0U3JjOiByZXFVcmwsIG9yaWdpbmFsU3JjOiB1cmwgfTtcbiAgICB9KTtcblxuICAgIHJldHVybiB1cmxzO1xufTtcblxuLyoqXG4gKiBHZXRzIERPTSBmcm9tIHVybFxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBzcmNcbiAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlXG4gKiBAcmV0dXJucyB7cHJvbWlzZX1cbiAqL1xuY29uc3QgZ2V0RG9tID0gKHNyYywgdHlwZSkgPT4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIC8vIE5lZWQgdG8gY2hlY2sgaWYgdXJsIGlzIG9rXG4gICAgaWYgKHR5cGUgPT09ICd1cmwnICYmICFpc1VybChzcmMpKSB7XG4gICAgICAgIHJldHVybiByZWplY3QobmV3IEVycm9yKCdVcmwgbm90IHZhbGlkJykpO1xuICAgIH1cblxuICAgIC8vIFNldCBqc2RvbS4uLlxuICAgIGpzZG9tLmVudihzcmMsIFsnaHR0cDovL2NvZGUuanF1ZXJ5LmNvbS9qcXVlcnkuanMnXSwgKGVyciwgd2luZG93KSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgIHJldHVybiByZWplY3QoZXJyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENhY2hlIHRoZSB3aW5kb3dcbiAgICAgICAgcmVzb2x2ZSh3aW5kb3cpO1xuICAgIH0pO1xufSk7XG5cbi8qKlxuICogU2NyYXBlc1xuICpcbiAqIEBwYXJhbSAge29iamVjdH0gZGF0YVxuICogQHJldHVybnMge3Byb21pc2V9XG4gKi9cbmNvbnN0IHJ1biA9IChkYXRhKSA9PiB7XG4gICAgY29uc3Qgc3JjID0gdHlwZW9mIGRhdGEuc3JjID09PSAnc3RyaW5nJyA/IFtkYXRhLnNyY10gOiBkYXRhLnNyYztcbiAgICBsZXQgcmVxU3JjID0gc3JjO1xuXG4gICAgLy8gTGV0cyBwYXJzZSBzb3VyY2VzIGludG8gd2hhdCB3ZSdyZSBleHBlY3RpbmdcbiAgICBpZiAoZGF0YS50eXBlID09PSAndXJsJykge1xuICAgICAgICByZXFTcmMgPSBnZXRSZXFVcmxzKHJlcVNyYywgZGF0YS5iYXNlLCBkYXRhLmJhc2VFbnYpO1xuICAgIH0gZWxzZSBpZiAoZGF0YS50eXBlID09PSAnZmlsZScpIHtcbiAgICAgICAgcmVxU3JjID0gcmVxU3JjLm1hcCh2YWwgPT4gKHsgcmVxdWVzdFNyYzogcmVxdWlyZShnZXRQd2QodmFsKSksIG9yaWdpbmFsU3JjOiB2YWwgfSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJlcVNyYyA9IHJlcVNyYy5tYXAodmFsID0+ICh7IHJlcXVlc3RTcmM6IHZhbCwgb3JpZ2luYWxTcmM6IHZhbCB9KSk7XG4gICAgfVxuXG4gICAgLy8gRmluYWxseSBsZXRzIHNldCB0aGUgcHJvbWlzZXNcbiAgICBjb25zdCB1cmxzUHJvbWlzZXMgPSByZXFTcmMubWFwKChyZXEpID0+IGdldERvbShyZXEucmVxdWVzdFNyYywgZGF0YS50eXBlKVxuICAgIC50aGVuKCh3aW5kb3cpID0+IHtcbiAgICAgICAgcmVxLndpbmRvdyA9IHdpbmRvdztcbiAgICAgICAgcmV0dXJuIHJlcTtcbiAgICB9KVxuICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgIHJlcS5lcnIgPSBlcnI7XG4gICAgICAgIHRocm93IHJlcTtcbiAgICB9KSk7XG5cbiAgICByZXR1cm4gUHJvbWlzZS5hbGwodXJsc1Byb21pc2VzKTtcbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBFeHBvcnRcblxuZXhwb3J0IHsgcnVuIH07XG5leHBvcnQgeyBnZXREb20gfTtcblxuLy8gRXNzZW50aWFsbHkgZm9yIHRlc3RpbmcgcHVycG9zZXNcbmV4cG9ydCBjb25zdCBfX3Rlc3RNZXRob2RzX18gPSB7IHJ1biwgZ2V0RG9tLCBnZXRSZXFVcmxzIH07XG4iXX0=