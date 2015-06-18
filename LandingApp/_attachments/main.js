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
		'confirmationService' : '../Common/app/confirmationService'
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
    deps: ['angular', 'angular.route', 'ui-bootstrap', 'bootstrap']
});

require(['jquery', 'angular'], function ($, angular) {


    var app = angular.module('fiveOClock', ['ngRoute']);
    app.config(function($httpProvider) {
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
    });

    //angular.module('fiveOClock', [ 'ngRoute']);
    $(function () {
        function startApplication() {
            //require(['app/app', 'indexController'], function () {
            require(['app/app'], function () {
                angular.bootstrap('body', ['fiveOClock']);
            });
        };
        startApplication();
    });
});