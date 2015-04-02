var express = require('express');
var router = express.Router();

// var bodyParser = require('body-parser');
var db = require('../db/databaseConnector');
var jwt = require('jsonwebtoken');
var secret = require('../config.json').secret;
// router.use(bodyParser);


router.use('/', function (req, res, next) {
    var jtwHeader = req.headers['authorization'].split(' ')[1];
    
    var decoded = jwt.verify(jtwHeader, secret);
    // Check if user exists in database
    // If not return 401
    db.user.getOne(decoded.username, function (error, data) { 
        if (error) {
            return res.status(500).json({ error: 'Database error' });
        }
        else {
            if (data) {
                // User exists, go to next 
                req.user = decoded;
                return next();
            }
            else {
                return res.status(401).json({ error: 'Invalid token' });
            }
        }
    });
});
/* GET all plants */
router.get('/GetWood', function (req, res) {
    console.log('get wood');
    db.plants.getWood(req.user._id,function (error, data) {
        if (error) {
            res.status(500).json({ error: 'Db error' });
        }
        else {
            
            res.status(200).json(data);
        }
    });
});
router.get('/GetRoot', function (req, res) {
    console.log('get roots');
    db.plants.getRoots(req.user._id,function (error, data) {
        if (error) {
            res.status(500).json({ error: 'Db error' });
        }
        else {
            var array = [];
            for (var i = 0; i < data.length; i++) {
                if (!data[i].isWood) { array.push(data[i]); }
            }
            res.status(200).json(array);
        }
    });
});

router.post('/', function (req, res) {
    console.log('post');
    var plant = req.body.plant;
    // Check input
    if (plant.latinName == '' || plant.name == '' || plant.place == '' || plant.date == '') {
        return res.status(400).json({ error: 'Inputs can not be empty' });
    }
    // Insert plant in database
    db.plants.insert(req.user._id,plant, function (error) {
        if (error) {
            return res.status(500).json({ error: 'Db error' });
        }
        else {
            return res.status(200).json(plant);
        }
    });
});

module.exports = router;