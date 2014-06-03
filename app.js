'use strict';

var mosca = require('mosca'),
    Auth0Mosca = require('auth0mosca'),
    timeSeriesStore = require('ts-store'),
    mongoose = require('mongoose'),
    config = require('./config.json'),
    uriUtil = require('mongodb-uri');

var options = {
    server: {
        socketOptions: {
            keepAlive: 1,
            connectTimeoutMS: 30000
        }
    },
    replset: {
        socketOptions: {
            keepAlive: 1,
            connectTimeoutMS: 30000
        }
    }
};

var mongodbUri = config.mqtt.dbConnection + config.mqtt.db,
    mongooseUri = uriUtil.formatMongoose(mongodbUri);

mongoose.connect(mongooseUri, options);
var conn = mongoose.connection;

conn.on('error', console.error.bind(console, 'connection error:'));

conn.once('open', function () {
    // Wait for the database connection to establish, then start the app.

    var settings = {
            port: config.mqtt.port,
            logger: {
                level: config.mqtt.loglevel
            },
            persistence: {
                connection: conn.db,
                factory: mosca.persistence.Mongo},
            http: {
                port: config.mqtt.httpPort,
                static: __dirname + "/static",
                bundle: true,
                stats: false
            },
            onlyHttp: false
        },
        server = new mosca.Server(settings),
    // Wire up time series database
        timeSeries = new TimeSeriesStore({verbose: config.tsstore.verbose}),
        auth0 = new Auth0Mosca(config.domains);

    if (config.enableAuth) {
        //Wire up authentication & authorization to mosca
        server.authenticate = auth0.authenticate();
        server.authorizePublish = auth0.authorizePublish();
        server.authorizeSubscribe = auth0.authorizeSubscribe();
    }

    server.published = timeSeries.publish();

    server.on('clientConnected', function (client) {
        console.log('client connected', client.id);
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

});