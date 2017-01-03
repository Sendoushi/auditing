'use strict';
/* global describe it before after beforeEach afterEach Promise */

import { expect } from 'chai';
import { __testMethods__ as fns } from '../utils.js';

// --------------------------------
// Variables

// --------------------------------
// Functions

describe('audit.utils', () => {
    // readFile
    describe('readFile', () => {
        it('should load file', () => {
            let result = fns.readFile('./data/config.json', __dirname);

            expect(result).to.be.a('string');

            result = JSON.parse(result);
            expect(result).to.be.an('object');
            expect(result).to.have.all.keys(['projectId', 'projectName', 'data']);
            expect(result.data).to.be.an('array');
        });

        it('should be false if file doesn\'t exit', () => {
            const result = fns.readFile('/bar');

            expect(result).to.be.a('boolean');
            expect(result).to.equal(false);
        });
    });

    // getPwd
    describe('getPwd', () => {
        it('should get absolute path of string', () => {
            const result = fns.getPwd('foo');

            expect(result).to.be.a('string');
            expect(result).to.contain('foo');
            expect(result[0]).to.equal('/');
        });

        it('should get absolute path of array', () => {
            const result = fns.getPwd(['foo', '/bar']);

            expect(result).to.be.an('array');
            expect(result).to.have.length(2);
            expect(result[0]).to.contain('foo');
            expect(result[0][0]).to.equal('/');
            expect(result[1]).to.equal('/bar');
        });

        it('should return if already absolute', () => {
            const result = fns.getPwd('/bar');

            expect(result).to.be.a('string');
            expect(result).to.equal('/bar');
        });

        it('should return if url', () => {
            const urls = ['http://www.google.com', 'http://google.com'];
            let result;

            urls.forEach((url) => {
                result = fns.getPwd(url);

                expect(result).to.be.a('string');
                expect(result).to.equal(url);
            });
        });
    });

    // isUrl
    describe('isUrl', () => {
        it('should be true', () => {
            const urls = [
                'http://www.google.com',
                'http://google.com',
                'https://www.google.com',
                'https://google.com'
            ];
            let result;

            urls.forEach((url) => {
                result = fns.isUrl(url);

                expect(result).to.be.a('boolean');
                expect(result).to.equal(true);
            });
        });

        it('shouldn\'t be true', () => {
            const urls = [
                'www.google.com',
                'google.com',
                '/www.google.com',
                '/google.com',
                '/bar'
            ];
            let result;

            urls.forEach((url) => {
                result = fns.isUrl(url);

                expect(result).to.be.a('boolean');
                expect(result).to.equal(false);
            });
        });
    });

    // contains
    describe('contains', () => {
        it('should return true if matches', () => {
            const result = fns.contains(['foo'], 'foobar');
            expect(result).to.be.a('boolean');
            expect(result).to.be.eql(true);
        });

        it('should return true if matches and the checked is a string', () => {
            const result = fns.contains('foo', 'foobar');
            expect(result).to.be.a('boolean');
            expect(result).to.be.eql(true);
        });

        it('should return false if it doesn\'t match', () => {
            const result = fns.contains('foo', 'bar');
            expect(result).to.be.a('boolean');
            expect(result).to.be.eql(false);
        });

        it('should return false with non string value', () => {
            const result = fns.contains(['foo'], true);
            expect(result).to.be.a('boolean');
            expect(result).to.be.eql(false);
        });
    });
});
