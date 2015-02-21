requirejs.config({
    paths: {
        'angular': 'lib/angular',
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
        'bootstrap': {
            deps: ['jquery']
        }
    },
    deps: ['angular', 'angular.route', 'bootstrap', 'CouchEntity']
});

require(['jquery', 'angular.route'], function ($, angular) {
    angular.module('fiveOClock', ['angularCouch']);
    $(function () {
        require(['app/app'], function () {
            angular.bootstrap('body', ['fiveOClock']);
        });
    });
});