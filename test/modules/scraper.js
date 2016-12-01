/* eslint-disable strict */'use strict';/* eslint-enable */
/* global describe it */

var expect = require('chai').expect;
var scraper = require('../../src/scraper.js');

// --------------------------------
// Functions

// --------------------------------
// Suite of tests

describe('scraper', function () {
    // getReqUrls
    describe('getReqUrls', function () {
        it('should get an array', function () {
            var urls = [
                'http://www.google.com',
                'http://google.com',
                'https://www.google.com',
                'https://google.com'
            ];
            var result = scraper.getReqUrls(urls);

            expect(result).to.be.an('array');
            expect(result).to.have.length(urls.length);
            expect(result[0]).to.be.an('object');
            expect(result[0]).to.have.keys(['requestUrl', 'originalUrl']);
            expect(result[0].requestUrl).to.equal(urls[0]);
            expect(result[0].originalUrl).to.equal(urls[0]);
        });

        it('should get an array with base', function () {
            var urls = ['www.google.com', 'google.com'];
            var result = scraper.getReqUrls(urls, 'http://');

            expect(result).to.be.an('array');
            expect(result).to.have.length(urls.length);
            expect(result[0]).to.be.an('object');
            expect(result[0]).to.have.keys(['requestUrl', 'originalUrl']);
            expect(result[0].requestUrl).to.contain('http://');
            expect(result[0].requestUrl).to.contain(urls[0]);
            expect(result[0].originalUrl).to.equal(urls[0]);
        });

        it('should get an array with environment variable', function () {
            var urls = ['www.google.com', 'google.com'];
            var result;

            // Prepare the env
            process.env.BEDROCK_AUDIT_BASE = 'http://';

            // Lets test
            result = scraper.getReqUrls(urls, null, 'BEDROCK_AUDIT_BASE');

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
    describe('getDom', function () {
        it('should get a window with DOM', function (done) {
            this.timeout(10000);

            scraper.getDom('http://www.google.com')
            .then(window => !!window && !!window.document ? done() : done('No window found!'))
            .catch(done);
        });

        it('should set jquery in window', function (done) {
            this.timeout(10000);

            scraper.getDom('http://www.google.com')
            .then(window => !!window && !!window.$ ? done() : done('No jquery found!'))
            .catch(done);
        });

        it('should error without a valid url', function (done) {
            scraper.getDom('www.google.com')
            .then(() => done('It should\'ve errored with an invalid url!'))
            .catch((err) => !!err ? done() : done('Where is the error?'));
        });
    });

    // run
    describe('run', function () {
        it('should retrieve a full object', function (done) {
            var urls = ['http://google.com'];

            this.timeout(5000);

            scraper.run({ urls: urls })
            .then(function (result) {
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
            var urls = ['google.com'];

            this.timeout(5000);

            scraper.run({ urls: urls, base: 'http://' })
            .then(function (result) {
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
