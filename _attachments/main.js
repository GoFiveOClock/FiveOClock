requirejs.config({
    waitSeconds: 120,
    paths: {
        'angular': 'lib/angular',
        'angular.route': 'lib/angular-route',
        'underscore': 'lib/underscore',
        'jquery': 'lib/jquery-2.1.1',
        'bootstrap': 'lib/bootstrap/js/bootstrap',
        'CouchEntity': 'CouchOrm/CouchEntity',
        'CouchEntityFactory': 'CouchOrm/CouchEntityFactory',
        'moment': 'lib/moment',
        'ui-bootstrap': 'lib/ui-bootstrap-tpls-0.12.1',
        'clockpicker': 'lib/clockpicker',
        'indexController': 'app/indexController',
        'pouchDb': 'lib/pouchdb-3.3.1',
		'cookies': 'lib/cookies.min'
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
        },
        'clockpicker': {
            deps: ['jquery'],
            exports: 'jquery'
        },
        'indexController': {
            deps: ['angular']
        }
    },
    deps: ['angular', 'angular.route', 'ui-bootstrap', 'bootstrap', 'CouchEntity']
});

require(['jquery', 'angular', 'pouchDb', 'cookies'], function ($, angular, pouchDB, cookies) {
    angular.module('fiveOClock', ['angularCouch', 'ngRoute', 'ui.bootstrap']);
    $(function () {
        function startApplication() {
            require(['app/app', 'indexController'], function () {
                angular.bootstrap('body', ['fiveOClock']);
            });
        };
        //pouchDB.debug.enable('*');
        var dbPath = window.location.origin + '/' + window.location.pathname.split('/')[1];
        var dbName = cookies.get('user') || cookies.get('anonymous') || 'fiveOClock';
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