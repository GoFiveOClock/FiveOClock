define(['angular', 'CouchEntityFactory', 'underscore', 'pouchDb', 'cookies'], function (angular, CouchEntityFactory, _, pouchDb, cookies) {
    'use strict';

    var angularCouch = angular.module('angularCouch', []);
    angularCouch.factory('CouchEntity', CouchEntity);

    function CouchEntity($timeout, $rootScope, $q) {
        var db = {
            get: get,
            put: put,
            post: post,
            'delete': remove,
            viewPrefix: 'Views'
        }

        var clientDb = new pouchDb(window.location.pathname.split('/')[1]);

        return CouchEntityFactory({ db: db, $q: $q });

        function get(url, params) {
            if(url == "Views/message"){
                var pouchDbVisitor = cookies.get('pouchDbVisitor');
                if(pouchDbVisitor){
                    var otherClientDb = new pouchDb(pouchDbVisitor);
                    return otherClientDb.query(url, params).then(applyResult, function(err){
                        console.log(err);
                    });
                }
                else{
                    return clientDb.query(url, params).then(applyResult);
                }
            }
            else{
                return clientDb.query(url, params).then(applyResult);
            }
        }

        function put(url, id, rev, data) {
            return clientDb.put(data, id, rev).then(applyResult);
        }

        function post(url, data) {
            if(url.dbUrl){
                var pouchDbVisitor = cookies.get('pouchDbVisitor');
                if(pouchDbVisitor) {
                    var otherClientDb = new pouchDb(pouchDbVisitor);
                    return otherClientDb.post(data).then(applyResult);
                }
                else{
                    return clientDb.post(data).then(applyResult);
                }
            }
            else{
                return clientDb.post(data).then(applyResult);
            }
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