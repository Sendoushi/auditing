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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJtb2R1bGVzIiwidzMiLCJyZXF1aXJlIiwibG9nV2FybiIsImRlc1Rlc3QiLCJpdFRlc3QiLCJydW5SdWxlIiwicnVsZSIsInNyYyIsImlnbm9yZSIsIkVycm9yIiwibmFtZSIsImZuIiwidGhlbiIsInN0YXR1cyIsInJlc3VsdCIsInJ1bGVEYXRhIiwiY2F0Y2giLCJlcnIiLCJkYXRhIiwibmVzdGVkRXJyb3IiLCJtYXAiLCJ2YWwiLCJtc2ciLCJpc0lnbm9yZSIsInJhdyIsInJ1bkF1ZGl0IiwiYXVkaXRzRGF0YSIsInJlc29sdmUiLCJyZWplY3QiLCJhbGxEb25lIiwicHJvbWlzZXNDb3VudCIsImF1ZGl0cyIsImZvckVhY2giLCJhdWRpdCIsInJ1bGVzIiwibGVuZ3RoIiwic2tpcCIsInB1c2giLCJkb25lIiwidGltZW91dCIsIm5ld1J1bGUiLCJKU09OIiwic3RyaW5naWZ5IiwiYnVpbGRBdWRpdHMiLCJtb2QiLCJkZWZhdWx0IiwiZ2F0aGVyRGF0YSIsIlByb21pc2UiLCJyZXFEYXRhIiwicmVxIiwic2NyYXBEYXRhIiwibmV3UmVxIiwic3JjRGF0YSIsInJ1biIsImNvbmZpZyIsIm9yaWdpbmFsU3JjIiwic2V0dXAiLCJuZXdEZXMiLCJuZXdJdCIsIm5ld1dhcm4iLCJyZXNldCIsImNiIiwibW9kdWxlIiwiYmluZCIsIndhcm4iLCJtb2NoYSIsImRlc2NyaWJlIiwiaXQiXSwibWFwcGluZ3MiOiI7O0FBRUE7QUFDQTs7Ozs7Ozs7O0FBRUE7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOztBQUNBOztBQUNBOzs7O0FBRUE7QUFDQSxJQUFNQSxVQUFVO0FBQ1pDLFFBQUlDLFFBQVEsaUJBQVI7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUxZLENBQWhCOztBQVFBLElBQUlDLGdCQUFKO0FBQ0EsSUFBSUMsZ0JBQUo7QUFDQSxJQUFJQyxlQUFKOztBQUVBO0FBQ0E7O0FBRUE7Ozs7Ozs7O0FBUUEsSUFBTUMsVUFB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LFlBQU1DLFNBQVM7QUFDWHhCLGtCQUFNLGdCQUFNLENBQUUsQ0FESDtBQUVYQyxxQkFBUyxtQkFBTSxDQUFFO0FBRk4sU0FBZjs7QUFLQXNCLFdBQUdFLElBQUgsQ0FBUUQsTUFBUixFQUFnQkEsT0FBT3hCLElBQXZCO0FBQ0gsS0FQRDs7QUFTQTtBQUNBcEMsY0FBVXlELFdBQVd6RCxPQUFYLElBQXNCLFVBQVU0RCxNQUFWLEVBQTBCO0FBQUE7O0FBQUEsMENBQUx4QyxHQUFLO0FBQUxBLGVBQUs7QUFBQTs7QUFBRSw2QkFBUTBDLElBQVIsa0JBQWFGLE1BQWIsU0FBd0J4QyxHQUF4QjtBQUErQixLQUEzRjtBQUNBO0FBQ0gsQ0E5Q0Q7O0FBZ0RBO0FBQ0E7O0FBRUEsSUFBSSxlQUFRLFlBQUsyQyxLQUFqQixFQUF3QjtBQUNwQjtBQUNBVCxVQUFNVSxRQUFOLEVBQWdCQyxFQUFoQjtBQUNBO0FBQ0gsQ0FKRCxNQUlPO0FBQ0hYO0FBQ0g7QUFDRCxlQUFRLFlBQUtGLE1BQWIsSUFBdUJELElBQUksWUFBS0MsTUFBVCxDQUF2QjtRQUNTRSxLLEdBQUFBLEs7UUFDQUgsRyxHQUFBQSxHOztBQUVUIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG5cbid1c2Ugc3RyaWN0Jztcbi8qIGdsb2JhbCBQcm9taXNlICovXG5cbmltcG9ydCB7IGFyZ3YgfSBmcm9tICd5YXJncyc7XG5pbXBvcnQgbWVyZ2UgZnJvbSAnbG9kYXNoL21lcmdlLmpzJztcbmltcG9ydCBpc0FycmF5IGZyb20gJ2xvZGFzaC9pc0FycmF5LmpzJztcbmltcG9ydCB7IHJ1biBhcyBydW5TY3JhcGVyIH0gZnJvbSAnLi9zY3JhcGVyLmpzJztcbmltcG9ydCB7IGdldCBhcyBjb25maWdHZXQgfSBmcm9tICcuL2NvbmZpZy5qcyc7XG5pbXBvcnQgeyBnZXRQd2QsIGNvbnRhaW5zIH0gZnJvbSAnLi91dGlscy5qcyc7XG5cbi8vIEltcG9ydCBtb2R1bGVzXG5jb25zdCBtb2R1bGVzID0ge1xuICAgIHczOiByZXF1aXJlKCcuL21vZHVsZXMvdzMuanMnKVxuICAgIC8vIFRPRE86IFRha2UgY2FyZSBvZiB0aGVzZSBtb2R1bGVzIHRvIGJlIGNvbXBsaWFudC4uLlxuICAgIC8vIHdjYWc6IHJlcXVpcmUoJy4vbW9kdWxlcy93Y2FnLmpzJyksXG4gICAgLy8gU0VPOiByZXF1aXJlKCcuL21vZHVsZXMvc2VvLmpzJyksXG4gICAgLy8gbGlnaHRob3VzZTogcmVxdWlyZSgnLi9tb2R1bGVzL2xpZ2h0aG91c2UuanMnKVxufTtcblxubGV0IGxvZ1dhcm47XG5sZXQgZGVzVGVzdDtcbmxldCBpdFRlc3Q7XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gRnVuY3Rpb25zXG5cbi8qKlxuICogUnVucyB0aGUgcnVsZVxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBydWxlXG4gKiBAcGFyYW0ge29iamVjdH0gc3JjXG4gKiBAcGFyYW0ge2FycmF5fSBpZ25vcmVcbiAqIEByZXR1cm5zXG4gKi9cbmNvbnN0IHJ1blJ1bGUgPSAocnVsZSA9IHt9LCBzcmMgPSB7fSwgaWdub3JlID0gW10pID0+IHtcbiAgICBpZiAodHlwZW9mIHJ1bGUgIT09ICdvYmplY3QnIHx8IGlzQXJyYXkocnVsZSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBIHJ1bGUgbmVlZHMgdG8gYmUgYW4gb2JqZWN0Jyk7XG4gICAgfVxuXG4gICAgaWYgKCFydWxlLm5hbWUgfHwgdHlwZW9mIHJ1bGUubmFtZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBIHJ1bGUgbmVlZHMgYSBzdHJpbmcgbmFtZScpO1xuICAgIH1cblxuICAgIGlmICghcnVsZS5mbiB8fCB0eXBlb2YgcnVsZS5mbiAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0EgcnVsZSBuZWVkcyBhIGZ1bmN0aW9uIGZuJyk7XG4gICAgfVxuXG4gICAgLy8gTGV0cyBydW4gdGhlIHByb21pc2UgYW5kIHBhcnNlIHRoZSBkYXRhXG4gICAgcmV0dXJuIHJ1bGUuZm4oc3JjKS50aGVuKHJ1bGVEYXRhID0+IG1lcmdlKHtcbiAgICAgICAgbmFtZTogcnVsZS5uYW1lLFxuICAgICAgICBzdGF0dXM6ICdwYXNzZWQnLFxuICAgICAgICByZXN1bHQ6IHJ1bGVEYXRhXG4gICAgfSkpXG4gICAgLmNhdGNoKGVyciA9PiAoe1xuICAgICAgICBuYW1lOiBydWxlLm5hbWUsXG4gICAgICAgIHN0YXR1czogJ2ZhaWxlZCcsXG4gICAgICAgIHJlc3VsdDogZXJyXG4gICAgfSkpXG4gICAgLnRoZW4oZGF0YSA9PiB7XG4gICAgICAgIC8vIElzIHRoaXMgaWdub3JlZCBhbHJlYWR5P1xuICAgICAgICBpZiAoY29udGFpbnMoaWdub3JlLCBkYXRhLm5hbWUpKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIG5hbWU6IGRhdGEubmFtZSxcbiAgICAgICAgICAgICAgICBzdGF0dXM6ICdpZ25vcmVkJyxcbiAgICAgICAgICAgICAgICByZXN1bHQ6IGZhbHNlXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVGhlcmUgd2FzIGFuIGVycm9yIGJlZm9yZVxuICAgICAgICBpZiAoZGF0YS5zdGF0dXMgPT09ICdmYWlsZWQnKSB7XG4gICAgICAgICAgICB0aHJvdyBkYXRhO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTm8gbmVlZCB0byBnbyBmdXJ0aGVyIHdpdGhvdXQgYW4gYXJyYXlcbiAgICAgICAgaWYgKCFpc0FycmF5KGRhdGEucmVzdWx0KSkge1xuICAgICAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBMZXRzIGNoZWNrIGZvciBuZXN0ZWRpc3N1ZXMuLi5cbiAgICAgICAgbGV0IG5lc3RlZEVycm9yID0gZmFsc2U7XG4gICAgICAgIGRhdGEucmVzdWx0ID0gZGF0YS5yZXN1bHQubWFwKHZhbCA9PiB7XG4gICAgICAgICAgICBpZiAoIXZhbCB8fCB0eXBlb2YgdmFsICE9PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgIHZhbCA9IHtcbiAgICAgICAgICAgICAgICAgICAgbXNnOiB2YWwubXNnLFxuICAgICAgICAgICAgICAgICAgICByZXN1bHQ6ICdSdWxlIGFycmF5IHJlc3VsdCBpdGVtIHNob3VsZCBiZSBhbiBvYmplY3QnLFxuICAgICAgICAgICAgICAgICAgICBzdGF0dXM6ICdmYWlsZWQnXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCF2YWwuc3RhdHVzIHx8IHR5cGVvZiB2YWwuc3RhdHVzICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIHZhbCA9IHtcbiAgICAgICAgICAgICAgICAgICAgbXNnOiB2YWwubXNnLFxuICAgICAgICAgICAgICAgICAgICByZXN1bHQ6ICdSdWxlIGFycmF5IHJlc3VsdCBpdGVtIHNob3VsZCBoYXZlIGEgc3RyaW5nIHN0YXR1cycsXG4gICAgICAgICAgICAgICAgICAgIHN0YXR1czogJ2ZhaWxlZCdcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIXZhbC5tc2cgfHwgdHlwZW9mIHZhbC5tc2cgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgdmFsID0ge1xuICAgICAgICAgICAgICAgICAgICBtc2c6ICcnLFxuICAgICAgICAgICAgICAgICAgICByZXN1bHQ6ICdSdWxlIGFycmF5IHJlc3VsdCBpdGVtIHNob3VsZCBoYXZlIGEgc3RyaW5nIG1zZycsXG4gICAgICAgICAgICAgICAgICAgIHN0YXR1czogJ2ZhaWxlZCdcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBMZXRzIGNoZWNrIGlmIHdlIHNob3VsZCBpZ25vcmUgaXQuLi5cbiAgICAgICAgICAgIGNvbnN0IGlzSWdub3JlID0gY29udGFpbnMoaWdub3JlLCB2YWwubXNnKSB8fCBjb250YWlucyhpZ25vcmUsIHZhbC5yYXcpO1xuICAgICAgICAgICAgdmFsLnN0YXR1cyA9IGlzSWdub3JlID8gJ2lnbm9yZWQnIDogdmFsLnN0YXR1cztcblxuICAgICAgICAgICAgaWYgKHZhbC5zdGF0dXMgIT09ICdpZ25vcmVkJykge1xuICAgICAgICAgICAgICAgIC8vIFdlIG5lZWQgdG8gdGFrZSBjYXJlIG9mIHN0YXR1cy4uLlxuICAgICAgICAgICAgICAgIGlmICh2YWwuc3RhdHVzID09PSAnd2FybmluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgbG9nV2FybihydWxlLm5hbWUsIHZhbC5tc2csIHZhbC5yYXcpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodmFsLnN0YXR1cyA9PT0gJ2ZhaWxlZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgbmVzdGVkRXJyb3IgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHZhbC5zdGF0dXMgPSAncGFzc2VkJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB2YWw7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFRoZXJlIHdhcyBhbiBlcnJvciBvbiB0aGUgbmVzdGVkIG9uZXNcbiAgICAgICAgaWYgKG5lc3RlZEVycm9yKSB7XG4gICAgICAgICAgICBkYXRhLnN0YXR1cyA9ICdmYWlsZWQnO1xuICAgICAgICAgICAgdGhyb3cgZGF0YTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE5vIHdvcnJpZXMsIHBhc3MgdGhlIGRhdGFcbiAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfSk7XG59O1xuXG4vKipcbiAqIFJ1bnMgYXVkaXRcbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gYXVkaXRzRGF0YVxuICogQHBhcmFtIHtvYmplY3R9IHNyY1xuICogQHBhcmFtIHtmdW5jdGlvbn0gcmVzb2x2ZVxuICogQHBhcmFtIHtmdW5jdGlvbn0gcmVqZWN0XG4gKiBAcmV0dXJuc1xuICovXG5jb25zdCBydW5BdWRpdCA9IChhdWRpdHNEYXRhID0gW10sIHNyYyA9IHt9LCByZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBsZXQgYWxsRG9uZSA9IDA7XG4gICAgbGV0IHByb21pc2VzQ291bnQgPSAwO1xuICAgIGNvbnN0IGF1ZGl0cyA9IHt9O1xuXG4gICAgaWYgKHR5cGVvZiByZXNvbHZlICE9PSAnZnVuY3Rpb24nIHx8IHR5cGVvZiByZWplY3QgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdSZXNvbHZlIGFuZCByZWplY3QgZnVuY3Rpb25zIG5lZWQgdG8gYmUgcHJvdmlkZWQnKTtcbiAgICB9XG5cbiAgICAvLyBXZSBuZWVkIHRvIGtub3cgaG93IG1hbnkgcnVsZXMgdGhlcmUgYXJlXG4gICAgYXVkaXRzRGF0YS5mb3JFYWNoKGF1ZGl0ID0+IHsgcHJvbWlzZXNDb3VudCArPSAoYXVkaXQucnVsZXMgfHwgW10pLmxlbmd0aDsgfSk7XG5cbiAgICBpZiAoIWF1ZGl0c0RhdGEubGVuZ3RoIHx8IHByb21pc2VzQ291bnQgPT09IDApIHtcbiAgICAgICAgcmVzb2x2ZShhdWRpdHMpO1xuICAgIH1cblxuICAgIC8vIExldHMgZ28gcGVyIGF1ZGl0Li4uXG4gICAgYXVkaXRzRGF0YS5mb3JFYWNoKGF1ZGl0ID0+IHtcbiAgICAgICAgYXVkaXRzW2F1ZGl0Lm5hbWVdID0gW107XG5cbiAgICAgICAgZGVzVGVzdChgQXVkaXQ6ICR7YXVkaXQubmFtZX1gLCAoKSA9PiBhdWRpdC5ydWxlcy5mb3JFYWNoKHJ1bGUgPT4ge1xuICAgICAgICAgICAgY29uc3QgaXNJZ25vcmUgPSBjb250YWlucyhhdWRpdC5pZ25vcmUsIHJ1bGUubmFtZSk7XG5cbiAgICAgICAgICAgIC8vIFdlIG1heSBuZWVkIHRvIGlnbm9yZSBpdFxuICAgICAgICAgICAgaWYgKGlzSWdub3JlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGl0VGVzdC5za2lwKGBSdWxlOiAke3J1bGUubmFtZX1gLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIENhY2hlIGl0IHNvIHdlIGtub3cgaXQgbGF0ZXJcbiAgICAgICAgICAgICAgICAgICAgYXVkaXRzW2F1ZGl0Lm5hbWVdLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogcnVsZS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiAnaWdub3JlZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQ6IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIGFsbERvbmUgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFsbERvbmUgPT09IHByb21pc2VzQ291bnQpIHsgcmVzb2x2ZShhdWRpdHMpOyB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIExldHMgYWN0dWFsbHkgcnVuIHRoZSBydWxlXG4gICAgICAgICAgICBpdFRlc3QoYFJ1bGU6ICR7cnVsZS5uYW1lfWAsIGZ1bmN0aW9uIChkb25lKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50aW1lb3V0KDIwMDAwKTtcblxuICAgICAgICAgICAgICAgIC8vIExldHMgcnVuIHRoZSBydWxlXG4gICAgICAgICAgICAgICAgcnVuUnVsZShydWxlLCBzcmMsIGF1ZGl0Lmlnbm9yZSlcbiAgICAgICAgICAgICAgICAudGhlbihuZXdSdWxlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gUmVhZHlcbiAgICAgICAgICAgICAgICAgICAgYXVkaXRzW2F1ZGl0Lm5hbWVdLnB1c2gobmV3UnVsZSk7XG4gICAgICAgICAgICAgICAgICAgIGRvbmUoKTtcblxuICAgICAgICAgICAgICAgICAgICBhbGxEb25lICs9IDE7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhbGxEb25lID09PSBwcm9taXNlc0NvdW50KSB7IHJlc29sdmUoYXVkaXRzKTsgfVxuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXdSdWxlO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmNhdGNoKG5ld1J1bGUgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnIgPSBuZXdSdWxlLnJlc3VsdDtcblxuICAgICAgICAgICAgICAgICAgICAvLyBSZWFkeVxuICAgICAgICAgICAgICAgICAgICBhdWRpdHNbYXVkaXQubmFtZV0ucHVzaChuZXdSdWxlKTtcbiAgICAgICAgICAgICAgICAgICAgZG9uZShlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyciA6IG5ldyBFcnJvcihKU09OLnN0cmluZ2lmeShlcnIsIG51bGwsIDQpKSk7XG5cbiAgICAgICAgICAgICAgICAgICAgYWxsRG9uZSArPSAxO1xuICAgICAgICAgICAgICAgICAgICBpZiAoYWxsRG9uZSA9PT0gcHJvbWlzZXNDb3VudCkgeyByZWplY3QoYXVkaXRzKTsgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBhdWRpdHM7XG59O1xuXG4vKipcbiAqIEJ1aWxkIGF1ZGl0cyBhcnJheVxuICpcbiAqIEBwYXJhbSB7YXJyYXl9IGF1ZGl0c1xuICogQHJldHVybnMge2FycmF5fVxuICovXG5jb25zdCBidWlsZEF1ZGl0cyA9IChhdWRpdHMpID0+IHtcbiAgICBhdWRpdHMgPSAodHlwZW9mIGF1ZGl0cyA9PT0gJ3N0cmluZycpID8gW2F1ZGl0c10gOiBhdWRpdHM7XG4gICAgYXVkaXRzID0gYXVkaXRzLm1hcCh2YWwgPT4ge1xuICAgICAgICB2YWwgPSAodHlwZW9mIHZhbCA9PT0gJ29iamVjdCcpID8gdmFsIDogeyBzcmM6IHZhbCB9O1xuXG4gICAgICAgIC8vIExldHMgcmVxdWlyZVxuICAgICAgICBsZXQgbW9kID0gbW9kdWxlc1t2YWwuc3JjXSB8fCByZXF1aXJlKGdldFB3ZCh2YWwuc3JjKSk7XG4gICAgICAgIG1vZCA9ICh0eXBlb2YgbW9kID09PSAnb2JqZWN0JyAmJiBtb2QuZGVmYXVsdCkgPyBtb2QuZGVmYXVsdCA6IG1vZDtcblxuICAgICAgICAvLyBOb3cgc2V0IGFsbCBhcyBzaG91bGRcbiAgICAgICAgdmFsLm5hbWUgPSBtb2QubmFtZTtcbiAgICAgICAgdmFsLnJ1bGVzID0gbW9kLnJ1bGVzLm1hcCgocnVsZSkgPT4ge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBydWxlICE9PSAnb2JqZWN0JyB8fCBpc0FycmF5KHJ1bGUpKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBIHJ1bGUgbmVlZHMgdG8gYmUgYW4gb2JqZWN0Jyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghcnVsZS5uYW1lKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBIHJ1bGUgbmVlZHMgYSBuYW1lJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghcnVsZS5mbikge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQSBydWxlIG5lZWRzIGEgZnVuY3Rpb24nKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHJ1bGU7XG4gICAgICAgIH0pO1xuICAgICAgICB2YWwuaWdub3JlID0gdmFsLmlnbm9yZSB8fCBbXTtcblxuICAgICAgICByZXR1cm4gdmFsO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGF1ZGl0cztcbn07XG5cbi8qKlxuICogR2F0aGVyIGRhdGFcbiAqXG4gKiBAcGFyYW0ge2FycmF5fSBkYXRhXG4gKiBAcmV0dXJucyB7cHJvbWlzZX1cbiAqL1xuY29uc3QgZ2F0aGVyRGF0YSA9IChkYXRhID0gW10pID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBjb25zdCByZXFEYXRhID0gW107XG4gICAgY29uc3QgcHJvbWlzZXNDb3VudCA9IGRhdGEubGVuZ3RoO1xuICAgIGxldCBhbGxEb25lID0gMDtcblxuICAgIC8vIE5vIG5lZWQgdG8gZ28gZnVydGhlciB3aXRob3V0IGRhdGFcbiAgICBpZiAoIWRhdGEubGVuZ3RoKSB7IHJldHVybiByZXNvbHZlKCk7IH1cblxuICAgIC8vIEdvIHRocm91Z2ggZWFjaCByZXF1ZXN0XG4gICAgZGF0YS5mb3JFYWNoKChyZXEpID0+IGRlc1Rlc3QoJ1JlcXVlc3Rpbmcgc3JjJywgKCkgPT4gaXRUZXN0KCdHYXRoZXJpbmcgZGF0YS4uLicsIGZ1bmN0aW9uIChkb25lKSB7XG4gICAgICAgIHRoaXMudGltZW91dCgxMDAwMCk7XG5cbiAgICAgICAgLy8gTGV0cyBnZXQgdGhlIHNjcmFwZXIgZGF0YVxuICAgICAgICBydW5TY3JhcGVyKHJlcSkudGhlbigoc2NyYXBEYXRhKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuZXdSZXEgPSBtZXJnZShyZXEsIHtcbiAgICAgICAgICAgICAgICBhdWRpdHNEYXRhOiBidWlsZEF1ZGl0cyhyZXEuYXVkaXRzKSxcbiAgICAgICAgICAgICAgICBzcmNEYXRhOiBzY3JhcERhdGFcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBSZWFkeVxuICAgICAgICAgICAgcmVxRGF0YS5wdXNoKG5ld1JlcSk7XG4gICAgICAgICAgICBkb25lKCk7XG5cbiAgICAgICAgICAgIGFsbERvbmUgKz0gMTtcbiAgICAgICAgICAgIGlmIChhbGxEb25lID09PSBwcm9taXNlc0NvdW50KSB7IHJlc29sdmUocmVxRGF0YSk7IH1cblxuICAgICAgICAgICAgcmV0dXJuIG5ld1JlcTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5ld1JlcSA9IG1lcmdlKHJlcSwgeyBlcnIgfSk7XG5cbiAgICAgICAgICAgIC8vIFJlYWR5XG4gICAgICAgICAgICByZXFEYXRhLnB1c2gobmV3UmVxKTtcbiAgICAgICAgICAgIGRvbmUoZXJyKTtcblxuICAgICAgICAgICAgYWxsRG9uZSArPSAxO1xuICAgICAgICAgICAgaWYgKGFsbERvbmUgPT09IHByb21pc2VzQ291bnQpIHsgcmVqZWN0KHJlcURhdGEpOyB9XG4gICAgICAgIH0pO1xuICAgIH0pKSk7XG59KTtcblxuLyoqXG4gKiBJbml0aWFsaXplIGF1ZGl0c1xuICpcbiAqIEBwYXJhbSB7b2JqZWN0fHN0cmluZ30gY29uZmlnXG4gKiBAcmV0dXJucyB7cHJvbWlzZX1cbiAqL1xuY29uc3QgcnVuID0gKGNvbmZpZykgPT4ge1xuICAgIGNvbmZpZyA9IGNvbmZpZ0dldChjb25maWcpO1xuXG4gICAgLy8gTGV0cyBnYXRoZXIgZGF0YSBmcm9tIHRoZSBzcmNcbiAgICByZXR1cm4gZ2F0aGVyRGF0YShjb25maWcuZGF0YSlcbiAgICAudGhlbihkYXRhID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgLy8gR28gdGhyb3VnaCBlYWNoIGVsZW1lbnQgaW4gZGF0YVxuICAgICAgICAvLyBMZXRzIHJ1biBhdWRpdHMgcGVyIHJlcXVlc3RcbiAgICAgICAgZGF0YS5mb3JFYWNoKHJlcSA9PiByZXEuc3JjRGF0YS5mb3JFYWNoKHNyYyA9PiB7XG4gICAgICAgICAgICBkZXNUZXN0KGBBdWRpdGluZzogJHtzcmMub3JpZ2luYWxTcmN9YCwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHJ1bkF1ZGl0KHJlcS5hdWRpdHNEYXRhLCBzcmMsIHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSkpO1xuICAgIH0pKTtcbn07XG5cbi8qKlxuICogU2V0cyB1cCB0aGUgdGVzdGluZyBlbnZpcm9ubWVudFxuICpcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IG5ld0Rlc1xuICogQHBhcmFtIHtmdW5jdGlvbn0gbmV3SXRcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IG5ld1dhcm5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gcmVzZXRcbiAqL1xuY29uc3Qgc2V0dXAgPSAobmV3RGVzLCBuZXdJdCwgbmV3V2FybiwgcmVzZXQpID0+IHtcbiAgICBpZiAobmV3RGVzICYmIHR5cGVvZiBuZXdEZXMgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdEZXNjcmliZSBuZWVkcyB0byBiZSBhIGZ1bmN0aW9uJyk7XG4gICAgfVxuXG4gICAgaWYgKG5ld0l0ICYmIHR5cGVvZiBuZXdJdCAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0l0IG5lZWRzIHRvIGJlIGEgZnVuY3Rpb24nKTtcbiAgICB9XG5cbiAgICBpZiAobmV3V2FybiAmJiB0eXBlb2YgbmV3V2FybiAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1dhcm4gbmVlZHMgdG8gYmUgYSBmdW5jdGlvbicpO1xuICAgIH1cblxuICAgIC8vIFJlc2V0XG4gICAgaWYgKHJlc2V0KSB7XG4gICAgICAgIGRlc1Rlc3QgPSBpdFRlc3QgPSBsb2dXYXJuID0gbnVsbDtcbiAgICB9XG5cbiAgICBkZXNUZXN0ID0gbmV3RGVzIHx8IGRlc1Rlc3QgfHwgZnVuY3Rpb24gKG1zZywgY2IpIHtcbiAgICAgICAgY2IoKTtcbiAgICB9O1xuXG4gICAgaXRUZXN0ID0gbmV3SXQgfHwgaXRUZXN0IHx8IGZ1bmN0aW9uIChtc2csIGNiKSB7XG4gICAgICAgIGNvbnN0IG1vZHVsZSA9IHtcbiAgICAgICAgICAgIGRvbmU6IChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdGltZW91dDogKCkgPT4ge31cbiAgICAgICAgfTtcblxuICAgICAgICBjYi5iaW5kKG1vZHVsZSkobW9kdWxlLmRvbmUpO1xuICAgIH07XG4gICAgaXRUZXN0LnNraXAgPSBuZXdJdCAmJiBuZXdJdC5za2lwIHx8IGl0VGVzdCAmJiBpdFRlc3Quc2tpcCB8fCBmdW5jdGlvbiAobXNnLCBjYikge1xuICAgICAgICBjb25zdCBtb2R1bGUgPSB7XG4gICAgICAgICAgICBkb25lOiAoKSA9PiB7fSxcbiAgICAgICAgICAgIHRpbWVvdXQ6ICgpID0+IHt9XG4gICAgICAgIH07XG5cbiAgICAgICAgY2IuYmluZChtb2R1bGUpKG1vZHVsZS5kb25lKTtcbiAgICB9O1xuXG4gICAgLyogZXNsaW50LWRpc2FibGUgbm8tY29uc29sZSAqL1xuICAgIGxvZ1dhcm4gPSBuZXdXYXJuIHx8IGxvZ1dhcm4gfHwgZnVuY3Rpb24gKG1vZHVsZSwgLi4ubXNnKSB7IGNvbnNvbGUud2Fybihtb2R1bGUsIC4uLm1zZyk7IH07XG4gICAgLyogZXNsaW50LWVuYWJsZSBuby1jb25zb2xlICovXG59O1xuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFJ1bnRpbWVcblxuaWYgKGFyZ3YgJiYgYXJndi5tb2NoYSkge1xuICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLXVuZGVmICovXG4gICAgc2V0dXAoZGVzY3JpYmUsIGl0KTtcbiAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLXVuZGVmICovXG59IGVsc2Uge1xuICAgIHNldHVwKCk7XG59XG5hcmd2ICYmIGFyZ3YuY29uZmlnICYmIHJ1bihhcmd2LmNvbmZpZyk7XG5leHBvcnQgeyBzZXR1cCB9O1xuZXhwb3J0IHsgcnVuIH07XG5cbi8vIEVzc2VudGlhbGx5IGZvciB0ZXN0aW5nIHB1cnBvc2VzXG5leHBvcnQgY29uc3QgX190ZXN0TWV0aG9kc19fID0geyBydW4sIHNldHVwLCBnYXRoZXJEYXRhLCBidWlsZEF1ZGl0cywgcnVuQXVkaXQsIHJ1blJ1bGUgfTtcbiJdfQ==