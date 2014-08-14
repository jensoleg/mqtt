'use strict';

var request = require('request'),
    _ = require('lodash'),
    Device = require('./device.js'),
    operators = {
        lt: '<',
        lte: '<=',
        gt: '>',
        gte: '>=',
        eq: '=='
    };

// Initialize with reference to auth0 domains
function Triggers(connection) {

    this.handle = function (packet, client) {
        // parse topic
        var topics = packet.topic.split('/'),
            deviceId = topics[2],
            stream = topics[3],

            deviceModel = connection.model(client.domain, Device.schema, client.domain + '.devices');

        // find device
        deviceModel.findOne({id: deviceId}, function (error, device) {
            if (!error) {
                // any triggers ????
                var deviceDoc = device._doc,
                    index = 0,
                    doActivate;

                /* run through triggers and match stream topic */
                _.each(deviceDoc.triggers, function (trigger) {
                    var trigger = trigger._doc;
                    if (trigger.stream_id === stream) {

                        _.each(trigger.requests, function (httpRequest) {
                            // evaluate expression
                            doActivate = eval(packet.payload.toString() + operators[trigger.trigger_type] + trigger.threshold_value);

                            if (doActivate) {
                                if (deviceDoc.triggers[index].triggered_value === undefined) {
                                    device.triggers[index].triggered_value = packet.payload.toString();
                                    device.save(function (error) {
                                        if (!error) {
                                            // perform request
                                            request(httpRequest.request_options, function (error, response) {
                                            });
                                        }
                                    });
                                }
                            } else {
                                device.triggers[index].triggered_value = undefined;
                                device.save(function (error) {
                                });
                            }
                        });
                    }
                    index++;
                });
            }
        });
    };
}

Triggers.prototype.handle = function () {

    var self = this;

    return function (packet, client) {

        self.handle(packet, client, function (send, err) {
        });
    };
};

module.exports = Triggers;