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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jb25maWcuanMiXSwibmFtZXMiOlsiU1RSVUNUIiwib2JqZWN0Iiwia2V5cyIsInByb2plY3RJZCIsInN0cmluZyIsImRlZmF1bHQiLCJwcm9qZWN0TmFtZSIsImRhdGEiLCJhcnJheSIsIml0ZW1zIiwidXJscyIsInJlcXVpcmVkIiwiYXVkaXRzIiwiYWx0ZXJuYXRpdmVzIiwidHJ5Iiwic3JjIiwiaWdub3JlIiwiYmFzZSIsImJhc2VFbnYiLCJ2ZXJpZnkiLCJjb25maWciLCJyZXN1bHQiLCJ2YWxpZGF0ZSIsInZhbHVlIiwiZXJyb3IiLCJ0eXBlIiwiZXJyIiwiZ2V0IiwiSlNPTiIsInBhcnNlIiwiRXJyb3IiXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7O0FBRUE7Ozs7QUFDQTs7OztBQUVBLElBQU1BLFNBQVMsY0FBSUMsTUFBSixHQUFhQyxJQUFiLENBQWtCO0FBQzdCQyxlQUFXLGNBQUlDLE1BQUosR0FBYUMsT0FBYixDQUFxQixhQUFyQixDQURrQjtBQUU3QkMsaUJBQWEsY0FBSUYsTUFBSixHQUFhQyxPQUFiLENBQXFCLGNBQXJCLENBRmdCO0FBRzdCRSxVQUFNLGNBQUlDLEtBQUosR0FBWUMsS0FBWixDQUFrQixjQUFJUixNQUFKLEdBQWFDLElBQWIsQ0FBa0I7QUFDdENRLGNBQU0sY0FBSUYsS0FBSixHQUFZQyxLQUFaLENBQWtCLGNBQUlMLE1BQUosRUFBbEIsRUFBZ0NPLFFBQWhDLEVBRGdDO0FBRXRDQyxnQkFBUSxjQUFJSixLQUFKLEdBQVlDLEtBQVosQ0FBa0IsY0FBSUksWUFBSixHQUFtQkMsR0FBbkIsQ0FDdEIsY0FBSVYsTUFBSixFQURzQixFQUV0QixjQUFJSCxNQUFKLEdBQWFDLElBQWIsQ0FBa0I7QUFDZGEsaUJBQUssY0FBSVgsTUFBSixHQUFhTyxRQUFiLEVBRFM7QUFFZEssb0JBQVEsY0FBSVIsS0FBSixHQUFZQyxLQUFaLENBQWtCLGNBQUlMLE1BQUosRUFBbEI7QUFGTSxTQUFsQixDQUZzQixDQUFsQixDQUY4QjtBQVN0Q2EsY0FBTSxjQUFJYixNQUFKLEVBVGdDO0FBVXRDYyxpQkFBUyxjQUFJZCxNQUFKO0FBVjZCLEtBQWxCLENBQWxCLEVBV0ZDLE9BWEUsQ0FXTSxFQVhOO0FBSHVCLENBQWxCLEVBZVpNLFFBZlksRUFBZjs7QUFpQkE7QUFDQTs7QUFFQTs7Ozs7QUFLQSxJQUFNUSxTQUFTLFNBQVRBLE1BQVMsQ0FBQ0MsTUFBRCxFQUFZO0FBQ3ZCLFFBQU1DLFNBQVMsY0FBSUMsUUFBSixDQUFhRixNQUFiLEVBQXFCcEIsTUFBckIsQ0FBZjtBQUNBLFFBQU11QixRQUFRRixPQUFPRSxLQUFyQjs7QUFFQSxXQUFPRixPQUFPRyxLQUFQLEdBQWU7QUFDbEJBLGVBQU8sRUFBRUMsTUFBTSxNQUFSLEVBQWdCQyxLQUFLTCxPQUFPRyxLQUE1QjtBQURXLEtBQWYsR0FFSCxFQUFFRCxZQUFGLEVBRko7QUFHSCxDQVBEOztBQVNBOzs7Ozs7QUFNQSxJQUFNSSxNQUFNLFNBQU5BLEdBQU0sQ0FBQ1AsTUFBRCxFQUFZO0FBQ3BCLFFBQUksT0FBT0EsTUFBUCxLQUFrQixRQUF0QixFQUFnQztBQUM1QkEsaUJBQVMscUJBQVMsbUJBQU9BLE1BQVAsQ0FBVCxDQUFUO0FBQ0FBLGlCQUFTUSxLQUFLQyxLQUFMLENBQVdULE1BQVgsQ0FBVDtBQUNIOztBQUVEQSxhQUFTRCxPQUFPQyxNQUFQLENBQVQ7O0FBRUE7QUFDQSxRQUFJLENBQUNBLE1BQUQsSUFBV0EsT0FBT0ksS0FBdEIsRUFBNkI7QUFDekIsY0FBTSxJQUFJTSxLQUFKLENBQVVWLE9BQU9JLEtBQWpCLENBQU47QUFDSDs7QUFFRCxXQUFPSixPQUFPRyxLQUFkO0FBQ0gsQ0FkRDs7QUFnQkE7QUFDQTs7UUFFU0ksRyxHQUFBQSxHOztBQUVUIiwiZmlsZSI6ImNvbmZpZy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IEpvaSBmcm9tICdqb2knO1xuaW1wb3J0IHsgcmVhZEZpbGUsIGdldFB3ZCB9IGZyb20gJy4vdXRpbHMuanMnO1xuXG5jb25zdCBTVFJVQ1QgPSBKb2kub2JqZWN0KCkua2V5cyh7XG4gICAgcHJvamVjdElkOiBKb2kuc3RyaW5nKCkuZGVmYXVsdCgncHJvamVjdG5hbWUnKSxcbiAgICBwcm9qZWN0TmFtZTogSm9pLnN0cmluZygpLmRlZmF1bHQoJ1Byb2plY3QgTmFtZScpLFxuICAgIGRhdGE6IEpvaS5hcnJheSgpLml0ZW1zKEpvaS5vYmplY3QoKS5rZXlzKHtcbiAgICAgICAgdXJsczogSm9pLmFycmF5KCkuaXRlbXMoSm9pLnN0cmluZygpKS5yZXF1aXJlZCgpLFxuICAgICAgICBhdWRpdHM6IEpvaS5hcnJheSgpLml0ZW1zKEpvaS5hbHRlcm5hdGl2ZXMoKS50cnkoXG4gICAgICAgICAgICBKb2kuc3RyaW5nKCksXG4gICAgICAgICAgICBKb2kub2JqZWN0KCkua2V5cyh7XG4gICAgICAgICAgICAgICAgc3JjOiBKb2kuc3RyaW5nKCkucmVxdWlyZWQoKSxcbiAgICAgICAgICAgICAgICBpZ25vcmU6IEpvaS5hcnJheSgpLml0ZW1zKEpvaS5zdHJpbmcoKSlcbiAgICAgICAgICAgIH0pXG4gICAgICAgICkpLFxuICAgICAgICBiYXNlOiBKb2kuc3RyaW5nKCksXG4gICAgICAgIGJhc2VFbnY6IEpvaS5zdHJpbmcoKVxuICAgIH0pKS5kZWZhdWx0KFtdKVxufSkucmVxdWlyZWQoKTtcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBGdW5jdGlvbnNcblxuLyoqXG4gKiBWZXJpZnkgaWYgY29uZmlnIGlzIHJpZ2h0XG4gKiBAcGFyYW0gIHtvYmplY3R9IGNvbmZpZ1xuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuY29uc3QgdmVyaWZ5ID0gKGNvbmZpZykgPT4ge1xuICAgIGNvbnN0IHJlc3VsdCA9IEpvaS52YWxpZGF0ZShjb25maWcsIFNUUlVDVCk7XG4gICAgY29uc3QgdmFsdWUgPSByZXN1bHQudmFsdWU7XG5cbiAgICByZXR1cm4gcmVzdWx0LmVycm9yID8ge1xuICAgICAgICBlcnJvcjogeyB0eXBlOiAncm9vdCcsIGVycjogcmVzdWx0LmVycm9yIH1cbiAgICB9IDogeyB2YWx1ZSB9O1xufTtcblxuLyoqXG4gKiBHZXRzIGNvbmZpZ1xuICpcbiAqIEBwYXJhbSB7b2JqZWN0fHN0cmluZ30gY29uZmlnXG4gKiBAcmV0dXJucyB7b2JqZWN0fVxuICovXG5jb25zdCBnZXQgPSAoY29uZmlnKSA9PiB7XG4gICAgaWYgKHR5cGVvZiBjb25maWcgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGNvbmZpZyA9IHJlYWRGaWxlKGdldFB3ZChjb25maWcpKTtcbiAgICAgICAgY29uZmlnID0gSlNPTi5wYXJzZShjb25maWcpO1xuICAgIH1cblxuICAgIGNvbmZpZyA9IHZlcmlmeShjb25maWcpO1xuXG4gICAgLy8gVmVyaWZ5IGNvbmZpZ1xuICAgIGlmICghY29uZmlnIHx8IGNvbmZpZy5lcnJvcikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoY29uZmlnLmVycm9yKTtcbiAgICB9XG5cbiAgICByZXR1cm4gY29uZmlnLnZhbHVlO1xufTtcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBSdW50aW1lXG5cbmV4cG9ydCB7IGdldCB9O1xuXG4vLyBFc3NlbnRpYWxseSBmb3IgdGVzdGluZyBwdXJwb3Nlc1xuZXhwb3J0IGNvbnN0IF9fdGVzdE1ldGhvZHNfXyA9IHsgZ2V0IH07XG4iXX0=