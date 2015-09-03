define(['angular', 'jquery', 'cookies'], function (angular, $, cookies) {
    return angular.module('fiveOClock').controller('profileController',
        function ($scope, $q, $rootScope, $http, $cookies) {
            $scope.userName = $cookies.get('user');
        });
});