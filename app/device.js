var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Mixed = mongoose.Schema.Types.Mixed;

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
                ctrlType: String,
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
                request: [
                    {request_options: Schema.Types.Mixed}
                ],
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