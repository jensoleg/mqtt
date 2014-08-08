var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var DeviceSchema = new Schema(
    {
        realm: String,
        name: String,
        id: String,
        location: {lat: Number, lng: Number},
        controls: [
            {
                id: String,
                name: String,
                //type: {
                //    type: { type: String }
                //},
                minValue: Number,
                maxValue: Number,
                minCritical: Number,
                maxCritical: Number
            }
        ],
        triggers: [
            {
                url: String,
                trigger_type: String,
                threshold_value: String,
                stream_id: String,
                triggered_value: String
            }
        ]
    }
);

module.exports = mongoose.model('Device', DeviceSchema);
