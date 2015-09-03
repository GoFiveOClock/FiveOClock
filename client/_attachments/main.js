require.config({
    waitSeconds: 120,
    paths: {
        'lodash': 'bower_components/lodash/lodash.min',
        'jquery': 'bower_components/jquery/dist/jquery.min',
        'angular': 'bower_components/angular/angular',
        'angular.route': 'bower_components/angular-route/angular-route',
        'cookies': 'bower_components/angular-cookies/angular-cookies',
		'pouchdb': 'bower_components/pouchdb/dist/pouchdb.min',
		'bluebird': 'bower_components/bluebird/js/browser/bluebird.min',
        'native-pouchdb-storage': 'couch-orm/pouchdb-storage',
        'client-storage': 'couch-orm/angular-pouchdb-storage',
        'entity': 'couch-orm/entity',
        'user-storage': 'storages/user',
        'profile': 'entities/profile'
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
        'cookies': {
            deps: ['angular'],
            exports: 'angular'
        }
    },
    deps: ['angular', 'angular.route']
});

require(['jquery', 'angular', 'lodash', 'cookies', 'client-storage'], function ($, angular, _, cookies, ClientStorage) {
    angular.module('fiveOClock', ['ngRoute','ngCookies', 'angularCouch']);
    $(function () {
        require(['app/app'], function () {
            angular.bootstrap('body', ['fiveOClock']);
        });
    });
});