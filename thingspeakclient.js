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
"use strict";

var util = require('util');
var events = require('events');
var request = require('request');
var _ = require('underscore');
var async = require('async');

var defaultOptions = {
    server: 'https://api.thingspeak.com',
    useTimeoutMode: true,
    updateTimeout: 15000
};

/**
 * Client-Constructor
 * @param opts
 * @constructor
 */
var ThingSpeakClient = function(opts) {
    var self = this;
    events.EventEmitter.call(this);
    self.options = _.extend({}, defaultOptions, opts);
    self.channels = {};
};

util.inherits(ThingSpeakClient, events.EventEmitter);

/**
 * add a new channel to the client
 * @param channelId
 * @param {Object} keys - writeKey, readKey
 * @param callback
 */
ThingSpeakClient.prototype.attachChannel = function(channelId, keys, callback) {
    var self = this;
    var err = null;
    var data = {};

    if (!_.isNumber(channelId)) {
        err = new Error('no channel id for attach channel');
        if (_.isFunction(channelId)) {
            callback = channelId;
        }
    }

    if (!err) {
        if (_.isObject(keys) && (!_.isFunction(keys))) {
            if ((!_.has(keys, 'writeKey')) && (!_.has(keys, 'readKey'))) {
                err = new Error('writeKey or readKey not given for attach channel');
            } else {
                data = keys;
                self.channels[channelId] = data;
                // create a queue for update requests
                if (self.options.useTimeoutMode) {
                    self.channels[channelId].updateQueue = async.queue(function(task, callback) {
                        request.post({
                            url: task.url,
                            form: task.form,
                            headers: task.headers
                        }, function(err, response, body) {
                            if ((!err) && (body > 0)) {
                                self.channels[task.id].lastUpdate = +new Date();
                            }
                            if (_.isFunction(task.cB)) {
                                task.cB(err, body);
                            }
                        });
                        setTimeout(callback, self.options.updateTimeout);
                    }, 1);
                }
            }
        } else {
            err = new Error('no keys given for attach channel');
            if (_.isFunction(keys)) {
                callback = keys;
            }
        }
    }

    if (_.isFunction(callback)) {
        callback(err);
    }
};

/**
 * update a single channel with field-values
 * @param id
 * @param fields
 * @param callback
 */
ThingSpeakClient.prototype.updateChannel = function(id, fields, callback) {
    var self = this;
    var url = self.options.server + '/update';
    var data;

    if (_.isFunction(id)) {
        // no id is given - id is a callback
        id(new Error('no channel id given for update'));
        return;
    }

    if (_.isFunction(fields)) {
        // no fields given - fields is a callback
        fields(new Error('no fields given for update'));
        return;
    }

    if (!_.has(self.channels, id)) {
        // check if the channel is attached
        if (_.isFunction(callback)) {
            callback(new Error('channel id unknown/not attached'));
        }
        return;
    } else {
        // check or write key
        if (!_.has(self.channels[id], 'writeKey')) {
            // check if the channel is attached
            if (_.isFunction(callback)) {
                callback(new Error('no writeKey for update'));
            }
            return;
        }
    }

    if (!_.isObject(fields)) {
        if (_.isFunction(callback)) {
            callback(new Error('fields for update not an object'));
        }
        return;
    } else {
        data = fields;
    }

    if (self.options.useTimeoutMode) {
        self.channels[id].updateQueue.push({
            id: id,
            url: url,
            form: data,
            headers: {
                'X-THINGSPEAKAPIKEY': self.channels[id].writeKey
            },
            cB: callback
        });
    } else {
        request.post({
            url: url,
            form: data,
            headers: {
                'X-THINGSPEAKAPIKEY': self.channels[id].writeKey
            }
        }, function(err, response, body) {
            if ((!err) && (body > 0)) {
                self.channels[id].lastUpdate = +new Date();
            }
            if (_.isFunction(callback)) {
                callback(err, body);
            }
        });
    }
};

/**
 * Retrieving Channel Feeds
 * @param id
 * @param query
 * @param callback
 */
ThingSpeakClient.prototype.getChannelFeeds = function(id, query, callback) {
    var self = this;
    var url = self.options.server + '/channels/';

    // query are optional
    if (_.isFunction(query)) {
        callback = query;
        query = null;
    }

    if (!_.isNumber(id)) {
        if (_.isFunction(callback)) {
            callback(new Error('no channel id given for getChannelFeeds'));
        }
        return;
    }

    url += id + '/feed.json';

    if ((_.has(self.channels, id)) && (_.isString(self.channels[id].readKey))) {
        // private attached channel
        if (!_.isObject(query)) {
            query = {};
        }
        query.key = self.channels[id].readKey;
    }

    request.get({
        uri: url,
        qs: query,
        json: true
    }, function(err, response, body) {
        //console.log(response)
        if (_.isFunction(callback)) {
            callback(err, body);
        }
    });
};

/**
 * Retrieving the Last Entry in Channel Feed
 * @param id
 * @param query
 * @param callback
 */
ThingSpeakClient.prototype.getLastEntryInChannelFeed = function(id, query, callback) {
    var self = this;
    var url = self.options.server + '/channels/';

    // query are optional
    if (_.isFunction(query)) {
        callback = query;
        query = null;
    }

    if (!_.isNumber(id)) {
        if (_.isFunction(callback)) {
            callback(new Error('no channel id given for getLastEntryInChannelFeed'));
        }
        return;
    }

    url += id + '/feed/last.json';

    if ((_.has(self.channels, id)) && (_.isString(self.channels[id].readKey))) {
        // private attached channel
        if (!_.isObject(query)) {
            query = {};
        }
        query.key = self.channels[id].readKey;
    }

    request.get({
        uri: url,
        qs: query,
        json: true
    }, function(err, response, body) {
        if (_.isFunction(callback)) {
            callback(err, body);
        }
    });
};

/**
 * Retrieving a Field Feed
 * @param id
 * @param field
 * @param query
 * @param callback
 */
ThingSpeakClient.prototype.getFieldFeed = function(id, field, query, callback) {
    var self = this;
    var url = self.options.server + '/channels/';

    // query are optional
    if (_.isFunction(query)) {
        callback = query;
        query = null;
    }

    if (!_.isNumber(id)) {
        if (_.isFunction(callback)) {
            callback(new Error('no channel id given for getFieldFeed'));
        }
        return;
    }

    if (_.contains([1, 2, 3, 4, 5, 6, 7, 8], field)) {
        url += id + '/field/' + field + '.json';
    } else {
        if (_.isFunction(callback)) {
            callback(new Error('field id is out of range'));
        }
        return;
    }

    if ((_.has(self.channels, id)) && (_.isString(self.channels[id].readKey))) {
        // private attached channel
        if (!_.isObject(query)) {
            query = {};
        }
        query.key = self.channels[id].readKey;
    }

    request.get({
        uri: url,
        qs: query,
        json: true
    }, function(err, response, body) {
        //console.log(response)
        if (_.isFunction(callback)) {
            callback(err, body);
        }
    });
};

/**
 * Retrieving the Last Entry in a Field Feed
 * @param id
 * @param field
 * @param query
 * @param callback
 */
ThingSpeakClient.prototype.getLastEntryInFieldFeed = function(id, field, query, callback) {
    var self = this;
    var url = self.options.server + '/channels/';

    // query are optional
    if (_.isFunction(query)) {
        callback = query;
        query = null;
    }

    if (!_.isNumber(id)) {
        if (_.isFunction(callback)) {
            callback(new Error('no channel id given for getLastEntryInFieldFeed'));
        }
        return;
    }

    if (_.contains([1, 2, 3, 4, 5, 6, 7, 8], field)) {
        url += id + '/field/' + field + '/last.json';
    } else {
        if (_.isFunction(callback)) {
            callback(new Error('field id is out of range'));
        }
        return;
    }

    if ((_.has(self.channels, id)) && (_.isString(self.channels[id].readKey))) {
        // private attached channel
        if (!_.isObject(query)) {
            query = {};
        }
        query.key = self.channels[id].readKey;
    }

    request.get({
        uri: url,
        qs: query,
        json: true
    }, function(err, response, body) {
        //console.log(response)
        if (_.isFunction(callback)) {
            callback(err, body);
        }
    });
};

/**
 * Retrieving Status Updates
 * @param id
 * @param query
 * @param callback
 */
ThingSpeakClient.prototype.getStatusUpdates = function(id, query, callback) {
    var self = this;
    var url = self.options.server + '/channels/';

    // query are optional
    if (_.isFunction(query)) {
        callback = query;
        query = null;
    }

    if (!_.isNumber(id)) {
        if (_.isFunction(callback)) {
            callback(new Error('no channel id given for getStatusUpdates'));
        }
        return;
    }

    url += id + '/status.json';

    if ((_.has(self.channels, id)) && (_.isString(self.channels[id].readKey))) {
        // private attached channel
        if (!_.isObject(query)) {
            query = {};
        }
        query.key = self.channels[id].readKey;
    }

    request.get({
        uri: url,
        qs: query,
        json: true
    }, function(err, response, body) {
        if (_.isFunction(callback)) {
            callback(err, body);
        }
    });
};

/**
 * Listing Public Channels
 * @param query
 * @param callback
 */
ThingSpeakClient.prototype.listPublicChannels = function(query, callback) {
    var self = this;
    var url = self.options.server + '/channels/public.json';

    // query are optional
    if (_.isFunction(query)) {
        callback = query;
        query = null;
    }

    request.get({
        uri: url,
        qs: query,
        json: true
    }, function(err, response, body) {
        if (_.isFunction(callback)) {
            callback(err, body);
        }
    });
};

/**
 * Listing User Information
 * @param user
 * @param query
 * @param callback
 */
ThingSpeakClient.prototype.listUserInfo = function(user, query, callback) {
    var self = this;
    var url = self.options.server;

    // query are optional
    if (_.isFunction(query)) {
        callback = query;
        query = null;
    }

    if (!_.isString(user)) {
        if (_.isFunction(callback)) {
            callback(new Error('no user given for listUserInfo'));
        } else if (_.isFunction(user)) {
            user(new Error('no user given for listUserInfo'));
        }
        return;
    }

    url += '/users/' + user + '.json';

    request.get({
        uri: url,
        qs: query,
        json: true
    }, function(err, response, body) {
        if (_.isFunction(callback)) {
            callback(err, body);
        }
    });
};

/**
 * Listing a User’s Channels
 * @param user
 * @param query
 * @param callback
 */
ThingSpeakClient.prototype.listUserChannels = function(user, query, callback) {
    var self = this;
    var url = self.options.server;

    // query are optional
    if (_.isFunction(query)) {
        callback = query;
        query = null;
    }

    if (!_.isString(user)) {
        if (_.isFunction(callback)) {
            callback(new Error('no user given for listUserChannels'));
        } else if (_.isFunction(user)) {
            user(new Error('no user given for listUserChannels'));
        }
        return;
    }

    url += '/users/' + user + '/channels.json';

    request.get({
        uri: url,
        qs: query,
        json: true
    }, function(err, response, body) {
        if (_.isFunction(callback)) {
            callback(err, body);
        }
    });
};

module.exports = ThingSpeakClient;
