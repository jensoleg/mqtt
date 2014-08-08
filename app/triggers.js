'use strict';

var request = require('request'),
    _ = require('lodash'),
    Device = require('./device.js'),
    triggerApi = {
        url: undefined,
        method: undefined
    },
    operators = {
        lt: '<',
        lte: '<=',
        gt: '>',
        gte: '>=',
        eq: '=='
    };

// Initialize with reference to auth0 domains
function Triggers(connection) {

//    var deviceModel = connection.model(runOptions.options.realm, Device.schema, runOptions.options.realm + '.devices');
    var deviceModel = connection.model('decoplant', Device.schema, 'decoplant.devices');

    this.handle = function (packet, client, callback) {
        // parse topic
        var topics = packet.topic.split('/'),
            deviceId = topics[2],
            stream = topics[3];

        // find device
        deviceModel.findOne({id: deviceId}, function (error, device) {
            if (!error) {
                // any triggers ????
                var deviceDoc = device._doc,
                    trigger,
                    index,
                    doActivate;

                if (deviceDoc.triggers) {
                    index = _.findIndex(deviceDoc.triggers, function (trigger) {
                        return trigger.stream_id === stream;
                    });
                    if (index >= 0) {
                        trigger = deviceDoc.triggers[index];
                    }
                }

                if (!trigger) {
                    callback(false, null);
                } else {

                    // find last value in ts store




                    // evaluate expression
                    doActivate = eval(packet.payload.toString() + operators[trigger.trigger_type] + trigger.threshold_value);

                    if (doActivate) {
                        if (deviceDoc.triggers[index].triggered_value === undefined) {
                            device.triggers[index].triggered_value = packet.payload.toString();
                            device.save(function (error) {
                                if (!error) {
                                    // perform request
                                    var triggerUrl = trigger.url.replace("{device}", deviceDoc.name);
                                    triggerApi.url = triggerUrl.replace("{value}", packet.payload.toString());
                                    triggerApi.method = 'POST';
                                    request(triggerApi, function (error, response) {
                                        if (!error && response.statusCode === 200) {
                                            callback(true, null);
                                        } else {
                                            callback(false, error);
                                        }
                                    });
                                } else {
                                    return callback(false, error);
                                }
                            });
                        }
                    } else {
                        device.triggers[index].triggered_value = undefined;
                        device.save(function (error) {
                            return callback(false, error);
                        });
                    }
                }
            }
        });
    };
}

Triggers.prototype.handle = function () {

    var self = this;

    return function (packet, client, callback) {

        self.handle(packet, client, function (send, err) {
            return callback(send, err);
        });
    };
};

module.exports = Triggers;