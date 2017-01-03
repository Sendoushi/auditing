'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.get = undefined;

var _joi = require('joi');

var _joi2 = _interopRequireDefault(_joi);

var _utils = require('./utils.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var STRUCT = _joi2.default.object().keys({
    projectId: _joi2.default.string().default('projectname'),
    projectName: _joi2.default.string().default('Project Name'),
    data: _joi2.default.array().items(_joi2.default.object().keys({
        src: _joi2.default.array().items(_joi2.default.string()).required(),
        type: _joi2.default.string().valid(['url', 'content', 'file']).required(),
        audits: _joi2.default.array().items(_joi2.default.alternatives().try(_joi2.default.string(), _joi2.default.object().keys({
            src: _joi2.default.string().required(),
            ignore: _joi2.default.array().items(_joi2.default.string())
        }))),
        base: _joi2.default.string(),
        baseEnv: _joi2.default.string()
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
        throw new Error(config.error);
    }

    return config.value;
};

//-------------------------------------
// Runtime

exports.get = get;

// Essentially for testing purposes
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jb25maWcuanMiXSwibmFtZXMiOlsiU1RSVUNUIiwib2JqZWN0Iiwia2V5cyIsInByb2plY3RJZCIsInN0cmluZyIsImRlZmF1bHQiLCJwcm9qZWN0TmFtZSIsImRhdGEiLCJhcnJheSIsIml0ZW1zIiwic3JjIiwicmVxdWlyZWQiLCJ0eXBlIiwidmFsaWQiLCJhdWRpdHMiLCJhbHRlcm5hdGl2ZXMiLCJ0cnkiLCJpZ25vcmUiLCJiYXNlIiwiYmFzZUVudiIsInZlcmlmeSIsImNvbmZpZyIsInJlc3VsdCIsInZhbGlkYXRlIiwidmFsdWUiLCJlcnJvciIsImVyciIsImdldCIsIkpTT04iLCJwYXJzZSIsIkVycm9yIl0sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7OztBQUVBOzs7O0FBQ0E7Ozs7QUFFQSxJQUFNQSxTQUFTLGNBQUlDLE1BQUosR0FBYUMsSUFBYixDQUFrQjtBQUM3QkMsZUFBVyxjQUFJQyxNQUFKLEdBQWFDLE9BQWIsQ0FBcUIsYUFBckIsQ0FEa0I7QUFFN0JDLGlCQUFhLGNBQUlGLE1BQUosR0FBYUMsT0FBYixDQUFxQixjQUFyQixDQUZnQjtBQUc3QkUsVUFBTSxjQUFJQyxLQUFKLEdBQVlDLEtBQVosQ0FBa0IsY0FBSVIsTUFBSixHQUFhQyxJQUFiLENBQWtCO0FBQ3RDUSxhQUFLLGNBQUlGLEtBQUosR0FBWUMsS0FBWixDQUFrQixjQUFJTCxNQUFKLEVBQWxCLEVBQWdDTyxRQUFoQyxFQURpQztBQUV0Q0MsY0FBTSxjQUFJUixNQUFKLEdBQWFTLEtBQWIsQ0FBbUIsQ0FBQyxLQUFELEVBQVEsU0FBUixFQUFtQixNQUFuQixDQUFuQixFQUErQ0YsUUFBL0MsRUFGZ0M7QUFHdENHLGdCQUFRLGNBQUlOLEtBQUosR0FBWUMsS0FBWixDQUFrQixjQUFJTSxZQUFKLEdBQW1CQyxHQUFuQixDQUN0QixjQUFJWixNQUFKLEVBRHNCLEVBRXRCLGNBQUlILE1BQUosR0FBYUMsSUFBYixDQUFrQjtBQUNkUSxpQkFBSyxjQUFJTixNQUFKLEdBQWFPLFFBQWIsRUFEUztBQUVkTSxvQkFBUSxjQUFJVCxLQUFKLEdBQVlDLEtBQVosQ0FBa0IsY0FBSUwsTUFBSixFQUFsQjtBQUZNLFNBQWxCLENBRnNCLENBQWxCLENBSDhCO0FBVXRDYyxjQUFNLGNBQUlkLE1BQUosRUFWZ0M7QUFXdENlLGlCQUFTLGNBQUlmLE1BQUo7QUFYNkIsS0FBbEIsQ0FBbEIsRUFZRkMsT0FaRSxDQVlNLEVBWk47QUFIdUIsQ0FBbEIsRUFnQlpNLFFBaEJZLEVBQWY7O0FBa0JBO0FBQ0E7O0FBRUE7Ozs7O0FBS0EsSUFBTVMsU0FBUyxTQUFUQSxNQUFTLENBQUNDLE1BQUQsRUFBWTtBQUN2QixRQUFNQyxTQUFTLGNBQUlDLFFBQUosQ0FBYUYsTUFBYixFQUFxQnJCLE1BQXJCLENBQWY7QUFDQSxRQUFNd0IsUUFBUUYsT0FBT0UsS0FBckI7O0FBRUEsV0FBT0YsT0FBT0csS0FBUCxHQUFlO0FBQ2xCQSxlQUFPLEVBQUViLE1BQU0sTUFBUixFQUFnQmMsS0FBS0osT0FBT0csS0FBNUI7QUFEVyxLQUFmLEdBRUgsRUFBRUQsWUFBRixFQUZKO0FBR0gsQ0FQRDs7QUFTQTs7Ozs7O0FBTUEsSUFBTUcsTUFBTSxTQUFOQSxHQUFNLENBQUNOLE1BQUQsRUFBWTtBQUNwQixRQUFJLE9BQU9BLE1BQVAsS0FBa0IsUUFBdEIsRUFBZ0M7QUFDNUJBLGlCQUFTLHFCQUFTLG1CQUFPQSxNQUFQLENBQVQsQ0FBVDtBQUNBQSxpQkFBU08sS0FBS0MsS0FBTCxDQUFXUixNQUFYLENBQVQ7QUFDSDs7QUFFREEsYUFBU0QsT0FBT0MsTUFBUCxDQUFUOztBQUVBO0FBQ0EsUUFBSSxDQUFDQSxNQUFELElBQVdBLE9BQU9JLEtBQXRCLEVBQTZCO0FBQ3pCLGNBQU0sSUFBSUssS0FBSixDQUFVVCxPQUFPSSxLQUFqQixDQUFOO0FBQ0g7O0FBRUQsV0FBT0osT0FBT0csS0FBZDtBQUNILENBZEQ7O0FBZ0JBO0FBQ0E7O1FBRVNHLEcsR0FBQUEsRzs7QUFFVCIsImZpbGUiOiJjb25maWcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBKb2kgZnJvbSAnam9pJztcbmltcG9ydCB7IHJlYWRGaWxlLCBnZXRQd2QgfSBmcm9tICcuL3V0aWxzLmpzJztcblxuY29uc3QgU1RSVUNUID0gSm9pLm9iamVjdCgpLmtleXMoe1xuICAgIHByb2plY3RJZDogSm9pLnN0cmluZygpLmRlZmF1bHQoJ3Byb2plY3RuYW1lJyksXG4gICAgcHJvamVjdE5hbWU6IEpvaS5zdHJpbmcoKS5kZWZhdWx0KCdQcm9qZWN0IE5hbWUnKSxcbiAgICBkYXRhOiBKb2kuYXJyYXkoKS5pdGVtcyhKb2kub2JqZWN0KCkua2V5cyh7XG4gICAgICAgIHNyYzogSm9pLmFycmF5KCkuaXRlbXMoSm9pLnN0cmluZygpKS5yZXF1aXJlZCgpLFxuICAgICAgICB0eXBlOiBKb2kuc3RyaW5nKCkudmFsaWQoWyd1cmwnLCAnY29udGVudCcsICdmaWxlJ10pLnJlcXVpcmVkKCksXG4gICAgICAgIGF1ZGl0czogSm9pLmFycmF5KCkuaXRlbXMoSm9pLmFsdGVybmF0aXZlcygpLnRyeShcbiAgICAgICAgICAgIEpvaS5zdHJpbmcoKSxcbiAgICAgICAgICAgIEpvaS5vYmplY3QoKS5rZXlzKHtcbiAgICAgICAgICAgICAgICBzcmM6IEpvaS5zdHJpbmcoKS5yZXF1aXJlZCgpLFxuICAgICAgICAgICAgICAgIGlnbm9yZTogSm9pLmFycmF5KCkuaXRlbXMoSm9pLnN0cmluZygpKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgKSksXG4gICAgICAgIGJhc2U6IEpvaS5zdHJpbmcoKSxcbiAgICAgICAgYmFzZUVudjogSm9pLnN0cmluZygpXG4gICAgfSkpLmRlZmF1bHQoW10pXG59KS5yZXF1aXJlZCgpO1xuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEZ1bmN0aW9uc1xuXG4vKipcbiAqIFZlcmlmeSBpZiBjb25maWcgaXMgcmlnaHRcbiAqIEBwYXJhbSAge29iamVjdH0gY29uZmlnXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5jb25zdCB2ZXJpZnkgPSAoY29uZmlnKSA9PiB7XG4gICAgY29uc3QgcmVzdWx0ID0gSm9pLnZhbGlkYXRlKGNvbmZpZywgU1RSVUNUKTtcbiAgICBjb25zdCB2YWx1ZSA9IHJlc3VsdC52YWx1ZTtcblxuICAgIHJldHVybiByZXN1bHQuZXJyb3IgPyB7XG4gICAgICAgIGVycm9yOiB7IHR5cGU6ICdyb290JywgZXJyOiByZXN1bHQuZXJyb3IgfVxuICAgIH0gOiB7IHZhbHVlIH07XG59O1xuXG4vKipcbiAqIEdldHMgY29uZmlnXG4gKlxuICogQHBhcmFtIHtvYmplY3R8c3RyaW5nfSBjb25maWdcbiAqIEByZXR1cm5zIHtvYmplY3R9XG4gKi9cbmNvbnN0IGdldCA9IChjb25maWcpID0+IHtcbiAgICBpZiAodHlwZW9mIGNvbmZpZyA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgY29uZmlnID0gcmVhZEZpbGUoZ2V0UHdkKGNvbmZpZykpO1xuICAgICAgICBjb25maWcgPSBKU09OLnBhcnNlKGNvbmZpZyk7XG4gICAgfVxuXG4gICAgY29uZmlnID0gdmVyaWZ5KGNvbmZpZyk7XG5cbiAgICAvLyBWZXJpZnkgY29uZmlnXG4gICAgaWYgKCFjb25maWcgfHwgY29uZmlnLmVycm9yKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihjb25maWcuZXJyb3IpO1xuICAgIH1cblxuICAgIHJldHVybiBjb25maWcudmFsdWU7XG59O1xuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFJ1bnRpbWVcblxuZXhwb3J0IHsgZ2V0IH07XG5cbi8vIEVzc2VudGlhbGx5IGZvciB0ZXN0aW5nIHB1cnBvc2VzXG5leHBvcnQgY29uc3QgX190ZXN0TWV0aG9kc19fID0geyBnZXQgfTtcbiJdfQ==