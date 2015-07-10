/**
 * Created by Roman on 05.04.2015.
 */
module.exports = (function () {
    var mongoose = require('mongoose');
    var ObjectId = mongoose.Schema.Types.ObjectId;

    var wTrackSchema = mongoose.Schema({
        ID: Number,
        dateByWeek: Number,
        project: {
            _id: {
                type: ObjectId, ref: 'Project', default: null
            },
            projectName: String,
            projectmanager: {
                _id: { type: ObjectId, ref: 'Project', default: null },
                name: String
            },
            workflow: {
                _id: { type: ObjectId, ref: 'workflows', default: null },
                name: String
            },
            customer: {
                _id: { type: ObjectId, ref: 'Customers', default: null },
                name: String
            }
        },
        employee: {
            _id: {type: ObjectId, ref: 'Employees', default: null},
            name: String
        },
        department: {
            _id: {type: ObjectId, ref: 'Department', default: null},
            departmentName: String
        },
        year: Number,
        month: Number,
        week: Number,
        1: Number,
        2: Number,
        3: Number,
        4: Number,
        5: Number,
        6: Number,
        7: Number,
        worked: Number,
        rate: Number,
        revenue: {type: Number, /*get: getPrice,*/ set: setPrice},
        cost: {type: Number /*get: getPrice,*//* set: setPrice*/},
        amount: {type: Number, /*get: getPrice,*/ set: setPrice},
        isPaid: {type: Boolean, default: false},
        invoice: {type: ObjectId, ref: 'Invoice', default: null},
        info: {
            productType: { type: String, ref: 'productTypes', default: 'wTrack' },
            salePrice: {type: Number, default: 100, set: setPrice}
        },
        whoCanRW: {type: String, enum: ['owner', 'group', 'everyOne'], default: 'everyOne'},
        groups: {
            owner: {type: ObjectId, ref: 'Users', default: null},
            users: [{type: ObjectId, ref: 'Users', default: null}],
            group: [{type: ObjectId, ref: 'Department', default: null}]
        },
        editedBy: {
            user: {type: ObjectId, ref: 'Users', default: null},
            date: {type: Date}
        },
        createdBy: {
            user: {type: ObjectId, ref: 'Users', default: null},
            date: {type: Date, default: Date.now}
        }
    }, {collection: 'wTrack'});

    /*function getPrice(num) {
        return (num / 100).toFixed(2);
    }*/

    function setPrice(num) {
        return num * 100;
    }

    wTrackSchema.set('toJSON', {getters: true});

    mongoose.model('wTrack', wTrackSchema);

    if (!mongoose.Schemas) {
        mongoose.Schemas = {};
    }

    mongoose.Schemas['wTrack'] = wTrackSchema;
})();