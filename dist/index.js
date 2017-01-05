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
        if (!(0, _isArray2.default)(data.result) || !data.result[0] || _typeof(data.result[0]) !== 'object') {
            return data;
        } else if (!data.result[0].status) {
            return data;
        }

        // Lets check for nested issues...
        var nestedError = false;
        data.result = data.result.map(function (val) {
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
                    this.timeout(60000);

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJtb2R1bGVzIiwiYmVzdFByYWN0aWNlcyIsInJlcXVpcmUiLCJhbmFseXRpY3MiLCJsb2dXYXJuIiwiZGVzVGVzdCIsIml0VGVzdCIsInJ1blJ1bGUiLCJydWxlIiwic3JjIiwiaWdub3JlIiwiRXJyb3IiLCJuYW1lIiwiZm4iLCJ0aGVuIiwic3RhdHVzIiwicmVzdWx0IiwicnVsZURhdGEiLCJjYXRjaCIsImVyciIsImRhdGEiLCJuZXN0ZWRFcnJvciIsIm1hcCIsImlzSWdub3JlIiwidmFsIiwibXNnIiwicmF3IiwicnVuQXVkaXQiLCJhdWRpdHNEYXRhIiwicmVzb2x2ZSIsInJlamVjdCIsImFsbERvbmUiLCJwcm9taXNlc0NvdW50IiwiYXVkaXRzIiwiZm9yRWFjaCIsImF1ZGl0IiwicnVsZXMiLCJsZW5ndGgiLCJza2lwIiwicHVzaCIsImRvbmUiLCJ0aW1lb3V0IiwibmV3UnVsZSIsIkpTT04iLCJzdHJpbmdpZnkiLCJidWlsZEF1ZGl0cyIsIm1vZCIsImRlZmF1bHQiLCJnYXRoZXJEYXRhIiwiUHJvbWlzZSIsInJlcURhdGEiLCJyZXEiLCJzY3JhcERhdGEiLCJuZXdSZXEiLCJzcmNEYXRhIiwicnVuIiwiY29uZmlnIiwib3JpZ2luYWxTcmMiLCJzZXR1cCIsIm5ld0RlcyIsIm5ld0l0IiwibmV3V2FybiIsInJlc2V0IiwiY2IiLCJtb2R1bGUiLCJiaW5kIiwid2FybiIsIm1vY2hhIiwiZGVzY3JpYmUiLCJpdCJdLCJtYXBwaW5ncyI6Ijs7QUFFQTtBQUNBOzs7Ozs7Ozs7QUFFQTs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7QUFFQTtBQUNBLElBQU1BLFVBQVU7QUFDWkMsbUJBQWVDLFFBQVEsNEJBQVIsQ0FESDtBQUVaQyxlQUFXRCxRQUFRLHdCQUFSO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVBZLENBQWhCOztBQVVBLElBQUlFLGdCQUFKO0FBQ0EsSUFBSUMsZ0JB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O0FBQStCLEtBQTNGO0FBQ0E7QUFDSCxDQTFDRDs7QUE0Q0E7QUFDQTs7QUFFQSxJQUFJLGVBQVEsWUFBSzBDLEtBQWpCLEVBQXdCO0FBQ3BCO0FBQ0FULFVBQU1VLFFBQU4sRUFBZ0JDLEVBQWhCO0FBQ0E7QUFDSCxDQUpELE1BSU87QUFDSFg7QUFDSDtBQUNELGVBQVEsWUFBS0YsTUFBYixJQUF1QkQsSUFBSSxZQUFLQyxNQUFULENBQXZCO1FBQ1NFLEssR0FBQUEsSztRQUNBSCxHLEdBQUFBLEc7O0FBRVQiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJcblxuJ3VzZSBzdHJpY3QnO1xuLyogZ2xvYmFsIFByb21pc2UgKi9cblxuaW1wb3J0IHsgYXJndiB9IGZyb20gJ3lhcmdzJztcbmltcG9ydCBtZXJnZSBmcm9tICdsb2Rhc2gvbWVyZ2UuanMnO1xuaW1wb3J0IGlzQXJyYXkgZnJvbSAnbG9kYXNoL2lzQXJyYXkuanMnO1xuaW1wb3J0IHsgcnVuIGFzIHJ1blNjcmFwZXIgfSBmcm9tICcuL3NjcmFwZXIuanMnO1xuaW1wb3J0IHsgZ2V0IGFzIGNvbmZpZ0dldCB9IGZyb20gJy4vY29uZmlnLmpzJztcbmltcG9ydCB7IGdldFB3ZCwgY29udGFpbnMgfSBmcm9tICcuL3V0aWxzLmpzJztcblxuLy8gSW1wb3J0IG1vZHVsZXNcbmNvbnN0IG1vZHVsZXMgPSB7XG4gICAgYmVzdFByYWN0aWNlczogcmVxdWlyZSgnLi9tb2R1bGVzL2Jlc3RQcmFjdGljZXMuanMnKSxcbiAgICBhbmFseXRpY3M6IHJlcXVpcmUoJy4vbW9kdWxlcy9hbmFseXRpY3MuanMnKVxuICAgIC8vIHczOiByZXF1aXJlKCcuL21vZHVsZXMvdzMuanMnKVxuICAgIC8vIFRPRE86IFRha2UgY2FyZSBvZiB0aGVzZSBtb2R1bGVzIHRvIGJlIGNvbXBsaWFudC4uLlxuICAgIC8vIHdjYWc6IHJlcXVpcmUoJy4vbW9kdWxlcy93Y2FnLmpzJyksXG4gICAgLy8gU0VPOiByZXF1aXJlKCcuL21vZHVsZXMvc2VvLmpzJyksXG4gICAgLy8gbGlnaHRob3VzZTogcmVxdWlyZSgnLi9tb2R1bGVzL2xpZ2h0aG91c2UuanMnKVxufTtcblxubGV0IGxvZ1dhcm47XG5sZXQgZGVzVGVzdDtcbmxldCBpdFRlc3Q7XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gRnVuY3Rpb25zXG5cbi8qKlxuICogUnVucyB0aGUgcnVsZVxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBydWxlXG4gKiBAcGFyYW0ge29iamVjdH0gc3JjXG4gKiBAcGFyYW0ge2FycmF5fSBpZ25vcmVcbiAqIEByZXR1cm5zXG4gKi9cbmNvbnN0IHJ1blJ1bGUgPSAocnVsZSA9IHt9LCBzcmMgPSB7fSwgaWdub3JlID0gW10pID0+IHtcbiAgICBpZiAodHlwZW9mIHJ1bGUgIT09ICdvYmplY3QnIHx8IGlzQXJyYXkocnVsZSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBIHJ1bGUgbmVlZHMgdG8gYmUgYW4gb2JqZWN0Jyk7XG4gICAgfVxuXG4gICAgaWYgKCFydWxlLm5hbWUgfHwgdHlwZW9mIHJ1bGUubmFtZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBIHJ1bGUgbmVlZHMgYSBzdHJpbmcgbmFtZScpO1xuICAgIH1cblxuICAgIGlmICghcnVsZS5mbiB8fCB0eXBlb2YgcnVsZS5mbiAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0EgcnVsZSBuZWVkcyBhIGZ1bmN0aW9uIGZuJyk7XG4gICAgfVxuXG4gICAgLy8gTGV0cyBydW4gdGhlIHByb21pc2UgYW5kIHBhcnNlIHRoZSBkYXRhXG4gICAgcmV0dXJuIHJ1bGUuZm4oc3JjKS50aGVuKHJ1bGVEYXRhID0+IG1lcmdlKHtcbiAgICAgICAgbmFtZTogcnVsZS5uYW1lLFxuICAgICAgICBzdGF0dXM6ICdwYXNzZWQnLFxuICAgICAgICByZXN1bHQ6IHJ1bGVEYXRhXG4gICAgfSkpXG4gICAgLmNhdGNoKGVyciA9PiAoe1xuICAgICAgICBuYW1lOiBydWxlLm5hbWUsXG4gICAgICAgIHN0YXR1czogJ2ZhaWxlZCcsXG4gICAgICAgIHJlc3VsdDogZXJyXG4gICAgfSkpXG4gICAgLnRoZW4oZGF0YSA9PiB7XG4gICAgICAgIC8vIElzIHRoaXMgaWdub3JlZCBhbHJlYWR5P1xuICAgICAgICBpZiAoY29udGFpbnMoaWdub3JlLCBkYXRhLm5hbWUpKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIG5hbWU6IGRhdGEubmFtZSxcbiAgICAgICAgICAgICAgICBzdGF0dXM6ICdpZ25vcmVkJyxcbiAgICAgICAgICAgICAgICByZXN1bHQ6IGZhbHNlXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVGhlcmUgd2FzIGFuIGVycm9yIGJlZm9yZVxuICAgICAgICBpZiAoZGF0YS5zdGF0dXMgPT09ICdmYWlsZWQnKSB7XG4gICAgICAgICAgICB0aHJvdyBkYXRhO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTm8gbmVlZCB0byBnbyBmdXJ0aGVyIHdpdGhvdXQgYW4gYXJyYXlcbiAgICAgICAgaWYgKCFpc0FycmF5KGRhdGEucmVzdWx0KSB8fCAhZGF0YS5yZXN1bHRbMF0gfHwgdHlwZW9mIGRhdGEucmVzdWx0WzBdICE9PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgICAgIH0gZWxzZSBpZiAoIWRhdGEucmVzdWx0WzBdLnN0YXR1cykge1xuICAgICAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBMZXRzIGNoZWNrIGZvciBuZXN0ZWQgaXNzdWVzLi4uXG4gICAgICAgIGxldCBuZXN0ZWRFcnJvciA9IGZhbHNlO1xuICAgICAgICBkYXRhLnJlc3VsdCA9IGRhdGEucmVzdWx0Lm1hcCh2YWwgPT4ge1xuICAgICAgICAgICAgLy8gTGV0cyBjaGVjayBpZiB3ZSBzaG91bGQgaWdub3JlIGl0Li4uXG4gICAgICAgICAgICBjb25zdCBpc0lnbm9yZSA9IGNvbnRhaW5zKGlnbm9yZSwgdmFsLm1zZykgfHwgY29udGFpbnMoaWdub3JlLCB2YWwucmF3KTtcbiAgICAgICAgICAgIHZhbC5zdGF0dXMgPSBpc0lnbm9yZSA/ICdpZ25vcmVkJyA6IHZhbC5zdGF0dXM7XG5cbiAgICAgICAgICAgIGlmICh2YWwuc3RhdHVzICE9PSAnaWdub3JlZCcpIHtcbiAgICAgICAgICAgICAgICAvLyBXZSBuZWVkIHRvIHRha2UgY2FyZSBvZiBzdGF0dXMuLi5cbiAgICAgICAgICAgICAgICBpZiAodmFsLnN0YXR1cyA9PT0gJ3dhcm5pbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvZ1dhcm4ocnVsZS5uYW1lLCB2YWwubXNnLCB2YWwucmF3KTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHZhbC5zdGF0dXMgPT09ICdmYWlsZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgIG5lc3RlZEVycm9yID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB2YWwuc3RhdHVzID0gJ3Bhc3NlZCc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdmFsO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBUaGVyZSB3YXMgYW4gZXJyb3Igb24gdGhlIG5lc3RlZCBvbmVzXG4gICAgICAgIGlmIChuZXN0ZWRFcnJvcikge1xuICAgICAgICAgICAgZGF0YS5zdGF0dXMgPSAnZmFpbGVkJztcbiAgICAgICAgICAgIHRocm93IGRhdGE7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBObyB3b3JyaWVzLCBwYXNzIHRoZSBkYXRhXG4gICAgICAgIHJldHVybiBkYXRhO1xuICAgIH0pO1xufTtcblxuLyoqXG4gKiBSdW5zIGF1ZGl0XG4gKlxuICogQHBhcmFtIHtvYmplY3R9IGF1ZGl0c0RhdGFcbiAqIEBwYXJhbSB7b2JqZWN0fSBzcmNcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IHJlc29sdmVcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IHJlamVjdFxuICogQHJldHVybnNcbiAqL1xuY29uc3QgcnVuQXVkaXQgPSAoYXVkaXRzRGF0YSA9IFtdLCBzcmMgPSB7fSwgcmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgbGV0IGFsbERvbmUgPSAwO1xuICAgIGxldCBwcm9taXNlc0NvdW50ID0gMDtcbiAgICBjb25zdCBhdWRpdHMgPSB7fTtcblxuICAgIGlmICh0eXBlb2YgcmVzb2x2ZSAhPT0gJ2Z1bmN0aW9uJyB8fCB0eXBlb2YgcmVqZWN0ICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignUmVzb2x2ZSBhbmQgcmVqZWN0IGZ1bmN0aW9ucyBuZWVkIHRvIGJlIHByb3ZpZGVkJyk7XG4gICAgfVxuXG4gICAgLy8gV2UgbmVlZCB0byBrbm93IGhvdyBtYW55IHJ1bGVzIHRoZXJlIGFyZVxuICAgIGF1ZGl0c0RhdGEuZm9yRWFjaChhdWRpdCA9PiB7IHByb21pc2VzQ291bnQgKz0gKGF1ZGl0LnJ1bGVzIHx8IFtdKS5sZW5ndGg7IH0pO1xuXG4gICAgaWYgKCFhdWRpdHNEYXRhLmxlbmd0aCB8fCBwcm9taXNlc0NvdW50ID09PSAwKSB7XG4gICAgICAgIHJlc29sdmUoYXVkaXRzKTtcbiAgICB9XG5cbiAgICAvLyBMZXRzIGdvIHBlciBhdWRpdC4uLlxuICAgIGF1ZGl0c0RhdGEuZm9yRWFjaChhdWRpdCA9PiB7XG4gICAgICAgIGF1ZGl0c1thdWRpdC5uYW1lXSA9IFtdO1xuXG4gICAgICAgIGRlc1Rlc3QoYEF1ZGl0OiAke2F1ZGl0Lm5hbWV9YCwgKCkgPT4gYXVkaXQucnVsZXMuZm9yRWFjaChydWxlID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGlzSWdub3JlID0gY29udGFpbnMoYXVkaXQuaWdub3JlLCBydWxlLm5hbWUpO1xuXG4gICAgICAgICAgICAvLyBXZSBtYXkgbmVlZCB0byBpZ25vcmUgaXRcbiAgICAgICAgICAgIGlmIChpc0lnbm9yZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpdFRlc3Quc2tpcChgUnVsZTogJHtydWxlLm5hbWV9YCwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAvLyBDYWNoZSBpdCBzbyB3ZSBrbm93IGl0IGxhdGVyXG4gICAgICAgICAgICAgICAgICAgIGF1ZGl0c1thdWRpdC5uYW1lXS5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHJ1bGUubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1czogJ2lnbm9yZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0OiBmYWxzZVxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICBhbGxEb25lICs9IDE7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhbGxEb25lID09PSBwcm9taXNlc0NvdW50KSB7IHJlc29sdmUoYXVkaXRzKTsgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBMZXRzIGFjdHVhbGx5IHJ1biB0aGUgcnVsZVxuICAgICAgICAgICAgaXRUZXN0KGBSdWxlOiAke3J1bGUubmFtZX1gLCBmdW5jdGlvbiAoZG9uZSkge1xuICAgICAgICAgICAgICAgIHRoaXMudGltZW91dCg2MDAwMCk7XG5cbiAgICAgICAgICAgICAgICAvLyBMZXRzIHJ1biB0aGUgcnVsZVxuICAgICAgICAgICAgICAgIHJ1blJ1bGUocnVsZSwgc3JjLCBhdWRpdC5pZ25vcmUpXG4gICAgICAgICAgICAgICAgLnRoZW4obmV3UnVsZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFJlYWR5XG4gICAgICAgICAgICAgICAgICAgIGF1ZGl0c1thdWRpdC5uYW1lXS5wdXNoKG5ld1J1bGUpO1xuICAgICAgICAgICAgICAgICAgICBkb25lKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgYWxsRG9uZSArPSAxO1xuICAgICAgICAgICAgICAgICAgICBpZiAoYWxsRG9uZSA9PT0gcHJvbWlzZXNDb3VudCkgeyByZXNvbHZlKGF1ZGl0cyk7IH1cblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3UnVsZTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5jYXRjaChuZXdSdWxlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyID0gbmV3UnVsZS5yZXN1bHQ7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gUmVhZHlcbiAgICAgICAgICAgICAgICAgICAgYXVkaXRzW2F1ZGl0Lm5hbWVdLnB1c2gobmV3UnVsZSk7XG4gICAgICAgICAgICAgICAgICAgIGRvbmUoZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIgOiBuZXcgRXJyb3IoSlNPTi5zdHJpbmdpZnkoZXJyLCBudWxsLCA0KSkpO1xuXG4gICAgICAgICAgICAgICAgICAgIGFsbERvbmUgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFsbERvbmUgPT09IHByb21pc2VzQ291bnQpIHsgcmVqZWN0KGF1ZGl0cyk7IH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gYXVkaXRzO1xufTtcblxuLyoqXG4gKiBCdWlsZCBhdWRpdHMgYXJyYXlcbiAqXG4gKiBAcGFyYW0ge2FycmF5fSBhdWRpdHNcbiAqIEByZXR1cm5zIHthcnJheX1cbiAqL1xuY29uc3QgYnVpbGRBdWRpdHMgPSAoYXVkaXRzKSA9PiB7XG4gICAgYXVkaXRzID0gKHR5cGVvZiBhdWRpdHMgPT09ICdzdHJpbmcnKSA/IFthdWRpdHNdIDogYXVkaXRzO1xuICAgIGF1ZGl0cyA9IGF1ZGl0cy5tYXAodmFsID0+IHtcbiAgICAgICAgdmFsID0gKHR5cGVvZiB2YWwgPT09ICdvYmplY3QnKSA/IHZhbCA6IHsgc3JjOiB2YWwgfTtcblxuICAgICAgICAvLyBMZXRzIHJlcXVpcmVcbiAgICAgICAgbGV0IG1vZCA9IG1vZHVsZXNbdmFsLnNyY10gfHwgcmVxdWlyZShnZXRQd2QodmFsLnNyYykpO1xuICAgICAgICBtb2QgPSAodHlwZW9mIG1vZCA9PT0gJ29iamVjdCcgJiYgbW9kLmRlZmF1bHQpID8gbW9kLmRlZmF1bHQgOiBtb2Q7XG5cbiAgICAgICAgLy8gTm93IHNldCBhbGwgYXMgc2hvdWxkXG4gICAgICAgIHZhbC5uYW1lID0gbW9kLm5hbWU7XG4gICAgICAgIHZhbC5ydWxlcyA9IG1vZC5ydWxlcy5tYXAoKHJ1bGUpID0+IHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcnVsZSAhPT0gJ29iamVjdCcgfHwgaXNBcnJheShydWxlKSkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQSBydWxlIG5lZWRzIHRvIGJlIGFuIG9iamVjdCcpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIXJ1bGUubmFtZSkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQSBydWxlIG5lZWRzIGEgbmFtZScpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIXJ1bGUuZm4pIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0EgcnVsZSBuZWVkcyBhIGZ1bmN0aW9uJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBydWxlO1xuICAgICAgICB9KTtcbiAgICAgICAgdmFsLmlnbm9yZSA9IHZhbC5pZ25vcmUgfHwgW107XG5cbiAgICAgICAgcmV0dXJuIHZhbDtcbiAgICB9KTtcblxuICAgIHJldHVybiBhdWRpdHM7XG59O1xuXG4vKipcbiAqIEdhdGhlciBkYXRhXG4gKlxuICogQHBhcmFtIHthcnJheX0gZGF0YVxuICogQHJldHVybnMge3Byb21pc2V9XG4gKi9cbmNvbnN0IGdhdGhlckRhdGEgPSAoZGF0YSA9IFtdKSA9PiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc3QgcmVxRGF0YSA9IFtdO1xuICAgIGNvbnN0IHByb21pc2VzQ291bnQgPSBkYXRhLmxlbmd0aDtcbiAgICBsZXQgYWxsRG9uZSA9IDA7XG5cbiAgICAvLyBObyBuZWVkIHRvIGdvIGZ1cnRoZXIgd2l0aG91dCBkYXRhXG4gICAgaWYgKCFkYXRhLmxlbmd0aCkgeyByZXR1cm4gcmVzb2x2ZSgpOyB9XG5cbiAgICAvLyBHbyB0aHJvdWdoIGVhY2ggcmVxdWVzdFxuICAgIGRhdGEuZm9yRWFjaCgocmVxKSA9PiBkZXNUZXN0KCdSZXF1ZXN0aW5nIHNyYycsICgpID0+IGl0VGVzdCgnR2F0aGVyaW5nIGRhdGEuLi4nLCBmdW5jdGlvbiAoZG9uZSkge1xuICAgICAgICB0aGlzLnRpbWVvdXQoMTAwMDApO1xuXG4gICAgICAgIC8vIExldHMgZ2V0IHRoZSBzY3JhcGVyIGRhdGFcbiAgICAgICAgcnVuU2NyYXBlcihyZXEpLnRoZW4oKHNjcmFwRGF0YSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbmV3UmVxID0gbWVyZ2UocmVxLCB7XG4gICAgICAgICAgICAgICAgYXVkaXRzRGF0YTogYnVpbGRBdWRpdHMocmVxLmF1ZGl0cyksXG4gICAgICAgICAgICAgICAgc3JjRGF0YTogc2NyYXBEYXRhXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gUmVhZHlcbiAgICAgICAgICAgIHJlcURhdGEucHVzaChuZXdSZXEpO1xuICAgICAgICAgICAgZG9uZSgpO1xuXG4gICAgICAgICAgICBhbGxEb25lICs9IDE7XG4gICAgICAgICAgICBpZiAoYWxsRG9uZSA9PT0gcHJvbWlzZXNDb3VudCkgeyByZXNvbHZlKHJlcURhdGEpOyB9XG5cbiAgICAgICAgICAgIHJldHVybiBuZXdSZXE7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuZXdSZXEgPSBtZXJnZShyZXEsIHsgZXJyIH0pO1xuXG4gICAgICAgICAgICAvLyBSZWFkeVxuICAgICAgICAgICAgcmVxRGF0YS5wdXNoKG5ld1JlcSk7XG4gICAgICAgICAgICBkb25lKGVycik7XG5cbiAgICAgICAgICAgIGFsbERvbmUgKz0gMTtcbiAgICAgICAgICAgIGlmIChhbGxEb25lID09PSBwcm9taXNlc0NvdW50KSB7IHJlamVjdChyZXFEYXRhKTsgfVxuICAgICAgICB9KTtcbiAgICB9KSkpO1xufSk7XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBhdWRpdHNcbiAqXG4gKiBAcGFyYW0ge29iamVjdHxzdHJpbmd9IGNvbmZpZ1xuICogQHJldHVybnMge3Byb21pc2V9XG4gKi9cbmNvbnN0IHJ1biA9IChjb25maWcpID0+IHtcbiAgICBjb25maWcgPSBjb25maWdHZXQoY29uZmlnKTtcblxuICAgIC8vIExldHMgZ2F0aGVyIGRhdGEgZnJvbSB0aGUgc3JjXG4gICAgcmV0dXJuIGdhdGhlckRhdGEoY29uZmlnLmRhdGEpXG4gICAgLnRoZW4oZGF0YSA9PiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIC8vIEdvIHRocm91Z2ggZWFjaCBlbGVtZW50IGluIGRhdGFcbiAgICAgICAgLy8gTGV0cyBydW4gYXVkaXRzIHBlciByZXF1ZXN0XG4gICAgICAgIGRhdGEuZm9yRWFjaChyZXEgPT4gcmVxLnNyY0RhdGEuZm9yRWFjaChzcmMgPT4ge1xuICAgICAgICAgICAgZGVzVGVzdChgQXVkaXRpbmc6ICR7c3JjLm9yaWdpbmFsU3JjfWAsICgpID0+IHtcbiAgICAgICAgICAgICAgICBydW5BdWRpdChyZXEuYXVkaXRzRGF0YSwgc3JjLCByZXNvbHZlLCByZWplY3QpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pKTtcbiAgICB9KSk7XG59O1xuXG4vKipcbiAqIFNldHMgdXAgdGhlIHRlc3RpbmcgZW52aXJvbm1lbnRcbiAqXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBuZXdEZXNcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IG5ld0l0XG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBuZXdXYXJuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IHJlc2V0XG4gKi9cbmNvbnN0IHNldHVwID0gKG5ld0RlcywgbmV3SXQsIG5ld1dhcm4sIHJlc2V0KSA9PiB7XG4gICAgaWYgKG5ld0RlcyAmJiB0eXBlb2YgbmV3RGVzICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignRGVzY3JpYmUgbmVlZHMgdG8gYmUgYSBmdW5jdGlvbicpO1xuICAgIH1cblxuICAgIGlmIChuZXdJdCAmJiB0eXBlb2YgbmV3SXQgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJdCBuZWVkcyB0byBiZSBhIGZ1bmN0aW9uJyk7XG4gICAgfVxuXG4gICAgaWYgKG5ld1dhcm4gJiYgdHlwZW9mIG5ld1dhcm4gIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdXYXJuIG5lZWRzIHRvIGJlIGEgZnVuY3Rpb24nKTtcbiAgICB9XG5cbiAgICAvLyBSZXNldFxuICAgIGlmIChyZXNldCkge1xuICAgICAgICBkZXNUZXN0ID0gaXRUZXN0ID0gbG9nV2FybiA9IG51bGw7XG4gICAgfVxuXG4gICAgZGVzVGVzdCA9IG5ld0RlcyB8fCBkZXNUZXN0IHx8IGZ1bmN0aW9uIChtc2csIGNiKSB7XG4gICAgICAgIGNiKCk7XG4gICAgfTtcblxuICAgIGl0VGVzdCA9IG5ld0l0IHx8IGl0VGVzdCB8fCBmdW5jdGlvbiAobXNnLCBjYikge1xuICAgICAgICBjb25zdCBtb2R1bGUgPSB7XG4gICAgICAgICAgICBkb25lOiAoKSA9PiB7fSxcbiAgICAgICAgICAgIHRpbWVvdXQ6ICgpID0+IHt9XG4gICAgICAgIH07XG5cbiAgICAgICAgY2IuYmluZChtb2R1bGUpKG1vZHVsZS5kb25lKTtcbiAgICB9O1xuICAgIGl0VGVzdC5za2lwID0gbmV3SXQgJiYgbmV3SXQuc2tpcCB8fCBpdFRlc3QgJiYgaXRUZXN0LnNraXAgfHwgZnVuY3Rpb24gKG1zZywgY2IpIHtcbiAgICAgICAgY29uc3QgbW9kdWxlID0ge1xuICAgICAgICAgICAgZG9uZTogKCkgPT4ge30sXG4gICAgICAgICAgICB0aW1lb3V0OiAoKSA9PiB7fVxuICAgICAgICB9O1xuXG4gICAgICAgIGNiLmJpbmQobW9kdWxlKShtb2R1bGUuZG9uZSk7XG4gICAgfTtcblxuICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLWNvbnNvbGUgKi9cbiAgICBsb2dXYXJuID0gbmV3V2FybiB8fCBsb2dXYXJuIHx8IGZ1bmN0aW9uIChtb2R1bGUsIC4uLm1zZykgeyBjb25zb2xlLndhcm4obW9kdWxlLCAuLi5tc2cpOyB9O1xuICAgIC8qIGVzbGludC1lbmFibGUgbm8tY29uc29sZSAqL1xufTtcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBSdW50aW1lXG5cbmlmIChhcmd2ICYmIGFyZ3YubW9jaGEpIHtcbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby11bmRlZiAqL1xuICAgIHNldHVwKGRlc2NyaWJlLCBpdCk7XG4gICAgLyogZXNsaW50LWVuYWJsZSBuby11bmRlZiAqL1xufSBlbHNlIHtcbiAgICBzZXR1cCgpO1xufVxuYXJndiAmJiBhcmd2LmNvbmZpZyAmJiBydW4oYXJndi5jb25maWcpO1xuZXhwb3J0IHsgc2V0dXAgfTtcbmV4cG9ydCB7IHJ1biB9O1xuXG4vLyBFc3NlbnRpYWxseSBmb3IgdGVzdGluZyBwdXJwb3Nlc1xuZXhwb3J0IGNvbnN0IF9fdGVzdE1ldGhvZHNfXyA9IHsgcnVuLCBzZXR1cCwgZ2F0aGVyRGF0YSwgYnVpbGRBdWRpdHMsIHJ1bkF1ZGl0LCBydW5SdWxlIH07XG4iXX0=