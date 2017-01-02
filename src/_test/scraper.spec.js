'use strict';
/* global describe it */

import { expect } from 'chai';
import { __testMethods__ as fns } from '../scraper.js';

// --------------------------------
// Functions

// --------------------------------
// Suite of tests

describe('audit.scraper', () => {
    // getReqUrls
    describe('getReqUrls', () => {
        it('should get an array', () => {
            const urls = [
                'http://www.google.com',
                'http://google.com',
                'https://www.google.com',
                'https://google.com'
            ];
            const result = fns.getReqUrls(urls);

            expect(result).to.be.an('array');
            expect(result).to.have.length(urls.length);
            expect(result[0]).to.be.an('object');
            expect(result[0]).to.have.keys(['requestUrl', 'originalUrl']);
            expect(result[0].requestUrl).to.equal(urls[0]);
            expect(result[0].originalUrl).to.equal(urls[0]);
        });

        it('should get an array with base', () => {
            const urls = ['www.google.com', 'google.com'];
            const result = fns.getReqUrls(urls, 'http://');

            expect(result).to.be.an('array');
            expect(result).to.have.length(urls.length);
            expect(result[0]).to.be.an('object');
            expect(result[0]).to.have.keys(['requestUrl', 'originalUrl']);
            expect(result[0].requestUrl).to.contain('http://');
            expect(result[0].requestUrl).to.contain(urls[0]);
            expect(result[0].originalUrl).to.equal(urls[0]);
        });

        it('should get an array with environment variable', () => {
            const urls = ['www.google.com', 'google.com'];

            // Prepare the env
            process.env.BEDROCK_AUDIT_BASE = 'http://';

            // Lets test
            const result = fns.getReqUrls(urls, null, 'BEDROCK_AUDIT_BASE');

            expect(result).to.be.an('array');
            expect(result).to.have.length(urls.length);
            expect(result[0]).to.be.an('object');
            expect(result[0]).to.have.keys(['requestUrl', 'originalUrl']);
            expect(result[0].requestUrl).to.contain('http://');
            expect(result[0].requestUrl).to.contain(urls[0]);
            expect(result[0].originalUrl).to.equal(urls[0]);
        });
    });

    // getDom
    describe('getDom', () => {
        it('should get a window with DOM', function (done) {
            this.timeout(10000);

            fns.getDom('http://www.google.com')
            .then(window => !!window && !!window.document ? done() : done('No window found!'))
            .catch(done);
        });

        it('should set jquery in window', function (done) {
            this.timeout(10000);

            fns.getDom('http://www.google.com')
            .then(window => !!window && !!window.$ ? done() : done('No jquery found!'))
            .catch(done);
        });

        it('should error without a valid url', (done) => {
            fns.getDom('www.google.com')
            .then(() => done('It should\'ve errored with an invalid url!'))
            .catch((err) => !!err ? done() : done('Where is the error?'));
        });
    });

    // run
    describe('run', () => {
        it('should retrieve a full object', function (done) {
            const urls = ['http://google.com'];

            this.timeout(5000);

            fns.run({ urls })
            .then((result) => {
                expect(result).to.be.an('array');
                expect(result).to.have.length(urls.length);

                if (result[0].err) {
                    return done(result.err);
                }

                expect(result[0]).to.be.an('object');
                expect(result[0]).to.have.keys(['requestUrl', 'originalUrl', 'window']);
                expect(result[0].originalUrl).to.equal(urls[0]);

                done();
            })
            .catch(done);
        });

        it('should retrieve the object with base', function (done) {
            const urls = ['google.com'];

            this.timeout(5000);

            fns.run({ urls, base: 'http://' })
            .then((result) => {
                expect(result).to.be.an('array');
                expect(result).to.have.length(urls.length);

                if (result[0].err) {
                    return done(result.err);
                }

                expect(result[0]).to.be.an('object');
                expect(result[0]).to.have.keys(['requestUrl', 'originalUrl', 'window']);
                expect(result[0].originalUrl).to.equal(urls[0]);

                done();
            })
            .catch(done);
        });
    });
});
