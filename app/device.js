var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var DeviceSchema = new Schema(
    {
        updatedAt: {
            date: {type: Date},
            user: {type: String}
        },
        name: String,
        id: String,
        location: {lat: Number, lng: Number},
        controls: [
            {
                id: String,
                name: String,
                ctrltype: String,
                minValue: Number,
                maxValue: Number,
                minCritical: Number,
                maxCritical: Number,
                unit: {
                    symbol: String,
                    units: String
                }
            }
        ],
        triggers: [
            {
                url: String,
                trigger_type: { type: String, enum: ['lt', 'lte', 'gt', 'gte', 'eq'] },
                threshold_value: String,
                stream_id: String,
                triggered_value: String,
                resolution: { type: String, enum: ['sec', 'min', 'hour', 'day'] }
            }
        ]
    }
);


module.exports = mongoose.model('Device', DeviceSchema);