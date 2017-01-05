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

    // getUrlMarkup
    describe('getUrlMarkup', () => {
        it('should get an url markup', (done) => {
            fns.getUrlMarkup('http://www.brainjar.com/java/host/test.html')
            .then(markup => {
                expect(markup).to.be.a('string');
                expect(markup).to.have.length.above(100);
                expect(markup).to.match(/<html/);
                expect(markup).to.match(/<body/);

                done();
            })
            .catch(done);
        });

        it('should error without an url', (done) => {
            fns.getUrlMarkup()
            .then(() => { done('It shouldn\'t have errored'); })
            .catch(done.bind(null, null));
        });

        it('should error without a string url', (done) => {
            fns.getUrlMarkup({})
            .then(() => { done('It shouldn\'t have errored'); })
            .catch(done.bind(null, null));
        });
    });

    // getDom
    describe('getDom', () => {
        it('should get a window with DOM using url', function (done) {
            this.timeout(10000);

            fns.getDom('http://www.brainjar.com/java/host/test.html', 'url')
            .then(domObj => {
                expect(domObj).to.be.an('object');
                expect(domObj).to.have.keys(['window', 'errors', 'logs', 'warns', 'preMarkup']);
                expect(domObj.window).to.contain.keys(['$', 'document']);
                expect(domObj.errors).to.be.an('array');
                expect(domObj.logs).to.be.an('array');
                expect(domObj.warns).to.be.an('array');
                expect(domObj.preMarkup).to.be.a('string');
                expect(domObj.preMarkup).to.have.length.above(1);
                done();
            })
            .catch(done);
        });

        it('should get a window with DOM using a string', function (done) {
            this.timeout(10000);

            fns.getDom('<html><body><h1>Headline</h1></body></html>', 'content')
            .then(domObj => {
                expect(domObj).to.be.an('object');
                expect(domObj).to.have.keys(['window', 'errors', 'logs', 'warns', 'preMarkup']);
                expect(domObj.window).to.contain.keys(['$', 'document']);
                expect(domObj.errors).to.be.an('array');
                expect(domObj.logs).to.be.an('array');
                expect(domObj.warns).to.be.an('array');
                expect(domObj.preMarkup).to.be.a('string');
                expect(domObj.preMarkup).to.have.length.above(1);
                done();
            })
            .catch(done);
        });

        it('should get a window with javacript processed', function (done) {
            this.timeout(10000);

            let tmpl = '<html><body><h1 id="headline">Headline</h1>';
            tmpl += '<script>document.getElementById(\'headline\').textContent=\'Foo\';</script>';
            tmpl += '</body></html>';

            fns.getDom(tmpl, 'content')
            .then(domObj => {
                expect(domObj).to.be.an('object');
                expect(domObj).to.have.keys(['window', 'errors', 'logs', 'warns', 'preMarkup']);
                expect(domObj.window.document.getElementById('headline').textContent).to.eql('Foo');
                expect(domObj.window).to.contain.keys(['$', 'document']);
                expect(domObj.errors).to.be.an('array');
                expect(domObj.logs).to.be.an('array');
                expect(domObj.warns).to.be.an('array');
                expect(domObj.preMarkup).to.be.a('string');
                expect(domObj.preMarkup).to.have.length.above(1);
                done();
            })
            .catch(done);
        });

        it('should return javascript errors', function (done) {
            this.timeout(10000);

            let tmpl = '<html><body><h1 id="headline">Headline</h1>';
            tmpl += '<script>console.error(\'BarFoo\');throw new Error(\'FooBar\');</script>';
            tmpl += '</body></html>';

            fns.getDom(tmpl, 'content')
            .then(domObj => {
                expect(domObj).to.be.an('object');
                expect(domObj).to.have.keys(['window', 'errors', 'logs', 'warns', 'preMarkup']);
                expect(domObj.window).to.contain.keys(['$', 'document']);
                expect(domObj.errors).to.be.an('array');
                expect(domObj.logs).to.be.an('array');
                expect(domObj.warns).to.be.an('array');
                expect(domObj.preMarkup).to.be.a('string');
                expect(domObj.preMarkup).to.have.length.above(1);

                expect(domObj.errors.length).to.eql(2);
                expect(domObj.errors[0]).to.contain('BarFoo');
                expect(domObj.errors[1].message).to.contain('FooBar');

                done();
            })
            .catch(done);
        });

        it('should return javascript logs', function (done) {
            this.timeout(10000);

            let tmpl = '<html><body><h1 id="headline">Headline</h1>';
            tmpl += '<script>console.log(\'FooBar\');</script>';
            tmpl += '</body></html>';

            fns.getDom(tmpl, 'content')
            .then(domObj => {
                expect(domObj).to.be.an('object');
                expect(domObj).to.have.keys(['window', 'errors', 'logs', 'warns', 'preMarkup']);
                expect(domObj.window).to.contain.keys(['$', 'document']);
                expect(domObj.errors).to.be.an('array');
                expect(domObj.logs).to.be.an('array');
                expect(domObj.warns).to.be.an('array');
                expect(domObj.preMarkup).to.be.a('string');
                expect(domObj.preMarkup).to.have.length.above(1);

                expect(domObj.logs.length).to.eql(1);
                expect(domObj.logs).to.contain('FooBar');

                done();
            })
            .catch(done);
        });

        it('should return javascript warns', function (done) {
            this.timeout(10000);

            let tmpl = '<html><body><h1 id="headline">Headline</h1>';
            tmpl += '<script>console.warn(\'FooBar\');</script>';
            tmpl += '</body></html>';

            fns.getDom(tmpl, 'content')
            .then(domObj => {
                expect(domObj).to.be.an('object');
                expect(domObj).to.have.keys(['window', 'errors', 'logs', 'warns', 'preMarkup']);
                expect(domObj.window).to.contain.keys(['$', 'document']);
                expect(domObj.errors).to.be.an('array');
                expect(domObj.logs).to.be.an('array');
                expect(domObj.warns).to.be.an('array');
                expect(domObj.preMarkup).to.be.a('string');
                expect(domObj.preMarkup).to.have.length.above(1);

                expect(domObj.warns.length).to.eql(1);
                expect(domObj.warns).to.contain('FooBar');

                done();
            })
            .catch(done);
        });

        it('should error without a valid url', (done) => {
            fns.getDom('www.brainjar.com/java/host/test.html', 'url')
            .then(() => done('It should\'ve errored with an invalid url!'))
            .catch((err) => !!err ? done() : done('Where is the error?'));
        });
    });

    // run
    describe('run', () => {
        it('should retrieve a full object', function (done) {
            const urls = ['http://brainjar.com/java/host/test.html'];

            this.timeout(5000);

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

            fns.run({ src: urls, type: 'url', base: 'http://' })
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
