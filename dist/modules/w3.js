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
            return { type: val.type, msg: val.message, original: val };
        });

        // Lets see if there is any error
        data.forEach(function (val) {
            if (val.type === 'error') {
                throw data;
            }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2R1bGVzL3czLmpzIl0sIm5hbWVzIjpbImlzQ29tcGxpYW50IiwicmVxIiwiZG9jdW1lbnRIdG1sIiwid2luZG93IiwiZG9jdW1lbnQiLCJkb2N1bWVudEVsZW1lbnQiLCJvdXRlckhUTUwiLCJwcm9taXNlIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJ2YWxpZGF0ZSIsImlucHV0IiwiY2FsbGJhY2siLCJyZXMiLCJtZXNzYWdlcyIsInRoZW4iLCJkYXRhIiwibWFwIiwidmFsIiwidHlwZSIsIm1zZyIsIm1lc3NhZ2UiLCJvcmlnaW5hbCIsImZvckVhY2giLCJuYW1lIiwicnVsZXMiLCJmbiJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTs7Ozs7O0FBRUE7Ozs7OztBQUVBO0FBQ0E7O0FBRUE7Ozs7OztBQU1BLElBQU1BLGNBQWMsU0FBZEEsV0FBYyxDQUFDQyxHQUFELEVBQVM7QUFDekIsUUFBTUMsZUFBZUQsSUFBSUUsTUFBSixDQUFXQyxRQUFYLENBQW9CQyxlQUFwQixDQUFvQ0MsU0FBekQ7O0FBRUE7QUFDQSxRQUFNQyxVQUFVLElBQUlDLE9BQUosQ0FBWSxVQUFDQyxPQUFELEVBQVVDLE1BQVYsRUFBcUI7QUFDN0Msd0JBQU1DLFFBQU4sQ0FBZTtBQUNYQyxtQkFBT1YsWUFESTtBQUVYVyxzQkFBVTtBQUFBLHVCQUFPSixRQUFRSyxPQUFPQSxJQUFJQyxRQUFuQixLQUFnQ0wsT0FBT0ksR0FBUCxDQUF2QztBQUFBO0FBRkMsU0FBZjtBQUlILEtBTGUsRUFNZkUsSUFOZSxDQU1WLFVBQUNDLElBQUQsRUFBVTtBQUNaO0FBQ0FBLGVBQU9BLEtBQUtDLEdBQUwsQ0FBUyxVQUFDQyxHQUFEO0FBQUEsbUJBQVUsRUFBRUMsTUFBTUQsSUFBSUMsSUFBWixFQUFrQkMsS0FBS0YsSUFBSUcsT0FBM0IsRUFBb0NDLFVBQVVKLEdBQTlDLEVBQVY7QUFBQSxTQUFULENBQVA7O0FBRUE7QUFDQUYsYUFBS08sT0FBTCxDQUFhLGVBQU87QUFDaEIsZ0JBQUlMLElBQUlDLElBQUosS0FBYSxPQUFqQixFQUEwQjtBQUFFLHNCQUFNSCxJQUFOO0FBQWE7QUFDNUMsU0FGRDs7QUFJQSxlQUFPQSxJQUFQO0FBQ0gsS0FoQmUsQ0FBaEI7O0FBa0JBLFdBQU9WLE9BQVA7QUFDSCxDQXZCRDs7QUF5QkE7QUFDQTs7a0JBRWU7QUFDWGtCLFVBQU0sSUFESztBQUVYQyxXQUFPLENBQ0gsRUFBRUQsTUFBTSxhQUFSLEVBQXVCRSxJQUFJM0IsV0FBM0IsRUFERztBQUZJLEMiLCJmaWxlIjoidzMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG4vKiBnbG9iYWwgUHJvbWlzZSAqL1xuXG5pbXBvcnQgdzNjanMgZnJvbSAndzNjanMnO1xuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEZ1bmN0aW9uc1xuXG4vKipcbiAqIENoZWNrcyBpZiBpcyBjb21wbGlhbnRcbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gcmVxXG4gKiBAcmV0dXJuc1xuICovXG5jb25zdCBpc0NvbXBsaWFudCA9IChyZXEpID0+IHtcbiAgICBjb25zdCBkb2N1bWVudEh0bWwgPSByZXEud2luZG93LmRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5vdXRlckhUTUw7XG5cbiAgICAvLyBOb3cgbGV0cyB2YWxpZGF0ZVxuICAgIGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIHczY2pzLnZhbGlkYXRlKHtcbiAgICAgICAgICAgIGlucHV0OiBkb2N1bWVudEh0bWwsXG4gICAgICAgICAgICBjYWxsYmFjazogcmVzID0+IHJlc29sdmUocmVzICYmIHJlcy5tZXNzYWdlcykgfHwgcmVqZWN0KHJlcylcbiAgICAgICAgfSk7XG4gICAgfSlcbiAgICAudGhlbigoZGF0YSkgPT4ge1xuICAgICAgICAvLyBQYXJzZSBpdCBhcyB3ZSBleHBlY3QgaXRcbiAgICAgICAgZGF0YSA9IGRhdGEubWFwKCh2YWwpID0+ICh7IHR5cGU6IHZhbC50eXBlLCBtc2c6IHZhbC5tZXNzYWdlLCBvcmlnaW5hbDogdmFsIH0pKTtcblxuICAgICAgICAvLyBMZXRzIHNlZSBpZiB0aGVyZSBpcyBhbnkgZXJyb3JcbiAgICAgICAgZGF0YS5mb3JFYWNoKHZhbCA9PiB7XG4gICAgICAgICAgICBpZiAodmFsLnR5cGUgPT09ICdlcnJvcicpIHsgdGhyb3cgZGF0YTsgfVxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gZGF0YTtcbiAgICB9KTtcblxuICAgIHJldHVybiBwcm9taXNlO1xufTtcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBFeHBvcnRcblxuZXhwb3J0IGRlZmF1bHQge1xuICAgIG5hbWU6ICd3MycsXG4gICAgcnVsZXM6IFtcbiAgICAgICAgeyBuYW1lOiAnaXNDb21wbGlhbnQnLCBmbjogaXNDb21wbGlhbnQgfVxuICAgIF1cbn07XG4iXX0=