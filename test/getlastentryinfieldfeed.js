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

describe('ThinkSpeakClient Get Last Entry in Field Feed Tests', function() {
    var client = new ThingSpeakClient();
    var stub;

    before(function(done) {
        stub = sinon.stub(request, "get", function(reqData, cB) {
            //console.log(reqData);
            var res = -1;
            if (reqData.uri === 'https://api.thingspeak.com/channels/654321/field/1/last.json') {
                res = {
                    created_at: '2014-02-23T16:37:22Z',
                    entry_id: 2,
                    field1: '7'
                };
            }
            if (reqData.uri === 'https://api.thingspeak.com/channels/222222/field/1/last.json') {
                res = {
                    created_at: '2014-02-23T16:37:22Z',
                    entry_id: 2,
                    field1: '7'
                };
            }
            if (_.isFunction(cB)) {
                cB(null, 'fakeResponse', res);
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

    it('should give an error if the channel id is not a number', function(done) {
        client.getLastEntryInFieldFeed('abcd', 1, function(err, response) {
            err.should.be.an.Error;
            err.message.should.be.eql('no channel id given for getLastEntryInFieldFeed');
            stub.callCount.should.eql(0);
            done();
        });
    });

    it('should give an error if the field id is not a number', function(done) {
        client.getLastEntryInFieldFeed(654321, 'a', function(err, response) {
            err.should.be.an.Error;
            err.message.should.be.eql('field id is out of range');
            stub.callCount.should.eql(0);
            done();
        });
    });

    it('should give an error if the field id is lesser than 1', function(done) {
        client.getLastEntryInFieldFeed(654321, 0, function(err, response) {
            err.should.be.an.Error;
            err.message.should.be.eql('field id is out of range');
            stub.callCount.should.eql(0);
            done();
        });
    });

    it('should give an error if the field id is greater than 8', function(done) {
        client.getLastEntryInFieldFeed(654321, 9, function(err, response) {
            err.should.be.an.Error;
            err.message.should.be.eql('field id is out of range');
            stub.callCount.should.eql(0);
            done();
        });
    });


    it('should make a call without a query on an unattached channel', function(done) {
        client.getLastEntryInFieldFeed(654321, 1, function(err, response) {
            should(err).not.Error;
            stub.callCount.should.eql(1);
            var callArgs = stub.getCall(0).args[0];
            callArgs.should.have.property('uri', 'https://api.thingspeak.com/channels/654321/field/1/last.json');
            callArgs.should.have.property('qs', null);
            callArgs.should.have.property('json', true);
            response.should.be.an.Object;
            done();
        });
    });

    it('should make a call without a query on an attached channel without existing readKey and get back -1 (unauthorized)', function(done) {
        client.getLastEntryInFieldFeed(123456, 1, function(err, response) {
            should(err).not.Error;
            stub.callCount.should.eql(2);
            var callArgs = stub.getCall(1).args[0];
            callArgs.should.have.property('uri', 'https://api.thingspeak.com/channels/123456/field/1/last.json');
            callArgs.should.have.property('qs', null);
            callArgs.should.have.property('json', true);
            response.should.be.not.an.Object;
            response.should.be.a.Number.and.eql(-1);
            done();
        });
    });

    it('should make a call without a query on an attached channel with readKey and get back an object', function(done) {
        client.getLastEntryInFieldFeed(222222, 1, function(err, response) {
            should(err).not.Error;
            stub.callCount.should.eql(3);
            var callArgs = stub.getCall(2).args[0];
            callArgs.should.have.property('uri', 'https://api.thingspeak.com/channels/222222/field/1/last.json');
            callArgs.should.have.property('qs', {
                key: 'you'
            });
            callArgs.should.have.property('json', true);
            response.should.be.an.Object;
            done();
        });
    });

    it('should make a call with a query on an unattached channel', function(done) {
        client.getLastEntryInFieldFeed(654321, 1, {
            status: true
        }, function(err, response) {
            should(err).not.Error;
            stub.callCount.should.eql(4);
            var callArgs = stub.getCall(3).args[0];
            callArgs.should.have.property('uri', 'https://api.thingspeak.com/channels/654321/field/1/last.json');
            callArgs.should.have.property('qs', {
                status: true
            });
            callArgs.should.have.property('json', true);
            response.should.be.an.Object;
            done();
        });
    });

    it('should make a call with a query on an attached channel without existing readKey and get back -1 (unauthorized)', function(done) {
        client.getLastEntryInFieldFeed(123456, 1, {
            status: true
        }, function(err, response) {
            should(err).not.Error;
            stub.callCount.should.eql(5);
            var callArgs = stub.getCall(4).args[0];
            callArgs.should.have.property('uri', 'https://api.thingspeak.com/channels/123456/field/1/last.json');
            callArgs.should.have.property('qs', {
                status: true
            });
            callArgs.should.have.property('json', true);
            response.should.be.not.an.Object;
            response.should.be.a.Number.and.eql(-1);
            done();
        });
    });

    it('should make a call with a query on an attached channel with readKey and get back an object', function(done) {
        client.getLastEntryInFieldFeed(222222, 1, {
            status: true
        }, function(err, response) {
            should(err).not.Error;
            stub.callCount.should.eql(6);
            var callArgs = stub.getCall(5).args[0];
            callArgs.should.have.property('uri', 'https://api.thingspeak.com/channels/222222/field/1/last.json');
            callArgs.should.have.property('qs', {
                key: 'you',
                status: true
            });
            callArgs.should.have.property('json', true);
            response.should.be.an.Object;
            done();
        });
    });
});
