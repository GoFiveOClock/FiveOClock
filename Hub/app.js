/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var cookie = require('cookie');
var moment = require('moment');

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

    nano.auth(user, password, function (err, body, headers) {
        var auth;
        if (err) {
            res.status(500).send(err);
        } else {
            auth = headers['set-cookie'][0];
            var cookieObject = cookie.parse(auth);
            res.cookie('AuthSession', cookieObject.AuthSession, {
                expires: moment().add(1, 'years').toDate()
            });
            res.cookie('user', user);
            res.end(JSON.stringify({success: true}));
        }
    });
});

app.post('/registration', function (req, res) {
    var user = req.body.user;
    var password = req.body.password;
    var propName = 'user';
    register(req, res, user, password, propName);
});

app.post('/startWR', function (req, res) {
    require('crypto').randomBytes(8, function (ex, buf1) {
        require('crypto').randomBytes(8, function (ex, buf2) {
            var token1 = buf1.toString('hex');
            var token2 = buf1.toString('hex');
            var user = "a" + token1;
            var propName = 'anonymous';
            register(req, res, user, token2, propName);
        });
    });
});

function addToUsers(authenticated, user, password) {
    var users = authenticated.use('_users');
    var q = require('q');
    var promise = q.nfcall(users.insert, {
        "_id": "org.couchdb.user:" + user,
        "name": user,
        "type": "user",
        "roles": ['user'],
        "password": password
    });
    return promise;
};

function addToAdmin(authenticated, user, password) {
    var fiveoclockadmin = authenticated.use('fiveoclockadmin');
    var q = require('q');
    var promise = q.nfcall(fiveoclockadmin.insert, {
        "_id": user,
        "name": user,
        "db": user + "visitor",
        "type": "user",
        "usertype": "visitor",
        "password": password
    });
    return promise;
}

function addVisitorBase(authenticated, user, req, res) {
    if(req.headers.cookie){
        var cookieObject = cookie.parse(req.headers.cookie);
    };
    if (cookieObject && cookieObject.nameAgendaDB) {
        var nameAgendaDB = cookieObject.nameAgendaDB;
        var q = require('q');
        var replicatePromise = q.nfcall(authenticated.db.replicate,"visitorethalon",user + "visitor",{create_target: true});
    }
    else {
        res.status(500).send("not found cookies");
    };
};

function vis_coachRepl(authenticated, user,coach) {
    var q = require('q');
    var promise = q.nfcall(authenticated.db.replicate, user + "visitor", coach, {
        continuous: true
    });
    return promise;
};

function coach_visRepl(authenticated, user,coach) {
    var q = require('q');
    var promise = q.nfcall(authenticated.db.replicate, {"url":'http://localhost:5984/' + coach,"headers":{"visitor":user}}, user + "visitor", {
        filter: 'Manager/messageSchedule',
        continuous: true
    });
    return promise;

};

app.post('/registrationVisitor', function (req, res) {
    if(req.headers.cookie){
        var cookieObject = cookie.parse(req.headers.cookie);
    };
    if (cookieObject && cookieObject.user) {
        var coach = cookieObject.user;
    }
    else if(cookieObject && cookieObject.anonymous){
        var coach = cookieObject.anonymous;
    }
    var user = req.body.user;
    var password = req.body.password;
    if(!password){
        password = user;
    }
    var nano = require('nano')('http://localhost:5984');
    nano.auth('admin', 'abc123', function (err, body, headers) {
        if (err) {
            res.status(500).send('Failed to login to couchdb.');
        } else {
            var auth = headers['set-cookie'][0];
            var authenticated = require('nano')({url: 'http://localhost:5984', cookie: auth});
            addToUsers(authenticated, user, password).then(function (body) {
                return addToAdmin(authenticated, user, password);
            }).then(function (body) {
                return addVisitorBase(authenticated, user, req, res);
            }).then(function(body){
                return coach_visRepl(authenticated, user,coach);
            }).then(function (body) {
                return vis_coachRepl(authenticated, user,coach);
            }).then(function (body) {
                return requestDbUser(authenticated, user,'visitor');
            }).then(function (body) {
                authUser(nano,res,user,password);
            }).catch(function (err) {
                res.status(500).send(err);
            });
        };
    });
});

app.post('/visitorLogin', function (req, res) {
    var user = req.body.user;
    var password = req.body.password;
    var nano = require('nano')('http://localhost:5984');

    authUser(nano,res,user,password);
});

function authUser(nano,res,user,password){
    nano.auth(user, password, function (err, body, headers) {
        var auth;
        auth = headers['set-cookie'][0];
        var cookieObject = cookie.parse(auth);
        res.cookie('AuthSession', cookieObject.AuthSession, {
            expires: moment().add(1, 'years').toDate()
        });
        res.end(user);
    });
}
function addUserBase(authenticated, user, req, res) {
    if(req.headers.cookie){
        var cookieObject = cookie.parse(req.headers.cookie);
    };
    if (cookieObject && cookieObject.anonymous) {
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

function user_publRepl(authenticated, user) {
    var q = require('q');
    var promise = q.nfcall(authenticated.db.replicate, user, user + "public", {
        filter: 'Manager/publicSchedule',
        continuous: true
    });
    return promise;
};

function publ_userRepl(authenticated, user) {
    var q = require('q');
    var promise = q.nfcall(authenticated.db.replicate, user + "public", user, {
        filter: 'Agenda/publicSchedule',
        continuous: true
    });
    return promise;
};

function requestDbUser(authenticated, user, visitor) {
    var q = require('q');
    if(visitor){
        var  dbUser =  user + 'visitor' ;
    }
    else{
        var  dbUser =  user;
    }
    var promise = q.nfcall(authenticated.request, {
        db: dbUser,
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
                addToUsers(authenticated, user, password).then(function (body) {
                    return addUserBase(authenticated, user, req, res);
                }).then(function(body){
                    return agendaRepl(authenticated, user);
                }).then(function(body){
                    return user_publRepl(authenticated, user);
                }).then(function(body){
                    return publ_userRepl(authenticated, user);
                }).then(function(body){
                    return requestDbUser(authenticated, user);
                }).then(function(body){
                    setCookies(nano, user, password, res, req,propName);
                }).catch(function (err) {
                    res.status(500).send(err);
                });
            };
        });
};


var server = http.createServer(app);

server.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
