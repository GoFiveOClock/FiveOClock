/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var cookie = require('cookie');
var moment = require('moment');

//var $ = require('./lib/jquery-2.1.1');

var app = express();


// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/web');
app.engine('html', require('ejs').renderFile);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);


app.use(express.static(path.join(__dirname, 'web')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

app.get('/', function(req, res){
  res.render('index.html', { title: 'Express' });
});

debugger;

app.post('/login', function (req, res) {
    var user_name = req.body.user;
    var password = req.body.password;
    var nano = require('nano')('http://localhost:5984');

    nano.auth(user_name, password, function (err, body, headers) {
        var auth;
        if (err) {
            res.status(500).send(err);
        } else {
            auth = headers['set-cookie'][0];
            var cookieObject = cookie.parse(auth);
            res.cookie('AuthSession', cookieObject.AuthSession, {
                expires: moment().add(1, 'years').toDate()
            });
            res.cookie('user', user_name);
            res.cookie('hubUrl', req.body.oldpathname);
            res.end(JSON.stringify({success: true}));
        }
    });

});
app.post('/registration', function (req, res) {
    var user_name = req.body.user;
    var password = req.body.password;
    var propName = 'user';
    register(req, res, user_name, password, propName);
});

app.post('/startWR', function (req, res) {
    require('crypto').randomBytes(8, function (ex, buf1) {
        require('crypto').randomBytes(8, function (ex, buf2) {
            var token1 = buf1.toString('hex');
            var token2 = buf1.toString('hex');

            var user_name = "a" + token1;
            var propName = 'anonymous';
            register(req, res, user_name, token2, propName);
        });
    });
});


var server = http.createServer(app);

server.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});

function register(req, res, user, password, propName) {
    var nano = require('nano')('http://localhost:5984');
    nano.auth('admin', 'abc123',
        function (err, body, headers) {
            var auth;
            if (err) {
                res.status(500).send('Failed to login to couchdb.');
            } else {
                auth = headers['set-cookie'][0];
                var authenticated = require('nano')({url: 'http://localhost:5984', cookie: auth})
                var users = authenticated.use('_users');
                users.insert({
                    "_id": "org.couchdb.user:" + user,
                    "name": user,
                    "type": "user",
                    "roles": ['user'],
                    "password": password
                }, function (err, body) {
                    if (err) {
                        res.status(500).send(err);
                    }
                    else {
                        var cookieObject = cookie.parse(req.headers.cookie);
                        if (cookieObject.anonymous) {
                            var ethaloneBase = cookieObject.anonymous;
                        }
                        else {
                            var ethaloneBase = 'managerethalon';
                        }
                        ;

                        authenticated.db.replicate(ethaloneBase, user, {create_target: true}, function (err, body) {
                            if (err) {
                                res.status(500).send(err);
                            }
                            else {

                                authenticated.db.replicate('agendaethalon', user + "public", {create_target: true}, function (err, body) {
                                    if (err) {
                                        res.status(500).send(err);
                                    }
                                    authenticated.db.replicate(ethaloneBase, user + "public", {
                                        filter: 'Manager/publicSchedule',
                                        continuous: true
                                    }, function (err, body) {
                                        if (err) {
                                            res.status(500).send(err);
                                        }
                                    });

                                    authenticated.db.replicate(user + "public", user, {
                                        continuous: true
                                    }, function (err, body) {
                                        if (err) {
                                            res.status(500).send(err);
                                        }
                                    });

                                    authenticated.request({
                                        db: user,
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
                                    }, function (err) {
                                        if (err) {
                                            res.status(500).send(err);
                                        }
                                        else {
                                            nano.auth(user, password, function (err, body, headers) {
                                                var auth;
                                                if (err) {
                                                    res.status(500).send('Failed to login to couchdb.');
                                                } else {
                                                    auth = headers['set-cookie'][0];
                                                    var cookieObject = cookie.parse(auth);
                                                    res.cookie('AuthSession', cookieObject.AuthSession, {
                                                        expires: moment().add(1, 'years').toDate()
                                                    });
                                                    res.cookie('hubUrl', req.body.oldpathname, {expires: moment().add(1, 'years').toDate()});
                                                    res.cookie(propName, user, {expires: moment().add(1, 'years').toDate()});
                                                    res.end(user);
                                                }
                                            })
                                        }

                                    });

                                });

                            }
                        });
                    }

                });
            }
        });
}
