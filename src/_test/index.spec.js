'use strict';
/* global describe it before after beforeEach afterEach Promise */

import { expect } from 'chai';
import { __testMethods__ as fns } from '../index.js';

// --------------------------------
// Variables

// --------------------------------
// Functions

/**
 * It test to act as stub
 *
 * @param {string} msg
 * @param {function} cb
 */
const itTest = function (msg, cb) {
    const module = {
        done: () => {},
        timeout: () => {}
    };

    cb.bind(module)(module.done);
};

// --------------------------------
// Suite of tests

describe('audit.index', () => {
    // setup
    describe('setup', () => {
        it('should error without a valid describe', (done) => {
            try {
                fns.setup('not valid');
                done('It should\'ve errored');
            } catch (err) {
                done();
            }
        });

        it('should error without a valid it', (done) => {
            try {
                fns.setup(null, 'not valid');
                done('It should\'ve errored');
            } catch (err) {
                done();
            }
        });

        it('should error without a valid warn', (done) => {
            try {
                fns.setup(null, null, 'not valid');
                done('It should\'ve errored');
            } catch (err) {
                done();
            }
        });

        it('should make the right substitution', () => fns.setup(() => {}, () => {}, () => {}));

        afterEach(() => {
            fns.setup(null, null, null, true);
        });
    });

    // run
    describe('run', () => {
        it('should error without a valid config', (done) => {
            try {
                fns.run(false).then(() => done('It should\'ve errored'));
            } catch (err) {
                done();
            }
        });

        it('should run with a config source', function (done) {
            const configSrc = './src/_test/data/config_basic.json';

            // We need some time for this one to be well tested...
            this.timeout(20000);

            fns.run(configSrc)
            .then(data => {
                expect(data).to.be.an('object');
                expect(data).to.have.keys(['custom']);
                expect(data.custom).to.be.an('array');
                expect(data.custom.length).to.eql(2);

                data.custom.forEach(val => {
                    expect(val).to.be.an('object');
                    expect(val).to.have.keys(['name', 'status', 'result']);
                    expect(val.name).to.be.a('string');
                    expect(val.status).to.be.a('string');
                });

                done();
            })
            .catch(done);
        });

        it('should run with a config object', function (done) {
            const configObj = require('./data/config_basic.json');

            // We need some time for this one to be well tested...
            this.timeout(20000);

            fns.run(configObj)
            .then(data => {
                expect(data).to.be.an('object');
                expect(data).to.have.keys(['custom']);
                expect(data.custom).to.be.an('array');
                expect(data.custom.length).to.eql(2);

                data.custom.forEach(val => {
                    expect(val).to.be.an('object');
                    expect(val).to.have.keys(['name', 'status', 'result']);
                    expect(val.name).to.be.a('string');
                    expect(val.status).to.be.a('string');
                });

                done();
            })
            .catch(done);
        });
    });

    // gatherData
    describe('gatherData', () => {
        it('should work with an empty data', (done) => {
            fns.gatherData([])
            .then(done.bind(null, null))
            .catch(done);
        });

        it('should gather data', function (done) {
            const config = [{
                src: ['http://google.pt'],
                type: 'url',
                audits: ['./src/_test/data/custom.js']
            }];

            // We need some time for this one to be well tested...
            this.timeout(20000);

            fns.gatherData(config)
            .then((data) => {
                expect(data).to.be.an('array');
                expect(data.length).to.eql(1);

                data.forEach(val => {
                    expect(val).to.be.an('object');
                    expect(val).to.have.keys('src', 'type', 'audits', 'auditsData', 'srcData');

                    expect(val.src).to.be.an('array');
                    expect(val.src.length).to.eql(1);
                    val.src.forEach(url => {
                        expect(url).to.be.a('string');
                    });

                    expect(val.audits).to.be.an('array');
                    expect(val.audits.length).to.eql(1);
                    val.audits.forEach(audit => {
                        expect(audit).to.be.a('string');
                    });

                    expect(val.auditsData).to.be.an('array');
                    expect(val.auditsData.length).to.eql(1);
                    val.auditsData.forEach(audit => {
                        expect(audit).to.be.an('object');
                    });

                    expect(val.srcData).to.be.an('array');
                    expect(val.srcData.length).to.eql(1);
                    val.srcData.forEach(url => {
                        expect(url).to.be.an('object');
                        expect(url).to.have.keys('requestSrc', 'originalSrc', 'domReq');
                        expect(url.requestSrc).to.be.a('string');
                        expect(url.originalSrc).to.be.a('string');
                        expect(url.domReq).to.be.an('object');
                    });
                });

                done();
            }).catch(done);
        });
    });

    // buildAudits
    describe('buildAudits', () => {
        it('should build audits with an array', () => {
            const result = fns.buildAudits(['./src/_test/data/custom.js']);

            expect(result).to.be.an('array');
            expect(result.length).to.eql(1);

            result.forEach(val => {
                expect(val).to.be.an('object');
                expect(val).to.have.keys(['name', 'src', 'rules', 'ignore']);
                expect(val.name).to.be.a('string');
                expect(val.src).to.be.a('string');
                expect(val.rules).to.be.a('array');
                expect(val.ignore).to.be.an('array');
            });
        });

        it('should build audits with a string', () => {
            const result = fns.buildAudits('./src/_test/data/custom.js');

            expect(result).to.be.an('array');
            expect(result.length).to.eql(1);

            result.forEach(val => {
                expect(val).to.be.an('object');
                expect(val).to.have.keys(['name', 'src', 'rules', 'ignore']);
                expect(val.name).to.be.a('string');
                expect(val.src).to.be.a('string');
                expect(val.rules).to.be.a('array');
                expect(val.ignore).to.be.an('array');
            });
        });

        it('should build audits with a custom source', () => {
            const result = fns.buildAudits('./src/_test/data/custom.js');

            expect(result).to.be.an('array');
            expect(result.length).to.eql(1);

            result.forEach(val => {
                expect(val).to.be.an('object');
                expect(val).to.have.keys(['name', 'src', 'rules', 'ignore']);
                expect(val.name).to.be.a('string');
                expect(val.src).to.be.a('string');
                expect(val.rules).to.be.a('array');
                expect(val.ignore).to.be.an('array');
            });
        });

        it('should build audits with an array of objects', () => {
            const result = fns.buildAudits([{
                name: 'Custom',
                src: './src/_test/data/custom.js',
                ignore: ['hasBody']
            }]);

            expect(result).to.be.an('array');
            expect(result.length).to.eql(1);

            result.forEach(val => {
                expect(val).to.be.an('object');
                expect(val).to.have.keys(['name', 'src', 'rules', 'ignore']);
                expect(val.name).to.be.a('string');
                expect(val.src).to.be.a('string');
                expect(val.rules).to.be.a('array');
                expect(val.ignore).to.be.an('array');
            });
        });
    });

    // runAudit
    describe('runAudit', () => {
        before(() => {
            fns.setup(null, itTest);
        });

        it('should resolve with success', (done) => {
            const auditsData = [
                {
                    name: 'foo',
                    rules: [{
                        name: 'bar',
                        fn: () => new Promise((resolve) => { resolve(true); })
                    }]
                }
            ];

            (new Promise((resolve, reject) => fns.runAudit(auditsData, {}, resolve, reject)))
            .then(data => {
                expect(data).to.be.an('object');
                expect(data).to.have.keys(['foo']);
                expect(data.foo).to.be.an('array');
                expect(data.foo.length).to.eql(1);

                data.foo.forEach(val => {
                    expect(val).to.have.keys(['name', 'status', 'result']);
                    expect(val.name).to.be.a('string');
                    expect(val.name).to.eql('bar');
                    expect(val.status).to.be.a('string');
                    expect(val.status).to.eql('passed');
                    expect(val.result).to.be.a('boolean');
                    expect(val.result).to.eql(true);
                });

                done();
            })
            .catch(done);
        });

        it('should error with fail', (done) => {
            const auditsData = [
                {
                    name: 'foo',
                    rules: [{
                        name: 'bar',
                        fn: () => (new Promise((resolve, reject) => { reject(true); }))
                    }]
                }
            ];

            (new Promise((resolve, reject) => fns.runAudit(auditsData, {}, resolve, reject)))
            .then(() => { done('It should\'ve errored'); })
            .catch(err => {
                expect(err).to.be.an('object');
                expect(err).to.have.keys(['foo']);
                expect(err.foo).to.be.an('array');
                expect(err.foo.length).to.eql(1);

                err.foo.forEach(val => {
                    expect(val).to.have.keys(['name', 'status', 'result']);
                    expect(val.name).to.be.a('string');
                    expect(val.name).to.eql('bar');
                    expect(val.status).to.be.a('string');
                    expect(val.status).to.eql('failed');
                    expect(val.result).to.be.a('boolean');
                    expect(val.result).to.eql(true);
                });

                done();
            });
        });

        it('should error with one success and one fail', (done) => {
            const auditsData = [
                {
                    name: 'set',
                    rules: [{
                        name: 'bar',
                        fn: () => new Promise((resolve, reject) => { reject(true); })
                    }, {
                        name: 'foo',
                        fn: () => new Promise((resolve) => { resolve(true); })
                    }]
                }
            ];

            (new Promise((resolve, reject) => fns.runAudit(auditsData, {}, resolve, reject)))
            .then(() => { done('It should\'ve errored'); })
            .catch(err => {
                expect(err).to.be.an('object');
                expect(err).to.have.keys(['set']);
                expect(err.set).to.be.an('array');
                expect(err.set.length).to.eql(2);

                err.set.forEach(val => {
                    expect(val).to.have.keys(['name', 'status', 'result']);
                    expect(val.name).to.be.a('string');
                    expect(val.status).to.be.a('string');
                    expect(val.result).to.be.a('boolean');
                    expect(val.result).to.eql(true);

                    if (val.name === 'bar') {
                        expect(val.status).to.eql('failed');
                    }

                    if (val.name === 'foo') {
                        expect(val.status).to.eql('passed');
                    }
                });

                done();
            });
        });

        it('should error without a resolve function', (done) => {
            const auditsData = [
                {
                    name: 'foo',
                    rules: [{
                        name: 'bar',
                        fn: () => new Promise((resolve) => { resolve(true); })
                    }]
                }
            ];

            try {
                fns.runAudit(auditsData, {}, null, done.bind(null, null));
                done('It should\'ve errored');
            } catch (err) {
                done();
            }
        });

        it('should error without a reject function', (done) => {
            const auditsData = [
                {
                    name: 'foo',
                    rules: [{
                        name: 'bar',
                        fn: () => new Promise((resolve) => { resolve(true); })
                    }]
                }
            ];

            try {
                fns.runAudit(auditsData, {}, () => { done('It should\'ve errored'); });
                done('It should\'ve errored');
            } catch (err) {
                done();
            }
        });

        it('should ignore rule', (done) => {
            const auditsData = [
                {
                    name: 'set',
                    rules: [{
                        name: 'bar',
                        fn: () => new Promise((resolve, reject) => { reject(true); })
                    }, {
                        name: 'foo',
                        fn: () => new Promise((resolve) => { resolve(true); })
                    }],
                    ignore: ['bar']
                }
            ];

            (new Promise((resolve, reject) => fns.runAudit(auditsData, {}, resolve, reject)))
            .then((data) => {
                expect(data).to.be.an('object');
                expect(data).to.have.keys(['set']);
                expect(data.set).to.be.an('array');
                expect(data.set.length).to.eql(2);

                data.set.forEach(val => {
                    expect(val).to.have.keys(['name', 'status', 'result']);
                    expect(val.name).to.be.a('string');
                    expect(val.status).to.be.a('string');
                    expect(val.result).to.be.a('boolean');

                    if (val.name === 'bar') {
                        expect(val.status).to.eql('ignored');
                        expect(val.result).to.eql(false);
                    }
                });

                done();
            })
            .catch(done);
        });
    });

    // runRule
    describe('runRule', () => {
        it('should error without a rule', (done) => {
            try {
                fns.runRule(null, {});
                done('It should\'ve errored');
            } catch (err) {
                done();
            }
        });

        it('should error without a compliant rule', (done) => {
            try {
                fns.runRule('string', {});
                done('It should\'ve errored');
            } catch (err) {
                done();
            }
        });

        it('should error without a rule name', (done) => {
            try {
                fns.runRule({ fn: () => {} }, {});
                done('It should\'ve errored');
            } catch (err) {
                done();
            }
        });

        it('should error without a rule function', (done) => {
            try {
                fns.runRule({ name: 'foo' }, {});
                done('It should\'ve errored');
            } catch (err) {
                done();
            }
        });

        it('should succeed', (done) => {
            fns.runRule({
                name: 'foo',
                fn: () => (new Promise(resolve => resolve(true)))
            }, {})
            .then(data => {
                expect(data).to.be.an('object');
                expect(data).to.have.keys(['name', 'status', 'result']);
                expect(data.name).to.be.a('string');
                expect(data.status).to.be.a('string');
                expect(data.status).to.eql('passed');
                expect(data.result).to.be.a('boolean');
                expect(data.result).to.eql(true);

                done();
            })
            .catch(done);
        });

        it('should ignore rule', (done) => {
            fns.runRule({
                name: 'foo',
                fn: () => (new Promise(resolve => resolve(true)))
            }, {}, ['foo'])
            .then(data => {
                expect(data).to.be.an('object');
                expect(data).to.have.keys(['name', 'status', 'result']);
                expect(data.name).to.be.a('string');
                expect(data.status).to.be.a('string');
                expect(data.status).to.eql('ignored');
                expect(data.result).to.be.a('boolean');
                expect(data.result).to.eql(false);

                done();
            })
            .catch(done);
        });

        it('should ignore rule even if errored', (done) => {
            fns.runRule({
                name: 'foo',
                fn: () => (new Promise((resolve, reject) => reject(true)))
            }, {}, ['foo'])
            .then(data => {
                expect(data).to.be.an('object');
                expect(data).to.have.keys(['name', 'status', 'result']);
                expect(data.name).to.be.a('string');
                expect(data.status).to.be.a('string');
                expect(data.status).to.eql('ignored');
                expect(data.result).to.be.a('boolean');
                expect(data.result).to.eql(false);

                done();
            })
            .catch(done);
        });

        it('should error', (done) => {
            fns.runRule({
                name: 'foo',
                fn: () => (new Promise((resolve, reject) => reject(true)))
            }, {})
            .then(() => done('It should\'ve errored'))
            .catch(err => {
                expect(err).to.be.an('object');
                expect(err).to.have.keys(['name', 'status', 'result']);
                expect(err.name).to.be.a('string');
                expect(err.status).to.be.a('string');
                expect(err.status).to.eql('failed');
                expect(err.result).to.be.a('boolean');
                expect(err.result).to.eql(true);

                done();
            });
        });

        it('should succeed with array result', (done) => {
            fns.runRule({
                name: 'foo',
                fn: () => (new Promise(resolve => {
                    resolve([{ status: 'passed', msg: 'Foo' }]);
                }))
            }, {})
            .then(data => {
                expect(data).to.be.an('object');
                expect(data).to.have.keys(['name', 'status', 'result']);
                expect(data.name).to.be.a('string');
                expect(data.status).to.be.a('string');
                expect(data.status).to.eql('passed');
                expect(data.result).to.be.an('array');
                expect(data.result.length).to.eql(1);

                data.result.forEach(result => {
                    expect(result).to.be.an('object');
                    expect(result).to.have.keys(['status', 'msg']);
                    expect(result.status).to.be.a('string');
                    expect(result.status).to.eql('passed');
                    expect(result.msg).to.be.a('string');
                    expect(result.msg).to.eql('Foo');
                });

                done();
            })
            .catch(done);
        });

        it('should ignore message within array result', (done) => {
            fns.runRule({
                name: 'set',
                fn: () => (new Promise(resolve => {
                    resolve([{ status: 'passed', msg: 'Foo' }]);
                }))
            }, {}, ['foo'])
            .then(data => {
                expect(data).to.be.an('object');
                expect(data).to.have.keys(['name', 'status', 'result']);
                expect(data.name).to.be.a('string');
                expect(data.status).to.be.a('string');
                expect(data.status).to.eql('passed');
                expect(data.result).to.be.an('array');
                expect(data.result.length).to.eql(1);

                data.result.forEach(result => {
                    expect(result).to.be.an('object');
                    expect(result).to.have.keys(['status', 'msg']);
                    expect(result.status).to.be.a('string');
                    expect(result.status).to.eql('ignored');
                    expect(result.msg).to.be.a('string');
                    expect(result.msg).to.eql('Foo');
                });

                done();
            })
            .catch(done);
        });

        it('should error with array result error', (done) => {
            fns.runRule({
                name: 'foo',
                fn: () => (new Promise(resolve => {
                    resolve([{ status: 'failed', msg: 'Foo' }]);
                }))
            }, {})
            .then(() => { done('It shouldn\'t have passed'); })
            .catch(err => {
                expect(err).to.be.an('object');
                expect(err).to.have.keys(['name', 'status', 'result']);
                expect(err.name).to.be.a('string');
                expect(err.status).to.be.a('string');
                expect(err.status).to.eql('failed');
                expect(err.result).to.be.an('array');
                expect(err.result.length).to.eql(1);

                err.result.forEach(result => {
                    expect(result).to.be.an('object');
                    expect(result).to.have.keys(['status', 'msg']);
                    expect(result.status).to.be.a('string');
                    expect(result.status).to.eql('failed');
                    expect(result.msg).to.be.a('string');
                    expect(result.msg).to.eql('Foo');
                });

                done();
            });
        });

        it('should ignore message within an array errored result', (done) => {
            fns.runRule({
                name: 'set',
                fn: () => (new Promise(resolve => {
                    resolve([{ status: 'failed', msg: 'Foo' }]);
                }))
            }, {}, ['foo'])
            .then(data => {
                expect(data).to.be.an('object');
                expect(data).to.have.keys(['name', 'status', 'result']);
                expect(data.name).to.be.a('string');
                expect(data.status).to.be.a('string');
                expect(data.status).to.eql('passed');
                expect(data.result).to.be.an('array');
                expect(data.result.length).to.eql(1);

                data.result.forEach(result => {
                    expect(result).to.be.an('object');
                    expect(result).to.have.keys(['status', 'msg']);
                    expect(result.status).to.be.a('string');
                    expect(result.status).to.eql('ignored');
                    expect(result.msg).to.be.a('string');
                    expect(result.msg).to.eql('Foo');
                });

                done();
            })
            .catch(done);
        });

        it('should error with array result item without status', (done) => {
            fns.runRule({
                name: 'foo',
                fn: () => (new Promise(resolve => {
                    resolve([{ statuo: 'passed', msg: 'Foo' }]);
                }))
            }, {})
            .then(() => done('It should\'ve errored'))
            .catch(err => {
                expect(err).to.be.an('object');
                expect(err).to.have.keys(['name', 'status', 'result']);
                expect(err.name).to.be.a('string');
                expect(err.status).to.be.a('string');
                expect(err.status).to.eql('failed');
                expect(err.result).to.be.an('array');
                expect(err.result.length).to.eql(1);

                err.result.forEach(result => {
                    expect(result).to.be.an('object');
                    expect(result).to.contain.keys(['status', 'msg', 'result']);
                    expect(result.status).to.be.a('string');
                    expect(result.status).to.eql('failed');
                    expect(result.msg).to.be.a('string');
                    expect(result.msg).to.eql('Foo');
                    expect(result.result).to.be.a('string');
                });

                done();
            });
        });

        it('should error with array result item without msg', (done) => {
            fns.runRule({
                name: 'foo',
                fn: () => (new Promise(resolve => {
                    resolve([{ status: 'passed', msga: 'Foo' }]);
                }))
            }, {})
            .then(() => done('It should\'ve errored'))
            .catch(err => {
                expect(err).to.be.an('object');
                expect(err).to.have.keys(['name', 'status', 'result']);
                expect(err.name).to.be.a('string');
                expect(err.status).to.be.a('string');
                expect(err.status).to.eql('failed');
                expect(err.result).to.be.an('array');
                expect(err.result.length).to.eql(1);

                err.result.forEach(result => {
                    expect(result).to.be.an('object');
                    expect(result).to.contain.keys(['status', 'msg', 'result']);
                    expect(result.status).to.be.a('string');
                    expect(result.status).to.eql('failed');
                    expect(result.msg).to.be.a('string');
                    expect(result.msg).to.be.eql('');
                    expect(result.result).to.be.a('string');
                });

                done();
            });
        });

        it('should warn in case of status warning', (done) => {
            fns.setup(null, null, (name, msg, raw) => {
                expect(name).to.be.a('string');
                expect(name).to.eql('foo');
                expect(msg).to.be.a('string');
                expect(msg).to.eql('Foo');
                expect(raw).to.be.a('object');
                expect(raw).to.have.keys(['bar']);
            });

            fns.runRule({
                name: 'foo',
                fn: () => (new Promise(resolve => {
                    resolve([{ status: 'warning', msg: 'Foo', raw: { bar: 'foo' } }]);
                }))
            }, {})
            .then(data => {
                expect(data).to.be.an('object');
                expect(data).to.have.keys(['name', 'status', 'result']);
                expect(data.name).to.be.a('string');
                expect(data.status).to.be.a('string');
                expect(data.status).to.eql('passed');
                expect(data.result).to.be.an('array');
                expect(data.result.length).to.eql(1);

                data.result.forEach(result => {
                    expect(result).to.be.an('object');
                    expect(result).to.have.keys(['status', 'msg', 'raw']);
                    expect(result.status).to.be.a('string');
                    expect(result.status).to.eql('warning');
                    expect(result.msg).to.be.a('string');
                    expect(result.msg).to.eql('Foo');
                });

                // It still should succeed
                done();
            })
            .catch(done);
        });

        after(() => {
            fns.setup(null, null, null, true);
        });
    });
});
