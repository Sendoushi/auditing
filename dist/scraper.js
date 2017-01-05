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
 * @param {string} type
 * @returns {promise}
 */
var getDom = function getDom(src, type) {
    var promise = new Promise(function (resolve, reject) {
        // Need to check if url is ok
        if (type === 'url' && !(0, _utils.isUrl)(src)) {
            return reject(new Error('Url not valid'));
        }

        resolve();
    }).then(function () {
        // It is already markup
        if (type === 'content' || type === 'file') {
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
    var reqSrc = src;

    // Lets parse sources into what we're expecting
    if (data.type === 'url') {
        reqSrc = getReqUrls(reqSrc, data.base, data.baseEnv);
    } else if (data.type === 'file') {
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
        return getDom(req.requestSrc, data.type).then(function (domReq) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zY3JhcGVyLmpzIl0sIm5hbWVzIjpbImdldFVybE1hcmt1cCIsInVybCIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwiRXJyb3IiLCJvcHRpb25zIiwiZGVmYXVsdEVuY29kaW5nIiwiZGV0ZWN0TWV0YUNoYXJzZXQiLCJwb29sIiwibWF4U29ja2V0cyIsInN0cmljdFNTTCIsImNvb2tpZUphciIsIkNvb2tpZUphciIsImxvb3NlTW9kZSIsInVzZXJBZ2VudCIsInByb2Nlc3MiLCJwbGF0Zm9ybSIsInZlcnNpb24iLCJhZ2VudE9wdGlvbnMiLCJrZWVwQWxpdmUiLCJrZWVwQWxpdmVNc2VjcyIsImRvd25sb2FkIiwiZXJyIiwicmVzcG9uc2VUZXh0IiwiZ2V0UmVxVXJscyIsInVybHMiLCJiYXNlIiwiYmFzZUVudiIsImVudiIsIm1hcCIsInJlcVVybCIsImxlbmd0aCIsInN1YnN0cmluZyIsInJlcXVlc3RTcmMiLCJvcmlnaW5hbFNyYyIsImdldERvbSIsInNyYyIsInR5cGUiLCJwcm9taXNlIiwidGhlbiIsImpxdWVyeVNjcmlwdCIsIm1hcmt1cCIsImluZGV4T2YiLCJyZXBsYWNlIiwidmlydHVhbENvbnNvbGUiLCJjcmVhdGVWaXJ0dWFsQ29uc29sZSIsImVycm9ycyIsImxvZ3MiLCJ3YXJucyIsIm9uIiwicHVzaCIsImVycm9yIiwibG9nIiwid2FybiIsImNvbmZpZyIsImh0bWwiLCJmZWF0dXJlcyIsIkZldGNoRXh0ZXJuYWxSZXNvdXJjZXMiLCJQcm9jZXNzRXh0ZXJuYWxSZXNvdXJjZXMiLCJTa2lwRXh0ZXJuYWxSZXNvdXJjZXMiLCJkb25lIiwid2luZG93IiwicHJlTWFya3VwIiwicnVuIiwiZGF0YSIsInJlcVNyYyIsInJlcXVpcmUiLCJ2YWwiLCJ1cmxzUHJvbWlzZXMiLCJyZXEiLCJkb21SZXEiLCJjYXRjaCIsImFsbCJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTs7Ozs7OztBQUVBOzs7O0FBQ0E7Ozs7QUFDQTs7OztB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aUJBQVNBLE9BQU9wQyxHQUFQLENBQVc7QUFBQSxtQkFBUSxFQUFFSSxZQUFZa0MsR0FBZCxFQUFtQmpDLGFBQWFpQyxHQUFoQyxFQUFSO0FBQUEsU0FBWCxDQUFUO0FBQ0g7O0FBRUQ7QUFDQSxRQUFNQyxlQUFlSCxPQUFPcEMsR0FBUCxDQUFXLFVBQUN3QyxHQUFEO0FBQUEsZUFBU2xDLE9BQU9rQyxJQUFJcEMsVUFBWCxFQUF1QitCLEtBQUszQixJQUE1QixFQUN4Q0UsSUFEd0MsQ0FDbkMsVUFBQytCLE1BQUQsRUFBWTtBQUNkRCxnQkFBSUMsTUFBSixHQUFhQSxNQUFiO0FBQ0EsbUJBQU9ELEdBQVA7QUFDSCxTQUp3QyxFQUt4Q0UsS0FMd0MsQ0FLbEMsVUFBQ2pELEdBQUQsRUFBUztBQUNaK0MsZ0JBQUkvQyxHQUFKLEdBQVVBLEdBQVY7QUFDQSxrQkFBTStDLEdBQU47QUFDSCxTQVJ3QyxDQUFUO0FBQUEsS0FBWCxDQUFyQjs7QUFVQSxXQUFPcEUsUUFBUXVFLEdBQVIsQ0FBWUosWUFBWixDQUFQO0FBQ0gsQ0F6QkQ7O0FBMkJBO0FBQ0E7O1FBRVNMLEcsR0FBQUEsRztRQUNBNUIsTSxHQUFBQSxNO1FBQ0FwQyxZLEdBQUFBLFk7O0FBRVQiLCJmaWxlIjoic2NyYXBlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0Jztcbi8qIGdsb2JhbCBQcm9taXNlICovXG5cbmltcG9ydCBqc2RvbSBmcm9tICdqc2RvbSc7XG5pbXBvcnQgcmVzb3VyY2VMb2FkZXIgZnJvbSAnanNkb20vbGliL2pzZG9tL2Jyb3dzZXIvcmVzb3VyY2UtbG9hZGVyJztcbmltcG9ydCB0b3VnaENvb2tpZSBmcm9tICd0b3VnaC1jb29raWUnO1xuaW1wb3J0IHsgaXNVcmwgfSBmcm9tICcuL3V0aWxzLmpzJztcbmltcG9ydCB7IGdldFB3ZCB9IGZyb20gJy4vdXRpbHMuanMnO1xuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEZ1bmN0aW9uc1xuXG4vKipcbiAqIEdldHMgdXJsIG1hcmt1cFxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB1cmxcbiAqIEByZXR1cm5zIHtwcm9taXNlfVxuICovXG5jb25zdCBnZXRVcmxNYXJrdXAgPSAodXJsKSA9PiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgaWYgKHR5cGVvZiB1cmwgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignVXJsIG5lZWRzIHRvIGJlIGEgc3RyaW5nJyk7XG4gICAgfVxuXG4gICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgICAgZGVmYXVsdEVuY29kaW5nOiAnd2luZG93cy0xMjUyJyxcbiAgICAgICAgZGV0ZWN0TWV0YUNoYXJzZXQ6IHRydWUsXG4gICAgICAgIC8vIGhlYWRlcnM6IGNvbmZpZy5oZWFkZXJzLFxuICAgICAgICBwb29sOiB7XG4gICAgICAgICAgICBtYXhTb2NrZXRzOiA2XG4gICAgICAgIH0sXG4gICAgICAgIHN0cmljdFNTTDogdHJ1ZSxcbiAgICAgICAgLy8gcHJveHk6IGNvbmZpZy5wcm94eSxcbiAgICAgICAgY29va2llSmFyOiBuZXcgdG91Z2hDb29raWUuQ29va2llSmFyKG51bGwsIHsgbG9vc2VNb2RlOiB0cnVlIH0pLFxuICAgICAgICB1c2VyQWdlbnQ6IGBOb2RlLmpzICgke3Byb2Nlc3MucGxhdGZvcm19OyBVOyBydjoke3Byb2Nlc3MudmVyc2lvbn0pIEFwcGxlV2ViS2l0LzUzNy4zNiAoS0hUTUwsIGxpa2UgR2Vja28pYCxcbiAgICAgICAgLy8gYWdlbnQ6IGNvbmZpZy5hZ2VudCxcbiAgICAgICAgLy8gYWdlbnRDbGFzczogY29uZmlnLmFnZW50Q2xhc3MsXG4gICAgICAgIGFnZW50T3B0aW9uczoge1xuICAgICAgICAgICAga2VlcEFsaXZlOiB0cnVlLFxuICAgICAgICAgICAga2VlcEFsaXZlTXNlY3M6IDExNSAqIDEwMDBcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBGaW5hbGx5IGRvd25sb2FkIGl0IVxuICAgIHJlc291cmNlTG9hZGVyLmRvd25sb2FkKHVybCwgb3B0aW9ucywgKGVyciwgcmVzcG9uc2VUZXh0KSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgIHJldHVybiByZWplY3QoZXJyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlc29sdmUocmVzcG9uc2VUZXh0KTtcbiAgICB9KTtcbn0pO1xuXG4vKipcbiAqIEdldCByZXF1ZXN0IHVybHNcbiAqXG4gKiBAcGFyYW0ge2FycmF5fHN0cmluZ30gdXJsc1xuICogQHBhcmFtIHtzdHJpbmd9IGJhc2VcbiAqIEBwYXJhbSB7c3RyaW5nfSBiYXNlRW52XG4gKiBAcmV0dXJucyB7YXJyYXl9XG4gKi9cbmNvbnN0IGdldFJlcVVybHMgPSAodXJscywgYmFzZSwgYmFzZUVudikgPT4ge1xuICAgIGJhc2VFbnYgPSBiYXNlRW52ICYmIHByb2Nlc3MuZW52W2Jhc2VFbnZdO1xuICAgIGJhc2UgPSBiYXNlRW52IHx8IGJhc2U7XG5cbiAgICB1cmxzID0gdHlwZW9mIHVybHMgPT09ICdzdHJpbmcnID8gW3VybHNdIDogdXJscztcbiAgICB1cmxzID0gdXJscy5tYXAoKHVybCkgPT4ge1xuICAgICAgICBsZXQgcmVxVXJsID0gdXJsO1xuXG4gICAgICAgIC8vIExldHMgc2V0IHRoZSBiYXNlc1xuICAgICAgICBpZiAoYmFzZSkge1xuICAgICAgICAgICAgaWYgKGJhc2VbYmFzZS5sZW5ndGggLSAxXSAhPT0gJy8nICYmIHVybFswXSAhPT0gJy8nKSB7XG4gICAgICAgICAgICAgICAgYmFzZSArPSAnLyc7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGJhc2VbYmFzZS5sZW5ndGggLSAxXSA9PT0gJy8nICYmIHVybFswXSA9PT0gJy8nKSB7XG4gICAgICAgICAgICAgICAgYmFzZSA9IGJhc2Uuc3Vic3RyaW5nKDAsIGJhc2UubGVuZ3RoIC0gMSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJlcVVybCA9IGJhc2UgKyByZXFVcmw7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDb25zdHJ1Y3Qgb2JqZWN0XG4gICAgICAgIHJldHVybiB7IHJlcXVlc3RTcmM6IHJlcVVybCwgb3JpZ2luYWxTcmM6IHVybCB9O1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHVybHM7XG59O1xuXG4vKipcbiAqIEdldHMgRE9NIGZyb20gdXJsXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHNyY1xuICogQHBhcmFtIHtzdHJpbmd9IHR5cGVcbiAqIEByZXR1cm5zIHtwcm9taXNlfVxuICovXG5jb25zdCBnZXREb20gPSAoc3JjLCB0eXBlKSA9PiB7XG4gICAgY29uc3QgcHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgLy8gTmVlZCB0byBjaGVjayBpZiB1cmwgaXMgb2tcbiAgICAgICAgaWYgKHR5cGUgPT09ICd1cmwnICYmICFpc1VybChzcmMpKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KG5ldyBFcnJvcignVXJsIG5vdCB2YWxpZCcpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlc29sdmUoKTtcbiAgICB9KVxuICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgLy8gSXQgaXMgYWxyZWFkeSBtYXJrdXBcbiAgICAgICAgaWYgKHR5cGUgPT09ICdjb250ZW50JyB8fCB0eXBlID09PSAnZmlsZScpIHtcbiAgICAgICAgICAgIHJldHVybiBzcmM7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBMZXRzIGdldCB0aGUgbWFya3VwXG4gICAgICAgIHJldHVybiBnZXRVcmxNYXJrdXAoc3JjKTtcbiAgICB9KVxuICAgIC50aGVuKG1hcmt1cCA9PiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIC8vIExldHMgZm9yY2UgbWFya3VwIHRvIGhhdmUganF1ZXJ5XG4gICAgICAgIC8vIFRoaXMgaXMgYWNjZXB0ZWQgYnkganNkb20uanNkb20gYW5kIGpzZG9tLmVudlxuICAgICAgICBjb25zdCBqcXVlcnlTY3JpcHQgPSAnPHNjcmlwdCB0eXBlPVwidGV4dC9qYXZhc2NyaXB0XCIgc3JjPVwiaHR0cDovL2NvZGUuanF1ZXJ5LmNvbS9qcXVlcnkuanNcIj48L3NjcmlwdD4nO1xuICAgICAgICBpZiAobWFya3VwLmluZGV4T2YoJzxoZWFkPicpICE9PSAtMSkge1xuICAgICAgICAgICAgbWFya3VwID0gbWFya3VwLnJlcGxhY2UoJzxoZWFkPicsIGA8aGVhZD4ke2pxdWVyeVNjcmlwdH1gKTtcbiAgICAgICAgfSBlbHNlIGlmIChtYXJrdXAuaW5kZXhPZignPGJvZHk+JykgIT09IC0xKSB7XG4gICAgICAgICAgICBtYXJrdXAgPSBtYXJrdXAucmVwbGFjZSgnPGJvZHk+JywgYDxib2R5PiR7anF1ZXJ5U2NyaXB0fWApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUHJlcGFyZSBmb3IgcG9zc2libGUgZXJyb3JzXG4gICAgICAgIGNvbnN0IHZpcnR1YWxDb25zb2xlID0ganNkb20uY3JlYXRlVmlydHVhbENvbnNvbGUoKTtcbiAgICAgICAgY29uc3QgZXJyb3JzID0gW107XG4gICAgICAgIGNvbnN0IGxvZ3MgPSBbXTtcbiAgICAgICAgY29uc3Qgd2FybnMgPSBbXTtcblxuICAgICAgICB2aXJ0dWFsQ29uc29sZS5vbignanNkb21FcnJvcicsIGVycm9yID0+IHsgZXJyb3JzLnB1c2goZXJyb3IpOyB9KTtcbiAgICAgICAgdmlydHVhbENvbnNvbGUub24oJ2Vycm9yJywgZXJyb3IgPT4geyBlcnJvcnMucHVzaChlcnJvcik7IH0pO1xuICAgICAgICB2aXJ0dWFsQ29uc29sZS5vbignbG9nJywgbG9nID0+IHsgbG9ncy5wdXNoKGxvZyk7IH0pO1xuICAgICAgICB2aXJ0dWFsQ29uc29sZS5vbignd2FybicsIHdhcm4gPT4geyB3YXJucy5wdXNoKHdhcm4pOyB9KTtcblxuICAgICAgICAvLyBDb25maWdcbiAgICAgICAgY29uc3QgY29uZmlnID0ge1xuICAgICAgICAgICAgaHRtbDogbWFya3VwLFxuICAgICAgICAgICAgdmlydHVhbENvbnNvbGUsXG4gICAgICAgICAgICBmZWF0dXJlczoge1xuICAgICAgICAgICAgICAgIEZldGNoRXh0ZXJuYWxSZXNvdXJjZXM6IFsnc2NyaXB0JywgJ2xpbmsnXSxcbiAgICAgICAgICAgICAgICBQcm9jZXNzRXh0ZXJuYWxSZXNvdXJjZXM6IFsnc2NyaXB0J10sXG4gICAgICAgICAgICAgICAgU2tpcEV4dGVybmFsUmVzb3VyY2VzOiBmYWxzZVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGRvbmU6IChlcnIsIHdpbmRvdykgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHsgcmV0dXJuIHJlamVjdChlcnIpOyB9XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh7IHdpbmRvdywgZXJyb3JzLCBsb2dzLCB3YXJucywgcHJlTWFya3VwOiBtYXJrdXAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gTm93IGZvciB0aGUgYWN0dWFsIGdldHRpbmdcbiAgICAgICAganNkb20uZW52KGNvbmZpZyk7XG4gICAgfSkpO1xuXG4gICAgcmV0dXJuIHByb21pc2U7XG59O1xuXG4vKipcbiAqIFNjcmFwZXNcbiAqXG4gKiBAcGFyYW0gIHtvYmplY3R9IGRhdGFcbiAqIEByZXR1cm5zIHtwcm9taXNlfVxuICovXG5jb25zdCBydW4gPSAoZGF0YSkgPT4ge1xuICAgIGNvbnN0IHNyYyA9IHR5cGVvZiBkYXRhLnNyYyA9PT0gJ3N0cmluZycgPyBbZGF0YS5zcmNdIDogZGF0YS5zcmM7XG4gICAgbGV0IHJlcVNyYyA9IHNyYztcblxuICAgIC8vIExldHMgcGFyc2Ugc291cmNlcyBpbnRvIHdoYXQgd2UncmUgZXhwZWN0aW5nXG4gICAgaWYgKGRhdGEudHlwZSA9PT0gJ3VybCcpIHtcbiAgICAgICAgcmVxU3JjID0gZ2V0UmVxVXJscyhyZXFTcmMsIGRhdGEuYmFzZSwgZGF0YS5iYXNlRW52KTtcbiAgICB9IGVsc2UgaWYgKGRhdGEudHlwZSA9PT0gJ2ZpbGUnKSB7XG4gICAgICAgIHJlcVNyYyA9IHJlcVNyYy5tYXAodmFsID0+ICh7IHJlcXVlc3RTcmM6IHJlcXVpcmUoZ2V0UHdkKHZhbCkpLCBvcmlnaW5hbFNyYzogdmFsIH0pKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXFTcmMgPSByZXFTcmMubWFwKHZhbCA9PiAoeyByZXF1ZXN0U3JjOiB2YWwsIG9yaWdpbmFsU3JjOiB2YWwgfSkpO1xuICAgIH1cblxuICAgIC8vIEZpbmFsbHkgbGV0cyBzZXQgdGhlIHByb21pc2VzXG4gICAgY29uc3QgdXJsc1Byb21pc2VzID0gcmVxU3JjLm1hcCgocmVxKSA9PiBnZXREb20ocmVxLnJlcXVlc3RTcmMsIGRhdGEudHlwZSlcbiAgICAudGhlbigoZG9tUmVxKSA9PiB7XG4gICAgICAgIHJlcS5kb21SZXEgPSBkb21SZXE7XG4gICAgICAgIHJldHVybiByZXE7XG4gICAgfSlcbiAgICAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICByZXEuZXJyID0gZXJyO1xuICAgICAgICB0aHJvdyByZXE7XG4gICAgfSkpO1xuXG4gICAgcmV0dXJuIFByb21pc2UuYWxsKHVybHNQcm9taXNlcyk7XG59O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gRXhwb3J0XG5cbmV4cG9ydCB7IHJ1biB9O1xuZXhwb3J0IHsgZ2V0RG9tIH07XG5leHBvcnQgeyBnZXRVcmxNYXJrdXAgfTtcblxuLy8gRXNzZW50aWFsbHkgZm9yIHRlc3RpbmcgcHVycG9zZXNcbmV4cG9ydCBjb25zdCBfX3Rlc3RNZXRob2RzX18gPSB7IHJ1biwgZ2V0RG9tLCBnZXRSZXFVcmxzLCBnZXRVcmxNYXJrdXAgfTtcbiJdfQ==