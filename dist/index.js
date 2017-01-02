#!/usr/bin/env node


'use strict';
/* global describe, it, Promise */

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.run = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _yargs = require('yargs');

var _scraper = require('./scraper.js');

var _scraper2 = _interopRequireDefault(_scraper);

var _config = require('./config.js');

var _utils = require('./utils.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Import modules
var modules = {
    w3: require('./modules/w3.js'),
    wcag: require('./modules/wcag.js'),
    SEO: require('./modules/seo.js'),
    lighthouse: require('./modules/lighthouse.js'),
    stylelint: require('./modules/stylelint.js'),
    eslint: require('./modules/eslint.js')
};

//-------------------------------------
// Functions

/**
 * Takes care of rule result
 *
 * @param {object} rule
 * @param {object} data
 * @param {function} done
 */
var ruleResult = function ruleResult(rule, data, done) {
    if (!data || (typeof data === 'undefined' ? 'undefined' : _typeof(data)) !== 'object' || !data.hasOwnProperty.length) {
        return done();
    }

    // Iterate array...
    describe(rule.name + ': Nested...', function () {
        data.forEach(function (res) {
            it(res.msg, function () {
                if (res.type === 'error') {
                    throw res;
                } else if (res.type === 'warning') {
                    /* eslint-disable no-console */
                    console.warn(rule.name, res);
                    /* eslint-enable no-console */
                }
            });
        });

        done();
    });
};

/**
 * Run single rule
 *
 * @param {object} req
 * @param {object} audit
 */
var runRule = function runRule(req, audit) {
    if (!audit || (typeof audit === 'undefined' ? 'undefined' : _typeof(audit)) !== 'object') {
        throw new Error('You need a valid audit object');
    }

    audit.rules = audit.rules || [];

    // Now lets go through rules
    audit.rules.forEach(function (rule) {
        it(rule.name, function (done) {
            this.timeout(20000);

            rule.fn(req).then(function (data) {
                return ruleResult(rule, data, done);
            }).catch(function (err) {
                return ruleResult(rule, err, done);
            });
        });
    });
};

/**
 * Audit request
 *
 * @param {array} audits
 * @param {object} req
 */
var auditReq = function auditReq(audits, req) {
    if (!audits || (typeof audits === 'undefined' ? 'undefined' : _typeof(audits)) !== 'object') {
        throw new Error('You need a valid audits list');
    }

    if (!req || (typeof req === 'undefined' ? 'undefined' : _typeof(req)) !== 'object') {
        throw new Error('You need a valid req');
    }

    describe('Auditing: ' + req.originalUrl, function () {
        // Go through each audit
        audits.forEach(function (audit) {
            describe('Audit: ' + audit.name, runRule.bind(null, req, audit));
        });
    });
};

/**
 * Build audits array
 *
 * @param {array} audits
 * @returns {array}
 */
var buildAudits = function buildAudits(audits) {
    audits = typeof audits === 'string' ? [audits] : audits;
    return audits.map(function (mod) {
        return modules[mod] || require((0, _utils.getPwd)(mod));
    }).filter(function (val) {
        return !!val;
    });
};

/**
 * Gather data
 *
 * @param {array} data
 * @returns {promise}
 */
var gatherData = function gatherData(data) {
    var promises = [];

    // Go through each request
    data.forEach(function (req) {
        var promise = new Promise(function (resolve, reject) {
            describe('Requesting urls', function () {
                it('Gathering data...', function (done) {
                    this.timeout(10000);

                    // Get the DOM
                    _scraper2.default.run(req).then(function (scrapData) {
                        req.auditsData = buildAudits(req.audits);
                        req.urlsData = scrapData;

                        // Ready
                        resolve(req);
                        done();
                        return req;
                    }).catch(function (err) {
                        reject(err);done(err);
                    });
                });
            });
        });

        // Cache it...
        promises.push(promise);
    });

    return Promise.all(promises);
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
        var promises = [];

        // Go through each element in data
        // Lets run audits per request
        data.forEach(function (req) {
            return req.urlsData.forEach(function (url) {
                return promises.push(auditReq(req.auditsData, url));
            });
        });

        return Promise.all(promises);
    }).catch(function (err) {
        throw err;
    });
};

//-------------------------------------
// Runtime

_yargs.argv && _yargs.argv.config && run(_yargs.argv.config);
exports.run = run;

// Essentially for testing purposes
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJtb2R1bGVzIiwidzMiLCJyZXF1aXJlIiwid2NhZyIsIlNFTyIsImxpZ2h0aG91c2UiLCJzdHlsZWxpbnQiLCJlc2xpbnQiLCJydWxlUmVzdWx0IiwicnVsZSIsImRhdGEiLCJkb25lIiwiaGFzT3duUHJvcGVydHkiLCJsZW5ndGgiLCJkZXNjcmliZSIsIm5hbWUiLCJmb3JFYWNoIiwicmVzIiwiaXQiLCJtc2ciLCJ0eXBlIiwiY29uc29sZSIsIndhcm4iLCJydW5SdWxlIiwicmVxIiwiYXVkaXQiLCJFcnJvciIsInJ1bGVzIiwidGltZW91dCIsImZuIiwidGhlbiIsImNhdGNoIiwiZXJyIiwiYXVkaXRSZXEiLCJhdWRpdHMiLCJvcmlnaW5hbFVybCIsImJpbmQiLCJidWlsZEF1ZGl0cyIsIm1hcCIsIm1vZCIsImZpbHRlciIsInZhbCIsImdhdGhlckRhdGEiLCJwcm9taXNlcyIsInByb21pc2UiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsInJ1biIsInNjcmFwRGF0YSIsImF1ZGl0c0RhdGEiLCJ1cmxzRGF0YSIsInB1c2giLCJhbGwiLCJjb25maWciLCJ1cmwiXSwibWFwcGluZ3MiOiI7O0FBRUE7QUFDQTs7Ozs7Ozs7O0FBRUE7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7OztBQUVBO0FBQ0EsSUFBTUEsVUFBVTtBQUNaQyxRQUFJQyxRQUFRLGlCQUFSLENBRFE7QUFFWkMsVUFBTUQsUUFBUSxtQkFBUixDQUZNO0FBR1pFLFNBQUtGLFFBQVEsa0JBQVIsQ0FITztBQUlaRyxnQkFBWUgsUUFBUSx5QkFBUixDQUpBO0FBS1pJLGVBQVdKLFFBQVEsd0JBQVIsQ0FMQztBQU1aSyxZQUFRTCxRQUFRLHFCQUFSO0FBTkksQ0FBaEI7O0FBU0E7QUFDQTs7QUFFQTs7Ozs7OztBQU9BLElBQU1NLGFBQWEsU0FBYkEsVUFBYSxDQUFDQyxJQUFELEVBQU9DLElBQVAsRUFBYUMsSUFBYixFQUFzQjtBQUNyQyxRQUFJ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LFdBQVcsRUFBakI7O0FBRUE7QUFDQTtBQUNBakMsYUFBS00sT0FBTCxDQUFhLFVBQUNRLEdBQUQ7QUFBQSxtQkFBU0EsSUFBSTJCLFFBQUosQ0FBYW5DLE9BQWIsQ0FBcUIsVUFBQ3VDLEdBQUQ7QUFBQSx1QkFBU1osU0FBU1MsSUFBVCxDQUFjbkIsU0FBU1QsSUFBSTBCLFVBQWIsRUFBeUJLLEdBQXpCLENBQWQsQ0FBVDtBQUFBLGFBQXJCLENBQVQ7QUFBQSxTQUFiOztBQUVBLGVBQU9WLFFBQVFRLEdBQVIsQ0FBWVYsUUFBWixDQUFQO0FBQ0gsS0FUTSxFQVVOWixLQVZNLENBVUEsVUFBQ0MsR0FBRCxFQUFTO0FBQUUsY0FBTUEsR0FBTjtBQUFZLEtBVnZCLENBQVA7QUFXSCxDQWZEOztBQWlCQTtBQUNBOztBQUVBLGVBQVEsWUFBS3NCLE1BQWIsSUFBdUJOLElBQUksWUFBS00sTUFBVCxDQUF2QjtRQUNTTixHLEdBQUFBLEc7O0FBRVQiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJcblxuJ3VzZSBzdHJpY3QnO1xuLyogZ2xvYmFsIGRlc2NyaWJlLCBpdCwgUHJvbWlzZSAqL1xuXG5pbXBvcnQgeyBhcmd2IH0gZnJvbSAneWFyZ3MnO1xuaW1wb3J0IHNjcmFwZXIgZnJvbSAnLi9zY3JhcGVyLmpzJztcbmltcG9ydCB7IGdldCBhcyBjb25maWdHZXQgfSBmcm9tICcuL2NvbmZpZy5qcyc7XG5pbXBvcnQgeyBnZXRQd2QgfSBmcm9tICcuL3V0aWxzLmpzJztcblxuLy8gSW1wb3J0IG1vZHVsZXNcbmNvbnN0IG1vZHVsZXMgPSB7XG4gICAgdzM6IHJlcXVpcmUoJy4vbW9kdWxlcy93My5qcycpLFxuICAgIHdjYWc6IHJlcXVpcmUoJy4vbW9kdWxlcy93Y2FnLmpzJyksXG4gICAgU0VPOiByZXF1aXJlKCcuL21vZHVsZXMvc2VvLmpzJyksXG4gICAgbGlnaHRob3VzZTogcmVxdWlyZSgnLi9tb2R1bGVzL2xpZ2h0aG91c2UuanMnKSxcbiAgICBzdHlsZWxpbnQ6IHJlcXVpcmUoJy4vbW9kdWxlcy9zdHlsZWxpbnQuanMnKSxcbiAgICBlc2xpbnQ6IHJlcXVpcmUoJy4vbW9kdWxlcy9lc2xpbnQuanMnKVxufTtcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBGdW5jdGlvbnNcblxuLyoqXG4gKiBUYWtlcyBjYXJlIG9mIHJ1bGUgcmVzdWx0XG4gKlxuICogQHBhcmFtIHtvYmplY3R9IHJ1bGVcbiAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBkb25lXG4gKi9cbmNvbnN0IHJ1bGVSZXN1bHQgPSAocnVsZSwgZGF0YSwgZG9uZSkgPT4ge1xuICAgIGlmICghZGF0YSB8fCB0eXBlb2YgZGF0YSAhPT0gJ29iamVjdCcgfHwgIWRhdGEuaGFzT3duUHJvcGVydHkubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBkb25lKCk7XG4gICAgfVxuXG4gICAgLy8gSXRlcmF0ZSBhcnJheS4uLlxuICAgIGRlc2NyaWJlKGAke3J1bGUubmFtZX06IE5lc3RlZC4uLmAsICgpID0+IHtcbiAgICAgICAgZGF0YS5mb3JFYWNoKChyZXMpID0+IHtcbiAgICAgICAgICAgIGl0KHJlcy5tc2csICgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAocmVzLnR5cGUgPT09ICdlcnJvcicpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgcmVzO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocmVzLnR5cGUgPT09ICd3YXJuaW5nJykge1xuICAgICAgICAgICAgICAgICAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby1jb25zb2xlICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihydWxlLm5hbWUsIHJlcyk7XG4gICAgICAgICAgICAgICAgICAgIC8qIGVzbGludC1lbmFibGUgbm8tY29uc29sZSAqL1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBkb25lKCk7XG4gICAgfSk7XG59O1xuXG4vKipcbiAqIFJ1biBzaW5nbGUgcnVsZVxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSByZXFcbiAqIEBwYXJhbSB7b2JqZWN0fSBhdWRpdFxuICovXG5jb25zdCBydW5SdWxlID0gKHJlcSwgYXVkaXQpID0+IHtcbiAgICBpZiAoIWF1ZGl0IHx8IHR5cGVvZiBhdWRpdCAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdZb3UgbmVlZCBhIHZhbGlkIGF1ZGl0IG9iamVjdCcpO1xuICAgIH1cblxuICAgIGF1ZGl0LnJ1bGVzID0gYXVkaXQucnVsZXMgfHwgW107XG5cbiAgICAvLyBOb3cgbGV0cyBnbyB0aHJvdWdoIHJ1bGVzXG4gICAgYXVkaXQucnVsZXMuZm9yRWFjaCgocnVsZSkgPT4ge1xuICAgICAgICBpdChydWxlLm5hbWUsIGZ1bmN0aW9uIChkb25lKSB7XG4gICAgICAgICAgICB0aGlzLnRpbWVvdXQoMjAwMDApO1xuXG4gICAgICAgICAgICBydWxlLmZuKHJlcSlcbiAgICAgICAgICAgIC50aGVuKGRhdGEgPT4gcnVsZVJlc3VsdChydWxlLCBkYXRhLCBkb25lKSlcbiAgICAgICAgICAgIC5jYXRjaChlcnIgPT4gcnVsZVJlc3VsdChydWxlLCBlcnIsIGRvbmUpKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59O1xuXG4vKipcbiAqIEF1ZGl0IHJlcXVlc3RcbiAqXG4gKiBAcGFyYW0ge2FycmF5fSBhdWRpdHNcbiAqIEBwYXJhbSB7b2JqZWN0fSByZXFcbiAqL1xuY29uc3QgYXVkaXRSZXEgPSAoYXVkaXRzLCByZXEpID0+IHtcbiAgICBpZiAoIWF1ZGl0cyB8fCB0eXBlb2YgYXVkaXRzICE9PSAnb2JqZWN0Jykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1lvdSBuZWVkIGEgdmFsaWQgYXVkaXRzIGxpc3QnKTtcbiAgICB9XG5cbiAgICBpZiAoIXJlcSB8fCB0eXBlb2YgcmVxICE9PSAnb2JqZWN0Jykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1lvdSBuZWVkIGEgdmFsaWQgcmVxJyk7XG4gICAgfVxuXG4gICAgZGVzY3JpYmUoYEF1ZGl0aW5nOiAke3JlcS5vcmlnaW5hbFVybH1gLCAoKSA9PiB7XG4gICAgICAgIC8vIEdvIHRocm91Z2ggZWFjaCBhdWRpdFxuICAgICAgICBhdWRpdHMuZm9yRWFjaCgoYXVkaXQpID0+IHtcbiAgICAgICAgICAgIGRlc2NyaWJlKGBBdWRpdDogJHthdWRpdC5uYW1lfWAsIHJ1blJ1bGUuYmluZChudWxsLCByZXEsIGF1ZGl0KSk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufTtcblxuLyoqXG4gKiBCdWlsZCBhdWRpdHMgYXJyYXlcbiAqXG4gKiBAcGFyYW0ge2FycmF5fSBhdWRpdHNcbiAqIEByZXR1cm5zIHthcnJheX1cbiAqL1xuY29uc3QgYnVpbGRBdWRpdHMgPSAoYXVkaXRzKSA9PiB7XG4gICAgYXVkaXRzID0gKHR5cGVvZiBhdWRpdHMgPT09ICdzdHJpbmcnKSA/IFthdWRpdHNdIDogYXVkaXRzO1xuICAgIHJldHVybiBhdWRpdHMubWFwKG1vZCA9PiBtb2R1bGVzW21vZF0gfHwgcmVxdWlyZShnZXRQd2QobW9kKSkpXG4gICAgLmZpbHRlcih2YWwgPT4gISF2YWwpO1xufTtcblxuLyoqXG4gKiBHYXRoZXIgZGF0YVxuICpcbiAqIEBwYXJhbSB7YXJyYXl9IGRhdGFcbiAqIEByZXR1cm5zIHtwcm9taXNlfVxuICovXG5jb25zdCBnYXRoZXJEYXRhID0gKGRhdGEpID0+IHtcbiAgICBjb25zdCBwcm9taXNlcyA9IFtdO1xuXG4gICAgLy8gR28gdGhyb3VnaCBlYWNoIHJlcXVlc3RcbiAgICBkYXRhLmZvckVhY2goKHJlcSkgPT4ge1xuICAgICAgICBjb25zdCBwcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgZGVzY3JpYmUoJ1JlcXVlc3RpbmcgdXJscycsICgpID0+IHtcbiAgICAgICAgICAgICAgICBpdCgnR2F0aGVyaW5nIGRhdGEuLi4nLCBmdW5jdGlvbiAoZG9uZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRpbWVvdXQoMTAwMDApO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIEdldCB0aGUgRE9NXG4gICAgICAgICAgICAgICAgICAgIHNjcmFwZXIucnVuKHJlcSkudGhlbigoc2NyYXBEYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXEuYXVkaXRzRGF0YSA9IGJ1aWxkQXVkaXRzKHJlcS5hdWRpdHMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVxLnVybHNEYXRhID0gc2NyYXBEYXRhO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBSZWFkeVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShyZXEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZG9uZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlcTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgLmNhdGNoKChlcnIpID0+IHsgcmVqZWN0KGVycik7IGRvbmUoZXJyKTsgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gQ2FjaGUgaXQuLi5cbiAgICAgICAgcHJvbWlzZXMucHVzaChwcm9taXNlKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBQcm9taXNlLmFsbChwcm9taXNlcyk7XG59O1xuXG4vKipcbiAqIEluaXRpYWxpemUgYXVkaXRzXG4gKlxuICogQHBhcmFtIHtvYmplY3R8c3RyaW5nfSBjb25maWdcbiAqIEByZXR1cm5zIHtwcm9taXNlfVxuICovXG5jb25zdCBydW4gPSAoY29uZmlnKSA9PiB7XG4gICAgY29uZmlnID0gY29uZmlnR2V0KGNvbmZpZyk7XG5cbiAgICAvLyBMZXRzIGdhdGhlciBkYXRhIGZyb20gdGhlIHVybHNcbiAgICByZXR1cm4gZ2F0aGVyRGF0YShjb25maWcuZGF0YSlcbiAgICAudGhlbigoZGF0YSkgPT4ge1xuICAgICAgICBjb25zdCBwcm9taXNlcyA9IFtdO1xuXG4gICAgICAgIC8vIEdvIHRocm91Z2ggZWFjaCBlbGVtZW50IGluIGRhdGFcbiAgICAgICAgLy8gTGV0cyBydW4gYXVkaXRzIHBlciByZXF1ZXN0XG4gICAgICAgIGRhdGEuZm9yRWFjaCgocmVxKSA9PiByZXEudXJsc0RhdGEuZm9yRWFjaCgodXJsKSA9PiBwcm9taXNlcy5wdXNoKGF1ZGl0UmVxKHJlcS5hdWRpdHNEYXRhLCB1cmwpKSkpO1xuXG4gICAgICAgIHJldHVybiBQcm9taXNlLmFsbChwcm9taXNlcyk7XG4gICAgfSlcbiAgICAuY2F0Y2goKGVycikgPT4geyB0aHJvdyBlcnI7IH0pO1xufTtcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBSdW50aW1lXG5cbmFyZ3YgJiYgYXJndi5jb25maWcgJiYgcnVuKGFyZ3YuY29uZmlnKTtcbmV4cG9ydCB7IHJ1biB9O1xuXG4vLyBFc3NlbnRpYWxseSBmb3IgdGVzdGluZyBwdXJwb3Nlc1xuZXhwb3J0IGNvbnN0IF9fdGVzdE1ldGhvZHNfXyA9IHsgcnVuLCBnYXRoZXJEYXRhLCBidWlsZEF1ZGl0cywgYXVkaXRSZXEsIHJ1blJ1bGUsIHJ1bGVSZXN1bHQgfTtcbmV4cG9ydCBjb25zdCBfX3Rlc3RTdHVic19fID0gKHN0dWJzKSA9PiB7XG4gICAgLyogZXNsaW50LWRpc2FibGUgbm8tbmF0aXZlLXJlYXNzaWduICovXG4gICAgZGVzY3JpYmUgPSBzdHVicy5kZXNjcmliZSB8fCBkZXNjcmliZTtcbiAgICBpdCA9IHN0dWJzLml0IHx8IGl0O1xuICAgIC8qIGVzbGludC1lbmFibGUgbm8tbmF0aXZlLXJlYXNzaWduICovXG59O1xuIl19