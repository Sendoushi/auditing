'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.get = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _joi = require('joi');

var _joi2 = _interopRequireDefault(_joi);

var _utils = require('./utils.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var STRUCT = _joi2.default.object().keys({
    projectId: _joi2.default.string().default('projectname'),
    projectName: _joi2.default.string().default('Project Name'),
    data: _joi2.default.array().items(_joi2.default.object().keys({
        src: _joi2.default.array().items(_joi2.default.string()).required(),
        type: _joi2.default.alternatives().try(_joi2.default.string().valid(['url', 'content', 'file']).required(), _joi2.default.object().keys({
            of: _joi2.default.string().valid(['url', 'content', 'file']).required(),
            base: _joi2.default.string(),
            baseEnv: _joi2.default.string()
        })),
        audits: _joi2.default.array().items(_joi2.default.alternatives().try(_joi2.default.string(), _joi2.default.object().keys({
            src: _joi2.default.string().required(),
            ignore: _joi2.default.array().items(_joi2.default.string())
        })))
    })).default([])
}).required();

//-------------------------------------
// Functions

/**
 * Verify if config is right
 * @param  {object} config
 * @return {boolean}
 */
var verify = function verify(config) {
    var result = _joi2.default.validate(config, STRUCT);
    var value = result.value;

    return result.error ? {
        error: { type: 'root', err: result.error }
    } : { value: value };
};

/**
 * Gets config
 *
 * @param {object|string} config
 * @returns {object}
 */
var get = function get(config) {
    if (typeof config === 'string') {
        config = (0, _utils.readFile)((0, _utils.getPwd)(config));
        config = JSON.parse(config);
    }

    config = verify(config);

    // Verify config
    if (!config || config.error) {
        if (config && config.error && _typeof(config.error) === 'object' && config.error.err) {
            throw new Error(config.error.err);
        }

        throw new Error(config && config.error || 'Couldn\'t validate');
    }

    return config.value;
};

//-------------------------------------
// Runtime

exports.get = get;

// Essentially for testing purposes
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jb25maWcuanMiXSwibmFtZXMiOlsiU1RSVUNUIiwib2JqZWN0Iiwia2V5cyIsInByb2plY3RJZCIsInN0cmluZyIsImRlZmF1bHQiLCJwcm9qZWN0TmFtZSIsImRhdGEiLCJhcnJheSIsIml0ZW1zIiwic3JjIiwicmVxdWlyZWQiLCJ0eXBlIiwiYWx0ZXJuYXRpdmVzIiwidHJ5IiwidmFsaWQiLCJvZiIsImJhc2UiLCJiYXNlRW52IiwiYXVkaXRzIiwiaWdub3JlIiwidmVyaWZ5IiwiY29uZmlnIiwicmVzdWx0IiwidmFsaWRhdGUiLCJ2YWx1ZSIsImVycm9yIiwiZXJyIiwiZ2V0IiwiSlNPTiIsInBhcnNlIiwiRXJyb3IiXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7QUFFQTs7OztBQUNBOzs7O0FBRUEsSUFBTUEsU0FBUyxjQUFJQyxNQUFKLEdBQWFDLElBQWIsQ0FBa0I7QUFDN0JDLGVBQVcsY0FBSUMsTUFBSixHQUFhQyxPQUFiLENBQXFCLGFBQXJCLENBRGtCO0FBRTdCQyxpQkFBYSxjQUFJRixNQUFKLEdBQWFDLE9BQWIsQ0FBcUIsY0FBckIsQ0FGZ0I7QUFHN0JFLFVBQU0sY0FBSUMsS0FBSixHQUFZQyxLQUFaLENBQWtCLGNBQUlSLE1BQUosR0FBYUMsSUFBYixDQUFrQjtBQUN0Q1EsYUFBSyxjQUFJRixLQUFKLEdBQVlDLEtBQVosQ0FBa0IsY0FBSUwsTUFBSixFQUFsQixFQUFnQ08sUUFBaEMsRUFEaUM7QUFFdENDLGNBQU0sY0FBSUMsWUFBSixHQUFtQkMsR0FBbkIsQ0FDRixjQUFJVixNQUFKLEdBQWFXLEtBQWIsQ0FBbUIsQ0FBQyxLQUFELEVBQVEsU0FBUixFQUFtQixNQUFuQixDQUFuQixFQUErQ0osUUFBL0MsRUFERSxFQUVGLGNBQUlWLE1BQUosR0FBYUMsSUFBYixDQUFrQjtBQUNkYyxnQkFBSSxjQUFJWixNQUFKLEdBQWFXLEtBQWIsQ0FBbUIsQ0FBQyxLQUFELEVBQVEsU0FBUixFQUFtQixNQUFuQixDQUFuQixFQUErQ0osUUFBL0MsRUFEVTtBQUVkTSxrQkFBTSxjQUFJYixNQUFKLEVBRlE7QUFHZGMscUJBQVMsY0FBSWQsTUFBSjtBQUhLLFNBQWxCLENBRkUsQ0FGZ0M7QUFVdENlLGdCQUFRLGNBQUlYLEtBQUosR0FBWUMsS0FBWixDQUFrQixjQUFJSSxZQUFKLEdBQW1CQyxHQUFuQixDQUN0QixjQUFJVixNQUFKLEVBRHNCLEVBRXRCLGNBQUlILE1BQUosR0FBYUMsSUFBYixDQUFrQjtBQUNkUSxpQkFBSyxjQUFJTixNQUFKLEdBQWFPLFFBQWIsRUFEUztBQUVkUyxvQkFBUSxjQUFJWixLQUFKLEdBQVlDLEtBQVosQ0FBa0IsY0FBSUwsTUFBSixFQUFsQjtBQUZNLFNBQWxCLENBRnNCLENBQWxCO0FBVjhCLEtBQWxCLENBQWxCLEVBaUJGQyxPQWpCRSxDQWlCTSxFQWpCTjtBQUh1QixDQUFsQixFQXFCWk0sUUFyQlksRUFBZjs7QUF1QkE7QUFDQTs7QUFFQTs7Ozs7QUFLQSxJQUFNVSxTQUFTLFNBQVRBLE1BQVMsQ0FBQ0MsTUFBRCxFQUFZO0FBQ3ZCLFFBQU1DLFNBQVMsY0FBSUMsUUFBSixDQUFhRixNQUFiLEVBQXFCdEIsTUFBckIsQ0FBZjtBQUNBLFFBQU15QixRQUFRRixPQUFPRSxLQUFyQjs7QUFFQSxXQUFPRixPQUFPRyxLQUFQLEdBQWU7QUFDbEJBLGVBQU8sRUFBRWQsTUFBTSxNQUFSLEVBQWdCZSxLQUFLSixPQUFPRyxLQUE1QjtBQURXLEtBQWYsR0FFSCxFQUFFRCxZQUFGLEVBRko7QUFHSCxDQVBEOztBQVNBOzs7Ozs7QUFNQSxJQUFNRyxNQUFNLFNBQU5BLEdBQU0sQ0FBQ04sTUFBRCxFQUFZO0FBQ3BCLFFBQUksT0FBT0EsTUFBUCxLQUFrQixRQUF0QixFQUFnQztBQUM1QkEsaUJBQVMscUJBQVMsbUJBQU9BLE1BQVAsQ0FBVCxDQUFUO0FBQ0FBLGlCQUFTTyxLQUFLQyxLQUFMLENBQVdSLE1BQVgsQ0FBVDtBQUNIOztBQUVEQSxhQUFTRCxPQUFPQyxNQUFQLENBQVQ7O0FBRUE7QUFDQSxRQUFJLENBQUNBLE1BQUQsSUFBV0EsT0FBT0ksS0FBdEIsRUFBNkI7QUFDekIsWUFBSUosVUFBVUEsT0FBT0ksS0FBakIsSUFBMEIsUUFBT0osT0FBT0ksS0FBZCxNQUF3QixRQUFsRCxJQUE4REosT0FBT0ksS0FBUCxDQUFhQyxHQUEvRSxFQUFvRjtBQUNoRixrQkFBTSxJQUFJSSxLQUFKLENBQVVULE9BQU9JLEtBQVAsQ0FBYUMsR0FBdkIsQ0FBTjtBQUNIOztBQUVELGNBQU0sSUFBSUksS0FBSixDQUFVVCxVQUFVQSxPQUFPSSxLQUFqQixJQUEwQixvQkFBcEMsQ0FBTjtBQUNIOztBQUVELFdBQU9KLE9BQU9HLEtBQWQ7QUFDSCxDQWxCRDs7QUFvQkE7QUFDQTs7UUFFU0csRyxHQUFBQSxHOztBQUVUIiwiZmlsZSI6ImNvbmZpZy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IEpvaSBmcm9tICdqb2knO1xuaW1wb3J0IHsgcmVhZEZpbGUsIGdldFB3ZCB9IGZyb20gJy4vdXRpbHMuanMnO1xuXG5jb25zdCBTVFJVQ1QgPSBKb2kub2JqZWN0KCkua2V5cyh7XG4gICAgcHJvamVjdElkOiBKb2kuc3RyaW5nKCkuZGVmYXVsdCgncHJvamVjdG5hbWUnKSxcbiAgICBwcm9qZWN0TmFtZTogSm9pLnN0cmluZygpLmRlZmF1bHQoJ1Byb2plY3QgTmFtZScpLFxuICAgIGRhdGE6IEpvaS5hcnJheSgpLml0ZW1zKEpvaS5vYmplY3QoKS5rZXlzKHtcbiAgICAgICAgc3JjOiBKb2kuYXJyYXkoKS5pdGVtcyhKb2kuc3RyaW5nKCkpLnJlcXVpcmVkKCksXG4gICAgICAgIHR5cGU6IEpvaS5hbHRlcm5hdGl2ZXMoKS50cnkoXG4gICAgICAgICAgICBKb2kuc3RyaW5nKCkudmFsaWQoWyd1cmwnLCAnY29udGVudCcsICdmaWxlJ10pLnJlcXVpcmVkKCksXG4gICAgICAgICAgICBKb2kub2JqZWN0KCkua2V5cyh7XG4gICAgICAgICAgICAgICAgb2Y6IEpvaS5zdHJpbmcoKS52YWxpZChbJ3VybCcsICdjb250ZW50JywgJ2ZpbGUnXSkucmVxdWlyZWQoKSxcbiAgICAgICAgICAgICAgICBiYXNlOiBKb2kuc3RyaW5nKCksXG4gICAgICAgICAgICAgICAgYmFzZUVudjogSm9pLnN0cmluZygpXG4gICAgICAgICAgICB9KVxuICAgICAgICApLFxuICAgICAgICBhdWRpdHM6IEpvaS5hcnJheSgpLml0ZW1zKEpvaS5hbHRlcm5hdGl2ZXMoKS50cnkoXG4gICAgICAgICAgICBKb2kuc3RyaW5nKCksXG4gICAgICAgICAgICBKb2kub2JqZWN0KCkua2V5cyh7XG4gICAgICAgICAgICAgICAgc3JjOiBKb2kuc3RyaW5nKCkucmVxdWlyZWQoKSxcbiAgICAgICAgICAgICAgICBpZ25vcmU6IEpvaS5hcnJheSgpLml0ZW1zKEpvaS5zdHJpbmcoKSlcbiAgICAgICAgICAgIH0pXG4gICAgICAgICkpXG4gICAgfSkpLmRlZmF1bHQoW10pXG59KS5yZXF1aXJlZCgpO1xuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEZ1bmN0aW9uc1xuXG4vKipcbiAqIFZlcmlmeSBpZiBjb25maWcgaXMgcmlnaHRcbiAqIEBwYXJhbSAge29iamVjdH0gY29uZmlnXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5jb25zdCB2ZXJpZnkgPSAoY29uZmlnKSA9PiB7XG4gICAgY29uc3QgcmVzdWx0ID0gSm9pLnZhbGlkYXRlKGNvbmZpZywgU1RSVUNUKTtcbiAgICBjb25zdCB2YWx1ZSA9IHJlc3VsdC52YWx1ZTtcblxuICAgIHJldHVybiByZXN1bHQuZXJyb3IgPyB7XG4gICAgICAgIGVycm9yOiB7IHR5cGU6ICdyb290JywgZXJyOiByZXN1bHQuZXJyb3IgfVxuICAgIH0gOiB7IHZhbHVlIH07XG59O1xuXG4vKipcbiAqIEdldHMgY29uZmlnXG4gKlxuICogQHBhcmFtIHtvYmplY3R8c3RyaW5nfSBjb25maWdcbiAqIEByZXR1cm5zIHtvYmplY3R9XG4gKi9cbmNvbnN0IGdldCA9IChjb25maWcpID0+IHtcbiAgICBpZiAodHlwZW9mIGNvbmZpZyA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgY29uZmlnID0gcmVhZEZpbGUoZ2V0UHdkKGNvbmZpZykpO1xuICAgICAgICBjb25maWcgPSBKU09OLnBhcnNlKGNvbmZpZyk7XG4gICAgfVxuXG4gICAgY29uZmlnID0gdmVyaWZ5KGNvbmZpZyk7XG5cbiAgICAvLyBWZXJpZnkgY29uZmlnXG4gICAgaWYgKCFjb25maWcgfHwgY29uZmlnLmVycm9yKSB7XG4gICAgICAgIGlmIChjb25maWcgJiYgY29uZmlnLmVycm9yICYmIHR5cGVvZiBjb25maWcuZXJyb3IgPT09ICdvYmplY3QnICYmIGNvbmZpZy5lcnJvci5lcnIpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihjb25maWcuZXJyb3IuZXJyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihjb25maWcgJiYgY29uZmlnLmVycm9yIHx8ICdDb3VsZG5cXCd0IHZhbGlkYXRlJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbmZpZy52YWx1ZTtcbn07XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUnVudGltZVxuXG5leHBvcnQgeyBnZXQgfTtcblxuLy8gRXNzZW50aWFsbHkgZm9yIHRlc3RpbmcgcHVycG9zZXNcbmV4cG9ydCBjb25zdCBfX3Rlc3RNZXRob2RzX18gPSB7IGdldCB9O1xuIl19