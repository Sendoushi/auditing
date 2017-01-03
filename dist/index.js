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
 * @param {array} ignore
 * @returns
 */
var runRule = function runRule() {
    var rule = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var url = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
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
    return rule.fn(url).then(function (ruleData) {
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
                    runRule(rule, url, audit.ignore).then(function (newRule) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJtb2R1bGVzIiwidzMiLCJyZXF1aXJlIiwibG9nV2FybiIsImRlc1Rlc3QiLCJpdFRlc3QiLCJydW5SdWxlIiwicnVsZSIsInVybCIsImlnbm9yZSIsIkVycm9yIiwibmFtZSIsImZuIiwidGhlbiIsInN0YXR1cyIsInJlc3VsdCIsInJ1bGVEYXRhIiwiY2F0Y2giLCJlcnIiLCJkYXRhIiwibmVzdGVkRXJyb3IiLCJtYXAiLCJ2YWwiLCJtc2ciLCJpc0lnbm9yZSIsInJhdyIsInJ1bkF1ZGl0IiwiYXVkaXRzRGF0YSIsInJlc29sdmUiLCJyZWplY3QiLCJhbGxEb25lIiwicHJvbWlzZXNDb3VudCIsImF1ZGl0cyIsImZvckVhY2giLCJhdWRpdCIsInJ1bGVzIiwibGVuZ3RoIiwic2tpcCIsInB1c2giLCJkb25lIiwidGltZW91dCIsIm5ld1J1bGUiLCJKU09OIiwic3RyaW5naWZ5IiwiYnVpbGRBdWRpdHMiLCJzcmMiLCJtb2QiLCJkZWZhdWx0IiwiZ2F0aGVyRGF0YSIsIlByb21pc2UiLCJyZXFEYXRhIiwicmVxIiwic2NyYXBEYXRhIiwibmV3UmVxIiwidXJsc0RhdGEiLCJydW4iLCJjb25maWciLCJvcmlnaW5hbFVybCIsInNldHVwIiwibmV3RGVzIiwibmV3SXQiLCJuZXdXYXJuIiwicmVzZXQiLCJjYiIsIm1vZHVsZSIsImJpbmQiLCJ3YXJuIiwibW9jaGEiLCJkZXNjcmliZSIsIml0Il0sIm1hcHBpbmdzIjoiOztBQUVBO0FBQ0E7Ozs7Ozs7OztBQUVBOztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7QUFDQTs7OztBQUVBO0FBQ0EsSUFBTUEsVUFBVTtBQUNaQyxRQUFJQyxRQUFRLGlCQUFSO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFMWSxDQUFoQjs7QUFRQSxJQUFJQyxnQkFBSjtBQUNBLElBQUlDLGdCQUFKO0FBQ0EsSUFBSUMsZUFBSjs7QUFFQTtBQUNBOztBQUVBOzs7Ozs7OztBQVFBLElB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LEVBQW1CO0FBQzdFLFlBQU1DLFNBQVM7QUFDWHpCLGtCQUFNLGdCQUFNLENBQUUsQ0FESDtBQUVYQyxxQkFBUyxtQkFBTSxDQUFFO0FBRk4sU0FBZjs7QUFLQXVCLFdBQUdFLElBQUgsQ0FBUUQsTUFBUixFQUFnQkEsT0FBT3pCLElBQXZCO0FBQ0gsS0FQRDs7QUFTQTtBQUNBcEMsY0FBVTBELFdBQVcxRCxPQUFYLElBQXNCLFVBQVU2RCxNQUFWLEVBQTBCO0FBQUE7O0FBQUEsMENBQUx6QyxHQUFLO0FBQUxBLGVBQUs7QUFBQTs7QUFBRSw2QkFBUTJDLElBQVIsa0JBQWFGLE1BQWIsU0FBd0J6QyxHQUF4QjtBQUErQixLQUEzRjtBQUNBO0FBQ0gsQ0E5Q0Q7O0FBZ0RBO0FBQ0E7O0FBRUEsSUFBSSxlQUFRLFlBQUs0QyxLQUFqQixFQUF3QjtBQUNwQjtBQUNBVCxVQUFNVSxRQUFOLEVBQWdCQyxFQUFoQjtBQUNBO0FBQ0gsQ0FKRCxNQUlPO0FBQ0hYO0FBQ0g7QUFDRCxlQUFRLFlBQUtGLE1BQWIsSUFBdUJELElBQUksWUFBS0MsTUFBVCxDQUF2QjtRQUNTRSxLLEdBQUFBLEs7UUFDQUgsRyxHQUFBQSxHOztBQUVUIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG5cbid1c2Ugc3RyaWN0Jztcbi8qIGdsb2JhbCBQcm9taXNlICovXG5cbmltcG9ydCB7IGFyZ3YgfSBmcm9tICd5YXJncyc7XG5pbXBvcnQgbWVyZ2UgZnJvbSAnbG9kYXNoL21lcmdlLmpzJztcbmltcG9ydCBpc0FycmF5IGZyb20gJ2xvZGFzaC9pc0FycmF5LmpzJztcbmltcG9ydCB7IHJ1biBhcyBydW5TY3JhcGVyIH0gZnJvbSAnLi9zY3JhcGVyLmpzJztcbmltcG9ydCB7IGdldCBhcyBjb25maWdHZXQgfSBmcm9tICcuL2NvbmZpZy5qcyc7XG5pbXBvcnQgeyBnZXRQd2QsIGNvbnRhaW5zIH0gZnJvbSAnLi91dGlscy5qcyc7XG5cbi8vIEltcG9ydCBtb2R1bGVzXG5jb25zdCBtb2R1bGVzID0ge1xuICAgIHczOiByZXF1aXJlKCcuL21vZHVsZXMvdzMuanMnKVxuICAgIC8vIFRPRE86IFRha2UgY2FyZSBvZiB0aGVzZSBtb2R1bGVzIHRvIGJlIGNvbXBsaWFudC4uLlxuICAgIC8vIHdjYWc6IHJlcXVpcmUoJy4vbW9kdWxlcy93Y2FnLmpzJyksXG4gICAgLy8gU0VPOiByZXF1aXJlKCcuL21vZHVsZXMvc2VvLmpzJyksXG4gICAgLy8gbGlnaHRob3VzZTogcmVxdWlyZSgnLi9tb2R1bGVzL2xpZ2h0aG91c2UuanMnKVxufTtcblxubGV0IGxvZ1dhcm47XG5sZXQgZGVzVGVzdDtcbmxldCBpdFRlc3Q7XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gRnVuY3Rpb25zXG5cbi8qKlxuICogUnVucyB0aGUgcnVsZVxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBydWxlXG4gKiBAcGFyYW0ge29iamVjdH0gdXJsXG4gKiBAcGFyYW0ge2FycmF5fSBpZ25vcmVcbiAqIEByZXR1cm5zXG4gKi9cbmNvbnN0IHJ1blJ1bGUgPSAocnVsZSA9IHt9LCB1cmwgPSB7fSwgaWdub3JlID0gW10pID0+IHtcbiAgICBpZiAodHlwZW9mIHJ1bGUgIT09ICdvYmplY3QnIHx8IGlzQXJyYXkocnVsZSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBIHJ1bGUgbmVlZHMgdG8gYmUgYW4gb2JqZWN0Jyk7XG4gICAgfVxuXG4gICAgaWYgKCFydWxlLm5hbWUgfHwgdHlwZW9mIHJ1bGUubmFtZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBIHJ1bGUgbmVlZHMgYSBzdHJpbmcgbmFtZScpO1xuICAgIH1cblxuICAgIGlmICghcnVsZS5mbiB8fCB0eXBlb2YgcnVsZS5mbiAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0EgcnVsZSBuZWVkcyBhIGZ1bmN0aW9uIGZuJyk7XG4gICAgfVxuXG4gICAgLy8gTGV0cyBydW4gdGhlIHByb21pc2UgYW5kIHBhcnNlIHRoZSBkYXRhXG4gICAgcmV0dXJuIHJ1bGUuZm4odXJsKS50aGVuKHJ1bGVEYXRhID0+IG1lcmdlKHtcbiAgICAgICAgbmFtZTogcnVsZS5uYW1lLFxuICAgICAgICBzdGF0dXM6ICdwYXNzZWQnLFxuICAgICAgICByZXN1bHQ6IHJ1bGVEYXRhXG4gICAgfSkpXG4gICAgLmNhdGNoKGVyciA9PiAoe1xuICAgICAgICBuYW1lOiBydWxlLm5hbWUsXG4gICAgICAgIHN0YXR1czogJ2ZhaWxlZCcsXG4gICAgICAgIHJlc3VsdDogZXJyXG4gICAgfSkpXG4gICAgLnRoZW4oZGF0YSA9PiB7XG4gICAgICAgIC8vIElzIHRoaXMgaWdub3JlZCBhbHJlYWR5P1xuICAgICAgICBpZiAoY29udGFpbnMoaWdub3JlLCBkYXRhLm5hbWUpKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIG5hbWU6IGRhdGEubmFtZSxcbiAgICAgICAgICAgICAgICBzdGF0dXM6ICdpZ25vcmVkJyxcbiAgICAgICAgICAgICAgICByZXN1bHQ6IGZhbHNlXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVGhlcmUgd2FzIGFuIGVycm9yIGJlZm9yZVxuICAgICAgICBpZiAoZGF0YS5zdGF0dXMgPT09ICdmYWlsZWQnKSB7XG4gICAgICAgICAgICB0aHJvdyBkYXRhO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTm8gbmVlZCB0byBnbyBmdXJ0aGVyIHdpdGhvdXQgYW4gYXJyYXlcbiAgICAgICAgaWYgKCFpc0FycmF5KGRhdGEucmVzdWx0KSkge1xuICAgICAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBMZXRzIGNoZWNrIGZvciBuZXN0ZWRpc3N1ZXMuLi5cbiAgICAgICAgbGV0IG5lc3RlZEVycm9yID0gZmFsc2U7XG4gICAgICAgIGRhdGEucmVzdWx0ID0gZGF0YS5yZXN1bHQubWFwKHZhbCA9PiB7XG4gICAgICAgICAgICBpZiAoIXZhbCB8fCB0eXBlb2YgdmFsICE9PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgIHZhbCA9IHtcbiAgICAgICAgICAgICAgICAgICAgbXNnOiB2YWwubXNnLFxuICAgICAgICAgICAgICAgICAgICByZXN1bHQ6ICdSdWxlIGFycmF5IHJlc3VsdCBpdGVtIHNob3VsZCBiZSBhbiBvYmplY3QnLFxuICAgICAgICAgICAgICAgICAgICBzdGF0dXM6ICdmYWlsZWQnXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCF2YWwuc3RhdHVzIHx8IHR5cGVvZiB2YWwuc3RhdHVzICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIHZhbCA9IHtcbiAgICAgICAgICAgICAgICAgICAgbXNnOiB2YWwubXNnLFxuICAgICAgICAgICAgICAgICAgICByZXN1bHQ6ICdSdWxlIGFycmF5IHJlc3VsdCBpdGVtIHNob3VsZCBoYXZlIGEgc3RyaW5nIHN0YXR1cycsXG4gICAgICAgICAgICAgICAgICAgIHN0YXR1czogJ2ZhaWxlZCdcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIXZhbC5tc2cgfHwgdHlwZW9mIHZhbC5tc2cgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgdmFsID0ge1xuICAgICAgICAgICAgICAgICAgICBtc2c6ICcnLFxuICAgICAgICAgICAgICAgICAgICByZXN1bHQ6ICdSdWxlIGFycmF5IHJlc3VsdCBpdGVtIHNob3VsZCBoYXZlIGEgc3RyaW5nIG1zZycsXG4gICAgICAgICAgICAgICAgICAgIHN0YXR1czogJ2ZhaWxlZCdcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBMZXRzIGNoZWNrIGlmIHdlIHNob3VsZCBpZ25vcmUgaXQuLi5cbiAgICAgICAgICAgIGNvbnN0IGlzSWdub3JlID0gY29udGFpbnMoaWdub3JlLCB2YWwubXNnKSB8fCBjb250YWlucyhpZ25vcmUsIHZhbC5yYXcpO1xuICAgICAgICAgICAgdmFsLnN0YXR1cyA9IGlzSWdub3JlID8gJ2lnbm9yZWQnIDogdmFsLnN0YXR1cztcblxuICAgICAgICAgICAgaWYgKHZhbC5zdGF0dXMgIT09ICdpZ25vcmVkJykge1xuICAgICAgICAgICAgICAgIC8vIFdlIG5lZWQgdG8gdGFrZSBjYXJlIG9mIHN0YXR1cy4uLlxuICAgICAgICAgICAgICAgIGlmICh2YWwuc3RhdHVzID09PSAnd2FybmluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgbG9nV2FybihydWxlLm5hbWUsIHZhbC5tc2csIHZhbC5yYXcpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodmFsLnN0YXR1cyA9PT0gJ2ZhaWxlZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgbmVzdGVkRXJyb3IgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHZhbC5zdGF0dXMgPSAncGFzc2VkJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB2YWw7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFRoZXJlIHdhcyBhbiBlcnJvciBvbiB0aGUgbmVzdGVkIG9uZXNcbiAgICAgICAgaWYgKG5lc3RlZEVycm9yKSB7XG4gICAgICAgICAgICBkYXRhLnN0YXR1cyA9ICdmYWlsZWQnO1xuICAgICAgICAgICAgdGhyb3cgZGF0YTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE5vIHdvcnJpZXMsIHBhc3MgdGhlIGRhdGFcbiAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfSk7XG59O1xuXG4vKipcbiAqIFJ1bnMgYXVkaXRcbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gYXVkaXRzRGF0YVxuICogQHBhcmFtIHtvYmplY3R9IHVybFxuICogQHBhcmFtIHtmdW5jdGlvbn0gcmVzb2x2ZVxuICogQHBhcmFtIHtmdW5jdGlvbn0gcmVqZWN0XG4gKiBAcmV0dXJuc1xuICovXG5jb25zdCBydW5BdWRpdCA9IChhdWRpdHNEYXRhID0gW10sIHVybCA9IHt9LCByZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBsZXQgYWxsRG9uZSA9IDA7XG4gICAgbGV0IHByb21pc2VzQ291bnQgPSAwO1xuICAgIGNvbnN0IGF1ZGl0cyA9IHt9O1xuXG4gICAgaWYgKHR5cGVvZiByZXNvbHZlICE9PSAnZnVuY3Rpb24nIHx8IHR5cGVvZiByZWplY3QgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdSZXNvbHZlIGFuZCByZWplY3QgZnVuY3Rpb25zIG5lZWQgdG8gYmUgcHJvdmlkZWQnKTtcbiAgICB9XG5cbiAgICAvLyBXZSBuZWVkIHRvIGtub3cgaG93IG1hbnkgcnVsZXMgdGhlcmUgYXJlXG4gICAgYXVkaXRzRGF0YS5mb3JFYWNoKGF1ZGl0ID0+IHsgcHJvbWlzZXNDb3VudCArPSAoYXVkaXQucnVsZXMgfHwgW10pLmxlbmd0aDsgfSk7XG5cbiAgICBpZiAoIWF1ZGl0c0RhdGEubGVuZ3RoIHx8IHByb21pc2VzQ291bnQgPT09IDApIHtcbiAgICAgICAgcmVzb2x2ZShhdWRpdHMpO1xuICAgIH1cblxuICAgIC8vIExldHMgZ28gcGVyIGF1ZGl0Li4uXG4gICAgYXVkaXRzRGF0YS5mb3JFYWNoKGF1ZGl0ID0+IHtcbiAgICAgICAgYXVkaXRzW2F1ZGl0Lm5hbWVdID0gW107XG5cbiAgICAgICAgZGVzVGVzdChgQXVkaXQ6ICR7YXVkaXQubmFtZX1gLCAoKSA9PiBhdWRpdC5ydWxlcy5mb3JFYWNoKHJ1bGUgPT4ge1xuICAgICAgICAgICAgY29uc3QgaXNJZ25vcmUgPSBjb250YWlucyhhdWRpdC5pZ25vcmUsIHJ1bGUubmFtZSk7XG5cbiAgICAgICAgICAgIC8vIFdlIG1heSBuZWVkIHRvIGlnbm9yZSBpdFxuICAgICAgICAgICAgaWYgKGlzSWdub3JlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGl0VGVzdC5za2lwKGBSdWxlOiAke3J1bGUubmFtZX1gLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIENhY2hlIGl0IHNvIHdlIGtub3cgaXQgbGF0ZXJcbiAgICAgICAgICAgICAgICAgICAgYXVkaXRzW2F1ZGl0Lm5hbWVdLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogcnVsZS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiAnaWdub3JlZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQ6IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIGFsbERvbmUgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFsbERvbmUgPT09IHByb21pc2VzQ291bnQpIHsgcmVzb2x2ZShhdWRpdHMpOyB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIExldHMgYWN0dWFsbHkgcnVuIHRoZSBydWxlXG4gICAgICAgICAgICBpdFRlc3QoYFJ1bGU6ICR7cnVsZS5uYW1lfWAsIGZ1bmN0aW9uIChkb25lKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50aW1lb3V0KDIwMDAwKTtcblxuICAgICAgICAgICAgICAgIC8vIExldHMgcnVuIHRoZSBydWxlXG4gICAgICAgICAgICAgICAgcnVuUnVsZShydWxlLCB1cmwsIGF1ZGl0Lmlnbm9yZSlcbiAgICAgICAgICAgICAgICAudGhlbihuZXdSdWxlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gUmVhZHlcbiAgICAgICAgICAgICAgICAgICAgYXVkaXRzW2F1ZGl0Lm5hbWVdLnB1c2gobmV3UnVsZSk7XG4gICAgICAgICAgICAgICAgICAgIGRvbmUoKTtcblxuICAgICAgICAgICAgICAgICAgICBhbGxEb25lICs9IDE7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhbGxEb25lID09PSBwcm9taXNlc0NvdW50KSB7IHJlc29sdmUoYXVkaXRzKTsgfVxuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXdSdWxlO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmNhdGNoKG5ld1J1bGUgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnIgPSBuZXdSdWxlLnJlc3VsdDtcblxuICAgICAgICAgICAgICAgICAgICAvLyBSZWFkeVxuICAgICAgICAgICAgICAgICAgICBhdWRpdHNbYXVkaXQubmFtZV0ucHVzaChuZXdSdWxlKTtcbiAgICAgICAgICAgICAgICAgICAgZG9uZShlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyciA6IG5ldyBFcnJvcihKU09OLnN0cmluZ2lmeShlcnIsIG51bGwsIDQpKSk7XG5cbiAgICAgICAgICAgICAgICAgICAgYWxsRG9uZSArPSAxO1xuICAgICAgICAgICAgICAgICAgICBpZiAoYWxsRG9uZSA9PT0gcHJvbWlzZXNDb3VudCkgeyByZWplY3QoYXVkaXRzKTsgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBhdWRpdHM7XG59O1xuXG4vKipcbiAqIEJ1aWxkIGF1ZGl0cyBhcnJheVxuICpcbiAqIEBwYXJhbSB7YXJyYXl9IGF1ZGl0c1xuICogQHJldHVybnMge2FycmF5fVxuICovXG5jb25zdCBidWlsZEF1ZGl0cyA9IChhdWRpdHMpID0+IHtcbiAgICBhdWRpdHMgPSAodHlwZW9mIGF1ZGl0cyA9PT0gJ3N0cmluZycpID8gW2F1ZGl0c10gOiBhdWRpdHM7XG4gICAgYXVkaXRzID0gYXVkaXRzLm1hcCh2YWwgPT4ge1xuICAgICAgICB2YWwgPSAodHlwZW9mIHZhbCA9PT0gJ29iamVjdCcpID8gdmFsIDogeyBzcmM6IHZhbCB9O1xuXG4gICAgICAgIC8vIExldHMgcmVxdWlyZVxuICAgICAgICBsZXQgbW9kID0gbW9kdWxlc1t2YWwuc3JjXSB8fCByZXF1aXJlKGdldFB3ZCh2YWwuc3JjKSk7XG4gICAgICAgIG1vZCA9ICh0eXBlb2YgbW9kID09PSAnb2JqZWN0JyAmJiBtb2QuZGVmYXVsdCkgPyBtb2QuZGVmYXVsdCA6IG1vZDtcblxuICAgICAgICAvLyBOb3cgc2V0IGFsbCBhcyBzaG91bGRcbiAgICAgICAgdmFsLm5hbWUgPSBtb2QubmFtZTtcbiAgICAgICAgdmFsLnJ1bGVzID0gbW9kLnJ1bGVzLm1hcCgocnVsZSkgPT4ge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBydWxlICE9PSAnb2JqZWN0JyB8fCBpc0FycmF5KHJ1bGUpKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBIHJ1bGUgbmVlZHMgdG8gYmUgYW4gb2JqZWN0Jyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghcnVsZS5uYW1lKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBIHJ1bGUgbmVlZHMgYSBuYW1lJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghcnVsZS5mbikge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQSBydWxlIG5lZWRzIGEgZnVuY3Rpb24nKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHJ1bGU7XG4gICAgICAgIH0pO1xuICAgICAgICB2YWwuaWdub3JlID0gdmFsLmlnbm9yZSB8fCBbXTtcblxuICAgICAgICByZXR1cm4gdmFsO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGF1ZGl0cztcbn07XG5cbi8qKlxuICogR2F0aGVyIGRhdGFcbiAqXG4gKiBAcGFyYW0ge2FycmF5fSBkYXRhXG4gKiBAcmV0dXJucyB7cHJvbWlzZX1cbiAqL1xuY29uc3QgZ2F0aGVyRGF0YSA9IChkYXRhID0gW10pID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBjb25zdCByZXFEYXRhID0gW107XG4gICAgY29uc3QgcHJvbWlzZXNDb3VudCA9IGRhdGEubGVuZ3RoO1xuICAgIGxldCBhbGxEb25lID0gMDtcblxuICAgIC8vIE5vIG5lZWQgdG8gZ28gZnVydGhlciB3aXRob3V0IGRhdGFcbiAgICBpZiAoIWRhdGEubGVuZ3RoKSB7IHJldHVybiByZXNvbHZlKCk7IH1cblxuICAgIC8vIEdvIHRocm91Z2ggZWFjaCByZXF1ZXN0XG4gICAgZGF0YS5mb3JFYWNoKChyZXEpID0+IGRlc1Rlc3QoJ1JlcXVlc3RpbmcgdXJscycsICgpID0+IGl0VGVzdCgnR2F0aGVyaW5nIGRhdGEuLi4nLCBmdW5jdGlvbiAoZG9uZSkge1xuICAgICAgICB0aGlzLnRpbWVvdXQoMTAwMDApO1xuXG4gICAgICAgIC8vIExldHMgZ2V0IHRoZSBzY3JhcGVyIGRhdGFcbiAgICAgICAgcnVuU2NyYXBlcihyZXEpLnRoZW4oKHNjcmFwRGF0YSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbmV3UmVxID0gbWVyZ2UocmVxLCB7XG4gICAgICAgICAgICAgICAgYXVkaXRzRGF0YTogYnVpbGRBdWRpdHMocmVxLmF1ZGl0cyksXG4gICAgICAgICAgICAgICAgdXJsc0RhdGE6IHNjcmFwRGF0YVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIFJlYWR5XG4gICAgICAgICAgICByZXFEYXRhLnB1c2gobmV3UmVxKTtcbiAgICAgICAgICAgIGRvbmUoKTtcblxuICAgICAgICAgICAgYWxsRG9uZSArPSAxO1xuICAgICAgICAgICAgaWYgKGFsbERvbmUgPT09IHByb21pc2VzQ291bnQpIHsgcmVzb2x2ZShyZXFEYXRhKTsgfVxuXG4gICAgICAgICAgICByZXR1cm4gbmV3UmVxO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgY29uc3QgbmV3UmVxID0gbWVyZ2UocmVxLCB7IGVyciB9KTtcblxuICAgICAgICAgICAgLy8gUmVhZHlcbiAgICAgICAgICAgIHJlcURhdGEucHVzaChuZXdSZXEpO1xuICAgICAgICAgICAgZG9uZShlcnIpO1xuXG4gICAgICAgICAgICBhbGxEb25lICs9IDE7XG4gICAgICAgICAgICBpZiAoYWxsRG9uZSA9PT0gcHJvbWlzZXNDb3VudCkgeyByZWplY3QocmVxRGF0YSk7IH1cbiAgICAgICAgfSk7XG4gICAgfSkpKTtcbn0pO1xuXG4vKipcbiAqIEluaXRpYWxpemUgYXVkaXRzXG4gKlxuICogQHBhcmFtIHtvYmplY3R8c3RyaW5nfSBjb25maWdcbiAqIEByZXR1cm5zIHtwcm9taXNlfVxuICovXG5jb25zdCBydW4gPSAoY29uZmlnKSA9PiB7XG4gICAgY29uZmlnID0gY29uZmlnR2V0KGNvbmZpZyk7XG5cbiAgICAvLyBMZXRzIGdhdGhlciBkYXRhIGZyb20gdGhlIHVybHNcbiAgICByZXR1cm4gZ2F0aGVyRGF0YShjb25maWcuZGF0YSlcbiAgICAudGhlbihkYXRhID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgLy8gR28gdGhyb3VnaCBlYWNoIGVsZW1lbnQgaW4gZGF0YVxuICAgICAgICAvLyBMZXRzIHJ1biBhdWRpdHMgcGVyIHJlcXVlc3RcbiAgICAgICAgZGF0YS5mb3JFYWNoKHJlcSA9PiByZXEudXJsc0RhdGEuZm9yRWFjaCh1cmwgPT4ge1xuICAgICAgICAgICAgZGVzVGVzdChgQXVkaXRpbmc6ICR7dXJsLm9yaWdpbmFsVXJsfWAsICgpID0+IHtcbiAgICAgICAgICAgICAgICBydW5BdWRpdChyZXEuYXVkaXRzRGF0YSwgdXJsLCByZXNvbHZlLCByZWplY3QpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pKTtcbiAgICB9KSk7XG59O1xuXG4vKipcbiAqIFNldHMgdXAgdGhlIHRlc3RpbmcgZW52aXJvbm1lbnRcbiAqXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBuZXdEZXNcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IG5ld0l0XG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBuZXdXYXJuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IHJlc2V0XG4gKi9cbmNvbnN0IHNldHVwID0gKG5ld0RlcywgbmV3SXQsIG5ld1dhcm4sIHJlc2V0KSA9PiB7XG4gICAgaWYgKG5ld0RlcyAmJiB0eXBlb2YgbmV3RGVzICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignRGVzY3JpYmUgbmVlZHMgdG8gYmUgYSBmdW5jdGlvbicpO1xuICAgIH1cblxuICAgIGlmIChuZXdJdCAmJiB0eXBlb2YgbmV3SXQgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJdCBuZWVkcyB0byBiZSBhIGZ1bmN0aW9uJyk7XG4gICAgfVxuXG4gICAgaWYgKG5ld1dhcm4gJiYgdHlwZW9mIG5ld1dhcm4gIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdXYXJuIG5lZWRzIHRvIGJlIGEgZnVuY3Rpb24nKTtcbiAgICB9XG5cbiAgICAvLyBSZXNldFxuICAgIGlmIChyZXNldCkge1xuICAgICAgICBkZXNUZXN0ID0gaXRUZXN0ID0gbG9nV2FybiA9IG51bGw7XG4gICAgfVxuXG4gICAgZGVzVGVzdCA9IG5ld0RlcyB8fCBkZXNUZXN0IHx8IGZ1bmN0aW9uIChtc2csIGNiKSB7XG4gICAgICAgIGNiKCk7XG4gICAgfTtcblxuICAgIGl0VGVzdCA9IG5ld0l0IHx8IGl0VGVzdCB8fCBmdW5jdGlvbiAobXNnLCBjYikge1xuICAgICAgICBjb25zdCBtb2R1bGUgPSB7XG4gICAgICAgICAgICBkb25lOiAoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHRpbWVvdXQ6ICgpID0+IHt9XG4gICAgICAgIH07XG5cbiAgICAgICAgY2IuYmluZChtb2R1bGUpKG1vZHVsZS5kb25lKTtcbiAgICB9O1xuICAgIGl0VGVzdC5za2lwID0gbmV3SXQgJiYgbmV3SXQuc2tpcCB8fCBpdFRlc3QgJiYgaXRUZXN0LnNraXAgfHwgZnVuY3Rpb24gKG1zZywgY2IpIHtcbiAgICAgICAgY29uc3QgbW9kdWxlID0ge1xuICAgICAgICAgICAgZG9uZTogKCkgPT4ge30sXG4gICAgICAgICAgICB0aW1lb3V0OiAoKSA9PiB7fVxuICAgICAgICB9O1xuXG4gICAgICAgIGNiLmJpbmQobW9kdWxlKShtb2R1bGUuZG9uZSk7XG4gICAgfTtcblxuICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLWNvbnNvbGUgKi9cbiAgICBsb2dXYXJuID0gbmV3V2FybiB8fCBsb2dXYXJuIHx8IGZ1bmN0aW9uIChtb2R1bGUsIC4uLm1zZykgeyBjb25zb2xlLndhcm4obW9kdWxlLCAuLi5tc2cpOyB9O1xuICAgIC8qIGVzbGludC1lbmFibGUgbm8tY29uc29sZSAqL1xufTtcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBSdW50aW1lXG5cbmlmIChhcmd2ICYmIGFyZ3YubW9jaGEpIHtcbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby11bmRlZiAqL1xuICAgIHNldHVwKGRlc2NyaWJlLCBpdCk7XG4gICAgLyogZXNsaW50LWVuYWJsZSBuby11bmRlZiAqL1xufSBlbHNlIHtcbiAgICBzZXR1cCgpO1xufVxuYXJndiAmJiBhcmd2LmNvbmZpZyAmJiBydW4oYXJndi5jb25maWcpO1xuZXhwb3J0IHsgc2V0dXAgfTtcbmV4cG9ydCB7IHJ1biB9O1xuXG4vLyBFc3NlbnRpYWxseSBmb3IgdGVzdGluZyBwdXJwb3Nlc1xuZXhwb3J0IGNvbnN0IF9fdGVzdE1ldGhvZHNfXyA9IHsgcnVuLCBzZXR1cCwgZ2F0aGVyRGF0YSwgYnVpbGRBdWRpdHMsIHJ1bkF1ZGl0LCBydW5SdWxlIH07XG4iXX0=