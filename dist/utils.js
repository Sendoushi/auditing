'use strict';
/* global Promise */

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.contains = exports.readFile = exports.getPwd = exports.isUrl = undefined;

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

/**
 * Is pattern in array
 *
 * @param {array} arr
 * @param {string} val
 * @returns
 */
var contains = function contains() {
    var arr = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var val = arguments[1];

    var is = false;

    if (typeof arr === 'string') {
        arr = [arr];
    }

    if (typeof val !== 'string') {
        return is;
    }

    arr.forEach(function (pattern) {
        var reg = new RegExp(pattern.toLowerCase(), 'g');
        is = is || reg.test(val.toLowerCase());
    });

    return is;
};

// --------------------------------
// Export

exports.isUrl = isUrl;
exports.getPwd = getPwd;
exports.readFile = readFile;
exports.contains = contains;

// Essentially for testing purposes
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy91dGlscy5qcyJdLCJuYW1lcyI6WyJpc1VybCIsInVybCIsInBhdHRlcm4iLCJ0ZXN0IiwiZ2V0UHdkIiwic3JjIiwibmV3U3JjIiwiam9pbiIsInByb2Nlc3MiLCJlbnYiLCJQV0QiLCJtYXAiLCJ2YWwiLCJyZWFkRmlsZSIsInBhdGhTcmMiLCJkaXJuYW1lIiwiZmlsZW5hbWUiLCJyZXNvbHZlIiwiZXhpc3RzU3luYyIsInJlYWRGaWxlU3luYyIsImNvbnRhaW5zIiwiYXJyIiwiaXMiLCJmb3JFYWNoIiwicmVnIiwiUmVnRXhwIiwidG9Mb3dlckNhc2UiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7Ozs7Ozs7QUFFQTs7OztBQUNBOzs7O0FBQ0E7Ozs7OztBQUVBO0FBQ0E7O0FBRUE7Ozs7OztBQU1BLElBQU1BLFFBQVEsU0FBUkEsS0FBUSxDQUFDQyxHQUFELEVBQVM7QUFDbkIsUUFBTUMsVUFBVSw2RUFBaEI7QUFDQSxXQUFPQSxRQUFRQyxJQUFSLENBQWFGLEdBQWIsQ0FBUDtBQUNILENBSEQ7O0FBS0E7Ozs7O0FBS0EsSUFBTUcsU0FBUyxTQUFUQSxNQUFTLENBQUNDLEdBQUQsRUFBUztBQUNwQixRQUFJQyxTQUFTRCxHQUFiOztBQUVBLFFBQUlBLE9BQU8sT0FBT0EsR0FBUCxLQUFlLFFBQTFCLEVBQW9DO0FBQ2hDLFlBQUlMLE1BQU1LLEdBQU4sQ0FBSixFQUFnQjtBQUNaLG1CQUFPQSxHQUFQO0FBQ0g7O0FBRURDLGlCQUFVRCxJQUFJLENBQUosTUFBVyxHQUFaLEdBQW1CLGVBQUtFLElBQUwsQ0FBVUMsUUFBUUMsR0FBUixDQUFZQyxHQUF0QixFQUEyQkwsR0FBM0IsQ0FBbkIsR0FBcURBLEdBQTlEO0FBQ0gsS0FORCxNQU1PLElBQUlBLE9BQU8sdUJBQVFBLEdBQVIsQ0FBWCxFQUF5QjtBQUM1QkMsaUJBQVNELElBQUlNLEdBQUosQ0FBUTtBQUFBLG1CQUFPUCxPQUFPUSxHQUFQLENBQVA7QUFBQSxTQUFSLENBQVQ7QUFDSDs7QUFFRCxXQUFPTixNQUFQO0FBQ0gsQ0FkRDs7QUFnQkE7Ozs7OztBQU1BLElBQU1PLFdBQVcsU0FBWEEsUUFBVyxDQUFDQyxPQUFELEVBQVVDLE9BQVYsRUFBc0I7QUFDbkMsUUFBTUMsV0FBVyxDQUFDLENBQUNELE9BQUYsR0FBWSxlQUFLUixJQUFMLENBQVVRLE9BQVYsRUFBbUJELE9BQW5CLENBQVosR0FBMEMsZUFBS0csT0FBTCxDQUFhSCxPQUFiLENBQTNEOztBQUVBLFFBQUksQ0FBQyxhQUFHSSxVQUFILENBQWNGLFFBQWQsQ0FBTCxFQUE4QjtBQUMxQixlQUFPLEtBQVA7QUFDSDs7QUFFRCxXQUFPLGFBQUdHLFlBQUgsQ0FBZ0JILFFBQWhCLEVBQTBCLE1BQTFCLENBQVA7QUFDSCxDQVJEOztBQVVBOzs7Ozs7O0FBT0EsSUFBTUksV0FBVyxTQUFYQSxRQUFXLEdBQW1CO0FBQUEsUUFBbEJDLEdBQWtCLHVFQUFaLEVBQVk7QUFBQSxRQUFSVCxHQUFROztBQUNoQyxRQUFJVSxLQUFLLEtBQVQ7O0FBRUEsUUFBSSxPQUFPRCxHQUFQLEtBQWUsUUFBbkIsRUFBNkI7QUFDekJBLGNBQU0sQ0FBQ0EsR0FBRCxDQUFOO0FBQ0g7O0FBRUQsUUFBSSxPQUFPVCxHQUFQLEtBQWUsUUFBbkIsRUFBNkI7QUFDekIsZUFBT1UsRUFBUDtBQUNIOztBQUVERCxRQUFJRSxPQUFKLENBQVksbUJBQVc7QUFDbkIsWUFBTUMsTUFBTSxJQUFJQyxNQUFKLENBQVd2QixRQUFRd0IsV0FBUixFQUFYLEVBQWtDLEdBQWxDLENBQVo7QUFDQUosYUFBS0EsTUFBTUUsSUFBSXJCLElBQUosQ0FBU1MsSUFBSWMsV0FBSixFQUFULENBQVg7QUFDSCxLQUhEOztBQUtBLFdBQU9KLEVBQVA7QUFDSCxDQWpCRDs7QUFtQkE7QUFDQTs7UUFFU3RCLEssR0FBQUEsSztRQUNBSSxNLEdBQUFBLE07UUFDQVMsUSxHQUFBQSxRO1FBQ0FPLFEsR0FBQUEsUTs7QUFFVCIsImZpbGUiOiJ1dGlscy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0Jztcbi8qIGdsb2JhbCBQcm9taXNlICovXG5cbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBpc0FycmF5IGZyb20gJ2xvZGFzaC9pc0FycmF5LmpzJztcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBGdW5jdGlvbnNcblxuLyoqXG4gKiBDaGVjayBpZiB1cmwgaXMgdmFsaWRcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsXG4gKiBAcmV0dXJuc1xuICovXG5jb25zdCBpc1VybCA9ICh1cmwpID0+IHtcbiAgICBjb25zdCBwYXR0ZXJuID0gLyhodHRwfGh0dHBzKTpcXC9cXC8oXFx3Kzp7MCwxfVxcdyopPyhcXFMrKSg6WzAtOV0rKT8oXFwvfFxcLyhbXFx3IyE6Lj8rPSYlIVxcLVxcL10pKT8vO1xuICAgIHJldHVybiBwYXR0ZXJuLnRlc3QodXJsKTtcbn07XG5cbi8qKlxuICogR2V0cyBwd2QgcGF0aFxuICogQHBhcmFtICB7c3RyaW5nfSBzcmNcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xuY29uc3QgZ2V0UHdkID0gKHNyYykgPT4ge1xuICAgIGxldCBuZXdTcmMgPSBzcmM7XG5cbiAgICBpZiAoc3JjICYmIHR5cGVvZiBzcmMgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGlmIChpc1VybChzcmMpKSB7XG4gICAgICAgICAgICByZXR1cm4gc3JjO1xuICAgICAgICB9XG5cbiAgICAgICAgbmV3U3JjID0gKHNyY1swXSAhPT0gJy8nKSA/IHBhdGguam9pbihwcm9jZXNzLmVudi5QV0QsIHNyYykgOiBzcmM7XG4gICAgfSBlbHNlIGlmIChzcmMgJiYgaXNBcnJheShzcmMpKSB7XG4gICAgICAgIG5ld1NyYyA9IHNyYy5tYXAodmFsID0+IGdldFB3ZCh2YWwpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3U3JjO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIGZpbGUgaW4gcmF3IG1vZGVcbiAqIEBwYXJhbSAge3N0cmluZ30gcGF0aFNyY1xuICogQHBhcmFtICB7c3RyaW5nfSBkaXJuYW1lXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbmNvbnN0IHJlYWRGaWxlID0gKHBhdGhTcmMsIGRpcm5hbWUpID0+IHtcbiAgICBjb25zdCBmaWxlbmFtZSA9ICEhZGlybmFtZSA/IHBhdGguam9pbihkaXJuYW1lLCBwYXRoU3JjKSA6IHBhdGgucmVzb2x2ZShwYXRoU3JjKTtcblxuICAgIGlmICghZnMuZXhpc3RzU3luYyhmaWxlbmFtZSkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiBmcy5yZWFkRmlsZVN5bmMoZmlsZW5hbWUsICd1dGY4Jyk7XG59O1xuXG4vKipcbiAqIElzIHBhdHRlcm4gaW4gYXJyYXlcbiAqXG4gKiBAcGFyYW0ge2FycmF5fSBhcnJcbiAqIEBwYXJhbSB7c3RyaW5nfSB2YWxcbiAqIEByZXR1cm5zXG4gKi9cbmNvbnN0IGNvbnRhaW5zID0gKGFyciA9IFtdLCB2YWwpID0+IHtcbiAgICBsZXQgaXMgPSBmYWxzZTtcblxuICAgIGlmICh0eXBlb2YgYXJyID09PSAnc3RyaW5nJykge1xuICAgICAgICBhcnIgPSBbYXJyXTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHZhbCAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgcmV0dXJuIGlzO1xuICAgIH1cblxuICAgIGFyci5mb3JFYWNoKHBhdHRlcm4gPT4ge1xuICAgICAgICBjb25zdCByZWcgPSBuZXcgUmVnRXhwKHBhdHRlcm4udG9Mb3dlckNhc2UoKSwgJ2cnKTtcbiAgICAgICAgaXMgPSBpcyB8fCByZWcudGVzdCh2YWwudG9Mb3dlckNhc2UoKSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gaXM7XG59O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gRXhwb3J0XG5cbmV4cG9ydCB7IGlzVXJsIH07XG5leHBvcnQgeyBnZXRQd2QgfTtcbmV4cG9ydCB7IHJlYWRGaWxlIH07XG5leHBvcnQgeyBjb250YWlucyB9O1xuXG4vLyBFc3NlbnRpYWxseSBmb3IgdGVzdGluZyBwdXJwb3Nlc1xuZXhwb3J0IGNvbnN0IF9fdGVzdE1ldGhvZHNfXyA9IHsgaXNVcmwsIGdldFB3ZCwgcmVhZEZpbGUsIGNvbnRhaW5zIH07XG4iXX0=