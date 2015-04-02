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
        db.user.insert({ username : username, email : email, password : password }, function (error) { 
            if (error) {
                if (error.status !== 'undefined') {
                    // email or username duplicated
                    return res.status(409).json({ error: 'Password or email allready exists' });
                }
                else {
                    return res.status(500).json({ error: 'Database error' });
                }
            } else {
                return res.status(200).json(req.body.user);
            }
            
        });
    }
});


module.exports = router;