'use strict';
/* global describe it */

import { expect } from 'chai';
import { readFile } from '../utils.js';
import { __testMethods__ as fns } from '../config.js';

// --------------------------------
// Functions

// --------------------------------
// Suite of tests

describe('audit.config', () => {
    // get
    describe('get', () => {
        it('should load config', () => {
            const result = fns.get('./src/_test/data/config.json');

            expect(result).to.be.an('object');
            expect(result).to.have.all.keys(['projectId', 'projectName', 'data']);
            expect(result.data).to.be.an('array');
            expect(result.data).to.have.length.above(1);
            expect(result.data[0]).to.have.all.keys(['urls', 'audits']);
            expect(result.data[0]).to.contain.any.keys('urls', 'audits', 'base', 'baseEnv');
            expect(result.data[0].urls).to.be.an('array');
            expect(result.data[0].audits).to.be.an('array');
        });

        it('should return a valid config', () => {
            const configObj = JSON.parse(readFile('./src/_test/data/config.json'));
            const result = fns.get(configObj);

            expect(result).to.be.an('object');
            expect(result).to.have.all.keys(['projectId', 'projectName', 'data']);
            expect(result.data).to.be.an('array');
            expect(result.data).to.have.length(configObj.data.length);
            expect(result.data[0]).to.have.all.keys(['urls', 'audits']);
            expect(result.data[0]).to.contain.any.keys('urls', 'audits', 'base', 'baseEnv');
            expect(result.data[0].urls).to.be.an('array');
            expect(result.data[0].audits).to.be.an('array');
        });

        it('should fail on an invalid config', (done) => {
            try {
                fns.get({ foo: 'bar' });
                done('It should error!');
            } catch (err) {
                done();
            }
        });
    });
});
