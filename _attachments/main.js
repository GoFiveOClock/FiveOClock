requirejs.config({
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
        'clockpicker': 'lib/clockpicker'
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

require(['jquery', 'angular'], function ($, angular) {
    angular.module('fiveOClock', ['angularCouch', 'ngRoute', 'ui.bootstrap']);
    $(function () {
        require(['app/app'], function () {
            angular.bootstrap('body', ['fiveOClock']);
        });
    });
});