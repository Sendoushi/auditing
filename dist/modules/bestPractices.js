'use strict';
/* global Promise */

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _scraper = require('../scraper.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//-------------------------------------
// Functions

/**
 * Checks if there were logs in the console
 *
 * @param {object} req
 * @returns promise
 */
var hasntLogs = function hasntLogs(req) {
    return new Promise(function (resolve, reject) {
        req.domReq.logs.length ? reject(req.domReq.logs) : resolve(true);
    });
};

/**
 * Checks if there were warnings in the console
 *
 * @param {object} req
 * @returns promise
 */
var hasntWarns = function hasntWarns(req) {
    return new Promise(function (resolve, reject) {
        req.domReq.warns.length ? reject(req.domReq.warns) : resolve(true);
    });
};

/**
 * Checks if there were errors
 *
 * @param {object} req
 * @returns promise
 */
var hasntErrors = function hasntErrors(req) {
    return new Promise(function (resolve, reject) {
        req.domReq.errors.length ? reject(req.domReq.errors) : resolve(true);
    });
};

/**
 * Checks if js is versioned
 *
 * @param {object} req
 * @returns promise
 */
var hasJsVersion = function hasJsVersion(req) {
    return new Promise(function (resolve, reject) {
        var links = req.domReq.window.$('script');
        var safeIgnore = ['jquery', 'cdn'];
        var rejected = false;

        // Lets see if one of these doesn't have versioning
        links.each(function (i, val) {
            if (rejected) {
                return;
            }

            var href = val.getAttribute('src');

            // Just ignore
            if (typeof href !== 'string' || href === '') {
                return;
            }

            // Lets ignore common things we don't want to version out
            var ignored = safeIgnore.map(function (ign) {
                return new RegExp(ign, 'g').exec(href);
            }).filter(function (ign) {
                return !!ign;
            })[0];
            if (ignored) {
                return;
            }

            href = _path2.default.basename(href);
            var firstVersion = /.+\.(.+)\.js/g.exec(href);
            var secondVersion = /.+\.js\?.+/g.exec(href);
            var thirdVersion = href.length > 20;

            rejected = rejected || !firstVersion && !secondVersion && !thirdVersion && href;
        });

        // Everything must've went fine
        !rejected ? resolve(true) : reject(rejected);
    });
};

/**
 * Checks if css is versioned
 *
 * @param {object} req
 * @returns promise
 */
var hasCssVersion = function hasCssVersion(req) {
    return new Promise(function (resolve, reject) {
        var links = req.domReq.window.$('link[rel="stylesheet"]');
        var safeIgnore = ['jquery', 'cdn'];
        var rejected = false;

        // Lets see if one of these doesn't have versioning
        links.each(function (i, val) {
            if (rejected) {
                return;
            }

            var href = val.getAttribute('href');

            // Just ignore
            if (typeof href !== 'string' || href === '') {
                return;
            }

            // Lets ignore common things we don't want to version out
            var ignored = safeIgnore.map(function (ign) {
                return new RegExp(ign, 'g').exec(href);
            }).filter(function (ign) {
                return !!ign;
            })[0];
            if (ignored) {
                return;
            }

            href = _path2.default.basename(href);
            var firstVersion = /.+\.(.+)\.css/g.exec(href);
            var secondVersion = /.+\.css\?.+/g.exec(href);
            var thirdVersion = href.length > 20;

            rejected = rejected || !firstVersion && !secondVersion && !thirdVersion && href;
        });

        // Everything must've went fine
        !rejected ? resolve(true) : reject(rejected);
    });
};

/**
 * Check if all css is minified
 *
 * @param {object} req
 * @returns promise
 */
var isCssMinified = function isCssMinified(req) {
    return new Promise(function (resolve, reject) {
        var cssPattern = /<link.*?stylesheet.*?=['|"](.+?\.css)['|"].*?>/g;
        var markup = req.domReq.window.document.documentElement.innerHTML;
        var links = markup.match(cssPattern);

        // Lets get just the actual links
        links = links && links.map(function (val) {
            val = val.match(/href=['|"](.+)['|"]/g);
            val = val[0].replace(/href=['|"]/g, '').replace(/['|"]/g, '');

            if (!val.match(/(http[^|\s])/g)) {
                // TODO: This won't work without a protocol... We could actually check the requestSrc
                console.warn(val + ' isn\'t being tested with rule "isCssMinified" because it has no full route with protocol. Eventually I\'ll get to this issue.');
                return false;
            } else if (val.match(/\.min\./g)) {
                // No need to go further if the file actually states so
                return false;
            }

            return val;
        }).filter(function (val) {
            return !!val;
        });

        if (!links || !links.length) {
            return resolve(true);
        }

        // Lets run all promises
        // We need to request it now
        var promises = links.map(function (val) {
            return (0, _scraper.getUrl)(val).then(function (content) {
                var firstParam = /} \./g.exec(content) || /.* }/g.exec(content);
                var secondParam = /; .*/g.exec(content) || /: .*/g.exec(content);

                // TODO: Improve...

                if (firstParam || secondParam) {
                    throw new Error(val);
                }

                // Everything must've went fine
                return true;
            });
        });

        // Run it all
        Promise.all(promises).then(function (data) {
            var dataResults = data.filter(function (val) {
                return val !== true;
            });

            if (dataResults.length) {
                throw new Error(dataResults[0]);
            }

            resolve(true);
        }).catch(reject);
    });
};

/**
 * Check if all js is minified
 *
 * @param {object} req
 * @returns promise
 */
var isJsMinified = function isJsMinified(req) {
    return new Promise(function (resolve, reject) {
        var scriptPattern = /<script.*?src=['|"](.+?\.js)['|"].*?\/script>/g;
        var markup = req.domReq.window.document.documentElement.innerHTML;
        var links = markup.match(scriptPattern);

        // Lets get just the actual links
        links = links && links.map(function (val) {
            val = val.match(/src=['|"](.+)['|"]/g);
            val = val[0].replace(/src=['|"]/g, '').replace(/['|"]/g, '');

            if (!val.match(/(http[^|\s])/g)) {
                // TODO: This won't work without a protocol... We could actually check the requestSrc
                console.warn(val + ' isn\'t being tested with rule "isJsMinified" because it has no full route with protocol. Eventually I\'ll get to this issue.');
            } else if (val.match(/\.min\./g)) {
                // No need to go further if the file actually states so
                return false;
            }

            return val;
        }).filter(function (val) {
            return !!val;
        });

        if (!links || !links.length) {
            return resolve(true);
        }

        // Lets run all promises
        // We need to request it now
        var promises = links.map(function (val) {
            return (0, _scraper.getUrl)(val).then(function (content) {
                var firstParam = /} \./g.exec(content) || /.* }/g.exec(content);
                // These don't work with some minifiers (like for example jquery)
                // const secondParam = /; .*/g.exec(content) || /: .*/g.exec(content);

                // TODO: Improve...

                if (firstParam) {
                    throw new Error(val);
                }

                // Everything must've went fine
                return true;
            });
        });

        // Run it all
        Promise.all(promises).then(function (data) {
            var dataResults = data.filter(function (val) {
                return val !== true;
            });

            if (dataResults.length) {
                throw new Error(dataResults[0]);
            }

            resolve(true);
        }).catch(reject);
    });
};

/**
 * Check if has css prefixes
 *
 * @param {object} req
 * @returns promise
 */
var hasCssPrefixes = function hasCssPrefixes() {
    return new Promise(function (resolve) {
        // TODO: ...
        resolve();
    });
};

//-------------------------------------
// Export

exports.default = {
    name: 'bestPractices',
    rules: [{ name: 'hasntLogs', fn: hasntLogs }, { name: 'hasntWarns', fn: hasntWarns }, { name: 'hasntErrors', fn: hasntErrors }, { name: 'hasCssVersion', fn: hasCssVersion }, { name: 'hasJsVersion', fn: hasJsVersion }, { name: 'isCssMinified', fn: isCssMinified }, { name: 'isJsMinified', fn: isJsMinified }, { name: 'hasCssPrefixes', fn: hasCssPrefixes }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2R1bGVzL2Jlc3RQcmFjdGljZXMuanMiXSwibmFtZXMiOlsiaGFzbnRMb2dzIiwicmVxIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJkb21SZXEiLCJsb2dzIiwibGVuZ3RoIiwiaGFzbnRXYXJucyIsIndhcm5zIiwiaGFzbnRFcnJvcnMiLCJlcnJvcnMiLCJoYXNKc1ZlcnNpb24iLCJsaW5rcyIsIndpbmRvdyIsIiQiLCJzYWZlSWdub3JlIiwicmVqZWN0ZWQiLCJlYWNoIiwiaSIsInZhbCIsImhyZWYiLCJnZXRBdHRyaWJ1dGUiLCJpZ25vcmVkIiwibWFwIiwiUmVnRXhwIiwiaWduIiwiZXhlYyIsImZpbHRlciIsImJhc2VuYW1lIiwiZmlyc3RWZXJzaW9uIiwic2Vjb25kVmVyc2lvbiIsInRoaXJkVmVyc2lvbiIsImhhc0Nzc1ZlcnNpb24iLCJpc0Nzc01pbmlmaWVkIiwiY3NzUGF0dGVybiIsIm1hcmt1cCIsImRvY3VtZW50IiwiZG9jdW1lbnRFbGVtZW50IiwiaW5uZXJIVE1MIiwibWF0Y2giLCJyZXBsYWNlIiwiY29uc29sZSIsIndhcm4iLCJwcm9taXNlcyIsInRoZW4iLCJmaXJzdFBhcmFtIiwiY29udGVudCIsInNlY29uZFBhcmFtIiwiRXJyb3IiLCJhbGwiLCJkYXRhUmVzdWx0cyIsImRhdGEiLCJjYXRjaCIsImlzSnNNaW5pZmllZCIsInNjcmlwdFBhdHRlcm4iLCJoYXNDc3NQcmVmaXhlcyIsIm5hbWUiLCJydWxlcyIsImZuIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBOzs7Ozs7QUFFQTs7OztBQUNBOzs7O0FBRUE7QUFDQTs7QUFFQTs7Ozs7O0FBTUEsSUFBTUEsWUFBWSxTQUFaQSxTQUFZLENBQUNDLEdBQUQ7QUFBQSxXQUFTLElBQUlDLE9BQUosQ0FBWSxVQUFDQyxPQUFELEVBQVVDLE1BQVYsRUFBcUI7QUFDeERILFlBQUlJLE1BQUosQ0FBV0MsSUFBWCxDQUFnQkMsTUFBaEIsR0FBeUJILE9BQU9ILElB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QUFFQSxnQkFBSStCLFlBQVk1QyxNQUFoQixFQUF3QjtBQUNwQixzQkFBTSxJQUFJMEMsS0FBSixDQUFVRSxZQUFZLENBQVosQ0FBVixDQUFOO0FBQ0g7O0FBRURoRCxvQkFBUSxJQUFSO0FBQ0gsU0FSRCxFQVFHa0QsS0FSSCxDQVFTakQsTUFSVDtBQVNILEtBcEQ2QixDQUFUO0FBQUEsQ0FBckI7O0FBc0RBOzs7Ozs7QUFNQSxJQUFNb0QsaUJBQWlCLFNBQWpCQSxjQUFpQjtBQUFBLFdBQU0sSUFBSXRELE9BQUosQ0FBWSxVQUFDQyxPQUFELEVBQWE7QUFDbEQ7QUFDQUE7QUFDSCxLQUg0QixDQUFOO0FBQUEsQ0FBdkI7O0FBS0E7QUFDQTs7a0JBRWU7QUFDWHNELFVBQU0sZUFESztBQUVYQyxXQUFPLENBQ0gsRUFBRUQsTUFBTSxXQUFSLEVBQXFCRSxJQUFJM0QsU0FBekIsRUFERyxFQUVILEVBQUV5RCxNQUFNLFlBQVIsRUFBc0JFLElBQUluRCxVQUExQixFQUZHLEVBR0gsRUFBRWlELE1BQU0sYUFBUixFQUF1QkUsSUFBSWpELFdBQTNCLEVBSEcsRUFJSCxFQUFFK0MsTUFBTSxlQUFSLEVBQXlCRSxJQUFJMUIsYUFBN0IsRUFKRyxFQUtILEVBQUV3QixNQUFNLGNBQVIsRUFBd0JFLElBQUkvQyxZQUE1QixFQUxHLEVBTUgsRUFBRTZDLE1BQU0sZUFBUixFQUF5QkUsSUFBSXpCLGFBQTdCLEVBTkcsRUFPSCxFQUFFdUIsTUFBTSxjQUFSLEVBQXdCRSxJQUFJTCxZQUE1QixFQVBHLEVBUUgsRUFBRUcsTUFBTSxnQkFBUixFQUEwQkUsSUFBSUgsY0FBOUIsRUFSRztBQUZJLEMiLCJmaWxlIjoiYmVzdFByYWN0aWNlcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0Jztcbi8qIGdsb2JhbCBQcm9taXNlICovXG5cbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgZ2V0VXJsIH0gZnJvbSAnLi4vc2NyYXBlci5qcyc7XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gRnVuY3Rpb25zXG5cbi8qKlxuICogQ2hlY2tzIGlmIHRoZXJlIHdlcmUgbG9ncyBpbiB0aGUgY29uc29sZVxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSByZXFcbiAqIEByZXR1cm5zIHByb21pc2VcbiAqL1xuY29uc3QgaGFzbnRMb2dzID0gKHJlcSkgPT4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIHJlcS5kb21SZXEubG9ncy5sZW5ndGggPyByZWplY3QocmVxLmRvbVJlcS5sb2dzKSA6IHJlc29sdmUodHJ1ZSk7XG59KTtcblxuLyoqXG4gKiBDaGVja3MgaWYgdGhlcmUgd2VyZSB3YXJuaW5ncyBpbiB0aGUgY29uc29sZVxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSByZXFcbiAqIEByZXR1cm5zIHByb21pc2VcbiAqL1xuY29uc3QgaGFzbnRXYXJucyA9IChyZXEpID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICByZXEuZG9tUmVxLndhcm5zLmxlbmd0aCA/IHJlamVjdChyZXEuZG9tUmVxLndhcm5zKSA6IHJlc29sdmUodHJ1ZSk7XG59KTtcblxuLyoqXG4gKiBDaGVja3MgaWYgdGhlcmUgd2VyZSBlcnJvcnNcbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gcmVxXG4gKiBAcmV0dXJucyBwcm9taXNlXG4gKi9cbmNvbnN0IGhhc250RXJyb3JzID0gKHJlcSkgPT4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIHJlcS5kb21SZXEuZXJyb3JzLmxlbmd0aCA/IHJlamVjdChyZXEuZG9tUmVxLmVycm9ycykgOiByZXNvbHZlKHRydWUpO1xufSk7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGpzIGlzIHZlcnNpb25lZFxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSByZXFcbiAqIEByZXR1cm5zIHByb21pc2VcbiAqL1xuY29uc3QgaGFzSnNWZXJzaW9uID0gKHJlcSkgPT4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IGxpbmtzID0gcmVxLmRvbVJlcS53aW5kb3cuJCgnc2NyaXB0Jyk7XG4gICAgY29uc3Qgc2FmZUlnbm9yZSA9IFsnanF1ZXJ5JywgJ2NkbiddO1xuICAgIGxldCByZWplY3RlZCA9IGZhbHNlO1xuXG4gICAgLy8gTGV0cyBzZWUgaWYgb25lIG9mIHRoZXNlIGRvZXNuJ3QgaGF2ZSB2ZXJzaW9uaW5nXG4gICAgbGlua3MuZWFjaCgoaSwgdmFsKSA9PiB7XG4gICAgICAgIGlmIChyZWplY3RlZCkgeyByZXR1cm47IH1cblxuICAgICAgICBsZXQgaHJlZiA9IHZhbC5nZXRBdHRyaWJ1dGUoJ3NyYycpO1xuXG4gICAgICAgIC8vIEp1c3QgaWdub3JlXG4gICAgICAgIGlmICh0eXBlb2YgaHJlZiAhPT0gJ3N0cmluZycgfHwgaHJlZiA9PT0gJycpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIExldHMgaWdub3JlIGNvbW1vbiB0aGluZ3Mgd2UgZG9uJ3Qgd2FudCB0byB2ZXJzaW9uIG91dFxuICAgICAgICBjb25zdCBpZ25vcmVkID0gc2FmZUlnbm9yZS5tYXAoaWduID0+IChuZXcgUmVnRXhwKGlnbiwgJ2cnKSkuZXhlYyhocmVmKSkuZmlsdGVyKGlnbiA9PiAhIWlnbilbMF07XG4gICAgICAgIGlmIChpZ25vcmVkKSB7IHJldHVybjsgfVxuXG4gICAgICAgIGhyZWYgPSBwYXRoLmJhc2VuYW1lKGhyZWYpO1xuICAgICAgICBjb25zdCBmaXJzdFZlcnNpb24gPSAvLitcXC4oLispXFwuanMvZy5leGVjKGhyZWYpO1xuICAgICAgICBjb25zdCBzZWNvbmRWZXJzaW9uID0gLy4rXFwuanNcXD8uKy9nLmV4ZWMoaHJlZik7XG4gICAgICAgIGNvbnN0IHRoaXJkVmVyc2lvbiA9IGhyZWYubGVuZ3RoID4gMjA7XG5cbiAgICAgICAgcmVqZWN0ZWQgPSByZWplY3RlZCB8fCAhZmlyc3RWZXJzaW9uICYmICFzZWNvbmRWZXJzaW9uICYmICF0aGlyZFZlcnNpb24gJiYgaHJlZjtcbiAgICB9KTtcblxuICAgIC8vIEV2ZXJ5dGhpbmcgbXVzdCd2ZSB3ZW50IGZpbmVcbiAgICAhcmVqZWN0ZWQgPyByZXNvbHZlKHRydWUpIDogcmVqZWN0KHJlamVjdGVkKTtcbn0pO1xuXG4vKipcbiAqIENoZWNrcyBpZiBjc3MgaXMgdmVyc2lvbmVkXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IHJlcVxuICogQHJldHVybnMgcHJvbWlzZVxuICovXG5jb25zdCBoYXNDc3NWZXJzaW9uID0gKHJlcSkgPT4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IGxpbmtzID0gcmVxLmRvbVJlcS53aW5kb3cuJCgnbGlua1tyZWw9XCJzdHlsZXNoZWV0XCJdJyk7XG4gICAgY29uc3Qgc2FmZUlnbm9yZSA9IFsnanF1ZXJ5JywgJ2NkbiddO1xuICAgIGxldCByZWplY3RlZCA9IGZhbHNlO1xuXG4gICAgLy8gTGV0cyBzZWUgaWYgb25lIG9mIHRoZXNlIGRvZXNuJ3QgaGF2ZSB2ZXJzaW9uaW5nXG4gICAgbGlua3MuZWFjaCgoaSwgdmFsKSA9PiB7XG4gICAgICAgIGlmIChyZWplY3RlZCkgeyByZXR1cm47IH1cblxuICAgICAgICBsZXQgaHJlZiA9IHZhbC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKTtcblxuICAgICAgICAvLyBKdXN0IGlnbm9yZVxuICAgICAgICBpZiAodHlwZW9mIGhyZWYgIT09ICdzdHJpbmcnIHx8IGhyZWYgPT09ICcnKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBMZXRzIGlnbm9yZSBjb21tb24gdGhpbmdzIHdlIGRvbid0IHdhbnQgdG8gdmVyc2lvbiBvdXRcbiAgICAgICAgY29uc3QgaWdub3JlZCA9IHNhZmVJZ25vcmUubWFwKGlnbiA9PiAobmV3IFJlZ0V4cChpZ24sICdnJykpLmV4ZWMoaHJlZikpLmZpbHRlcihpZ24gPT4gISFpZ24pWzBdO1xuICAgICAgICBpZiAoaWdub3JlZCkgeyByZXR1cm47IH1cblxuICAgICAgICBocmVmID0gcGF0aC5iYXNlbmFtZShocmVmKTtcbiAgICAgICAgY29uc3QgZmlyc3RWZXJzaW9uID0gLy4rXFwuKC4rKVxcLmNzcy9nLmV4ZWMoaHJlZik7XG4gICAgICAgIGNvbnN0IHNlY29uZFZlcnNpb24gPSAvLitcXC5jc3NcXD8uKy9nLmV4ZWMoaHJlZik7XG4gICAgICAgIGNvbnN0IHRoaXJkVmVyc2lvbiA9IGhyZWYubGVuZ3RoID4gMjA7XG5cbiAgICAgICAgcmVqZWN0ZWQgPSByZWplY3RlZCB8fCAhZmlyc3RWZXJzaW9uICYmICFzZWNvbmRWZXJzaW9uICYmICF0aGlyZFZlcnNpb24gJiYgaHJlZjtcbiAgICB9KTtcblxuICAgIC8vIEV2ZXJ5dGhpbmcgbXVzdCd2ZSB3ZW50IGZpbmVcbiAgICAhcmVqZWN0ZWQgPyByZXNvbHZlKHRydWUpIDogcmVqZWN0KHJlamVjdGVkKTtcbn0pO1xuXG4vKipcbiAqIENoZWNrIGlmIGFsbCBjc3MgaXMgbWluaWZpZWRcbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gcmVxXG4gKiBAcmV0dXJucyBwcm9taXNlXG4gKi9cbmNvbnN0IGlzQ3NzTWluaWZpZWQgPSAocmVxKSA9PiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc3QgY3NzUGF0dGVybiA9IC88bGluay4qP3N0eWxlc2hlZXQuKj89Wyd8XCJdKC4rP1xcLmNzcylbJ3xcIl0uKj8+L2c7XG4gICAgY29uc3QgbWFya3VwID0gcmVxLmRvbVJlcS53aW5kb3cuZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmlubmVySFRNTDtcbiAgICBsZXQgbGlua3MgPSBtYXJrdXAubWF0Y2goY3NzUGF0dGVybik7XG5cbiAgICAvLyBMZXRzIGdldCBqdXN0IHRoZSBhY3R1YWwgbGlua3NcbiAgICBsaW5rcyA9IGxpbmtzICYmIGxpbmtzLm1hcCh2YWwgPT4ge1xuICAgICAgICB2YWwgPSB2YWwubWF0Y2goL2hyZWY9Wyd8XCJdKC4rKVsnfFwiXS9nKTtcbiAgICAgICAgdmFsID0gdmFsWzBdLnJlcGxhY2UoL2hyZWY9Wyd8XCJdL2csICcnKS5yZXBsYWNlKC9bJ3xcIl0vZywgJycpO1xuXG4gICAgICAgIGlmICghdmFsLm1hdGNoKC8oaHR0cFtefFxcc10pL2cpKSB7XG4gICAgICAgICAgICAvLyBUT0RPOiBUaGlzIHdvbid0IHdvcmsgd2l0aG91dCBhIHByb3RvY29sLi4uIFdlIGNvdWxkIGFjdHVhbGx5IGNoZWNrIHRoZSByZXF1ZXN0U3JjXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYCR7dmFsfSBpc25cXCd0IGJlaW5nIHRlc3RlZCB3aXRoIHJ1bGUgXCJpc0Nzc01pbmlmaWVkXCIgYmVjYXVzZSBpdCBoYXMgbm8gZnVsbCByb3V0ZSB3aXRoIHByb3RvY29sLiBFdmVudHVhbGx5IEknbGwgZ2V0IHRvIHRoaXMgaXNzdWUuYCk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0gZWxzZSBpZiAodmFsLm1hdGNoKC9cXC5taW5cXC4vZykpIHtcbiAgICAgICAgICAgIC8vIE5vIG5lZWQgdG8gZ28gZnVydGhlciBpZiB0aGUgZmlsZSBhY3R1YWxseSBzdGF0ZXMgc29cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB2YWw7XG4gICAgfSkuZmlsdGVyKHZhbCA9PiAhIXZhbCk7XG5cbiAgICBpZiAoIWxpbmtzIHx8ICFsaW5rcy5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIHJlc29sdmUodHJ1ZSk7XG4gICAgfVxuXG4gICAgLy8gTGV0cyBydW4gYWxsIHByb21pc2VzXG4gICAgLy8gV2UgbmVlZCB0byByZXF1ZXN0IGl0IG5vd1xuICAgIGNvbnN0IHByb21pc2VzID0gbGlua3MubWFwKHZhbCA9PiBnZXRVcmwodmFsKS50aGVuKGNvbnRlbnQgPT4ge1xuICAgICAgICBjb25zdCBmaXJzdFBhcmFtID0gL30gXFwuL2cuZXhlYyhjb250ZW50KSB8fCAvLiogfS9nLmV4ZWMoY29udGVudCk7XG4gICAgICAgIGNvbnN0IHNlY29uZFBhcmFtID0gLzsgLiovZy5leGVjKGNvbnRlbnQpIHx8IC86IC4qL2cuZXhlYyhjb250ZW50KTtcblxuICAgICAgICAvLyBUT0RPOiBJbXByb3ZlLi4uXG5cbiAgICAgICAgaWYgKGZpcnN0UGFyYW0gfHwgc2Vjb25kUGFyYW0pIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcih2YWwpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRXZlcnl0aGluZyBtdXN0J3ZlIHdlbnQgZmluZVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9KSk7XG5cbiAgICAvLyBSdW4gaXQgYWxsXG4gICAgUHJvbWlzZS5hbGwocHJvbWlzZXMpLnRoZW4oZGF0YSA9PiB7XG4gICAgICAgIGNvbnN0IGRhdGFSZXN1bHRzID0gZGF0YS5maWx0ZXIodmFsID0+IHZhbCAhPT0gdHJ1ZSk7XG5cbiAgICAgICAgaWYgKGRhdGFSZXN1bHRzLmxlbmd0aCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGRhdGFSZXN1bHRzWzBdKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgfSkuY2F0Y2gocmVqZWN0KTtcbn0pO1xuXG4vKipcbiAqIENoZWNrIGlmIGFsbCBqcyBpcyBtaW5pZmllZFxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSByZXFcbiAqIEByZXR1cm5zIHByb21pc2VcbiAqL1xuY29uc3QgaXNKc01pbmlmaWVkID0gKHJlcSkgPT4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IHNjcmlwdFBhdHRlcm4gPSAvPHNjcmlwdC4qP3NyYz1bJ3xcIl0oLis/XFwuanMpWyd8XCJdLio/XFwvc2NyaXB0Pi9nO1xuICAgIGNvbnN0IG1hcmt1cCA9IHJlcS5kb21SZXEud2luZG93LmRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5pbm5lckhUTUw7XG4gICAgbGV0IGxpbmtzID0gbWFya3VwLm1hdGNoKHNjcmlwdFBhdHRlcm4pO1xuXG4gICAgLy8gTGV0cyBnZXQganVzdCB0aGUgYWN0dWFsIGxpbmtzXG4gICAgbGlua3MgPSBsaW5rcyAmJiBsaW5rcy5tYXAodmFsID0+IHtcbiAgICAgICAgdmFsID0gdmFsLm1hdGNoKC9zcmM9Wyd8XCJdKC4rKVsnfFwiXS9nKTtcbiAgICAgICAgdmFsID0gdmFsWzBdLnJlcGxhY2UoL3NyYz1bJ3xcIl0vZywgJycpLnJlcGxhY2UoL1snfFwiXS9nLCAnJyk7XG5cbiAgICAgICAgaWYgKCF2YWwubWF0Y2goLyhodHRwW158XFxzXSkvZykpIHtcbiAgICAgICAgICAgIC8vIFRPRE86IFRoaXMgd29uJ3Qgd29yayB3aXRob3V0IGEgcHJvdG9jb2wuLi4gV2UgY291bGQgYWN0dWFsbHkgY2hlY2sgdGhlIHJlcXVlc3RTcmNcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgJHt2YWx9IGlzblxcJ3QgYmVpbmcgdGVzdGVkIHdpdGggcnVsZSBcImlzSnNNaW5pZmllZFwiIGJlY2F1c2UgaXQgaGFzIG5vIGZ1bGwgcm91dGUgd2l0aCBwcm90b2NvbC4gRXZlbnR1YWxseSBJJ2xsIGdldCB0byB0aGlzIGlzc3VlLmApO1xuICAgICAgICB9IGVsc2UgaWYgKHZhbC5tYXRjaCgvXFwubWluXFwuL2cpKSB7XG4gICAgICAgICAgICAvLyBObyBuZWVkIHRvIGdvIGZ1cnRoZXIgaWYgdGhlIGZpbGUgYWN0dWFsbHkgc3RhdGVzIHNvXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdmFsO1xuICAgIH0pLmZpbHRlcih2YWwgPT4gISF2YWwpO1xuXG4gICAgaWYgKCFsaW5rcyB8fCAhbGlua3MubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiByZXNvbHZlKHRydWUpO1xuICAgIH1cblxuICAgIC8vIExldHMgcnVuIGFsbCBwcm9taXNlc1xuICAgIC8vIFdlIG5lZWQgdG8gcmVxdWVzdCBpdCBub3dcbiAgICBjb25zdCBwcm9taXNlcyA9IGxpbmtzLm1hcCh2YWwgPT4gZ2V0VXJsKHZhbCkudGhlbihjb250ZW50ID0+IHtcbiAgICAgICAgY29uc3QgZmlyc3RQYXJhbSA9IC99IFxcLi9nLmV4ZWMoY29udGVudCkgfHwgLy4qIH0vZy5leGVjKGNvbnRlbnQpO1xuICAgICAgICAvLyBUaGVzZSBkb24ndCB3b3JrIHdpdGggc29tZSBtaW5pZmllcnMgKGxpa2UgZm9yIGV4YW1wbGUganF1ZXJ5KVxuICAgICAgICAvLyBjb25zdCBzZWNvbmRQYXJhbSA9IC87IC4qL2cuZXhlYyhjb250ZW50KSB8fCAvOiAuKi9nLmV4ZWMoY29udGVudCk7XG5cbiAgICAgICAgLy8gVE9ETzogSW1wcm92ZS4uLlxuXG4gICAgICAgIGlmIChmaXJzdFBhcmFtKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IodmFsKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEV2ZXJ5dGhpbmcgbXVzdCd2ZSB3ZW50IGZpbmVcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSkpO1xuXG4gICAgLy8gUnVuIGl0IGFsbFxuICAgIFByb21pc2UuYWxsKHByb21pc2VzKS50aGVuKGRhdGEgPT4ge1xuICAgICAgICBjb25zdCBkYXRhUmVzdWx0cyA9IGRhdGEuZmlsdGVyKHZhbCA9PiB2YWwgIT09IHRydWUpO1xuXG4gICAgICAgIGlmIChkYXRhUmVzdWx0cy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihkYXRhUmVzdWx0c1swXSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgIH0pLmNhdGNoKHJlamVjdCk7XG59KTtcblxuLyoqXG4gKiBDaGVjayBpZiBoYXMgY3NzIHByZWZpeGVzXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IHJlcVxuICogQHJldHVybnMgcHJvbWlzZVxuICovXG5jb25zdCBoYXNDc3NQcmVmaXhlcyA9ICgpID0+IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgLy8gVE9ETzogLi4uXG4gICAgcmVzb2x2ZSgpO1xufSk7XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gRXhwb3J0XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgICBuYW1lOiAnYmVzdFByYWN0aWNlcycsXG4gICAgcnVsZXM6IFtcbiAgICAgICAgeyBuYW1lOiAnaGFzbnRMb2dzJywgZm46IGhhc250TG9ncyB9LFxuICAgICAgICB7IG5hbWU6ICdoYXNudFdhcm5zJywgZm46IGhhc250V2FybnMgfSxcbiAgICAgICAgeyBuYW1lOiAnaGFzbnRFcnJvcnMnLCBmbjogaGFzbnRFcnJvcnMgfSxcbiAgICAgICAgeyBuYW1lOiAnaGFzQ3NzVmVyc2lvbicsIGZuOiBoYXNDc3NWZXJzaW9uIH0sXG4gICAgICAgIHsgbmFtZTogJ2hhc0pzVmVyc2lvbicsIGZuOiBoYXNKc1ZlcnNpb24gfSxcbiAgICAgICAgeyBuYW1lOiAnaXNDc3NNaW5pZmllZCcsIGZuOiBpc0Nzc01pbmlmaWVkIH0sXG4gICAgICAgIHsgbmFtZTogJ2lzSnNNaW5pZmllZCcsIGZuOiBpc0pzTWluaWZpZWQgfSxcbiAgICAgICAgeyBuYW1lOiAnaGFzQ3NzUHJlZml4ZXMnLCBmbjogaGFzQ3NzUHJlZml4ZXMgfVxuICAgIF1cbn07XG4iXX0=