'use strict';
/* global Promise */

//-------------------------------------
// Functions

// function gmetrix() {
// TODO: ...
// }

/**
 * Checks if is compliant
 *
 * @param {object} req
 * @returns
 */

Object.defineProperty(exports, "__esModule", {
    value: true
});
var hasCanonical = function hasCanonical(req) {
    // Now lets validate
    var promise = new Promise(function (resolve, reject) {
        var links = req.window.$('link');
        var hasIt = void 0;

        // Lets see if one of these is a canonical one
        links.each(function (i, val) {
            hasIt = hasIt || val.getAttribute('rel') === 'canonical';
        });

        if (!!hasIt) {
            resolve(true);
        } else {
            reject(false);
        }
    });

    return promise;
};

//-------------------------------------
// Export

exports.default = {
    name: 'seo',
    rules: [{ name: 'hasCanonical', fn: hasCanonical }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2R1bGVzL3Nlby5qcyJdLCJuYW1lcyI6WyJoYXNDYW5vbmljYWwiLCJyZXEiLCJwcm9taXNlIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJsaW5rcyIsIndpbmRvdyIsIiQiLCJoYXNJdCIsImVhY2giLCJpIiwidmFsIiwiZ2V0QXR0cmlidXRlIiwibmFtZSIsInJ1bGVzIiwiZm4iXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7Ozs7Ozs7Ozs7QUFNQSxJQUFNQSxlQUFlLFNBQWZBLFlBQWUsQ0FBQ0MsR0FBRCxFQUFTO0FBQzFCO0FBQ0EsUUFBTUMsVUFBVSxJQUFJQyxPQUFKLENBQVksVUFBQ0MsT0FBRCxFQUFVQyxNQUFWLEVBQXFCO0FBQzdDLFlBQU1DLFFBQVFMLElBQUlNLE1BQUosQ0FBV0MsQ0FBWCxDQUFhLE1BQWIsQ0FBZDtBQUNBLFlBQUlDLGNBQUo7O0FBRUE7QUFDQUgsY0FBTUksSUFBTixDQUFXLFVBQUNDLENBQUQsRUFBSUMsR0FBSixFQUFZO0FBQ25CSCxvQkFBUUEsU0FBU0csSUFBSUMsWUFBSixDQUFpQixLQUFqQixNQUE0QixXQUE3QztBQUNILFNBRkQ7O0FBSUEsWUFBSSxDQUFDLENBQUNKLEtBQU4sRUFBYTtBQUFFTCxvQkFBUSxJQUFSO0FBQWdCLFNBQS9CLE1BQXFDO0FBQUVDLG1CQUFPLEtBQVA7QUFBZ0I7QUFDMUQsS0FWZSxDQUFoQjs7QUFZQSxXQUFPSCxPQUFQO0FBQ0gsQ0FmRDs7QUFpQkE7QUFDQTs7a0JBRWU7QUFDWFksVUFBTSxLQURLO0FBRVhDLFdBQU8sQ0FDSCxFQUFFRCxNQUFNLGNBQVIsRUFBd0JFLElBQUloQixZQUE1QixFQURHO0FBRkksQyIsImZpbGUiOiJzZW8uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG4vKiBnbG9iYWwgUHJvbWlzZSAqL1xuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEZ1bmN0aW9uc1xuXG4vLyBmdW5jdGlvbiBnbWV0cml4KCkge1xuLy8gVE9ETzogLi4uXG4vLyB9XG5cbi8qKlxuICogQ2hlY2tzIGlmIGlzIGNvbXBsaWFudFxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSByZXFcbiAqIEByZXR1cm5zXG4gKi9cbmNvbnN0IGhhc0Nhbm9uaWNhbCA9IChyZXEpID0+IHtcbiAgICAvLyBOb3cgbGV0cyB2YWxpZGF0ZVxuICAgIGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGNvbnN0IGxpbmtzID0gcmVxLndpbmRvdy4kKCdsaW5rJyk7XG4gICAgICAgIGxldCBoYXNJdDtcblxuICAgICAgICAvLyBMZXRzIHNlZSBpZiBvbmUgb2YgdGhlc2UgaXMgYSBjYW5vbmljYWwgb25lXG4gICAgICAgIGxpbmtzLmVhY2goKGksIHZhbCkgPT4ge1xuICAgICAgICAgICAgaGFzSXQgPSBoYXNJdCB8fCB2YWwuZ2V0QXR0cmlidXRlKCdyZWwnKSA9PT0gJ2Nhbm9uaWNhbCc7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmICghIWhhc0l0KSB7IHJlc29sdmUodHJ1ZSk7IH0gZWxzZSB7IHJlamVjdChmYWxzZSk7IH1cbiAgICB9KTtcblxuICAgIHJldHVybiBwcm9taXNlO1xufTtcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBFeHBvcnRcblxuZXhwb3J0IGRlZmF1bHQge1xuICAgIG5hbWU6ICdzZW8nLFxuICAgIHJ1bGVzOiBbXG4gICAgICAgIHsgbmFtZTogJ2hhc0Nhbm9uaWNhbCcsIGZuOiBoYXNDYW5vbmljYWwgfVxuICAgIF1cbn07XG4iXX0=