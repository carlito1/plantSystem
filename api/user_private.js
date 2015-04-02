var express = require('express');
var router = express.Router();

// var bodyParser = require('body-parser');
var db = require('../db/databaseConnector');

router.get('/user/:username', function (req, res) {
    db.user.getOne(req.params.username, function (error, data) { 
        if (error) {
            return res.status(500).json({ error: 'Database error' });
        }
        else {
            return res.status(200).json(data);
        }
    });
});

// UPDATE TO /
router.put('/user', function (req, res) {
    var user = req.body || null;
    
    if (!user) {
        return res.status(400).json({ error: 'user not provided' });
    }
    else {
        db.user.update(req.body.user, function (error) {
            if (error) {
                return res.status(500).json({ error: 'db error' });
            }
            else {
                return res.status(200).json({ msg: user.username + ' was updated' });
            }
        });
    }
});

module.exports = router;