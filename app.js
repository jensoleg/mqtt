'use strict';

var mosca = require('mosca'),
    Auth0Mosca = require('auth0mosca'),
    TimeSeriesStore = require('ts-store'),
    mongoose = require('mongoose'),
    config = require('./config.json'),
    uriUtil = require('mongodb-uri'),
    Triggers = require('./app/triggers.js');

var options = {
    server: {
        socketOptions: {
            keepAlive: 1,
            connectTimeoutMS: 30000
        }
    }
};

var mongodbTSUri = config.tsstore.dbConnection + config.tsstore.db,
    mongooseTSUri = uriUtil.formatMongoose(mongodbTSUri),
    mongodbMqttUri = config.mqtt.dbConnection + config.mqtt.db,
    mongooseMqttUri = uriUtil.formatMongoose(mongodbMqttUri),
    mongodbBobbyUri = config.bobby.dbConnection + config.bobby.db,
    mongooseBobbyUri = uriUtil.formatMongoose(mongodbBobbyUri),
    MQTTconnection = mongoose.createConnection(mongooseMqttUri, options),
    TSconnection = mongoose.createConnection(mongooseTSUri, options),
    Bobbyconnection = mongoose.createConnection(mongooseBobbyUri, options);

var settings = {
        port: config.mqtt.port,
        logger: {
            level: config.mqtt.loglevel
        },
        persistence: {
            connection: MQTTconnection.db,
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
    console.log('client connected', client.id);
});

var triggers = new Triggers(Bobbyconnection);

server.on('published', function (packet, client) {
    if (client !== undefined) {
        console.log('Event Published: ' + packet.payload + ' Client :' + client.id);
        triggers.handle(packet, client, function (send, error) {
            if (error) {
                console.log('trigger failed: ', error);
            }
        });
    }
});

// fired when the mqtt server is ready
function setup() {
    console.log('Mosca server is up and running');
}

server.on('ready', setup);
