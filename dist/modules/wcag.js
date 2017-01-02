'use strict';
/* global Promise */

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

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
    var apiUrl = 'http://achecker.ca/checkacc.php?uri=[[url]]&id=[[id]]&output=rest&guide=[[guide]]&offset=[[offset]]';
    var url = '';
    var offset = 10;
    var id = '';
    var guide = req.guide.join(',');
    var reqUrl = apiUrl.replace('[[url]]', url).replace('[[offset]]', offset).replace('[[id]]', id).replace('[[guide]]', guide);

    // Now lets validate
    var promise = new Promise(function (resolve, reject) {
        if (!id) {
            return reject('An id is always required!');
        }

        (0, _request2.default)(reqUrl, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                resolve(body);
            }

            reject(error);
        });
    }).then(function (data) {
        /* eslint-disable no-console */
        console.log(data);
        /* eslint-enable no-console */

        return data;
    });

    return promise;
};

//-------------------------------------
// Export

exports.default = {
    name: 'wcag',
    rules: [{ name: 'isCompliant', fn: isCompliant }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2R1bGVzL3djYWcuanMiXSwibmFtZXMiOlsiaXNDb21wbGlhbnQiLCJyZXEiLCJhcGlVcmwiLCJ1cmwiLCJvZmZzZXQiLCJpZCIsImd1aWRlIiwiam9pbiIsInJlcVVybCIsInJlcGxhY2UiLCJwcm9taXNlIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJlcnJvciIsInJlc3BvbnNlIiwiYm9keSIsInN0YXR1c0NvZGUiLCJ0aGVuIiwiZGF0YSIsImNvbnNvbGUiLCJsb2ciLCJuYW1lIiwicnVsZXMiLCJmbiJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTs7Ozs7O0FBRUE7Ozs7OztBQUVBO0FBQ0E7O0FBRUE7Ozs7OztBQU1BLElBQU1BLGNBQWMsU0FBZEEsV0FBYyxDQUFDQyxHQUFELEVBQVM7QUFDekIsUUFBTUMsU0FBUyxxR0FBZjtBQUNBLFFBQU1DLE1BQU0sRUFBWjtBQUNBLFFBQU1DLFNBQVMsRUFBZjtBQUNBLFFBQU1DLEtBQUssRUFBWDtBQUNBLFFBQU1DLFFBQVFMLElBQUlLLEtBQUosQ0FBVUMsSUFBVixDQUFlLEdBQWYsQ0FBZDtBQUNBLFFBQU1DLFNBQVNOLE9BQU9PLE9BQVAsQ0FBZSxTQUFmLEVBQTBCTixHQUExQixFQUErQk0sT0FBL0IsQ0FBdUMsWUFBdkMsRUFBcURMLE1BQXJELEVBQTZESyxPQUE3RCxDQUFxRSxRQUFyRSxFQUErRUosRUFBL0UsRUFBbUZJLE9BQW5GLENBQTJGLFdBQTNGLEVBQXdHSCxLQUF4RyxDQUFmOztBQUVBO0FBQ0EsUUFBTUksVUFBVSxJQUFJQyxPQUFKLENBQVksVUFBQ0MsT0FBRCxFQUFVQyxNQUFWLEVBQXFCO0FBQzdDLFlBQUksQ0FBQ1IsRUFBTCxFQUFTO0FBQ0wsbUJBQU9RLE9BQU8sMkJBQVAsQ0FBUDtBQUNIOztBQUVELCtCQUFRTCxNQUFSLEVBQWdCLFVBQUNNLEtBQUQsRUFBUUMsUUFBUixFQUFrQkMsSUFBbEIsRUFBMkI7QUFDdkMsZ0JBQUksQ0FBQ0YsS0FBRCxJQUFVQyxTQUFTRSxVQUFULEtBQXdCLEdBQXRDLEVBQTJDO0FBQ3ZDTCx3QkFBUUksSUFBUjtBQUNIOztBQUVESCxtQkFBT0MsS0FBUDtBQUNILFNBTkQ7QUFPSCxLQVplLEVBYWZJLElBYmUsQ0FhVixVQUFDQyxJQUFELEVBQVU7QUFDWjtBQUNBQyxnQkFBUUMsR0FBUixDQUFZRixJQUFaO0FBQ0E7O0FBRUEsZUFBT0EsSUFBUDtBQUNILEtBbkJlLENBQWhCOztBQXFCQSxXQUFPVCxPQUFQO0FBQ0gsQ0EvQkQ7O0FBaUNBO0FBQ0E7O2tCQUVlO0FBQ1hZLFVBQU0sTUFESztBQUVYQyxXQUFPLENBQ0gsRUFBRUQsTUFBTSxhQUFSLEVBQXVCRSxJQUFJeEIsV0FBM0IsRUFERztBQUZJLEMiLCJmaWxlIjoid2NhZy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0Jztcbi8qIGdsb2JhbCBQcm9taXNlICovXG5cbmltcG9ydCByZXF1ZXN0IGZyb20gJ3JlcXVlc3QnO1xuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEZ1bmN0aW9uc1xuXG4vKipcbiAqIENoZWNrcyBpZiBpcyBjb21wbGlhbnRcbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gcmVxXG4gKiBAcmV0dXJuc1xuICovXG5jb25zdCBpc0NvbXBsaWFudCA9IChyZXEpID0+IHtcbiAgICBjb25zdCBhcGlVcmwgPSAnaHR0cDovL2FjaGVja2VyLmNhL2NoZWNrYWNjLnBocD91cmk9W1t1cmxdXSZpZD1bW2lkXV0mb3V0cHV0PXJlc3QmZ3VpZGU9W1tndWlkZV1dJm9mZnNldD1bW29mZnNldF1dJztcbiAgICBjb25zdCB1cmwgPSAnJztcbiAgICBjb25zdCBvZmZzZXQgPSAxMDtcbiAgICBjb25zdCBpZCA9ICcnO1xuICAgIGNvbnN0IGd1aWRlID0gcmVxLmd1aWRlLmpvaW4oJywnKTtcbiAgICBjb25zdCByZXFVcmwgPSBhcGlVcmwucmVwbGFjZSgnW1t1cmxdXScsIHVybCkucmVwbGFjZSgnW1tvZmZzZXRdXScsIG9mZnNldCkucmVwbGFjZSgnW1tpZF1dJywgaWQpLnJlcGxhY2UoJ1tbZ3VpZGVdXScsIGd1aWRlKTtcblxuICAgIC8vIE5vdyBsZXRzIHZhbGlkYXRlXG4gICAgY29uc3QgcHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgaWYgKCFpZCkge1xuICAgICAgICAgICAgcmV0dXJuIHJlamVjdCgnQW4gaWQgaXMgYWx3YXlzIHJlcXVpcmVkIScpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVxdWVzdChyZXFVcmwsIChlcnJvciwgcmVzcG9uc2UsIGJvZHkpID0+IHtcbiAgICAgICAgICAgIGlmICghZXJyb3IgJiYgcmVzcG9uc2Uuc3RhdHVzQ29kZSA9PT0gMjAwKSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShib2R5KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgfSk7XG4gICAgfSlcbiAgICAudGhlbigoZGF0YSkgPT4ge1xuICAgICAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby1jb25zb2xlICovXG4gICAgICAgIGNvbnNvbGUubG9nKGRhdGEpO1xuICAgICAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLWNvbnNvbGUgKi9cblxuICAgICAgICByZXR1cm4gZGF0YTtcbiAgICB9KTtcblxuICAgIHJldHVybiBwcm9taXNlO1xufTtcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBFeHBvcnRcblxuZXhwb3J0IGRlZmF1bHQge1xuICAgIG5hbWU6ICd3Y2FnJyxcbiAgICBydWxlczogW1xuICAgICAgICB7IG5hbWU6ICdpc0NvbXBsaWFudCcsIGZuOiBpc0NvbXBsaWFudCB9XG4gICAgXVxufTtcbiJdfQ==