var express = require('express');
var http = require('http');
var path = require('path');
var cookie = require('cookie');
var moment = require('moment');
var Promise = require("bluebird");
var nano = require('nano');

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

// development only
if ('development' === app.get('env')) {
    app.use(express.errorHandler());
}

var adminDB = 'fiveoclockadmin';
var couchDbHost = 'http://localhost:5984';
var host = Promise.promisifyAll(nano(couchDbHost));
var adminLogin = 'admin';
var adminPassword = 'abc123';
var appDb = 'fiveoclock';
var userDbreplicationFilter = 'views/ownDbReplication';

app.all('/*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", couchDbHost);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Credentials', true);
    res.header("Access-Control-Allow-Headers", "X-Requested-With ,Content-Type");
    next();
});

app.post('/login', function (req, res) {
    var user = req.body.user;
    var password = req.body.password;

    host.authAsync(user, password).then(function (body) {
        var headers = body[1];
        var auth = headers['set-cookie'][0];
        var cookieObject = cookie.parse(auth);
        res.cookie('AuthSession', cookieObject.AuthSession, {
            expires: moment().add(1, 'years').toDate()
        });
        res.cookie('user', user, { expires: moment().add(1, 'years').toDate() });
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
    host.authAsync(adminLogin, adminPassword).then(function (body) {
        var headers = body[1];
        var auth = headers['set-cookie'][0];
        var authenticated = nano({ url: couchDbHost, cookie: auth });
        Promise.promisifyAll(authenticated);
        Promise.promisifyAll(authenticated.db);
        return addToUsersDb(authenticated, user, password).then(function () {
            return checkAdminDB(authenticated);
        }).then(function () {
            return addToAdminDb(authenticated, user, password);
        }).then(function () {
            return addOwnDb(authenticated, user, req, res);
        }).then(function () {
            return setupUserRole(authenticated, user);
        }).then(function () {
            return setCookies(host, user, password, res, req);
        }).catch(function (err) {
            return cleanup(authenticated, user).finally(function () {
                return Promise.reject(err);
            });
        });
    }).catch(function (err) {
        res.status(500).send(err);
    });
}

function cleanup(authenticated, user) {
    return removeFromUsers(authenticated, user).finally(function () {
        return removeDb(authenticated, user);
    }).finally(function () {
        return removeFromAdminDb(authenticated, user);
    });
}

function removeFromAdminDb(authenticated, user) {
    var fiveoclockadmin = authenticated.use(adminDB);
    Promise.promisifyAll(fiveoclockadmin);
    fiveoclockadmin.getAsync(user).then(function (doc) {
        return fiveoclockadmin.destroyAsync(doc[0]._id, doc[0]._rev);
    });
}

function removeDb(authenticated, user) {
    var dbName = getDbName(user);
    return authenticated.db.destroyAsync(dbName);
}

function removeFromUsers(authenticated, user) {
    var users = authenticated.use('_users');
    Promise.promisifyAll(users);
    return users.getAsync("org.couchdb.user:" + user).then(function (doc) {
        return users.destroyAsync(doc[0]._id, doc[0]._rev);
    });
}

function addToUsersDb(authenticated, user, password) {
    var users = authenticated.use('_users');
    Promise.promisifyAll(users);
    return users.insertAsync({
        "_id": "org.couchdb.user:" + user,
        "name": user,
        "type": "user",
        "roles": ['user'],
        "password": password
    });
}

function checkAdminDB(authenticated) {
    return authenticated.requestAsync({ db: adminDB, method: 'HEAD' }).catch(function (err) {
        if (err.statusCode === 404) {
            return authenticated.requestAsync({ db: adminDB, method: 'PUT' });
        }
        return Promise.reject(err);
    });
}

function addToAdminDb(authenticated, user, password) {
    var fiveoclockadmin = authenticated.use(adminDB);
    Promise.promisifyAll(fiveoclockadmin);
    return fiveoclockadmin.insertAsync({
        "_id": user,
        "name": user,
        "type": "user",
        "password": password
    });
}

function addOwnDb(authenticated, user) {
    var dbName = getDbName(user);
    return authenticated.db.replicateAsync(appDb, dbName, { create_target: true, filter:userDbreplicationFilter });
}


function setupUserRole(authenticated, user) {
    var dbName = getDbName(user);
    var prom = authenticated.requestAsync({
        db: dbName,
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
}

function getDbName(user) {
    return user.replace(/\./gi, '-').replace(/@/gi, '$');
}

function setCookies(host, user, password, res) {
    return host.authAsync(user, password).then(function (body) {
        var headers = body[1];
        var auth = headers['set-cookie'][0];
        var cookieObject = cookie.parse(auth);
        res.cookie('AuthSession', cookieObject.AuthSession, {
            expires: moment().add(1, 'years').toDate()
        });
        res.cookie('user', user, { expires: moment().add(1, 'years').toDate() });
        res.cookie('db', getDbName(user), { expires: moment().add(1, 'years').toDate() });
        res.end(user);
    });
};

var server = http.createServer(app);

server.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
})
