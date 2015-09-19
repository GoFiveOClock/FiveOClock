require.config({
    waitSeconds: 120,
    paths: {
        'lodash': 'bower_components/lodash/lodash.min',
        'jquery': 'bower_components/jquery/dist/jquery.min',
        'angular': 'bower_components/angular/angular',
        'angular.route': 'bower_components/angular-route/angular-route',
        'angular-simple-logger' :'bower_components/angular-simple-logger/dist/index',
        'angular-google-maps' : 'bower_components/angular-google-maps/dist/angular-google-maps',
        'cookies': 'bower_components/cookies.min',
		'pouchdb': 'bower_components/pouchdb/dist/pouchdb.min',
		'bluebird': 'bower_components/bluebird/js/browser/bluebird.min',
        'moment': 'bower_components/moment/min/moment.min',
        'native-pouchdb-storage': 'couch-orm/pouchdb-storage',
        'client-storage': 'couch-orm/angular-pouchdb-storage',
        'entity': 'couch-orm/entity',
        'user-storage': 'storages/user',
        'settingsService': 'app/settingsService',
        'loginController': 'app/loginController',
        'landingController': 'app/landingController',
        'profileController': 'app/profileController',
        'calendarController': 'app/calendarController',
        'profile': 'entities/profile',
        'serviceProviderInfo': 'entities/serviceProviderInfo',
        'calendarSettings': 'entities/calendarSettings',
        'meeting': 'entities/meeting'
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
        'angular-simple-logger': {
            deps: ['angular'],
            exports: 'angular'
        },
        'angular-google-maps': {
            deps: ['angular','lodash','angular-simple-logger'],
            exports: 'angular'
        }

    },
    deps: ['angular', 'angular.route']
});

require(['jquery', 'angular', 'lodash', 'cookies', 'client-storage','angular-google-maps'], function ($, angular, _, cookies, ClientStorage, angular_google_maps) {
    angular.module('fiveOClock', ['ngRoute', 'angularCouch','uiGmapgoogle-maps']);
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