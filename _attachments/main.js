requirejs.config({
    paths: {
        'angular': 'lib/angular',
        'angular.route': 'lib/angular-route',
        'underscore': 'lib/underscore',
        'jquery': 'lib/jquery-2.1.1',
        'bootstrap': 'lib/bootstrap/js/bootstrap',
        'CouchEntity': 'CouchOrm/CouchEntity',
        'CouchEntityFactory': 'CouchOrm/CouchEntityFactory'        
    },
    shim: {
        'angular': {
            exports: 'angular'
        },
        'angular.route': {
            deps: ['angular'],
            exports: 'angular'
        },       
        'bootstrap': {
            deps: ['jquery']
        },
       

    }
});

require(['jquery', 'bootstrap', 'angular.route', 'CouchEntity'], function ($, bootstrap, angular) {
    angular.module('fiveOClock', ['angularCouch', 'ngRoute']);
    $(function () {
        require(['app/app'], function () {
            angular.bootstrap('body', ['fiveOClock']);
        });
    });
});