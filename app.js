'use strict';

var mosca = require('mosca'),
    Auth0Mosca = require('auth0mosca'),
    TimeSeriesStore = require('ts-store'),
    mongoose = require('mongoose'),
    config = require('./config.json'),
    uriUtil = require('mongodb-uri');

var options = {
    server: {
        socketOptions: {
            keepAlive: 1,
            connectTimeoutMS: 30000
        }
    }
};

var mongodbTSUri = config.tsstore.dbConnection + config.tsstore.db + "?authMechanism=SCRAM-SHA-1",
    mongooseTSUri = uriUtil.formatMongoose(mongodbTSUri),
    mongodbMqttUri = config.mqtt.dbConnection + config.mqtt.db + "?authMechanism=SCRAM-SHA-1",
    TSconnection = mongoose.createConnection(mongooseTSUri, options);

var settings = {
        port: config.mqtt.port,
        logger: {
            level: config.mqtt.loglevel
        },
        persistence: {
            url: mongodbMqttUri,
            factory: mosca.persistence.Mongo
        },
        http: {
            port: config.mqtt.httpPort,
            static: __dirname + "/static",
            bundle: true,
            stats: true
        },
        onlyHttp: false
    },
    server = new mosca.Server(settings),
// Wire up time series database
    timeSeries = new TimeSeriesStore(TSconnection, {verbose: config.tsstore.verbose}),
    auth0 = new Auth0Mosca(config.domains);

if (config.enableAuth) {
    //Wire up authentication & authorization to mosca
    server.authenticate = auth0.authenticate();
    server.authorizePublish = auth0.authorizePublish();
    server.authorizeSubscribe = auth0.authorizeSubscribe();
}

//Wire up persistence to time series database
server.published = timeSeries.publish();

server.on('clientConnected', function (client) {
    console.log('client connected', client.id + ' ' + client.deviceProfile.name + ' at: ' + client.deviceProfile.domain);
});

server.on('published', function (packet, client) {
    if (client !== undefined) {
        console.log('Event Published: ' + packet.payload + ' Client :' + client.id);
    }
});


// fired when the mqtt server is ready
function setup() {
    console.log('Mosca server is up and running');
}

server.on('ready', setup);
