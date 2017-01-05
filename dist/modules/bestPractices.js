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
 * Checks if js is versioned
 *
 * @param {object} req
 * @returns
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
 * @returns
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
    rules: [{ name: 'hasCssVersion', fn: hasCssVersion }, { name: 'hasJsVersion', fn: hasJsVersion }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2R1bGVzL2Jlc3RQcmFjdGljZXMuanMiXSwibmFtZXMiOlsiaGFzSnNWZXJzaW9uIiwicmVxIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJsaW5rcyIsImRvbVJlcSIsIndpbmRvdyIsIiQiLCJzYWZlSWdub3JlIiwicmVqZWN0ZWQiLCJlYWNoIiwiaSIsInZhbCIsImhyZWYiLCJnZXRBdHRyaWJ1dGUiLCJpZ25vcmVkIiwibWFwIiwiUmVnRXhwIiwiaWduIiwiZXhlYyIsImZpbHRlciIsImJhc2VuYW1lIiwiZmlyc3RWZXJzaW9uIiwic2Vjb25kVmVyc2lvbiIsInRoaXJkVmVyc2lvbiIsImxlbmd0aCIsImhhc0Nzc1ZlcnNpb24iLCJuYW1lIiwicnVsZXMiLCJmbiJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTs7Ozs7O0FBRUE7Ozs7OztBQUVBO0FBQ0E7O0FBRUE7Ozs7OztBQU1BLElBQU1BLGVBQWUsU0FBZkEsWUFBZSxDQUFDQyxHQUFEO0FBQUEsV0FBUyxJQUFJQyxPQUFKLENBQVksVUFBQ0MsT0FBRCxFQUFVQyxNQUFWLEVBQXFCO0FBQzNELFlBQU1DLFFBQVFKLElBQUlLLE1BQUosQ0FBV0MsTUFBWCxDQUFrQkMsQ0FBbEIsQ0FBb0IsUUFBcEIsQ0FBZDtBQUNBLFlBQU1DLGFBQWEsQ0FBQyxRQUFELEVBQVcsS0FBWCxDQUFuQjtBQUNBLFlBQUlDLFdBQVcsS0FBZjs7QUFFQTtBQUNBTCxjQUFNTSxJQUFOLENBQVcsVUFBQ0MsQ0FBRCxFQUFJQyxHQUFKLEVBQVk7QUFDbkIsZ0JBQUlILFFBQUosRUFBYztBQUFFO0FBQVM7O0FBRXpCLGdCQUFJSSxPQUFPRCxJQUFJRSxZQUFKLENBQWlCLEtBQWpCLENBQVg7O0FBRUE7QUFDQSxnQkFBSSxPQUFPRCxJQUFQLEtBQWdCLFFBQWhCLElBQTRCQSxTQUFTLEVBQXpDLEVBQTZDO0FBQ3pDO0FBQ0g7O0FBRUQ7QUFDQSxnQkFBTUUsVUFBVVAsV0FBV1EsR0FBWCxDQUFlO0FB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Y2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG4vKiBnbG9iYWwgUHJvbWlzZSAqL1xuXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBGdW5jdGlvbnNcblxuLyoqXG4gKiBDaGVja3MgaWYganMgaXMgdmVyc2lvbmVkXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IHJlcVxuICogQHJldHVybnNcbiAqL1xuY29uc3QgaGFzSnNWZXJzaW9uID0gKHJlcSkgPT4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IGxpbmtzID0gcmVxLmRvbVJlcS53aW5kb3cuJCgnc2NyaXB0Jyk7XG4gICAgY29uc3Qgc2FmZUlnbm9yZSA9IFsnanF1ZXJ5JywgJ2NkbiddO1xuICAgIGxldCByZWplY3RlZCA9IGZhbHNlO1xuXG4gICAgLy8gTGV0cyBzZWUgaWYgb25lIG9mIHRoZXNlIGRvZXNuJ3QgaGF2ZSB2ZXJzaW9uaW5nXG4gICAgbGlua3MuZWFjaCgoaSwgdmFsKSA9PiB7XG4gICAgICAgIGlmIChyZWplY3RlZCkgeyByZXR1cm47IH1cblxuICAgICAgICBsZXQgaHJlZiA9IHZhbC5nZXRBdHRyaWJ1dGUoJ3NyYycpO1xuXG4gICAgICAgIC8vIEp1c3QgaWdub3JlXG4gICAgICAgIGlmICh0eXBlb2YgaHJlZiAhPT0gJ3N0cmluZycgfHwgaHJlZiA9PT0gJycpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIExldHMgaWdub3JlIGNvbW1vbiB0aGluZ3Mgd2UgZG9uJ3Qgd2FudCB0byB2ZXJzaW9uIG91dFxuICAgICAgICBjb25zdCBpZ25vcmVkID0gc2FmZUlnbm9yZS5tYXAoaWduID0+IChuZXcgUmVnRXhwKGlnbiwgJ2cnKSkuZXhlYyhocmVmKSkuZmlsdGVyKGlnbiA9PiAhIWlnbilbMF07XG4gICAgICAgIGlmIChpZ25vcmVkKSB7IHJldHVybjsgfVxuXG4gICAgICAgIGhyZWYgPSBwYXRoLmJhc2VuYW1lKGhyZWYpO1xuICAgICAgICBjb25zdCBmaXJzdFZlcnNpb24gPSAvLitcXC4oLispXFwuanMvZy5leGVjKGhyZWYpO1xuICAgICAgICBjb25zdCBzZWNvbmRWZXJzaW9uID0gLy4rXFwuanNcXD8uKy9nLmV4ZWMoaHJlZik7XG4gICAgICAgIGNvbnN0IHRoaXJkVmVyc2lvbiA9IGhyZWYubGVuZ3RoID4gMjA7XG5cbiAgICAgICAgcmVqZWN0ZWQgPSByZWplY3RlZCB8fCAhZmlyc3RWZXJzaW9uICYmICFzZWNvbmRWZXJzaW9uICYmICF0aGlyZFZlcnNpb24gJiYgaHJlZjtcbiAgICB9KTtcblxuICAgIC8vIEV2ZXJ5dGhpbmcgbXVzdCd2ZSB3ZW50IGZpbmVcbiAgICAhcmVqZWN0ZWQgPyByZXNvbHZlKHRydWUpIDogcmVqZWN0KHJlamVjdGVkKTtcbn0pO1xuXG4vKipcbiAqIENoZWNrcyBpZiBjc3MgaXMgdmVyc2lvbmVkXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IHJlcVxuICogQHJldHVybnNcbiAqL1xuY29uc3QgaGFzQ3NzVmVyc2lvbiA9IChyZXEpID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBjb25zdCBsaW5rcyA9IHJlcS5kb21SZXEud2luZG93LiQoJ2xpbmtbcmVsPVwic3R5bGVzaGVldFwiXScpO1xuICAgIGNvbnN0IHNhZmVJZ25vcmUgPSBbJ2pxdWVyeScsICdjZG4nXTtcbiAgICBsZXQgcmVqZWN0ZWQgPSBmYWxzZTtcblxuICAgIC8vIExldHMgc2VlIGlmIG9uZSBvZiB0aGVzZSBkb2Vzbid0IGhhdmUgdmVyc2lvbmluZ1xuICAgIGxpbmtzLmVhY2goKGksIHZhbCkgPT4ge1xuICAgICAgICBpZiAocmVqZWN0ZWQpIHsgcmV0dXJuOyB9XG5cbiAgICAgICAgbGV0IGhyZWYgPSB2YWwuZ2V0QXR0cmlidXRlKCdocmVmJyk7XG5cbiAgICAgICAgLy8gSnVzdCBpZ25vcmVcbiAgICAgICAgaWYgKHR5cGVvZiBocmVmICE9PSAnc3RyaW5nJyB8fCBocmVmID09PSAnJykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTGV0cyBpZ25vcmUgY29tbW9uIHRoaW5ncyB3ZSBkb24ndCB3YW50IHRvIHZlcnNpb24gb3V0XG4gICAgICAgIGNvbnN0IGlnbm9yZWQgPSBzYWZlSWdub3JlLm1hcChpZ24gPT4gKG5ldyBSZWdFeHAoaWduLCAnZycpKS5leGVjKGhyZWYpKS5maWx0ZXIoaWduID0+ICEhaWduKVswXTtcbiAgICAgICAgaWYgKGlnbm9yZWQpIHsgcmV0dXJuOyB9XG5cbiAgICAgICAgaHJlZiA9IHBhdGguYmFzZW5hbWUoaHJlZik7XG4gICAgICAgIGNvbnN0IGZpcnN0VmVyc2lvbiA9IC8uK1xcLiguKylcXC5jc3MvZy5leGVjKGhyZWYpO1xuICAgICAgICBjb25zdCBzZWNvbmRWZXJzaW9uID0gLy4rXFwuY3NzXFw/LisvZy5leGVjKGhyZWYpO1xuICAgICAgICBjb25zdCB0aGlyZFZlcnNpb24gPSBocmVmLmxlbmd0aCA+IDIwO1xuXG4gICAgICAgIHJlamVjdGVkID0gcmVqZWN0ZWQgfHwgIWZpcnN0VmVyc2lvbiAmJiAhc2Vjb25kVmVyc2lvbiAmJiAhdGhpcmRWZXJzaW9uICYmIGhyZWY7XG4gICAgfSk7XG5cbiAgICAvLyBFdmVyeXRoaW5nIG11c3QndmUgd2VudCBmaW5lXG4gICAgIXJlamVjdGVkID8gcmVzb2x2ZSh0cnVlKSA6IHJlamVjdChyZWplY3RlZCk7XG59KTtcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBFeHBvcnRcblxuZXhwb3J0IGRlZmF1bHQge1xuICAgIG5hbWU6ICdiZXN0UHJhY3RpY2VzJyxcbiAgICBydWxlczogW1xuICAgICAgICB7IG5hbWU6ICdoYXNDc3NWZXJzaW9uJywgZm46IGhhc0Nzc1ZlcnNpb24gfSxcbiAgICAgICAgeyBuYW1lOiAnaGFzSnNWZXJzaW9uJywgZm46IGhhc0pzVmVyc2lvbiB9XG4gICAgXVxufTtcbiJdfQ==