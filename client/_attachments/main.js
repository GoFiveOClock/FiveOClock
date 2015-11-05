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
        'ng-infinite-scroll': 'bower_components/ngInfiniteScroll/build/ng-infinite-scroll',
        'cookies': 'bower_components/js-cookie/src/js.cookie',
		'pouchdb': 'bower_components/pouchdb/dist/pouchdb.min',
		'bluebird': 'bower_components/bluebird/js/browser/bluebird.min',
        'moment': 'bower_components/moment/min/moment.min',
        'native-pouchdb-storage': 'couch-orm/pouchdb-storage',
        'client-storage': 'couch-orm/angular-pouchdb-storage',
		'server-storage': 'couch-orm/angular-http-storage',
        'entity': 'couch-orm/entity',
        'user-storage': 'storages/user',
        'common-storage': 'storages/common',
        'settingsService': 'app/settingsService',
        'confirmationService': 'app/confirmationService',
        'loginController': 'app/loginController',
        'landingController': 'app/landingController',
        'profileController': 'app/profileController',
        'calendarController': 'app/calendarController',
        'searchController': 'app/searchController',
        'meetingCreate': 'app/meetingCreate',
        'meetingEdit': 'app/meetingEdit',
        'selectDirective': 'app/selectDirective',
        'consumerInfo': 'entities/consumerInfo',
        'serviceProviderInfo': 'entities/serviceProviderInfo',
        'serviceProviderInfoCommon': 'entities/serviceProviderInfoCommon',
        'calendarSettings': 'entities/calendarSettings',
        'meeting': 'entities/meeting',
		'visitor': 'entities/visitor',
		'json': 'plugins/json',
		'text': 'plugins/text'
    },
    shim: {
        'angular': {
            exports: 'angular',
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
        'ng-infinite-scroll':{
            deps: ['jquery','angular'],
            exports: 'angular'
        }
    },
    deps: ['angular', 'angular.route']
});

require(['jquery', 'angular', 'ui-bootstrap', 'lodash', 'cookies', 'server-storage', 'client-storage', 'angular-google-maps', 'ng-infinite-scroll'], 
function ($, angular, uiBootstrap, _, cookies, ServerStorage, ClientStorage, angularGoogleMaps, infiniteScroll) {
    angular.module('fiveOClock', ['ngRoute', 'angularCouch','uiGmapgoogle-maps', 'ui.bootstrap', 'ui.bootstrap.tpls', 'infinite-scroll']);
    $(function () {
        require(['app/app'], function () {
            angular.bootstrap('body', ['fiveOClock']);
        });
    });
});