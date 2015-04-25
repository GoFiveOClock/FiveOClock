define(['angular', 'CouchEntityFactory', 'underscore'], function (angular, CouchEntityFactory, _) {
    'use strict';

    var angularCouch = angular.module('angularCouch', []);
    angularCouch.factory('CouchEntity', CouchEntity);

    CouchEntity.$inject = ['$http'];

    function CouchEntity($http) {
        var angularAjax = {
            get: get,
            put: put,
            post: post,
            'delete': remove,
            viewPrefix: '_view'
        }

        return CouchEntityFactory({ db: angularAjax });

        function get(url, params) {
            return $http.get(url + formatParams(params), { cache: false }).then(getResponseData);
        }

        function put(url, id, rev, data) {
            var url = urlFormat('{0}/{1}?rev={2}', url, id, rev);
            return $http.put(url, data).then(getResponseData);
        }

        function post(url, data) {
            return $http.post(url, data).then(getResponseData);
        }

        function remove(url, id, rev) {
            var url = urlFormat('{0}/{1}?rev={2}', url, id, rev);
            return $http.delete(url).then(getResponseData);
        }

        function getResponseData(response) {
            return response.data;
        }

        function urlFormat(input) {
            var args = Array.prototype.slice.call(arguments, 1);
            var output = input.replace(/{(\d+)}/g, function (match, number) {
                return typeof args[number] != 'undefined'
                    ? args[number]
                    : match;
            });
            return encodeURI(output);
        }

        function formatParams(params) {
            var str = '?';
            var params = _.map(params, function (value, key) {
                if (_.isString(value)) {
                    return key + '=' + JSON.stringify(encodeURIComponent(value));
                } else {
                    return key + '=' + encodeURIComponent(value);
                }
            }).join('&');
            return str + params;
        }
    }
})