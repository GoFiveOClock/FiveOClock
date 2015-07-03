var urlDb = 'http://admin:abc123@localhost:5984/';


var nano = require('nano')('http://localhost:5984');

nano.auth('admin', 'abc123',
    function (err, body, headers) {
        var auth;
        if (err) {
            console.log(err);
        } else {
            auth = headers['set-cookie'][0];
            var authenticated = require('nano')({url: 'http://localhost:5984', cookie: auth});
            var users = authenticated.use('fiveoclockadmin');
            users.list(function (err, body) {
                if (!err) {
                    var exec = require('child_process').exec;
                    var donorDirectoryAgenda = "../FiveOClock/Agenda";
                    var donorDirectoryManager = "../FiveOClock/Manager";
                    var donorDirectoryCommon = "../FiveOClock/Common";
                    var donorDirectoryViews = "../FiveOClock/Views";

                    for (var i = 0; i < body.rows.length; i++) {
                        if (body.rows[i].usertype == 'visitor') {
                            var dbName = body.rows[i].id.substring(17) + "visitor";
                            exec("couchapp push " + urlDb + dbName, {cwd: donorDirectoryViews}).then(function (body) {
                                return  exec("couchapp push " + urlDb + dbName, {cwd: donorDirectoryCommon});
                            }).catch(function (err) {
                               console.log(err);
                            });

                        };
                        if (body.rows[i].usertype == 'coach') {
                            var dbName = "a" +  body.rows[i].id.substring(17);
                            exec("couchapp push " + urlDb + dbName, {cwd: donorDirectoryManager}).then(function (body) {
                                return  exec("couchapp push " + urlDb + dbName, {cwd: donorDirectoryCommon});
                            }).then(function (body) {
                                return  exec("couchapp push " + urlDb + dbName, {cwd: donorDirectoryViews});
                            }).catch(function (err) {
                                console.log(err);
                            });


                            var dbName = "a" +  body.rows[i].id.substring(17) + "public";
                            exec("couchapp push " + urlDb + dbName, {cwd: donorDirectoryAgenda}).then(function (body) {
                                return  exec("couchapp push " + urlDb + dbName, {cwd: donorDirectoryCommon});
                            }).then(function (body) {
                                return  exec("couchapp push " + urlDb + dbName, {cwd: donorDirectoryViews});
                            }).catch(function (err) {
                                console.log(err);
                            });
                        };
                    };

                    exec("couchapp push " + urlDb + "agenda", {cwd: donorDirectoryCommon}).then(function (body) {
                        return  exec("couchapp push " + urlDb + "agendaethalon", {cwd: donorDirectoryCommon});
                    }).then(function (body) {
                        return  exec("couchapp push " + urlDb + "manager", {cwd: donorDirectoryCommon});
                    }).then(function (body) {
                        return  exec("couchapp push " + urlDb + "managerethalon", {cwd: donorDirectoryCommon});
                    }).then(function (body) {
                        return  exec("couchapp push " + urlDb + "agenda", {cwd: donorDirectoryAgenda});
                    }).then(function (body) {
                        return  exec("couchapp push " + urlDb + "agendaethalon", {cwd: donorDirectoryAgenda});
                    }).then(function (body) {
                        return  exec("couchapp push " + urlDb + "manager", {cwd: donorDirectoryManager});
                    }).then(function (body) {
                        return  exec("couchapp push " + urlDb + "managerethalon", {cwd: donorDirectoryManager});
                    }).catch(function (err) {
                        console.log(err);
                    });


                };
            });
        };
    });