'use strict';
/* global Promise */

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _chromeLauncher = require('lighthouse/lighthouse-cli/chrome-launcher.js');

var _chromeLauncher2 = _interopRequireDefault(_chromeLauncher);

var _lighthouse = require('lighthouse');

var _lighthouse2 = _interopRequireDefault(_lighthouse);

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
    // Lighthouse doesn't complies with strings and as suchs needs the url
    var url = typeof req.requestUrl === 'string' ? req.requestUrl : req.requestUrl[0];

    // Now lets validate
    var launcher = new _chromeLauncher2.default.ChromeLauncher({
        port: 9222,
        autoSelectChrome: true
    });
    var cacheData = void 0;

    // Perform...
    return launcher.isDebuggerReady().catch(function () {
        /* eslint-disable no-console */
        console.log('Lighthouse', 'Launching Chrome...');
        /* eslint-enable no-console */
        return launcher.run();
    }).then(function () {
        return (0, _lighthouse2.default)(url, { output: 'json' });
    }).then(function (data) {
        cacheData = data.audits;
        return data;
    }).then(function () {
        return launcher.kill();
    }).then(function () {
        var keys = Object.keys(cacheData);
        var hasError = false;

        // Lets see if all is compliant
        for (var i = 0; i < keys.length; i += 1) {
            if (cacheData[keys[i]].score === false) {
                hasError = true;
                break;
            }
        }

        if (hasError) {
            throw cacheData;
        }

        return cacheData;
    });
};

//-------------------------------------
// Export

exports.default = {
    name: 'lighthouse',
    rules: [{ name: 'isCompliant', fn: isCompliant }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2R1bGVzL2xpZ2h0aG91c2UuanMiXSwibmFtZXMiOlsiaXNDb21wbGlhbnQiLCJyZXEiLCJ1cmwiLCJyZXF1ZXN0VXJsIiwibGF1bmNoZXIiLCJDaHJvbWVMYXVuY2hlciIsInBvcnQiLCJhdXRvU2VsZWN0Q2hyb21lIiwiY2FjaGVEYXRhIiwiaXNEZWJ1Z2dlclJlYWR5IiwiY2F0Y2giLCJjb25zb2xlIiwibG9nIiwicnVuIiwidGhlbiIsIm91dHB1dCIsImRhdGEiLCJhdWRpdHMiLCJraWxsIiwia2V5cyIsIk9iamVjdCIsImhhc0Vycm9yIiwiaSIsImxlbmd0aCIsInNjb3JlIiwibmFtZSIsInJ1bGVzIiwiZm4iXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7Ozs7OztBQUVBOzs7O0FBQ0E7Ozs7OztBQUVBO0FBQ0E7O0FBRUE7Ozs7OztBQU1BLElBQU1BLGNBQWMsU0FBZEEsV0FBYyxDQUFDQyxHQUFELEVBQVM7QUFDekI7QUFDQSxRQUFNQyxNQUFNLE9BQU9ELElBQUlFLFVBQVgsS0FBMEIsUUFBMUIsR0FBcUNGLElBQUlFLFVBQXpDLEdBQXNERixJQUFJRSxVQUFKLENBQWUsQ0FBZixDQUFsRTs7QUFFQTtBQUNBLFFBQU1DLFdBQVcsSUFBSSx5QkFBZUMsY0FBbkIsQ0FBa0M7QUFDL0NDLGNBQU0sSUFEeUM7QUFFL0NDLDBCQUFrQjtBQUY2QixLQUFsQyxDQUFqQjtBQUlBLFFBQUlDLGtCQUFKOztBQUVBO0FBQ0EsV0FBT0osU0FBU0ssZUFBVCxHQUEyQkMsS0FBM0IsQ0FBaUMsWUFBTTtBQUMxQztBQUNBQyxnQkFBUUMsR0FBUixDQUFZLFlBQVosRUFBMEIscUJBQTFCO0FBQ0E7QUFDQSxlQUFPUixTQUFTUyxHQUFULEVBQVA7QUFDSCxLQUxNLEVBTU5DLElBTk0sQ0FNRDtBQUFBLGVBQU0sMEJBQVdaLEdBQVgsRUFBZ0IsRUFBRWEsUUFBUSxNQUFWLEVBQWhCLENBQU47QUFBQSxLQU5DLEVBT05ELElBUE0sQ0FPRCxVQUFDRSxJQUFELEVBQVU7QUFDWlIsb0JBQVlRLEtBQUtDLE1BQWpCO0FBQ0EsZUFBT0QsSUFBUDtBQUNILEtBVk0sRUFXTkYsSUFYTSxDQVdEO0FBQUEsZUFBTVYsU0FBU2MsSUFBVCxFQUFOO0FBQUEsS0FYQyxFQVlOSixJQVpNLENBWUQsWUFBTTtBQUNSLFlBQU1LLE9BQU9DLE9BQU9ELElBQVAsQ0FBWVgsU0FBWixDQUFiO0FBQ0EsWUFBSWEsV0FBVyxLQUFmOztBQUVBO0FBQ0EsYUFBSyxJQUFJQyxJQUFJLENBQWIsRUFBZ0JBLElBQUlILEtBQUtJLE1BQXpCLEVBQWlDRCxLQUFLLENBQXRDLEVBQXlDO0FBQ3JDLGdCQUFJZCxVQUFVVyxLQUFLRyxDQUFMLENBQVYsRUFBbUJFLEtBQW5CLEtBQTZCLEtBQWpDLEVBQXdDO0FBQ3BDSCwyQkFBVyxJQUFYO0FBQ0E7QUFDSDtBQUNKOztBQUVELFlBQUlBLFFBQUosRUFBYztBQUFFLGtCQUFNYixTQUFOO0FBQWtCOztBQUVsQyxlQUFPQSxTQUFQO0FBQ0gsS0EzQk0sQ0FBUDtBQTRCSCxDQXhDRDs7QUEwQ0E7QUFDQTs7a0JBRWU7QUFDWGlCLFVBQU0sWUFESztBQUVYQyxXQUFPLENBQ0gsRUFBRUQsTUFBTSxhQUFSLEVBQXVCRSxJQUFJM0IsV0FBM0IsRUFERztBQUZJLEMiLCJmaWxlIjoibGlnaHRob3VzZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0Jztcbi8qIGdsb2JhbCBQcm9taXNlICovXG5cbmltcG9ydCBjaHJvbWVMYXVuY2hlciBmcm9tICdsaWdodGhvdXNlL2xpZ2h0aG91c2UtY2xpL2Nocm9tZS1sYXVuY2hlci5qcyc7XG5pbXBvcnQgbGlnaHRob3VzZSBmcm9tICdsaWdodGhvdXNlJztcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBGdW5jdGlvbnNcblxuLyoqXG4gKiBDaGVja3MgaWYgaXMgY29tcGxpYW50XG4gKlxuICogQHBhcmFtIHtvYmplY3R9IHJlcVxuICogQHJldHVybnNcbiAqL1xuY29uc3QgaXNDb21wbGlhbnQgPSAocmVxKSA9PiB7XG4gICAgLy8gTGlnaHRob3VzZSBkb2Vzbid0IGNvbXBsaWVzIHdpdGggc3RyaW5ncyBhbmQgYXMgc3VjaHMgbmVlZHMgdGhlIHVybFxuICAgIGNvbnN0IHVybCA9IHR5cGVvZiByZXEucmVxdWVzdFVybCA9PT0gJ3N0cmluZycgPyByZXEucmVxdWVzdFVybCA6IHJlcS5yZXF1ZXN0VXJsWzBdO1xuXG4gICAgLy8gTm93IGxldHMgdmFsaWRhdGVcbiAgICBjb25zdCBsYXVuY2hlciA9IG5ldyBjaHJvbWVMYXVuY2hlci5DaHJvbWVMYXVuY2hlcih7XG4gICAgICAgIHBvcnQ6IDkyMjIsXG4gICAgICAgIGF1dG9TZWxlY3RDaHJvbWU6IHRydWVcbiAgICB9KTtcbiAgICBsZXQgY2FjaGVEYXRhO1xuXG4gICAgLy8gUGVyZm9ybS4uLlxuICAgIHJldHVybiBsYXVuY2hlci5pc0RlYnVnZ2VyUmVhZHkoKS5jYXRjaCgoKSA9PiB7XG4gICAgICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLWNvbnNvbGUgKi9cbiAgICAgICAgY29uc29sZS5sb2coJ0xpZ2h0aG91c2UnLCAnTGF1bmNoaW5nIENocm9tZS4uLicpO1xuICAgICAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLWNvbnNvbGUgKi9cbiAgICAgICAgcmV0dXJuIGxhdW5jaGVyLnJ1bigpO1xuICAgIH0pXG4gICAgLnRoZW4oKCkgPT4gbGlnaHRob3VzZSh1cmwsIHsgb3V0cHV0OiAnanNvbicgfSkpXG4gICAgLnRoZW4oKGRhdGEpID0+IHtcbiAgICAgICAgY2FjaGVEYXRhID0gZGF0YS5hdWRpdHM7XG4gICAgICAgIHJldHVybiBkYXRhO1xuICAgIH0pXG4gICAgLnRoZW4oKCkgPT4gbGF1bmNoZXIua2lsbCgpKVxuICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKGNhY2hlRGF0YSk7XG4gICAgICAgIGxldCBoYXNFcnJvciA9IGZhbHNlO1xuXG4gICAgICAgIC8vIExldHMgc2VlIGlmIGFsbCBpcyBjb21wbGlhbnRcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICBpZiAoY2FjaGVEYXRhW2tleXNbaV1dLnNjb3JlID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIGhhc0Vycm9yID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChoYXNFcnJvcikgeyB0aHJvdyBjYWNoZURhdGE7IH1cblxuICAgICAgICByZXR1cm4gY2FjaGVEYXRhO1xuICAgIH0pO1xufTtcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBFeHBvcnRcblxuZXhwb3J0IGRlZmF1bHQge1xuICAgIG5hbWU6ICdsaWdodGhvdXNlJyxcbiAgICBydWxlczogW1xuICAgICAgICB7IG5hbWU6ICdpc0NvbXBsaWFudCcsIGZuOiBpc0NvbXBsaWFudCB9XG4gICAgXVxufTtcbiJdfQ==