'use strict';
/* global Promise */

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.run = undefined;

var _mrcrowley = require('mrcrowley');

var _utils = require('./utils.js');

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
 * Scrapes
 *
 * @param  {object} data
 * @returns {promise}
 */
var run = function run(data) {
    var src = typeof data.src === 'string' ? [data.src] : data.src;
    var type = typeof data.type === 'string' ? { of: data.type } : data.type;
    var reqSrc = src;

    // Lets parse sources into what we're expecting
    if (type.of === 'url') {
        reqSrc = getReqUrls(reqSrc, type.base, type.baseEnv);
    } else if (type.of === 'file') {
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
        var promise = (0, _mrcrowley.getDom)(req.requestSrc, type.of, null, data.enableJs, data.waitFor);

        return promise.then(function (domReq) {
            req.domReq = domReq;
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

// Essentially for testing purposes
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zY3JhcGVyLmpzIl0sIm5hbWVzIjpbImdldFJlcVVybHMiLCJ1cmxzIiwiYmFzZSIsImJhc2VFbnYiLCJwcm9jZXNzIiwiZW52IiwibWFwIiwidXJsIiwicmVxVXJsIiwibGVuZ3RoIiwic3Vic3RyaW5nIiwicmVxdWVzdFNyYyIsIm9yaWdpbmFsU3JjIiwicnVuIiwiZGF0YSIsInNyYyIsInR5cGUiLCJvZiIsInJlcVNyYyIsInJlcXVpcmUiLCJ2YWwiLCJ1cmxzUHJvbWlzZXMiLCJyZXEiLCJwcm9taXNlIiwiZW5hYmxlSnMiLCJ3YWl0Rm9yIiwidGhlbiIsImRvbVJlcSIsImNhdGNoIiwiZXJyIiwiUHJvbWlzZSIsImFsbCJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTs7Ozs7OztBQUVBOztBQUNBOztBQUVBO0FBQ0E7O0FBRUE7Ozs7Ozs7O0FBUUEsSUFBTUEsYUFBYSxTQUFiQSxVQUFhLENBQUNDLElBQUQsRUFBT0MsSUFBUCxFQUFhQyxPQUFiLEVBQXlCO0FBQ3hDQSxjQUFVQSxXQUFXQyxRQUFRQyxHQUFSLENBQVlGLE9BQVosQ0FBckI7QUFDQUQsV0FBT0MsV0FBV0QsSUFBbEI7O0FBRUFELFdBQU8sT0FBT0EsSUFBUCxLQUFnQixRQUFoQixHQUEyQixDQUFDQSxJQUFELENBQTNCLEdBQW9DQSxJQUEzQztBQUNBQSxXQUFPQSxLQUFLSyxHQUFMLENBQVMsVUFBQ0MsR0FBRCxFQUFTO0FBQ3JCLFlBQUlDLFNBQVNELEdBQWI7O0FBRUE7QUFDQSxZQUFJTCxJQUFKLEVBQVU7QUFDTixnQkFBSUEsS0FBS0EsS0FBS08sTUFBTCxHQUFjLENBQW5CLE1BQTBCLEdBQTFCLElBQWlDRixJQUFJLENBQUosTUFBVyxHQUFoRCxFQUFxRDtBQUNqREwsd0JBQVEsR0FBUjtBQUNILGFBRkQsTUFFTyxJQUFJQSxLQUFLQSxLQUFLTyxNQUFMLEdBQWMsQ0FBbkIsTUFBMEIsR0FBMUIsSUFBaUNGLElBQUksQ0FBSixNQUFXLEdBQWhELEVBQXFEO0FBQ3hETCx1QkFBT0EsS0FBS1EsU0FBTCxDQUFlLENBQWYsRUFBa0JSLEtBQUtPLE1BQUwsR0FBYyxDQUFoQyxDQUFQO0FBQ0g7O0FBRURELHFCQUFTTixPQUFPTSxNQUFoQjtBQUNIOztBQUVEO0FBQ0EsZUFBTyxFQUFFRyxZQUFZSCxNQUFkLEVBQXNCSSxhQUFhTCxHQUFuQyxFQUFQO0FBQ0gsS0FoQk0sQ0FBUDs7QUFrQkEsV0FBT04sSUFBUDtBQUNILENBeEJEOztBQTBCQTs7Ozs7O0FBTUEsSUFBTVksTUFBTSxTQUFOQSxHQUFNLENBQUNDLElBQUQsRUFBVTtBQUNsQixRQUFNQyxNQUFNLE9BQU9ELEtBQUtDLEdBQVosS0FBb0IsUUFBcEIsR0FBK0IsQ0FBQ0QsS0FBS0MsR0FBTixDQUEvQixHQUE0Q0QsS0FBS0MsR0FBN0Q7QUFDQSxRQUFNQyxPQUFPLE9BQU9GLEtBQUtFLElBQVosS0FBcUIsUUFBckIsR0FBZ0MsRUFBRUMsSUFBSUgsS0FBS0UsSUFBWCxFQUFoQyxHQUFvREYsS0FBS0UsSUFBdEU7QUFDQSxRQUFJRSxTQUFTSCxHQUFiOztBQUVBO0FBQ0EsUUFBSUMsS0FBS0MsRUFBTCxLQUFZLEtBQWhCLEVBQXVCO0FBQ25CQyxpQkFBU2xCLFdBQVdrQixNQUFYLEVBQW1CRixLQUFLZCxJQUF4QixFQUE4QmMsS0FBS2IsT0FBbkMsQ0FBVDtBQUNILEtBRkQsTUFFTyxJQUFJYSxLQUFLQyxFQUFMLEtBQVksTUFBaEIsRUFBd0I7QUFDM0JDLGlCQUFTQSxPQUFPWixHQUFQLENBQVc7QUFBQSxtQkFBUSxFQUFFSyxZQUFZUSxRQUFRLG1CQUFPQyxHQUFQLENBQVIsQ0FBZCxFQUFvQ1IsYUFBYVEsR0FBakQsRUFBUjtBQUFBLFNBQVgsQ0FBVDtBQUNILEtBRk0sTUFFQTtBQUNIRixpQkFBU0EsT0FBT1osR0FBUCxDQUFXO0FBQUEsbUJBQVEsRUFBRUssWUFBWVMsR0FBZCxFQUFtQlIsYUFBYVEsR0FBaEMsRUFBUjtBQUFBLFNBQVgsQ0FBVDtBQUNIOztBQUVEO0FBQ0EsUUFBTUMsZUFBZUgsT0FBT1osR0FBUCxDQUFXLFVBQUNnQixHQUFELEVBQVM7QUFDckMsWUFBTUMsVUFBVSx1QkFBT0QsSUFBSVgsVUFBWCxFQUF1QkssS0FBS0MsRUFBNUIsRUFBZ0MsSUFBaEMsRUFBc0NILEtBQUtVLFFBQTNDLEVBQXFEVixLQUFLVyxPQUExRCxDQUFoQjs7QUFFQSxlQUFPRixRQUNORyxJQURNLENBQ0QsVUFBQ0MsTUFBRCxFQUFZO0FBQ2RMLGdCQUFJSyxNQUFKLEdBQWFBLE1BQWI7QUFDQSxtQkFBT0wsR0FBUDtBQUNILFNBSk0sRUFLTk0sS0FMTSxDQUtBLFVBQUNDLEdBQUQsRUFBUztBQUNaUCxnQkFBSU8sR0FBSixHQUFVQSxHQUFWO0FBQ0Esa0JBQU1QLEdBQU47QUFDSCxTQVJNLENBQVA7QUFTSCxLQVpvQixDQUFyQjs7QUFjQSxXQUFPUSxRQUFRQyxHQUFSLENBQVlWLFlBQVosQ0FBUDtBQUNILENBOUJEOztBQWdDQTtBQUNBOztRQUVTUixHLEdBQUFBLEc7O0FBRVQiLCJmaWxlIjoic2NyYXBlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0Jztcbi8qIGdsb2JhbCBQcm9taXNlICovXG5cbmltcG9ydCB7IGdldERvbSB9IGZyb20gJ21yY3Jvd2xleSc7XG5pbXBvcnQgeyBnZXRQd2QgfSBmcm9tICcuL3V0aWxzLmpzJztcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBGdW5jdGlvbnNcblxuLyoqXG4gKiBHZXQgcmVxdWVzdCB1cmxzXG4gKlxuICogQHBhcmFtIHthcnJheXxzdHJpbmd9IHVybHNcbiAqIEBwYXJhbSB7c3RyaW5nfSBiYXNlXG4gKiBAcGFyYW0ge3N0cmluZ30gYmFzZUVudlxuICogQHJldHVybnMge2FycmF5fVxuICovXG5jb25zdCBnZXRSZXFVcmxzID0gKHVybHMsIGJhc2UsIGJhc2VFbnYpID0+IHtcbiAgICBiYXNlRW52ID0gYmFzZUVudiAmJiBwcm9jZXNzLmVudltiYXNlRW52XTtcbiAgICBiYXNlID0gYmFzZUVudiB8fCBiYXNlO1xuXG4gICAgdXJscyA9IHR5cGVvZiB1cmxzID09PSAnc3RyaW5nJyA/IFt1cmxzXSA6IHVybHM7XG4gICAgdXJscyA9IHVybHMubWFwKCh1cmwpID0+IHtcbiAgICAgICAgbGV0IHJlcVVybCA9IHVybDtcblxuICAgICAgICAvLyBMZXRzIHNldCB0aGUgYmFzZXNcbiAgICAgICAgaWYgKGJhc2UpIHtcbiAgICAgICAgICAgIGlmIChiYXNlW2Jhc2UubGVuZ3RoIC0gMV0gIT09ICcvJyAmJiB1cmxbMF0gIT09ICcvJykge1xuICAgICAgICAgICAgICAgIGJhc2UgKz0gJy8nO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChiYXNlW2Jhc2UubGVuZ3RoIC0gMV0gPT09ICcvJyAmJiB1cmxbMF0gPT09ICcvJykge1xuICAgICAgICAgICAgICAgIGJhc2UgPSBiYXNlLnN1YnN0cmluZygwLCBiYXNlLmxlbmd0aCAtIDEpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXFVcmwgPSBiYXNlICsgcmVxVXJsO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ29uc3RydWN0IG9iamVjdFxuICAgICAgICByZXR1cm4geyByZXF1ZXN0U3JjOiByZXFVcmwsIG9yaWdpbmFsU3JjOiB1cmwgfTtcbiAgICB9KTtcblxuICAgIHJldHVybiB1cmxzO1xufTtcblxuLyoqXG4gKiBTY3JhcGVzXG4gKlxuICogQHBhcmFtICB7b2JqZWN0fSBkYXRhXG4gKiBAcmV0dXJucyB7cHJvbWlzZX1cbiAqL1xuY29uc3QgcnVuID0gKGRhdGEpID0+IHtcbiAgICBjb25zdCBzcmMgPSB0eXBlb2YgZGF0YS5zcmMgPT09ICdzdHJpbmcnID8gW2RhdGEuc3JjXSA6IGRhdGEuc3JjO1xuICAgIGNvbnN0IHR5cGUgPSB0eXBlb2YgZGF0YS50eXBlID09PSAnc3RyaW5nJyA/IHsgb2Y6IGRhdGEudHlwZSB9IDogZGF0YS50eXBlO1xuICAgIGxldCByZXFTcmMgPSBzcmM7XG5cbiAgICAvLyBMZXRzIHBhcnNlIHNvdXJjZXMgaW50byB3aGF0IHdlJ3JlIGV4cGVjdGluZ1xuICAgIGlmICh0eXBlLm9mID09PSAndXJsJykge1xuICAgICAgICByZXFTcmMgPSBnZXRSZXFVcmxzKHJlcVNyYywgdHlwZS5iYXNlLCB0eXBlLmJhc2VFbnYpO1xuICAgIH0gZWxzZSBpZiAodHlwZS5vZiA9PT0gJ2ZpbGUnKSB7XG4gICAgICAgIHJlcVNyYyA9IHJlcVNyYy5tYXAodmFsID0+ICh7IHJlcXVlc3RTcmM6IHJlcXVpcmUoZ2V0UHdkKHZhbCkpLCBvcmlnaW5hbFNyYzogdmFsIH0pKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXFTcmMgPSByZXFTcmMubWFwKHZhbCA9PiAoeyByZXF1ZXN0U3JjOiB2YWwsIG9yaWdpbmFsU3JjOiB2YWwgfSkpO1xuICAgIH1cblxuICAgIC8vIEZpbmFsbHkgbGV0cyBzZXQgdGhlIHByb21pc2VzXG4gICAgY29uc3QgdXJsc1Byb21pc2VzID0gcmVxU3JjLm1hcCgocmVxKSA9PiB7XG4gICAgICAgIGNvbnN0IHByb21pc2UgPSBnZXREb20ocmVxLnJlcXVlc3RTcmMsIHR5cGUub2YsIG51bGwsIGRhdGEuZW5hYmxlSnMsIGRhdGEud2FpdEZvcik7XG5cbiAgICAgICAgcmV0dXJuIHByb21pc2VcbiAgICAgICAgLnRoZW4oKGRvbVJlcSkgPT4ge1xuICAgICAgICAgICAgcmVxLmRvbVJlcSA9IGRvbVJlcTtcbiAgICAgICAgICAgIHJldHVybiByZXE7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICByZXEuZXJyID0gZXJyO1xuICAgICAgICAgICAgdGhyb3cgcmVxO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIHJldHVybiBQcm9taXNlLmFsbCh1cmxzUHJvbWlzZXMpO1xufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEV4cG9ydFxuXG5leHBvcnQgeyBydW4gfTtcblxuLy8gRXNzZW50aWFsbHkgZm9yIHRlc3RpbmcgcHVycG9zZXNcbmV4cG9ydCBjb25zdCBfX3Rlc3RNZXRob2RzX18gPSB7IHJ1biwgZ2V0UmVxVXJscyB9O1xuIl19