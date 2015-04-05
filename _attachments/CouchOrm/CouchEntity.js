define(['angular', 'CouchEntityFactory', 'underscore', 'pouchDb'], function (angular, CouchEntityFactory, _, pouchDb) {
    'use strict';

    var angularCouch = angular.module('angularCouch', []);
    angularCouch.factory('CouchEntity', CouchEntity);

    function CouchEntity($timeout, $rootScope) {
        var db = {
            get: get,
            put: put,
            post: post,
            'delete': remove,
            viewPrefix: 'FiveOClock'
        }

        var clientDb = new pouchDb('fiveOClock');
        return CouchEntityFactory({ db: db });

        function get(url, params) {
            return clientDb.query(url, params).then(applyResult);
        }

        function put(url, id, rev, data) {
            return clientDb.put(data, id, rev).then(applyResult);
        }

        function post(url, data) {
            return clientDb.post(data).then(applyResult);
        }

        function remove(url, id, rev) {
            return clientDb.remove(id, rev).then(applyResult);
        }
        function applyResult(result) {
            $timeout(function () {
                $rootScope.$apply();
            });
            return result;
        }
    }
})