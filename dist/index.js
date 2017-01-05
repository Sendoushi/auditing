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
    bestPractices: require('./modules/bestPractices.js')
    // w3: require('./modules/w3.js')
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
 * @param {object} src
 * @param {array} ignore
 * @returns
 */
var runRule = function runRule() {
    var rule = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var src = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var ignore = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

    if ((typeof rule === 'undefined' ? 'undefined' : _typeof(rule)) !== 'object' || (0, _isArray2.default)(rule)) {
        throw new Error('A rule needs to be an object');
    }

    if (!rule.name || typeof rule.name !== 'string') {
        throw new Error('A rule needs a string name');
    }

    if (!rule.fn || typeof rule.fn !== 'function') {
        throw new Error('A rule needs a function fn');
    }

    // Lets run the promise and parse the data
    return rule.fn(src).then(function (ruleData) {
        return (0, _merge2.default)({
            name: rule.name,
            status: 'passed',
            result: ruleData
        });
    }).catch(function (err) {
        return {
            name: rule.name,
            status: 'failed',
            result: err
        };
    }).then(function (data) {
        // Is this ignored already?
        if ((0, _utils.contains)(ignore, data.name)) {
            return {
                name: data.name,
                status: 'ignored',
                result: false
            };
        }

        // There was an error before
        if (data.status === 'failed') {
            throw data;
        }

        // No need to go further without an array
        if (!(0, _isArray2.default)(data.result)) {
            return data;
        }

        // Lets check for nestedissues...
        var nestedError = false;
        data.result = data.result.map(function (val) {
            if (!val || (typeof val === 'undefined' ? 'undefined' : _typeof(val)) !== 'object') {
                val = {
                    msg: val.msg,
                    result: 'Rule array result item should be an object',
                    status: 'failed'
                };
            }

            if (!val.status || typeof val.status !== 'string') {
                val = {
                    msg: val.msg,
                    result: 'Rule array result item should have a string status',
                    status: 'failed'
                };
            }

            if (!val.msg || typeof val.msg !== 'string') {
                val = {
                    msg: '',
                    result: 'Rule array result item should have a string msg',
                    status: 'failed'
                };
            }

            // Lets check if we should ignore it...
            var isIgnore = (0, _utils.contains)(ignore, val.msg) || (0, _utils.contains)(ignore, val.raw);
            val.status = isIgnore ? 'ignored' : val.status;

            if (val.status !== 'ignored') {
                // We need to take care of status...
                if (val.status === 'warning') {
                    logWarn(rule.name, val.msg, val.raw);
                } else if (val.status === 'failed') {
                    nestedError = true;
                } else {
                    val.status = 'passed';
                }
            }

            return val;
        });

        // There was an error on the nested ones
        if (nestedError) {
            data.status = 'failed';
            throw data;
        }

        // No worries, pass the data
        return data;
    });
};

/**
 * Runs audit
 *
 * @param {object} auditsData
 * @param {object} src
 * @param {function} resolve
 * @param {function} reject
 * @returns
 */
var runAudit = function runAudit() {
    var auditsData = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var src = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
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
                var isIgnore = (0, _utils.contains)(audit.ignore, rule.name);

                // We may need to ignore it
                if (isIgnore) {
                    return itTest.skip('Rule: ' + rule.name, function () {
                        // Cache it so we know it later
                        audits[audit.name].push({
                            name: rule.name,
                            status: 'ignored',
                            result: false
                        });

                        allDone += 1;
                        if (allDone === promisesCount) {
                            resolve(audits);
                        }
                    });
                }

                // Lets actually run the rule
                itTest('Rule: ' + rule.name, function (done) {
                    this.timeout(20000);

                    // Lets run the rule
                    runRule(rule, src, audit.ignore).then(function (newRule) {
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
            return desTest('Requesting src', function () {
                return itTest('Gathering data...', function (done) {
                    this.timeout(10000);

                    // Lets get the scraper data
                    (0, _scraper.run)(req).then(function (scrapData) {
                        var newReq = (0, _merge2.default)(req, {
                            auditsData: buildAudits(req.audits),
                            srcData: scrapData
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

    // Lets gather data from the src
    return gatherData(config.data).then(function (data) {
        return new Promise(function (resolve, reject) {
            // Go through each element in data
            // Lets run audits per request
            data.forEach(function (req) {
                return req.srcData.forEach(function (src) {
                    desTest('Auditing: ' + src.originalSrc, function () {
                        runAudit(req.auditsData, src, resolve, reject);
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
            done: function done() {},
            timeout: function timeout() {}
        };

        cb.bind(module)(module.done);
    };
    itTest.skip = newIt && newIt.skip || itTest && itTest.skip || function (msg, cb) {
        var module = {
            done: function done() {},
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJtb2R1bGVzIiwiYmVzdFByYWN0aWNlcyIsInJlcXVpcmUiLCJsb2dXYXJuIiwiZGVzVGVzdCIsIml0VGVzdCIsInJ1blJ1bGUiLCJydWxlIiwic3JjIiwiaWdub3JlIiwiRXJyb3IiLCJuYW1lIiwiZm4iLCJ0aGVuIiwic3RhdHVzIiwicmVzdWx0IiwicnVsZURhdGEiLCJjYXRjaCIsImVyciIsImRhdGEiLCJuZXN0ZWRFcnJvciIsIm1hcCIsInZhbCIsIm1zZyIsImlzSWdub3JlIiwicmF3IiwicnVuQXVkaXQiLCJhdWRpdHNEYXRhIiwicmVzb2x2ZSIsInJlamVjdCIsImFsbERvbmUiLCJwcm9taXNlc0NvdW50IiwiYXVkaXRzIiwiZm9yRWFjaCIsImF1ZGl0IiwicnVsZXMiLCJsZW5ndGgiLCJza2lwIiwicHVzaCIsImRvbmUiLCJ0aW1lb3V0IiwibmV3UnVsZSIsIkpTT04iLCJzdHJpbmdpZnkiLCJidWlsZEF1ZGl0cyIsIm1vZCIsImRlZmF1bHQiLCJnYXRoZXJEYXRhIiwiUHJvbWlzZSIsInJlcURhdGEiLCJyZXEiLCJzY3JhcERhdGEiLCJuZXdSZXEiLCJzcmNEYXRhIiwicnVuIiwiY29uZmlnIiwib3JpZ2luYWxTcmMiLCJzZXR1cCIsIm5ld0RlcyIsIm5ld0l0IiwibmV3V2FybiIsInJlc2V0IiwiY2IiLCJtb2R1bGUiLCJiaW5kIiwid2FybiIsIm1vY2hhIiwiZGVzY3JpYmUiLCJpdCJdLCJtYXBwaW5ncyI6Ijs7QUFFQTtBQUNBOzs7Ozs7Ozs7QUFFQTs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7QUFFQTtBQUNBLElBQU1BLFVBQVU7QUFDWkMsbUJBQWVDLFFBQVEsNEJBQVI7QUFDZjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBTlksQ0FBaEI7O0FBU0EsSUFBSUMsZ0JBQUo7QUFDQSxJQUFJQyxnQkFBSjtBQUNBLElBQUlDLGVBQUo7O0FBRUE7QUFDQTs7QUFFQTs7Ozs7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SDtBQUVYQyxxQkFBUyxtQkFBTSxDQUFFO0FBRk4sU0FBZjs7QUFLQXNCLFdBQUdFLElBQUgsQ0FBUUQsTUFBUixFQUFnQkEsT0FBT3hCLElBQXZCO0FBQ0gsS0FQRDs7QUFTQTtBQUNBcEMsY0FBVXlELFdBQVd6RCxPQUFYLElBQXNCLFVBQVU0RCxNQUFWLEVBQTBCO0FBQUE7O0FBQUEsMENBQUx4QyxHQUFLO0FBQUxBLGVBQUs7QUFBQTs7QUFBRSw2QkFBUTBDLElBQVIsa0JBQWFGLE1BQWIsU0FBd0J4QyxHQUF4QjtBQUErQixLQUEzRjtBQUNBO0FBQ0gsQ0ExQ0Q7O0FBNENBO0FBQ0E7O0FBRUEsSUFBSSxlQUFRLFlBQUsyQyxLQUFqQixFQUF3QjtBQUNwQjtBQUNBVCxVQUFNVSxRQUFOLEVBQWdCQyxFQUFoQjtBQUNBO0FBQ0gsQ0FKRCxNQUlPO0FBQ0hYO0FBQ0g7QUFDRCxlQUFRLFlBQUtGLE1BQWIsSUFBdUJELElBQUksWUFBS0MsTUFBVCxDQUF2QjtRQUNTRSxLLEdBQUFBLEs7UUFDQUgsRyxHQUFBQSxHOztBQUVUIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG5cbid1c2Ugc3RyaWN0Jztcbi8qIGdsb2JhbCBQcm9taXNlICovXG5cbmltcG9ydCB7IGFyZ3YgfSBmcm9tICd5YXJncyc7XG5pbXBvcnQgbWVyZ2UgZnJvbSAnbG9kYXNoL21lcmdlLmpzJztcbmltcG9ydCBpc0FycmF5IGZyb20gJ2xvZGFzaC9pc0FycmF5LmpzJztcbmltcG9ydCB7IHJ1biBhcyBydW5TY3JhcGVyIH0gZnJvbSAnLi9zY3JhcGVyLmpzJztcbmltcG9ydCB7IGdldCBhcyBjb25maWdHZXQgfSBmcm9tICcuL2NvbmZpZy5qcyc7XG5pbXBvcnQgeyBnZXRQd2QsIGNvbnRhaW5zIH0gZnJvbSAnLi91dGlscy5qcyc7XG5cbi8vIEltcG9ydCBtb2R1bGVzXG5jb25zdCBtb2R1bGVzID0ge1xuICAgIGJlc3RQcmFjdGljZXM6IHJlcXVpcmUoJy4vbW9kdWxlcy9iZXN0UHJhY3RpY2VzLmpzJylcbiAgICAvLyB3MzogcmVxdWlyZSgnLi9tb2R1bGVzL3czLmpzJylcbiAgICAvLyBUT0RPOiBUYWtlIGNhcmUgb2YgdGhlc2UgbW9kdWxlcyB0byBiZSBjb21wbGlhbnQuLi5cbiAgICAvLyB3Y2FnOiByZXF1aXJlKCcuL21vZHVsZXMvd2NhZy5qcycpLFxuICAgIC8vIFNFTzogcmVxdWlyZSgnLi9tb2R1bGVzL3Nlby5qcycpLFxuICAgIC8vIGxpZ2h0aG91c2U6IHJlcXVpcmUoJy4vbW9kdWxlcy9saWdodGhvdXNlLmpzJylcbn07XG5cbmxldCBsb2dXYXJuO1xubGV0IGRlc1Rlc3Q7XG5sZXQgaXRUZXN0O1xuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEZ1bmN0aW9uc1xuXG4vKipcbiAqIFJ1bnMgdGhlIHJ1bGVcbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gcnVsZVxuICogQHBhcmFtIHtvYmplY3R9IHNyY1xuICogQHBhcmFtIHthcnJheX0gaWdub3JlXG4gKiBAcmV0dXJuc1xuICovXG5jb25zdCBydW5SdWxlID0gKHJ1bGUgPSB7fSwgc3JjID0ge30sIGlnbm9yZSA9IFtdKSA9PiB7XG4gICAgaWYgKHR5cGVvZiBydWxlICE9PSAnb2JqZWN0JyB8fCBpc0FycmF5KHJ1bGUpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQSBydWxlIG5lZWRzIHRvIGJlIGFuIG9iamVjdCcpO1xuICAgIH1cblxuICAgIGlmICghcnVsZS5uYW1lIHx8IHR5cGVvZiBydWxlLm5hbWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQSBydWxlIG5lZWRzIGEgc3RyaW5nIG5hbWUnKTtcbiAgICB9XG5cbiAgICBpZiAoIXJ1bGUuZm4gfHwgdHlwZW9mIHJ1bGUuZm4gIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBIHJ1bGUgbmVlZHMgYSBmdW5jdGlvbiBmbicpO1xuICAgIH1cblxuICAgIC8vIExldHMgcnVuIHRoZSBwcm9taXNlIGFuZCBwYXJzZSB0aGUgZGF0YVxuICAgIHJldHVybiBydWxlLmZuKHNyYykudGhlbihydWxlRGF0YSA9PiBtZXJnZSh7XG4gICAgICAgIG5hbWU6IHJ1bGUubmFtZSxcbiAgICAgICAgc3RhdHVzOiAncGFzc2VkJyxcbiAgICAgICAgcmVzdWx0OiBydWxlRGF0YVxuICAgIH0pKVxuICAgIC5jYXRjaChlcnIgPT4gKHtcbiAgICAgICAgbmFtZTogcnVsZS5uYW1lLFxuICAgICAgICBzdGF0dXM6ICdmYWlsZWQnLFxuICAgICAgICByZXN1bHQ6IGVyclxuICAgIH0pKVxuICAgIC50aGVuKGRhdGEgPT4ge1xuICAgICAgICAvLyBJcyB0aGlzIGlnbm9yZWQgYWxyZWFkeT9cbiAgICAgICAgaWYgKGNvbnRhaW5zKGlnbm9yZSwgZGF0YS5uYW1lKSkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBuYW1lOiBkYXRhLm5hbWUsXG4gICAgICAgICAgICAgICAgc3RhdHVzOiAnaWdub3JlZCcsXG4gICAgICAgICAgICAgICAgcmVzdWx0OiBmYWxzZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRoZXJlIHdhcyBhbiBlcnJvciBiZWZvcmVcbiAgICAgICAgaWYgKGRhdGEuc3RhdHVzID09PSAnZmFpbGVkJykge1xuICAgICAgICAgICAgdGhyb3cgZGF0YTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE5vIG5lZWQgdG8gZ28gZnVydGhlciB3aXRob3V0IGFuIGFycmF5XG4gICAgICAgIGlmICghaXNBcnJheShkYXRhLnJlc3VsdCkpIHtcbiAgICAgICAgICAgIHJldHVybiBkYXRhO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTGV0cyBjaGVjayBmb3IgbmVzdGVkaXNzdWVzLi4uXG4gICAgICAgIGxldCBuZXN0ZWRFcnJvciA9IGZhbHNlO1xuICAgICAgICBkYXRhLnJlc3VsdCA9IGRhdGEucmVzdWx0Lm1hcCh2YWwgPT4ge1xuICAgICAgICAgICAgaWYgKCF2YWwgfHwgdHlwZW9mIHZhbCAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICB2YWwgPSB7XG4gICAgICAgICAgICAgICAgICAgIG1zZzogdmFsLm1zZyxcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0OiAnUnVsZSBhcnJheSByZXN1bHQgaXRlbSBzaG91bGQgYmUgYW4gb2JqZWN0JyxcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiAnZmFpbGVkJ1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghdmFsLnN0YXR1cyB8fCB0eXBlb2YgdmFsLnN0YXR1cyAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICB2YWwgPSB7XG4gICAgICAgICAgICAgICAgICAgIG1zZzogdmFsLm1zZyxcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0OiAnUnVsZSBhcnJheSByZXN1bHQgaXRlbSBzaG91bGQgaGF2ZSBhIHN0cmluZyBzdGF0dXMnLFxuICAgICAgICAgICAgICAgICAgICBzdGF0dXM6ICdmYWlsZWQnXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCF2YWwubXNnIHx8IHR5cGVvZiB2YWwubXNnICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIHZhbCA9IHtcbiAgICAgICAgICAgICAgICAgICAgbXNnOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0OiAnUnVsZSBhcnJheSByZXN1bHQgaXRlbSBzaG91bGQgaGF2ZSBhIHN0cmluZyBtc2cnLFxuICAgICAgICAgICAgICAgICAgICBzdGF0dXM6ICdmYWlsZWQnXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gTGV0cyBjaGVjayBpZiB3ZSBzaG91bGQgaWdub3JlIGl0Li4uXG4gICAgICAgICAgICBjb25zdCBpc0lnbm9yZSA9IGNvbnRhaW5zKGlnbm9yZSwgdmFsLm1zZykgfHwgY29udGFpbnMoaWdub3JlLCB2YWwucmF3KTtcbiAgICAgICAgICAgIHZhbC5zdGF0dXMgPSBpc0lnbm9yZSA/ICdpZ25vcmVkJyA6IHZhbC5zdGF0dXM7XG5cbiAgICAgICAgICAgIGlmICh2YWwuc3RhdHVzICE9PSAnaWdub3JlZCcpIHtcbiAgICAgICAgICAgICAgICAvLyBXZSBuZWVkIHRvIHRha2UgY2FyZSBvZiBzdGF0dXMuLi5cbiAgICAgICAgICAgICAgICBpZiAodmFsLnN0YXR1cyA9PT0gJ3dhcm5pbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvZ1dhcm4ocnVsZS5uYW1lLCB2YWwubXNnLCB2YWwucmF3KTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHZhbC5zdGF0dXMgPT09ICdmYWlsZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgIG5lc3RlZEVycm9yID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB2YWwuc3RhdHVzID0gJ3Bhc3NlZCc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdmFsO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBUaGVyZSB3YXMgYW4gZXJyb3Igb24gdGhlIG5lc3RlZCBvbmVzXG4gICAgICAgIGlmIChuZXN0ZWRFcnJvcikge1xuICAgICAgICAgICAgZGF0YS5zdGF0dXMgPSAnZmFpbGVkJztcbiAgICAgICAgICAgIHRocm93IGRhdGE7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBObyB3b3JyaWVzLCBwYXNzIHRoZSBkYXRhXG4gICAgICAgIHJldHVybiBkYXRhO1xuICAgIH0pO1xufTtcblxuLyoqXG4gKiBSdW5zIGF1ZGl0XG4gKlxuICogQHBhcmFtIHtvYmplY3R9IGF1ZGl0c0RhdGFcbiAqIEBwYXJhbSB7b2JqZWN0fSBzcmNcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IHJlc29sdmVcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IHJlamVjdFxuICogQHJldHVybnNcbiAqL1xuY29uc3QgcnVuQXVkaXQgPSAoYXVkaXRzRGF0YSA9IFtdLCBzcmMgPSB7fSwgcmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgbGV0IGFsbERvbmUgPSAwO1xuICAgIGxldCBwcm9taXNlc0NvdW50ID0gMDtcbiAgICBjb25zdCBhdWRpdHMgPSB7fTtcblxuICAgIGlmICh0eXBlb2YgcmVzb2x2ZSAhPT0gJ2Z1bmN0aW9uJyB8fCB0eXBlb2YgcmVqZWN0ICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignUmVzb2x2ZSBhbmQgcmVqZWN0IGZ1bmN0aW9ucyBuZWVkIHRvIGJlIHByb3ZpZGVkJyk7XG4gICAgfVxuXG4gICAgLy8gV2UgbmVlZCB0byBrbm93IGhvdyBtYW55IHJ1bGVzIHRoZXJlIGFyZVxuICAgIGF1ZGl0c0RhdGEuZm9yRWFjaChhdWRpdCA9PiB7IHByb21pc2VzQ291bnQgKz0gKGF1ZGl0LnJ1bGVzIHx8IFtdKS5sZW5ndGg7IH0pO1xuXG4gICAgaWYgKCFhdWRpdHNEYXRhLmxlbmd0aCB8fCBwcm9taXNlc0NvdW50ID09PSAwKSB7XG4gICAgICAgIHJlc29sdmUoYXVkaXRzKTtcbiAgICB9XG5cbiAgICAvLyBMZXRzIGdvIHBlciBhdWRpdC4uLlxuICAgIGF1ZGl0c0RhdGEuZm9yRWFjaChhdWRpdCA9PiB7XG4gICAgICAgIGF1ZGl0c1thdWRpdC5uYW1lXSA9IFtdO1xuXG4gICAgICAgIGRlc1Rlc3QoYEF1ZGl0OiAke2F1ZGl0Lm5hbWV9YCwgKCkgPT4gYXVkaXQucnVsZXMuZm9yRWFjaChydWxlID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGlzSWdub3JlID0gY29udGFpbnMoYXVkaXQuaWdub3JlLCBydWxlLm5hbWUpO1xuXG4gICAgICAgICAgICAvLyBXZSBtYXkgbmVlZCB0byBpZ25vcmUgaXRcbiAgICAgICAgICAgIGlmIChpc0lnbm9yZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpdFRlc3Quc2tpcChgUnVsZTogJHtydWxlLm5hbWV9YCwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAvLyBDYWNoZSBpdCBzbyB3ZSBrbm93IGl0IGxhdGVyXG4gICAgICAgICAgICAgICAgICAgIGF1ZGl0c1thdWRpdC5uYW1lXS5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHJ1bGUubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1czogJ2lnbm9yZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0OiBmYWxzZVxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICBhbGxEb25lICs9IDE7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhbGxEb25lID09PSBwcm9taXNlc0NvdW50KSB7IHJlc29sdmUoYXVkaXRzKTsgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBMZXRzIGFjdHVhbGx5IHJ1biB0aGUgcnVsZVxuICAgICAgICAgICAgaXRUZXN0KGBSdWxlOiAke3J1bGUubmFtZX1gLCBmdW5jdGlvbiAoZG9uZSkge1xuICAgICAgICAgICAgICAgIHRoaXMudGltZW91dCgyMDAwMCk7XG5cbiAgICAgICAgICAgICAgICAvLyBMZXRzIHJ1biB0aGUgcnVsZVxuICAgICAgICAgICAgICAgIHJ1blJ1bGUocnVsZSwgc3JjLCBhdWRpdC5pZ25vcmUpXG4gICAgICAgICAgICAgICAgLnRoZW4obmV3UnVsZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFJlYWR5XG4gICAgICAgICAgICAgICAgICAgIGF1ZGl0c1thdWRpdC5uYW1lXS5wdXNoKG5ld1J1bGUpO1xuICAgICAgICAgICAgICAgICAgICBkb25lKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgYWxsRG9uZSArPSAxO1xuICAgICAgICAgICAgICAgICAgICBpZiAoYWxsRG9uZSA9PT0gcHJvbWlzZXNDb3VudCkgeyByZXNvbHZlKGF1ZGl0cyk7IH1cblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3UnVsZTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5jYXRjaChuZXdSdWxlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyID0gbmV3UnVsZS5yZXN1bHQ7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gUmVhZHlcbiAgICAgICAgICAgICAgICAgICAgYXVkaXRzW2F1ZGl0Lm5hbWVdLnB1c2gobmV3UnVsZSk7XG4gICAgICAgICAgICAgICAgICAgIGRvbmUoZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIgOiBuZXcgRXJyb3IoSlNPTi5zdHJpbmdpZnkoZXJyLCBudWxsLCA0KSkpO1xuXG4gICAgICAgICAgICAgICAgICAgIGFsbERvbmUgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFsbERvbmUgPT09IHByb21pc2VzQ291bnQpIHsgcmVqZWN0KGF1ZGl0cyk7IH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gYXVkaXRzO1xufTtcblxuLyoqXG4gKiBCdWlsZCBhdWRpdHMgYXJyYXlcbiAqXG4gKiBAcGFyYW0ge2FycmF5fSBhdWRpdHNcbiAqIEByZXR1cm5zIHthcnJheX1cbiAqL1xuY29uc3QgYnVpbGRBdWRpdHMgPSAoYXVkaXRzKSA9PiB7XG4gICAgYXVkaXRzID0gKHR5cGVvZiBhdWRpdHMgPT09ICdzdHJpbmcnKSA/IFthdWRpdHNdIDogYXVkaXRzO1xuICAgIGF1ZGl0cyA9IGF1ZGl0cy5tYXAodmFsID0+IHtcbiAgICAgICAgdmFsID0gKHR5cGVvZiB2YWwgPT09ICdvYmplY3QnKSA/IHZhbCA6IHsgc3JjOiB2YWwgfTtcblxuICAgICAgICAvLyBMZXRzIHJlcXVpcmVcbiAgICAgICAgbGV0IG1vZCA9IG1vZHVsZXNbdmFsLnNyY10gfHwgcmVxdWlyZShnZXRQd2QodmFsLnNyYykpO1xuICAgICAgICBtb2QgPSAodHlwZW9mIG1vZCA9PT0gJ29iamVjdCcgJiYgbW9kLmRlZmF1bHQpID8gbW9kLmRlZmF1bHQgOiBtb2Q7XG5cbiAgICAgICAgLy8gTm93IHNldCBhbGwgYXMgc2hvdWxkXG4gICAgICAgIHZhbC5uYW1lID0gbW9kLm5hbWU7XG4gICAgICAgIHZhbC5ydWxlcyA9IG1vZC5ydWxlcy5tYXAoKHJ1bGUpID0+IHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcnVsZSAhPT0gJ29iamVjdCcgfHwgaXNBcnJheShydWxlKSkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQSBydWxlIG5lZWRzIHRvIGJlIGFuIG9iamVjdCcpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIXJ1bGUubmFtZSkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQSBydWxlIG5lZWRzIGEgbmFtZScpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIXJ1bGUuZm4pIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0EgcnVsZSBuZWVkcyBhIGZ1bmN0aW9uJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBydWxlO1xuICAgICAgICB9KTtcbiAgICAgICAgdmFsLmlnbm9yZSA9IHZhbC5pZ25vcmUgfHwgW107XG5cbiAgICAgICAgcmV0dXJuIHZhbDtcbiAgICB9KTtcblxuICAgIHJldHVybiBhdWRpdHM7XG59O1xuXG4vKipcbiAqIEdhdGhlciBkYXRhXG4gKlxuICogQHBhcmFtIHthcnJheX0gZGF0YVxuICogQHJldHVybnMge3Byb21pc2V9XG4gKi9cbmNvbnN0IGdhdGhlckRhdGEgPSAoZGF0YSA9IFtdKSA9PiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc3QgcmVxRGF0YSA9IFtdO1xuICAgIGNvbnN0IHByb21pc2VzQ291bnQgPSBkYXRhLmxlbmd0aDtcbiAgICBsZXQgYWxsRG9uZSA9IDA7XG5cbiAgICAvLyBObyBuZWVkIHRvIGdvIGZ1cnRoZXIgd2l0aG91dCBkYXRhXG4gICAgaWYgKCFkYXRhLmxlbmd0aCkgeyByZXR1cm4gcmVzb2x2ZSgpOyB9XG5cbiAgICAvLyBHbyB0aHJvdWdoIGVhY2ggcmVxdWVzdFxuICAgIGRhdGEuZm9yRWFjaCgocmVxKSA9PiBkZXNUZXN0KCdSZXF1ZXN0aW5nIHNyYycsICgpID0+IGl0VGVzdCgnR2F0aGVyaW5nIGRhdGEuLi4nLCBmdW5jdGlvbiAoZG9uZSkge1xuICAgICAgICB0aGlzLnRpbWVvdXQoMTAwMDApO1xuXG4gICAgICAgIC8vIExldHMgZ2V0IHRoZSBzY3JhcGVyIGRhdGFcbiAgICAgICAgcnVuU2NyYXBlcihyZXEpLnRoZW4oKHNjcmFwRGF0YSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbmV3UmVxID0gbWVyZ2UocmVxLCB7XG4gICAgICAgICAgICAgICAgYXVkaXRzRGF0YTogYnVpbGRBdWRpdHMocmVxLmF1ZGl0cyksXG4gICAgICAgICAgICAgICAgc3JjRGF0YTogc2NyYXBEYXRhXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gUmVhZHlcbiAgICAgICAgICAgIHJlcURhdGEucHVzaChuZXdSZXEpO1xuICAgICAgICAgICAgZG9uZSgpO1xuXG4gICAgICAgICAgICBhbGxEb25lICs9IDE7XG4gICAgICAgICAgICBpZiAoYWxsRG9uZSA9PT0gcHJvbWlzZXNDb3VudCkgeyByZXNvbHZlKHJlcURhdGEpOyB9XG5cbiAgICAgICAgICAgIHJldHVybiBuZXdSZXE7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuZXdSZXEgPSBtZXJnZShyZXEsIHsgZXJyIH0pO1xuXG4gICAgICAgICAgICAvLyBSZWFkeVxuICAgICAgICAgICAgcmVxRGF0YS5wdXNoKG5ld1JlcSk7XG4gICAgICAgICAgICBkb25lKGVycik7XG5cbiAgICAgICAgICAgIGFsbERvbmUgKz0gMTtcbiAgICAgICAgICAgIGlmIChhbGxEb25lID09PSBwcm9taXNlc0NvdW50KSB7IHJlamVjdChyZXFEYXRhKTsgfVxuICAgICAgICB9KTtcbiAgICB9KSkpO1xufSk7XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBhdWRpdHNcbiAqXG4gKiBAcGFyYW0ge29iamVjdHxzdHJpbmd9IGNvbmZpZ1xuICogQHJldHVybnMge3Byb21pc2V9XG4gKi9cbmNvbnN0IHJ1biA9IChjb25maWcpID0+IHtcbiAgICBjb25maWcgPSBjb25maWdHZXQoY29uZmlnKTtcblxuICAgIC8vIExldHMgZ2F0aGVyIGRhdGEgZnJvbSB0aGUgc3JjXG4gICAgcmV0dXJuIGdhdGhlckRhdGEoY29uZmlnLmRhdGEpXG4gICAgLnRoZW4oZGF0YSA9PiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIC8vIEdvIHRocm91Z2ggZWFjaCBlbGVtZW50IGluIGRhdGFcbiAgICAgICAgLy8gTGV0cyBydW4gYXVkaXRzIHBlciByZXF1ZXN0XG4gICAgICAgIGRhdGEuZm9yRWFjaChyZXEgPT4gcmVxLnNyY0RhdGEuZm9yRWFjaChzcmMgPT4ge1xuICAgICAgICAgICAgZGVzVGVzdChgQXVkaXRpbmc6ICR7c3JjLm9yaWdpbmFsU3JjfWAsICgpID0+IHtcbiAgICAgICAgICAgICAgICBydW5BdWRpdChyZXEuYXVkaXRzRGF0YSwgc3JjLCByZXNvbHZlLCByZWplY3QpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pKTtcbiAgICB9KSk7XG59O1xuXG4vKipcbiAqIFNldHMgdXAgdGhlIHRlc3RpbmcgZW52aXJvbm1lbnRcbiAqXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBuZXdEZXNcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IG5ld0l0XG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBuZXdXYXJuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IHJlc2V0XG4gKi9cbmNvbnN0IHNldHVwID0gKG5ld0RlcywgbmV3SXQsIG5ld1dhcm4sIHJlc2V0KSA9PiB7XG4gICAgaWYgKG5ld0RlcyAmJiB0eXBlb2YgbmV3RGVzICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignRGVzY3JpYmUgbmVlZHMgdG8gYmUgYSBmdW5jdGlvbicpO1xuICAgIH1cblxuICAgIGlmIChuZXdJdCAmJiB0eXBlb2YgbmV3SXQgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJdCBuZWVkcyB0byBiZSBhIGZ1bmN0aW9uJyk7XG4gICAgfVxuXG4gICAgaWYgKG5ld1dhcm4gJiYgdHlwZW9mIG5ld1dhcm4gIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdXYXJuIG5lZWRzIHRvIGJlIGEgZnVuY3Rpb24nKTtcbiAgICB9XG5cbiAgICAvLyBSZXNldFxuICAgIGlmIChyZXNldCkge1xuICAgICAgICBkZXNUZXN0ID0gaXRUZXN0ID0gbG9nV2FybiA9IG51bGw7XG4gICAgfVxuXG4gICAgZGVzVGVzdCA9IG5ld0RlcyB8fCBkZXNUZXN0IHx8IGZ1bmN0aW9uIChtc2csIGNiKSB7XG4gICAgICAgIGNiKCk7XG4gICAgfTtcblxuICAgIGl0VGVzdCA9IG5ld0l0IHx8IGl0VGVzdCB8fCBmdW5jdGlvbiAobXNnLCBjYikge1xuICAgICAgICBjb25zdCBtb2R1bGUgPSB7XG4gICAgICAgICAgICBkb25lOiAoKSA9PiB7fSxcbiAgICAgICAgICAgIHRpbWVvdXQ6ICgpID0+IHt9XG4gICAgICAgIH07XG5cbiAgICAgICAgY2IuYmluZChtb2R1bGUpKG1vZHVsZS5kb25lKTtcbiAgICB9O1xuICAgIGl0VGVzdC5za2lwID0gbmV3SXQgJiYgbmV3SXQuc2tpcCB8fCBpdFRlc3QgJiYgaXRUZXN0LnNraXAgfHwgZnVuY3Rpb24gKG1zZywgY2IpIHtcbiAgICAgICAgY29uc3QgbW9kdWxlID0ge1xuICAgICAgICAgICAgZG9uZTogKCkgPT4ge30sXG4gICAgICAgICAgICB0aW1lb3V0OiAoKSA9PiB7fVxuICAgICAgICB9O1xuXG4gICAgICAgIGNiLmJpbmQobW9kdWxlKShtb2R1bGUuZG9uZSk7XG4gICAgfTtcblxuICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLWNvbnNvbGUgKi9cbiAgICBsb2dXYXJuID0gbmV3V2FybiB8fCBsb2dXYXJuIHx8IGZ1bmN0aW9uIChtb2R1bGUsIC4uLm1zZykgeyBjb25zb2xlLndhcm4obW9kdWxlLCAuLi5tc2cpOyB9O1xuICAgIC8qIGVzbGludC1lbmFibGUgbm8tY29uc29sZSAqL1xufTtcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBSdW50aW1lXG5cbmlmIChhcmd2ICYmIGFyZ3YubW9jaGEpIHtcbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby11bmRlZiAqL1xuICAgIHNldHVwKGRlc2NyaWJlLCBpdCk7XG4gICAgLyogZXNsaW50LWVuYWJsZSBuby11bmRlZiAqL1xufSBlbHNlIHtcbiAgICBzZXR1cCgpO1xufVxuYXJndiAmJiBhcmd2LmNvbmZpZyAmJiBydW4oYXJndi5jb25maWcpO1xuZXhwb3J0IHsgc2V0dXAgfTtcbmV4cG9ydCB7IHJ1biB9O1xuXG4vLyBFc3NlbnRpYWxseSBmb3IgdGVzdGluZyBwdXJwb3Nlc1xuZXhwb3J0IGNvbnN0IF9fdGVzdE1ldGhvZHNfXyA9IHsgcnVuLCBzZXR1cCwgZ2F0aGVyRGF0YSwgYnVpbGRBdWRpdHMsIHJ1bkF1ZGl0LCBydW5SdWxlIH07XG4iXX0=