# ThinkSpeak-Client for node.js
---

A client for updating and reading channels and fields on [ThingSpeak](http://www.thingspeak.com) or your own [ThingSpeak-Installation](https://github.com/iobridge/thingspeak).
The complete [Channels-Api](http://community.thingspeak.com/documentation/api/#thingspeak_api) is implemented.

## About ThingSpeak
ThingSpeak is an open source “Internet of Things” application and API to store and retrieve data from things using HTTP over the Internet or via a Local Area Network. With ThingSpeak,
you can create sensor logging applications, location tracking applications, and a social network of things with status updates.

## Install
```
$ npm install thingspeakclient
```

## Usage
The module is easy to use.

### First Steps

```
var ThingSpeakClient = require('thingspeakclient');
var client = new ThingSpeakClient();
```

#### Default-Server
The default ThinkSpeak-URL is ```https://api.thingspeak.com```. You can change this with:

```
var client = new ThingSpeakClient({server:'http://localhost:8000'});
```

### Attach a channel to the client
Attaching a channel is required if you want update a channel. If you want only read channels (private or public) it is not necessary to attach the channel. But attaching makes read-handling
easier. The attach method needs the channel-id and a write- or readkey or both for this channel. The ```callBack``` is optional.

Attach a channel with write- and readkey:
```
client.attachChannel(channelId, { writeKey:'yourWriteKey', readKey:'yourReadKey'}, callBack);
```
Attach a channel with only a writekey:
```
client.attachChannel(channelId, { writeKey:'yourWriteKey'}, callBack);
```
Attach a channel with only a key for reading:
```
client.attachChannel(channelId, { readKey:'yourReadKey'}, callBack);
```

### Updating a channel
The ```callBack``` is optional and give back ```error``` and ```response```. ```response``` is greater than 0 if update was successfully (sea ThinkSpeak-API for return value on update).
```
client.updateChannel(channelId, fields, callback);
```
Fields are an object with field and value. If you want update field 1 with a value of 7 and to field 2 with 5 use the following:
```
{field1: 7, field2: 5}
```
A complete example for updating channel 4711 with 7 on field1 and 6 on field2:
```
client.updateChannel(4711, {field1: 7, field2: 6}, function(err, resp) {
    if (!err && resp > 0) {
        console.log('update successfully. Entry number was: ' + resp);
    }
};
```

### Reading data
If you want read data you can use one of the following methods:
```
client.getChannelFeeds(channelId, query, callBack); - same as API-Method "Retrieving Channel Feeds"
client.getLastEntryInChannelFeed(channelId, query, callBack); - same as API-Method "Retrieving the Last Entry in Channel Feed"
client.getFieldFeed(channelId, fieldId, query, callback); - same as API-Method "Retrieving a Field Feed"
client.getLastEntryInFieldFeed(channelId, fieldId, query, callBack); - same as API-Method "Retrieving the Last Entry in a Field Feed"
client.getStatusUpdates(channelId, query, callBack); - same as API-Method "Retrieving Status Updates"
```
* ```channelId``` - the id of the channel
* ```fieldId``` - the field number, min: 1 and max: 8
* ```query``` - the optional parameters from api-description as key:value
* ```callBack``` - the optional callback with error and response, response is an integer (most of the time -1 on failure or an object with the requested data

All methods are using the json-request-url from the server. The response is not interpreted by the client at the moment and given as the second parameter to the callback.

### Other requests
```
client.listPublicChannels(query, callback); - same as API-Method "Listing Public Channels"
client.listUserInfo(user, query, callback); - same as API-Method "Listing User Information"
client.listUserChannels(user, query, callback); - same as API-Method "Listing a User’s Channels"
```

## Tests
The tests are using ```mocha```, ```should``` and ```sinon```.

## Licence
The licence is GPL v3 and the module is available at [Bitbucket](https://bitbucket.org/iwg/thingspeakclient_node) and [GitHub](https://github.com/imwebgefunden/thingspeakclient_node).