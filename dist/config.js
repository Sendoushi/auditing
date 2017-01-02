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
        urls: _joi2.default.array().items(_joi2.default.string()).required(),
        audits: _joi2.default.array().items(_joi2.default.string()).default(['w3', 'SEO']),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jb25maWcuanMiXSwibmFtZXMiOlsiU1RSVUNUIiwib2JqZWN0Iiwia2V5cyIsInByb2plY3RJZCIsInN0cmluZyIsImRlZmF1bHQiLCJwcm9qZWN0TmFtZSIsImRhdGEiLCJhcnJheSIsIml0ZW1zIiwidXJscyIsInJlcXVpcmVkIiwiYXVkaXRzIiwiYmFzZSIsImJhc2VFbnYiLCJ2ZXJpZnkiLCJjb25maWciLCJyZXN1bHQiLCJ2YWxpZGF0ZSIsInZhbHVlIiwiZXJyb3IiLCJ0eXBlIiwiZXJyIiwiZ2V0IiwiSlNPTiIsInBhcnNlIiwiRXJyb3IiXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7O0FBRUE7Ozs7QUFDQTs7OztBQUVBLElBQU1BLFNBQVMsY0FBSUMsTUFBSixHQUFhQyxJQUFiLENBQWtCO0FBQzdCQyxlQUFXLGNBQUlDLE1BQUosR0FBYUMsT0FBYixDQUFxQixhQUFyQixDQURrQjtBQUU3QkMsaUJBQWEsY0FBSUYsTUFBSixHQUFhQyxPQUFiLENBQXFCLGNBQXJCLENBRmdCO0FBRzdCRSxVQUFNLGNBQUlDLEtBQUosR0FBWUMsS0FBWixDQUFrQixjQUFJUixNQUFKLEdBQWFDLElBQWIsQ0FBa0I7QUFDdENRLGNBQU0sY0FBSUYsS0FBSixHQUFZQyxLQUFaLENBQWtCLGNBQUlMLE1BQUosRUFBbEIsRUFBZ0NPLFFBQWhDLEVBRGdDO0FBRXRDQyxnQkFBUSxjQUFJSixLQUFKLEdBQVlDLEtBQVosQ0FBa0IsY0FBSUwsTUFBSixFQUFsQixFQUFnQ0MsT0FBaEMsQ0FBd0MsQ0FBQyxJQUFELEVBQU8sS0FBUCxDQUF4QyxDQUY4QjtBQUd0Q1EsY0FBTSxjQUFJVCxNQUFKLEVBSGdDO0FBSXRDVSxpQkFBUyxjQUFJVixNQUFKO0FBSjZCLEtBQWxCLENBQWxCLEVBS0ZDLE9BTEUsQ0FLTSxFQUxOO0FBSHVCLENBQWxCLEVBU1pNLFFBVFksRUFBZjs7QUFXQTtBQUNBOztBQUVBOzs7OztBQUtBLElBQU1JLFNBQVMsU0FBVEEsTUFBUyxDQUFDQyxNQUFELEVBQVk7QUFDdkIsUUFBTUMsU0FBUyxjQUFJQyxRQUFKLENBQWFGLE1BQWIsRUFBcUJoQixNQUFyQixDQUFmO0FBQ0EsUUFBTW1CLFFBQVFGLE9BQU9FLEtBQXJCOztBQUVBLFdBQU9GLE9BQU9HLEtBQVAsR0FBZTtBQUNsQkEsZUFBTyxFQUFFQyxNQUFNLE1BQVIsRUFBZ0JDLEtBQUtMLE9BQU9HLEtBQTVCO0FBRFcsS0FBZixHQUVILEVBQUVELFlBQUYsRUFGSjtBQUdILENBUEQ7O0FBU0E7Ozs7OztBQU1BLElBQU1JLE1BQU0sU0FBTkEsR0FBTSxDQUFDUCxNQUFELEVBQVk7QUFDcEIsUUFBSSxPQUFPQSxNQUFQLEtBQWtCLFFBQXRCLEVBQWdDO0FBQzVCQSxpQkFBUyxxQkFBUyxtQkFBT0EsTUFBUCxDQUFULENBQVQ7QUFDQUEsaUJBQVNRLEtBQUtDLEtBQUwsQ0FBV1QsTUFBWCxDQUFUO0FBQ0g7O0FBRURBLGFBQVNELE9BQU9DLE1BQVAsQ0FBVDs7QUFFQTtBQUNBLFFBQUksQ0FBQ0EsTUFBRCxJQUFXQSxPQUFPSSxLQUF0QixFQUE2QjtBQUN6QixjQUFNLElBQUlNLEtBQUosQ0FBVVYsT0FBT0ksS0FBakIsQ0FBTjtBQUNIOztBQUVELFdBQU9KLE9BQU9HLEtBQWQ7QUFDSCxDQWREOztBQWdCQTtBQUNBOztRQUVTSSxHLEdBQUFBLEc7O0FBRVQiLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgSm9pIGZyb20gJ2pvaSc7XG5pbXBvcnQgeyByZWFkRmlsZSwgZ2V0UHdkIH0gZnJvbSAnLi91dGlscy5qcyc7XG5cbmNvbnN0IFNUUlVDVCA9IEpvaS5vYmplY3QoKS5rZXlzKHtcbiAgICBwcm9qZWN0SWQ6IEpvaS5zdHJpbmcoKS5kZWZhdWx0KCdwcm9qZWN0bmFtZScpLFxuICAgIHByb2plY3ROYW1lOiBKb2kuc3RyaW5nKCkuZGVmYXVsdCgnUHJvamVjdCBOYW1lJyksXG4gICAgZGF0YTogSm9pLmFycmF5KCkuaXRlbXMoSm9pLm9iamVjdCgpLmtleXMoe1xuICAgICAgICB1cmxzOiBKb2kuYXJyYXkoKS5pdGVtcyhKb2kuc3RyaW5nKCkpLnJlcXVpcmVkKCksXG4gICAgICAgIGF1ZGl0czogSm9pLmFycmF5KCkuaXRlbXMoSm9pLnN0cmluZygpKS5kZWZhdWx0KFsndzMnLCAnU0VPJ10pLFxuICAgICAgICBiYXNlOiBKb2kuc3RyaW5nKCksXG4gICAgICAgIGJhc2VFbnY6IEpvaS5zdHJpbmcoKVxuICAgIH0pKS5kZWZhdWx0KFtdKVxufSkucmVxdWlyZWQoKTtcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBGdW5jdGlvbnNcblxuLyoqXG4gKiBWZXJpZnkgaWYgY29uZmlnIGlzIHJpZ2h0XG4gKiBAcGFyYW0gIHtvYmplY3R9IGNvbmZpZ1xuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuY29uc3QgdmVyaWZ5ID0gKGNvbmZpZykgPT4ge1xuICAgIGNvbnN0IHJlc3VsdCA9IEpvaS52YWxpZGF0ZShjb25maWcsIFNUUlVDVCk7XG4gICAgY29uc3QgdmFsdWUgPSByZXN1bHQudmFsdWU7XG5cbiAgICByZXR1cm4gcmVzdWx0LmVycm9yID8ge1xuICAgICAgICBlcnJvcjogeyB0eXBlOiAncm9vdCcsIGVycjogcmVzdWx0LmVycm9yIH1cbiAgICB9IDogeyB2YWx1ZSB9O1xufTtcblxuLyoqXG4gKiBHZXRzIGNvbmZpZ1xuICpcbiAqIEBwYXJhbSB7b2JqZWN0fHN0cmluZ30gY29uZmlnXG4gKiBAcmV0dXJucyB7b2JqZWN0fVxuICovXG5jb25zdCBnZXQgPSAoY29uZmlnKSA9PiB7XG4gICAgaWYgKHR5cGVvZiBjb25maWcgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGNvbmZpZyA9IHJlYWRGaWxlKGdldFB3ZChjb25maWcpKTtcbiAgICAgICAgY29uZmlnID0gSlNPTi5wYXJzZShjb25maWcpO1xuICAgIH1cblxuICAgIGNvbmZpZyA9IHZlcmlmeShjb25maWcpO1xuXG4gICAgLy8gVmVyaWZ5IGNvbmZpZ1xuICAgIGlmICghY29uZmlnIHx8IGNvbmZpZy5lcnJvcikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoY29uZmlnLmVycm9yKTtcbiAgICB9XG5cbiAgICByZXR1cm4gY29uZmlnLnZhbHVlO1xufTtcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBSdW50aW1lXG5cbmV4cG9ydCB7IGdldCB9O1xuXG4vLyBFc3NlbnRpYWxseSBmb3IgdGVzdGluZyBwdXJwb3Nlc1xuZXhwb3J0IGNvbnN0IF9fdGVzdE1ldGhvZHNfXyA9IHsgZ2V0IH07XG4iXX0=