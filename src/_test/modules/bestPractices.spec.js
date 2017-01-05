'use strict';
/* global describe it before after beforeEach afterEach Promise */

import { expect } from 'chai';
import { run } from '../../index.js';
import bestPracticesModule from '../../modules/bestPractices.js';

// --------------------------------
// Variables

const allRules = bestPracticesModule.rules.map(val => val.name);

// --------------------------------
// Functions

describe('audit.modules.bestPractices', () => {
    describe('audit.modules.bestPractices.hasntLogs', () => {
        const ruleName = 'hasntLogs';

        it('should succeed without any log', function (done) {
            const configObj = {
                projectId: 'test',
                projectName: 'Test',
                data: [{
                    src: ['<html><head></head><body></body></html>'],
                    type: 'content',
                    audits: [{
                        src: 'bestPractices',
                        ignore: allRules.filter(val => val !== ruleName)
                    }]
                }]
            };

            // We need some time for this one to be well tested...
            this.timeout(5000);

            run(configObj)
            .then(data => {
                const rule = data.bestPractices.filter(val => val.name === ruleName)[0];
                expect(rule.status).to.eql('passed');
                expect(rule.result).to.eql(true);

                done();
            })
            .catch(done);
        });

        it('should error with logs', function (done) {
            const configObj = {
                projectId: 'test',
                projectName: 'Test',
                data: [{
                    src: ['<html><head></head><body><script>console.log("foo");</script></body></html>'],
                    type: 'content',
                    audits: [{
                        src: 'bestPractices',
                        ignore: allRules.filter(val => val !== ruleName)
                    }]
                }]
            };

            // We need some time for this one to be well tested...
            this.timeout(5000);

            run(configObj)
            .then(() => { done('It should\'ve errored'); })
            .catch(err => {
                const rule = err.bestPractices.filter(val => val.name === ruleName)[0];
                expect(rule.status).to.eql('failed');
                expect(rule.result).to.be.an('array');
                expect(rule.result.length).to.eql(1);
                expect(rule.result[0]).to.eql('foo');

                done();
            });
        });
    });

    describe('audit.modules.bestPractices.hasntWarns', () => {
        const ruleName = 'hasntWarns';

        it('should succeed without any warn', function (done) {
            const configObj = {
                projectId: 'test',
                projectName: 'Test',
                data: [{
                    src: ['<html><head></head><body></body></html>'],
                    type: 'content',
                    audits: [{
                        src: 'bestPractices',
                        ignore: allRules.filter(val => val !== ruleName)
                    }]
                }]
            };

            // We need some time for this one to be well tested...
            this.timeout(5000);

            run(configObj)
            .then(data => {
                const rule = data.bestPractices.filter(val => val.name === ruleName)[0];
                expect(rule.status).to.eql('passed');
                expect(rule.result).to.eql(true);

                done();
            })
            .catch(done);
        });

        it('should error with warns', function (done) {
            const configObj = {
                projectId: 'test',
                projectName: 'Test',
                data: [{
                    src: ['<html><head></head><body><script>console.warn("foo");</script></body></html>'],
                    type: 'content',
                    audits: [{
                        src: 'bestPractices',
                        ignore: allRules.filter(val => val !== ruleName)
                    }]
                }]
            };

            // We need some time for this one to be well tested...
            this.timeout(5000);

            run(configObj)
            .then(() => { done('It should\'ve errored'); })
            .catch(err => {
                const rule = err.bestPractices.filter(val => val.name === ruleName)[0];
                expect(rule.status).to.eql('failed');
                expect(rule.result).to.be.an('array');
                expect(rule.result.length).to.eql(1);
                expect(rule.result[0]).to.eql('foo');

                done();
            });
        });
    });

    describe('audit.modules.bestPractices.hasntErrors', () => {
        const ruleName = 'hasntErrors';

        it('should succeed without any error', function (done) {
            const configObj = {
                projectId: 'test',
                projectName: 'Test',
                data: [{
                    src: ['<html><head></head><body></body></html>'],
                    type: 'content',
                    audits: [{
                        src: 'bestPractices',
                        ignore: allRules.filter(val => val !== ruleName)
                    }]
                }]
            };

            // We need some time for this one to be well tested...
            this.timeout(5000);

            run(configObj)
            .then(data => {
                const rule = data.bestPractices.filter(val => val.name === ruleName)[0];
                expect(rule.status).to.eql('passed');
                expect(rule.result).to.eql(true);

                done();
            })
            .catch(done);
        });

        it('should error with console errors', function (done) {
            const configObj = {
                projectId: 'test',
                projectName: 'Test',
                data: [{
                    src: ['<html><head></head><body><script>console.error("foo");</script></body></html>'],
                    type: 'content',
                    audits: [{
                        src: 'bestPractices',
                        ignore: allRules.filter(val => val !== ruleName)
                    }]
                }]
            };

            // We need some time for this one to be well tested...
            this.timeout(5000);

            run(configObj)
            .then(() => { done('It should\'ve errored'); })
            .catch(err => {
                const rule = err.bestPractices.filter(val => val.name === ruleName)[0];
                expect(rule.status).to.eql('failed');
                expect(rule.result).to.be.an('array');
                expect(rule.result.length).to.eql(1);
                expect(rule.result[0]).to.eql('foo');

                done();
            });
        });

        it('should error with throw errors', function (done) {
            const configObj = {
                projectId: 'test',
                projectName: 'Test',
                data: [{
                    src: ['<html><head></head><body><script>throw new Error("foo");</script></body></html>'],
                    type: 'content',
                    audits: [{
                        src: 'bestPractices',
                        ignore: allRules.filter(val => val !== ruleName)
                    }]
                }]
            };

            // We need some time for this one to be well tested...
            this.timeout(5000);

            run(configObj)
            .then(() => { done('It should\'ve errored'); })
            .catch(err => {
                const rule = err.bestPractices.filter(val => val.name === ruleName)[0];
                expect(rule.status).to.eql('failed');
                expect(rule.result).to.be.an('array');
                expect(rule.result.length).to.eql(1);
                expect(rule.result[0].message).to.contain('foo');

                done();
            });
        });
    });

    describe('audit.modules.bestPractices.hasJsVersion', () => {
        const ruleName = 'hasJsVersion';

        it('should success with type app.1234.js', function (done) {
            const configObj = {
                projectId: 'test',
                projectName: 'Test',
                data: [{
                    src: ['<html><head><script src="app.1234.js"></script></head><body></body></html>'],
                    type: 'content',
                    audits: [{
                        src: 'bestPractices',
                        ignore: allRules.filter(val => val !== ruleName)
                    }]
                }]
            };

            // We need some time for this one to be well tested...
            this.timeout(5000);

            run(configObj)
            .then(data => {
                const rule = data.bestPractices.filter(val => val.name === ruleName)[0];
                expect(rule.status).to.eql('passed');
                expect(rule.result).to.eql(true);

                done();
            })
            .catch(done);
        });

        it('should success with type app.js?v=1234', function (done) {
            const configObj = {
                projectId: 'test',
                projectName: 'Test',
                data: [{
                    src: ['<html><head><script src="app.js?v=1234"></script></head><body></body></html>'],
                    type: 'content',
                    audits: [{
                        src: 'bestPractices',
                        ignore: allRules.filter(val => val !== ruleName)
                    }]
                }]
            };

            // We need some time for this one to be well tested...
            this.timeout(5000);

            run(configObj)
            .then(data => {
                const rule = data.bestPractices.filter(val => val.name === ruleName)[0];
                expect(rule.status).to.eql('passed');
                expect(rule.result).to.eql(true);

                done();
            })
            .catch(done);
        });

        it('should success with type 123abc456def789ghi0123.js', function (done) {
            const configObj = {
                projectId: 'test',
                projectName: 'Test',
                data: [{
                    src: ['<html><head><script src="123abc456def789ghi0123.js"></script></head><body></body></html>'],
                    type: 'content',
                    audits: [{
                        src: 'bestPractices',
                        ignore: allRules.filter(val => val !== ruleName)
                    }]
                }]
            };

            // We need some time for this one to be well tested...
            this.timeout(5000);

            run(configObj)
            .then(data => {
                const rule = data.bestPractices.filter(val => val.name === ruleName)[0];
                expect(rule.status).to.eql('passed');
                expect(rule.result).to.eql(true);

                done();
            })
            .catch(done);
        });

        it('should error without version', function (done) {
            const configObj = {
                projectId: 'test',
                projectName: 'Test',
                data: [{
                    src: ['<html><head><script src="app.js"></script></head><body></body></html>'],
                    type: 'content',
                    audits: [{
                        src: 'bestPractices',
                        ignore: allRules.filter(val => val !== ruleName)
                    }]
                }]
            };

            // We need some time for this one to be well tested...
            this.timeout(5000);

            run(configObj)
            .then(() => { done('It should\'ve errored'); })
            .catch(err => {
                const rule = err.bestPractices.filter(val => val.name === ruleName)[0];
                expect(rule.status).to.eql('failed');
                expect(rule.result).to.eql('app.js');

                done();
            });
        });

        it('should ignore common safe scripts', function (done) {
            const configObj = {
                projectId: 'test',
                projectName: 'Test',
                data: [{
                    src: ['<html><head><script src="jquery.js"></script><script src="cdn/foo.js"></script></head><body></body></html>'],
                    type: 'content',
                    audits: [{
                        src: 'bestPractices',
                        ignore: allRules.filter(val => val !== ruleName)
                    }]
                }]
            };

            // We need some time for this one to be well tested...
            this.timeout(5000);

            run(configObj)
            .then(data => {
                const rule = data.bestPractices.filter(val => val.name === ruleName)[0];
                expect(rule.status).to.eql('passed');
                expect(rule.result).to.eql(true);

                done();
            })
            .catch(done);
        });
    });

    describe('audit.modules.bestPractices.hasCssVersion', () => {
        const ruleName = 'hasCssVersion';

        it('should success with type app.1234.css', function (done) {
            const configObj = {
                projectId: 'test',
                projectName: 'Test',
                data: [{
                    src: ['<html><head><link rel="stylesheet" href="app.1234.css"></head><body></body></html>'],
                    type: 'content',
                    audits: [{
                        src: 'bestPractices',
                        ignore: allRules.filter(val => val !== ruleName)
                    }]
                }]
            };

            // We need some time for this one to be well tested...
            this.timeout(5000);

            run(configObj)
            .then(data => {
                const rule = data.bestPractices.filter(val => val.name === ruleName)[0];
                expect(rule.status).to.eql('passed');
                expect(rule.result).to.eql(true);

                done();
            })
            .catch(done);
        });

        it('should success with type app.css?v=1234', function (done) {
            const configObj = {
                projectId: 'test',
                projectName: 'Test',
                data: [{
                    src: ['<html><head><link rel="stylesheet" href="app.css?v=1234"></head><body></body></html>'],
                    type: 'content',
                    audits: [{
                        src: 'bestPractices',
                        ignore: allRules.filter(val => val !== ruleName)
                    }]
                }]
            };

            // We need some time for this one to be well tested...
            this.timeout(5000);

            run(configObj)
            .then(data => {
                const rule = data.bestPractices.filter(val => val.name === ruleName)[0];
                expect(rule.status).to.eql('passed');
                expect(rule.result).to.eql(true);

                done();
            })
            .catch(done);
        });

        it('should success with type 123abc456def789ghi0123.css', function (done) {
            const configObj = {
                projectId: 'test',
                projectName: 'Test',
                data: [{
                    src: ['<html><head><link rel="stylesheet" href="123abc456def789ghi0123.css"></head><body></body></html>'],
                    type: 'content',
                    audits: [{
                        src: 'bestPractices',
                        ignore: allRules.filter(val => val !== ruleName)
                    }]
                }]
            };

            // We need some time for this one to be well tested...
            this.timeout(5000);

            run(configObj)
            .then(data => {
                const rule = data.bestPractices.filter(val => val.name === ruleName)[0];
                expect(rule.status).to.eql('passed');
                expect(rule.result).to.eql(true);

                done();
            })
            .catch(done);
        });

        it('should error without version', function (done) {
            const configObj = {
                projectId: 'test',
                projectName: 'Test',
                data: [{
                    src: ['<html><head><link rel="stylesheet" href="app.css"></head><body></body></html>'],
                    type: 'content',
                    audits: [{
                        src: 'bestPractices',
                        ignore: allRules.filter(val => val !== ruleName)
                    }]
                }]
            };

            // We need some time for this one to be well tested...
            this.timeout(5000);

            run(configObj)
            .then(() => { done('It should\'ve errored'); })
            .catch(err => {
                const rule = err.bestPractices.filter(val => val.name === ruleName)[0];
                expect(rule.status).to.eql('failed');
                expect(rule.result).to.eql('app.css');

                done();
            });
        });

        it('should ignore common safe styles', function (done) {
            const configObj = {
                projectId: 'test',
                projectName: 'Test',
                data: [{
                    src: ['<html><head><link rel="stylesheet" href="jquery.css"><link rel="stylesheet" href="cdn/foo.css"></head><body></body></html>'],
                    type: 'content',
                    audits: [{
                        src: 'bestPractices',
                        ignore: allRules.filter(val => val !== ruleName)
                    }]
                }]
            };

            // We need some time for this one to be well tested...
            this.timeout(5000);

            run(configObj)
            .then(data => {
                const rule = data.bestPractices.filter(val => val.name === ruleName)[0];
                expect(rule.status).to.eql('passed');
                expect(rule.result).to.eql(true);

                done();
            })
            .catch(done);
        });
    });
});
