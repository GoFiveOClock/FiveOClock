requirejs.config({
    paths: {
        'angular': 'lib/angular',
        'angular.route': 'lib/angular-route',
        'jquery': 'lib/jquery-2.1.1',
        'bootstrap': 'lib/bootstrap/js/bootstrap',
        'angular-validation': 'lib/angular-validation',
        'angular-validation-rule': 'lib/angular-validation-rule',
        'cookies': 'lib/cookies.min',
		'text': 'lib/plugins/text',
		'json': 'lib/plugins/json'
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
        }
    },
    deps: ['angular', 'angular.route','angular-validation','angular-validation-rule', 'bootstrap']
});

require(['jquery', 'angular', 'cookies'], function ($, angular, cookies,placeholder) {
    angular.module('fiveOClock', ['ngRoute','validation','validation.rule']);
    $(function () {
        require(['app/app'], function () {
            angular.bootstrap('body', ['fiveOClock']);
        });
    });
});