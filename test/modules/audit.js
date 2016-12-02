/* eslint-disable strict */'use strict';/* eslint-enable */
/* global describe it before after beforeEach afterEach Promise */

var expect = require('chai').expect;
var audit = require('../../src/audit.js');

// --------------------------------
// Functions

/**
 * Sets basic stubs
 */
function setBasicStubs() {
    var aDescribe = function (msg, cb) {
        expect(msg).to.be.a('string');
        expect(cb).to.be.a('function');

        cb = cb.bind({ timeout: () => {} });
        cb();
    };
    var aIt = aDescribe;

    audit['test.stubs']({
        describe: aDescribe,
        it: aIt,
        logger: {
            warn: () => {},
            err: () => {},
            msg: () => {}
        }
    });
}

// --------------------------------
// Suite of tests

describe('audit', function () {
    // run
    describe('run', function () {
        it.skip('should run', function (done) {
            // TODO: How to test this?
            // TODO: Stubs??
            // audit({
            //     projectId: 'test',
            //     projectName: 'Test',
            //     data: [{
            //         urls: ['http://google.pt'],
            //         audits: ['w3', 'seo']
            //     }]
            // })
            // .then(function (data) {
            //     // TODO: ...
            //     done();
            // })
            // .catch(done);
            done();
        });
    });

    // gatherData
    describe('gatherData', function () {
        it.skip('should gatherData', function () {
            // TODO: ...
        });
    });

    // buildAudits
    describe('buildAudits', function () {
        beforeEach(setBasicStubs);

        it.skip('should buildAudits', function () {
            // TODO: ...
        });
    });

    // auditReq
    describe('auditReq', function () {
        beforeEach(setBasicStubs);

        it('should error without audits', function (done) {
            try {
                audit['test.get']('auditReq')(null, {});
                done('It should\'ve errored!');
            } catch (err) {
                done();
            }
        });

        it('should error without req', function (done) {
            try {
                audit['test.get']('auditReq')([]);
                done('It should\'ve errored!');
            } catch (err) {
                done();
            }
        });

        it('should run without audits array length', function () {
            audit['test.get']('auditReq')([], { originalUrl: 'foo' });
        });

        it('should run', function () {
            audit['test.get']('auditReq')([], { originalUrl: 'foo' });
        });
    });

    // runRule
    describe('runRule', function () {
        beforeEach(setBasicStubs);

        it('should error without an audit', function (done) {
            try {
                audit['test.get']('runRule')({});
                done('It should\'ve errored!');
            } catch (err) {
                done();
            }
        });

        it('should run without rules array length', function () {
            audit['test.get']('runRule')({}, {});
        });

        it('should run', function (done) {
            var aIt = function (msg, cb) {
                cb = cb.bind({ timeout: () => {} }, done);
                cb();
            };

            audit['test.stubs']({ it: aIt });
            audit['test.get']('runRule')({ foo: 'foobar' }, {
                rules: [{
                    name: 'bar',
                    fn: function (req) {
                        var promise = new Promise(function (resolve) {
                            expect(req).to.be.an('object');
                            expect(req).to.contain.keys('foo');
                            expect(req.foo).to.be.a('string');
                            expect(req.foo).to.eql('foobar');

                            // Just to break the chain
                            resolve([]);
                        });

                        return promise;
                    }
                }]
            });
        });
    });

    // ruleResult
    describe('ruleResult', function () {
        beforeEach(setBasicStubs);

        it('should run without an array of data', function (done) {
            audit['test.get']('ruleResult')(null, null, done);
        });

        it('should run even without length in array', function (done) {
            audit['test.get']('ruleResult')({ name: 'foo' }, [], done);
        });

        it('should result', function (done) {
            audit['test.get']('ruleResult')({ name: 'foo' }, [{
                msg: 'bar'
            }], done);
        });

        it('should error if data tells so', function (done) {
            var aIt = function (msg, cb) {
                expect(msg).to.be.a('string');
                expect(msg).to.contain('bar');

                try {
                    // Callback now
                    cb();
                    done('It should\'ve errored!');
                } catch (err) {
                    done();
                }
            };

            audit['test.stubs']({ it: aIt });
            audit['test.get']('ruleResult')({ name: 'foo' }, [{
                msg: 'bar',
                type: 'error'
            }], () => {});
        });

        it('should warning if data tells so', function (done) {
            var aLogger = {
                warn: function (mod, data) {
                    expect(mod).to.be.a('string');
                    expect(mod).to.eql('foo');
                    expect(data).to.be.an('object');
                    expect(data).to.contain.keys(['msg', 'type']);
                    expect(data.msg).to.eql('bar');
                    expect(data.type).to.eql('warning');
                }
            };

            audit['test.stubs']({ logger: aLogger });
            audit['test.get']('ruleResult')({ name: 'foo' }, [{
                msg: 'bar',
                type: 'warning'
            }], done);
        });
    });
});
