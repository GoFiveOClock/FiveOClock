/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var cookie = require('cookie');
var moment = require('moment');
var Promise = require("bluebird");

var app = express();
app.use(express.cookieParser('your secret here'));

app.set('port', process.env.PORT || 3000);
app.engine('html', require('ejs').renderFile);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());

app.use(express.session());
app.use(app.router);



app.use(express.static(path.join(__dirname, 'web')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

app.all('/*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:5984");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Credentials', true);
    res.header("Access-Control-Allow-Headers", "X-Requested-With ,Content-Type");
    next();
});

app.post('/login', function (req, res) {
    var user = req.body.user;
    var password = req.body.password;
    var nano = require('nano')('http://localhost:5984');

    var prom = Promise.promisify(nano.auth);
    prom(user, password).then(function (body) {
        var headers = body[1];
        auth = headers['set-cookie'][0];
        var cookieObject = cookie.parse(auth);
        res.cookie('AuthSession', cookieObject.AuthSession, {
            expires: moment().add(1, 'years').toDate()
        });
        res.cookie('user', user, {expires: moment().add(1, 'years').toDate()});
        res.end();
    }).catch(function (err) {
        res.status(500).send(err);
    });
});

app.post('/registration', function (req, res) {
    var user = req.body.user;
    var password = req.body.password;
    register(req, res, user, password);
});

function register(req, res, user, password) {
    var nano = require('nano')('http://localhost:5984');
    var prom = Promise.promisify(nano.auth);
    prom('admin', 'abc123').then(function (body) {
        var headers = body[1];
        var auth = headers['set-cookie'][0];
        var authenticated = require('nano')({url: 'http://localhost:5984', cookie: auth});
        return addToUsers(authenticated, user, password).then(function (body) {
            return addToAdmin(authenticated, user, password);
        }).then(function (body) {
            return addUserBase(authenticated, user, req, res);
        }).then(function (body) {
            return setupUserRole(authenticated, user);
        }).then(function (body) {
            return setCookies(nano, user, password, res, req);
        });
    }).catch(function (err) {
        res.status(500).send(err);
    });
};

function addToUsers(authenticated, user, password) {
    var users = authenticated.use('_users');
    var insert = Promise.promisify(users.insert);
    var prom = insert({
        "_id": "org.couchdb.user:" + user,
        "name": user,
        "type": "user",
        "roles": ['user'],
        "password": password
    });
    return prom;
};

function addToAdmin(authenticated, user, password) {
    var fiveoclockadmin = authenticated.use('fiveoclockadmin');
    var insert = Promise.promisify(fiveoclockadmin.insert);
    var prom = insert({
        "_id":  user,
        "name": user,
        "type": "user",
        "password": password
    });
    return prom;
};

function addUserBase(authenticated, user, req, res) {
    var create = Promise.promisify(authenticated.db.create);
    var nameBD = user.replace('@','+');
    nameBD = nameBD.replace('.','/');
    var prom = create(nameBD);
    return prom;
};


function setupUserRole(authenticated, user) {
    var nameBD = user.replace('@','+');
    nameBD = nameBD.replace('.','/');
    var request = Promise.promisify(authenticated.request);
    var prom = request({
        db: nameBD,
        method: 'PUT',
        path: '/_security',
        body: {
            "admins": {
                "names": [],
                "roles": []
            },
            "members": {
                "names": [user],
                "roles": []
            }
        }
    });
    return prom;
};

function setCookies(nano, user, password, res, req) {
    var prom = Promise.promisify(nano.auth);
    return prom(user, password).then(function (body) {
        var headers = body[1];
        auth = headers['set-cookie'][0];
        var cookieObject = cookie.parse(auth);
        res.cookie('AuthSession', cookieObject.AuthSession, {
            expires: moment().add(1, 'years').toDate()
        });
        res.cookie('user', user, {expires: moment().add(1, 'years').toDate()});
        res.end(user);
    });
};

var server = http.createServer(app);

server.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
