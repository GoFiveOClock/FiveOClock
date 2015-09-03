define(['angular', 'jquery', 'cookies', 'profile'], function (angular, $, cookies, profile) {
    return angular.module('fiveOClock').controller('profileController',
        function ($scope, $q, $rootScope, $http, $cookies, Profile) {
            $scope.userName = $cookies.get('user');
            Profile.get('profile').then(function (profile) {
                if (!profile) {
                    return Profile.put({
                        _id: 'profile',
                        name: 'hui',
                        phone: 'pizda'
                    });
                }
                return profile;
            }).then(function(profile){
                console.log(profile)
            });
        });
});