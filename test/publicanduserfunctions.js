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

describe('ThinkSpeakClient Get Status Update Tests', function() {
    var client = new ThingSpeakClient();
    var stub;

    before(function(done) {
        stub = sinon.stub(request, "get", function(reqData, cB) {
            if (_.isFunction(cB)) {
                cB(null, 'fakeResponse', {});
            };
        });
        client.attachChannel(222222, {
            'readKey': 'you'
        });
        client.attachChannel(123456, {
            'writeKey': 'you'
        }, done);
    });

    after(function(done) {
        stub.restore();
        done();
    });

    describe('publicFeeds Tests', function() {

        it('should make a call without a query', function(done) {
            client.listPublicChannels(function(err, response) {
                should(err).not.Error;
                stub.callCount.should.eql(1);
                var callArgs = stub.getCall(0).args[0];
                callArgs.should.have.property('uri', 'https://api.thingspeak.com/channels/public.json');
                callArgs.should.have.property('qs', null);
                callArgs.should.have.property('json', true);
                response.should.be.an.Object;
                done();
            });
        });

        it('should make a call with a query', function(done) {
            client.listPublicChannels({
                tag: 'temperature'
            }, function(err, response) {
                should(err).not.Error;
                stub.callCount.should.eql(2);
                var callArgs = stub.getCall(1).args[0];
                callArgs.should.have.property('uri', 'https://api.thingspeak.com/channels/public.json');
                callArgs.should.have.property('qs', {
                    tag: 'temperature'
                });
                callArgs.should.have.property('json', true);
                response.should.be.an.Object;
                done();
            });
        });
    });

    describe('Listing User Information Tests', function() {

        it('should give back an error without user name', function(done) {
            var callCountBefore = stub.callCount;
            client.listUserInfo(function(err, response) {
                stub.callCount.should.eql(callCountBefore);
                err.should.be.an.Error;
                err.message.should.be.eql('no user given for listUserInfo');
                done();
            });
        });

        it('should make a call without a query', function(done) {
            client.listUserInfo('hans', function(err, response) {
                should(err).not.Error;
                stub.callCount.should.eql(3);
                var callArgs = stub.getCall(2).args[0];
                callArgs.should.have.property('uri', 'https://api.thingspeak.com/users/hans.json');
                callArgs.should.have.property('qs', null);
                callArgs.should.have.property('json', true);
                response.should.be.an.Object;
                done();
            });
        });

        it('should make a call with a query', function(done) {
            client.listUserInfo('hans', {
                key: 'userKey'
            }, function(err, response) {
                should(err).not.Error;
                stub.callCount.should.eql(4);
                var callArgs = stub.getCall(3).args[0];
                callArgs.should.have.property('uri', 'https://api.thingspeak.com/users/hans.json');
                callArgs.should.have.property('qs', {
                    key: 'userKey'
                });
                callArgs.should.have.property('json', true);
                response.should.be.an.Object;
                done();
            });
        });
    });

    describe('Listing User Channel Tests', function() {

        it('should give back an error without user name', function(done) {
            var callCountBefore = stub.callCount;
            client.listUserChannels(function(err, response) {
                stub.callCount.should.eql(callCountBefore);
                err.should.be.an.Error;
                err.message.should.be.eql('no user given for listUserChannels');
                done();
            });
        });

        it('should make a call without a query', function(done) {
            client.listUserChannels('hans', function(err, response) {
                should(err).not.Error;
                stub.callCount.should.eql(5);
                var callArgs = stub.getCall(4).args[0];
                callArgs.should.have.property('uri', 'https://api.thingspeak.com/users/hans/channels.json');
                callArgs.should.have.property('qs', null);
                callArgs.should.have.property('json', true);
                response.should.be.an.Object;
                done();
            });
        });

        it('should make a call with a query', function(done) {
            client.listUserChannels('hans', {
                key: 'userKey'
            }, function(err, response) {
                should(err).not.Error;
                stub.callCount.should.eql(6);
                var callArgs = stub.getCall(5).args[0];
                callArgs.should.have.property('uri', 'https://api.thingspeak.com/users/hans/channels.json');
                callArgs.should.have.property('qs', {
                    key: 'userKey'
                });
                callArgs.should.have.property('json', true);
                response.should.be.an.Object;
                done();
            });
        });
    });

});
