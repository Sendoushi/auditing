'use strict';
/* global Promise */

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

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

//-------------------------------------
// Export

exports.default = {
    name: 'bestPractices',
    rules: [{ name: 'hasntLogs', fn: hasntLogs }, { name: 'hasntWarns', fn: hasntWarns }, { name: 'hasntErrors', fn: hasntErrors }, { name: 'hasCssVersion', fn: hasCssVersion }, { name: 'hasJsVersion', fn: hasJsVersion }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2R1bGVzL2Jlc3RQcmFjdGljZXMuanMiXSwibmFtZXMiOlsiaGFzbnRMb2dzIiwicmVxIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJkb21SZXEiLCJsb2dzIiwibGVuZ3RoIiwiaGFzbnRXYXJucyIsIndhcm5zIiwiaGFzbnRFcnJvcnMiLCJlcnJvcnMiLCJoYXNKc1ZlcnNpb24iLCJsaW5rcyIsIndpbmRvdyIsIiQiLCJzYWZlSWdub3JlIiwicmVqZWN0ZWQiLCJlYWNoIiwiaSIsInZhbCIsImhyZWYiLCJnZXRBdHRyaWJ1dGUiLCJpZ25vcmVkIiwibWFwIiwiUmVnRXhwIiwiaWduIiwiZXhlYyIsImZpbHRlciIsImJhc2VuYW1lIiwiZmlyc3RWZXJzaW9uIiwic2Vjb25kVmVyc2lvbiIsInRoaXJkVmVyc2lvbiIsImhhc0Nzc1ZlcnNpb24iLCJuYW1lIiwicnVsZXMiLCJmbiJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTs7Ozs7O0FBRUE7Ozs7OztBQUVBO0FBQ0E7O0FBRUE7Ozs7OztBQU1BLElBQU1BLFlBQVksU0FBWkEsU0FBWSxDQUFDQyxHQUFEO0FBQUEsV0FBUyxJQUFJQyxPQUFKLENBQVksVUFBQ0MsT0FBRCxFQUFVQyxNQUFWLEVBQXFCO0FBQ3hESCxZQUFJSSxNQUFKLENBQVdDLElBQVgsQ0FBZ0JDLE1BQWhCLEdBQXlCSCxPQUFPSCxJQUFJSSxNQUFKLENBQVdDLElBQWxCLENBQXpCLEdBQW1ESCxRQUFRLElBQVIsQ0FBbkQ7QUFDSCxLQUYwQixDQUFUO0FBQUEsQ0FBbEI7O0FBSUE7Ozs7OztBQU1BLElBQU1LLGFBQWEsU0FBYkEsVUFBYSxDQUFDUCxHQUFEO0FBQUEsV0FBUyxJQUFJQyxPQUFKLENBQVksVUFBQ0MsT0FBRCxFQUFVQyxNQUFWLEVBQXFCO0FBQ3pESCxZQUFJSSxNQUFKLENBQVdJLEtBQVgsQ0FBaUJGLE1BQWpCLEdBQTBCSCxPQUFPSCxJQUFJSSxNQUFKLENBQVdJLEtBQWxCLENBQTFCLEdB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Y2VzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuLyogZ2xvYmFsIFByb21pc2UgKi9cblxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gRnVuY3Rpb25zXG5cbi8qKlxuICogQ2hlY2tzIGlmIHRoZXJlIHdlcmUgbG9ncyBpbiB0aGUgY29uc29sZVxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSByZXFcbiAqIEByZXR1cm5zIHByb21pc2VcbiAqL1xuY29uc3QgaGFzbnRMb2dzID0gKHJlcSkgPT4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIHJlcS5kb21SZXEubG9ncy5sZW5ndGggPyByZWplY3QocmVxLmRvbVJlcS5sb2dzKSA6IHJlc29sdmUodHJ1ZSk7XG59KTtcblxuLyoqXG4gKiBDaGVja3MgaWYgdGhlcmUgd2VyZSB3YXJuaW5ncyBpbiB0aGUgY29uc29sZVxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSByZXFcbiAqIEByZXR1cm5zIHByb21pc2VcbiAqL1xuY29uc3QgaGFzbnRXYXJucyA9IChyZXEpID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICByZXEuZG9tUmVxLndhcm5zLmxlbmd0aCA/IHJlamVjdChyZXEuZG9tUmVxLndhcm5zKSA6IHJlc29sdmUodHJ1ZSk7XG59KTtcblxuLyoqXG4gKiBDaGVja3MgaWYgdGhlcmUgd2VyZSBlcnJvcnNcbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gcmVxXG4gKiBAcmV0dXJucyBwcm9taXNlXG4gKi9cbmNvbnN0IGhhc250RXJyb3JzID0gKHJlcSkgPT4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIHJlcS5kb21SZXEuZXJyb3JzLmxlbmd0aCA/IHJlamVjdChyZXEuZG9tUmVxLmVycm9ycykgOiByZXNvbHZlKHRydWUpO1xufSk7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGpzIGlzIHZlcnNpb25lZFxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSByZXFcbiAqIEByZXR1cm5zIHByb21pc2VcbiAqL1xuY29uc3QgaGFzSnNWZXJzaW9uID0gKHJlcSkgPT4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IGxpbmtzID0gcmVxLmRvbVJlcS53aW5kb3cuJCgnc2NyaXB0Jyk7XG4gICAgY29uc3Qgc2FmZUlnbm9yZSA9IFsnanF1ZXJ5JywgJ2NkbiddO1xuICAgIGxldCByZWplY3RlZCA9IGZhbHNlO1xuXG4gICAgLy8gTGV0cyBzZWUgaWYgb25lIG9mIHRoZXNlIGRvZXNuJ3QgaGF2ZSB2ZXJzaW9uaW5nXG4gICAgbGlua3MuZWFjaCgoaSwgdmFsKSA9PiB7XG4gICAgICAgIGlmIChyZWplY3RlZCkgeyByZXR1cm47IH1cblxuICAgICAgICBsZXQgaHJlZiA9IHZhbC5nZXRBdHRyaWJ1dGUoJ3NyYycpO1xuXG4gICAgICAgIC8vIEp1c3QgaWdub3JlXG4gICAgICAgIGlmICh0eXBlb2YgaHJlZiAhPT0gJ3N0cmluZycgfHwgaHJlZiA9PT0gJycpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIExldHMgaWdub3JlIGNvbW1vbiB0aGluZ3Mgd2UgZG9uJ3Qgd2FudCB0byB2ZXJzaW9uIG91dFxuICAgICAgICBjb25zdCBpZ25vcmVkID0gc2FmZUlnbm9yZS5tYXAoaWduID0+IChuZXcgUmVnRXhwKGlnbiwgJ2cnKSkuZXhlYyhocmVmKSkuZmlsdGVyKGlnbiA9PiAhIWlnbilbMF07XG4gICAgICAgIGlmIChpZ25vcmVkKSB7IHJldHVybjsgfVxuXG4gICAgICAgIGhyZWYgPSBwYXRoLmJhc2VuYW1lKGhyZWYpO1xuICAgICAgICBjb25zdCBmaXJzdFZlcnNpb24gPSAvLitcXC4oLispXFwuanMvZy5leGVjKGhyZWYpO1xuICAgICAgICBjb25zdCBzZWNvbmRWZXJzaW9uID0gLy4rXFwuanNcXD8uKy9nLmV4ZWMoaHJlZik7XG4gICAgICAgIGNvbnN0IHRoaXJkVmVyc2lvbiA9IGhyZWYubGVuZ3RoID4gMjA7XG5cbiAgICAgICAgcmVqZWN0ZWQgPSByZWplY3RlZCB8fCAhZmlyc3RWZXJzaW9uICYmICFzZWNvbmRWZXJzaW9uICYmICF0aGlyZFZlcnNpb24gJiYgaHJlZjtcbiAgICB9KTtcblxuICAgIC8vIEV2ZXJ5dGhpbmcgbXVzdCd2ZSB3ZW50IGZpbmVcbiAgICAhcmVqZWN0ZWQgPyByZXNvbHZlKHRydWUpIDogcmVqZWN0KHJlamVjdGVkKTtcbn0pO1xuXG4vKipcbiAqIENoZWNrcyBpZiBjc3MgaXMgdmVyc2lvbmVkXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IHJlcVxuICogQHJldHVybnMgcHJvbWlzZVxuICovXG5jb25zdCBoYXNDc3NWZXJzaW9uID0gKHJlcSkgPT4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IGxpbmtzID0gcmVxLmRvbVJlcS53aW5kb3cuJCgnbGlua1tyZWw9XCJzdHlsZXNoZWV0XCJdJyk7XG4gICAgY29uc3Qgc2FmZUlnbm9yZSA9IFsnanF1ZXJ5JywgJ2NkbiddO1xuICAgIGxldCByZWplY3RlZCA9IGZhbHNlO1xuXG4gICAgLy8gTGV0cyBzZWUgaWYgb25lIG9mIHRoZXNlIGRvZXNuJ3QgaGF2ZSB2ZXJzaW9uaW5nXG4gICAgbGlua3MuZWFjaCgoaSwgdmFsKSA9PiB7XG4gICAgICAgIGlmIChyZWplY3RlZCkgeyByZXR1cm47IH1cblxuICAgICAgICBsZXQgaHJlZiA9IHZhbC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKTtcblxuICAgICAgICAvLyBKdXN0IGlnbm9yZVxuICAgICAgICBpZiAodHlwZW9mIGhyZWYgIT09ICdzdHJpbmcnIHx8IGhyZWYgPT09ICcnKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBMZXRzIGlnbm9yZSBjb21tb24gdGhpbmdzIHdlIGRvbid0IHdhbnQgdG8gdmVyc2lvbiBvdXRcbiAgICAgICAgY29uc3QgaWdub3JlZCA9IHNhZmVJZ25vcmUubWFwKGlnbiA9PiAobmV3IFJlZ0V4cChpZ24sICdnJykpLmV4ZWMoaHJlZikpLmZpbHRlcihpZ24gPT4gISFpZ24pWzBdO1xuICAgICAgICBpZiAoaWdub3JlZCkgeyByZXR1cm47IH1cblxuICAgICAgICBocmVmID0gcGF0aC5iYXNlbmFtZShocmVmKTtcbiAgICAgICAgY29uc3QgZmlyc3RWZXJzaW9uID0gLy4rXFwuKC4rKVxcLmNzcy9nLmV4ZWMoaHJlZik7XG4gICAgICAgIGNvbnN0IHNlY29uZFZlcnNpb24gPSAvLitcXC5jc3NcXD8uKy9nLmV4ZWMoaHJlZik7XG4gICAgICAgIGNvbnN0IHRoaXJkVmVyc2lvbiA9IGhyZWYubGVuZ3RoID4gMjA7XG5cbiAgICAgICAgcmVqZWN0ZWQgPSByZWplY3RlZCB8fCAhZmlyc3RWZXJzaW9uICYmICFzZWNvbmRWZXJzaW9uICYmICF0aGlyZFZlcnNpb24gJiYgaHJlZjtcbiAgICB9KTtcblxuICAgIC8vIEV2ZXJ5dGhpbmcgbXVzdCd2ZSB3ZW50IGZpbmVcbiAgICAhcmVqZWN0ZWQgPyByZXNvbHZlKHRydWUpIDogcmVqZWN0KHJlamVjdGVkKTtcbn0pO1xuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEV4cG9ydFxuXG5leHBvcnQgZGVmYXVsdCB7XG4gICAgbmFtZTogJ2Jlc3RQcmFjdGljZXMnLFxuICAgIHJ1bGVzOiBbXG4gICAgICAgIHsgbmFtZTogJ2hhc250TG9ncycsIGZuOiBoYXNudExvZ3MgfSxcbiAgICAgICAgeyBuYW1lOiAnaGFzbnRXYXJucycsIGZuOiBoYXNudFdhcm5zIH0sXG4gICAgICAgIHsgbmFtZTogJ2hhc250RXJyb3JzJywgZm46IGhhc250RXJyb3JzIH0sXG4gICAgICAgIHsgbmFtZTogJ2hhc0Nzc1ZlcnNpb24nLCBmbjogaGFzQ3NzVmVyc2lvbiB9LFxuICAgICAgICB7IG5hbWU6ICdoYXNKc1ZlcnNpb24nLCBmbjogaGFzSnNWZXJzaW9uIH1cbiAgICBdXG59O1xuIl19