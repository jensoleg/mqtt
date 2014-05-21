var mosca = require('mosca')
    , Auth0Mosca = require('./extensions/auth0Mosca')
    , timeSeriesStore = require('ts-store')
    , MongoClient = require('mongodb').MongoClient
    , config = require('./config.json');

//provide a sensible default for local development
var mqtt_mongodb_connection_string = config.mqtt.dbConnection + config.mqtt.db;
//take advantage of openshift env vars when available:
if(process.env.OPENSHIFT_MONGODB_DB_URL){
    mqtt_mongodb_connection_string = process.env.OPENSHIFT_MONGODB_DB_URL + config.mqtt.db;
}

//provide a sensible default for local development
var ts_mongodb_connection_string = config.mqtt.dbConnection + config.tsstore.db;
//take advantage of openshift env vars when available:
if(process.env.OPENSHIFT_MONGODB_DB_URL){
    ts_mongodb_connection_string = process.env.OPENSHIFT_MONGODB_DB_URL + config.tsstore.db;
}

var server_port = process.env.OPENSHIFT_NODEJS_PORT || config.mqtt.httpPort;

MongoClient.connect(mqtt_mongodb_connection_string, {}, function (err, db) {

    var settings = {
        port: config.mqtt.port,
        logger: {
            level: config.mqtt.loglevel
        },
        persistence: {
            connection: db,
            factory: mosca.persistence.Mongo},
        http: {
            port: server_port,
            static: __dirname + "/static",
            bundle: true,
            stats: false
        },
        onlyHttp: false
    };

    var server = new mosca.Server(settings);

    if (config.auth0.enabled) {
        //auth0 connection where all user/devices are registered.
        var auth0 = new Auth0Mosca(config.auth0.endpoint, config.auth0.clientSecret);

        //Wire up authentication & authorization to mosca
        server.authenticate = auth0.authenticate();
        server.authorizePublish = auth0.authorizePublish();
        server.authorizeSubscribe = auth0.authorizeSubscribe();
    }

    // Wire up time series database
    var timeSeries = new timeSeriesStore({verbose: config.tsstore.verbose, db: ts_mongodb_connection_string});
    server.published = timeSeries.publish();

    server.on('clientConnected', function (client) {
        console.log('client connected', client.id);
    });

    server.on('published', function (packet, client) {
        if (client != undefined)
            console.log('Event Published: ' + packet.payload + ' Client :' + client.id);
    });

    server.on('ready', setup);

    // fired when the mqtt server is ready
    function setup() {
        console.log('Mosca server is up and running')
    }

});