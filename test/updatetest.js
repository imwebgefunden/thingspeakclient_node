/*
 * This file is part of thingspeakclient for node.
 *
 * Copyright (C) Thomas Schneider, imwebgefunden@gmail.com
 *
 * thingspeakclient for node is free software: you can redistribute it
 * and/or modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation, either version 3 of
 * the License, or (at your option) any later version.
 *
 * thingspeakclient for node is distributed in the hope that it will be
 * useful, but WITHOUT ANY WARRANTY; without even the implied warranty
 * of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with thingspeakclient for node. If not, see
 * <http://www.gnu.org/licenses/>.
 */

/* jslint node: true */
/* jshint node:true */
/* global describe, it, before, beforeEach, after, afterEach */
/* jshint expr: true, ok */

"use strict";

var sinon = require('sinon');
var should = require('should');
var request = require('request');
var _ = require('underscore');
var ThingSpeakClient = require('../thingspeakclient');
var stub = sinon.stub(request, "post", function(reqData, cB) {
    // console.log(reqData);
    var res = 0;
    if (_.has(reqData.form, 'status')) {
        res = 7;
    }
    if (_.isFunction(cB)) {
        cB(null, 'fakeResponse', res);
    };
});

describe('ThinkSpeakClient Channel Update Tests', function() {
    describe('check necessary information for an update call', function() {
        var client = new ThingSpeakClient();

        before(function(done) {
            client.attachChannel(123456, {
                'writeKey': 'you'
            }, done);
        });

        after(function(done) {
            done();
        });

        it('should give an error without a channel', function(done) {
            client.updateChannel(function(err, response) {
                err.should.be.an.Error;
                err.message.should.be.eql('no channel id given for update');
                stub.callCount.should.eql(0);
                done();
            });
        });

        it('should give an error if the channel is not attached/unknown', function(done) {
            client.updateChannel(12345, {}, function(err, response) {
                err.should.be.an.Error;
                err.message.should.be.eql('channel id unknown/not attached');
                stub.callCount.should.eql(0);
                done();
            });
        });

        it('should give an error without update fields', function(done) {
            client.updateChannel(123456, function(err, response) {
                err.should.be.an.Error;
                err.message.should.be.eql('no fields given for update');
                stub.callCount.should.eql(0);
                done();
            });
        });

    });

    describe('isolated check without writeKey on update call', function() {
        var client = new ThingSpeakClient();

        before(function(done) {
            client.attachChannel(123456, {
                'readKey': 'you'
            }, done);
        });

        after(function(done) {
            done();
        });

        it('should give an error without writeKey', function(done) {
            client.updateChannel(123456, {
                'status': 'live'
            }, function(err, response) {
                err.should.be.an.Error;
                err.message.should.be.eql('no writeKey for update');
                stub.callCount.should.eql(0);
                done();
            });
        });
    });

    describe('successfully update call in useTimeoutMode false', function() {
        var client = new ThingSpeakClient({
            useTimeoutMode: false
        });

        before(function(done) {
            client.attachChannel(123456, {
                'writeKey': 'you'
            }, done);
        });

        after(function(done) {
            done();
        });

        it('should give 0 if update was not successfully', function(done) {
            client.updateChannel(123456, {
                '_status_': 'live'
            }, function(err, response) {
                should(err).not.Error;
                stub.callCount.should.eql(1);
                var callArgs = stub.getCall(0).args[0];
                callArgs.should.have.property('url', 'https://api.thingspeak.com/update');
                callArgs.should.have.property('form', {
                    _status_: 'live'
                });
                callArgs.should.have.property('headers', {
                    'X-THINGSPEAKAPIKEY': 'you'
                });
                response.should.be.a.Number.and.eql(0);
                done();
            });
        });

        it('should give an value greater than 0 if update was successfully', function(done) {
            client.updateChannel(123456, {
                'status': 'live'
            }, function(err, response) {
                should(err).not.Error;
                stub.callCount.should.eql(2);
                var callArgs = stub.getCall(1).args[0];
                callArgs.should.have.property('url', 'https://api.thingspeak.com/update');
                callArgs.should.have.property('form', {
                    status: 'live'
                });
                callArgs.should.have.property('headers', {
                    'X-THINGSPEAKAPIKEY': 'you'
                });
                response.should.be.a.Number.and.greaterThan(0).and.eql(7);
                done();
            });
        });
    });

    describe('successfully update call in useTimeoutMode true', function() {
        // because async.queue can't be tested with simon fakeTimers we have to go another way :(
        var client = new ThingSpeakClient({
            updateTimeout: 500
        });

        before(function(done) {
            client.attachChannel(123456, {
                'writeKey': 'you'
            });
            done();

        });

        after(function(done) {
            done();
        });

        it('should give an value greater than 0 if update was successfully', function(done) {
            var firstCallTime;
            client.updateChannel(123456, {
                'status': 'live'
            }, function(err, response) {
                firstCallTime = client.channels[123456].lastUpdate;
                should(err).not.Error;
                stub.callCount.should.eql(3);
                var callArgs = stub.getCall(2).args[0];
                callArgs.should.have.property('url', 'https://api.thingspeak.com/update');
                callArgs.should.have.property('form', {
                    status: 'live'
                });
                callArgs.should.have.property('headers', {
                    'X-THINGSPEAKAPIKEY': 'you'
                });
                response.should.be.a.Number.and.greaterThan(0).and.eql(7);
            });
            // now make the second call
            client.channels[123456].updateQueue.length().should.eql(1); // the first call is in progress
            client.updateChannel(123456, {
                'status': 'update'
            }, function(err, response) {
                var timeDiff = client.channels[123456].lastUpdate - firstCallTime;
                timeDiff.should.be.greaterThan(500);
                //console.log(timeDiff);
                should(err).not.Error;
                stub.callCount.should.eql(4);
                var callArgs = stub.getCall(3).args[0];
                callArgs.should.have.property('url', 'https://api.thingspeak.com/update');
                callArgs.should.have.property('form', {
                    status: 'update'
                });
                callArgs.should.have.property('headers', {
                    'X-THINGSPEAKAPIKEY': 'you'
                });
                response.should.be.a.Number.and.greaterThan(0).and.eql(7);
                done();
            });
        });
    });

});
