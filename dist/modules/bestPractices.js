'use strict';
/* global Promise */

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _mrcrowley = require('mrcrowley');

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
        var safeIgnore = ['jquery', 'cdn', 'bootstrap'];
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
        var safeIgnore = ['jquery', 'cdn', 'bootstrap'];
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
                /* eslint-disable no-console */
                console.warn(val + ' isn\'t being tested with rule "isCssMinified" because it has no full route with protocol. Eventually I\'ll get to this issue.');
                /* eslint-enable no-console */
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
            return (0, _mrcrowley.getUrl)(val).then(function (content) {
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
                /* eslint-disable no-console */
                console.warn(val + ' isn\'t being tested with rule "isJsMinified" because it has no full route with protocol. Eventually I\'ll get to this issue.');
                /* eslint-enable no-console */
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
            return (0, _mrcrowley.getUrl)(val).then(function (content) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2R1bGVzL2Jlc3RQcmFjdGljZXMuanMiXSwibmFtZXMiOlsiaGFzbnRMb2dzIiwicmVxIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJkb21SZXEiLCJsb2dzIiwibGVuZ3RoIiwiaGFzbnRXYXJucyIsIndhcm5zIiwiaGFzbnRFcnJvcnMiLCJlcnJvcnMiLCJoYXNKc1ZlcnNpb24iLCJsaW5rcyIsIndpbmRvdyIsIiQiLCJzYWZlSWdub3JlIiwicmVqZWN0ZWQiLCJlYWNoIiwiaSIsInZhbCIsImhyZWYiLCJnZXRBdHRyaWJ1dGUiLCJpZ25vcmVkIiwibWFwIiwiUmVnRXhwIiwiaWduIiwiZXhlYyIsImZpbHRlciIsImJhc2VuYW1lIiwiZmlyc3RWZXJzaW9uIiwic2Vjb25kVmVyc2lvbiIsInRoaXJkVmVyc2lvbiIsImhhc0Nzc1ZlcnNpb24iLCJpc0Nzc01pbmlmaWVkIiwiY3NzUGF0dGVybiIsIm1hcmt1cCIsImRvY3VtZW50IiwiZG9jdW1lbnRFbGVtZW50IiwiaW5uZXJIVE1MIiwibWF0Y2giLCJyZXBsYWNlIiwiY29uc29sZSIsIndhcm4iLCJwcm9taXNlcyIsInRoZW4iLCJmaXJzdFBhcmFtIiwiY29udGVudCIsInNlY29uZFBhcmFtIiwiRXJyb3IiLCJhbGwiLCJkYXRhUmVzdWx0cyIsImRhdGEiLCJjYXRjaCIsImlzSnNNaW5pZmllZCIsInNjcmlwdFBhdHRlcm4iLCJoYXNDc3NQcmVmaXhlcyIsIm5hbWUiLCJydWxlcyIsImZuIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBOzs7Ozs7QUFFQTs7OztBQUNBOzs7O0FBRUE7QUFDQTs7QUFFQTs7Ozs7O0FBTUEsSUFBTUEsWUFBWSxTQUFaQSxTQUFZLENBQUNDLEdBQUQ7QUFBQSxXQUFTLElBQUlDLE9BQUosQ0FBWSxVQUFDQyxPQUFELEVBQVVDLE1BQVYsRUFBcUI7QUFDeERILFlBQUlJLE1BQUosQ0FBV0MsSUFBWCxDQUFnQkMsTUFBaEIsR0FBeUJILE9BQU9ILElB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LE1BQUwsQ0FBWTtBQUFBLHVCQUFPUixRQUFRLElBQWY7QUFBQSxhQUFaLENBQXBCOztBQUVBLGdCQUFJK0IsWUFBWTVDLE1BQWhCLEVBQXdCO0FBQ3BCLHNCQUFNLElBQUkwQyxLQUFKLENBQVVFLFlBQVksQ0FBWixDQUFWLENBQU47QUFDSDs7QUFFRGhELG9CQUFRLElBQVI7QUFDSCxTQVJELEVBUUdrRCxLQVJILENBUVNqRCxNQVJUO0FBU0gsS0F0RDZCLENBQVQ7QUFBQSxDQUFyQjs7QUF3REE7Ozs7OztBQU1BLElBQU1vRCxpQkFBaUIsU0FBakJBLGNBQWlCO0FBQUEsV0FBTSxJQUFJdEQsT0FBSixDQUFZLFVBQUNDLE9BQUQsRUFBYTtBQUNsRDtBQUNBQTtBQUNILEtBSDRCLENBQU47QUFBQSxDQUF2Qjs7QUFLQTtBQUNBOztrQkFFZTtBQUNYc0QsVUFBTSxlQURLO0FBRVhDLFdBQU8sQ0FDSCxFQUFFRCxNQUFNLFdBQVIsRUFBcUJFLElBQUkzRCxTQUF6QixFQURHLEVBRUgsRUFBRXlELE1BQU0sWUFBUixFQUFzQkUsSUFBSW5ELFVBQTFCLEVBRkcsRUFHSCxFQUFFaUQsTUFBTSxhQUFSLEVBQXVCRSxJQUFJakQsV0FBM0IsRUFIRyxFQUlILEVBQUUrQyxNQUFNLGVBQVIsRUFBeUJFLElBQUkxQixhQUE3QixFQUpHLEVBS0gsRUFBRXdCLE1BQU0sY0FBUixFQUF3QkUsSUFBSS9DLFlBQTVCLEVBTEcsRUFNSCxFQUFFNkMsTUFBTSxlQUFSLEVBQXlCRSxJQUFJekIsYUFBN0IsRUFORyxFQU9ILEVBQUV1QixNQUFNLGNBQVIsRUFBd0JFLElBQUlMLFlBQTVCLEVBUEcsRUFRSCxFQUFFRyxNQUFNLGdCQUFSLEVBQTBCRSxJQUFJSCxjQUE5QixFQVJHO0FBRkksQyIsImZpbGUiOiJiZXN0UHJhY3RpY2VzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuLyogZ2xvYmFsIFByb21pc2UgKi9cblxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBnZXRVcmwgfSBmcm9tICdtcmNyb3dsZXknO1xuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEZ1bmN0aW9uc1xuXG4vKipcbiAqIENoZWNrcyBpZiB0aGVyZSB3ZXJlIGxvZ3MgaW4gdGhlIGNvbnNvbGVcbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gcmVxXG4gKiBAcmV0dXJucyBwcm9taXNlXG4gKi9cbmNvbnN0IGhhc250TG9ncyA9IChyZXEpID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICByZXEuZG9tUmVxLmxvZ3MubGVuZ3RoID8gcmVqZWN0KHJlcS5kb21SZXEubG9ncykgOiByZXNvbHZlKHRydWUpO1xufSk7XG5cbi8qKlxuICogQ2hlY2tzIGlmIHRoZXJlIHdlcmUgd2FybmluZ3MgaW4gdGhlIGNvbnNvbGVcbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gcmVxXG4gKiBAcmV0dXJucyBwcm9taXNlXG4gKi9cbmNvbnN0IGhhc250V2FybnMgPSAocmVxKSA9PiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgcmVxLmRvbVJlcS53YXJucy5sZW5ndGggPyByZWplY3QocmVxLmRvbVJlcS53YXJucykgOiByZXNvbHZlKHRydWUpO1xufSk7XG5cbi8qKlxuICogQ2hlY2tzIGlmIHRoZXJlIHdlcmUgZXJyb3JzXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IHJlcVxuICogQHJldHVybnMgcHJvbWlzZVxuICovXG5jb25zdCBoYXNudEVycm9ycyA9IChyZXEpID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICByZXEuZG9tUmVxLmVycm9ycy5sZW5ndGggPyByZWplY3QocmVxLmRvbVJlcS5lcnJvcnMpIDogcmVzb2x2ZSh0cnVlKTtcbn0pO1xuXG4vKipcbiAqIENoZWNrcyBpZiBqcyBpcyB2ZXJzaW9uZWRcbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gcmVxXG4gKiBAcmV0dXJucyBwcm9taXNlXG4gKi9cbmNvbnN0IGhhc0pzVmVyc2lvbiA9IChyZXEpID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBjb25zdCBsaW5rcyA9IHJlcS5kb21SZXEud2luZG93LiQoJ3NjcmlwdCcpO1xuICAgIGNvbnN0IHNhZmVJZ25vcmUgPSBbJ2pxdWVyeScsICdjZG4nLCAnYm9vdHN0cmFwJ107XG4gICAgbGV0IHJlamVjdGVkID0gZmFsc2U7XG5cbiAgICAvLyBMZXRzIHNlZSBpZiBvbmUgb2YgdGhlc2UgZG9lc24ndCBoYXZlIHZlcnNpb25pbmdcbiAgICBsaW5rcy5lYWNoKChpLCB2YWwpID0+IHtcbiAgICAgICAgaWYgKHJlamVjdGVkKSB7IHJldHVybjsgfVxuXG4gICAgICAgIGxldCBocmVmID0gdmFsLmdldEF0dHJpYnV0ZSgnc3JjJyk7XG5cbiAgICAgICAgLy8gSnVzdCBpZ25vcmVcbiAgICAgICAgaWYgKHR5cGVvZiBocmVmICE9PSAnc3RyaW5nJyB8fCBocmVmID09PSAnJykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTGV0cyBpZ25vcmUgY29tbW9uIHRoaW5ncyB3ZSBkb24ndCB3YW50IHRvIHZlcnNpb24gb3V0XG4gICAgICAgIGNvbnN0IGlnbm9yZWQgPSBzYWZlSWdub3JlLm1hcChpZ24gPT4gKG5ldyBSZWdFeHAoaWduLCAnZycpKS5leGVjKGhyZWYpKS5maWx0ZXIoaWduID0+ICEhaWduKVswXTtcbiAgICAgICAgaWYgKGlnbm9yZWQpIHsgcmV0dXJuOyB9XG5cbiAgICAgICAgaHJlZiA9IHBhdGguYmFzZW5hbWUoaHJlZik7XG4gICAgICAgIGNvbnN0IGZpcnN0VmVyc2lvbiA9IC8uK1xcLiguKylcXC5qcy9nLmV4ZWMoaHJlZik7XG4gICAgICAgIGNvbnN0IHNlY29uZFZlcnNpb24gPSAvLitcXC5qc1xcPy4rL2cuZXhlYyhocmVmKTtcbiAgICAgICAgY29uc3QgdGhpcmRWZXJzaW9uID0gaHJlZi5sZW5ndGggPiAyMDtcblxuICAgICAgICByZWplY3RlZCA9IHJlamVjdGVkIHx8ICFmaXJzdFZlcnNpb24gJiYgIXNlY29uZFZlcnNpb24gJiYgIXRoaXJkVmVyc2lvbiAmJiBocmVmO1xuICAgIH0pO1xuXG4gICAgLy8gRXZlcnl0aGluZyBtdXN0J3ZlIHdlbnQgZmluZVxuICAgICFyZWplY3RlZCA/IHJlc29sdmUodHJ1ZSkgOiByZWplY3QocmVqZWN0ZWQpO1xufSk7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGNzcyBpcyB2ZXJzaW9uZWRcbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gcmVxXG4gKiBAcmV0dXJucyBwcm9taXNlXG4gKi9cbmNvbnN0IGhhc0Nzc1ZlcnNpb24gPSAocmVxKSA9PiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc3QgbGlua3MgPSByZXEuZG9tUmVxLndpbmRvdy4kKCdsaW5rW3JlbD1cInN0eWxlc2hlZXRcIl0nKTtcbiAgICBjb25zdCBzYWZlSWdub3JlID0gWydqcXVlcnknLCAnY2RuJywgJ2Jvb3RzdHJhcCddO1xuICAgIGxldCByZWplY3RlZCA9IGZhbHNlO1xuXG4gICAgLy8gTGV0cyBzZWUgaWYgb25lIG9mIHRoZXNlIGRvZXNuJ3QgaGF2ZSB2ZXJzaW9uaW5nXG4gICAgbGlua3MuZWFjaCgoaSwgdmFsKSA9PiB7XG4gICAgICAgIGlmIChyZWplY3RlZCkgeyByZXR1cm47IH1cblxuICAgICAgICBsZXQgaHJlZiA9IHZhbC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKTtcblxuICAgICAgICAvLyBKdXN0IGlnbm9yZVxuICAgICAgICBpZiAodHlwZW9mIGhyZWYgIT09ICdzdHJpbmcnIHx8IGhyZWYgPT09ICcnKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBMZXRzIGlnbm9yZSBjb21tb24gdGhpbmdzIHdlIGRvbid0IHdhbnQgdG8gdmVyc2lvbiBvdXRcbiAgICAgICAgY29uc3QgaWdub3JlZCA9IHNhZmVJZ25vcmUubWFwKGlnbiA9PiAobmV3IFJlZ0V4cChpZ24sICdnJykpLmV4ZWMoaHJlZikpLmZpbHRlcihpZ24gPT4gISFpZ24pWzBdO1xuICAgICAgICBpZiAoaWdub3JlZCkgeyByZXR1cm47IH1cblxuICAgICAgICBocmVmID0gcGF0aC5iYXNlbmFtZShocmVmKTtcbiAgICAgICAgY29uc3QgZmlyc3RWZXJzaW9uID0gLy4rXFwuKC4rKVxcLmNzcy9nLmV4ZWMoaHJlZik7XG4gICAgICAgIGNvbnN0IHNlY29uZFZlcnNpb24gPSAvLitcXC5jc3NcXD8uKy9nLmV4ZWMoaHJlZik7XG4gICAgICAgIGNvbnN0IHRoaXJkVmVyc2lvbiA9IGhyZWYubGVuZ3RoID4gMjA7XG5cbiAgICAgICAgcmVqZWN0ZWQgPSByZWplY3RlZCB8fCAhZmlyc3RWZXJzaW9uICYmICFzZWNvbmRWZXJzaW9uICYmICF0aGlyZFZlcnNpb24gJiYgaHJlZjtcbiAgICB9KTtcblxuICAgIC8vIEV2ZXJ5dGhpbmcgbXVzdCd2ZSB3ZW50IGZpbmVcbiAgICAhcmVqZWN0ZWQgPyByZXNvbHZlKHRydWUpIDogcmVqZWN0KHJlamVjdGVkKTtcbn0pO1xuXG4vKipcbiAqIENoZWNrIGlmIGFsbCBjc3MgaXMgbWluaWZpZWRcbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gcmVxXG4gKiBAcmV0dXJucyBwcm9taXNlXG4gKi9cbmNvbnN0IGlzQ3NzTWluaWZpZWQgPSAocmVxKSA9PiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc3QgY3NzUGF0dGVybiA9IC88bGluay4qP3N0eWxlc2hlZXQuKj89Wyd8XCJdKC4rP1xcLmNzcylbJ3xcIl0uKj8+L2c7XG4gICAgY29uc3QgbWFya3VwID0gcmVxLmRvbVJlcS53aW5kb3cuZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmlubmVySFRNTDtcbiAgICBsZXQgbGlua3MgPSBtYXJrdXAubWF0Y2goY3NzUGF0dGVybik7XG5cbiAgICAvLyBMZXRzIGdldCBqdXN0IHRoZSBhY3R1YWwgbGlua3NcbiAgICBsaW5rcyA9IGxpbmtzICYmIGxpbmtzLm1hcCh2YWwgPT4ge1xuICAgICAgICB2YWwgPSB2YWwubWF0Y2goL2hyZWY9Wyd8XCJdKC4rKVsnfFwiXS9nKTtcbiAgICAgICAgdmFsID0gdmFsWzBdLnJlcGxhY2UoL2hyZWY9Wyd8XCJdL2csICcnKS5yZXBsYWNlKC9bJ3xcIl0vZywgJycpO1xuXG4gICAgICAgIGlmICghdmFsLm1hdGNoKC8oaHR0cFtefFxcc10pL2cpKSB7XG4gICAgICAgICAgICAvLyBUT0RPOiBUaGlzIHdvbid0IHdvcmsgd2l0aG91dCBhIHByb3RvY29sLi4uIFdlIGNvdWxkIGFjdHVhbGx5IGNoZWNrIHRoZSByZXF1ZXN0U3JjXG4gICAgICAgICAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby1jb25zb2xlICovXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYCR7dmFsfSBpc25cXCd0IGJlaW5nIHRlc3RlZCB3aXRoIHJ1bGUgXCJpc0Nzc01pbmlmaWVkXCIgYmVjYXVzZSBpdCBoYXMgbm8gZnVsbCByb3V0ZSB3aXRoIHByb3RvY29sLiBFdmVudHVhbGx5IEknbGwgZ2V0IHRvIHRoaXMgaXNzdWUuYCk7XG4gICAgICAgICAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLWNvbnNvbGUgKi9cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSBlbHNlIGlmICh2YWwubWF0Y2goL1xcLm1pblxcLi9nKSkge1xuICAgICAgICAgICAgLy8gTm8gbmVlZCB0byBnbyBmdXJ0aGVyIGlmIHRoZSBmaWxlIGFjdHVhbGx5IHN0YXRlcyBzb1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHZhbDtcbiAgICB9KS5maWx0ZXIodmFsID0+ICEhdmFsKTtcblxuICAgIGlmICghbGlua3MgfHwgIWxpbmtzLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gcmVzb2x2ZSh0cnVlKTtcbiAgICB9XG5cbiAgICAvLyBMZXRzIHJ1biBhbGwgcHJvbWlzZXNcbiAgICAvLyBXZSBuZWVkIHRvIHJlcXVlc3QgaXQgbm93XG4gICAgY29uc3QgcHJvbWlzZXMgPSBsaW5rcy5tYXAodmFsID0+IGdldFVybCh2YWwpLnRoZW4oY29udGVudCA9PiB7XG4gICAgICAgIGNvbnN0IGZpcnN0UGFyYW0gPSAvfSBcXC4vZy5leGVjKGNvbnRlbnQpIHx8IC8uKiB9L2cuZXhlYyhjb250ZW50KTtcbiAgICAgICAgY29uc3Qgc2Vjb25kUGFyYW0gPSAvOyAuKi9nLmV4ZWMoY29udGVudCkgfHwgLzogLiovZy5leGVjKGNvbnRlbnQpO1xuXG4gICAgICAgIC8vIFRPRE86IEltcHJvdmUuLi5cblxuICAgICAgICBpZiAoZmlyc3RQYXJhbSB8fCBzZWNvbmRQYXJhbSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHZhbCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBFdmVyeXRoaW5nIG11c3QndmUgd2VudCBmaW5lXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0pKTtcblxuICAgIC8vIFJ1biBpdCBhbGxcbiAgICBQcm9taXNlLmFsbChwcm9taXNlcykudGhlbihkYXRhID0+IHtcbiAgICAgICAgY29uc3QgZGF0YVJlc3VsdHMgPSBkYXRhLmZpbHRlcih2YWwgPT4gdmFsICE9PSB0cnVlKTtcblxuICAgICAgICBpZiAoZGF0YVJlc3VsdHMubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZGF0YVJlc3VsdHNbMF0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICB9KS5jYXRjaChyZWplY3QpO1xufSk7XG5cbi8qKlxuICogQ2hlY2sgaWYgYWxsIGpzIGlzIG1pbmlmaWVkXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IHJlcVxuICogQHJldHVybnMgcHJvbWlzZVxuICovXG5jb25zdCBpc0pzTWluaWZpZWQgPSAocmVxKSA9PiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc3Qgc2NyaXB0UGF0dGVybiA9IC88c2NyaXB0Lio/c3JjPVsnfFwiXSguKz9cXC5qcylbJ3xcIl0uKj9cXC9zY3JpcHQ+L2c7XG4gICAgY29uc3QgbWFya3VwID0gcmVxLmRvbVJlcS53aW5kb3cuZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmlubmVySFRNTDtcbiAgICBsZXQgbGlua3MgPSBtYXJrdXAubWF0Y2goc2NyaXB0UGF0dGVybik7XG5cbiAgICAvLyBMZXRzIGdldCBqdXN0IHRoZSBhY3R1YWwgbGlua3NcbiAgICBsaW5rcyA9IGxpbmtzICYmIGxpbmtzLm1hcCh2YWwgPT4ge1xuICAgICAgICB2YWwgPSB2YWwubWF0Y2goL3NyYz1bJ3xcIl0oLispWyd8XCJdL2cpO1xuICAgICAgICB2YWwgPSB2YWxbMF0ucmVwbGFjZSgvc3JjPVsnfFwiXS9nLCAnJykucmVwbGFjZSgvWyd8XCJdL2csICcnKTtcblxuICAgICAgICBpZiAoIXZhbC5tYXRjaCgvKGh0dHBbXnxcXHNdKS9nKSkge1xuICAgICAgICAgICAgLy8gVE9ETzogVGhpcyB3b24ndCB3b3JrIHdpdGhvdXQgYSBwcm90b2NvbC4uLiBXZSBjb3VsZCBhY3R1YWxseSBjaGVjayB0aGUgcmVxdWVzdFNyY1xuICAgICAgICAgICAgLyogZXNsaW50LWRpc2FibGUgbm8tY29uc29sZSAqL1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGAke3ZhbH0gaXNuXFwndCBiZWluZyB0ZXN0ZWQgd2l0aCBydWxlIFwiaXNKc01pbmlmaWVkXCIgYmVjYXVzZSBpdCBoYXMgbm8gZnVsbCByb3V0ZSB3aXRoIHByb3RvY29sLiBFdmVudHVhbGx5IEknbGwgZ2V0IHRvIHRoaXMgaXNzdWUuYCk7XG4gICAgICAgICAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLWNvbnNvbGUgKi9cbiAgICAgICAgfSBlbHNlIGlmICh2YWwubWF0Y2goL1xcLm1pblxcLi9nKSkge1xuICAgICAgICAgICAgLy8gTm8gbmVlZCB0byBnbyBmdXJ0aGVyIGlmIHRoZSBmaWxlIGFjdHVhbGx5IHN0YXRlcyBzb1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHZhbDtcbiAgICB9KS5maWx0ZXIodmFsID0+ICEhdmFsKTtcblxuICAgIGlmICghbGlua3MgfHwgIWxpbmtzLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gcmVzb2x2ZSh0cnVlKTtcbiAgICB9XG5cbiAgICAvLyBMZXRzIHJ1biBhbGwgcHJvbWlzZXNcbiAgICAvLyBXZSBuZWVkIHRvIHJlcXVlc3QgaXQgbm93XG4gICAgY29uc3QgcHJvbWlzZXMgPSBsaW5rcy5tYXAodmFsID0+IGdldFVybCh2YWwpLnRoZW4oY29udGVudCA9PiB7XG4gICAgICAgIGNvbnN0IGZpcnN0UGFyYW0gPSAvfSBcXC4vZy5leGVjKGNvbnRlbnQpIHx8IC8uKiB9L2cuZXhlYyhjb250ZW50KTtcbiAgICAgICAgLy8gVGhlc2UgZG9uJ3Qgd29yayB3aXRoIHNvbWUgbWluaWZpZXJzIChsaWtlIGZvciBleGFtcGxlIGpxdWVyeSlcbiAgICAgICAgLy8gY29uc3Qgc2Vjb25kUGFyYW0gPSAvOyAuKi9nLmV4ZWMoY29udGVudCkgfHwgLzogLiovZy5leGVjKGNvbnRlbnQpO1xuXG4gICAgICAgIC8vIFRPRE86IEltcHJvdmUuLi5cblxuICAgICAgICBpZiAoZmlyc3RQYXJhbSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHZhbCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBFdmVyeXRoaW5nIG11c3QndmUgd2VudCBmaW5lXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0pKTtcblxuICAgIC8vIFJ1biBpdCBhbGxcbiAgICBQcm9taXNlLmFsbChwcm9taXNlcykudGhlbihkYXRhID0+IHtcbiAgICAgICAgY29uc3QgZGF0YVJlc3VsdHMgPSBkYXRhLmZpbHRlcih2YWwgPT4gdmFsICE9PSB0cnVlKTtcblxuICAgICAgICBpZiAoZGF0YVJlc3VsdHMubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZGF0YVJlc3VsdHNbMF0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICB9KS5jYXRjaChyZWplY3QpO1xufSk7XG5cbi8qKlxuICogQ2hlY2sgaWYgaGFzIGNzcyBwcmVmaXhlc1xuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSByZXFcbiAqIEByZXR1cm5zIHByb21pc2VcbiAqL1xuY29uc3QgaGFzQ3NzUHJlZml4ZXMgPSAoKSA9PiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgIC8vIFRPRE86IC4uLlxuICAgIHJlc29sdmUoKTtcbn0pO1xuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEV4cG9ydFxuXG5leHBvcnQgZGVmYXVsdCB7XG4gICAgbmFtZTogJ2Jlc3RQcmFjdGljZXMnLFxuICAgIHJ1bGVzOiBbXG4gICAgICAgIHsgbmFtZTogJ2hhc250TG9ncycsIGZuOiBoYXNudExvZ3MgfSxcbiAgICAgICAgeyBuYW1lOiAnaGFzbnRXYXJucycsIGZuOiBoYXNudFdhcm5zIH0sXG4gICAgICAgIHsgbmFtZTogJ2hhc250RXJyb3JzJywgZm46IGhhc250RXJyb3JzIH0sXG4gICAgICAgIHsgbmFtZTogJ2hhc0Nzc1ZlcnNpb24nLCBmbjogaGFzQ3NzVmVyc2lvbiB9LFxuICAgICAgICB7IG5hbWU6ICdoYXNKc1ZlcnNpb24nLCBmbjogaGFzSnNWZXJzaW9uIH0sXG4gICAgICAgIHsgbmFtZTogJ2lzQ3NzTWluaWZpZWQnLCBmbjogaXNDc3NNaW5pZmllZCB9LFxuICAgICAgICB7IG5hbWU6ICdpc0pzTWluaWZpZWQnLCBmbjogaXNKc01pbmlmaWVkIH0sXG4gICAgICAgIHsgbmFtZTogJ2hhc0Nzc1ByZWZpeGVzJywgZm46IGhhc0Nzc1ByZWZpeGVzIH1cbiAgICBdXG59O1xuIl19