require.config({
    waitSeconds: 120,
    paths: {
        'lodash': 'bower_components/lodash/lodash.min',
        'jquery': 'bower_components/jquery/dist/jquery.min',
        'angular': 'bower_components/angular/angular',
        'angular.route': 'bower_components/angular-route/angular-route',
        'cookies': 'bower_components/cookies.min',
		'pouchdb': 'bower_components/pouchdb/dist/pouchdb.min',
		'bluebird': 'bower_components/bluebird/js/browser/bluebird.min',
        'native-pouchdb-storage': 'couch-orm/pouchdb-storage',
        'client-storage': 'couch-orm/angular-pouchdb-storage',
        'entity': 'couch-orm/entity',
        'user-storage': 'storages/user',
        'loginController': 'app/loginController',
        'landingController': 'app/landingController',
        'profileController': 'app/profileController',
        'profile': 'entities/profile',
        'serviceProviderInfo': 'entities/serviceProviderInfo',
        'calendarSettings': 'entities/calendarSettings'
    },
    shim: {
        'angular': {
            exports: 'angular',
            deps: ['jquery']
        },
        'angular.route': {
            deps: ['angular'],
            exports: 'angular'
        }
    },
    deps: ['angular', 'angular.route']
});

require(['jquery', 'angular', 'lodash', 'cookies', 'client-storage'], function ($, angular, _, cookies, ClientStorage) {
    angular.module('fiveOClock', ['ngRoute', 'angularCouch']);
    $(function () {
        var authSession = cookies.get('AuthSession');
        if(!authSession){
            window.location = '#login';
        }
        require(['app/app'], function () {
            angular.bootstrap('body', ['fiveOClock']);
        });
    });
});