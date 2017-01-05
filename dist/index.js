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
    bestPractices: require('./modules/bestPractices.js'),
    analytics: require('./modules/analytics.js')
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJtb2R1bGVzIiwiYmVzdFByYWN0aWNlcyIsInJlcXVpcmUiLCJhbmFseXRpY3MiLCJsb2dXYXJuIiwiZGVzVGVzdCIsIml0VGVzdCIsInJ1blJ1bGUiLCJydWxlIiwic3JjIiwiaWdub3JlIiwiRXJyb3IiLCJuYW1lIiwiZm4iLCJ0aGVuIiwic3RhdHVzIiwicmVzdWx0IiwicnVsZURhdGEiLCJjYXRjaCIsImVyciIsImRhdGEiLCJuZXN0ZWRFcnJvciIsIm1hcCIsInZhbCIsIm1zZyIsImlzSWdub3JlIiwicmF3IiwicnVuQXVkaXQiLCJhdWRpdHNEYXRhIiwicmVzb2x2ZSIsInJlamVjdCIsImFsbERvbmUiLCJwcm9taXNlc0NvdW50IiwiYXVkaXRzIiwiZm9yRWFjaCIsImF1ZGl0IiwicnVsZXMiLCJsZW5ndGgiLCJza2lwIiwicHVzaCIsImRvbmUiLCJ0aW1lb3V0IiwibmV3UnVsZSIsIkpTT04iLCJzdHJpbmdpZnkiLCJidWlsZEF1ZGl0cyIsIm1vZCIsImRlZmF1bHQiLCJnYXRoZXJEYXRhIiwiUHJvbWlzZSIsInJlcURhdGEiLCJyZXEiLCJzY3JhcERhdGEiLCJuZXdSZXEiLCJzcmNEYXRhIiwicnVuIiwiY29uZmlnIiwib3JpZ2luYWxTcmMiLCJzZXR1cCIsIm5ld0RlcyIsIm5ld0l0IiwibmV3V2FybiIsInJlc2V0IiwiY2IiLCJtb2R1bGUiLCJiaW5kIiwid2FybiIsIm1vY2hhIiwiZGVzY3JpYmUiLCJpdCJdLCJtYXBwaW5ncyI6Ijs7QUFFQTtBQUNBOzs7Ozs7Ozs7QUFFQTs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7QUFFQTtBQUNBLElBQU1BLFVBQVU7QUFDWkMsbUJBQWVDLFFBQVEsNEJBQVIsQ0FESDtBQUVaQyxlQUFXRCxRQUFRLHdCQUFSO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVBZLENBQWhCOztBQVVBLElBQUlFLGdCQUFKO0FBQ0EsSUFBSUMsZ0JBQUo7QUFDQSxJQUFJQyxlQUFKOztBQUVBO0FBQ0E7O0FBRUE7Ozs7Ozs7O0FBUUEsSUFBTUMsVUFBVSxTQUFWQSxPQUFVLEdBQXNDO0FBQUEsUUFBckNDLElBQXFDLHVFQUE5QixFQUE4QjtBQUFBLFFBQTFCQyxHQUEwQix1RUFBcEIsRUFBb0I7QUFBQSxRQUFoQkMsTUFBZ0IsdUVBQVAsRUFBTzs7QUFDbEQsUUFBSSxRQUFPRixJQUFQLHlDQUFPQSxJQUFQLE9BQWdCLFFBQWhCLElBQTRCLHVCQUFRQSxJQUFSLENBQWhDLEVBQStDO0FBQzNDLGNBQU0sSUFBSUcsS0FBSixDQUFVLDhCQUFWLENBQU47QUFDSDs7QUFFRCxRQUFJLENBQUNILEtBQUtJLElBQU4sSUFBYyxPQUFPSixLQUFLSSxJQUFaLEtBQXFCLFFBQXZDLEVBQWlEO0FBQzdDLGNBQU0sSUFBSUQsS0FBSixDQUFVLDRCQUFWLENBQU47QUFDSDs7QUFFRCxRQUFJLENBQUNILEtBQUtLLEVBQU4sSUFBWSxPQUFPTCxLQUFLSyxFQUFaLEtBQW1CLFVBQW5DLEVBQStDO0FBQzNDLGNBQU0sSUFBSUYsS0FBSixDQUFVLDRCQUFWLENBQU47QUFDSDs7QUFFRDtBQUNBLFdBQU9ILEtBQUtLLEVBQUwsQ0FBUUosR0FBUixFQUFhSyxJQUFiLENBQWtCO0FBQUEsZUFBWSxxQkFBTTtBQUN2Q0Ysa0JBQU1KLEtBQUtJLElBRDRCO0FBRXZDRyxvQkFBUSxRQUYrQjtBQUd2Q0Msb0JBQVFDO0FBSCtCLFNBQU4sQ0FBWjtBQUFBLEtBQWxCLEVBS05DLEtBTE0sQ0FLQTtBQUFBLGVBQVE7QUFDWE4sa0JBQU1KLEtBQUtJLElBREE7QUFFWEcsb0JBQVEsUUFGRztBQUdYQyxvQkFBUUc7QUFIRyxTQUFSO0FBQUEsS0FMQSxFQVVOTCxJQVZNLENBVUQsZ0JBQVE7QUFDVjtBQUNBLFlBQUkscUJBQVNKLE1BQVQsRUFBaUJVLEtBQUtSLElBQXRCLENBQUosRUFBaUM7QUFDN0IsbUJBQU87QUFDSEEsc0JBQU1RLEtBQUtSLElBRFI7QUFFSEcsd0JBQVEsU0FGTDtBQUdIQyx3QkFBUTtBQUhMLGFBQVA7QUFLSDs7QUFFRDtBQUNBLFlBQUlJLEtBQUtMLE1BQUwsS0FBZ0IsUUFBcEIsRUFBOEI7QUFDMUIsa0JBQU1LLElBQU47QUFDSDs7QUFFRDtBQUNBLFlBQUksQ0FBQyx1QkFBUUEsS0FBS0osTUFBYixDQUFMLEVBQTJCO0FBQ3ZCLG1CQUFPSSxJQUFQO0FBQ0g7O0FBRUQ7QUFDQSxZQUFJQyxjQUFjLEtBQWxCO0FBQ0FELGFBQUtKLE1BQUwsR0FBY0ksS0FBS0osTUFBTCxDQUFZTSxHQUFaLENBQWdCLGVBQU87QUFDakMsZ0JBQUksQ0FBQ0MsR0FBRCxJQUFRLFFBQU9BLEdBQVAseUNBQU9BLEdBQVAsT0FBZSxRQUEzQixFQUFxQztBQUNqQ0Esc0JBQU07QUFDRkMseUJBQUtELElBQUlDLEdBRFA7QUFFRlIsNEJBQVEsNENBRk47QUFHRkQsNEJBQVE7QUFITixpQkFBTjtBQUtIOztBQUVELGdCQUFJLENBQUNRLElBQUlSLE1BQUwsSUFBZSxPQUFPUSxJQUFJUixNQUFYLEtBQXNCLFFBQXpDLEVBQW1EO0FBQy9DUSxzQkFBTTtBQUNGQyx5QkFBS0QsSUFBSUMsR0FEUDtBQUVGUiw0QkFBUSxvREFGTjtBQUdGRCw0QkFBUTtBQUhOLGlCQUFOO0FBS0g7O0FBRUQsZ0JBQUksQ0FBQ1EsSUFBSUMsR0FBTCxJQUFZLE9BQU9ELElBQUlDLEdBQVgsS0FBbUIsUUFBbkMsRUFBNkM7QUFDekNELHNCQUFNO0FBQ0ZDLHlCQUFLLEVBREg7QUFFRlIsNEJBQVEsaURBRk47QUFHRkQsNEJBQVE7QUFITixpQkFBTjtBQUtIOztBQUVEO0FBQ0EsZ0JBQU1VLFdBQVcscUJBQVNmLE1BQVQsRUFBaUJhLElBQUlDLEdBQXJCLEtBQTZCLHFCQUFTZCxNQUFULEVBQWlCYSxJQUFJRyxHQUFyQixDQUE5QztBQUNBSCxnQkFBSVIsTUFBSixHQUFhVSxXQUFXLFNBQVgsR0FBdUJGLElBQUlSLE1BQXhDOztBQUVBLGdCQUFJUSxJQUFJUixNQUFKLEtBQWUsU0FBbkIsRUFBOEI7QUFDMUI7QUFDQSxvQkFBSVEsSUFBSVIsTUFBSixLQUFlLFNBQW5CLEVBQThCO0FBQzFCWCw0QkFBUUksS0FBS0ksSUFBYixFQUFtQlcsSUFBSUMsR0FBdkIsRUFBNEJELElBQUlHLEdBQWhDO0FBQ0gsaUJBRkQsTUFFTyxJQUFJSCxJQUFJUixNQUFKLEtBQWUsUUFBbkIsRUFBNkI7QUFDaENNLGtDQUFjLElBQWQ7QUFDSCxpQkFGTSxNQUVBO0FBQ0hFLHdCQUFJUixNQUFKLEdBQWEsUUFBYjtBQUNIO0FBQ0o7O0FBRUQsbUJBQU9RLEdBQVA7QUFDSCxTQXpDYSxDQUFkOztBQTJDQTtBQUNBLFlBQUlGLFdBQUosRUFBaUI7QUFDYkQsaUJBQUtMLE1BQUwsR0FBYyxRQUFkO0FBQ0Esa0JBQU1LLElBQU47QUFDSDs7QUFFRDtBQUNBLGVBQU9BLElBQVA7QUFDSCxLQW5GTSxDQUFQO0FBb0ZILENBbEdEOztBQW9HQTs7Ozs7Ozs7O0FBU0EsSUFBTU8sV0FBVyxTQUFYQSxRQUFXLEdBQWdEO0FBQUEsUUFBL0NDLFVBQStDLHVFQUFsQyxFQUFrQztBQUFBLFFBQTlCbkIsR0FBOEIsdUVBQXhCLEVBQXdCO0FBQUEsUUFBcEJvQixPQUFvQjtBQUFBLFFBQVhDLE1BQVc7O0FBQzdELFFBQUlDLFVBQVUsQ0FBZDtBQUNBLFFBQUlDLGdCQUFnQixDQUFwQjtBQUNBLFFBQU1DLFNBQVMsRUFBZjs7QUFFQSxRQUFJLE9BQU9KLE9BQVAsS0FBbUIsVUFBbkIsSUFBaUMsT0FBT0MsTUFBUCxLQUFrQixVQUF2RCxFQUFtRTtBQUMvRCxjQUFNLElBQUluQixLQUFKLENBQVUsa0RBQVYsQ0FBTjtBQUNIOztBQUVEO0FBQ0FpQixlQUFXTSxPQUFYLENBQW1CLGlCQUFTO0FBQUVGLHlCQUFpQixDQUFDRyxNQUFNQyxLQUFOLElBQWUsRUFBaEIsRUFBb0JDLE1BQXJDO0FBQThDLEtBQTVFOztBQUVBLFFBQUksQ0FBQ1QsV0FBV1MsTUFBWixJQUFzQkwsa0JBQWtCLENBQTVDLEVBQStDO0FBQzNDSCxnQkFBUUksTUFBUjtBQUNIOztBQUVEO0FBQ0FMLGVBQVdNLE9BQVgsQ0FBbUIsaUJBQVM7QUFDeEJELGVBQU9FLE1BQU12QixJQUFiLElBQXFCLEVBQXJCOztBQUVBUCw0QkFBa0I4QixNQUFNdkIsSUFBeEIsRUFBZ0M7QUFBQSxtQkFBTXVCLE1BQU1DLEtBQU4sQ0FBWUYsT0FBWixDQUFvQixnQkFBUTtBQUM5RCxvQkFBTVQsV0FBVyxxQkFBU1UsTUFBTXpCLE1BQWYsRUFBdUJGLEtBQUtJLElBQTVCLENBQWpCOztBQUVBO0FBQ0Esb0JBQUlhLFFBQUosRUFBYztBQUNWLDJCQUFPbkIsT0FBT2dDLElBQVAsWUFBcUI5QixLQUFLSSxJQUExQixFQUFrQyxZQUFNO0FBQzNDO0FBQ0FxQiwrQkFBT0UsTUFBTXZCLElBQWIsRUFBbUIyQixJQUFuQixDQUF3QjtBQUNwQjNCLGtDQUFNSixLQUFLSSxJQURTO0FBRXBCRyxvQ0FBUSxTQUZZO0FBR3BCQyxvQ0FBUTtBQUhZLHlCQUF4Qjs7QUFNQWUsbUNBQVcsQ0FBWDtBQUNBLDRCQUFJQSxZQUFZQyxhQUFoQixFQUErQjtBQUFFSCxvQ0FBUUksTUFBUjtBQUFrQjtBQUN0RCxxQkFWTSxDQUFQO0FBV0g7O0FBRUQ7QUFDQTNCLGtDQUFnQkUsS0FBS0ksSUFBckIsRUFBNkIsVUFBVTRCLElBQVYsRUFBZ0I7QUFDekMseUJBQUtDLE9BQUwsQ0FBYSxLQUFiOztBQUVBO0FBQ0FsQyw0QkFBUUMsSUFBUixFQUFjQyxHQUFkLEVBQW1CMEIsTUFBTXpCLE1BQXpCLEVBQ0NJLElBREQsQ0FDTSxtQkFBVztBQUNiO0FBQ0FtQiwrQkFBT0UsTUFBTXZCLElBQWIsRUFBbUIyQixJQUFuQixDQUF3QkcsT0FBeEI7QUFDQUY7O0FBRUFULG1DQUFXLENBQVg7QUFDQSw0QkFBSUEsWUFBWUMsYUFBaEIsRUFBK0I7QUFBRUgsb0NBQVFJLE1BQVI7QUFBa0I7O0FBRW5ELCtCQUFPUyxPQUFQO0FBQ0gscUJBVkQsRUFXQ3hCLEtBWEQsQ0FXTyxtQkFBVztBQUNkLDRCQUFNQyxNQUFNdUIsUUFBUTFCLE1BQXBCOztBQUVBO0FBQ0FpQiwrQkFBT0UsTUFBTXZCLElBQWIsRUFBbUIyQixJQUFuQixDQUF3QkcsT0FBeEI7QUFDQUYsNkJBQUtyQixlQUFlUixLQUFmLEdBQXVCUSxHQUF2QixHQUE2QixJQUFJUixLQUFKLENBQVVnQyxLQUFLQyxTQUFMLENBQWV6QixHQUFmLEVBQW9CLElBQXBCLEVBQTBCLENBQTFCLENBQVYsQ0FBbEM7O0FBRUFZLG1DQUFXLENBQVg7QUFDQSw0QkFBSUEsWUFBWUMsYUFBaEIsRUFBK0I7QUFBRUYsbUNBQU9HLE1BQVA7QUFBaUI7QUFDckQscUJBcEJEO0FBcUJILGlCQXpCRDtBQTBCSCxhQTdDcUMsQ0FBTjtBQUFBLFNBQWhDO0FBOENILEtBakREOztBQW1EQSxXQUFPQSxNQUFQO0FBQ0gsQ0FyRUQ7O0FBdUVBOzs7Ozs7QUFNQSxJQUFNWSxjQUFjLFNBQWRBLFdBQWMsQ0FBQ1osTUFBRCxFQUFZO0FBQzVCQSxhQUFVLE9BQU9BLE1BQVAsS0FBa0IsUUFBbkIsR0FBK0IsQ0FBQ0EsTUFBRCxDQUEvQixHQUEwQ0EsTUFBbkQ7QUFDQUEsYUFBU0EsT0FBT1gsR0FBUCxDQUFXLGVBQU87QUFDdkJDLGNBQU8sUUFBT0EsR0FBUCx5Q0FBT0EsR0FBUCxPQUFlLFFBQWhCLEdBQTRCQSxHQUE1QixHQUFrQyxFQUFFZCxLQUFLYyxHQUFQLEVBQXhDOztBQUVBO0FBQ0EsWUFBSXVCLE1BQU05QyxRQUFRdUIsSUFBSWQsR0FBWixLQUFvQlAsUUFBUSxtQkFBT3FCLElBQUlkLEdBQVgsQ0FBUixDQUE5QjtBQUNBcUMsY0FBTyxRQUFPQSxHQUFQLHlDQUFPQSxHQUFQLE9BQWUsUUFBZixJQUEyQkEsSUFBSUMsT0FBaEMsR0FBMkNELElBQUlDLE9BQS9DLEdBQXlERCxHQUEvRDs7QUFFQTtBQUNBdkIsWUFBSVgsSUFBSixHQUFXa0MsSUFBSWxDLElBQWY7QUFDQVcsWUFBSWEsS0FBSixHQUFZVSxJQUFJVixLQUFKLENBQVVkLEdBQVYsQ0FBYyxVQUFDZCxJQUFELEVBQVU7QUFDaEMsZ0JBQUksUUFBT0EsSUFBUCx5Q0FBT0EsSUFBUCxPQUFnQixRQUFoQixJQUE0Qix1QkFBUUEsSUFBUixDQUFoQyxFQUErQztBQUMzQyxzQkFBTSxJQUFJRyxLQUFKLENBQVUsOEJBQVYsQ0FBTjtBQUNIOztBQUVELGdCQUFJLENBQUNILEtBQUtJLElBQVYsRUFBZ0I7QUFDWixzQkFBTSxJQUFJRCxLQUFKLENBQVUscUJBQVYsQ0FBTjtBQUNIOztBQUVELGdCQUFJLENBQUNILEtBQUtLLEVBQVYsRUFBYztBQUNWLHNCQUFNLElBQUlGLEtBQUosQ0FBVSx5QkFBVixDQUFOO0FBQ0g7O0FBRUQsbUJBQU9ILElBQVA7QUFDSCxTQWRXLENBQVo7QUFlQWUsWUFBSWIsTUFBSixHQUFhYSxJQUFJYixNQUFKLElBQWMsRUFBM0I7O0FBRUEsZUFBT2EsR0FBUDtBQUNILEtBM0JRLENBQVQ7O0FBNkJBLFdBQU9VLE1BQVA7QUFDSCxDQWhDRDs7QUFrQ0E7Ozs7OztBQU1BLElBQU1lLGFBQWEsU0FBYkEsVUFBYTtBQUFBLFFBQUM1QixJQUFELHVFQUFRLEVBQVI7QUFBQSxXQUFlLElBQUk2QixPQUFKLENBQVksVUFBQ3BCLE9BQUQsRUFBVUMsTUFBVixFQUFxQjtBQUMvRCxZQUFNb0IsVUFBVSxFQUFoQjtBQUNBLFlBQU1sQixnQkFBZ0JaLEtBQUtpQixNQUEzQjtBQUNBLFlBQUlOLFVBQVUsQ0FBZDs7QUFFQTtBQUNBLFlBQUksQ0FBQ1gsS0FBS2lCLE1BQVYsRUFBa0I7QUFBRSxtQkFBT1IsU0FBUDtBQUFtQjs7QUFFdkM7QUFDQVQsYUFBS2MsT0FBTCxDQUFhLFVBQUNpQixHQUFEO0FBQUEsbUJBQVM5QyxRQUFRLGdCQUFSLEVBQTBCO0FBQUEsdUJBQU1DLE9BQU8sbUJBQVAsRUFBNEIsVUFBVWtDLElBQVYsRUFBZ0I7QUFDOUYseUJBQUtDLE9BQUwsQ0FBYSxLQUFiOztBQUVBO0FBQ0Esc0NBQVdVLEdBQVgsRUFBZ0JyQyxJQUFoQixDQUFxQixVQUFDc0MsU0FBRCxFQUFlO0FBQ2hDLDRCQUFNQyxTQUFTLHFCQUFNRixHQUFOLEVBQVc7QUFDdEJ2Qix3Q0FBWWlCLFlBQVlNLElBQUlsQixNQUFoQixDQURVO0FBRXRCcUIscUNBQVNGO0FBRmEseUJBQVgsQ0FBZjs7QUFLQTtBQUNBRixnQ0FBUVgsSUFBUixDQUFhYyxNQUFiO0FBQ0FiOztBQUVBVCxtQ0FBVyxDQUFYO0FBQ0EsNEJBQUlBLFlBQVlDLGFBQWhCLEVBQStCO0FBQUVILG9DQUFRcUIsT0FBUjtBQUFtQjs7QUFFcEQsK0JBQU9HLE1BQVA7QUFDSCxxQkFkRCxFQWVDbkMsS0FmRCxDQWVPLFVBQUNDLEdBQUQsRUFBUztBQUNaLDRCQUFNa0MsU0FBUyxxQkFBTUYsR0FBTixFQUFXLEVBQUVoQyxRQUFGLEVBQVgsQ0FBZjs7QUFFQTtBQUNBK0IsZ0NBQVFYLElBQVIsQ0FBYWMsTUFBYjtBQUNBYiw2QkFBS3JCLEdBQUw7O0FBRUFZLG1DQUFXLENBQVg7QUFDQSw0QkFBSUEsWUFBWUMsYUFBaEIsRUFBK0I7QUFBRUYsbUNBQU9vQixPQUFQO0FBQWtCO0FBQ3RELHFCQXhCRDtBQXlCSCxpQkE3QnFELENBQU47QUFBQSxhQUExQixDQUFUO0FBQUEsU0FBYjtBQThCSCxLQXZDaUMsQ0FBZjtBQUFBLENBQW5COztBQXlDQTs7Ozs7O0FBTUEsSUFBTUssTUFBTSxTQUFOQSxHQUFNLENBQUNDLE1BQUQsRUFBWTtBQUNwQkEsYUFBUyxpQkFBVUEsTUFBVixDQUFUOztBQUVBO0FBQ0EsV0FBT1IsV0FBV1EsT0FBT3BDLElBQWxCLEVBQ05OLElBRE0sQ0FDRDtBQUFBLGVBQVEsSUFBSW1DLE9BQUosQ0FBWSxVQUFDcEIsT0FBRCxFQUFVQyxNQUFWLEVBQXFCO0FBQzNDO0FBQ0E7QUFDQVYsaUJBQUtjLE9BQUwsQ0FBYTtBQUFBLHVCQUFPaUIsSUFBSUcsT0FBSixDQUFZcEIsT0FBWixDQUFvQixlQUFPO0FBQzNDN0IsMkNBQXFCSSxJQUFJZ0QsV0FBekIsRUFBd0MsWUFBTTtBQUMxQzlCLGlDQUFTd0IsSUFBSXZCLFVBQWIsRUFBeUJuQixHQUF6QixFQUE4Qm9CLE9BQTlCLEVBQXVDQyxNQUF2QztBQUNILHFCQUZEO0FBR0gsaUJBSm1CLENBQVA7QUFBQSxhQUFiO0FBS0gsU0FSYSxDQUFSO0FBQUEsS0FEQyxDQUFQO0FBVUgsQ0FkRDs7QUFnQkE7Ozs7Ozs7O0FBUUEsSUFBTTRCLFFBQVEsU0FBUkEsS0FBUSxDQUFDQyxNQUFELEVBQVNDLEtBQVQsRUFBZ0JDLE9BQWhCLEVBQXlCQyxLQUF6QixFQUFtQztBQUM3QyxRQUFJSCxVQUFVLE9BQU9BLE1BQVAsS0FBa0IsVUFBaEMsRUFBNEM7QUFDeEMsY0FBTSxJQUFJaEQsS0FBSixDQUFVLGlDQUFWLENBQU47QUFDSDs7QUFFRCxRQUFJaUQsU0FBUyxPQUFPQSxLQUFQLEtBQWlCLFVBQTlCLEVBQTBDO0FBQ3RDLGNBQU0sSUFBSWpELEtBQUosQ0FBVSwyQkFBVixDQUFOO0FBQ0g7O0FBRUQsUUFBSWtELFdBQVcsT0FBT0EsT0FBUCxLQUFtQixVQUFsQyxFQUE4QztBQUMxQyxjQUFNLElBQUlsRCxLQUFKLENBQVUsNkJBQVYsQ0FBTjtBQUNIOztBQUVEO0FBQ0EsUUFBSW1ELEtBQUosRUFBVztBQUNQekQsa0JBQVVDLFNBQVNGLFVBQVUsSUFBN0I7QUFDSDs7QUFFREMsY0FBVXNELFVBQVV0RCxPQUFWLElBQXFCLFVBQVVtQixHQUFWLEVBQWV1QyxFQUFmLEVBQW1CO0FBQzlDQTtBQUNILEtBRkQ7O0FBSUF6RCxhQUFTc0QsU0FBU3RELE1BQVQsSUFBbUIsVUFBVWtCLEdBQVYsRUFBZXVDLEVBQWYsRUFBbUI7QUFDM0MsWUFBTUMsU0FBUztBQUNYeEIsa0JBQU0sZ0JBQU0sQ0FBRSxDQURIO0FBRVhDLHFCQUFTLG1CQUFNLENBQUU7QUFGTixTQUFmOztBQUtBc0IsV0FBR0UsSUFBSCxDQUFRRCxNQUFSLEVBQWdCQSxPQUFPeEIsSUFBdkI7QUFDSCxLQVBEO0FBUUFsQyxXQUFPZ0MsSUFBUCxHQUFjc0IsU0FBU0EsTUFBTXRCLElBQWYsSUFBdUJoQyxVQUFVQSxPQUFPZ0MsSUFBeEMsSUFBZ0QsVUFBVWQsR0FBVixFQUFldUMsRUFBZixFQUFtQjtBQUM3RSxZQUFNQyxTQUFTO0FBQ1h4QixrQkFBTSxnQkFBTSxDQUFFLENBREg7QUFFWEMscUJBQVMsbUJBQU0sQ0FBRTtBQUZOLFNBQWY7O0FBS0FzQixXQUFHRSxJQUFILENBQVFELE1BQVIsRUFBZ0JBLE9BQU94QixJQUF2QjtBQUNILEtBUEQ7O0FBU0E7QUFDQXBDLGNBQVV5RCxXQUFXekQsT0FBWCxJQUFzQixVQUFVNEQsTUFBVixFQUEwQjtBQUFBOztBQUFBLDBDQUFMeEMsR0FBSztBQUFMQSxlQUFLO0FBQUE7O0FBQUUsNkJBQVEwQyxJQUFSLGtCQUFhRixNQUFiLFNBQXdCeEMsR0FBeEI7QUFBK0IsS0FBM0Y7QUFDQTtBQUNILENBMUNEOztBQTRDQTtBQUNBOztBQUVBLElBQUksZUFBUSxZQUFLMkMsS0FBakIsRUFBd0I7QUFDcEI7QUFDQVQsVUFBTVUsUUFBTixFQUFnQkMsRUFBaEI7QUFDQTtBQUNILENBSkQsTUFJTztBQUNIWDtBQUNIO0FBQ0QsZUFBUSxZQUFLRixNQUFiLElBQXVCRCxJQUFJLFlBQUtDLE1BQVQsQ0FBdkI7UUFDU0UsSyxHQUFBQSxLO1FBQ0FILEcsR0FBQUEsRzs7QUFFVCIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxuXG4ndXNlIHN0cmljdCc7XG4vKiBnbG9iYWwgUHJvbWlzZSAqL1xuXG5pbXBvcnQgeyBhcmd2IH0gZnJvbSAneWFyZ3MnO1xuaW1wb3J0IG1lcmdlIGZyb20gJ2xvZGFzaC9tZXJnZS5qcyc7XG5pbXBvcnQgaXNBcnJheSBmcm9tICdsb2Rhc2gvaXNBcnJheS5qcyc7XG5pbXBvcnQgeyBydW4gYXMgcnVuU2NyYXBlciB9IGZyb20gJy4vc2NyYXBlci5qcyc7XG5pbXBvcnQgeyBnZXQgYXMgY29uZmlnR2V0IH0gZnJvbSAnLi9jb25maWcuanMnO1xuaW1wb3J0IHsgZ2V0UHdkLCBjb250YWlucyB9IGZyb20gJy4vdXRpbHMuanMnO1xuXG4vLyBJbXBvcnQgbW9kdWxlc1xuY29uc3QgbW9kdWxlcyA9IHtcbiAgICBiZXN0UHJhY3RpY2VzOiByZXF1aXJlKCcuL21vZHVsZXMvYmVzdFByYWN0aWNlcy5qcycpLFxuICAgIGFuYWx5dGljczogcmVxdWlyZSgnLi9tb2R1bGVzL2FuYWx5dGljcy5qcycpXG4gICAgLy8gdzM6IHJlcXVpcmUoJy4vbW9kdWxlcy93My5qcycpXG4gICAgLy8gVE9ETzogVGFrZSBjYXJlIG9mIHRoZXNlIG1vZHVsZXMgdG8gYmUgY29tcGxpYW50Li4uXG4gICAgLy8gd2NhZzogcmVxdWlyZSgnLi9tb2R1bGVzL3djYWcuanMnKSxcbiAgICAvLyBTRU86IHJlcXVpcmUoJy4vbW9kdWxlcy9zZW8uanMnKSxcbiAgICAvLyBsaWdodGhvdXNlOiByZXF1aXJlKCcuL21vZHVsZXMvbGlnaHRob3VzZS5qcycpXG59O1xuXG5sZXQgbG9nV2FybjtcbmxldCBkZXNUZXN0O1xubGV0IGl0VGVzdDtcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBGdW5jdGlvbnNcblxuLyoqXG4gKiBSdW5zIHRoZSBydWxlXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IHJ1bGVcbiAqIEBwYXJhbSB7b2JqZWN0fSBzcmNcbiAqIEBwYXJhbSB7YXJyYXl9IGlnbm9yZVxuICogQHJldHVybnNcbiAqL1xuY29uc3QgcnVuUnVsZSA9IChydWxlID0ge30sIHNyYyA9IHt9LCBpZ25vcmUgPSBbXSkgPT4ge1xuICAgIGlmICh0eXBlb2YgcnVsZSAhPT0gJ29iamVjdCcgfHwgaXNBcnJheShydWxlKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0EgcnVsZSBuZWVkcyB0byBiZSBhbiBvYmplY3QnKTtcbiAgICB9XG5cbiAgICBpZiAoIXJ1bGUubmFtZSB8fCB0eXBlb2YgcnVsZS5uYW1lICE9PSAnc3RyaW5nJykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0EgcnVsZSBuZWVkcyBhIHN0cmluZyBuYW1lJyk7XG4gICAgfVxuXG4gICAgaWYgKCFydWxlLmZuIHx8IHR5cGVvZiBydWxlLmZuICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQSBydWxlIG5lZWRzIGEgZnVuY3Rpb24gZm4nKTtcbiAgICB9XG5cbiAgICAvLyBMZXRzIHJ1biB0aGUgcHJvbWlzZSBhbmQgcGFyc2UgdGhlIGRhdGFcbiAgICByZXR1cm4gcnVsZS5mbihzcmMpLnRoZW4ocnVsZURhdGEgPT4gbWVyZ2Uoe1xuICAgICAgICBuYW1lOiBydWxlLm5hbWUsXG4gICAgICAgIHN0YXR1czogJ3Bhc3NlZCcsXG4gICAgICAgIHJlc3VsdDogcnVsZURhdGFcbiAgICB9KSlcbiAgICAuY2F0Y2goZXJyID0+ICh7XG4gICAgICAgIG5hbWU6IHJ1bGUubmFtZSxcbiAgICAgICAgc3RhdHVzOiAnZmFpbGVkJyxcbiAgICAgICAgcmVzdWx0OiBlcnJcbiAgICB9KSlcbiAgICAudGhlbihkYXRhID0+IHtcbiAgICAgICAgLy8gSXMgdGhpcyBpZ25vcmVkIGFscmVhZHk/XG4gICAgICAgIGlmIChjb250YWlucyhpZ25vcmUsIGRhdGEubmFtZSkpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgbmFtZTogZGF0YS5uYW1lLFxuICAgICAgICAgICAgICAgIHN0YXR1czogJ2lnbm9yZWQnLFxuICAgICAgICAgICAgICAgIHJlc3VsdDogZmFsc2VcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUaGVyZSB3YXMgYW4gZXJyb3IgYmVmb3JlXG4gICAgICAgIGlmIChkYXRhLnN0YXR1cyA9PT0gJ2ZhaWxlZCcpIHtcbiAgICAgICAgICAgIHRocm93IGRhdGE7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBObyBuZWVkIHRvIGdvIGZ1cnRoZXIgd2l0aG91dCBhbiBhcnJheVxuICAgICAgICBpZiAoIWlzQXJyYXkoZGF0YS5yZXN1bHQpKSB7XG4gICAgICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIExldHMgY2hlY2sgZm9yIG5lc3RlZGlzc3Vlcy4uLlxuICAgICAgICBsZXQgbmVzdGVkRXJyb3IgPSBmYWxzZTtcbiAgICAgICAgZGF0YS5yZXN1bHQgPSBkYXRhLnJlc3VsdC5tYXAodmFsID0+IHtcbiAgICAgICAgICAgIGlmICghdmFsIHx8IHR5cGVvZiB2YWwgIT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgdmFsID0ge1xuICAgICAgICAgICAgICAgICAgICBtc2c6IHZhbC5tc2csXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdDogJ1J1bGUgYXJyYXkgcmVzdWx0IGl0ZW0gc2hvdWxkIGJlIGFuIG9iamVjdCcsXG4gICAgICAgICAgICAgICAgICAgIHN0YXR1czogJ2ZhaWxlZCdcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIXZhbC5zdGF0dXMgfHwgdHlwZW9mIHZhbC5zdGF0dXMgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgdmFsID0ge1xuICAgICAgICAgICAgICAgICAgICBtc2c6IHZhbC5tc2csXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdDogJ1J1bGUgYXJyYXkgcmVzdWx0IGl0ZW0gc2hvdWxkIGhhdmUgYSBzdHJpbmcgc3RhdHVzJyxcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiAnZmFpbGVkJ1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghdmFsLm1zZyB8fCB0eXBlb2YgdmFsLm1zZyAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICB2YWwgPSB7XG4gICAgICAgICAgICAgICAgICAgIG1zZzogJycsXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdDogJ1J1bGUgYXJyYXkgcmVzdWx0IGl0ZW0gc2hvdWxkIGhhdmUgYSBzdHJpbmcgbXNnJyxcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiAnZmFpbGVkJ1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIExldHMgY2hlY2sgaWYgd2Ugc2hvdWxkIGlnbm9yZSBpdC4uLlxuICAgICAgICAgICAgY29uc3QgaXNJZ25vcmUgPSBjb250YWlucyhpZ25vcmUsIHZhbC5tc2cpIHx8IGNvbnRhaW5zKGlnbm9yZSwgdmFsLnJhdyk7XG4gICAgICAgICAgICB2YWwuc3RhdHVzID0gaXNJZ25vcmUgPyAnaWdub3JlZCcgOiB2YWwuc3RhdHVzO1xuXG4gICAgICAgICAgICBpZiAodmFsLnN0YXR1cyAhPT0gJ2lnbm9yZWQnKSB7XG4gICAgICAgICAgICAgICAgLy8gV2UgbmVlZCB0byB0YWtlIGNhcmUgb2Ygc3RhdHVzLi4uXG4gICAgICAgICAgICAgICAgaWYgKHZhbC5zdGF0dXMgPT09ICd3YXJuaW5nJykge1xuICAgICAgICAgICAgICAgICAgICBsb2dXYXJuKHJ1bGUubmFtZSwgdmFsLm1zZywgdmFsLnJhdyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh2YWwuc3RhdHVzID09PSAnZmFpbGVkJykge1xuICAgICAgICAgICAgICAgICAgICBuZXN0ZWRFcnJvciA9IHRydWU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsLnN0YXR1cyA9ICdwYXNzZWQnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHZhbDtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gVGhlcmUgd2FzIGFuIGVycm9yIG9uIHRoZSBuZXN0ZWQgb25lc1xuICAgICAgICBpZiAobmVzdGVkRXJyb3IpIHtcbiAgICAgICAgICAgIGRhdGEuc3RhdHVzID0gJ2ZhaWxlZCc7XG4gICAgICAgICAgICB0aHJvdyBkYXRhO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTm8gd29ycmllcywgcGFzcyB0aGUgZGF0YVxuICAgICAgICByZXR1cm4gZGF0YTtcbiAgICB9KTtcbn07XG5cbi8qKlxuICogUnVucyBhdWRpdFxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBhdWRpdHNEYXRhXG4gKiBAcGFyYW0ge29iamVjdH0gc3JjXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSByZXNvbHZlXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSByZWplY3RcbiAqIEByZXR1cm5zXG4gKi9cbmNvbnN0IHJ1bkF1ZGl0ID0gKGF1ZGl0c0RhdGEgPSBbXSwgc3JjID0ge30sIHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGxldCBhbGxEb25lID0gMDtcbiAgICBsZXQgcHJvbWlzZXNDb3VudCA9IDA7XG4gICAgY29uc3QgYXVkaXRzID0ge307XG5cbiAgICBpZiAodHlwZW9mIHJlc29sdmUgIT09ICdmdW5jdGlvbicgfHwgdHlwZW9mIHJlamVjdCAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Jlc29sdmUgYW5kIHJlamVjdCBmdW5jdGlvbnMgbmVlZCB0byBiZSBwcm92aWRlZCcpO1xuICAgIH1cblxuICAgIC8vIFdlIG5lZWQgdG8ga25vdyBob3cgbWFueSBydWxlcyB0aGVyZSBhcmVcbiAgICBhdWRpdHNEYXRhLmZvckVhY2goYXVkaXQgPT4geyBwcm9taXNlc0NvdW50ICs9IChhdWRpdC5ydWxlcyB8fCBbXSkubGVuZ3RoOyB9KTtcblxuICAgIGlmICghYXVkaXRzRGF0YS5sZW5ndGggfHwgcHJvbWlzZXNDb3VudCA9PT0gMCkge1xuICAgICAgICByZXNvbHZlKGF1ZGl0cyk7XG4gICAgfVxuXG4gICAgLy8gTGV0cyBnbyBwZXIgYXVkaXQuLi5cbiAgICBhdWRpdHNEYXRhLmZvckVhY2goYXVkaXQgPT4ge1xuICAgICAgICBhdWRpdHNbYXVkaXQubmFtZV0gPSBbXTtcblxuICAgICAgICBkZXNUZXN0KGBBdWRpdDogJHthdWRpdC5uYW1lfWAsICgpID0+IGF1ZGl0LnJ1bGVzLmZvckVhY2gocnVsZSA9PiB7XG4gICAgICAgICAgICBjb25zdCBpc0lnbm9yZSA9IGNvbnRhaW5zKGF1ZGl0Lmlnbm9yZSwgcnVsZS5uYW1lKTtcblxuICAgICAgICAgICAgLy8gV2UgbWF5IG5lZWQgdG8gaWdub3JlIGl0XG4gICAgICAgICAgICBpZiAoaXNJZ25vcmUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaXRUZXN0LnNraXAoYFJ1bGU6ICR7cnVsZS5uYW1lfWAsICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQ2FjaGUgaXQgc28gd2Uga25vdyBpdCBsYXRlclxuICAgICAgICAgICAgICAgICAgICBhdWRpdHNbYXVkaXQubmFtZV0ucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBydWxlLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXM6ICdpZ25vcmVkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdDogZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgYWxsRG9uZSArPSAxO1xuICAgICAgICAgICAgICAgICAgICBpZiAoYWxsRG9uZSA9PT0gcHJvbWlzZXNDb3VudCkgeyByZXNvbHZlKGF1ZGl0cyk7IH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gTGV0cyBhY3R1YWxseSBydW4gdGhlIHJ1bGVcbiAgICAgICAgICAgIGl0VGVzdChgUnVsZTogJHtydWxlLm5hbWV9YCwgZnVuY3Rpb24gKGRvbmUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRpbWVvdXQoMjAwMDApO1xuXG4gICAgICAgICAgICAgICAgLy8gTGV0cyBydW4gdGhlIHJ1bGVcbiAgICAgICAgICAgICAgICBydW5SdWxlKHJ1bGUsIHNyYywgYXVkaXQuaWdub3JlKVxuICAgICAgICAgICAgICAgIC50aGVuKG5ld1J1bGUgPT4ge1xuICAgICAgICAgICAgICAgICAgICAvLyBSZWFkeVxuICAgICAgICAgICAgICAgICAgICBhdWRpdHNbYXVkaXQubmFtZV0ucHVzaChuZXdSdWxlKTtcbiAgICAgICAgICAgICAgICAgICAgZG9uZSgpO1xuXG4gICAgICAgICAgICAgICAgICAgIGFsbERvbmUgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFsbERvbmUgPT09IHByb21pc2VzQ291bnQpIHsgcmVzb2x2ZShhdWRpdHMpOyB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ld1J1bGU7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuY2F0Y2gobmV3UnVsZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVyciA9IG5ld1J1bGUucmVzdWx0O1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIFJlYWR5XG4gICAgICAgICAgICAgICAgICAgIGF1ZGl0c1thdWRpdC5uYW1lXS5wdXNoKG5ld1J1bGUpO1xuICAgICAgICAgICAgICAgICAgICBkb25lKGVyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyIDogbmV3IEVycm9yKEpTT04uc3RyaW5naWZ5KGVyciwgbnVsbCwgNCkpKTtcblxuICAgICAgICAgICAgICAgICAgICBhbGxEb25lICs9IDE7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhbGxEb25lID09PSBwcm9taXNlc0NvdW50KSB7IHJlamVjdChhdWRpdHMpOyB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSkpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGF1ZGl0cztcbn07XG5cbi8qKlxuICogQnVpbGQgYXVkaXRzIGFycmF5XG4gKlxuICogQHBhcmFtIHthcnJheX0gYXVkaXRzXG4gKiBAcmV0dXJucyB7YXJyYXl9XG4gKi9cbmNvbnN0IGJ1aWxkQXVkaXRzID0gKGF1ZGl0cykgPT4ge1xuICAgIGF1ZGl0cyA9ICh0eXBlb2YgYXVkaXRzID09PSAnc3RyaW5nJykgPyBbYXVkaXRzXSA6IGF1ZGl0cztcbiAgICBhdWRpdHMgPSBhdWRpdHMubWFwKHZhbCA9PiB7XG4gICAgICAgIHZhbCA9ICh0eXBlb2YgdmFsID09PSAnb2JqZWN0JykgPyB2YWwgOiB7IHNyYzogdmFsIH07XG5cbiAgICAgICAgLy8gTGV0cyByZXF1aXJlXG4gICAgICAgIGxldCBtb2QgPSBtb2R1bGVzW3ZhbC5zcmNdIHx8IHJlcXVpcmUoZ2V0UHdkKHZhbC5zcmMpKTtcbiAgICAgICAgbW9kID0gKHR5cGVvZiBtb2QgPT09ICdvYmplY3QnICYmIG1vZC5kZWZhdWx0KSA/IG1vZC5kZWZhdWx0IDogbW9kO1xuXG4gICAgICAgIC8vIE5vdyBzZXQgYWxsIGFzIHNob3VsZFxuICAgICAgICB2YWwubmFtZSA9IG1vZC5uYW1lO1xuICAgICAgICB2YWwucnVsZXMgPSBtb2QucnVsZXMubWFwKChydWxlKSA9PiB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHJ1bGUgIT09ICdvYmplY3QnIHx8IGlzQXJyYXkocnVsZSkpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0EgcnVsZSBuZWVkcyB0byBiZSBhbiBvYmplY3QnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCFydWxlLm5hbWUpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0EgcnVsZSBuZWVkcyBhIG5hbWUnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCFydWxlLmZuKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBIHJ1bGUgbmVlZHMgYSBmdW5jdGlvbicpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gcnVsZTtcbiAgICAgICAgfSk7XG4gICAgICAgIHZhbC5pZ25vcmUgPSB2YWwuaWdub3JlIHx8IFtdO1xuXG4gICAgICAgIHJldHVybiB2YWw7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gYXVkaXRzO1xufTtcblxuLyoqXG4gKiBHYXRoZXIgZGF0YVxuICpcbiAqIEBwYXJhbSB7YXJyYXl9IGRhdGFcbiAqIEByZXR1cm5zIHtwcm9taXNlfVxuICovXG5jb25zdCBnYXRoZXJEYXRhID0gKGRhdGEgPSBbXSkgPT4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IHJlcURhdGEgPSBbXTtcbiAgICBjb25zdCBwcm9taXNlc0NvdW50ID0gZGF0YS5sZW5ndGg7XG4gICAgbGV0IGFsbERvbmUgPSAwO1xuXG4gICAgLy8gTm8gbmVlZCB0byBnbyBmdXJ0aGVyIHdpdGhvdXQgZGF0YVxuICAgIGlmICghZGF0YS5sZW5ndGgpIHsgcmV0dXJuIHJlc29sdmUoKTsgfVxuXG4gICAgLy8gR28gdGhyb3VnaCBlYWNoIHJlcXVlc3RcbiAgICBkYXRhLmZvckVhY2goKHJlcSkgPT4gZGVzVGVzdCgnUmVxdWVzdGluZyBzcmMnLCAoKSA9PiBpdFRlc3QoJ0dhdGhlcmluZyBkYXRhLi4uJywgZnVuY3Rpb24gKGRvbmUpIHtcbiAgICAgICAgdGhpcy50aW1lb3V0KDEwMDAwKTtcblxuICAgICAgICAvLyBMZXRzIGdldCB0aGUgc2NyYXBlciBkYXRhXG4gICAgICAgIHJ1blNjcmFwZXIocmVxKS50aGVuKChzY3JhcERhdGEpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5ld1JlcSA9IG1lcmdlKHJlcSwge1xuICAgICAgICAgICAgICAgIGF1ZGl0c0RhdGE6IGJ1aWxkQXVkaXRzKHJlcS5hdWRpdHMpLFxuICAgICAgICAgICAgICAgIHNyY0RhdGE6IHNjcmFwRGF0YVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIFJlYWR5XG4gICAgICAgICAgICByZXFEYXRhLnB1c2gobmV3UmVxKTtcbiAgICAgICAgICAgIGRvbmUoKTtcblxuICAgICAgICAgICAgYWxsRG9uZSArPSAxO1xuICAgICAgICAgICAgaWYgKGFsbERvbmUgPT09IHByb21pc2VzQ291bnQpIHsgcmVzb2x2ZShyZXFEYXRhKTsgfVxuXG4gICAgICAgICAgICByZXR1cm4gbmV3UmVxO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgY29uc3QgbmV3UmVxID0gbWVyZ2UocmVxLCB7IGVyciB9KTtcblxuICAgICAgICAgICAgLy8gUmVhZHlcbiAgICAgICAgICAgIHJlcURhdGEucHVzaChuZXdSZXEpO1xuICAgICAgICAgICAgZG9uZShlcnIpO1xuXG4gICAgICAgICAgICBhbGxEb25lICs9IDE7XG4gICAgICAgICAgICBpZiAoYWxsRG9uZSA9PT0gcHJvbWlzZXNDb3VudCkgeyByZWplY3QocmVxRGF0YSk7IH1cbiAgICAgICAgfSk7XG4gICAgfSkpKTtcbn0pO1xuXG4vKipcbiAqIEluaXRpYWxpemUgYXVkaXRzXG4gKlxuICogQHBhcmFtIHtvYmplY3R8c3RyaW5nfSBjb25maWdcbiAqIEByZXR1cm5zIHtwcm9taXNlfVxuICovXG5jb25zdCBydW4gPSAoY29uZmlnKSA9PiB7XG4gICAgY29uZmlnID0gY29uZmlnR2V0KGNvbmZpZyk7XG5cbiAgICAvLyBMZXRzIGdhdGhlciBkYXRhIGZyb20gdGhlIHNyY1xuICAgIHJldHVybiBnYXRoZXJEYXRhKGNvbmZpZy5kYXRhKVxuICAgIC50aGVuKGRhdGEgPT4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAvLyBHbyB0aHJvdWdoIGVhY2ggZWxlbWVudCBpbiBkYXRhXG4gICAgICAgIC8vIExldHMgcnVuIGF1ZGl0cyBwZXIgcmVxdWVzdFxuICAgICAgICBkYXRhLmZvckVhY2gocmVxID0+IHJlcS5zcmNEYXRhLmZvckVhY2goc3JjID0+IHtcbiAgICAgICAgICAgIGRlc1Rlc3QoYEF1ZGl0aW5nOiAke3NyYy5vcmlnaW5hbFNyY31gLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgcnVuQXVkaXQocmVxLmF1ZGl0c0RhdGEsIHNyYywgcmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KSk7XG4gICAgfSkpO1xufTtcblxuLyoqXG4gKiBTZXRzIHVwIHRoZSB0ZXN0aW5nIGVudmlyb25tZW50XG4gKlxuICogQHBhcmFtIHtmdW5jdGlvbn0gbmV3RGVzXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBuZXdJdFxuICogQHBhcmFtIHtmdW5jdGlvbn0gbmV3V2FyblxuICogQHBhcmFtIHtib29sZWFufSByZXNldFxuICovXG5jb25zdCBzZXR1cCA9IChuZXdEZXMsIG5ld0l0LCBuZXdXYXJuLCByZXNldCkgPT4ge1xuICAgIGlmIChuZXdEZXMgJiYgdHlwZW9mIG5ld0RlcyAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Rlc2NyaWJlIG5lZWRzIHRvIGJlIGEgZnVuY3Rpb24nKTtcbiAgICB9XG5cbiAgICBpZiAobmV3SXQgJiYgdHlwZW9mIG5ld0l0ICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignSXQgbmVlZHMgdG8gYmUgYSBmdW5jdGlvbicpO1xuICAgIH1cblxuICAgIGlmIChuZXdXYXJuICYmIHR5cGVvZiBuZXdXYXJuICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignV2FybiBuZWVkcyB0byBiZSBhIGZ1bmN0aW9uJyk7XG4gICAgfVxuXG4gICAgLy8gUmVzZXRcbiAgICBpZiAocmVzZXQpIHtcbiAgICAgICAgZGVzVGVzdCA9IGl0VGVzdCA9IGxvZ1dhcm4gPSBudWxsO1xuICAgIH1cblxuICAgIGRlc1Rlc3QgPSBuZXdEZXMgfHwgZGVzVGVzdCB8fCBmdW5jdGlvbiAobXNnLCBjYikge1xuICAgICAgICBjYigpO1xuICAgIH07XG5cbiAgICBpdFRlc3QgPSBuZXdJdCB8fCBpdFRlc3QgfHwgZnVuY3Rpb24gKG1zZywgY2IpIHtcbiAgICAgICAgY29uc3QgbW9kdWxlID0ge1xuICAgICAgICAgICAgZG9uZTogKCkgPT4ge30sXG4gICAgICAgICAgICB0aW1lb3V0OiAoKSA9PiB7fVxuICAgICAgICB9O1xuXG4gICAgICAgIGNiLmJpbmQobW9kdWxlKShtb2R1bGUuZG9uZSk7XG4gICAgfTtcbiAgICBpdFRlc3Quc2tpcCA9IG5ld0l0ICYmIG5ld0l0LnNraXAgfHwgaXRUZXN0ICYmIGl0VGVzdC5za2lwIHx8IGZ1bmN0aW9uIChtc2csIGNiKSB7XG4gICAgICAgIGNvbnN0IG1vZHVsZSA9IHtcbiAgICAgICAgICAgIGRvbmU6ICgpID0+IHt9LFxuICAgICAgICAgICAgdGltZW91dDogKCkgPT4ge31cbiAgICAgICAgfTtcblxuICAgICAgICBjYi5iaW5kKG1vZHVsZSkobW9kdWxlLmRvbmUpO1xuICAgIH07XG5cbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby1jb25zb2xlICovXG4gICAgbG9nV2FybiA9IG5ld1dhcm4gfHwgbG9nV2FybiB8fCBmdW5jdGlvbiAobW9kdWxlLCAuLi5tc2cpIHsgY29uc29sZS53YXJuKG1vZHVsZSwgLi4ubXNnKTsgfTtcbiAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLWNvbnNvbGUgKi9cbn07XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUnVudGltZVxuXG5pZiAoYXJndiAmJiBhcmd2Lm1vY2hhKSB7XG4gICAgLyogZXNsaW50LWRpc2FibGUgbm8tdW5kZWYgKi9cbiAgICBzZXR1cChkZXNjcmliZSwgaXQpO1xuICAgIC8qIGVzbGludC1lbmFibGUgbm8tdW5kZWYgKi9cbn0gZWxzZSB7XG4gICAgc2V0dXAoKTtcbn1cbmFyZ3YgJiYgYXJndi5jb25maWcgJiYgcnVuKGFyZ3YuY29uZmlnKTtcbmV4cG9ydCB7IHNldHVwIH07XG5leHBvcnQgeyBydW4gfTtcblxuLy8gRXNzZW50aWFsbHkgZm9yIHRlc3RpbmcgcHVycG9zZXNcbmV4cG9ydCBjb25zdCBfX3Rlc3RNZXRob2RzX18gPSB7IHJ1biwgc2V0dXAsIGdhdGhlckRhdGEsIGJ1aWxkQXVkaXRzLCBydW5BdWRpdCwgcnVuUnVsZSB9O1xuIl19