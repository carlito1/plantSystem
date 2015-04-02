var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var plantSchema = new Schema({
    number : { type: Number, required: true, unique : true },
    name : { type: String, required: true, unique : true },
    latinName : { type: String, required: true },
    place : { type: String, required: true },
    date : { type: String, required: true, default: Date.now },

    isWood : { type: Boolean, required: true },
});

var UserSchema = new Schema({
    username : { type: String, required: true, },
    password: { type: String, required: true },
    email : { type: String, required: true },
    plants: [plantSchema]
});

module.exports = mongoose.model('user', UserSchema);
