/* eslint-disable strict */'use strict';/* eslint-enable */
/* global describe it */

var expect = require('chai').expect;
var file = require('bedrock-utils/src/node/file.js');
var config = require('../../src/config.js');

// --------------------------------
// Functions

// --------------------------------
// Suite of tests

describe('config', function () {
    // get
    describe('get', function () {
        it('should load config', function () {
            var result = config.get('./test/examples/config.json');

            expect(result).to.be.an('object');
            expect(result).to.have.all.keys(['projectId', 'projectName', 'data']);
            expect(result.data).to.be.an('array');
            expect(result.data).to.have.length.above(1);
            expect(result.data[0]).to.have.all.keys(['urls', 'audits']);
            expect(result.data[0]).to.contain.any.keys('urls', 'audits', 'base', 'baseEnv');
            expect(result.data[0].urls).to.be.an('array');
            expect(result.data[0].audits).to.be.an('array');
        });

        it('should return a valid config', function () {
            var configObj = JSON.parse(file.readFile('./test/examples/config.json'));
            var result = config.get(configObj);

            expect(result).to.be.an('object');
            expect(result).to.have.all.keys(['projectId', 'projectName', 'data']);
            expect(result.data).to.be.an('array');
            expect(result.data).to.have.length(configObj.data.length);
            expect(result.data[0]).to.have.all.keys(['urls', 'audits']);
            expect(result.data[0]).to.contain.any.keys('urls', 'audits', 'base', 'baseEnv');
            expect(result.data[0].urls).to.be.an('array');
            expect(result.data[0].audits).to.be.an('array');
        });
    });
});
