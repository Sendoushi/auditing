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
        enableJs: _joi2.default.boolean().default(false),
        waitFor: _joi2.default.string(),
        audits: _joi2.default.array().items(_joi2.default.alternatives().try(_joi2.default.string(), _joi2.default.object().keys({
            src: _joi2.default.string().required(),
            ignore: _joi2.default.array().items(_joi2.default.string())
        })))
    })).required()
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jb25maWcuanMiXSwibmFtZXMiOlsiU1RSVUNUIiwib2JqZWN0Iiwia2V5cyIsInByb2plY3RJZCIsInN0cmluZyIsImRlZmF1bHQiLCJwcm9qZWN0TmFtZSIsImRhdGEiLCJhcnJheSIsIml0ZW1zIiwic3JjIiwicmVxdWlyZWQiLCJ0eXBlIiwiYWx0ZXJuYXRpdmVzIiwidHJ5IiwidmFsaWQiLCJvZiIsImJhc2UiLCJiYXNlRW52IiwiZW5hYmxlSnMiLCJib29sZWFuIiwid2FpdEZvciIsImF1ZGl0cyIsImlnbm9yZSIsInZlcmlmeSIsImNvbmZpZyIsInJlc3VsdCIsInZhbGlkYXRlIiwidmFsdWUiLCJlcnJvciIsImVyciIsImdldCIsIkpTT04iLCJwYXJzZSIsIkVycm9yIl0sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0FBRUE7Ozs7QUFDQTs7OztBQUVBLElBQU1BLFNBQVMsY0FBSUMsTUFBSixHQUFhQyxJQUFiLENBQWtCO0FBQzdCQyxlQUFXLGNBQUlDLE1BQUosR0FBYUMsT0FBYixDQUFxQixhQUFyQixDQURrQjtBQUU3QkMsaUJBQWEsY0FBSUYsTUFBSixHQUFhQyxPQUFiLENBQXFCLGNBQXJCLENBRmdCO0FBRzdCRSxVQUFNLGNBQUlDLEtBQUosR0FBWUMsS0FBWixDQUFrQixjQUFJUixNQUFKLEdBQWFDLElBQWIsQ0FBa0I7QUFDdENRLGFBQUssY0FBSUYsS0FBSixHQUFZQyxLQUFaLENBQWtCLGNBQUlMLE1BQUosRUFBbEIsRUFBZ0NPLFFBQWhDLEVBRGlDO0FBRXRDQyxjQUFNLGNBQUlDLFlBQUosR0FBbUJDLEdBQW5CLENBQ0YsY0FBSVYsTUFBSixHQUFhVyxLQUFiLENBQW1CLENBQUMsS0FBRCxFQUFRLFNBQVIsRUFBbUIsTUFBbkIsQ0FBbkIsRUFBK0NKLFFBQS9DLEVBREUsRUFFRixjQUFJVixNQUFKLEdBQWFDLElBQWIsQ0FBa0I7QUFDZGMsZ0JBQUksY0FBSVosTUFBSixHQUFhVyxLQUFiLENBQW1CLENBQUMsS0FBRCxFQUFRLFNBQVIsRUFBbUIsTUFBbkIsQ0FBbkIsRUFBK0NKLFFBQS9DLEVBRFU7QUFFZE0sa0JBQU0sY0FBSWIsTUFBSixFQUZRO0FBR2RjLHFCQUFTLGNBQUlkLE1BQUo7QUFISyxTQUFsQixDQUZFLENBRmdDO0FBVXRDZSxrQkFBVSxjQUFJQyxPQUFKLEdBQWNmLE9BQWQsQ0FBc0IsS0FBdEIsQ0FWNEI7QUFXdENnQixpQkFBUyxjQUFJakIsTUFBSixFQVg2QjtBQVl0Q2tCLGdCQUFRLGNBQUlkLEtBQUosR0FBWUMsS0FBWixDQUFrQixjQUFJSSxZQUFKLEdBQW1CQyxHQUFuQixDQUN0QixjQUFJVixNQUFKLEVBRHNCLEVBRXRCLGNBQUlILE1BQUosR0FBYUMsSUFBYixDQUFrQjtBQUNkUSxpQkFBSyxjQUFJTixNQUFKLEdBQWFPLFFBQWIsRUFEUztBQUVkWSxvQkFBUSxjQUFJZixLQUFKLEdBQVlDLEtBQVosQ0FBa0IsY0FBSUwsTUFBSixFQUFsQjtBQUZNLFNBQWxCLENBRnNCLENBQWxCO0FBWjhCLEtBQWxCLENBQWxCLEVBbUJGTyxRQW5CRTtBQUh1QixDQUFsQixFQXVCWkEsUUF2QlksRUFBZjs7QUF5QkE7QUFDQTs7QUFFQTs7Ozs7QUFLQSxJQUFNYSxTQUFTLFNBQVRBLE1BQVMsQ0FBQ0MsTUFBRCxFQUFZO0FBQ3ZCLFFBQU1DLFNBQVMsY0FBSUMsUUFBSixDQUFhRixNQUFiLEVBQXFCekIsTUFBckIsQ0FBZjtBQUNBLFFBQU00QixRQUFRRixPQUFPRSxLQUFyQjs7QUFFQSxXQUFPRixPQUFPRyxLQUFQLEdBQWU7QUFDbEJBLGVBQU8sRUFBRWpCLE1BQU0sTUFBUixFQUFnQmtCLEtBQUtKLE9BQU9HLEtBQTVCO0FBRFcsS0FBZixHQUVILEVBQUVELFlBQUYsRUFGSjtBQUdILENBUEQ7O0FBU0E7Ozs7OztBQU1BLElBQU1HLE1BQU0sU0FBTkEsR0FBTSxDQUFDTixNQUFELEVBQVk7QUFDcEIsUUFBSSxPQUFPQSxNQUFQLEtBQWtCLFFBQXRCLEVBQWdDO0FBQzVCQSxpQkFBUyxxQkFBUyxtQkFBT0EsTUFBUCxDQUFULENBQVQ7QUFDQUEsaUJBQVNPLEtBQUtDLEtBQUwsQ0FBV1IsTUFBWCxDQUFUO0FBQ0g7O0FBRURBLGFBQVNELE9BQU9DLE1BQVAsQ0FBVDs7QUFFQTtBQUNBLFFBQUksQ0FBQ0EsTUFBRCxJQUFXQSxPQUFPSSxLQUF0QixFQUE2QjtBQUN6QixZQUFJSixVQUFVQSxPQUFPSSxLQUFqQixJQUEwQixRQUFPSixPQUFPSSxLQUFkLE1BQXdCLFFBQWxELElBQThESixPQUFPSSxLQUFQLENBQWFDLEdBQS9FLEVBQW9GO0FBQ2hGLGtCQUFNLElBQUlJLEtBQUosQ0FBVVQsT0FBT0ksS0FBUCxDQUFhQyxHQUF2QixDQUFOO0FBQ0g7O0FBRUQsY0FBTSxJQUFJSSxLQUFKLENBQVVULFVBQVVBLE9BQU9JLEtBQWpCLElBQTBCLG9CQUFwQyxDQUFOO0FBQ0g7O0FBRUQsV0FBT0osT0FBT0csS0FBZDtBQUNILENBbEJEOztBQW9CQTtBQUNBOztRQUVTRyxHLEdBQUFBLEc7O0FBRVQiLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgSm9pIGZyb20gJ2pvaSc7XG5pbXBvcnQgeyByZWFkRmlsZSwgZ2V0UHdkIH0gZnJvbSAnLi91dGlscy5qcyc7XG5cbmNvbnN0IFNUUlVDVCA9IEpvaS5vYmplY3QoKS5rZXlzKHtcbiAgICBwcm9qZWN0SWQ6IEpvaS5zdHJpbmcoKS5kZWZhdWx0KCdwcm9qZWN0bmFtZScpLFxuICAgIHByb2plY3ROYW1lOiBKb2kuc3RyaW5nKCkuZGVmYXVsdCgnUHJvamVjdCBOYW1lJyksXG4gICAgZGF0YTogSm9pLmFycmF5KCkuaXRlbXMoSm9pLm9iamVjdCgpLmtleXMoe1xuICAgICAgICBzcmM6IEpvaS5hcnJheSgpLml0ZW1zKEpvaS5zdHJpbmcoKSkucmVxdWlyZWQoKSxcbiAgICAgICAgdHlwZTogSm9pLmFsdGVybmF0aXZlcygpLnRyeShcbiAgICAgICAgICAgIEpvaS5zdHJpbmcoKS52YWxpZChbJ3VybCcsICdjb250ZW50JywgJ2ZpbGUnXSkucmVxdWlyZWQoKSxcbiAgICAgICAgICAgIEpvaS5vYmplY3QoKS5rZXlzKHtcbiAgICAgICAgICAgICAgICBvZjogSm9pLnN0cmluZygpLnZhbGlkKFsndXJsJywgJ2NvbnRlbnQnLCAnZmlsZSddKS5yZXF1aXJlZCgpLFxuICAgICAgICAgICAgICAgIGJhc2U6IEpvaS5zdHJpbmcoKSxcbiAgICAgICAgICAgICAgICBiYXNlRW52OiBKb2kuc3RyaW5nKClcbiAgICAgICAgICAgIH0pXG4gICAgICAgICksXG4gICAgICAgIGVuYWJsZUpzOiBKb2kuYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLFxuICAgICAgICB3YWl0Rm9yOiBKb2kuc3RyaW5nKCksXG4gICAgICAgIGF1ZGl0czogSm9pLmFycmF5KCkuaXRlbXMoSm9pLmFsdGVybmF0aXZlcygpLnRyeShcbiAgICAgICAgICAgIEpvaS5zdHJpbmcoKSxcbiAgICAgICAgICAgIEpvaS5vYmplY3QoKS5rZXlzKHtcbiAgICAgICAgICAgICAgICBzcmM6IEpvaS5zdHJpbmcoKS5yZXF1aXJlZCgpLFxuICAgICAgICAgICAgICAgIGlnbm9yZTogSm9pLmFycmF5KCkuaXRlbXMoSm9pLnN0cmluZygpKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgKSlcbiAgICB9KSkucmVxdWlyZWQoKVxufSkucmVxdWlyZWQoKTtcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBGdW5jdGlvbnNcblxuLyoqXG4gKiBWZXJpZnkgaWYgY29uZmlnIGlzIHJpZ2h0XG4gKiBAcGFyYW0gIHtvYmplY3R9IGNvbmZpZ1xuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuY29uc3QgdmVyaWZ5ID0gKGNvbmZpZykgPT4ge1xuICAgIGNvbnN0IHJlc3VsdCA9IEpvaS52YWxpZGF0ZShjb25maWcsIFNUUlVDVCk7XG4gICAgY29uc3QgdmFsdWUgPSByZXN1bHQudmFsdWU7XG5cbiAgICByZXR1cm4gcmVzdWx0LmVycm9yID8ge1xuICAgICAgICBlcnJvcjogeyB0eXBlOiAncm9vdCcsIGVycjogcmVzdWx0LmVycm9yIH1cbiAgICB9IDogeyB2YWx1ZSB9O1xufTtcblxuLyoqXG4gKiBHZXRzIGNvbmZpZ1xuICpcbiAqIEBwYXJhbSB7b2JqZWN0fHN0cmluZ30gY29uZmlnXG4gKiBAcmV0dXJucyB7b2JqZWN0fVxuICovXG5jb25zdCBnZXQgPSAoY29uZmlnKSA9PiB7XG4gICAgaWYgKHR5cGVvZiBjb25maWcgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGNvbmZpZyA9IHJlYWRGaWxlKGdldFB3ZChjb25maWcpKTtcbiAgICAgICAgY29uZmlnID0gSlNPTi5wYXJzZShjb25maWcpO1xuICAgIH1cblxuICAgIGNvbmZpZyA9IHZlcmlmeShjb25maWcpO1xuXG4gICAgLy8gVmVyaWZ5IGNvbmZpZ1xuICAgIGlmICghY29uZmlnIHx8IGNvbmZpZy5lcnJvcikge1xuICAgICAgICBpZiAoY29uZmlnICYmIGNvbmZpZy5lcnJvciAmJiB0eXBlb2YgY29uZmlnLmVycm9yID09PSAnb2JqZWN0JyAmJiBjb25maWcuZXJyb3IuZXJyKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoY29uZmlnLmVycm9yLmVycik7XG4gICAgICAgIH1cblxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoY29uZmlnICYmIGNvbmZpZy5lcnJvciB8fCAnQ291bGRuXFwndCB2YWxpZGF0ZScpO1xuICAgIH1cblxuICAgIHJldHVybiBjb25maWcudmFsdWU7XG59O1xuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFJ1bnRpbWVcblxuZXhwb3J0IHsgZ2V0IH07XG5cbi8vIEVzc2VudGlhbGx5IGZvciB0ZXN0aW5nIHB1cnBvc2VzXG5leHBvcnQgY29uc3QgX190ZXN0TWV0aG9kc19fID0geyBnZXQsIHZlcmlmeSB9O1xuIl19