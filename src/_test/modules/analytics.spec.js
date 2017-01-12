'use strict';
/* global describe it before after beforeEach afterEach Promise */

import { expect } from 'chai';
import { run } from '../../index.js';
import analyticsModule from '../../modules/analytics.js';

// --------------------------------
// Variables

const allRules = analyticsModule.rules.map(val => val.name);

// --------------------------------
// Functions

describe('audit.modules.analytics', () => {
    describe('audit.modules.analytics.hasGoogleAnalytics', () => {
        const ruleName = 'hasGoogleAnalytics';

        it('should success with tag google-analytics', function (done) {
            let tmpl = '<html><head></head><body>';
            tmpl += '<script>(function(i,s,o,g,r,a,m){i[\'GoogleAnalyticsObject\']=r;i[r]=i[r]||function(){';
            tmpl += '(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),';
            tmpl += 'm=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)';
            tmpl += '})(window,document,\'script\',\'https://www.google-analytics.com/analytics.js\',\'ga\');';
            tmpl += 'ga(\'create\', \'xx-xxxxxxxx-x\', \'auto\');';
            tmpl += 'ga(\'send\', \'pageview\');</script>';
            tmpl += '</body></html>';

            const configObj = {
                projectId: 'test',
                projectName: 'Test',
                data: [{
                    src: [tmpl],
                    type: 'content',
                    audits: [{
                        src: 'analytics',
                        ignore: allRules.filter(val => val !== ruleName)
                    }]
                }]
            };

            // We need some time for this one to be well tested...
            this.timeout(20000);

            run(configObj)
            .then(data => {
                const rule = data.analytics.filter(val => val.name === ruleName)[0];
                expect(rule.status).to.eql('passed');
                expect(rule.result).to.eql(true);

                done();
            })
            .catch(done);
        });

        it('should success with tag googletagmanager', function (done) {
            let tmpl = '<html><head></head><body>';
            tmpl += '<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({\'gtm.start\':';
            tmpl += 'new Date().getTime(),event:\'gtm.js\'});var f=d.getElementsByTagName(s)[0],';
            tmpl += 'j=d.createElement(s),dl=l!=\'dataLayer\'?\'&l=\'+l:\'\';j.async=true;j.src=';
            tmpl += '\'https://www.googletagmanager.com/gtm.js?id=\'+i+dl;f.parentNode.insertBefore(j,f);';
            tmpl += '})(window,document,\'script\',\'dataLayer\',\'xxx-xxxxxx\');</script>';
            tmpl += '</body></html>';

            const configObj = {
                projectId: 'test',
                projectName: 'Test',
                data: [{
                    src: [tmpl],
                    type: 'content',
                    audits: [{
                        src: 'analytics',
                        ignore: allRules.filter(val => val !== ruleName)
                    }]
                }]
            };

            // We need some time for this one to be well tested...
            this.timeout(20000);

            run(configObj)
            .then(data => {
                const rule = data.analytics.filter(val => val.name === ruleName)[0];
                expect(rule.status).to.eql('passed');
                expect(rule.result).to.eql(true);

                done();
            })
            .catch(done);
        });

        it('should error without tag', function (done) {
            const configObj = {
                projectId: 'test',
                projectName: 'Test',
                data: [{
                    src: ['<html><head></head><body></body></html>'],
                    type: 'content',
                    audits: [{
                        src: 'analytics',
                        ignore: allRules.filter(val => val !== ruleName)
                    }]
                }]
            };

            // We need some time for this one to be well tested...
            this.timeout(20000);

            run(configObj)
            .then(() => { done('It should\'ve errored'); })
            .catch(err => {
                const rule = err.analytics.filter(val => val.name === ruleName)[0];
                expect(rule.status).to.eql('failed');
                expect(rule.result).to.eql(false);

                done();
            });
        });
    });
});
