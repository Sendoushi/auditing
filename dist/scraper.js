'use strict';
/* global Promise */

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getUrlMarkup = exports.getDom = exports.run = undefined;

var _jsdom = require('jsdom');

var _jsdom2 = _interopRequireDefault(_jsdom);

var _resourceLoader = require('jsdom/lib/jsdom/browser/resource-loader');

var _resourceLoader2 = _interopRequireDefault(_resourceLoader);

var _toughCookie = require('tough-cookie');

var _toughCookie2 = _interopRequireDefault(_toughCookie);

var _utils = require('./utils.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//-------------------------------------
// Functions

/**
 * Gets url markup
 *
 * @param {string} url
 * @returns {promise}
 */
var getUrlMarkup = function getUrlMarkup(url) {
    return new Promise(function (resolve, reject) {
        if (typeof url !== 'string') {
            throw new Error('Url needs to be a string');
        }

        var options = {
            defaultEncoding: 'windows-1252',
            detectMetaCharset: true,
            // headers: config.headers,
            pool: {
                maxSockets: 6
            },
            strictSSL: true,
            // proxy: config.proxy,
            cookieJar: new _toughCookie2.default.CookieJar(null, { looseMode: true }),
            userAgent: 'Node.js (' + process.platform + '; U; rv:' + process.version + ') AppleWebKit/537.36 (KHTML, like Gecko)',
            // agent: config.agent,
            // agentClass: config.agentClass,
            agentOptions: {
                keepAlive: true,
                keepAliveMsecs: 115 * 1000
            }
        };

        // Finally download it!
        _resourceLoader2.default.download(url, options, function (err, responseText) {
            if (err) {
                return reject(err);
            }

            resolve(responseText);
        });
    });
};

/**
 * Get request urls
 *
 * @param {array|string} urls
 * @param {string} base
 * @param {string} baseEnv
 * @returns {array}
 */
var getReqUrls = function getReqUrls(urls, base, baseEnv) {
    baseEnv = baseEnv && process.env[baseEnv];
    base = baseEnv || base;

    urls = typeof urls === 'string' ? [urls] : urls;
    urls = urls.map(function (url) {
        var reqUrl = url;

        // Lets set the bases
        if (base) {
            if (base[base.length - 1] !== '/' && url[0] !== '/') {
                base += '/';
            } else if (base[base.length - 1] === '/' && url[0] === '/') {
                base = base.substring(0, base.length - 1);
            }

            reqUrl = base + reqUrl;
        }

        // Construct object
        return { requestSrc: reqUrl, originalSrc: url };
    });

    return urls;
};

/**
 * Gets DOM from url
 *
 * @param {string} src
 * @param {string|object} type
 * @returns {promise}
 */
var getDom = function getDom(src, type) {
    type = typeof type === 'string' ? { of: type } : type;

    var promise = new Promise(function (resolve, reject) {
        // Need to check if url is ok
        if (type.of === 'url' && !(0, _utils.isUrl)(src)) {
            return reject(new Error('Url not valid'));
        }

        resolve();
    }).then(function () {
        // It is already markup
        if (type.of === 'content' || type.of === 'file') {
            return src;
        }

        // Lets get the markup
        return getUrlMarkup(src);
    }).then(function (markup) {
        return new Promise(function (resolve, reject) {
            // Lets force markup to have jquery
            // This is accepted by jsdom.jsdom and jsdom.env
            var jqueryScript = '<script type="text/javascript" src="http://code.jquery.com/jquery.js"></script>';
            if (markup.indexOf('<head>') !== -1) {
                markup = markup.replace('<head>', '<head>' + jqueryScript);
            } else if (markup.indexOf('<body>') !== -1) {
                markup = markup.replace('<body>', '<body>' + jqueryScript);
            }

            // Prepare for possible errors
            var virtualConsole = _jsdom2.default.createVirtualConsole();
            var errors = [];
            var logs = [];
            var warns = [];

            virtualConsole.on('jsdomError', function (error) {
                errors.push(error);
            });
            virtualConsole.on('error', function (error) {
                errors.push(error);
            });
            virtualConsole.on('log', function (log) {
                logs.push(log);
            });
            virtualConsole.on('warn', function (warn) {
                warns.push(warn);
            });

            // Config
            var config = {
                html: markup,
                virtualConsole: virtualConsole,
                features: {
                    FetchExternalResources: ['script', 'link'],
                    ProcessExternalResources: ['script'],
                    SkipExternalResources: false
                },
                done: function done(err, window) {
                    if (err) {
                        return reject(err);
                    }
                    resolve({ window: window, errors: errors, logs: logs, warns: warns, preMarkup: markup });
                }
            };

            // Now for the actual getting
            _jsdom2.default.env(config);
        });
    });

    return promise;
};

/**
 * Scrapes
 *
 * @param  {object} data
 * @returns {promise}
 */
var run = function run(data) {
    var src = typeof data.src === 'string' ? [data.src] : data.src;
    var type = typeof data.type === 'string' ? { of: data.type } : data.type;
    var reqSrc = src;

    // Lets parse sources into what we're expecting
    if (type.of === 'url') {
        reqSrc = getReqUrls(reqSrc, type.base, type.baseEnv);
    } else if (type.of === 'file') {
        reqSrc = reqSrc.map(function (val) {
            return { requestSrc: require((0, _utils.getPwd)(val)), originalSrc: val };
        });
    } else {
        reqSrc = reqSrc.map(function (val) {
            return { requestSrc: val, originalSrc: val };
        });
    }

    // Finally lets set the promises
    var urlsPromises = reqSrc.map(function (req) {
        return getDom(req.requestSrc, type).then(function (domReq) {
            req.domReq = domReq;
            return req;
        }).catch(function (err) {
            req.err = err;
            throw req;
        });
    });

    return Promise.all(urlsPromises);
};

// --------------------------------
// Export

exports.run = run;
exports.getDom = getDom;
exports.getUrlMarkup = getUrlMarkup;

// Essentially for testing purposes
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zY3JhcGVyLmpzIl0sIm5hbWVzIjpbImdldFVybE1hcmt1cCIsInVybCIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwiRXJyb3IiLCJvcHRpb25zIiwiZGVmYXVsdEVuY29kaW5nIiwiZGV0ZWN0TWV0YUNoYXJzZXQiLCJwb29sIiwibWF4U29ja2V0cyIsInN0cmljdFNTTCIsImNvb2tpZUphciIsIkNvb2tpZUphciIsImxvb3NlTW9kZSIsInVzZXJBZ2VudCIsInByb2Nlc3MiLCJwbGF0Zm9ybSIsInZlcnNpb24iLCJhZ2VudE9wdGlvbnMiLCJrZWVwQWxpdmUiLCJrZWVwQWxpdmVNc2VjcyIsImRvd25sb2FkIiwiZXJyIiwicmVzcG9uc2VUZXh0IiwiZ2V0UmVxVXJscyIsInVybHMiLCJiYXNlIiwiYmFzZUVudiIsImVudiIsIm1hcCIsInJlcVVybCIsImxlbmd0aCIsInN1YnN0cmluZyIsInJlcXVlc3RTcmMiLCJvcmlnaW5hbFNyYyIsImdldERvbSIsInNyYyIsInR5cGUiLCJvZiIsInByb21pc2UiLCJ0aGVuIiwianF1ZXJ5U2NyaXB0IiwibWFya3VwIiwiaW5kZXhPZiIsInJlcGxhY2UiLCJ2aXJ0dWFsQ29uc29sZSIsImNyZWF0ZVZpcnR1YWxDb25zb2xlIiwiZXJyb3JzIiwibG9ncyIsIndhcm5zIiwib24iLCJwdXNoIiwiZXJyb3IiLCJsb2ciLCJ3YXJuIiwiY29uZmlnIiwiaHRtbCIsImZlYXR1cmVzIiwiRmV0Y2hFeHRlcm5hbFJlc291cmNlcyIsIlByb2Nlc3NFeHRlcm5hbFJlc291cmNlcyIsIlNraXBFeHRlcm5hbFJlc291cmNlcyIsImRvbmUiLCJ3aW5kb3ciLCJwcmVNYXJrdXAiLCJydW4iLCJkYXRhIiwicmVxU3JjIiwicmVxdWlyZSIsInZhbCIsInVybHNQcm9taXNlcyIsInJlcSIsImRvbVJlcSIsImNhdGNoIiwiYWxsIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBOzs7Ozs7O0FBRUE7Ozs7QUFDQTs7OztBQUNB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QlcsS0FBS1YsT0FBbkMsQ0FBVDtBQUNILEtBRkQsTUFFTyxJQUFJVSxLQUFLQyxFQUFMLEtBQVksTUFBaEIsRUFBd0I7QUFDM0I0QixpQkFBU0EsT0FBT3JDLEdBQVAsQ0FBVztBQUFBLG1CQUFRLEVBQUVJLFlBQVlrQyxRQUFRLG1CQUFPQyxHQUFQLENBQVIsQ0FBZCxFQUFvQ2xDLGFBQWFrQyxHQUFqRCxFQUFSO0FBQUEsU0FBWCxDQUFUO0FBQ0gsS0FGTSxNQUVBO0FBQ0hGLGlCQUFTQSxPQUFPckMsR0FBUCxDQUFXO0FBQUEsbUJBQVEsRUFBRUksWUFBWW1DLEdBQWQsRUFBbUJsQyxhQUFha0MsR0FBaEMsRUFBUjtBQUFBLFNBQVgsQ0FBVDtBQUNIOztBQUVEO0FBQ0EsUUFBTUMsZUFBZUgsT0FBT3JDLEdBQVAsQ0FBVyxVQUFDeUMsR0FBRDtBQUFBLGVBQVNuQyxPQUFPbUMsSUFBSXJDLFVBQVgsRUFBdUJJLElBQXZCLEVBQ3hDRyxJQUR3QyxDQUNuQyxVQUFDK0IsTUFBRCxFQUFZO0FBQ2RELGdCQUFJQyxNQUFKLEdBQWFBLE1BQWI7QUFDQSxtQkFBT0QsR0FBUDtBQUNILFNBSndDLEVBS3hDRSxLQUx3QyxDQUtsQyxVQUFDbEQsR0FBRCxFQUFTO0FBQ1pnRCxnQkFBSWhELEdBQUosR0FBVUEsR0FBVjtBQUNBLGtCQUFNZ0QsR0FBTjtBQUNILFNBUndDLENBQVQ7QUFBQSxLQUFYLENBQXJCOztBQVVBLFdBQU9yRSxRQUFRd0UsR0FBUixDQUFZSixZQUFaLENBQVA7QUFDSCxDQTFCRDs7QUE0QkE7QUFDQTs7UUFFU0wsRyxHQUFBQSxHO1FBQ0E3QixNLEdBQUFBLE07UUFDQXBDLFksR0FBQUEsWTs7QUFFVCIsImZpbGUiOiJzY3JhcGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuLyogZ2xvYmFsIFByb21pc2UgKi9cblxuaW1wb3J0IGpzZG9tIGZyb20gJ2pzZG9tJztcbmltcG9ydCByZXNvdXJjZUxvYWRlciBmcm9tICdqc2RvbS9saWIvanNkb20vYnJvd3Nlci9yZXNvdXJjZS1sb2FkZXInO1xuaW1wb3J0IHRvdWdoQ29va2llIGZyb20gJ3RvdWdoLWNvb2tpZSc7XG5pbXBvcnQgeyBpc1VybCB9IGZyb20gJy4vdXRpbHMuanMnO1xuaW1wb3J0IHsgZ2V0UHdkIH0gZnJvbSAnLi91dGlscy5qcyc7XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gRnVuY3Rpb25zXG5cbi8qKlxuICogR2V0cyB1cmwgbWFya3VwXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHVybFxuICogQHJldHVybnMge3Byb21pc2V9XG4gKi9cbmNvbnN0IGdldFVybE1hcmt1cCA9ICh1cmwpID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBpZiAodHlwZW9mIHVybCAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVcmwgbmVlZHMgdG8gYmUgYSBzdHJpbmcnKTtcbiAgICB9XG5cbiAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgICBkZWZhdWx0RW5jb2Rpbmc6ICd3aW5kb3dzLTEyNTInLFxuICAgICAgICBkZXRlY3RNZXRhQ2hhcnNldDogdHJ1ZSxcbiAgICAgICAgLy8gaGVhZGVyczogY29uZmlnLmhlYWRlcnMsXG4gICAgICAgIHBvb2w6IHtcbiAgICAgICAgICAgIG1heFNvY2tldHM6IDZcbiAgICAgICAgfSxcbiAgICAgICAgc3RyaWN0U1NMOiB0cnVlLFxuICAgICAgICAvLyBwcm94eTogY29uZmlnLnByb3h5LFxuICAgICAgICBjb29raWVKYXI6IG5ldyB0b3VnaENvb2tpZS5Db29raWVKYXIobnVsbCwgeyBsb29zZU1vZGU6IHRydWUgfSksXG4gICAgICAgIHVzZXJBZ2VudDogYE5vZGUuanMgKCR7cHJvY2Vzcy5wbGF0Zm9ybX07IFU7IHJ2OiR7cHJvY2Vzcy52ZXJzaW9ufSkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbylgLFxuICAgICAgICAvLyBhZ2VudDogY29uZmlnLmFnZW50LFxuICAgICAgICAvLyBhZ2VudENsYXNzOiBjb25maWcuYWdlbnRDbGFzcyxcbiAgICAgICAgYWdlbnRPcHRpb25zOiB7XG4gICAgICAgICAgICBrZWVwQWxpdmU6IHRydWUsXG4gICAgICAgICAgICBrZWVwQWxpdmVNc2VjczogMTE1ICogMTAwMFxuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIEZpbmFsbHkgZG93bmxvYWQgaXQhXG4gICAgcmVzb3VyY2VMb2FkZXIuZG93bmxvYWQodXJsLCBvcHRpb25zLCAoZXJyLCByZXNwb25zZVRleHQpID0+IHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgcmV0dXJuIHJlamVjdChlcnIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVzb2x2ZShyZXNwb25zZVRleHQpO1xuICAgIH0pO1xufSk7XG5cbi8qKlxuICogR2V0IHJlcXVlc3QgdXJsc1xuICpcbiAqIEBwYXJhbSB7YXJyYXl8c3RyaW5nfSB1cmxzXG4gKiBAcGFyYW0ge3N0cmluZ30gYmFzZVxuICogQHBhcmFtIHtzdHJpbmd9IGJhc2VFbnZcbiAqIEByZXR1cm5zIHthcnJheX1cbiAqL1xuY29uc3QgZ2V0UmVxVXJscyA9ICh1cmxzLCBiYXNlLCBiYXNlRW52KSA9PiB7XG4gICAgYmFzZUVudiA9IGJhc2VFbnYgJiYgcHJvY2Vzcy5lbnZbYmFzZUVudl07XG4gICAgYmFzZSA9IGJhc2VFbnYgfHwgYmFzZTtcblxuICAgIHVybHMgPSB0eXBlb2YgdXJscyA9PT0gJ3N0cmluZycgPyBbdXJsc10gOiB1cmxzO1xuICAgIHVybHMgPSB1cmxzLm1hcCgodXJsKSA9PiB7XG4gICAgICAgIGxldCByZXFVcmwgPSB1cmw7XG5cbiAgICAgICAgLy8gTGV0cyBzZXQgdGhlIGJhc2VzXG4gICAgICAgIGlmIChiYXNlKSB7XG4gICAgICAgICAgICBpZiAoYmFzZVtiYXNlLmxlbmd0aCAtIDFdICE9PSAnLycgJiYgdXJsWzBdICE9PSAnLycpIHtcbiAgICAgICAgICAgICAgICBiYXNlICs9ICcvJztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYmFzZVtiYXNlLmxlbmd0aCAtIDFdID09PSAnLycgJiYgdXJsWzBdID09PSAnLycpIHtcbiAgICAgICAgICAgICAgICBiYXNlID0gYmFzZS5zdWJzdHJpbmcoMCwgYmFzZS5sZW5ndGggLSAxKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmVxVXJsID0gYmFzZSArIHJlcVVybDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENvbnN0cnVjdCBvYmplY3RcbiAgICAgICAgcmV0dXJuIHsgcmVxdWVzdFNyYzogcmVxVXJsLCBvcmlnaW5hbFNyYzogdXJsIH07XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdXJscztcbn07XG5cbi8qKlxuICogR2V0cyBET00gZnJvbSB1cmxcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gc3JjXG4gKiBAcGFyYW0ge3N0cmluZ3xvYmplY3R9IHR5cGVcbiAqIEByZXR1cm5zIHtwcm9taXNlfVxuICovXG5jb25zdCBnZXREb20gPSAoc3JjLCB0eXBlKSA9PiB7XG4gICAgdHlwZSA9IHR5cGVvZiB0eXBlID09PSAnc3RyaW5nJyA/IHsgb2Y6IHR5cGUgfSA6IHR5cGU7XG5cbiAgICBjb25zdCBwcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAvLyBOZWVkIHRvIGNoZWNrIGlmIHVybCBpcyBva1xuICAgICAgICBpZiAodHlwZS5vZiA9PT0gJ3VybCcgJiYgIWlzVXJsKHNyYykpIHtcbiAgICAgICAgICAgIHJldHVybiByZWplY3QobmV3IEVycm9yKCdVcmwgbm90IHZhbGlkJykpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgIH0pXG4gICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAvLyBJdCBpcyBhbHJlYWR5IG1hcmt1cFxuICAgICAgICBpZiAodHlwZS5vZiA9PT0gJ2NvbnRlbnQnIHx8IHR5cGUub2YgPT09ICdmaWxlJykge1xuICAgICAgICAgICAgcmV0dXJuIHNyYztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIExldHMgZ2V0IHRoZSBtYXJrdXBcbiAgICAgICAgcmV0dXJuIGdldFVybE1hcmt1cChzcmMpO1xuICAgIH0pXG4gICAgLnRoZW4obWFya3VwID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgLy8gTGV0cyBmb3JjZSBtYXJrdXAgdG8gaGF2ZSBqcXVlcnlcbiAgICAgICAgLy8gVGhpcyBpcyBhY2NlcHRlZCBieSBqc2RvbS5qc2RvbSBhbmQganNkb20uZW52XG4gICAgICAgIGNvbnN0IGpxdWVyeVNjcmlwdCA9ICc8c2NyaXB0IHR5cGU9XCJ0ZXh0L2phdmFzY3JpcHRcIiBzcmM9XCJodHRwOi8vY29kZS5qcXVlcnkuY29tL2pxdWVyeS5qc1wiPjwvc2NyaXB0Pic7XG4gICAgICAgIGlmIChtYXJrdXAuaW5kZXhPZignPGhlYWQ+JykgIT09IC0xKSB7XG4gICAgICAgICAgICBtYXJrdXAgPSBtYXJrdXAucmVwbGFjZSgnPGhlYWQ+JywgYDxoZWFkPiR7anF1ZXJ5U2NyaXB0fWApO1xuICAgICAgICB9IGVsc2UgaWYgKG1hcmt1cC5pbmRleE9mKCc8Ym9keT4nKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIG1hcmt1cCA9IG1hcmt1cC5yZXBsYWNlKCc8Ym9keT4nLCBgPGJvZHk+JHtqcXVlcnlTY3JpcHR9YCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBQcmVwYXJlIGZvciBwb3NzaWJsZSBlcnJvcnNcbiAgICAgICAgY29uc3QgdmlydHVhbENvbnNvbGUgPSBqc2RvbS5jcmVhdGVWaXJ0dWFsQ29uc29sZSgpO1xuICAgICAgICBjb25zdCBlcnJvcnMgPSBbXTtcbiAgICAgICAgY29uc3QgbG9ncyA9IFtdO1xuICAgICAgICBjb25zdCB3YXJucyA9IFtdO1xuXG4gICAgICAgIHZpcnR1YWxDb25zb2xlLm9uKCdqc2RvbUVycm9yJywgZXJyb3IgPT4geyBlcnJvcnMucHVzaChlcnJvcik7IH0pO1xuICAgICAgICB2aXJ0dWFsQ29uc29sZS5vbignZXJyb3InLCBlcnJvciA9PiB7IGVycm9ycy5wdXNoKGVycm9yKTsgfSk7XG4gICAgICAgIHZpcnR1YWxDb25zb2xlLm9uKCdsb2cnLCBsb2cgPT4geyBsb2dzLnB1c2gobG9nKTsgfSk7XG4gICAgICAgIHZpcnR1YWxDb25zb2xlLm9uKCd3YXJuJywgd2FybiA9PiB7IHdhcm5zLnB1c2god2Fybik7IH0pO1xuXG4gICAgICAgIC8vIENvbmZpZ1xuICAgICAgICBjb25zdCBjb25maWcgPSB7XG4gICAgICAgICAgICBodG1sOiBtYXJrdXAsXG4gICAgICAgICAgICB2aXJ0dWFsQ29uc29sZSxcbiAgICAgICAgICAgIGZlYXR1cmVzOiB7XG4gICAgICAgICAgICAgICAgRmV0Y2hFeHRlcm5hbFJlc291cmNlczogWydzY3JpcHQnLCAnbGluayddLFxuICAgICAgICAgICAgICAgIFByb2Nlc3NFeHRlcm5hbFJlc291cmNlczogWydzY3JpcHQnXSxcbiAgICAgICAgICAgICAgICBTa2lwRXh0ZXJuYWxSZXNvdXJjZXM6IGZhbHNlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZG9uZTogKGVyciwgd2luZG93KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikgeyByZXR1cm4gcmVqZWN0KGVycik7IH1cbiAgICAgICAgICAgICAgICByZXNvbHZlKHsgd2luZG93LCBlcnJvcnMsIGxvZ3MsIHdhcm5zLCBwcmVNYXJrdXA6IG1hcmt1cCB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICAvLyBOb3cgZm9yIHRoZSBhY3R1YWwgZ2V0dGluZ1xuICAgICAgICBqc2RvbS5lbnYoY29uZmlnKTtcbiAgICB9KSk7XG5cbiAgICByZXR1cm4gcHJvbWlzZTtcbn07XG5cbi8qKlxuICogU2NyYXBlc1xuICpcbiAqIEBwYXJhbSAge29iamVjdH0gZGF0YVxuICogQHJldHVybnMge3Byb21pc2V9XG4gKi9cbmNvbnN0IHJ1biA9IChkYXRhKSA9PiB7XG4gICAgY29uc3Qgc3JjID0gdHlwZW9mIGRhdGEuc3JjID09PSAnc3RyaW5nJyA/IFtkYXRhLnNyY10gOiBkYXRhLnNyYztcbiAgICBjb25zdCB0eXBlID0gdHlwZW9mIGRhdGEudHlwZSA9PT0gJ3N0cmluZycgPyB7IG9mOiBkYXRhLnR5cGUgfSA6IGRhdGEudHlwZTtcbiAgICBsZXQgcmVxU3JjID0gc3JjO1xuXG4gICAgLy8gTGV0cyBwYXJzZSBzb3VyY2VzIGludG8gd2hhdCB3ZSdyZSBleHBlY3RpbmdcbiAgICBpZiAodHlwZS5vZiA9PT0gJ3VybCcpIHtcbiAgICAgICAgcmVxU3JjID0gZ2V0UmVxVXJscyhyZXFTcmMsIHR5cGUuYmFzZSwgdHlwZS5iYXNlRW52KTtcbiAgICB9IGVsc2UgaWYgKHR5cGUub2YgPT09ICdmaWxlJykge1xuICAgICAgICByZXFTcmMgPSByZXFTcmMubWFwKHZhbCA9PiAoeyByZXF1ZXN0U3JjOiByZXF1aXJlKGdldFB3ZCh2YWwpKSwgb3JpZ2luYWxTcmM6IHZhbCB9KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmVxU3JjID0gcmVxU3JjLm1hcCh2YWwgPT4gKHsgcmVxdWVzdFNyYzogdmFsLCBvcmlnaW5hbFNyYzogdmFsIH0pKTtcbiAgICB9XG5cbiAgICAvLyBGaW5hbGx5IGxldHMgc2V0IHRoZSBwcm9taXNlc1xuICAgIGNvbnN0IHVybHNQcm9taXNlcyA9IHJlcVNyYy5tYXAoKHJlcSkgPT4gZ2V0RG9tKHJlcS5yZXF1ZXN0U3JjLCB0eXBlKVxuICAgIC50aGVuKChkb21SZXEpID0+IHtcbiAgICAgICAgcmVxLmRvbVJlcSA9IGRvbVJlcTtcbiAgICAgICAgcmV0dXJuIHJlcTtcbiAgICB9KVxuICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgIHJlcS5lcnIgPSBlcnI7XG4gICAgICAgIHRocm93IHJlcTtcbiAgICB9KSk7XG5cbiAgICByZXR1cm4gUHJvbWlzZS5hbGwodXJsc1Byb21pc2VzKTtcbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBFeHBvcnRcblxuZXhwb3J0IHsgcnVuIH07XG5leHBvcnQgeyBnZXREb20gfTtcbmV4cG9ydCB7IGdldFVybE1hcmt1cCB9O1xuXG4vLyBFc3NlbnRpYWxseSBmb3IgdGVzdGluZyBwdXJwb3Nlc1xuZXhwb3J0IGNvbnN0IF9fdGVzdE1ldGhvZHNfXyA9IHsgcnVuLCBnZXREb20sIGdldFJlcVVybHMsIGdldFVybE1hcmt1cCB9O1xuIl19