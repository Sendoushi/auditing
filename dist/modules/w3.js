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
            return { type: val.type, msg: val.message, raw: val };
        });

        // Lets see if there is any error
        data.forEach(function (val) {
            if (val.type === 'error') {
                throw val;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2R1bGVzL3czLmpzIl0sIm5hbWVzIjpbImlzQ29tcGxpYW50IiwicmVxIiwiZG9jdW1lbnRIdG1sIiwid2luZG93IiwiZG9jdW1lbnQiLCJkb2N1bWVudEVsZW1lbnQiLCJvdXRlckhUTUwiLCJwcm9taXNlIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJ2YWxpZGF0ZSIsImlucHV0IiwiY2FsbGJhY2siLCJyZXMiLCJtZXNzYWdlcyIsInRoZW4iLCJkYXRhIiwibWFwIiwidmFsIiwidHlwZSIsIm1zZyIsIm1lc3NhZ2UiLCJyYXciLCJmb3JFYWNoIiwibmFtZSIsInJ1bGVzIiwiZm4iXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7Ozs7OztBQUVBOzs7Ozs7QUFFQTtBQUNBOztBQUVBOzs7Ozs7QUFNQSxJQUFNQSxjQUFjLFNBQWRBLFdBQWMsQ0FBQ0MsR0FBRCxFQUFTO0FBQ3pCLFFBQU1DLGVBQWVELElBQUlFLE1BQUosQ0FBV0MsUUFBWCxDQUFvQkMsZUFBcEIsQ0FBb0NDLFNBQXpEOztBQUVBO0FBQ0EsUUFBTUMsVUFBVSxJQUFJQyxPQUFKLENBQVksVUFBQ0MsT0FBRCxFQUFVQyxNQUFWLEVBQXFCO0FBQzdDLHdCQUFNQyxRQUFOLENBQWU7QUFDWEMsbUJBQU9WLFlBREk7QUFFWFcsc0JBQVU7QUFBQSx1QkFBT0osUUFBUUssT0FBT0EsSUFBSUMsUUFBbkIsS0FBZ0NMLE9BQU9JLEdBQVAsQ0FBdkM7QUFBQTtBQUZDLFNBQWY7QUFJSCxLQUxlLEVBTWZFLElBTmUsQ0FNVixVQUFDQyxJQUFELEVBQVU7QUFDWjtBQUNBQSxlQUFPQSxLQUFLQyxHQUFMLENBQVMsVUFBQ0MsR0FBRDtBQUFBLG1CQUFVLEVBQUVDLE1BQU1ELElBQUlDLElBQVosRUFBa0JDLEtBQUtGLElBQUlHLE9BQTNCLEVBQW9DQyxLQUFLSixHQUF6QyxFQUFWO0FBQUEsU0FBVCxDQUFQOztBQUVBO0FBQ0FGLGFBQUtPLE9BQUwsQ0FBYSxlQUFPO0FBQUUsZ0JBQUlMLElBQUlDLElBQUosS0FBYSxPQUFqQixFQUEwQjtBQUFFLHNCQUFNRCxHQUFOO0FBQVk7QUFBRSxTQUFoRTs7QUFFQSxlQUFPRixJQUFQO0FBQ0gsS0FkZSxDQUFoQjs7QUFnQkEsV0FBT1YsT0FBUDtBQUNILENBckJEOztBQXVCQTtBQUNBOztrQkFFZTtBQUNYa0IsVUFBTSxJQURLO0FBRVhDLFdBQU8sQ0FDSCxFQUFFRCxNQUFNLGFBQVIsRUFBdUJFLElBQUkzQixXQUEzQixFQURHO0FBRkksQyIsImZpbGUiOiJ3My5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0Jztcbi8qIGdsb2JhbCBQcm9taXNlICovXG5cbmltcG9ydCB3M2NqcyBmcm9tICd3M2Nqcyc7XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gRnVuY3Rpb25zXG5cbi8qKlxuICogQ2hlY2tzIGlmIGlzIGNvbXBsaWFudFxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSByZXFcbiAqIEByZXR1cm5zXG4gKi9cbmNvbnN0IGlzQ29tcGxpYW50ID0gKHJlcSkgPT4ge1xuICAgIGNvbnN0IGRvY3VtZW50SHRtbCA9IHJlcS53aW5kb3cuZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50Lm91dGVySFRNTDtcblxuICAgIC8vIE5vdyBsZXRzIHZhbGlkYXRlXG4gICAgY29uc3QgcHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgdzNjanMudmFsaWRhdGUoe1xuICAgICAgICAgICAgaW5wdXQ6IGRvY3VtZW50SHRtbCxcbiAgICAgICAgICAgIGNhbGxiYWNrOiByZXMgPT4gcmVzb2x2ZShyZXMgJiYgcmVzLm1lc3NhZ2VzKSB8fCByZWplY3QocmVzKVxuICAgICAgICB9KTtcbiAgICB9KVxuICAgIC50aGVuKChkYXRhKSA9PiB7XG4gICAgICAgIC8vIFBhcnNlIGl0IGFzIHdlIGV4cGVjdCBpdFxuICAgICAgICBkYXRhID0gZGF0YS5tYXAoKHZhbCkgPT4gKHsgdHlwZTogdmFsLnR5cGUsIG1zZzogdmFsLm1lc3NhZ2UsIHJhdzogdmFsIH0pKTtcblxuICAgICAgICAvLyBMZXRzIHNlZSBpZiB0aGVyZSBpcyBhbnkgZXJyb3JcbiAgICAgICAgZGF0YS5mb3JFYWNoKHZhbCA9PiB7IGlmICh2YWwudHlwZSA9PT0gJ2Vycm9yJykgeyB0aHJvdyB2YWw7IH0gfSk7XG5cbiAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gcHJvbWlzZTtcbn07XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gRXhwb3J0XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgICBuYW1lOiAndzMnLFxuICAgIHJ1bGVzOiBbXG4gICAgICAgIHsgbmFtZTogJ2lzQ29tcGxpYW50JywgZm46IGlzQ29tcGxpYW50IH1cbiAgICBdXG59O1xuIl19