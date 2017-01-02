'use strict';
/* global Promise */

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.readFile = exports.getPwd = exports.isUrl = undefined;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _isArray = require('lodash/isArray.js');

var _isArray2 = _interopRequireDefault(_isArray);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//-------------------------------------
// Functions

/**
 * Check if url is valid
 *
 * @param {string} url
 * @returns
 */
var isUrl = function isUrl(url) {
    var pattern = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
    return pattern.test(url);
};

/**
 * Gets pwd path
 * @param  {string} src
 * @return {string}
 */
var getPwd = function getPwd(src) {
    var newSrc = src;

    if (src && typeof src === 'string') {
        if (isUrl(src)) {
            return src;
        }

        newSrc = src[0] !== '/' ? _path2.default.join(process.env.PWD, src) : src;
    } else if (src && (0, _isArray2.default)(src)) {
        newSrc = src.map(function (val) {
            return getPwd(val);
        });
    }

    return newSrc;
};

/**
 * Returns file in raw mode
 * @param  {string} pathSrc
 * @param  {string} dirname
 * @return {string}
 */
var readFile = function readFile(pathSrc, dirname) {
    var filename = !!dirname ? _path2.default.join(dirname, pathSrc) : _path2.default.resolve(pathSrc);

    if (!_fs2.default.existsSync(filename)) {
        return false;
    }

    return _fs2.default.readFileSync(filename, 'utf8');
};

// --------------------------------
// Export

exports.isUrl = isUrl;
exports.getPwd = getPwd;
exports.readFile = readFile;

// Essentially for testing purposes
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy91dGlscy5qcyJdLCJuYW1lcyI6WyJpc1VybCIsInVybCIsInBhdHRlcm4iLCJ0ZXN0IiwiZ2V0UHdkIiwic3JjIiwibmV3U3JjIiwiam9pbiIsInByb2Nlc3MiLCJlbnYiLCJQV0QiLCJtYXAiLCJ2YWwiLCJyZWFkRmlsZSIsInBhdGhTcmMiLCJkaXJuYW1lIiwiZmlsZW5hbWUiLCJyZXNvbHZlIiwiZXhpc3RzU3luYyIsInJlYWRGaWxlU3luYyJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTs7Ozs7OztBQUVBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7O0FBRUE7QUFDQTs7QUFFQTs7Ozs7O0FBTUEsSUFBTUEsUUFBUSxTQUFSQSxLQUFRLENBQUNDLEdBQUQsRUFBUztBQUNuQixRQUFNQyxVQUFVLDZFQUFoQjtBQUNBLFdBQU9BLFFBQVFDLElBQVIsQ0FBYUYsR0FBYixDQUFQO0FBQ0gsQ0FIRDs7QUFLQTs7Ozs7QUFLQSxJQUFNRyxTQUFTLFNBQVRBLE1BQVMsQ0FBQ0MsR0FBRCxFQUFTO0FBQ3BCLFFBQUlDLFNBQVNELEdBQWI7O0FBRUEsUUFBSUEsT0FBTyxPQUFPQSxHQUFQLEtBQWUsUUFBMUIsRUFBb0M7QUFDaEMsWUFBSUwsTUFBTUssR0FBTixDQUFKLEVBQWdCO0FBQ1osbUJBQU9BLEdBQVA7QUFDSDs7QUFFREMsaUJBQVVELElBQUksQ0FBSixNQUFXLEdBQVosR0FBbUIsZUFBS0UsSUFBTCxDQUFVQyxRQUFRQyxHQUFSLENBQVlDLEdBQXRCLEVBQTJCTCxHQUEzQixDQUFuQixHQUFxREEsR0FBOUQ7QUFDSCxLQU5ELE1BTU8sSUFBSUEsT0FBTyx1QkFBUUEsR0FBUixDQUFYLEVBQXlCO0FBQzVCQyxpQkFBU0QsSUFBSU0sR0FBSixDQUFRO0FBQUEsbUJBQU9QLE9BQU9RLEdBQVAsQ0FBUDtBQUFBLFNBQVIsQ0FBVDtBQUNIOztBQUVELFdBQU9OLE1BQVA7QUFDSCxDQWREOztBQWdCQTs7Ozs7O0FBTUEsSUFBTU8sV0FBVyxTQUFYQSxRQUFXLENBQUNDLE9BQUQsRUFBVUMsT0FBVixFQUFzQjtBQUNuQyxRQUFNQyxXQUFXLENBQUMsQ0FBQ0QsT0FBRixHQUFZLGVBQUtSLElBQUwsQ0FBVVEsT0FBVixFQUFtQkQsT0FBbkIsQ0FBWixHQUEwQyxlQUFLRyxPQUFMLENBQWFILE9BQWIsQ0FBM0Q7O0FBRUEsUUFBSSxDQUFDLGFBQUdJLFVBQUgsQ0FBY0YsUUFBZCxDQUFMLEVBQThCO0FBQzFCLGVBQU8sS0FBUDtBQUNIOztBQUVELFdBQU8sYUFBR0csWUFBSCxDQUFnQkgsUUFBaEIsRUFBMEIsTUFBMUIsQ0FBUDtBQUNILENBUkQ7O0FBVUE7QUFDQTs7UUFFU2hCLEssR0FBQUEsSztRQUNBSSxNLEdBQUFBLE07UUFDQVMsUSxHQUFBQSxROztBQUVUIiwiZmlsZSI6InV0aWxzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuLyogZ2xvYmFsIFByb21pc2UgKi9cblxuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IGlzQXJyYXkgZnJvbSAnbG9kYXNoL2lzQXJyYXkuanMnO1xuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEZ1bmN0aW9uc1xuXG4vKipcbiAqIENoZWNrIGlmIHVybCBpcyB2YWxpZFxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB1cmxcbiAqIEByZXR1cm5zXG4gKi9cbmNvbnN0IGlzVXJsID0gKHVybCkgPT4ge1xuICAgIGNvbnN0IHBhdHRlcm4gPSAvKGh0dHB8aHR0cHMpOlxcL1xcLyhcXHcrOnswLDF9XFx3Kik/KFxcUyspKDpbMC05XSspPyhcXC98XFwvKFtcXHcjITouPys9JiUhXFwtXFwvXSkpPy87XG4gICAgcmV0dXJuIHBhdHRlcm4udGVzdCh1cmwpO1xufTtcblxuLyoqXG4gKiBHZXRzIHB3ZCBwYXRoXG4gKiBAcGFyYW0gIHtzdHJpbmd9IHNyY1xuICogQHJldHVybiB7c3RyaW5nfVxuICovXG5jb25zdCBnZXRQd2QgPSAoc3JjKSA9PiB7XG4gICAgbGV0IG5ld1NyYyA9IHNyYztcblxuICAgIGlmIChzcmMgJiYgdHlwZW9mIHNyYyA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgaWYgKGlzVXJsKHNyYykpIHtcbiAgICAgICAgICAgIHJldHVybiBzcmM7XG4gICAgICAgIH1cblxuICAgICAgICBuZXdTcmMgPSAoc3JjWzBdICE9PSAnLycpID8gcGF0aC5qb2luKHByb2Nlc3MuZW52LlBXRCwgc3JjKSA6IHNyYztcbiAgICB9IGVsc2UgaWYgKHNyYyAmJiBpc0FycmF5KHNyYykpIHtcbiAgICAgICAgbmV3U3JjID0gc3JjLm1hcCh2YWwgPT4gZ2V0UHdkKHZhbCkpO1xuICAgIH1cblxuICAgIHJldHVybiBuZXdTcmM7XG59O1xuXG4vKipcbiAqIFJldHVybnMgZmlsZSBpbiByYXcgbW9kZVxuICogQHBhcmFtICB7c3RyaW5nfSBwYXRoU3JjXG4gKiBAcGFyYW0gIHtzdHJpbmd9IGRpcm5hbWVcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xuY29uc3QgcmVhZEZpbGUgPSAocGF0aFNyYywgZGlybmFtZSkgPT4ge1xuICAgIGNvbnN0IGZpbGVuYW1lID0gISFkaXJuYW1lID8gcGF0aC5qb2luKGRpcm5hbWUsIHBhdGhTcmMpIDogcGF0aC5yZXNvbHZlKHBhdGhTcmMpO1xuXG4gICAgaWYgKCFmcy5leGlzdHNTeW5jKGZpbGVuYW1lKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZzLnJlYWRGaWxlU3luYyhmaWxlbmFtZSwgJ3V0ZjgnKTtcbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBFeHBvcnRcblxuZXhwb3J0IHsgaXNVcmwgfTtcbmV4cG9ydCB7IGdldFB3ZCB9O1xuZXhwb3J0IHsgcmVhZEZpbGUgfTtcblxuLy8gRXNzZW50aWFsbHkgZm9yIHRlc3RpbmcgcHVycG9zZXNcbmV4cG9ydCBjb25zdCBfX3Rlc3RNZXRob2RzX18gPSB7IGlzVXJsLCBnZXRQd2QsIHJlYWRGaWxlIH07XG4iXX0=