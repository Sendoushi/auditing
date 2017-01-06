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
        return (0, _mrcrowley.getDom)(req.requestSrc, type.of).then(function (domReq) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zY3JhcGVyLmpzIl0sIm5hbWVzIjpbImdldFJlcVVybHMiLCJ1cmxzIiwiYmFzZSIsImJhc2VFbnYiLCJwcm9jZXNzIiwiZW52IiwibWFwIiwidXJsIiwicmVxVXJsIiwibGVuZ3RoIiwic3Vic3RyaW5nIiwicmVxdWVzdFNyYyIsIm9yaWdpbmFsU3JjIiwicnVuIiwiZGF0YSIsInNyYyIsInR5cGUiLCJvZiIsInJlcVNyYyIsInJlcXVpcmUiLCJ2YWwiLCJ1cmxzUHJvbWlzZXMiLCJyZXEiLCJ0aGVuIiwiZG9tUmVxIiwiY2F0Y2giLCJlcnIiLCJQcm9taXNlIiwiYWxsIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBOzs7Ozs7O0FBRUE7O0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7Ozs7Ozs7QUFRQSxJQUFNQSxhQUFhLFNBQWJBLFVBQWEsQ0FBQ0MsSUFBRCxFQUFPQyxJQUFQLEVBQWFDLE9BQWIsRUFBeUI7QUFDeENBLGNBQVVBLFdBQVdDLFFBQVFDLEdBQVIsQ0FBWUYsT0FBWixDQUFyQjtBQUNBRCxXQUFPQyxXQUFXRCxJQUFsQjs7QUFFQUQsV0FBTyxPQUFPQSxJQUFQLEtBQWdCLFFBQWhCLEdBQTJCLENBQUNBLElBQUQsQ0FBM0IsR0FBb0NBLElBQTNDO0FBQ0FBLFdBQU9BLEtBQUtLLEdBQUwsQ0FBUyxVQUFDQyxHQUFELEVBQVM7QUFDckIsWUFBSUMsU0FBU0QsR0FBYjs7QUFFQTtBQUNBLFlBQUlMLElBQUosRUFBVTtBQUNOLGdCQUFJQSxLQUFLQSxLQUFLTyxNQUFMLEdBQWMsQ0FBbkIsTUFBMEIsR0FBMUIsSUFBaUNGLElBQUksQ0FBSixNQUFXLEdBQWhELEVBQXFEO0FBQ2pETCx3QkFBUSxHQUFSO0FBQ0gsYUFGRCxNQUVPLElBQUlBLEtBQUtBLEtBQUtPLE1BQUwsR0FBYyxDQUFuQixNQUEwQixHQUExQixJQUFpQ0YsSUFBSSxDQUFKLE1BQVcsR0FBaEQsRUFBcUQ7QUFDeERMLHVCQUFPQSxLQUFLUSxTQUFMLENBQWUsQ0FBZixFQUFrQlIsS0FBS08sTUFBTCxHQUFjLENBQWhDLENBQVA7QUFDSDs7QUFFREQscUJBQVNOLE9BQU9NLE1BQWhCO0FBQ0g7O0FBRUQ7QUFDQSxlQUFPLEVBQUVHLFlBQVlILE1BQWQsRUFBc0JJLGFBQWFMLEdBQW5DLEVBQVA7QUFDSCxLQWhCTSxDQUFQOztBQWtCQSxXQUFPTixJQUFQO0FBQ0gsQ0F4QkQ7O0FBMEJBOzs7Ozs7QUFNQSxJQUFNWSxNQUFNLFNBQU5BLEdBQU0sQ0FBQ0MsSUFBRCxFQUFVO0FBQ2xCLFFBQU1DLE1BQU0sT0FBT0QsS0FBS0MsR0FBWixLQUFvQixRQUFwQixHQUErQixDQUFDRCxLQUFLQyxHQUFOLENBQS9CLEdBQTRDRCxLQUFLQyxHQUE3RDtBQUNBLFFBQU1DLE9BQU8sT0FBT0YsS0FBS0UsSUFBWixLQUFxQixRQUFyQixHQUFnQyxFQUFFQyxJQUFJSCxLQUFLRSxJQUFYLEVBQWhDLEdBQW9ERixLQUFLRSxJQUF0RTtBQUNBLFFBQUlFLFNBQVNILEdBQWI7O0FBRUE7QUFDQSxRQUFJQyxLQUFLQyxFQUFMLEtBQVksS0FBaEIsRUFBdUI7QUFDbkJDLGlCQUFTbEIsV0FBV2tCLE1BQVgsRUFBbUJGLEtBQUtkLElBQXhCLEVBQThCYyxLQUFLYixPQUFuQyxDQUFUO0FBQ0gsS0FGRCxNQUVPLElBQUlhLEtBQUtDLEVBQUwsS0FBWSxNQUFoQixFQUF3QjtBQUMzQkMsaUJBQVNBLE9BQU9aLEdBQVAsQ0FBVztBQUFBLG1CQUFRLEVBQUVLLFlBQVlRLFFBQVEsbUJBQU9DLEdBQVAsQ0FBUixDQUFkLEVBQW9DUixhQUFhUSxHQUFqRCxFQUFSO0FBQUEsU0FBWCxDQUFUO0FBQ0gsS0FGTSxNQUVBO0FBQ0hGLGlCQUFTQSxPQUFPWixHQUFQLENBQVc7QUFBQSxtQkFBUSxFQUFFSyxZQUFZUyxHQUFkLEVBQW1CUixhQUFhUSxHQUFoQyxFQUFSO0FBQUEsU0FBWCxDQUFUO0FBQ0g7O0FBRUQ7QUFDQSxRQUFNQyxlQUFlSCxPQUFPWixHQUFQLENBQVcsVUFBQ2dCLEdBQUQ7QUFBQSxlQUFTLHVCQUFPQSxJQUFJWCxVQUFYLEVBQXVCSyxLQUFLQyxFQUE1QixFQUN4Q00sSUFEd0MsQ0FDbkMsVUFBQ0MsTUFBRCxFQUFZO0FBQ2RGLGdCQUFJRSxNQUFKLEdBQWFBLE1BQWI7QUFDQSxtQkFBT0YsR0FBUDtBQUNILFNBSndDLEVBS3hDRyxLQUx3QyxDQUtsQyxVQUFDQyxHQUFELEVBQVM7QUFDWkosZ0JBQUlJLEdBQUosR0FBVUEsR0FBVjtBQUNBLGtCQUFNSixHQUFOO0FBQ0gsU0FSd0MsQ0FBVDtBQUFBLEtBQVgsQ0FBckI7O0FBVUEsV0FBT0ssUUFBUUMsR0FBUixDQUFZUCxZQUFaLENBQVA7QUFDSCxDQTFCRDs7QUE0QkE7QUFDQTs7UUFFU1IsRyxHQUFBQSxHOztBQUVUIiwiZmlsZSI6InNjcmFwZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG4vKiBnbG9iYWwgUHJvbWlzZSAqL1xuXG5pbXBvcnQgeyBnZXREb20gfSBmcm9tICdtcmNyb3dsZXknO1xuaW1wb3J0IHsgZ2V0UHdkIH0gZnJvbSAnLi91dGlscy5qcyc7XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gRnVuY3Rpb25zXG5cbi8qKlxuICogR2V0IHJlcXVlc3QgdXJsc1xuICpcbiAqIEBwYXJhbSB7YXJyYXl8c3RyaW5nfSB1cmxzXG4gKiBAcGFyYW0ge3N0cmluZ30gYmFzZVxuICogQHBhcmFtIHtzdHJpbmd9IGJhc2VFbnZcbiAqIEByZXR1cm5zIHthcnJheX1cbiAqL1xuY29uc3QgZ2V0UmVxVXJscyA9ICh1cmxzLCBiYXNlLCBiYXNlRW52KSA9PiB7XG4gICAgYmFzZUVudiA9IGJhc2VFbnYgJiYgcHJvY2Vzcy5lbnZbYmFzZUVudl07XG4gICAgYmFzZSA9IGJhc2VFbnYgfHwgYmFzZTtcblxuICAgIHVybHMgPSB0eXBlb2YgdXJscyA9PT0gJ3N0cmluZycgPyBbdXJsc10gOiB1cmxzO1xuICAgIHVybHMgPSB1cmxzLm1hcCgodXJsKSA9PiB7XG4gICAgICAgIGxldCByZXFVcmwgPSB1cmw7XG5cbiAgICAgICAgLy8gTGV0cyBzZXQgdGhlIGJhc2VzXG4gICAgICAgIGlmIChiYXNlKSB7XG4gICAgICAgICAgICBpZiAoYmFzZVtiYXNlLmxlbmd0aCAtIDFdICE9PSAnLycgJiYgdXJsWzBdICE9PSAnLycpIHtcbiAgICAgICAgICAgICAgICBiYXNlICs9ICcvJztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYmFzZVtiYXNlLmxlbmd0aCAtIDFdID09PSAnLycgJiYgdXJsWzBdID09PSAnLycpIHtcbiAgICAgICAgICAgICAgICBiYXNlID0gYmFzZS5zdWJzdHJpbmcoMCwgYmFzZS5sZW5ndGggLSAxKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmVxVXJsID0gYmFzZSArIHJlcVVybDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENvbnN0cnVjdCBvYmplY3RcbiAgICAgICAgcmV0dXJuIHsgcmVxdWVzdFNyYzogcmVxVXJsLCBvcmlnaW5hbFNyYzogdXJsIH07XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdXJscztcbn07XG5cbi8qKlxuICogU2NyYXBlc1xuICpcbiAqIEBwYXJhbSAge29iamVjdH0gZGF0YVxuICogQHJldHVybnMge3Byb21pc2V9XG4gKi9cbmNvbnN0IHJ1biA9IChkYXRhKSA9PiB7XG4gICAgY29uc3Qgc3JjID0gdHlwZW9mIGRhdGEuc3JjID09PSAnc3RyaW5nJyA/IFtkYXRhLnNyY10gOiBkYXRhLnNyYztcbiAgICBjb25zdCB0eXBlID0gdHlwZW9mIGRhdGEudHlwZSA9PT0gJ3N0cmluZycgPyB7IG9mOiBkYXRhLnR5cGUgfSA6IGRhdGEudHlwZTtcbiAgICBsZXQgcmVxU3JjID0gc3JjO1xuXG4gICAgLy8gTGV0cyBwYXJzZSBzb3VyY2VzIGludG8gd2hhdCB3ZSdyZSBleHBlY3RpbmdcbiAgICBpZiAodHlwZS5vZiA9PT0gJ3VybCcpIHtcbiAgICAgICAgcmVxU3JjID0gZ2V0UmVxVXJscyhyZXFTcmMsIHR5cGUuYmFzZSwgdHlwZS5iYXNlRW52KTtcbiAgICB9IGVsc2UgaWYgKHR5cGUub2YgPT09ICdmaWxlJykge1xuICAgICAgICByZXFTcmMgPSByZXFTcmMubWFwKHZhbCA9PiAoeyByZXF1ZXN0U3JjOiByZXF1aXJlKGdldFB3ZCh2YWwpKSwgb3JpZ2luYWxTcmM6IHZhbCB9KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmVxU3JjID0gcmVxU3JjLm1hcCh2YWwgPT4gKHsgcmVxdWVzdFNyYzogdmFsLCBvcmlnaW5hbFNyYzogdmFsIH0pKTtcbiAgICB9XG5cbiAgICAvLyBGaW5hbGx5IGxldHMgc2V0IHRoZSBwcm9taXNlc1xuICAgIGNvbnN0IHVybHNQcm9taXNlcyA9IHJlcVNyYy5tYXAoKHJlcSkgPT4gZ2V0RG9tKHJlcS5yZXF1ZXN0U3JjLCB0eXBlLm9mKVxuICAgIC50aGVuKChkb21SZXEpID0+IHtcbiAgICAgICAgcmVxLmRvbVJlcSA9IGRvbVJlcTtcbiAgICAgICAgcmV0dXJuIHJlcTtcbiAgICB9KVxuICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgIHJlcS5lcnIgPSBlcnI7XG4gICAgICAgIHRocm93IHJlcTtcbiAgICB9KSk7XG5cbiAgICByZXR1cm4gUHJvbWlzZS5hbGwodXJsc1Byb21pc2VzKTtcbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBFeHBvcnRcblxuZXhwb3J0IHsgcnVuIH07XG5cbi8vIEVzc2VudGlhbGx5IGZvciB0ZXN0aW5nIHB1cnBvc2VzXG5leHBvcnQgY29uc3QgX190ZXN0TWV0aG9kc19fID0geyBydW4sIGdldFJlcVVybHMgfTtcbiJdfQ==