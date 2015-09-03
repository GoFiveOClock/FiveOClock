require.config({
    waitSeconds: 120,
    paths: {
        'lodash': 'bower_components/lodash/lodash.min',
        'jquery': 'bower_components/jquery/dist/jquery.min',
        'angular': 'bower_components/angular/angular',
        'angular.route': 'bower_components/angular-route/angular-route'
		pouchdb: 'bower_components/pouchdb/dist/pouchdb.min',
		bluebird: 'bower_components/bluebird/js/browser/bluebird.min',
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
})

require(['jquery', 'angular', 'lodash', 'couch-orm/entity', 'couch-orm/jquery-http-storage.js'], function ($, angular, _, Entity, Storage) {
    angular.module('fiveOClock', ['ngRoute']);
    $(function () {
        require(['app/app'], function () {
            angular.bootstrap('body', ['fiveOClock']);
	
});
});