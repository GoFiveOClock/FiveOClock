require.config({
    waitSeconds: 120,
    paths: {
        'lodash': 'bower_components/lodash/lodash.min',
        'jquery': 'bower_components/jquery/dist/jquery.min',
        'angular': 'bower_components/angular/angular',
        'ui-bootstrap': 'bower_components/angular-bootstrap/ui-bootstrap',
        'ui-bootstrap-tpls': 'bower_components/angular-bootstrap/ui-bootstrap-tpls',
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
        'confirmationService': 'app/confirmationService',
        'loginController': 'app/loginController',
        'landingController': 'app/landingController',
        'profileController': 'app/profileController',
        'calendarController': 'app/calendarController',
        'meetingCreate': 'app/meetingCreate',
        'meetingRedact': 'app/meetingRedact',
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



        'ui-bootstrap-tpls': {
            deps: ['jquery','angular'],
            exports: 'angular'
        },

        'ui-bootstrap': {
            deps: ['jquery','angular','ui-bootstrap-tpls'],
            exports: 'angular'
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

require(['jquery', 'angular', 'ui-bootstrap', 'lodash', 'cookies', 'client-storage','angular-google-maps','angular-sanitize', 'select'], function ($, angular, uiBootstrap, _, cookies, ClientStorage, angularGoogleMaps, angularSanitize, select) {
    angular.module('fiveOClock', ['ngRoute', 'angularCouch','uiGmapgoogle-maps','ngSanitize', 'ui.select', 'ui.bootstrap', 'ui.bootstrap.tpls']);
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