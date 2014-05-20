var mongoose = require('mongoose');
var MTI = require('mongoose-ts');

mongoose.connect('mongodb://localhost/mydb', {
    db: {
        native_parser: false
    },
    server: {
        poolSize: 5
    }
});


//Init timeseries schema and register it to mongoose
mti = new MTI('mycol', {interval: 1});

// Push new data to collection
//mti.push(new Date(), 20.15, false /*metadata*/, {} /*extra conditions for doc find*/, function (err, ok) {});

var i = 0;
//mti.push(new Date(), i, true, {}, function(err, docs){});
var timer;

setTimeout(function () {

    timer = setInterval(function () {
        mti.push(new Date(), i += 1, false, {}, function (err, docs) {
            if (err) {
                console.log(err);
            }
            //if(docs) console.log('saved');
        });
    }, 1000);

    setTimeout(function () {
        if (timer) {
            clearTimeout(timer);
            timer = 0;
        }
    }, 115000);
}, 11000);

/** Find data of given period: */
var format = 'hash'
//var format = '[x,y]'
//var format = '[ms,y]'

mti.findData({
        from: new Date(new Date() - 1000 * 60 * 60 * 24 * 2), to: new Date() + 1000 * 60 * 60 * 24 * 2,
        condition: {},
        interval: 1,
        format: format},
    function (error, data) {
        if (error)console.log(error);
        else console.log('Events: ', data);
    });

mti.findData({
        from: new Date(new Date() - 1000 * 60 * 60 * 24 * 2), to: new Date() + 1000 * 60 * 60 * 24 * 2,
        condition: {},
        interval: 60,
        format: format},
    function (error, data) {
        if (error)console.log(error);
        else console.log('Events minutes: ', data);
    });

mti.findData({
        from: new Date(new Date() - 1000 * 60 * 60 * 24 * 2), to: new Date() + 1000 * 60 * 60 * 24 * 2,
        condition: {},
        interval: 3600,
        format: format},
    function (error, data) {
        if (error)console.log(error);
        else console.log('Events hourly: ', data);
    });


mti.findMin({from: new Date(2013, 6, 16),
    to: new Date(2014, 5, 15)
}, function (e, min) {
    console.log('min: ', min);
});

mti.findMax({from: new Date(2013, 6, 16),
    to: new Date(2014, 5, 15)
}, function (e, max) {
    console.log('max: ', max);
});

