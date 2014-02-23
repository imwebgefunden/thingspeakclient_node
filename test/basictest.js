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
var ThingSpeakClient = require('../thingspeakclient');

describe('ThinkSpeakClient Basic Tests', function() {
    describe('create a new client', function() {

        before(function(done) {
            done();
        });

        after(function(done) {
            done();
        });

        it('should use the default server with https if no other options is given', function() {
            var client = new ThingSpeakClient();
            client.options.should.have.property('server', 'https://api.thingspeak.com');
        });

        it('should use the server from options', function() {
            var client = new ThingSpeakClient({
                server: 'http://localhost'
            });
            client.options.should.have.property('server', 'http://localhost');
        });
    });

    describe('attach a channel to the client', function() {
        var client;

        before(function(done) {
            client = new ThingSpeakClient();
            done();
        });

        after(function(done) {
            done();
        });

        it('should give an error without a channel id', function(done) {
            client.attachChannel(function(err) {
                err.should.be.an.Error;
                err.message.should.be.eql('no channel id for attach channel');
                done();
            });
        });

        it('should give an error without keys', function(done) {
            client.attachChannel(123456, function(err) {
                err.should.be.an.Error;
                err.message.should.be.eql('no keys given for attach channel');
                done();
            });
        });

        it('should give an error with empty keys object', function(done) {
            client.attachChannel(123456, {}, function(err) {
                err.should.be.an.Error;
                err.message.should.be.eql('writeKey or readKey not given for attach channel');
                done();
            });
        });

        it('should give an error without write or read key', function(done) {
            client.attachChannel(123456, {
                'me': 'you',
                'you': 'me'
            }, function(err) {
                err.should.be.an.Error;
                err.message.should.be.eql('writeKey or readKey not given for attach channel');
                done();
            });
        });

        it('should give no error with only writeKey', function(done) {
            client.attachChannel(123456, {
                'writeKey': 'you',
                'you': 'me'
            }, function(err) {
                should(err).not.Error;
                client.channels.should.have.property('123456');
                client.channels['123456'].should.have.property('writeKey', 'you');
                done();
            });
        });

        it('should give no error with only readKey', function(done) {
            client.attachChannel(123456, {
                'readKey': 'you',
                'you': 'me'
            }, function(err) {
                should(err).not.Error;
                client.channels.should.have.property('123456');
                client.channels['123456'].should.have.property('readKey', 'you');
                done();
            });
        });

        it('should give no error with writeKey and readKey', function(done) {
            client.attachChannel(123456, {
                'writeKey': 'you',
                'readKey': 'me'
            }, function(err) {
                should(err).not.Error;
                client.channels.should.have.property('123456');
                client.channels['123456'].should.have.property('writeKey', 'you');
                client.channels['123456'].should.have.property('readKey', 'me');
                done();
            });
        });
    });

});
