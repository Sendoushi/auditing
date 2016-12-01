/* eslint-disable strict */
'use strict';
/* eslint-enable */
/* global describe it */

// --------------------------------
// Vars / Imports

var expect = require('chai').expect;
var utils = require('../../suite/utils.js');

// --------------------------------
// General functions

// --------------------------------
// Suite of tests

describe('utils', function () {
    // isUrl
    describe('isUrl', function () {
        it('should be true', function () {
            var urls = [
                'http://www.google.com',
                'http://google.com',
                'https://www.google.com',
                'https://google.com'
            ];
            var result;

            urls.forEach(function (url) {
                result = utils.isUrl(url);

                expect(result).to.be.a('boolean');
                expect(result).to.equal(true);
            });
        });

        it('shouldn\'t be true', function () {
            var urls = [
                'www.google.com',
                'google.com',
                '/www.google.com',
                '/google.com',
                '/bar'
            ];
            var result;

            urls.forEach(function (url) {
                result = utils.isUrl(url);

                expect(result).to.be.a('boolean');
                expect(result).to.equal(false);
            });
        });
    });

    // getPath
    describe('getPath', function () {
        it('should get absolute path of string', function () {
            var result = utils.getPath('foo');

            expect(result).to.be.a('string');
            expect(result).to.contain('foo');
            expect(result[0]).to.equal('/');
        });

        it('should get absolute path of array', function () {
            var result = utils.getPath(['foo', '/bar']);

            expect(result).to.be.an('array');
            expect(result).to.have.length(2);
            expect(result[0]).to.contain('foo');
            expect(result[0][0]).to.equal('/');
            expect(result[1]).to.equal('/bar');
        });

        it('should return if already absolute', function () {
            var result = utils.getPath('/bar');

            expect(result).to.be.a('string');
            expect(result).to.equal('/bar');
        });

        it('should return if url', function () {
            var urls = ['http://www.google.com', 'http://google.com'];
            var result;

            urls.forEach(function (url) {
                result = utils.getPath(url);

                expect(result).to.be.a('string');
                expect(result).to.equal(url);
            });
        });
    });

    // readFile
    describe('readFile', function () {
        it('should load file', function () {
            var result = utils.readFile('./test/examples/config.json');

            expect(result).to.be.a('string');

            result = JSON.parse(result);
            expect(result).to.be.an('object');
            expect(result).to.have.all.keys(['projectId', 'projectName', 'data']);
            expect(result.data).to.be.an('array');
        });

        it('should be false if file doesn\'t exit', function () {
            var result = utils.readFile('/bar');

            expect(result).to.be.a('boolean');
            expect(result).to.equal(false);
        });
    });
});
