'use strict';
/* global Promise */

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getUrl = exports.getDom = exports.run = undefined;

var _jsdom = require('jsdom');

var _jsdom2 = _interopRequireDefault(_jsdom);

var _resourceLoader = require('jsdom/lib/jsdom/browser/resource-loader');

var _resourceLoader2 = _interopRequireDefault(_resourceLoader);

var _toughCookie = require('tough-cookie');

var _toughCookie2 = _interopRequireDefault(_toughCookie);

var _utils = require('./utils.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//-------------------------------------
// Functions

/**
 * Gets url markup
 *
 * @param {string} url
 * @returns {promise}
 */
var getUrl = function getUrl(url) {
    return new Promise(function (resolve, reject) {
        if (typeof url !== 'string') {
            throw new Error('Url needs to be a string');
        }

        var options = {
            defaultEncoding: 'windows-1252',
            detectMetaCharset: true,
            // headers: config.headers,
            pool: {
                maxSockets: 6
            },
            strictSSL: true,
            // proxy: config.proxy,
            cookieJar: new _toughCookie2.default.CookieJar(null, { looseMode: true }),
            userAgent: 'Node.js (' + process.platform + '; U; rv:' + process.version + ') AppleWebKit/537.36 (KHTML, like Gecko)',
            // agent: config.agent,
            // agentClass: config.agentClass,
            agentOptions: {
                keepAlive: true,
                keepAliveMsecs: 115 * 1000
            }
        };

        // Finally download it!
        _resourceLoader2.default.download(url, options, function (err, responseText) {
            if (err) {
                return reject(err);
            }

            resolve(responseText);
        });
    });
};

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
 * @param {string|object} type
 * @returns {promise}
 */
var getDom = function getDom(src, type) {
    type = typeof type === 'string' ? { of: type } : type;

    var promise = new Promise(function (resolve, reject) {
        // Need to check if url is ok
        if (type.of === 'url' && !(0, _utils.isUrl)(src)) {
            return reject(new Error('Url not valid'));
        }

        resolve(src);
    }).then(function (retrieveSrc) {
        return new Promise(function (resolve, reject) {
            // Prepare for possible errors
            var virtualConsole = _jsdom2.default.createVirtualConsole();
            var errors = [];
            var logs = [];
            var warns = [];

            virtualConsole.on('jsdomError', function (error) {
                errors.push(error);
            });
            virtualConsole.on('error', function (error) {
                errors.push(error);
            });
            virtualConsole.on('log', function (log) {
                logs.push(log);
            });
            virtualConsole.on('warn', function (warn) {
                warns.push(warn);
            });

            // Config
            var config = {
                virtualConsole: virtualConsole,
                scripts: ['http://code.jquery.com/jquery.min.js'],
                features: {
                    FetchExternalResources: ['script', 'link'],
                    ProcessExternalResources: ['script'],
                    SkipExternalResources: false
                },
                done: function done(err, window) {
                    if (err) {
                        return reject(err);
                    }
                    resolve({ window: window, errors: errors, logs: logs, warns: warns });
                }
            };

            // Now for the actual getting
            _jsdom2.default.env(retrieveSrc, config);
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
        return getDom(req.requestSrc, type).then(function (domReq) {
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
exports.getDom = getDom;
exports.getUrl = getUrl;

// Essentially for testing purposes
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zY3JhcGVyLmpzIl0sIm5hbWVzIjpbImdldFVybCIsInVybCIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwiRXJyb3IiLCJvcHRpb25zIiwiZGVmYXVsdEVuY29kaW5nIiwiZGV0ZWN0TWV0YUNoYXJzZXQiLCJwb29sIiwibWF4U29ja2V0cyIsInN0cmljdFNTTCIsImNvb2tpZUphciIsIkNvb2tpZUphciIsImxvb3NlTW9kZSIsInVzZXJBZ2VudCIsInByb2Nlc3MiLCJwbGF0Zm9ybSIsInZlcnNpb24iLCJhZ2VudE9wdGlvbnMiLCJrZWVwQWxpdmUiLCJrZWVwQWxpdmVNc2VjcyIsImRvd25sb2FkIiwiZXJyIiwicmVzcG9uc2VUZXh0IiwiZ2V0UmVxVXJscyIsInVybHMiLCJiYXNlIiwiYmFzZUVudiIsImVudiIsIm1hcCIsInJlcVVybCIsImxlbmd0aCIsInN1YnN0cmluZyIsInJlcXVlc3RTcmMiLCJvcmlnaW5hbFNyYyIsImdldERvbSIsInNyYyIsInR5cGUiLCJvZiIsInByb21pc2UiLCJ0aGVuIiwidmlydHVhbENvbnNvbGUiLCJjcmVhdGVWaXJ0dWFsQ29uc29sZSIsImVycm9ycyIsImxvZ3MiLCJ3YXJucyIsIm9uIiwicHVzaCIsImVycm9yIiwibG9nIiwid2FybiIsImNvbmZpZyIsInNjcmlwdHMiLCJmZWF0dXJlcyIsIkZldGNoRXh0ZXJuYWxSZXNvdXJjZXMiLCJQcm9jZXNzRXh0ZXJuYWxSZXNvdXJjZXMiLCJTa2lwRXh0ZXJuYWxSZXNvdXJjZXMiLCJkb25lIiwid2luZG93IiwicmV0cmlldmVTcmMiLCJydW4iLCJkYXRhIiwicmVxU3JjIiwicmVxdWlyZSIsInZhbCIsInVybHNQcm9taXNlcyIsInJlcSIsImRvbVJlcSIsImNhdGNoIiwiYWxsIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBOzs7Ozs7O0FBRUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFHQTtBQUNBOztBQUVBOzs7Ozs7QUFNQSxJQUFNQSxTQUFTLFNBQVRBLE1BQVMsQ0FBQ0MsR0FBRDtBQUFBLFdBQVMsSUFBSUMsT0FBSixDQUFZLFVBQUNDLE9BQUQsRUFBVUMsTUFBVixFQUFxQjtBQUNyRCxZQUFJLE9BQU9ILEdBQVAsS0FBZSxRQUFuQixFQUE2QjtBQUN6QixrQkFBTSxJQUFJSSxLQUFKLENBQVUsMEJBQVYsQ0FBTjtBQUNIOztBQUVELFlBQU1DLFVBQVU7QUFDWkMsNkJBQWlCLGNBREw7QUFFWkMsK0JBQW1CLElBRlA7QUFHWjtBQUNBQyxrQkFBTTtBQUNGQyw0QkFBWTtBQURWLGFBSk07QUFPWkMsdUJBQVcsSUFQQztBQVFaO0FBQ0FDLHVCQUFXLElBQUksc0JBQVlDLFNBQWhCLENBQTBCLElBQTFCLEVBQWdDLEVBQUVDLFdBQVcsSUFBYixFQUFoQyxDQVRDO0FBVVpDLHFDQUF1QkMsUUFBUUMsUUFBL0IsZ0JBQWtERCxRQUFRRSxPQUExRCw2Q0FWWTtBQVdaO0FBQ0E7QUFDQUMsMEJBQWM7QUFDVkMsMkJBQVcsSUFERDtBQUVWQyxnQ0FBZ0IsTUFBTTtBQUZaO0FBYkYsU0FBaEI7O0FBbUJBO0FBQ0EsaUNBQWVDLFFBQWYsQ0FBd0JyQixHQUF4QixFQUE2QkssT0FBN0IsRUFBc0MsVUFBQ2lCLEdBQUQsRUFBTUMsWUFBTixFQUF1QjtBQUN6RCxnQkFBSUQsR0FBSixFQUFTO0FBQ0wsdUJBQU9uQixPQUFPbUIsR0FBUCxDQUFQO0FBQ0g7O0FBRURwQixvQkFBUXFCLFlBQVI7QUFDSCxTQU5EO0FBT0gsS0FoQ3VCLENBQVQ7QUFBQSxDQUFmOztBQWtDQTs7Ozs7Ozs7QUFRQSxJQUFNQyxhQUFhLFNBQWJBLFVBQWEsQ0FBQ0MsSUFBRCxFQUFPQyxJQUFQLEVBQWFDLE9BQWIsRUFBeUI7QUFDeENBLGNBQVVBLFdBQVdaLFFBQVFhLEdBQVIsQ0FBWUQsT0FBWixDQUFyQjtBQUNBRCxXQUFPQyxXQUFXRCxJQUFsQjs7QUFFQUQsV0FBTyxPQUFPQSxJQUFQLEtBQWdCLFFBQWhCLEdBQTJCLENBQUNBLElBQUQsQ0FBM0IsR0FBb0NBLElBQTNDO0FBQ0FBLFdBQU9BLEtBQUtJLEdBQUwsQ0FBUyxVQUFDN0IsR0FBRCxFQUFTO0FBQ3JCLFlBQUk4QixTQUFTOUIsR0FBYjs7QUFFQTtBQUNBLFlBQUkwQixJQUFKLEVBQVU7QUFDTixnQkFBSUEsS0FBS0EsS0FBS0ssTUFBTCxHQUFjLENBQW5CLE1BQTBCLEdBQTFCLElBQWlDL0IsSUFBSSxDQUFKLE1BQVcsR0FBaEQsRUFBcUQ7QUFDakQwQix3QkFBUSxHQUFSO0FBQ0gsYUFGRCxNQUVPLElBQUlBLEtBQUtBLEtBQUtLLE1BQUwsR0FBYyxDQUFuQixNQUEwQixHQUExQixJQUFpQy9CLElBQUksQ0FBSixNQUFXLEdBQWhELEVBQXFEO0FBQ3hEMEIsdUJBQU9BLEtBQUtNLFNBQUwsQ0FBZSxDQUFmLEVBQWtCTixLQUFLSyxNQUFMLEdBQWMsQ0FBaEMsQ0FBUDtBQUNIOztBQUVERCxxQkFBU0osT0FBT0ksTUFBaEI7QUFDSDs7QUFFRDtBQUNBLGVBQU8sRUFBRUcsWUFBWUgsTUFBZCxFQUFzQkksYUFBYWxDLEdBQW5DLEVBQVA7QUFDSCxLQWhCTSxDQUFQOztBQWtCQSxXQUFPeUIsSUFBUDtBQUNILENBeEJEOztBQTBCQTs7Ozs7OztBQU9BLElBQU1VLFNBQVMsU0FBVEEsTUFBUyxDQUFDQyxHQUFELEVBQU1DLElBQU4sRUFBZTtBQUMxQkEsV0FBTyxPQUFPQSxJQUFQLEtBQWdCLFFBQWhCLEdBQTJCLEVBQUVDLElBQUlELElBQU4sRUFBM0IsR0FBMENBLElBQWpEOztBQUVBLFFBQU1FLFVBQVUsSUFBSXRDLE9BQUosQ0FBWSxVQUFDQyxPQUFELEVBQVVDLE1BQVYsRUFBcUI7QUFDN0M7QUFDQSxZQUFJa0MsS0FBS0MsRUFBTCxLQUFZLEtBQVosSUFBcUIsQ0FBQyxrQkFBTUYsR0FBTixDQUExQixFQUFzQztBQUNsQyxtQkFBT2pDLE9BQU8sSUFBSUMsS0FBSixDQUFVLGVBQVYsQ0FBUCxDQUFQO0FBQ0g7O0FBRURGLGdCQUFRa0MsR0FBUjtBQUNILEtBUGUsRUFRZkksSUFSZSxDQVFWO0FBQUEsZUFBZSxJQUFJdkMsT0FBSixDQUFZLFVBQUNDLE9BQUQsRUFBVUMsTUFBVixFQUFxQjtBQUNsRDtBQUNBLGdCQUFNc0MsaUJBQWlCLGdCQUFNQyxvQkFBTixFQUF2QjtBQUNBLGdCQUFNQyxTQUFTLEVBQWY7QUFDQSxnQkFBTUMsT0FBTyxFQUFiO0FBQ0EsZ0JBQU1DLFFBQVEsRUFBZDs7QUFFQUosMkJBQWVLLEVBQWYsQ0FBa0IsWUFBbEIsRUFBZ0MsaUJBQVM7QUFBRUgsdUJBQU9JLElBQVAsQ0FBWUMsS0FBWjtBQUFxQixhQUFoRTtBQUNBUCwyQkFBZUssRUFBZixDQUFrQixPQUFsQixFQUEyQixpQkFBUztBQUFFSCx1QkFBT0ksSUFBUCxDQUFZQyxLQUFaO0FBQXFCLGFBQTNEO0FBQ0FQLDJCQUFlSyxFQUFmLENBQWtCLEtBQWxCLEVBQXlCLGVBQU87QUFBRUYscUJBQUtHLElBQUwsQ0FBVUUsR0FBVjtBQUFpQixhQUFuRDtBQUNBUiwyQkFBZUssRUFBZixDQUFrQixNQUFsQixFQUEwQixnQkFBUTtBQUFFRCxzQkFBTUUsSUFBTixDQUFXRyxJQUFYO0FBQW1CLGFBQXZEOztBQUVBO0FBQ0EsZ0JBQU1DLFNBQVM7QUFDWFYsOENBRFc7QUFFWFcseUJBQVMsQ0FBQyxzQ0FBRCxDQUZFO0FBR1hDLDBCQUFVO0FBQ05DLDRDQUF3QixDQUFDLFFBQUQsRUFBVyxNQUFYLENBRGxCO0FBRU5DLDhDQUEwQixDQUFDLFFBQUQsQ0FGcEI7QUFHTkMsMkNBQXVCO0FBSGpCLGlCQUhDO0FBUVhDLHNCQUFNLGNBQUNuQyxHQUFELEVBQU1vQyxNQUFOLEVBQWlCO0FBQ25CLHdCQUFJcEMsR0FBSixFQUFTO0FBQUUsK0JBQU9uQixPQUFPbUIsR0FBUCxDQUFQO0FBQXFCO0FBQ2hDcEIsNEJBQVEsRUFBRXdELGNBQUYsRUFBVWYsY0FBVixFQUFrQkMsVUFBbEIsRUFBd0JDLFlBQXhCLEVBQVI7QUFDSDtBQVhVLGFBQWY7O0FBY0E7QUFDQSw0QkFBTWpCLEdBQU4sQ0FBVStCLFdBQVYsRUFBdUJSLE1BQXZCO0FBQ0gsU0E3Qm9CLENBQWY7QUFBQSxLQVJVLENBQWhCOztBQXVDQSxXQUFPWixPQUFQO0FBQ0gsQ0EzQ0Q7O0FBNkNBOzs7Ozs7QUFNQSxJQUFNcUIsTUFBTSxTQUFOQSxHQUFNLENBQUNDLElBQUQsRUFBVTtBQUNsQixRQUFNekIsTUFBTSxPQUFPeUIsS0FBS3pCLEdBQVosS0FBb0IsUUFBcEIsR0FBK0IsQ0FBQ3lCLEtBQUt6QixHQUFOLENBQS9CLEdBQTRDeUIsS0FBS3pCLEdBQTdEO0FBQ0EsUUFBTUMsT0FBTyxPQUFPd0IsS0FBS3hCLElBQVosS0FBcUIsUUFBckIsR0FBZ0MsRUFBRUMsSUFBSXVCLEtBQUt4QixJQUFYLEVBQWhDLEdBQW9Ed0IsS0FBS3hCLElBQXRFO0FBQ0EsUUFBSXlCLFNBQVMxQixHQUFiOztBQUVBO0FBQ0EsUUFBSUMsS0FBS0MsRUFBTCxLQUFZLEtBQWhCLEVBQXVCO0FBQ25Cd0IsaUJBQVN0QyxXQUFXc0MsTUFBWCxFQUFtQnpCLEtBQUtYLElBQXhCLEVBQThCVyxLQUFLVixPQUFuQyxDQUFUO0FBQ0gsS0FGRCxNQUVPLElBQUlVLEtBQUtDLEVBQUwsS0FBWSxNQUFoQixFQUF3QjtBQUMzQndCLGlCQUFTQSxPQUFPakMsR0FBUCxDQUFXO0FBQUEsbUJBQVEsRUFBRUksWUFBWThCLFFBQVEsbUJBQU9DLEdBQVAsQ0FBUixDQUFkLEVBQW9DOUIsYUFBYThCLEdBQWpELEVBQVI7QUFBQSxTQUFYLENBQVQ7QUFDSCxLQUZNLE1BRUE7QUFDSEYsaUJBQVNBLE9BQU9qQyxHQUFQLENBQVc7QUFBQSxtQkFBUSxFQUFFSSxZQUFZK0IsR0FBZCxFQUFtQjlCLGFBQWE4QixHQUFoQyxFQUFSO0FBQUEsU0FBWCxDQUFUO0FBQ0g7O0FBRUQ7QUFDQSxRQUFNQyxlQUFlSCxPQUFPakMsR0FBUCxDQUFXLFVBQUNxQyxHQUFEO0FBQUEsZUFBUy9CLE9BQU8rQixJQUFJakMsVUFBWCxFQUF1QkksSUFBdkIsRUFDeENHLElBRHdDLENBQ25DLFVBQUMyQixNQUFELEVBQVk7QUFDZEQsZ0JBQUlDLE1BQUosR0FBYUEsTUFBYjtBQUNBLG1CQUFPRCxHQUFQO0FBQ0gsU0FKd0MsRUFLeENFLEtBTHdDLENBS2xDLFVBQUM5QyxHQUFELEVBQVM7QUFDWjRDLGdCQUFJNUMsR0FBSixHQUFVQSxHQUFWO0FBQ0Esa0JBQU00QyxHQUFOO0FBQ0gsU0FSd0MsQ0FBVDtBQUFBLEtBQVgsQ0FBckI7O0FBVUEsV0FBT2pFLFFBQVFvRSxHQUFSLENBQVlKLFlBQVosQ0FBUDtBQUNILENBMUJEOztBQTRCQTtBQUNBOztRQUVTTCxHLEdBQUFBLEc7UUFDQXpCLE0sR0FBQUEsTTtRQUNBcEMsTSxHQUFBQSxNOztBQUVUIiwiZmlsZSI6InNjcmFwZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG4vKiBnbG9iYWwgUHJvbWlzZSAqL1xuXG5pbXBvcnQganNkb20gZnJvbSAnanNkb20nO1xuaW1wb3J0IHJlc291cmNlTG9hZGVyIGZyb20gJ2pzZG9tL2xpYi9qc2RvbS9icm93c2VyL3Jlc291cmNlLWxvYWRlcic7XG5pbXBvcnQgdG91Z2hDb29raWUgZnJvbSAndG91Z2gtY29va2llJztcbmltcG9ydCB7IGlzVXJsIH0gZnJvbSAnLi91dGlscy5qcyc7XG5pbXBvcnQgeyBnZXRQd2QgfSBmcm9tICcuL3V0aWxzLmpzJztcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBGdW5jdGlvbnNcblxuLyoqXG4gKiBHZXRzIHVybCBtYXJrdXBcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsXG4gKiBAcmV0dXJucyB7cHJvbWlzZX1cbiAqL1xuY29uc3QgZ2V0VXJsID0gKHVybCkgPT4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGlmICh0eXBlb2YgdXJsICE9PSAnc3RyaW5nJykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VybCBuZWVkcyB0byBiZSBhIHN0cmluZycpO1xuICAgIH1cblxuICAgIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICAgIGRlZmF1bHRFbmNvZGluZzogJ3dpbmRvd3MtMTI1MicsXG4gICAgICAgIGRldGVjdE1ldGFDaGFyc2V0OiB0cnVlLFxuICAgICAgICAvLyBoZWFkZXJzOiBjb25maWcuaGVhZGVycyxcbiAgICAgICAgcG9vbDoge1xuICAgICAgICAgICAgbWF4U29ja2V0czogNlxuICAgICAgICB9LFxuICAgICAgICBzdHJpY3RTU0w6IHRydWUsXG4gICAgICAgIC8vIHByb3h5OiBjb25maWcucHJveHksXG4gICAgICAgIGNvb2tpZUphcjogbmV3IHRvdWdoQ29va2llLkNvb2tpZUphcihudWxsLCB7IGxvb3NlTW9kZTogdHJ1ZSB9KSxcbiAgICAgICAgdXNlckFnZW50OiBgTm9kZS5qcyAoJHtwcm9jZXNzLnBsYXRmb3JtfTsgVTsgcnY6JHtwcm9jZXNzLnZlcnNpb259KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKWAsXG4gICAgICAgIC8vIGFnZW50OiBjb25maWcuYWdlbnQsXG4gICAgICAgIC8vIGFnZW50Q2xhc3M6IGNvbmZpZy5hZ2VudENsYXNzLFxuICAgICAgICBhZ2VudE9wdGlvbnM6IHtcbiAgICAgICAgICAgIGtlZXBBbGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgIGtlZXBBbGl2ZU1zZWNzOiAxMTUgKiAxMDAwXG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gRmluYWxseSBkb3dubG9hZCBpdCFcbiAgICByZXNvdXJjZUxvYWRlci5kb3dubG9hZCh1cmwsIG9wdGlvbnMsIChlcnIsIHJlc3BvbnNlVGV4dCkgPT4ge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KGVycik7XG4gICAgICAgIH1cblxuICAgICAgICByZXNvbHZlKHJlc3BvbnNlVGV4dCk7XG4gICAgfSk7XG59KTtcblxuLyoqXG4gKiBHZXQgcmVxdWVzdCB1cmxzXG4gKlxuICogQHBhcmFtIHthcnJheXxzdHJpbmd9IHVybHNcbiAqIEBwYXJhbSB7c3RyaW5nfSBiYXNlXG4gKiBAcGFyYW0ge3N0cmluZ30gYmFzZUVudlxuICogQHJldHVybnMge2FycmF5fVxuICovXG5jb25zdCBnZXRSZXFVcmxzID0gKHVybHMsIGJhc2UsIGJhc2VFbnYpID0+IHtcbiAgICBiYXNlRW52ID0gYmFzZUVudiAmJiBwcm9jZXNzLmVudltiYXNlRW52XTtcbiAgICBiYXNlID0gYmFzZUVudiB8fCBiYXNlO1xuXG4gICAgdXJscyA9IHR5cGVvZiB1cmxzID09PSAnc3RyaW5nJyA/IFt1cmxzXSA6IHVybHM7XG4gICAgdXJscyA9IHVybHMubWFwKCh1cmwpID0+IHtcbiAgICAgICAgbGV0IHJlcVVybCA9IHVybDtcblxuICAgICAgICAvLyBMZXRzIHNldCB0aGUgYmFzZXNcbiAgICAgICAgaWYgKGJhc2UpIHtcbiAgICAgICAgICAgIGlmIChiYXNlW2Jhc2UubGVuZ3RoIC0gMV0gIT09ICcvJyAmJiB1cmxbMF0gIT09ICcvJykge1xuICAgICAgICAgICAgICAgIGJhc2UgKz0gJy8nO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChiYXNlW2Jhc2UubGVuZ3RoIC0gMV0gPT09ICcvJyAmJiB1cmxbMF0gPT09ICcvJykge1xuICAgICAgICAgICAgICAgIGJhc2UgPSBiYXNlLnN1YnN0cmluZygwLCBiYXNlLmxlbmd0aCAtIDEpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXFVcmwgPSBiYXNlICsgcmVxVXJsO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ29uc3RydWN0IG9iamVjdFxuICAgICAgICByZXR1cm4geyByZXF1ZXN0U3JjOiByZXFVcmwsIG9yaWdpbmFsU3JjOiB1cmwgfTtcbiAgICB9KTtcblxuICAgIHJldHVybiB1cmxzO1xufTtcblxuLyoqXG4gKiBHZXRzIERPTSBmcm9tIHVybFxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBzcmNcbiAqIEBwYXJhbSB7c3RyaW5nfG9iamVjdH0gdHlwZVxuICogQHJldHVybnMge3Byb21pc2V9XG4gKi9cbmNvbnN0IGdldERvbSA9IChzcmMsIHR5cGUpID0+IHtcbiAgICB0eXBlID0gdHlwZW9mIHR5cGUgPT09ICdzdHJpbmcnID8geyBvZjogdHlwZSB9IDogdHlwZTtcblxuICAgIGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIC8vIE5lZWQgdG8gY2hlY2sgaWYgdXJsIGlzIG9rXG4gICAgICAgIGlmICh0eXBlLm9mID09PSAndXJsJyAmJiAhaXNVcmwoc3JjKSkge1xuICAgICAgICAgICAgcmV0dXJuIHJlamVjdChuZXcgRXJyb3IoJ1VybCBub3QgdmFsaWQnKSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXNvbHZlKHNyYyk7XG4gICAgfSlcbiAgICAudGhlbihyZXRyaWV2ZVNyYyA9PiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIC8vIFByZXBhcmUgZm9yIHBvc3NpYmxlIGVycm9yc1xuICAgICAgICBjb25zdCB2aXJ0dWFsQ29uc29sZSA9IGpzZG9tLmNyZWF0ZVZpcnR1YWxDb25zb2xlKCk7XG4gICAgICAgIGNvbnN0IGVycm9ycyA9IFtdO1xuICAgICAgICBjb25zdCBsb2dzID0gW107XG4gICAgICAgIGNvbnN0IHdhcm5zID0gW107XG5cbiAgICAgICAgdmlydHVhbENvbnNvbGUub24oJ2pzZG9tRXJyb3InLCBlcnJvciA9PiB7IGVycm9ycy5wdXNoKGVycm9yKTsgfSk7XG4gICAgICAgIHZpcnR1YWxDb25zb2xlLm9uKCdlcnJvcicsIGVycm9yID0+IHsgZXJyb3JzLnB1c2goZXJyb3IpOyB9KTtcbiAgICAgICAgdmlydHVhbENvbnNvbGUub24oJ2xvZycsIGxvZyA9PiB7IGxvZ3MucHVzaChsb2cpOyB9KTtcbiAgICAgICAgdmlydHVhbENvbnNvbGUub24oJ3dhcm4nLCB3YXJuID0+IHsgd2FybnMucHVzaCh3YXJuKTsgfSk7XG5cbiAgICAgICAgLy8gQ29uZmlnXG4gICAgICAgIGNvbnN0IGNvbmZpZyA9IHtcbiAgICAgICAgICAgIHZpcnR1YWxDb25zb2xlLFxuICAgICAgICAgICAgc2NyaXB0czogWydodHRwOi8vY29kZS5qcXVlcnkuY29tL2pxdWVyeS5taW4uanMnXSxcbiAgICAgICAgICAgIGZlYXR1cmVzOiB7XG4gICAgICAgICAgICAgICAgRmV0Y2hFeHRlcm5hbFJlc291cmNlczogWydzY3JpcHQnLCAnbGluayddLFxuICAgICAgICAgICAgICAgIFByb2Nlc3NFeHRlcm5hbFJlc291cmNlczogWydzY3JpcHQnXSxcbiAgICAgICAgICAgICAgICBTa2lwRXh0ZXJuYWxSZXNvdXJjZXM6IGZhbHNlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZG9uZTogKGVyciwgd2luZG93KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikgeyByZXR1cm4gcmVqZWN0KGVycik7IH1cbiAgICAgICAgICAgICAgICByZXNvbHZlKHsgd2luZG93LCBlcnJvcnMsIGxvZ3MsIHdhcm5zIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIE5vdyBmb3IgdGhlIGFjdHVhbCBnZXR0aW5nXG4gICAgICAgIGpzZG9tLmVudihyZXRyaWV2ZVNyYywgY29uZmlnKTtcbiAgICB9KSk7XG5cbiAgICByZXR1cm4gcHJvbWlzZTtcbn07XG5cbi8qKlxuICogU2NyYXBlc1xuICpcbiAqIEBwYXJhbSAge29iamVjdH0gZGF0YVxuICogQHJldHVybnMge3Byb21pc2V9XG4gKi9cbmNvbnN0IHJ1biA9IChkYXRhKSA9PiB7XG4gICAgY29uc3Qgc3JjID0gdHlwZW9mIGRhdGEuc3JjID09PSAnc3RyaW5nJyA/IFtkYXRhLnNyY10gOiBkYXRhLnNyYztcbiAgICBjb25zdCB0eXBlID0gdHlwZW9mIGRhdGEudHlwZSA9PT0gJ3N0cmluZycgPyB7IG9mOiBkYXRhLnR5cGUgfSA6IGRhdGEudHlwZTtcbiAgICBsZXQgcmVxU3JjID0gc3JjO1xuXG4gICAgLy8gTGV0cyBwYXJzZSBzb3VyY2VzIGludG8gd2hhdCB3ZSdyZSBleHBlY3RpbmdcbiAgICBpZiAodHlwZS5vZiA9PT0gJ3VybCcpIHtcbiAgICAgICAgcmVxU3JjID0gZ2V0UmVxVXJscyhyZXFTcmMsIHR5cGUuYmFzZSwgdHlwZS5iYXNlRW52KTtcbiAgICB9IGVsc2UgaWYgKHR5cGUub2YgPT09ICdmaWxlJykge1xuICAgICAgICByZXFTcmMgPSByZXFTcmMubWFwKHZhbCA9PiAoeyByZXF1ZXN0U3JjOiByZXF1aXJlKGdldFB3ZCh2YWwpKSwgb3JpZ2luYWxTcmM6IHZhbCB9KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmVxU3JjID0gcmVxU3JjLm1hcCh2YWwgPT4gKHsgcmVxdWVzdFNyYzogdmFsLCBvcmlnaW5hbFNyYzogdmFsIH0pKTtcbiAgICB9XG5cbiAgICAvLyBGaW5hbGx5IGxldHMgc2V0IHRoZSBwcm9taXNlc1xuICAgIGNvbnN0IHVybHNQcm9taXNlcyA9IHJlcVNyYy5tYXAoKHJlcSkgPT4gZ2V0RG9tKHJlcS5yZXF1ZXN0U3JjLCB0eXBlKVxuICAgIC50aGVuKChkb21SZXEpID0+IHtcbiAgICAgICAgcmVxLmRvbVJlcSA9IGRvbVJlcTtcbiAgICAgICAgcmV0dXJuIHJlcTtcbiAgICB9KVxuICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgIHJlcS5lcnIgPSBlcnI7XG4gICAgICAgIHRocm93IHJlcTtcbiAgICB9KSk7XG5cbiAgICByZXR1cm4gUHJvbWlzZS5hbGwodXJsc1Byb21pc2VzKTtcbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBFeHBvcnRcblxuZXhwb3J0IHsgcnVuIH07XG5leHBvcnQgeyBnZXREb20gfTtcbmV4cG9ydCB7IGdldFVybCB9O1xuXG4vLyBFc3NlbnRpYWxseSBmb3IgdGVzdGluZyBwdXJwb3Nlc1xuZXhwb3J0IGNvbnN0IF9fdGVzdE1ldGhvZHNfXyA9IHsgcnVuLCBnZXREb20sIGdldFJlcVVybHMsIGdldFVybCB9O1xuIl19