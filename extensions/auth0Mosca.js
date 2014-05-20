var request = require('request');
var jwt = require('jsonwebtoken');

function Auth0Mosca(auth0Namespace, clientSecret) {
    this.auth0Namespace = auth0Namespace;
    this.clientSecret = clientSecret;
}

Auth0Mosca.prototype.authenticate = function () {

    var self = this;

    return function (client, username, password, callback) {

        if (username !== 'JWT') {
            return callback("Invalid Credentials", false);
        }

        jwt.verify(password, new Buffer(self.clientSecret, 'base64'), function (err, profile) {
            if (err) {
                return callback("Error getting UserInfo", false);
            }
            client.deviceProfile = profile;
            return callback(null, true);
        });
    }
};

Auth0Mosca.prototype.authorizePublish = function () {

    return function (client, topic, payload, callback) {
        callback(null, true);
        // TODO implement topic match
        //callback(null, client.deviceProfile && client.deviceProfile.topics && client.deviceProfile.topics.indexOf(topic) > -1);
    }
};

Auth0Mosca.prototype.authorizeSubscribe = function () {

    return function (client, topic, callback) {
        callback(null, true);
        // TODO implement topic match
        //callback(null, client.deviceProfile && client.deviceProfile.topics && client.deviceProfile.topics.indexOf(topic) > -1);
    }
};

module.exports = Auth0Mosca;