'use strict';
/* global Promise */

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _w3cjs = require('w3cjs');

var _w3cjs2 = _interopRequireDefault(_w3cjs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//-------------------------------------
// Functions

/**
 * Checks if is compliant
 *
 * @param {object} req
 * @returns
 */
var isCompliant = function isCompliant(req) {
    var documentHtml = req.window.document.documentElement.outerHTML;

    // Now lets validate
    var promise = new Promise(function (resolve, reject) {
        _w3cjs2.default.validate({
            input: documentHtml,
            callback: function callback(res) {
                return resolve(res && res.messages) || reject(res);
            }
        });
    }).then(function (data) {
        // Parse it as we expect it
        data = data.map(function (val) {
            var status = val.type === 'error' ? 'failed' : val.type;
            return { status: status, msg: val.message, raw: val };
        });

        return data;
    });

    return promise;
};

//-------------------------------------
// Export

exports.default = {
    name: 'w3',
    rules: [{ name: 'isCompliant', fn: isCompliant }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2R1bGVzL3czLmpzIl0sIm5hbWVzIjpbImlzQ29tcGxpYW50IiwicmVxIiwiZG9jdW1lbnRIdG1sIiwid2luZG93IiwiZG9jdW1lbnQiLCJkb2N1bWVudEVsZW1lbnQiLCJvdXRlckhUTUwiLCJwcm9taXNlIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJ2YWxpZGF0ZSIsImlucHV0IiwiY2FsbGJhY2siLCJyZXMiLCJtZXNzYWdlcyIsInRoZW4iLCJkYXRhIiwibWFwIiwidmFsIiwic3RhdHVzIiwidHlwZSIsIm1zZyIsIm1lc3NhZ2UiLCJyYXciLCJuYW1lIiwicnVsZXMiLCJmbiJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTs7Ozs7O0FBRUE7Ozs7OztBQUVBO0FBQ0E7O0FBRUE7Ozs7OztBQU1BLElBQU1BLGNBQWMsU0FBZEEsV0FBYyxDQUFDQyxHQUFELEVBQVM7QUFDekIsUUFBTUMsZUFBZUQsSUFBSUUsTUFBSixDQUFXQyxRQUFYLENBQW9CQyxlQUFwQixDQUFvQ0MsU0FBekQ7O0FBRUE7QUFDQSxRQUFNQyxVQUFVLElBQUlDLE9BQUosQ0FBWSxVQUFDQyxPQUFELEVBQVVDLE1BQVYsRUFBcUI7QUFDN0Msd0JBQU1DLFFBQU4sQ0FBZTtBQUNYQyxtQkFBT1YsWUFESTtBQUVYVyxzQkFBVTtBQUFBLHVCQUFPSixRQUFRSyxPQUFPQSxJQUFJQyxRQUFuQixLQUFnQ0wsT0FBT0ksR0FBUCxDQUF2QztBQUFBO0FBRkMsU0FBZjtBQUlILEtBTGUsRUFNZkUsSUFOZSxDQU1WLFVBQUNDLElBQUQsRUFBVTtBQUNaO0FBQ0FBLGVBQU9BLEtBQUtDLEdBQUwsQ0FBUyxVQUFDQyxHQUFELEVBQVM7QUFDckIsZ0JBQU1DLFNBQVNELElBQUlFLElBQUosS0FBYSxPQUFiLEdBQXVCLFFBQXZCLEdBQWtDRixJQUFJRSxJQUFyRDtBQUNBLG1CQUFPLEVBQUVELGNBQUYsRUFBVUUsS0FBS0gsSUFBSUksT0FBbkIsRUFBNEJDLEtBQUtMLEdBQWpDLEVBQVA7QUFDSCxTQUhNLENBQVA7O0FBS0EsZUFBT0YsSUFBUDtBQUNILEtBZGUsQ0FBaEI7O0FBZ0JBLFdBQU9WLE9BQVA7QUFDSCxDQXJCRDs7QUF1QkE7QUFDQTs7a0JBRWU7QUFDWGtCLFVBQU0sSUFESztBQUVYQyxXQUFPLENBQ0gsRUFBRUQsTUFBTSxhQUFSLEVBQXVCRSxJQUFJM0IsV0FBM0IsRUFERztBQUZJLEMiLCJmaWxlIjoidzMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG4vKiBnbG9iYWwgUHJvbWlzZSAqL1xuXG5pbXBvcnQgdzNjanMgZnJvbSAndzNjanMnO1xuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEZ1bmN0aW9uc1xuXG4vKipcbiAqIENoZWNrcyBpZiBpcyBjb21wbGlhbnRcbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gcmVxXG4gKiBAcmV0dXJuc1xuICovXG5jb25zdCBpc0NvbXBsaWFudCA9IChyZXEpID0+IHtcbiAgICBjb25zdCBkb2N1bWVudEh0bWwgPSByZXEud2luZG93LmRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5vdXRlckhUTUw7XG5cbiAgICAvLyBOb3cgbGV0cyB2YWxpZGF0ZVxuICAgIGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIHczY2pzLnZhbGlkYXRlKHtcbiAgICAgICAgICAgIGlucHV0OiBkb2N1bWVudEh0bWwsXG4gICAgICAgICAgICBjYWxsYmFjazogcmVzID0+IHJlc29sdmUocmVzICYmIHJlcy5tZXNzYWdlcykgfHwgcmVqZWN0KHJlcylcbiAgICAgICAgfSk7XG4gICAgfSlcbiAgICAudGhlbigoZGF0YSkgPT4ge1xuICAgICAgICAvLyBQYXJzZSBpdCBhcyB3ZSBleHBlY3QgaXRcbiAgICAgICAgZGF0YSA9IGRhdGEubWFwKCh2YWwpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHN0YXR1cyA9IHZhbC50eXBlID09PSAnZXJyb3InID8gJ2ZhaWxlZCcgOiB2YWwudHlwZTtcbiAgICAgICAgICAgIHJldHVybiB7IHN0YXR1cywgbXNnOiB2YWwubWVzc2FnZSwgcmF3OiB2YWwgfTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gcHJvbWlzZTtcbn07XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gRXhwb3J0XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgICBuYW1lOiAndzMnLFxuICAgIHJ1bGVzOiBbXG4gICAgICAgIHsgbmFtZTogJ2lzQ29tcGxpYW50JywgZm46IGlzQ29tcGxpYW50IH1cbiAgICBdXG59O1xuIl19