/* eslint-disable strict */
'use strict';
/* eslint-enable strict */

//-------------------------------------
// Vars / Imports

var Joi = require('joi');
var bedrockFile = require('bedrock-utils/src/node/file.js');
var bedrockPath = require('bedrock-utils/src/node/path.js');

var STRUCT = Joi.object().keys({
    projectId: Joi.string().default('projectname'),
    projectName: Joi.string().default('Project Name'),
    data: Joi.array().items(Joi.object().keys({
        urls: Joi.array().items(Joi.string()).required(),
        audits: Joi.array().items(Joi.string()).default(['w3', 'SEO']),
        base: Joi.string(),
        baseEnv: Joi.string()
    })).default([])
}).required();

//-------------------------------------
// Functions

/**
 * Verify if config is right
 * @param  {object} config
 * @return {boolean}
 */
function verify(config) {
    var result = Joi.validate(config, STRUCT);
    var value = result.value;

    if (result.error) {
        return {
            error: { type: 'root', err: result.error }
        };
    }

    return { value: value };
}

/**
 * Gets config
 *
 * @param {object|string} config
 * @returns {object}
 */
function get(config) {
    if (typeof config === 'string') {
        config = bedrockFile.readFile(bedrockPath.getPwd(config));
        config = JSON.parse(config);
    }

    config = verify(config);

    // Verify config
    if (config.error) {
        throw new Error(config.error);
    } else {
        config = config.value;
    }

    return config;
}

//-------------------------------------
// Runtime

module.exports = {
    get: get
};
