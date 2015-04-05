var express = require('express');
var router = express.Router();

// var bodyParser = require('body-parser');
var db = require('../db/databaseConnector');

// POST to /
router.post('/', function (req, res) {
    var username = req.body.user.username || '';
    var email = req.body.user.email || '';
    var password = req.body.user.password || '';

    if (username == '' || email == '' || password == '') {
        return res.status(400).json({ error: 'Username || password || email not set' });
    }
    else {
        db.user.insert({ username : username, email : email, password : password }, function (error,user) {
            if (error) {
                if (error.status === 0) {
                    // email or username duplicated
                    res.status(409);
                }
                else {
                    res.status(500);
                }

                return res.json(error.error);
            } else {
                return res.status(200).json(user);
            }

        });
    }
});


module.exports = router;
