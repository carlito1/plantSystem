var express = require('express');
var router = express.Router();

var jwt = require('jsonwebtoken');
var db = require('../db/databaseConnector');

var secret = require('../config.json').secret;

router.post('/authenticate', function (req, res) {
    
    console.log(req.body.user);
    var username = req.body.user.username || '',
        password = req.body.user.password || '';
    
    if (username == '' || password == '') {
        return res.status(400).json({error:'Bad request'});
    }

    db.user.getWithPassword(username, password, function (error, data) {
        if (error) {
            return res.status(500).json({ error: 'Db error' });
        }
        if (!data) {
            console.log(data);
            // user dont exists
            return res.status(401).json({ error: 'Wrong user or password' });
        }
        var token = jwt.sign(data, secret, { expiresInMinutes: 60 });

        res.status(200).json({ token : token });

    });
});

module.exports = router;