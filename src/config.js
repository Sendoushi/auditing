'use strict';

import Joi from 'joi';
import { readFile, getPwd } from './utils.js';

const STRUCT = Joi.object().keys({
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
const verify = (config) => {
    const result = Joi.validate(config, STRUCT);
    const value = result.value;

    return result.error ? {
        error: { type: 'root', err: result.error }
    } : { value };
};

/**
 * Gets config
 *
 * @param {object|string} config
 * @returns {object}
 */
const get = (config) => {
    if (typeof config === 'string') {
        config = readFile(getPwd(config));
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

export { get };

// Essentially for testing purposes
export const __testMethods__ = { get };
