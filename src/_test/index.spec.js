'use strict';
/* global describe it before after beforeEach afterEach Promise */

import { expect } from 'chai';
import { __testMethods__ as fns, __testStubs__ as stubs } from '../index.js';

// --------------------------------
// Variables

// --------------------------------
// Functions

/**
 * Sets basic stubs
 */
const setBasicStubs = () => {
    const aDescribe = (msg, cb) => {
        expect(msg).to.be.a('string');
        expect(cb).to.be.a('function');

        cb = cb.bind({ timeout: () => {} });
        cb();
    };
    const aIt = aDescribe;

    // TODO: We need a way to set the log
    stubs({
        describe: aDescribe,
        it: aIt,
        logger: {
            warn: () => {},
            err: () => {},
            msg: () => {}
        }
    });
};

// --------------------------------
// Suite of tests

describe('audit.index', () => {
    // run
    describe('run', () => {
        it.skip('should run', (done) => {
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
    describe('gatherData', () => {
        it.skip('should gatherData', () => {
            // TODO: ...
        });
    });

    // buildAudits
    describe('buildAudits', () => {
        beforeEach(setBasicStubs);

        it.skip('should buildAudits', () => {
            // TODO: ...
        });
    });

    // auditReq
    describe('auditReq', () => {
        beforeEach(setBasicStubs);

        it('should error without audits', (done) => {
            try {
                fns.auditReq(null, {});
                done('It should\'ve errored!');
            } catch (err) {
                done();
            }
        });

        it('should error without req', (done) => {
            try {
                fns.auditReq([]);
                done('It should\'ve errored!');
            } catch (err) {
                done();
            }
        });

        it('should run without audits array length', () => {
            fns.auditReq([], { originalUrl: 'foo' });
        });

        it('should run', () => {
            fns.auditReq([], { originalUrl: 'foo' });
        });
    });

    // runRule
    describe('runRule', () => {
        beforeEach(setBasicStubs);

        it('should error without an audit', (done) => {
            try {
                fns.runRule({});
                done('It should\'ve errored!');
            } catch (err) {
                done();
            }
        });

        it('should run without rules array length', () => {
            fns.runRule({}, {});
        });

        it('should run', (done) => {
            const aIt = (msg, cb) => {
                cb = cb.bind({ timeout: () => {} }, done);
                cb();
            };

            stubs({ it: aIt });
            fns.runRule({ foo: 'foobar' }, {
                rules: [{
                    name: 'bar',
                    fn: (req) => {
                        const promise = new Promise((resolve) => {
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
    describe('ruleResult', () => {
        beforeEach(setBasicStubs);

        it('should run without an array of data', (done) => {
            fns.ruleResult(null, null, done);
        });

        it('should run even without length in array', (done) => {
            fns.ruleResult({ name: 'foo' }, [], done);
        });

        it('should result', (done) => {
            fns.ruleResult({ name: 'foo' }, [{
                msg: 'bar'
            }], done);
        });

        it('should error if data tells so', (done) => {
            const aIt = (msg, cb) => {
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

            stubs({ it: aIt });
            fns.ruleResult({ name: 'foo' }, [{
                msg: 'bar',
                type: 'error'
            }], () => {});
        });

        it.skip('should warning if data tells so', (done) => {
            // TODO: We need a way to set the logging stubs
            const aLogger = {
                warn: (mod, data) => {
                    expect(mod).to.be.a('string');
                    expect(mod).to.eql('foo');
                    expect(data).to.be.an('object');
                    expect(data).to.contain.keys(['msg', 'type']);
                    expect(data.msg).to.eql('bar');
                    expect(data.type).to.eql('warning');
                }
            };

            stubs({ logger: aLogger });
            fns.ruleResult({ name: 'foo' }, [{
                msg: 'bar',
                type: 'warning'
            }], done);
        });
    });
});
