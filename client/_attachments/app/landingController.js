define(['angular', 'jquery', 'cookies'], function (angular, $, cookies) {
    return angular.module('fiveOClock').controller('landingController',
        function ($scope, $q, $rootScope, $http) {
            $scope.userName = cookies.get('user');
        });
});