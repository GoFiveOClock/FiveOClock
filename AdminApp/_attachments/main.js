requirejs.config({
    waitSeconds: 120,
    paths: {
        'angular': '../Common/lib/angular',
        'angular.route': '../Common/lib/angular-route',
        'underscore': '../Common/lib/underscore',
        'jquery': '../Common/lib/jquery-2.1.1',
        'bootstrap': '../Common/lib/bootstrap/js/bootstrap',
        'moment': '../Common/lib/momentwithlocales',
        'ui-bootstrap': '../Common/lib/ui-bootstrap-tpls-0.13.0',
		'cookies': '../Common/lib/cookies.min',
        'pouchDb': '../Common/lib/pouchdb-3.3.1',
        'text': 'plugins/text',
        'json': 'plugins/json',
		'confirmationService' : '../Common/app/confirmationService',
        'entities' : '../Common/entities',
        'CouchEntity': '../Common/CouchOrm/CouchEntity',
        'CouchEntityFactory': '../Common/CouchOrm/CouchEntityFactory'
    },
    shim: {
        'angular': {
            exports: 'angular',
            deps: ['jquery']
        },
        'angular.route': {
            deps: ['angular'],
            exports: 'angular'
        },       
        'bootstrap': {
            deps: ['jquery']
        },
        'moment': {
            exports: 'moment'
        },
        'ui-bootstrap': {
            deps: ['bootstrap', 'angular'],
            exports: 'angular'
        }
    },
    deps: ['angular', 'angular.route', 'ui-bootstrap', 'bootstrap','CouchEntity']
});

require(['jquery', 'angular','pouchDb'], function ($, angular,pouchDB) {


    var app = angular.module('fiveOClock', ['ngRoute','angularCouch']);
    app.config(function($httpProvider) {
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
    });
    $(function () {
        function startApplication() {
            require(['app/app'], function () {
                angular.bootstrap('body', ['fiveOClock']);
            });
        };

        var dbPath = window.location.origin + '/' + window.location.pathname.split('/')[1];
        var dbName = window.location.pathname.split('/')[1];
        $.get(dbPath).then(function () {
            pouchDB.replicate(dbPath, dbName).then(function (result) {
                pouchDB.replicate(dbName, dbPath).then(function (result) {
                    if (result.ok) {
                        pouchDB.replicate(dbName, dbPath, {live: true});
                        startApplication();
                    }
                });
            });
        }, function (err) {
            if(err.status == 401){
                window.location = cookies.get('hubUrl');
            } else {
                startApplication();
            }
        });
    });
});