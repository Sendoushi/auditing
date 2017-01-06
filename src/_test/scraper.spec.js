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
                'http://www.brainjar.com/java/host/test.html',
                'http://brainjar.com/java/host/test.html',
                'https://www.brainjar.com/java/host/test.html',
                'https://brainjar.com/java/host/test.html'
            ];
            const result = fns.getReqUrls(urls);

            expect(result).to.be.an('array');
            expect(result).to.have.length(urls.length);

            expect(result[0]).to.be.an('object');
            expect(result[0]).to.have.keys(['requestSrc', 'originalSrc']);
            expect(result[0].requestSrc).to.equal(urls[0]);
            expect(result[0].originalSrc).to.equal(urls[0]);
        });

        it('should get an array with base', () => {
            const urls = ['www.brainjar.com/java/host/test.html', 'brainjar.com/java/host/test.html'];
            const result = fns.getReqUrls(urls, 'http://');

            expect(result).to.be.an('array');
            expect(result).to.have.length(urls.length);
            expect(result[0]).to.be.an('object');
            expect(result[0]).to.have.keys(['requestSrc', 'originalSrc']);
            expect(result[0].requestSrc).to.contain('http://');
            expect(result[0].requestSrc).to.contain(urls[0]);
            expect(result[0].originalSrc).to.equal(urls[0]);
        });

        it('should get an array with environment variable', () => {
            const urls = ['www.brainjar.com/java/host/test.html', 'brainjar.com/java/host/test.html'];

            // Prepare the env
            process.env.AUDIT_BASE = 'http://';

            // Lets test
            const result = fns.getReqUrls(urls, null, 'AUDIT_BASE');

            expect(result).to.be.an('array');
            expect(result).to.have.length(urls.length);
            expect(result[0]).to.be.an('object');
            expect(result[0]).to.have.keys(['requestSrc', 'originalSrc']);
            expect(result[0].requestSrc).to.contain('http://');
            expect(result[0].requestSrc).to.contain(urls[0]);
            expect(result[0].originalSrc).to.equal(urls[0]);
        });
    });

    // run
    describe('run', () => {
        it('should retrieve a full object', function (done) {
            const urls = ['http://brainjar.com/java/host/test.html'];

            this.timeout(10000);

            fns.run({ src: urls, type: 'url' })
            .then((result) => {
                expect(result).to.be.an('array');
                expect(result).to.have.length(urls.length);

                if (result[0].err) {
                    return done(result.err);
                }

                expect(result[0]).to.be.an('object');
                expect(result[0]).to.have.keys(['requestSrc', 'originalSrc', 'domReq']);
                expect(result[0].originalSrc).to.equal(urls[0]);

                done();
            })
            .catch(done);
        });

        it('should retrieve the object with base', function (done) {
            const urls = ['brainjar.com/java/host/test.html'];

            this.timeout(5000);

            fns.run({ src: urls, type: { of: 'url', base: 'http://' } })
            .then((result) => {
                expect(result).to.be.an('array');
                expect(result).to.have.length(urls.length);

                if (result[0].err) {
                    return done(result.err);
                }

                expect(result[0]).to.be.an('object');
                expect(result[0]).to.have.keys(['requestSrc', 'originalSrc', 'domReq']);
                expect(result[0].originalSrc).to.equal(urls[0]);

                done();
            })
            .catch(done);
        });
    });
});
