var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var compress = require('compression');

var expressJwt = require('express-jwt');

var authoratization = require('./api/authoratization.js');
var plants = require('./api/plants');
var privateUser = require('./api/user_private.js');
var publicUser = require('./api/user_public.js');

var app = express();

var oneDay = 86400000;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(compress());
// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', authoratization);
app.use('/api/user', publicUser);

app.use('/api/plants', expressJwt({ secret : require('./config.json').secret }), plants);
app.use('/api', expressJwt({ secret : require('./config.json').secret }), privateUser);

app.use(express.static(__dirname + '/public', { maxAge: oneDay }));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.on('uncaughtException', function (error) {
    console.log(error);
});


module.exports = app;
