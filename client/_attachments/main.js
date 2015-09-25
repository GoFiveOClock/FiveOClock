require.config({
    waitSeconds: 120,
    paths: {
        'lodash': 'bower_components/lodash/lodash.min',
        'jquery': 'bower_components/jquery/dist/jquery.min',
        'angular': 'bower_components/angular/angular',
        'angular.route': 'bower_components/angular-route/angular-route',
        'angular-simple-logger' :'bower_components/angular-simple-logger/dist/index',
        'angular-google-maps' : 'bower_components/angular-google-maps/dist/angular-google-maps',
        'cookies': 'bower_components/js-cookie/src/js.cookie',
		'pouchdb': 'bower_components/pouchdb/dist/pouchdb.min',
		'bluebird': 'bower_components/bluebird/js/browser/bluebird.min',
        'moment': 'bower_components/moment/min/moment.min',
        'native-pouchdb-storage': 'couch-orm/pouchdb-storage',
        'client-storage': 'couch-orm/angular-pouchdb-storage',
        'entity': 'couch-orm/entity',
        'user-storage': 'storages/user',
        'common-storage': 'storages/common',
        'settingsService': 'app/settingsService',
        'loginController': 'app/loginController',
        'landingController': 'app/landingController',
        'profileController': 'app/profileController',
        'calendarController': 'app/calendarController',
        'profile': 'entities/profile',
        'serviceProviderInfo': 'entities/serviceProviderInfo',
        'serviceProviderInfoCommon': 'entities/serviceProviderInfoCommon',
        'calendarSettings': 'entities/calendarSettings',
        'meeting': 'entities/meeting',
        'angular-sanitize': 'bower_components/angular-sanitize/angular-sanitize',
        'select': 'bower_components/ui-select/dist/select'
    },
    shim: {
        'angular': {
            exports: 'angular',
            deps: ['jquery']
        },

        'bootstrap': {
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
        },
        'angular-sanitize': {
            deps: ['angular'],
            exports: 'angular'
        },
        'select': {
            deps: ['angular'],
            exports: 'angular'
        }


    },
    deps: ['angular', 'angular.route']
});

require(['jquery', 'angular', 'lodash', 'cookies', 'client-storage','angular-google-maps','angular-sanitize', 'select'], function ($, angular, _, cookies, ClientStorage, angular_google_maps, angular_sanitize, select) {
    angular.module('fiveOClock', ['ngRoute', 'angularCouch','uiGmapgoogle-maps','ngSanitize', 'ui.select']);
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