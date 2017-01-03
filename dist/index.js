#!/usr/bin/env node


'use strict';
/* global Promise */

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.run = exports.setup = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _yargs = require('yargs');

var _merge = require('lodash/merge.js');

var _merge2 = _interopRequireDefault(_merge);

var _isArray = require('lodash/isArray.js');

var _isArray2 = _interopRequireDefault(_isArray);

var _scraper = require('./scraper.js');

var _config = require('./config.js');

var _utils = require('./utils.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Import modules
var modules = {
    w3: require('./modules/w3.js')
    // TODO: Take care of these modules to be compliant...
    // wcag: require('./modules/wcag.js'),
    // SEO: require('./modules/seo.js'),
    // lighthouse: require('./modules/lighthouse.js')
};

var logWarn = void 0;
var desTest = void 0;
var itTest = void 0;

//-------------------------------------
// Functions

/**
 * Runs the rule
 *
 * @param {object} rule
 * @param {object} url
 * @returns
 */
var runRule = function runRule() {
    var rule = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var url = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if ((typeof rule === 'undefined' ? 'undefined' : _typeof(rule)) !== 'object' || (0, _isArray2.default)(rule)) {
        throw new Error('A rule needs to be an object');
    }

    if (!rule.name || typeof rule.name !== 'string') {
        throw new Error('A rule needs a string name');
    }

    if (!rule.fn || typeof rule.fn !== 'function') {
        throw new Error('A rule needs a function fn');
    }

    return rule.fn(url).then(function (ruleData) {
        // Lets see if there is a warning...
        if ((0, _isArray2.default)(ruleData)) {
            ruleData.forEach(function (single) {
                if (!single || (typeof single === 'undefined' ? 'undefined' : _typeof(single)) !== 'object') {
                    throw new Error('Rule array result item should be an object');
                }

                if (!single.type || typeof single.type !== 'string') {
                    throw new Error('Rule array result item should have a string type');
                }

                if (!single.msg || typeof single.msg !== 'string') {
                    throw new Error('Rule array result item should have a string msg');
                }

                if (single.type === 'warning') {
                    logWarn(rule.name, single.msg, single.raw);
                }
            });
        }

        var newRule = (0, _merge2.default)({
            name: rule.name,
            status: 'passed',
            result: ruleData
        });

        // Ready
        return newRule;
    }).catch(function (err) {
        var newRule = {
            name: rule.name,
            status: 'failed',
            result: err
        };

        // Ready
        throw newRule;
    });
};

/**
 * Runs audit
 *
 * @param {object} auditsData
 * @param {object} url
 * @param {function} resolve
 * @param {function} reject
 * @returns
 */
var runAudit = function runAudit() {
    var auditsData = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var url = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var resolve = arguments[2];
    var reject = arguments[3];

    var allDone = 0;
    var promisesCount = 0;
    var audits = {};

    if (typeof resolve !== 'function' || typeof reject !== 'function') {
        throw new Error('Resolve and reject functions need to be provided');
    }

    // We need to know how many rules there are
    auditsData.forEach(function (audit) {
        promisesCount += (audit.rules || []).length;
    });

    if (!auditsData.length || promisesCount === 0) {
        resolve(audits);
    }

    // Lets go per audit...
    auditsData.forEach(function (audit) {
        audits[audit.name] = [];

        desTest('Audit: ' + audit.name, function () {
            return audit.rules.forEach(function (rule) {
                return itTest('Rule: ' + rule.name, function (done) {
                    this.timeout(20000);

                    // Lets run the rule
                    runRule(rule, url).then(function (newRule) {
                        // Ready
                        audits[audit.name].push(newRule);
                        done();

                        allDone += 1;
                        if (allDone === promisesCount) {
                            resolve(audits);
                        }

                        return newRule;
                    }).catch(function (newRule) {
                        var err = newRule.result;

                        // Ready
                        audits[audit.name].push(newRule);
                        done(err instanceof Error ? err : new Error(JSON.stringify(err, null, 4)));

                        allDone += 1;
                        if (allDone === promisesCount) {
                            reject(audits);
                        }
                    });
                });
            });
        });
    });

    return audits;
};

/**
 * Build audits array
 *
 * @param {array} audits
 * @returns {array}
 */
var buildAudits = function buildAudits(audits) {
    audits = typeof audits === 'string' ? [audits] : audits;
    audits = audits.map(function (val) {
        val = (typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object' ? val : { src: val };

        // Lets require
        var mod = modules[val.src] || require((0, _utils.getPwd)(val.src));
        mod = (typeof mod === 'undefined' ? 'undefined' : _typeof(mod)) === 'object' && mod.default ? mod.default : mod;

        // Now set all as should
        val.name = mod.name;
        val.rules = mod.rules.map(function (rule) {
            if ((typeof rule === 'undefined' ? 'undefined' : _typeof(rule)) !== 'object' || (0, _isArray2.default)(rule)) {
                throw new Error('A rule needs to be an object');
            }

            if (!rule.name) {
                throw new Error('A rule needs a name');
            }

            if (!rule.fn) {
                throw new Error('A rule needs a function');
            }

            return rule;
        });
        val.ignore = val.ignore || [];

        return val;
    });

    return audits;
};

/**
 * Gather data
 *
 * @param {array} data
 * @returns {promise}
 */
var gatherData = function gatherData() {
    var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    return new Promise(function (resolve, reject) {
        var reqData = [];
        var promisesCount = data.length;
        var allDone = 0;

        // No need to go further without data
        if (!data.length) {
            return resolve();
        }

        // Go through each request
        data.forEach(function (req) {
            return desTest('Requesting urls', function () {
                return itTest('Gathering data...', function (done) {
                    this.timeout(10000);

                    // Lets get the scraper data
                    (0, _scraper.run)(req).then(function (scrapData) {
                        var newReq = (0, _merge2.default)(req, {
                            auditsData: buildAudits(req.audits),
                            urlsData: scrapData
                        });

                        // Ready
                        reqData.push(newReq);
                        done();

                        allDone += 1;
                        if (allDone === promisesCount) {
                            resolve(reqData);
                        }

                        return newReq;
                    }).catch(function (err) {
                        var newReq = (0, _merge2.default)(req, { err: err });

                        // Ready
                        reqData.push(newReq);
                        done(err);

                        allDone += 1;
                        if (allDone === promisesCount) {
                            reject(reqData);
                        }
                    });
                });
            });
        });
    });
};

/**
 * Initialize audits
 *
 * @param {object|string} config
 * @returns {promise}
 */
var run = function run(config) {
    config = (0, _config.get)(config);

    // Lets gather data from the urls
    return gatherData(config.data).then(function (data) {
        return new Promise(function (resolve, reject) {
            // Go through each element in data
            // Lets run audits per request
            data.forEach(function (req) {
                return req.urlsData.forEach(function (url) {
                    desTest('Auditing: ' + url.originalUrl, function () {
                        runAudit(req.auditsData, url, resolve, reject);
                    });
                });
            });
        });
    });
};

/**
 * Sets up the testing environment
 *
 * @param {function} newDes
 * @param {function} newIt
 * @param {function} newWarn
 * @param {boolean} reset
 */
var setup = function setup(newDes, newIt, newWarn, reset) {
    if (newDes && typeof newDes !== 'function') {
        throw new Error('Describe needs to be a function');
    }

    if (newIt && typeof newIt !== 'function') {
        throw new Error('It needs to be a function');
    }

    if (newWarn && typeof newWarn !== 'function') {
        throw new Error('Warn needs to be a function');
    }

    // Reset
    if (reset) {
        desTest = itTest = logWarn = null;
    }

    desTest = newDes || desTest || function (msg, cb) {
        cb();
    };

    itTest = newIt || itTest || function (msg, cb) {
        var module = {
            done: function done(err) {
                if (err) {
                    throw err;
                }
            },
            timeout: function timeout() {}
        };

        cb.bind(module)(module.done);
    };

    /* eslint-disable no-console */
    logWarn = newWarn || logWarn || function (module) {
        var _console;

        for (var _len = arguments.length, msg = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            msg[_key - 1] = arguments[_key];
        }

        (_console = console).warn.apply(_console, [module].concat(msg));
    };
    /* eslint-enable no-console */
};

//-------------------------------------
// Runtime

if (_yargs.argv && _yargs.argv.mocha) {
    /* eslint-disable no-undef */
    setup(describe, it);
    /* eslint-enable no-undef */
} else {
    setup();
}
_yargs.argv && _yargs.argv.config && run(_yargs.argv.config);
exports.setup = setup;
exports.run = run;

// Essentially for testing purposes
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJtb2R1bGVzIiwidzMiLCJyZXF1aXJlIiwibG9nV2FybiIsImRlc1Rlc3QiLCJpdFRlc3QiLCJydW5SdWxlIiwicnVsZSIsInVybCIsIkVycm9yIiwibmFtZSIsImZuIiwidGhlbiIsInJ1bGVEYXRhIiwiZm9yRWFjaCIsInNpbmdsZSIsInR5cGUiLCJtc2ciLCJyYXciLCJuZXdSdWxlIiwic3RhdHVzIiwicmVzdWx0IiwiY2F0Y2giLCJlcnIiLCJydW5BdWRpdCIsImF1ZGl0c0RhdGEiLCJyZXNvbHZlIiwicmVqZWN0IiwiYWxsRG9uZSIsInByb21pc2VzQ291bnQiLCJhdWRpdHMiLCJhdWRpdCIsInJ1bGVzIiwibGVuZ3RoIiwiZG9uZSIsInRpbWVvdXQiLCJwdXNoIiwiSlNPTiIsInN0cmluZ2lmeSIsImJ1aWxkQXVkaXRzIiwibWFwIiwidmFsIiwic3JjIiwibW9kIiwiZGVmYXVsdCIsImlnbm9yZSIsImdhdGhlckRhdGEiLCJkYXRhIiwiUHJvbWlzZSIsInJlcURhdGEiLCJyZXEiLCJzY3JhcERhdGEiLCJuZXdSZXEiLCJ1cmxzRGF0YSIsInJ1biIsImNvbmZpZyIsIm9yaWdpbmFsVXJsIiwic2V0dXAiLCJuZXdEZXMiLCJuZXdJdCIsIm5ld1dhcm4iLCJyZXNldCIsImNiIiwibW9kdWxlIiwiYmluZCIsIndhcm4iLCJtb2NoYSIsImRlc2NyaWJlIiwiaXQiXSwibWFwcGluZ3MiOiI7O0FBRUE7QUFDQTs7Ozs7Ozs7O0FBRUE7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOztBQUNBOztBQUNBOzs7O0FBRUE7QUFDQSxJQUFNQSxVQUFVO0FBQ1pDLFFBQUlDLFFBQVEsaUJBQVI7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUxZLENBQWhCOztBQVFBLElBQUlDLGdCQUFKO0FBQ0EsSUFBSUMsZ0JBQUo7QUFDQSxJQUFJQyxlQUFKOztBQUVBO0FBQ0E7O0FBRUE7Ozs7Ozs7QUFPQSxJQUFNQyxVQUFVLFNBQVZBLE9B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IFByb21pc2UgKi9cblxuaW1wb3J0IHsgYXJndiB9IGZyb20gJ3lhcmdzJztcbmltcG9ydCBtZXJnZSBmcm9tICdsb2Rhc2gvbWVyZ2UuanMnO1xuaW1wb3J0IGlzQXJyYXkgZnJvbSAnbG9kYXNoL2lzQXJyYXkuanMnO1xuaW1wb3J0IHsgcnVuIGFzIHJ1blNjcmFwZXIgfSBmcm9tICcuL3NjcmFwZXIuanMnO1xuaW1wb3J0IHsgZ2V0IGFzIGNvbmZpZ0dldCB9IGZyb20gJy4vY29uZmlnLmpzJztcbmltcG9ydCB7IGdldFB3ZCB9IGZyb20gJy4vdXRpbHMuanMnO1xuXG4vLyBJbXBvcnQgbW9kdWxlc1xuY29uc3QgbW9kdWxlcyA9IHtcbiAgICB3MzogcmVxdWlyZSgnLi9tb2R1bGVzL3czLmpzJylcbiAgICAvLyBUT0RPOiBUYWtlIGNhcmUgb2YgdGhlc2UgbW9kdWxlcyB0byBiZSBjb21wbGlhbnQuLi5cbiAgICAvLyB3Y2FnOiByZXF1aXJlKCcuL21vZHVsZXMvd2NhZy5qcycpLFxuICAgIC8vIFNFTzogcmVxdWlyZSgnLi9tb2R1bGVzL3Nlby5qcycpLFxuICAgIC8vIGxpZ2h0aG91c2U6IHJlcXVpcmUoJy4vbW9kdWxlcy9saWdodGhvdXNlLmpzJylcbn07XG5cbmxldCBsb2dXYXJuO1xubGV0IGRlc1Rlc3Q7XG5sZXQgaXRUZXN0O1xuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEZ1bmN0aW9uc1xuXG4vKipcbiAqIFJ1bnMgdGhlIHJ1bGVcbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gcnVsZVxuICogQHBhcmFtIHtvYmplY3R9IHVybFxuICogQHJldHVybnNcbiAqL1xuY29uc3QgcnVuUnVsZSA9IChydWxlID0ge30sIHVybCA9IHt9KSA9PiB7XG4gICAgaWYgKHR5cGVvZiBydWxlICE9PSAnb2JqZWN0JyB8fCBpc0FycmF5KHJ1bGUpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQSBydWxlIG5lZWRzIHRvIGJlIGFuIG9iamVjdCcpO1xuICAgIH1cblxuICAgIGlmICghcnVsZS5uYW1lIHx8IHR5cGVvZiBydWxlLm5hbWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQSBydWxlIG5lZWRzIGEgc3RyaW5nIG5hbWUnKTtcbiAgICB9XG5cbiAgICBpZiAoIXJ1bGUuZm4gfHwgdHlwZW9mIHJ1bGUuZm4gIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBIHJ1bGUgbmVlZHMgYSBmdW5jdGlvbiBmbicpO1xuICAgIH1cblxuICAgIHJldHVybiBydWxlLmZuKHVybCkudGhlbihydWxlRGF0YSA9PiB7XG4gICAgICAgIC8vIExldHMgc2VlIGlmIHRoZXJlIGlzIGEgd2FybmluZy4uLlxuICAgICAgICBpZiAoaXNBcnJheShydWxlRGF0YSkpIHtcbiAgICAgICAgICAgIHJ1bGVEYXRhLmZvckVhY2goc2luZ2xlID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIXNpbmdsZSB8fCB0eXBlb2Ygc2luZ2xlICE9PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1J1bGUgYXJyYXkgcmVzdWx0IGl0ZW0gc2hvdWxkIGJlIGFuIG9iamVjdCcpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICghc2luZ2xlLnR5cGUgfHwgdHlwZW9mIHNpbmdsZS50eXBlICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1J1bGUgYXJyYXkgcmVzdWx0IGl0ZW0gc2hvdWxkIGhhdmUgYSBzdHJpbmcgdHlwZScpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICghc2luZ2xlLm1zZyB8fCB0eXBlb2Ygc2luZ2xlLm1zZyAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdSdWxlIGFycmF5IHJlc3VsdCBpdGVtIHNob3VsZCBoYXZlIGEgc3RyaW5nIG1zZycpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChzaW5nbGUudHlwZSA9PT0gJ3dhcm5pbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvZ1dhcm4ocnVsZS5uYW1lLCBzaW5nbGUubXNnLCBzaW5nbGUucmF3KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG5ld1J1bGUgPSBtZXJnZSh7XG4gICAgICAgICAgICBuYW1lOiBydWxlLm5hbWUsXG4gICAgICAgICAgICBzdGF0dXM6ICdwYXNzZWQnLFxuICAgICAgICAgICAgcmVzdWx0OiBydWxlRGF0YVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBSZWFkeVxuICAgICAgICByZXR1cm4gbmV3UnVsZTtcbiAgICB9KVxuICAgIC5jYXRjaChlcnIgPT4ge1xuICAgICAgICBjb25zdCBuZXdSdWxlID0ge1xuICAgICAgICAgICAgbmFtZTogcnVsZS5uYW1lLFxuICAgICAgICAgICAgc3RhdHVzOiAnZmFpbGVkJyxcbiAgICAgICAgICAgIHJlc3VsdDogZXJyXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gUmVhZHlcbiAgICAgICAgdGhyb3cgbmV3UnVsZTtcbiAgICB9KTtcbn07XG5cbi8qKlxuICogUnVucyBhdWRpdFxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBhdWRpdHNEYXRhXG4gKiBAcGFyYW0ge29iamVjdH0gdXJsXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSByZXNvbHZlXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSByZWplY3RcbiAqIEByZXR1cm5zXG4gKi9cbmNvbnN0IHJ1bkF1ZGl0ID0gKGF1ZGl0c0RhdGEgPSBbXSwgdXJsID0ge30sIHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGxldCBhbGxEb25lID0gMDtcbiAgICBsZXQgcHJvbWlzZXNDb3VudCA9IDA7XG4gICAgY29uc3QgYXVkaXRzID0ge307XG5cbiAgICBpZiAodHlwZW9mIHJlc29sdmUgIT09ICdmdW5jdGlvbicgfHwgdHlwZW9mIHJlamVjdCAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Jlc29sdmUgYW5kIHJlamVjdCBmdW5jdGlvbnMgbmVlZCB0byBiZSBwcm92aWRlZCcpO1xuICAgIH1cblxuICAgIC8vIFdlIG5lZWQgdG8ga25vdyBob3cgbWFueSBydWxlcyB0aGVyZSBhcmVcbiAgICBhdWRpdHNEYXRhLmZvckVhY2goYXVkaXQgPT4geyBwcm9taXNlc0NvdW50ICs9IChhdWRpdC5ydWxlcyB8fCBbXSkubGVuZ3RoOyB9KTtcblxuICAgIGlmICghYXVkaXRzRGF0YS5sZW5ndGggfHwgcHJvbWlzZXNDb3VudCA9PT0gMCkge1xuICAgICAgICByZXNvbHZlKGF1ZGl0cyk7XG4gICAgfVxuXG4gICAgLy8gTGV0cyBnbyBwZXIgYXVkaXQuLi5cbiAgICBhdWRpdHNEYXRhLmZvckVhY2goYXVkaXQgPT4ge1xuICAgICAgICBhdWRpdHNbYXVkaXQubmFtZV0gPSBbXTtcblxuICAgICAgICBkZXNUZXN0KGBBdWRpdDogJHthdWRpdC5uYW1lfWAsICgpID0+IGF1ZGl0LnJ1bGVzLmZvckVhY2gocnVsZSA9PiBpdFRlc3QoYFJ1bGU6ICR7cnVsZS5uYW1lfWAsIGZ1bmN0aW9uIChkb25lKSB7XG4gICAgICAgICAgICB0aGlzLnRpbWVvdXQoMjAwMDApO1xuXG4gICAgICAgICAgICAvLyBMZXRzIHJ1biB0aGUgcnVsZVxuICAgICAgICAgICAgcnVuUnVsZShydWxlLCB1cmwpXG4gICAgICAgICAgICAudGhlbihuZXdSdWxlID0+IHtcbiAgICAgICAgICAgICAgICAvLyBSZWFkeVxuICAgICAgICAgICAgICAgIGF1ZGl0c1thdWRpdC5uYW1lXS5wdXNoKG5ld1J1bGUpO1xuICAgICAgICAgICAgICAgIGRvbmUoKTtcblxuICAgICAgICAgICAgICAgIGFsbERvbmUgKz0gMTtcbiAgICAgICAgICAgICAgICBpZiAoYWxsRG9uZSA9PT0gcHJvbWlzZXNDb3VudCkgeyByZXNvbHZlKGF1ZGl0cyk7IH1cblxuICAgICAgICAgICAgICAgIHJldHVybiBuZXdSdWxlO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5jYXRjaChuZXdSdWxlID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnIgPSBuZXdSdWxlLnJlc3VsdDtcblxuICAgICAgICAgICAgICAgIC8vIFJlYWR5XG4gICAgICAgICAgICAgICAgYXVkaXRzW2F1ZGl0Lm5hbWVdLnB1c2gobmV3UnVsZSk7XG4gICAgICAgICAgICAgICAgZG9uZShlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyciA6IG5ldyBFcnJvcihKU09OLnN0cmluZ2lmeShlcnIsIG51bGwsIDQpKSk7XG5cbiAgICAgICAgICAgICAgICBhbGxEb25lICs9IDE7XG4gICAgICAgICAgICAgICAgaWYgKGFsbERvbmUgPT09IHByb21pc2VzQ291bnQpIHsgcmVqZWN0KGF1ZGl0cyk7IH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KSkpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGF1ZGl0cztcbn07XG5cbi8qKlxuICogQnVpbGQgYXVkaXRzIGFycmF5XG4gKlxuICogQHBhcmFtIHthcnJheX0gYXVkaXRzXG4gKiBAcmV0dXJucyB7YXJyYXl9XG4gKi9cbmNvbnN0IGJ1aWxkQXVkaXRzID0gKGF1ZGl0cykgPT4ge1xuICAgIGF1ZGl0cyA9ICh0eXBlb2YgYXVkaXRzID09PSAnc3RyaW5nJykgPyBbYXVkaXRzXSA6IGF1ZGl0cztcbiAgICBhdWRpdHMgPSBhdWRpdHMubWFwKHZhbCA9PiB7XG4gICAgICAgIHZhbCA9ICh0eXBlb2YgdmFsID09PSAnb2JqZWN0JykgPyB2YWwgOiB7IHNyYzogdmFsIH07XG5cbiAgICAgICAgLy8gTGV0cyByZXF1aXJlXG4gICAgICAgIGxldCBtb2QgPSBtb2R1bGVzW3ZhbC5zcmNdIHx8IHJlcXVpcmUoZ2V0UHdkKHZhbC5zcmMpKTtcbiAgICAgICAgbW9kID0gKHR5cGVvZiBtb2QgPT09ICdvYmplY3QnICYmIG1vZC5kZWZhdWx0KSA/IG1vZC5kZWZhdWx0IDogbW9kO1xuXG4gICAgICAgIC8vIE5vdyBzZXQgYWxsIGFzIHNob3VsZFxuICAgICAgICB2YWwubmFtZSA9IG1vZC5uYW1lO1xuICAgICAgICB2YWwucnVsZXMgPSBtb2QucnVsZXMubWFwKChydWxlKSA9PiB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHJ1bGUgIT09ICdvYmplY3QnIHx8IGlzQXJyYXkocnVsZSkpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0EgcnVsZSBuZWVkcyB0byBiZSBhbiBvYmplY3QnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCFydWxlLm5hbWUpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0EgcnVsZSBuZWVkcyBhIG5hbWUnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCFydWxlLmZuKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBIHJ1bGUgbmVlZHMgYSBmdW5jdGlvbicpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gcnVsZTtcbiAgICAgICAgfSk7XG4gICAgICAgIHZhbC5pZ25vcmUgPSB2YWwuaWdub3JlIHx8IFtdO1xuXG4gICAgICAgIHJldHVybiB2YWw7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gYXVkaXRzO1xufTtcblxuLyoqXG4gKiBHYXRoZXIgZGF0YVxuICpcbiAqIEBwYXJhbSB7YXJyYXl9IGRhdGFcbiAqIEByZXR1cm5zIHtwcm9taXNlfVxuICovXG5jb25zdCBnYXRoZXJEYXRhID0gKGRhdGEgPSBbXSkgPT4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IHJlcURhdGEgPSBbXTtcbiAgICBjb25zdCBwcm9taXNlc0NvdW50ID0gZGF0YS5sZW5ndGg7XG4gICAgbGV0IGFsbERvbmUgPSAwO1xuXG4gICAgLy8gTm8gbmVlZCB0byBnbyBmdXJ0aGVyIHdpdGhvdXQgZGF0YVxuICAgIGlmICghZGF0YS5sZW5ndGgpIHsgcmV0dXJuIHJlc29sdmUoKTsgfVxuXG4gICAgLy8gR28gdGhyb3VnaCBlYWNoIHJlcXVlc3RcbiAgICBkYXRhLmZvckVhY2goKHJlcSkgPT4gZGVzVGVzdCgnUmVxdWVzdGluZyB1cmxzJywgKCkgPT4gaXRUZXN0KCdHYXRoZXJpbmcgZGF0YS4uLicsIGZ1bmN0aW9uIChkb25lKSB7XG4gICAgICAgIHRoaXMudGltZW91dCgxMDAwMCk7XG5cbiAgICAgICAgLy8gTGV0cyBnZXQgdGhlIHNjcmFwZXIgZGF0YVxuICAgICAgICBydW5TY3JhcGVyKHJlcSkudGhlbigoc2NyYXBEYXRhKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuZXdSZXEgPSBtZXJnZShyZXEsIHtcbiAgICAgICAgICAgICAgICBhdWRpdHNEYXRhOiBidWlsZEF1ZGl0cyhyZXEuYXVkaXRzKSxcbiAgICAgICAgICAgICAgICB1cmxzRGF0YTogc2NyYXBEYXRhXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gUmVhZHlcbiAgICAgICAgICAgIHJlcURhdGEucHVzaChuZXdSZXEpO1xuICAgICAgICAgICAgZG9uZSgpO1xuXG4gICAgICAgICAgICBhbGxEb25lICs9IDE7XG4gICAgICAgICAgICBpZiAoYWxsRG9uZSA9PT0gcHJvbWlzZXNDb3VudCkgeyByZXNvbHZlKHJlcURhdGEpOyB9XG5cbiAgICAgICAgICAgIHJldHVybiBuZXdSZXE7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuZXdSZXEgPSBtZXJnZShyZXEsIHsgZXJyIH0pO1xuXG4gICAgICAgICAgICAvLyBSZWFkeVxuICAgICAgICAgICAgcmVxRGF0YS5wdXNoKG5ld1JlcSk7XG4gICAgICAgICAgICBkb25lKGVycik7XG5cbiAgICAgICAgICAgIGFsbERvbmUgKz0gMTtcbiAgICAgICAgICAgIGlmIChhbGxEb25lID09PSBwcm9taXNlc0NvdW50KSB7IHJlamVjdChyZXFEYXRhKTsgfVxuICAgICAgICB9KTtcbiAgICB9KSkpO1xufSk7XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBhdWRpdHNcbiAqXG4gKiBAcGFyYW0ge29iamVjdHxzdHJpbmd9IGNvbmZpZ1xuICogQHJldHVybnMge3Byb21pc2V9XG4gKi9cbmNvbnN0IHJ1biA9IChjb25maWcpID0+IHtcbiAgICBjb25maWcgPSBjb25maWdHZXQoY29uZmlnKTtcblxuICAgIC8vIExldHMgZ2F0aGVyIGRhdGEgZnJvbSB0aGUgdXJsc1xuICAgIHJldHVybiBnYXRoZXJEYXRhKGNvbmZpZy5kYXRhKVxuICAgIC50aGVuKGRhdGEgPT4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAvLyBHbyB0aHJvdWdoIGVhY2ggZWxlbWVudCBpbiBkYXRhXG4gICAgICAgIC8vIExldHMgcnVuIGF1ZGl0cyBwZXIgcmVxdWVzdFxuICAgICAgICBkYXRhLmZvckVhY2gocmVxID0+IHJlcS51cmxzRGF0YS5mb3JFYWNoKHVybCA9PiB7XG4gICAgICAgICAgICBkZXNUZXN0KGBBdWRpdGluZzogJHt1cmwub3JpZ2luYWxVcmx9YCwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHJ1bkF1ZGl0KHJlcS5hdWRpdHNEYXRhLCB1cmwsIHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSkpO1xuICAgIH0pKTtcbn07XG5cbi8qKlxuICogU2V0cyB1cCB0aGUgdGVzdGluZyBlbnZpcm9ubWVudFxuICpcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IG5ld0Rlc1xuICogQHBhcmFtIHtmdW5jdGlvbn0gbmV3SXRcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IG5ld1dhcm5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gcmVzZXRcbiAqL1xuY29uc3Qgc2V0dXAgPSAobmV3RGVzLCBuZXdJdCwgbmV3V2FybiwgcmVzZXQpID0+IHtcbiAgICBpZiAobmV3RGVzICYmIHR5cGVvZiBuZXdEZXMgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdEZXNjcmliZSBuZWVkcyB0byBiZSBhIGZ1bmN0aW9uJyk7XG4gICAgfVxuXG4gICAgaWYgKG5ld0l0ICYmIHR5cGVvZiBuZXdJdCAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0l0IG5lZWRzIHRvIGJlIGEgZnVuY3Rpb24nKTtcbiAgICB9XG5cbiAgICBpZiAobmV3V2FybiAmJiB0eXBlb2YgbmV3V2FybiAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1dhcm4gbmVlZHMgdG8gYmUgYSBmdW5jdGlvbicpO1xuICAgIH1cblxuICAgIC8vIFJlc2V0XG4gICAgaWYgKHJlc2V0KSB7XG4gICAgICAgIGRlc1Rlc3QgPSBpdFRlc3QgPSBsb2dXYXJuID0gbnVsbDtcbiAgICB9XG5cbiAgICBkZXNUZXN0ID0gbmV3RGVzIHx8IGRlc1Rlc3QgfHwgZnVuY3Rpb24gKG1zZywgY2IpIHtcbiAgICAgICAgY2IoKTtcbiAgICB9O1xuXG4gICAgaXRUZXN0ID0gbmV3SXQgfHwgaXRUZXN0IHx8IGZ1bmN0aW9uIChtc2csIGNiKSB7XG4gICAgICAgIGNvbnN0IG1vZHVsZSA9IHtcbiAgICAgICAgICAgIGRvbmU6IChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdGltZW91dDogKCkgPT4ge31cbiAgICAgICAgfTtcblxuICAgICAgICBjYi5iaW5kKG1vZHVsZSkobW9kdWxlLmRvbmUpO1xuICAgIH07XG5cbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby1jb25zb2xlICovXG4gICAgbG9nV2FybiA9IG5ld1dhcm4gfHwgbG9nV2FybiB8fCBmdW5jdGlvbiAobW9kdWxlLCAuLi5tc2cpIHsgY29uc29sZS53YXJuKG1vZHVsZSwgLi4ubXNnKTsgfTtcbiAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLWNvbnNvbGUgKi9cbn07XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUnVudGltZVxuXG5pZiAoYXJndiAmJiBhcmd2Lm1vY2hhKSB7XG4gICAgLyogZXNsaW50LWRpc2FibGUgbm8tdW5kZWYgKi9cbiAgICBzZXR1cChkZXNjcmliZSwgaXQpO1xuICAgIC8qIGVzbGludC1lbmFibGUgbm8tdW5kZWYgKi9cbn0gZWxzZSB7XG4gICAgc2V0dXAoKTtcbn1cbmFyZ3YgJiYgYXJndi5jb25maWcgJiYgcnVuKGFyZ3YuY29uZmlnKTtcbmV4cG9ydCB7IHNldHVwIH07XG5leHBvcnQgeyBydW4gfTtcblxuLy8gRXNzZW50aWFsbHkgZm9yIHRlc3RpbmcgcHVycG9zZXNcbmV4cG9ydCBjb25zdCBfX3Rlc3RNZXRob2RzX18gPSB7IHJ1biwgc2V0dXAsIGdhdGhlckRhdGEsIGJ1aWxkQXVkaXRzLCBydW5BdWRpdCwgcnVuUnVsZSB9O1xuIl19