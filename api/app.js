var express = require('express');
var http = require('http');
var cookie = require('cookie');
var moment = require('moment');
var Promise = require("bluebird");
var nano = require('nano');
var homeEmail = 'gofiveoclock@gmail.com';
var homeEmailPassword = 'gc-xa1be';
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: homeEmail,
        pass: homeEmailPassword
    }
});

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
var commDb = 'common';

var couchDbHost = 'http://localhost:5984';
var couchDbPublic = 'http://localhost:5984';
var host = Promise.promisifyAll(nano(couchDbHost));
var adminLogin = 'admin';
var adminPassword = 'abc123';
// var couchDbHost = 'https://fiveoclock.smileupps.com';
// var host = Promise.promisifyAll(nano(couchDbHost));
// var adminLogin = 'admin';
// var adminPassword = 'd13c45122602';
var appDb = 'fiveoclock';
var userDbreplicationFilter = 'views/ownDbReplication';
var commonReplicationFilter = 'views/commonReplication';

app.all('/*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", couchDbPublic);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Credentials', true);
    res.header("Access-Control-Allow-Headers", "X-Requested-With ,Content-Type");
    next();
});

app.post('/sendEmail', function (req, res) {
	var authenticated;
	host.authAsync(adminLogin, adminPassword).then(function (body) {	   
		var headers = body[1];
		var auth = headers['set-cookie'][0];
		authenticated = nano({ url: couchDbHost, cookie: auth });		
	}).then(function(){				
		var buf  = require('crypto').randomBytes(8);
		var path = buf.toString('hex');			
		var fiveoclockadmin = authenticated.use(adminDB);
		Promise.promisifyAll(fiveoclockadmin);
		fiveoclockadmin.insertAsync({"date": new Date(), "id": path, "email": req.body.email}, path);			
		transporter.sendMail({
			from: homeEmail,
			to: req.body.email,
			subject: 'Recover password',
			text: "Путь : http://localhost:" + app.get('port') + "/recoverPassword?path=" + path
		});
		return res.send();
	});		
})

app.all('/recoverPassword', function (req, res, next) {	
	var fiveoclockadmin, authenticated, userEmail, recoverObj;
	var newPassword = require('crypto').randomBytes(2);	
	newPassword = newPassword.toString('hex');
	host.authAsync(adminLogin, adminPassword).then(function (body) {	   
		var headers = body[1];
		var auth = headers['set-cookie'][0];
		return nano({ url: couchDbHost, cookie: auth });				
	}).then(function(result){
		authenticated = Promise.promisifyAll(result);;
		fiveoclockadmin = authenticated.use(adminDB)		
		Promise.promisifyAll(fiveoclockadmin);
		return fiveoclockadmin.getAsync(req.query.path);
	}).then(function(result){
		if(result && result.length){
			var doc = result[0];
			var diff = moment().diff(moment(doc.date), 'minute');
			if(diff > 100){	
				return Promise.reject({expired: true});					
			}
			else{
				userEmail = doc.email;
				recoverObj = doc.id;
				return editUserAdminDb(authenticated, userEmail, newPassword);				
			};					
		}
		else{
			return Promise.reject();
		};	
	}).then(function(){	
		return editUserUsersDb(authenticated, userEmail, newPassword);
	}).then(function(){	
		return removeFromAdminDb(authenticated, recoverObj);
	}).then(function(){
		res.cookie('newPass', newPassword, {expires: moment().add(5, 'minutes').toDate()});
		res.redirect(couchDbHost + '/fiveoclock/_design/client/index.html#/recoverSuccessful');	
		
		res.send();
	}).catch(function(err){	
		if(err.expired){			
			res.redirect(couchDbHost + '/fiveoclock/_design/client/index.html#/recoverExpired');
		}
		else{
			res.redirect(couchDbHost + '/fiveoclock/_design/client/index.html#/defaultIssue');
		}
	}); 
});

app.post('/login', function (req, res) {
    var user = req.body.user;
    var password = req.body.password;
	
	host.authAsync(adminLogin, adminPassword).then(function (body) {
		var headers = body[1];
        var auth = headers['set-cookie'][0];
        var authenticated = nano({ url: couchDbHost, cookie: auth });
        Promise.promisifyAll(authenticated);
        Promise.promisifyAll(authenticated.db);
		return authenticate(authenticated, host, user, password, res, req);
	}).catch(function (err) {
		res.status(500).send(err);
	});;
    
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
            // return replicateCommon(authenticated, user);
        // }).then(function () {
            return authenticate(authenticated, host, user, password, res, req);
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
    return fiveoclockadmin.getAsync(user).then(function (doc) {
        return fiveoclockadmin.destroyAsync(doc[0]._id, doc[0]._rev);
    });
}


function editUserAdminDb(authenticated, user, password) {
    var fiveoclockadmin = authenticated.use(adminDB);
    Promise.promisifyAll(fiveoclockadmin);
    return fiveoclockadmin.getAsync(user).then(function (doc) {
        return fiveoclockadmin.insertAsync({"_id":doc[0]._id, "_rev":doc[0]._rev, "password":password, "name": user, "type": "user"});
    });
}

function editUserUsersDb(authenticated, user, password) {
    var users = authenticated.use('_users');
    Promise.promisifyAll(users);
	return users.getAsync("org.couchdb.user:" + user).then(function (doc) {
        return users.insertAsync({"_id":doc[0]._id, "_rev": doc[0]._rev, "password": password, "roles": ['user'], "name": user, "type": "user"});
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

function replicateCommon(authenticated, user) {
    var dbName = getDbName(user);
    return authenticated.db.replicateAsync(dbName, commDb, { create_target: true, continuous: true, filter:commonReplicationFilter});
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

function authenticate(authenticated, host, user, password, res) {
	return replicateCommon(authenticated, user).then(function () {
		return host.authAsync(user, password).then(function (body) {		
			var headers = body[1];
			var auth = headers['set-cookie'][0];
			var cookieObject = cookie.parse(auth);
			res.cookie('AuthSession', cookieObject.AuthSession);
			res.cookie('user', user);
			res.cookie('db', getDbName(user));
			res.send({user:user, auth: cookieObject.AuthSession, db: getDbName(user)});
		});        
    });
}

var server = http.createServer(app);

server.timeout = 300000;
server.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
