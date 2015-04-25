requirejs.config({
    waitSeconds: 120,
    paths: {
        'angular': '../Common/lib/angular',
        'angular.route': '../Common/lib/angular-route',
        'underscore': '../Common/lib/underscore',
        'jquery': '../Common/lib/jquery-2.1.1',
        'bootstrap': '../Common/lib/bootstrap/js/bootstrap',
        'CouchEntity': '../Common/CouchOrm/CouchEntity',
        'CouchEntityFactory': '../Common/CouchOrm/CouchEntityFactory',
        'moment': '../Common/lib/momentwithlocales',
        'ui-bootstrap': '../Common/lib/ui-bootstrap-tpls-0.12.1',
        'clockpicker': '../Common/lib/clockpicker',
        'pouchDb': '../Common/lib/pouchdb-3.3.1',
		'cookies': '../Common/lib/cookies.min',
		'text' : '../Common/lib/plugins/text',
		'json' : '../Common/lib/plugins/json',
		'localization' : '../Common/localization',
		'entities' : '../Common/entities',
		'indexController': 'app/indexController',
		'settingsService': '../Common/app/settings/settingsService',
		'confirmationService' : '../Common/app/confirmationService',
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