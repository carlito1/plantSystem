
var mongoose = require('mongoose');

var connectionString = require('../config.json').connectionStringProduction;

console.log(connectionString);
mongoose.connect(connectionString);
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error'));

db.once('open', function (callback) {
    console.log("Connection established");
});

var user = require('../models/user');
var crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    password = require('../config.json').key;

function encrypt(buffer) {
    var cipher = crypto.createCipher(algorithm, password)
    var crypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
    return crypted;
}


var getWood = function (userId, callback) {

    user.findOne({ _id: userId }, function (error, data) {
        if (error) {
            console.log(error);
            return callback(error);
        }
        else {
            if (data) {
                data = data.plants;
                var array = [];
                for (var i = 0; i < data.length; i++) {
                    if (data[i].isWood) { array.push(data[i]); }
                }
                return callback(null, array);
            }
            else {
                return callback(null, []);
            }

        }
    });
};
var getRoots = function (userId, callback) {
    /*
    db.users.findOne({ $and : [{ "username": "nika" }, { "plants.isWood" : { $all: [fal


se]}}]},{ "plants":1, "_id" : 0})
*/
    user.findOne({ _id: userId }, function (error, data) {
        if (error) {
            console.log(error);
            return callback(error);
        }
        else {
            if (data) {
                data = data.plants;
                var array = [];
                for (var i = 0; i < data.length; i++) {
                    if (!data[i].isWood) { array.push(data[i]); }
                }
                return callback(null, array);
            }
            else {
                return callback(null, []);
            }

        }
    });

}
var insertNew = function (userId, newPlant, callback) {
    user.findOneAndUpdate({ _id: userId }, {
        $push: {
            plants : newPlant
        }
    }, function (error, data) {
        if (error) {
            console.log(error);
            callback(error);
        }
        else {
            callback(null);
        }
    });
};


var insertNewUser = function (newUser, callback) {
    var newuser = new user({
      username : newUser.username,
      password: encrypt(new Buffer(newUser.password, "utf8")) ,
      email : newUser.email,
      plants:[]
      });

    newuser.save(function (error) {
        if (error) {
            console.log(error);
            return callback(error);
        } else {
          return callback();
        }

    });
};

var updateUser = function (updatedUser, callback) {
    user.findByIdAndUpdate(updatedUser._id, { password: updatedUser.password }, function (error, user) {
        if (error) {
            console.log(error);
            callback(error);
        }
        else {
            callback(null, user);
        }
    });
};

var getUser = function (username, callback) {
    user.findOne({ username : username }, { username : 1, email : 1 }, function (error, data) {
        if (error) {
            console.log(error);
            callback(error);
        }
        else {
            callback(null, data);
        }
    });
};

var getUserWithPass = function (username, password, callback) {
    password = encrypt(new Buffer(password, "utf8"));

    user.findOne({ $and : [{ username : username }, { password: password }] }, { username : 1 }, function (error, data) {
        console.log(data);
        if (error) {
            console.log(error);
            callback(error);
        }
        else {
            callback(null, data);
        }
    });
};


/** Export everything with plants **/
module.exports.plants = {
    insert : insertNew,
    getWood : getWood,
    getRoots : getRoots
};

module.exports.user = {
    insert: insertNewUser,
    getOne : getUser,
    getWithPassword : getUserWithPass,
    update : updateUser
};

// module.exports.findUserWithToken = findUserWithToken;
