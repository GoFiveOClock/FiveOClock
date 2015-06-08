/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var cookie = require('cookie');
var moment = require('moment');

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

app.get('/', function (req, res) {
    res.render('index.html', {title: 'Express'});
});


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

function addToUsers(authenticated, user_name, password) {
    var users = authenticated.use('_users');
    var q = require('q');
    var promise = q.nfcall(users.insert, {
        "_id": "org.couchdb.user:" + user_name,
        "name": user_name,
        "type": "user",
        "roles": ['user'],
        "password": password
    });
    return promise;
};

function addToAdmin(authenticated, user_name, password) {
    var fiveoclockadmin = authenticated.use('fiveoclockadmin');
    var q = require('q');
    var promise = q.nfcall(fiveoclockadmin.insert, {
        "_id": user_name,
        "name": user_name,
        "db": user_name + "visitor",
        "type": "user",
        "usertype": "visitor",
        "password": password
    });
    return promise;
}

function addVisitorBase(authenticated, user_name, req, res) {
    var cookieObject = cookie.parse(req.headers.cookie);
    if (cookieObject.nameAgendaDB) {
        var nameAgendaDB = cookieObject.nameAgendaDB;
        var q = require('q');
        var replicatePromise = q.nfcall(authenticated.db.replicate, nameAgendaDB, user_name + "visitor");
        replicatePromise.then(function (body) {
            var promise = q.nfcall(authenticated.db.replicate, user_name + "visitor", nameAgendaDB);
            return promise;
        }, function (err) {
            res.status(500).send(err);
        });
    }
    else {
        res.status(500).send("not found cookies");
    }
}

app.post('/registrationVisitor', function (req, res) {
    var user_name = req.body.user;
    var password = req.body.password;
    var nano = require('nano')('http://localhost:5984');
    nano.auth('admin', 'abc123', function (err, body, headers) {
        if (err) {
            res.status(500).send('Failed to login to couchdb.');
        } else {
            var auth = headers['set-cookie'][0];
            var authenticated = require('nano')({url: 'http://localhost:5984', cookie: auth});
            var userPromise = addToUsers(authenticated, user_name, password);
            userPromise.then(function (body) {
                var adminPromise = addToAdmin(authenticated, user_name, password);
                adminPromise.then(function (body) {
                    var visitorBasePromise = addVisitorBase(authenticated, user_name, req, res);
                    visitorBasePromise.then(function (body) {
                    }, function (err) {
                        res.status(500).send(err);
                    })
                }, function (err) {
                    res.status(500).send(err);
                })
            }, function (error) {
                res.status(500).send(err);
            });
        }
    });
});
function addUserBase(authenticated, user, req, res) {
    var cookieObject = cookie.parse(req.headers.cookie);
    if (cookieObject.anonymous) {
        var ethaloneBase = cookieObject.anonymous;
    }
    else {
        var ethaloneBase = 'managerethalon';
    }
    ;
    var q = require('q');
    var promise = q.nfcall(authenticated.db.replicate, ethaloneBase, user, {create_target: true});
    return promise;
};

function agendaRepl(authenticated, user) {
    var q = require('q');
    var promise = q.nfcall(authenticated.db.replicate, 'agendaethalon', user + "public", {create_target: true});
    return promise;
};

function userRepl(authenticated, user) {
    var q = require('q');
    var promise = q.nfcall(authenticated.db.replicate, user, user + "public", {
        filter: 'Manager/publicSchedule',
        continuous: true
    });
    return promise;
};

function returnUser(authenticated, user) {
    var q = require('q');
    var promise = q.nfcall(authenticated.db.replicate, user + "public", user, {
        filter: 'Agenda/publicSchedule',
        continuous: true
    });
    return promise;
};

function requestDbUser(authenticated, user) {
    var q = require('q');
    var promise = q.nfcall(authenticated.request, {
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
    });
    return promise;
}

function setCookies(nano, user, password, res, req,propName) {
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


function register(req, res, user, password, propName) {
    var nano = require('nano')('http://localhost:5984');
    var q = require('q');
    nano.auth('admin', 'abc123',
        function (err, body, headers) {
            var auth;
            if (err) {
                res.status(500).send('Failed to login to couchdb.');
            } else {
                auth = headers['set-cookie'][0];
                var authenticated = require('nano')({url: 'http://localhost:5984', cookie: auth});
                var userPromise = addToUsers(authenticated, user, password);
                userPromise.then(function (body) {
                    var userBasePromise = addUserBase(authenticated, user, req, res);
                    userBasePromise.then(function (body) {
                        agendaRepl(authenticated, user).then(function (body) {
                            userRepl(authenticated, user).then(function (body) {
                                returnUser(authenticated, user).then(function (body) {
                                        var promiseRequestUser = requestDbUser(authenticated, user);
                                        promiseRequestUser.then(function (body) {
                                            setCookies(nano, user, password, res, req,propName);
                                        }, function (err) {
                                            res.status(500).send(err);
                                        });
                                    }, function (err) {
                                        res.status(500).send(err);
                                    });
                                }, function (err) {
                                    res.status(500).send(err);
                                });
                        }, function (err) {
                            res.status(500).send(err);
                        });
                    }, function (error) {
                        res.status(500).send(err);
                    });
                }, function (error) {
                    res.status(500).send(err);
                });
            }
            ;
        });
};

var server = http.createServer(app);

server.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
