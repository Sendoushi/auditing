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
    var documentHtml = req.domReq.window.document.documentElement.outerHTML;

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2R1bGVzL3czLmpzIl0sIm5hbWVzIjpbImlzQ29tcGxpYW50IiwicmVxIiwiZG9jdW1lbnRIdG1sIiwiZG9tUmVxIiwid2luZG93IiwiZG9jdW1lbnQiLCJkb2N1bWVudEVsZW1lbnQiLCJvdXRlckhUTUwiLCJwcm9taXNlIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJ2YWxpZGF0ZSIsImlucHV0IiwiY2FsbGJhY2siLCJyZXMiLCJtZXNzYWdlcyIsInRoZW4iLCJkYXRhIiwibWFwIiwidmFsIiwic3RhdHVzIiwidHlwZSIsIm1zZyIsIm1lc3NhZ2UiLCJyYXciLCJuYW1lIiwicnVsZXMiLCJmbiJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTs7Ozs7O0FBRUE7Ozs7OztBQUVBO0FBQ0E7O0FBRUE7Ozs7OztBQU1BLElBQU1BLGNBQWMsU0FBZEEsV0FBYyxDQUFDQyxHQUFELEVBQVM7QUFDekIsUUFBTUMsZUFBZUQsSUFBSUUsTUFBSixDQUFXQyxNQUFYLENBQWtCQyxRQUFsQixDQUEyQkMsZUFBM0IsQ0FBMkNDLFNBQWhFOztBQUVBO0FBQ0EsUUFBTUMsVUFBVSxJQUFJQyxPQUFKLENBQVksVUFBQ0MsT0FBRCxFQUFVQyxNQUFWLEVBQXFCO0FBQzdDLHdCQUFNQyxRQUFOLENBQWU7QUFDWEMsbUJBQU9YLFlBREk7QUFFWFksc0JBQVU7QUFBQSx1QkFBT0osUUFBUUssT0FBT0EsSUFBSUMsUUFBbkIsS0FBZ0NMLE9BQU9JLEdBQVAsQ0FBdkM7QUFBQTtBQUZDLFNBQWY7QUFJSCxLQUxlLEVBTWZFLElBTmUsQ0FNVixVQUFDQyxJQUFELEVBQVU7QUFDWjtBQUNBQSxlQUFPQSxLQUFLQyxHQUFMLENBQVMsVUFBQ0MsR0FBRCxFQUFTO0FBQ3JCLGdCQUFNQyxTQUFTRCxJQUFJRSxJQUFKLEtBQWEsT0FBYixHQUF1QixRQUF2QixHQUFrQ0YsSUFBSUUsSUFBckQ7QUFDQSxtQkFBTyxFQUFFRCxjQUFGLEVBQVVFLEtBQUtILElBQUlJLE9BQW5CLEVBQTRCQyxLQUFLTCxHQUFqQyxFQUFQO0FBQ0gsU0FITSxDQUFQOztBQUtBLGVBQU9GLElBQVA7QUFDSCxLQWRlLENBQWhCOztBQWdCQSxXQUFPVixPQUFQO0FBQ0gsQ0FyQkQ7O0FBdUJBO0FBQ0E7O2tCQUVlO0FBQ1hrQixVQUFNLElBREs7QUFFWEMsV0FBTyxDQUNILEVBQUVELE1BQU0sYUFBUixFQUF1QkUsSUFBSTVCLFdBQTNCLEVBREc7QUFGSSxDIiwiZmlsZSI6InczLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuLyogZ2xvYmFsIFByb21pc2UgKi9cblxuaW1wb3J0IHczY2pzIGZyb20gJ3czY2pzJztcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBGdW5jdGlvbnNcblxuLyoqXG4gKiBDaGVja3MgaWYgaXMgY29tcGxpYW50XG4gKlxuICogQHBhcmFtIHtvYmplY3R9IHJlcVxuICogQHJldHVybnNcbiAqL1xuY29uc3QgaXNDb21wbGlhbnQgPSAocmVxKSA9PiB7XG4gICAgY29uc3QgZG9jdW1lbnRIdG1sID0gcmVxLmRvbVJlcS53aW5kb3cuZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50Lm91dGVySFRNTDtcblxuICAgIC8vIE5vdyBsZXRzIHZhbGlkYXRlXG4gICAgY29uc3QgcHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgdzNjanMudmFsaWRhdGUoe1xuICAgICAgICAgICAgaW5wdXQ6IGRvY3VtZW50SHRtbCxcbiAgICAgICAgICAgIGNhbGxiYWNrOiByZXMgPT4gcmVzb2x2ZShyZXMgJiYgcmVzLm1lc3NhZ2VzKSB8fCByZWplY3QocmVzKVxuICAgICAgICB9KTtcbiAgICB9KVxuICAgIC50aGVuKChkYXRhKSA9PiB7XG4gICAgICAgIC8vIFBhcnNlIGl0IGFzIHdlIGV4cGVjdCBpdFxuICAgICAgICBkYXRhID0gZGF0YS5tYXAoKHZhbCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc3RhdHVzID0gdmFsLnR5cGUgPT09ICdlcnJvcicgPyAnZmFpbGVkJyA6IHZhbC50eXBlO1xuICAgICAgICAgICAgcmV0dXJuIHsgc3RhdHVzLCBtc2c6IHZhbC5tZXNzYWdlLCByYXc6IHZhbCB9O1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gZGF0YTtcbiAgICB9KTtcblxuICAgIHJldHVybiBwcm9taXNlO1xufTtcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBFeHBvcnRcblxuZXhwb3J0IGRlZmF1bHQge1xuICAgIG5hbWU6ICd3MycsXG4gICAgcnVsZXM6IFtcbiAgICAgICAgeyBuYW1lOiAnaXNDb21wbGlhbnQnLCBmbjogaXNDb21wbGlhbnQgfVxuICAgIF1cbn07XG4iXX0=